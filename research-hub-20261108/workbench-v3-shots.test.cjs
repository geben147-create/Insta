'use strict';
// Run with node --test tests/workbench-v3-shots.test.cjs, or concatenate this
// after ./workbench-v3-shots.js via stdin where entrypoint realpath is guarded.
const {test} = require('node:test');
const assert = require('node:assert/strict');
if (!globalThis.HubV3Shots) require('../workbench-v3-shots.js');
const T = [0, 106, 243, 374, 522, 646, 774, 895, 1009, 1147, 1261, 1387, 1514, 1638, 1788, 1919, 2061, 2190, 2329, 2480, 2600, 2752, 2875, 3014, 3160, 3292, 3450, 3572, 3706];
const W = 96, H = 64;
const LOCAL = new File([new Uint8Array([0x1a,0x45,0xdf,0xa3,...new Array(20).fill(0)])], 'mock.webm', {type:'video/webm'});
const CAPTIONS = [{cueId:'cross',startMs:700,endMs:860,text:'PRIVATE-SENTINEL'}, {id:'edge',startMs:774,endMs:920}];
const OPTIONS = {videoId:'fixture',sampleStepMs:50,playbackRate:1};
function render(i) {
  const pixels = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = 4 * (y * W + x);
    if (i < 6) { pixels[p] = pixels[p + 1] = 16; pixels[p + 2] = 32; }
    else if (i < 20) pixels[p] = pixels[p + 1] = pixels[p + 2] = i < 10 ? 226 : Math.max(5, 226 - 37 * (i - 10));
    else {
      const col = Math.floor(x / 8) + (i - 20) + 20, row = Math.floor(y / 8);
      const noise = Math.imul(col ^ (row * 1241), 498767) ^ Math.imul(col, row * 1948417);
      pixels[p] = pixels[p + 1] = pixels[p + 2] = (noise >>> 6) & 1 ? 225 : 25;
    }
    pixels[p + 3] = 255;
  }
  return {data:pixels};
}
async function withBrowser(options, fn) {
  const prev = {document:globalThis.document, create:URL.createObjectURL, revoke:URL.revokeObjectURL};
  const stats = {created:0, revoked:0, released:0};
  class Video extends EventTarget {
    constructor() {
      super(); this.duration = 3.84; this.videoWidth = W; this.videoHeight = H; this.i = -1; this.paused = true;
      if (options.noTimestamp) this.requestVideoFrameCallback = null;
    }
    set src(value) { queueMicrotask(() => this.dispatchEvent(new Event(options.badMedia ? 'error' : 'loadedmetadata'))); }
    get currentTime() { throw new Error('currentTime is not presented timestamp evidence'); }
    requestVideoFrameCallback(fn) { this.cb = fn; return 9; }
    cancelVideoFrameCallback() { this.cb = null; }
    play() {
      this.paused = false;
      const tick = () => {
        if (this.paused) return;
        this.i++;
        if (this.i === T.length) return this.dispatchEvent(new Event('ended'));
        const cb = this.cb; this.cb = null;
        cb?.(1, {mediaTime:T[this.i]/1000, presentedFrames:this.i+1});
        setImmediate(tick);
      };
      setImmediate(tick);
      return Promise.resolve();
    }
    pause() { this.paused = true; }
    removeAttribute() {}
    load() { stats.released++; }
  }
  class Canvas {
    getContext() {
      return {drawImage:(video) => { this.image = render(video.i); }, getImageData:() => this.image,
        putImageData:(image) => { this.image = image; }};
    }
    toBlob(fn) { queueMicrotask(() => fn(new Blob([this.image.data], {type:'image/jpeg'}))); }
  }
  globalThis.document = {createElement:(tag) => tag === 'video' ? new Video() : new Canvas()};
  URL.createObjectURL = () => { stats.created++; return 'blob:synthetic'; };
  URL.revokeObjectURL = () => { stats.revoked++; };
  try { await fn(stats); }
  finally { globalThis.document = prev.document; URL.createObjectURL = prev.create; URL.revokeObjectURL = prev.revoke; }
}

