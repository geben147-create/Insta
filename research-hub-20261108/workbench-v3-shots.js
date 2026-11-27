/* Task 5: offline, local, in-memory shot evidence. Classic browser script.
 * analyze(File, cueArray | {cues}, options) -> Promise<AnalysisResult>.
 * options: videoId, allowed (false blocks), signal, onProgress({phase,progress,...}),
 * maxDurationMs (default 30000, max 120000), maxSamples (default 320, max 480),
 * sampleStepMs (default 110), minShotMs (default 350), playbackRate (default 2).
 * edit(shots, {type:'split',shotId,atMs}|{type:'merge',shotIds:[left,right]}) -> new array.
 * Times are milliseconds except mediaTime, the unrounded rVFC timestamp in seconds.
 * Frames carry in-memory JPEG blobs; the caller owns any preview URLs and must not persist
 * the raw result. No caption text, source filename, original URL, or video bytes are returned.
 */
(function (root) {
  'use strict';
  const BASIS = 'requestVideoFrameCallback.mediaTime';
  const VERSION = 'content-workbench.shot-analysis.v1';
  const VALID_FILE_EXT = /\.(mp4|m4v|mov|webm|ogv|ogg|mkv|avi|mpeg|mpg|3gp|ts)$/i;
  const VALID_FILE_TYPE = /^(video\/(mp4|x-m4v|quicktime|webm|ogg|x-matroska|x-msvideo|mpeg|3gpp|mp2t)|application\/ogg)$/i;
  const rounded = (n, places = 3) => Number(n.toFixed(places));
  const ms = (sec) => Math.floor(sec * 1000 + 1e-7);
  const clampOpt = (value, fallback, low, high) => Number.isFinite(value) ? Math.max(low, Math.min(high, value)) : fallback;
  const cmp = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  let localId = 0;
  const failure = (code) => Object.assign(new Error(code), {shotCode: code});
  const checkAbort = (signal) => { if (signal?.aborted) throw failure('cancelled'); };

  function notify(options, phase, progress, extra = {}) {
    if (typeof options.onProgress !== 'function') return;
    try { options.onProgress({phase, progress, ...extra}); } catch (_) { /* UI callbacks do not own decode. */ }
  }
  function key(value) { return typeof value === 'number' && Number.isFinite(value) ? String(value) : typeof value === 'string' ? value.trim() : ''; }
  function hash(s) {
    let result = 2166136261;
    for (let i = 0; i < s.length; i += 1) result = Math.imul(result ^ s.charCodeAt(i), 16777619);
    return (result >>> 0).toString(36);
  }
  function cueWindows(input) {
    const list = Array.isArray(input) ? input : Array.isArray(input?.cues) ? input.cues : [];
    const unique = new Map();
    let ignored = 0;
    for (const item of list) {
      const cueId = key(item?.cueId) || key(item?.id) || key(item?.cue_id);
      const startMs = item?.startMs ?? item?.start_ms;
      const endMs = item?.endMs ?? item?.end_ms;
      if (!cueId || !Number.isSafeInteger(startMs) || !Number.isSafeInteger(endMs) || startMs < 0 || startMs >= endMs) {
        ignored += 1;
        continue;
      }
      const signature = JSON.stringify([cueId, startMs, endMs]);
      unique.set(signature, {cueId, startMs, endMs});
    }
    return {cues: [...unique.values()].sort((a, b) => a.startMs - b.startMs || a.endMs - b.endMs || cmp(a.cueId, b.cueId)), ignored};
  }
  function overlaps(cues, startMs, endMs) {
    const links = [];
    for (const cue of cues) {
      if (cue.startMs >= endMs) break;
      if (cue.endMs <= startMs) continue;
      const overlapStartMs = Math.max(startMs, cue.startMs);
      const overlapEndMs = Math.min(endMs, cue.endMs);
      links.push({...cue, overlapStartMs, overlapEndMs, overlapMs: overlapEndMs - overlapStartMs});
    }
    return {cueOverlaps: links, cueIds: [...new Set(links.map((x) => x.cueId))]};
  }

  async function finiteContainer(file) {
    // Prior to invoking a media player, reject playlists/manifests and HTML even
    // when given a video extension/MIME. Only read enough to identify a container.
    const head = new Uint8Array(await file.slice(0, 377).arrayBuffer());
    const four = (from) => String.fromCharCode(...head.subarray(from, from + 4));
    return head.length >= 12 && (
      (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) ||
      /^(ftyp|moov|mdat|wide|free)$/.test(four(4)) || four(0) === 'OggS' ||
      (four(0) === 'RIFF' && four(8) === 'AVI ') ||
      (head[0] === 0 && head[1] === 0 && head[2] === 1 && (head[3] === 0xba || head[3] === 0xb3)) ||
      (head[0] === 0x47 && head[188] === 0x47 && head[376] === 0x47));
  }

  function waitMetadata(video, url, signal) {
    return new Promise((resolve, reject) => {
      let timer;
      const end = (error) => {
        clearTimeout(timer);
        video.removeEventListener('loadedmetadata', ready);
        video.removeEventListener('error', bad);
        signal?.removeEventListener('abort', stop);
        if (error) reject(error); else resolve();
      };
      const ready = () => end();
      const bad = () => end(failure('media_decode_failed'));
      const stop = () => end(failure('cancelled'));
      if (signal?.aborted) return stop();
      video.addEventListener('loadedmetadata', ready);
      video.addEventListener('error', bad);
      signal?.addEventListener('abort', stop, {once: true});
      timer = setTimeout(() => end(failure('metadata_timeout')), 12000);
      try { video.src = url; } catch (_) { bad(); }
    });
  }

  function distribution(pixels, width, height) {
    // Low resolution luma/chroma grid for differences and translational matching.
    const w = Math.max(1, Math.round(width * 36 / Math.max(width, height)));
    const h = Math.max(1, Math.round(height * 36 / Math.max(width, height)));
    const y = new Float32Array(w * h);
    const u = new Float32Array(y.length);
    const v = new Float32Array(y.length);
    let mean = 0, square = 0;
    for (let row = 0, p = 0; row < h; row += 1) {
      const pxY = Math.min(height - 1, Math.floor((row + 0.5) * height / h));
      for (let col = 0; col < w; col += 1, p += 1) {
        const pxX = Math.min(width - 1, Math.floor((col + 0.5) * width / w));
        const i = 4 * (pxY * width + pxX);
        const r = pixels[i] / 255, g = pixels[i + 1] / 255, b = pixels[i + 2] / 255;
        const yy = 0.299 * r + 0.587 * g + 0.114 * b;
        y[p] = yy; u[p] = b - yy; v[p] = r - yy;
        mean += yy; square += yy * yy;
      }
    }
    mean /= y.length;
    return {w, h, y, u, v, mean, stdev: Math.sqrt(Math.max(0, square / y.length - mean * mean))};
  }

  function capture(video, ctx, width, height, endMs, options, stepMs, maxSamples, rate) {
    const signal = options.signal;
    const samples = [];
    let lastSeen = -1, lastPresented = null, gaps = 0, validFrames = 0, nextMs = 0;
    return new Promise((resolve, reject) => {
      let timer, callbackId = null, done = false;
      const finish = (error, endedNaturally = false) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (callbackId !== null) video.cancelVideoFrameCallback(callbackId);
        video.removeEventListener('ended', ended);
        video.removeEventListener('error', bad);
        signal?.removeEventListener('abort', stop);
        video.pause();
        if (error) reject(error);
        else resolve({samples, lastPresentedMs: Math.max(0, lastSeen), observedFrameCount: validFrames, unobservedPresentedFrames: gaps, endedNaturally});
      };
      const ended = () => finish(null, true);
      const bad = () => finish(failure('media_decode_failed'));
      const stop = () => finish(failure('cancelled'));
      const frame = (_, metadata) => {
        callbackId = null;
        if (done) return;
        try {
          const t = metadata.mediaTime;
          if (Number.isFinite(t) && t >= 0) {
            const actualMs = ms(t);
            if (actualMs >= endMs) { finish(); return; }
            if (actualMs > lastSeen) {
              const presented = metadata.presentedFrames;
              if (Number.isSafeInteger(presented)) {
                if (lastPresented !== null && presented > lastPresented + 1) gaps += presented - lastPresented - 1;
                lastPresented = presented;
              }
              lastSeen = actualMs;
              validFrames += 1;
              if (actualMs >= nextMs && samples.length < maxSamples) {
                ctx.drawImage(video, 0, 0, width, height);
                const image = ctx.getImageData(0, 0, width, height);
                samples.push({actualMs, mediaTime: t, image, feature: distribution(image.data, width, height)});
                nextMs = Math.max(nextMs + stepMs, (Math.floor(actualMs / stepMs) + 1) * stepMs);
                if (samples.length === 1 || samples.length % 8 === 0) {
                  notify(options, 'sampling', Math.min(0.89, 0.89 * actualMs / endMs), {sampledFrames: samples.length, actualMs});
                }
              }
            }
          }
          if (!done) callbackId = video.requestVideoFrameCallback(frame);
        } catch (_) { finish(failure('frame_capture_failed')); }
      };
      if (signal?.aborted) return stop();
      video.addEventListener('ended', ended);
      video.addEventListener('error', bad);
      signal?.addEventListener('abort', stop, {once: true});
      timer = setTimeout(() => finish(failure('presentation_timeout')), Math.ceil(endMs / rate * 2 + 10000));
      try {
        callbackId = video.requestVideoFrameCallback(frame);
        video.playbackRate = rate;
        Promise.resolve(video.play()).catch(() => finish(failure('playback_unavailable')));
      } catch (_) { finish(failure('playback_unavailable')); }
    });
  }

  function pair(a, b) {
    const count = a.y.length;
    let delta = 0, chroma = 0;
    for (let i = 0; i < count; i += 1) {
      delta += Math.abs(a.y[i] - b.y[i]);
      chroma += Math.abs(a.u[i] - b.u[i]) + Math.abs(a.v[i] - b.v[i]);
    }
    const luma = delta / count;
    const color = chroma / (2 * count);
    const change = 0.64 * luma + 0.36 * color;
    let pan = null;
    if (luma >= 0.085 && Math.min(a.stdev, b.stdev) >= 0.06 && Math.min(a.w, a.h) >= 12) {
      const limit = Math.min(6, Math.floor(Math.min(a.w, a.h) / 5));
      // Score all shifts against the same central region, avoiding a border-size bias.
      const diff = (dx, dy) => {
        let score = 0, n = 0;
        for (let y = limit; y < a.h - limit; y += 2) {
          for (let x = limit; x < a.w - limit; x += 2) {
            score += Math.abs(a.y[y * a.w + x] - b.y[(y + dy) * a.w + x + dx]); n += 1;
          }
        }
        return score / n;
      };
      const baseline = diff(0, 0);
      let best = baseline, shiftX = 0, shiftY = 0;
      for (let dy = -limit; dy <= limit; dy += 1) {
        for (let dx = -limit; dx <= limit; dx += 1) {
          if (Math.abs(dx) + Math.abs(dy) < 2) continue;
          const mean = diff(dx, dy);
          if (mean < best) { best = mean; shiftX = dx; shiftY = dy; }
        }
      }
      const improvement = baseline > 0 ? 1 - best / baseline : 0;
      if (improvement >= 0.51 && best <= 0.135) pan = {dx: shiftX, dy: shiftY, improvement: rounded(improvement)};
    }
    return {change, luma, color, deltaMean: b.mean - a.mean, pan};
  }

  function detect(samples, endMs, minShotMs) {
    const edges = [];
    for (let i = 1; i < samples.length; i += 1) edges.push(pair(samples[i - 1].feature, samples[i].feature));
    const found = [], used = new Set();
    const add = (kind, from, to, at, score, details = {}) => {
      const atMs = samples[at].actualMs;
      found.push({id: `${kind}:${atMs}`, kind, atMs, fromMs: samples[from].actualMs, toMs: samples[to].actualMs,
        score: rounded(score), heuristic: true, isBoundary: false, ...details});
    };
    // A low-res shift is motion evidence, not a shot boundary. Require consecutive agreeing directions.
    for (let i = 0; i < edges.length; i += 1) {
      const motion = edges[i].pan;
      if (!motion) continue;
      let j = i;
      while (j + 1 < edges.length && edges[j + 1].pan &&
             motion.dx * edges[j + 1].pan.dx + motion.dy * edges[j + 1].pan.dy > 0) j += 1;
      if (j === i) continue;
      for (let k = i; k <= j; k += 1) used.add(k);
      add('rapid_pan', i, j + 1, Math.floor((i + j + 1) / 2), motion.improvement,
        {gridShiftX: motion.dx, gridShiftY: motion.dy, note: 'translation_like_motion_not_a_boundary'});
      i = j;
    }
    // Gradual, monotonic luminance change near a dark or bright endpoint: fade candidate only.
    for (let i = 0; i < edges.length; i += 1) {
      const slope = Math.sign(edges[i].deltaMean);
      const gradual = (k) => !used.has(k) && Math.sign(edges[k].deltaMean) === slope &&
        Math.abs(edges[k].deltaMean) >= 0.013 && edges[k].change < 0.22;
      if (!gradual(i)) continue;
      let j = i;
      while (j + 1 < edges.length && gradual(j + 1)) j += 1;
      const a = samples[i], b = samples[j + 1];
      const light = Math.abs(b.feature.mean - a.feature.mean);
      const dark = Math.min(a.feature.mean, b.feature.mean) <= 0.16;
      const bright = Math.max(a.feature.mean, b.feature.mean) >= 0.86;
      if (j - i >= 2 && b.actualMs - a.actualMs >= 200 && light >= 0.16 && (dark || bright)) {
        for (let k = i; k <= j; k += 1) used.add(k);
        add('fade', i, j + 1, Math.round((i + j + 1) / 2), light, {direction: slope > 0 ? 'brightening' : 'darkening'});
      }
      i = j;
    }
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (used.has(i) || edge.pan) continue;
      const prev = edges[i - 1]?.change || 0;
      const next = edges[i + 1]?.change || 0;
      const isolated = edge.change >= 0.15 && Math.max(prev, next) <= 0.06;
      if (!isolated && edge.change < 0.22 && !(edge.color >= 0.34 && edge.change >= 0.15)) continue;
      if (next >= 0.22 && i + 2 < samples.length && pair(samples[i].feature, samples[i + 2].feature).change <= 0.075) {
        add('flash_or_short_insert', i, i + 2, i + 1, edge.change, {note: 'transient_change_review'});
        i += 1;
        continue;
      }
      if (isolated || edge.change >= 0.31 || edge.color >= 0.34 || edge.change > 1.45 * Math.min(prev, next)) {
        add('hard_cut', i, i + 1, i + 1, edge.change);
      }
    }
    const selected = [];
    for (const candidate of [...found].sort((a, b) => Number(b.kind === 'hard_cut') - Number(a.kind === 'hard_cut') || b.score - a.score || a.atMs - b.atMs)) {
      if (candidate.kind !== 'hard_cut' && candidate.kind !== 'fade') continue;
      if (candidate.atMs < minShotMs || endMs - candidate.atMs < minShotMs || selected.some((other) => Math.abs(candidate.atMs - other.atMs) < minShotMs)) {
        candidate.note = 'near_edge_or_other_candidate_review';
      } else { candidate.isBoundary = true; selected.push(candidate); }
    }
    return found.sort((a, b) => a.atMs - b.atMs || cmp(a.kind, b.kind));
  }

  function encode(canvas, ctx, image, signal) {
    return new Promise((resolve, reject) => {
      let timer;
      const end = (blob, error) => {
        clearTimeout(timer);
        signal?.removeEventListener('abort', stop);
        if (error) reject(error); else resolve(blob);
      };
      const stop = () => end(null, failure('cancelled'));
      if (signal?.aborted) return stop();
      signal?.addEventListener('abort', stop, {once: true});
      timer = setTimeout(() => end(null), 3000);
      try { ctx.putImageData(image, 0, 0); canvas.toBlob((blob) => end(blob), 'image/jpeg', 0.78); }
      catch (_) { end(null); }
    });
  }
  function targets(startMs, endMs) {
    return [['start', startMs], ['middle', Math.floor((startMs + endMs - 1) / 2)], ['end', endMs - 1]];
  }
  function nearest(entries, requestedMs) {
    return entries.reduce((best, row) => !best || Math.abs(row.actualMs - requestedMs) < Math.abs(best.actualMs - requestedMs) ? row : best, null);
  }
  async function records(samples, candidates, cues, endMs, videoId, canvas, ctx, options) {
    const ends = [0, ...candidates.filter((c) => c.isBoundary).map((c) => c.atMs), endMs];
    const shots = [];
    for (let i = 1, cursor = 0, count = 0; i < ends.length; i += 1) {
      checkAbort(options.signal);
      const startMs = ends[i - 1], stopMs = ends[i];
      const id = `shot:${hash(videoId)}:${startMs}-${stopMs}`;
      const inside = [];
      while (cursor < samples.length && samples[cursor].actualMs < stopMs) inside.push(samples[cursor++]);
      const frames = [], outcomes = new Map();
      for (const [role, requestedMs] of targets(startMs, stopMs)) {
        const sample = nearest(inside, requestedMs);
        if (!sample) continue;
        if (!outcomes.has(sample.actualMs)) {
          const blob = await encode(canvas, ctx, sample.image, options.signal);
          outcomes.set(sample.actualMs, blob);
          if (blob) count += 1;
        }
        const blob = outcomes.get(sample.actualMs);
        if (blob) frames.push({role, requestedMs, actualMs: sample.actualMs, mediaTime: sample.mediaTime, timestampBasis: BASIS, blob});
      }
      const boundary = candidates.find((c) => c.isBoundary && c.atMs === startMs);
      const sourceSpans = [{sourceShotId: id, startMs, endMs: stopMs}];
      shots.push({id, sourceShotId: id, sourceShotIds: [id], sourceSpans, videoId, startMs, endMs: stopMs, frames,
        ...overlaps(cues, startMs, stopMs),
        observed: {sampleCount: inside.length, firstPresentedMs: inside[0]?.actualMs ?? null,
          lastPresentedMs: inside[inside.length - 1]?.actualMs ?? null, timestampBasis: BASIS},
        inferred: {boundary: boundary ? {...boundary} : null, isHeuristic: true}, review: 'needs_review'});
      notify(options, 'representatives', 0.9 + 0.09 * i / (ends.length - 1), {shotCount: shots.length, representativeCount: count});
    }
    return shots;
  }

  async function analyze(videoFile, cues, options = {}) {
    options ||= {};
    const warnings = [];
    const base = {schema: VERSION, durationMs: null, analyzedEndMs: null, shots: [], candidates: [], warnings};
    const blocked = (reason) => ({...base, status: 'blocked', reason});
    if (options.allowed === false) return blocked('local_file_not_authorized');
    if (options.signal?.aborted) return blocked('cancelled');
    if (typeof root.File !== 'function' || !(videoFile instanceof root.File)) return blocked('local_video_required');
    if (!videoFile.size) return blocked('empty_local_file');
    if (!VALID_FILE_TYPE.test(videoFile.type) && !VALID_FILE_EXT.test(videoFile.name)) return blocked('not_a_video_file');
    if (!root.document?.createElement || typeof root.URL?.createObjectURL !== 'function') return blocked('browser_media_unavailable');
    const video = root.document.createElement('video');
    if (typeof video.requestVideoFrameCallback !== 'function' || typeof video.cancelVideoFrameCallback !== 'function') {
      return blocked('actual_presented_timestamps_unavailable');
    }
    const videoId = key(options.videoId).slice(0, 100) || `local-${root.crypto?.randomUUID?.() || ++localId}`;
    const normalized = cueWindows(cues);
    if (normalized.ignored) warnings.push(`invalid_or_idless_cues:${normalized.ignored}`);
    let objectUrl;
    try {
      notify(options, 'metadata', 0);
      checkAbort(options.signal);
      if (!await finiteContainer(videoFile)) throw failure('unrecognized_local_container');
      checkAbort(options.signal);
      video.preload = 'auto'; video.muted = true; video.defaultMuted = true; video.playsInline = true;
      objectUrl = root.URL.createObjectURL(videoFile);
      await waitMetadata(video, objectUrl, options.signal);
      checkAbort(options.signal);
      if (!Number.isFinite(video.duration) || ms(video.duration) <= 0 || !video.videoWidth || !video.videoHeight) {
        throw failure('unsupported_or_unbounded_video');
      }
      base.durationMs = ms(video.duration);
      const requestedEndMs = Math.min(base.durationMs, Math.floor(clampOpt(options.maxDurationMs, 30000, 1, 120000)));
      if (requestedEndMs < base.durationMs) warnings.push('analysis_window_limited');
      const maxSamples = Math.floor(clampOpt(options.maxSamples, 320, 4, 480));
      const stepMs = Math.max(clampOpt(options.sampleStepMs, 110, 45, 1000), Math.ceil(requestedEndMs / maxSamples));
      const minShotMs = clampOpt(options.minShotMs, 350, 100, 3000);
      const rate = clampOpt(options.playbackRate, 2, 0.5, 4);
      const side = 160, scale = Math.min(1, side / Math.max(video.videoWidth, video.videoHeight));
      const width = Math.max(1, Math.round(video.videoWidth * scale)), height = Math.max(1, Math.round(video.videoHeight * scale));
      const canvas = root.document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d', {alpha: false, willReadFrequently: true});
      if (!ctx || typeof canvas.toBlob !== 'function') throw failure('frame_capture_unavailable');
      const sampled = await capture(video, ctx, width, height, requestedEndMs, options, stepMs, maxSamples, rate);
      checkAbort(options.signal);
      if (!sampled.samples.length) throw failure('no_presented_video_frames');
      // A natural end can hold a single frame for a long VFR interval. Retain the full
      // bounded playback range; do not fabricate that interval's frame timestamp.
      base.analyzedEndMs = requestedEndMs;
      base.timestampBasis = BASIS;
      base.sampledFrames = sampled.samples.length;
      base.observedFrameCount = sampled.observedFrameCount;
      base.lastPresentedMs = sampled.lastPresentedMs;
      base.unobservedPresentedFrames = sampled.unobservedPresentedFrames;
      base.config = {sampleStepMs: stepMs, minShotMs, maxSamples, playbackRate: rate};
      if (sampled.unobservedPresentedFrames) warnings.push('presentation_callback_gaps');
      if (sampled.samples[0].actualMs > 0) warnings.push('clip_start_not_observed_at_zero');
      if (sampled.samples.length < 3) warnings.push('few_presented_samples');
      const candidates = detect(sampled.samples, base.analyzedEndMs, minShotMs);
      const shots = await records(sampled.samples, candidates, normalized.cues, base.analyzedEndMs, videoId, canvas, ctx, options);
      checkAbort(options.signal);
      if (!shots.some((shot) => shot.frames.length)) throw failure('representative_encoding_failed');
      if (shots.some((shot) => shot.frames.length < 3)) warnings.push('representative_frames_missing');
      notify(options, 'review', 1, {shotCount: shots.length});
      checkAbort(options.signal);
      return {...base, status: 'needs_review', reason: 'heuristic_candidates_require_review', shots, candidates};
    } catch (error) {
      const reason = error?.shotCode || 'local_analysis_failed';
      return {...base, status: reason === 'cancelled' ? 'blocked' : 'failed', reason};
    } finally {
      video.pause();
      video.removeAttribute('src');
      if (objectUrl) { video.load(); root.URL.revokeObjectURL(objectUrl); }
    }
  }

  function rebuild(parts, startMs, endMs, type) {
    const id = `shot-edit:${hash(parts.map((p) => p.id).join('|'))}:${startMs}-${endMs}`;
    const sourceSpans = [...new Map(parts.flatMap((p) => p.sourceSpans)
      .filter((p) => p.endMs > startMs && p.startMs < endMs)
      .map((p) => [JSON.stringify([p.sourceShotId, p.startMs, p.endMs]), {...p}])).values()];
    const frames = parts.flatMap((p) => p.frames).filter((f) => f.actualMs >= startMs && f.actualMs < endMs).map((f) => ({...f}));
    const observed = [...new Set(frames.map((f) => f.actualMs))].sort((a, b) => a - b);
    const representativeFrames = targets(startMs, endMs).flatMap(([role, requestedMs]) => {
      const frame = nearest(frames, requestedMs);
      return frame ? [{...frame, role, requestedMs}] : [];
    });
    const cues = cueWindows(parts.flatMap((p) => p.cueOverlaps)).cues;
    const adjacent = parts[0].startMs === startMs ? parts[0].inferred?.boundary ?? null : null;
    return {id, sourceShotId: id, sourceShotIds: [...new Set(sourceSpans.map((x) => x.sourceShotId))], sourceSpans,
      videoId: parts[0].videoId, startMs, endMs, frames, representativeFrames, ...overlaps(cues, startMs, endMs),
      observed: {sampleCount: null, retainedFrameCount: observed.length, firstPresentedMs: observed[0] ?? null,
        lastPresentedMs: observed[observed.length - 1] ?? null, timestampBasis: BASIS},
      inferred: {boundary: adjacent ? {...adjacent} : null, isHeuristic: Boolean(adjacent)},
      edit: {type, parentShotIds: parts.map((part) => part.id)}, review: 'needs_review'};
  }

  function edit(shots, action) {
    if (!Array.isArray(shots) || !action) throw new TypeError('shots_and_action_required');
    if (action.type === 'split') {
      const i = shots.findIndex((s) => s.id === (action.shotId ?? action.sourceShotId));
      if (i < 0) throw new RangeError('shot_not_found');
      const shot = shots[i], atMs = action.atMs;
      if (!Number.isSafeInteger(atMs) || atMs <= shot.startMs || atMs >= shot.endMs) throw new RangeError('split_outside_shot');
      return [...shots.slice(0, i), rebuild([shot], shot.startMs, atMs, 'split'), rebuild([shot], atMs, shot.endMs, 'split'), ...shots.slice(i + 1)];
    }
    if (action.type === 'merge') {
      const ids = action.shotIds ?? [action.leftShotId, action.rightShotId];
      if (!Array.isArray(ids) || ids.length !== 2 || !ids[0] || !ids[1] || ids[0] === ids[1]) throw new RangeError('two_adjacent_shots_required');
      const indices = ids.map((id) => shots.findIndex((s) => s.id === id)).sort((a, b) => a - b);
      const [i, j] = indices;
      const left = shots[i], right = shots[j];
      if (i < 0 || j !== i + 1 || left.videoId !== right.videoId || left.endMs !== right.startMs) throw new RangeError('two_adjacent_shots_required');
      return [...shots.slice(0, i), rebuild([left, right], left.startMs, right.endMs, 'merge'), ...shots.slice(j + 1)];
    }
    throw new TypeError('unsupported_shot_edit');
  }

  root.HubV3Shots = Object.freeze({analyze, edit});
})(globalThis);