test('VFR callback times, hard change, fade, translating pan and clipped scan window', async () => withBrowser({}, async (stats) => {
  const report = await HubV3Shots.analyze(LOCAL, {cues:CAPTIONS}, OPTIONS);
  assert.equal(report.status, 'needs_review');
  assert.equal(report.durationMs, 3840);
  assert.equal(report.analyzedEndMs, 3840);
  assert.equal(report.lastPresentedMs, 3706);
  assert.equal(report.candidates.find((c) => c.kind === 'hard_cut' && c.isBoundary)?.atMs, 774);
  assert.ok(report.candidates.some((c) => c.kind === 'fade' && c.fromMs >= 1100 && c.toMs <= 2300), JSON.stringify(report.candidates));
  assert.ok(report.candidates.some((c) => c.kind === 'rapid_pan' && c.fromMs >= 2500 && !c.isBoundary), JSON.stringify(report.candidates));
  assert.ok(report.shots.flatMap((s) => s.frames).some((f) => f.actualMs !== f.requestedMs));
  for (const s of report.shots) {
    assert.equal(s.frames.length, 3);
    for (const f of s.frames) {
      assert.ok(T.includes(f.actualMs));
      assert.ok(f.actualMs >= s.startMs && f.actualMs < s.endMs);
      assert.equal(f.mediaTime, f.actualMs / 1000);
      assert.equal(f.timestampBasis, 'requestVideoFrameCallback.mediaTime');
      assert.ok(f.blob instanceof Blob && f.blob.size > 0);
    }
  }
  const limited = await HubV3Shots.analyze(LOCAL, CAPTIONS, {...OPTIONS,maxDurationMs:850});
  assert.equal(limited.analyzedEndMs, 850);
  assert.equal(limited.shots.at(-1).endMs, 850);
  assert.ok(limited.shots.flatMap((s) => s.frames).every((f) => f.actualMs < 850));
  assert.ok(limited.warnings.includes('analysis_window_limited'));
  assert.deepEqual(stats, {created:2, revoked:2, released:2});
}));

test('half-open overlap, reversible editing, source ranges, and no caption text', async () => withBrowser({}, async () => {
  const report = await HubV3Shots.analyze(LOCAL, CAPTIONS, OPTIONS);
  const [left, right] = report.shots;
  assert.deepEqual(left.cueIds, ['cross']);
  assert.deepEqual(right.cueIds, ['cross','edge']);
  assert.equal(left.cueOverlaps[0].overlapMs, 74);
  assert.equal(right.cueOverlaps[0].overlapMs, 86);
  assert.ok(!JSON.stringify(report).includes('PRIVATE-SENTINEL'));
  assert.ok(!JSON.stringify(report).includes('mock.webm'));
  const merged = HubV3Shots.edit(report.shots, {type:'merge',shotIds:[left.id,right.id]});
  assert.equal(merged[0].cueOverlaps[0].overlapMs, 160);
  assert.deepEqual(merged[0].frames.map((f) => f.blob), [...left.frames,...right.frames].map((f) => f.blob));
  const split = HubV3Shots.edit(merged, {type:'split',shotId:merged[0].id,atMs:774});
  for (const [i, expected] of [left,right].entries()) {
    assert.deepEqual(split[i].sourceShotIds, expected.sourceShotIds);
    assert.deepEqual(split[i].frames, expected.frames);
    assert.deepEqual(split[i].cueOverlaps, expected.cueOverlaps);
  }
  assert.strictEqual(report.shots[0], left);
  assert.throws(() => HubV3Shots.edit(report.shots, {type:'split',shotId:left.id,atMs:774}), /split_outside_shot/);
  assert.throws(() => HubV3Shots.edit(report.shots, {type:'merge',shotIds:['missing',right.id]}), /two_adjacent_shots_required/);
}));

test('unauthorized, missing video, spoofed playlist, invalid codec and cancel do not fabricate results', async () => {
  await withBrowser({}, async (stats) => {
    for (const [file, options, reason] of [[null, OPTIONS, 'local_video_required'], [LOCAL, {allowed:false}, 'local_file_not_authorized'],
      [new File(['#EXTM3U\nhttps://example.invalid/v'],'x.mp4',{type:'video/mp4'}), OPTIONS, 'unrecognized_local_container']]) {
      const report = await HubV3Shots.analyze(file, CAPTIONS, options);
      assert.equal(report.reason, reason); assert.deepEqual(report.shots, []);
    }
    assert.equal(stats.created, 0);
    const aborter = new AbortController();
    const result = await HubV3Shots.analyze(LOCAL, CAPTIONS, {...OPTIONS, signal:aborter.signal,
      onProgress:({phase}) => { if (phase === 'sampling') aborter.abort(); }});
    assert.equal(result.reason, 'cancelled');
    assert.equal(stats.revoked, 1);
  });
  await withBrowser({noTimestamp:true}, async (stats) => {
    const report = await HubV3Shots.analyze(LOCAL, CAPTIONS, OPTIONS);
    assert.equal(report.reason, 'actual_presented_timestamps_unavailable');
    assert.equal(stats.created, 0);
  });
  await withBrowser({badMedia:true}, async (stats) => {
    const report = await HubV3Shots.analyze(LOCAL, CAPTIONS, OPTIONS);
    assert.equal(report.status, 'failed'); assert.deepEqual(report.shots, []);
    assert.equal(report.reason, 'media_decode_failed'); assert.equal(stats.revoked, 1);
    assert.equal(CAPTIONS[0].text, 'PRIVATE-SENTINEL');
  });
});
