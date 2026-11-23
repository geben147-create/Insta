/* T05 gold caption renderer. All distances use a 1600 × 520 design canvas.
 * draw(canvas, state, {time: seconds, transparent: boolean}) is also used for PNG export.
 * glyphs uses UTF-16 offsets, matching textarea.selectionStart/selectionEnd.
 * Font loading belongs to the editor; this module has no network or DOM side effects.
 */
(() => {
  "use strict";
  const WIDTH = 1600;
  const HEIGHT = 520;
  const TAU = Math.PI * 2;
  const defaults = {
    text: "병현표 특급 서비스",
    fontFamily: '"ref-106", sans-serif',
    fontWeight: "400",
    size: 110,
    tracking: -3,
    lineHeight: 1.45,
    slant: -7,
    tilt: -1.4,
    stretchX: 100,
    stretchY: 100,
    positionX: 0,
    positionY: 0,
    top: "#F9D56B",
    highlight: "#FFF7B8",
    bottom: "#F8DD78",
    outline: "#3C280B",
    outer: "#D1A13B",
    shadow: "#7B5019",
    outlineWidth: 2.4,
    outerWidth: 1.2,
    depth: 3,
    shadowAngle: 90,
    blur: 0.7,
    gradientAngle: 90,
    highlightStop: 54,
    gradient: true,
    glowOpacity: 0.42,
    glowSpread: 48,
    starCount: 34,
    starSize: 11,
    starOpacity: 0.9,
    twinkleSpeed: 1,
    dustCount: 200,
    dustSize: 2.1,
    dustOpacity: 0.55,
    scatter: 100,
    seed: 51024,
    effect: true,
    bg: "#FFFFFF",
    glyphs: {
      0: {scale: 118, rotate: -0.8},
      1: {scale: 118, rotate: -0.3},
      2: {scale: 94},
      4: {scale: 123, rotate: -0.5},
      5: {scale: 96},
    },
  };
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const number = (v, fallback, lo, hi) => clamp(Number.isFinite(Number(v)) ? Number(v) : fallback, lo, hi);
  const radians = degrees => degrees * Math.PI / 180;
  const identity = () => [1, 0, 0, 1, 0, 0];
  const translate = (x, y) => [1, 0, 0, 1, x, y];
  const scale = (x, y) => [x, 0, 0, y, 0, 0];
  const rotate = degrees => {
    const angle = radians(degrees), c = Math.cos(angle), s = Math.sin(angle);
    return [c, s, -s, c, 0, 0];
  };
  const skew = degrees => [1, 0, Math.tan(radians(degrees)), 1, 0, 0];
  function multiply(a, b) {
    return [
      a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
      a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
      a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
    ];
  }
  const compose = (...matrices) => matrices.reduce(multiply, identity());
  const point = (m, x, y) => ({x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5]});
  function box(points) {
    const xs = points.map(p => p.x), ys = points.map(p => p.y);
    const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
    return {left, right, top, bottom, width: right - left, height: bottom - top, x: left, y: top};
  }
  function randomGenerator(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function rgba(hex, alpha) {
    const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "F9D56B";
    return `rgba(${parseInt(value.slice(0, 2), 16)},${parseInt(value.slice(2, 4), 16)},${parseInt(value.slice(4, 6), 16)},${clamp(alpha, 0, 1)})`;
  }
  function normalize(input) {
    const s = {...defaults, ...input};
    s.text = String(s.text ?? "").slice(0, 1000);
    s.fontFamily = String(s.fontFamily || defaults.fontFamily);
    s.fontWeight = /^(normal|bold|[1-9]00)$/.test(String(s.fontWeight)) ? String(s.fontWeight) : "400";
    const ranges = {
      size: [14, 350], tracking: [-35, 80], lineHeight: [0.7, 3], slant: [-40, 40], tilt: [-25, 25],
      stretchX: [35, 220], stretchY: [35, 220], positionX: [-700, 700], positionY: [-200, 200],
      outlineWidth: [0, 20], outerWidth: [0, 20], depth: [0, 30], shadowAngle: [-360, 360], blur: [0, 30],
      gradientAngle: [-360, 360], highlightStop: [15, 75], glowOpacity: [0, 1], glowSpread: [0, 200],
      starCount: [0, 120], starSize: [0, 45], starOpacity: [0, 1], twinkleSpeed: [0, 5],
      dustCount: [0, 600], dustSize: [0, 12], dustOpacity: [0, 1], scatter: [20, 200], seed: [0, 4294967295],
    };
    for (const [key, [lo, hi]] of Object.entries(ranges)) s[key] = number(s[key], defaults[key], lo, hi);
    for (const key of ["top", "highlight", "bottom", "outline", "outer", "shadow", "bg"])
      if (!/^#[0-9a-f]{6}$/i.test(s[key])) s[key] = defaults[key];
    s.glyphs = s.glyphs && typeof s.glyphs === "object" ? s.glyphs : {};
    return s;
  }
  function makeLayout(ctx, s) {
    const lines = [[]];
    let index = 0;
    for (const character of s.text) {
      if (character === "/" || character === "\n") lines.push([]);
      else {
        const g = s.glyphs[index] || {};
        const fontSize = s.size * number(g.scale, 100, 30, 250) / 100;
        ctx.font = `${s.fontWeight} ${fontSize}px ${s.fontFamily}`;
        const metrics = ctx.measureText(character);
        // Some bundled display fonts omit U+0020; reserve a real gap, never a .notdef box.
        const advance = (/^\s$/.test(character) ? fontSize * 0.3 : metrics.width) + s.tracking;
        const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent || fontSize * 0.12;
        lines.at(-1).push({
          index, char: character, fontSize, advance,
          left: -(metrics.actualBoundingBoxLeft || 0),
          right: metrics.actualBoundingBoxRight || metrics.width,
          ascent, descent,
          rotate: number(g.rotate, 0, -60, 60),
          slant: number(g.slant, 0, -35, 35),
          offsetX: number(g.offsetX, 0, -250, 250),
          offsetY: number(g.offsetY, 0, -150, 150),
          color: /^#[0-9a-f]{6}$/i.test(g.color) ? g.color : null,
        });
      }
      index += character.length;
    }
    const globalTransform = compose(rotate(s.tilt), scale(s.stretchX / 100, s.stretchY / 100));
    const glyphs = [], points = [];
    const padding = s.outlineWidth + s.outerWidth + s.depth + s.blur * 2;
    lines.forEach((line, lineIndex) => {
      const width = line.reduce((sum, glyph) => sum + glyph.advance, 0) - (line.length ? s.tracking : 0);
      let x = -width / 2;
      const y = (lineIndex - (lines.length - 1) / 2) * s.size * s.lineHeight;
      for (const glyph of line) {
        glyph.matrix = compose(globalTransform, translate(x + glyph.offsetX, y + glyph.offsetY), rotate(glyph.rotate), skew(clamp(s.slant + glyph.slant, -55, 55)));
        glyph.localCorners = [
          [glyph.left - padding, -glyph.ascent - padding], [glyph.right + padding, -glyph.ascent - padding],
          [glyph.right + padding, glyph.descent + padding], [glyph.left - padding, glyph.descent + padding],
        ];
        glyph.corners = glyph.localCorners.map(([cx, cy]) => point(glyph.matrix, cx, cy));
        points.push(...glyph.corners);
        glyphs.push(glyph);
        x += glyph.advance;
      }
    });
    if (!points.length) points.push({x: -1, y: -1}, {x: 1, y: 1});
    const rawBounds = box(points);
    const availableWidth = Math.max(120, WIDTH - 150 - Math.abs(s.positionX) * 2);
    const availableHeight = Math.max(90, HEIGHT - 150 - Math.abs(s.positionY) * 2);
    const fitScale = Math.min(1, availableWidth / Math.max(rawBounds.width, 1), availableHeight / Math.max(rawBounds.height, 1));
    const finalTransform = compose(
      translate(WIDTH / 2 + s.positionX, HEIGHT / 2 + s.positionY), scale(fitScale, fitScale),
      translate(-(rawBounds.left + rawBounds.right) / 2, -(rawBounds.top + rawBounds.bottom) / 2),
    );
    for (const glyph of glyphs) {
      glyph.matrix = multiply(finalTransform, glyph.matrix);
      glyph.corners = glyph.localCorners.map(([x, y]) => point(glyph.matrix, x, y));
    }
    const bounds = box(points.map(p => point(finalTransform, p.x, p.y)));
    return {glyphs, fitScale, bounds};
  }
  function sparkle(ctx, x, y, radius, alpha, color, angle = 0) {
    if (radius < 0.1 || alpha <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.3);
    halo.addColorStop(0, rgba(color, alpha * 0.32));
    halo.addColorStop(0.25, rgba(color, alpha * 0.16));
    halo.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(-radius * 2.3, -radius * 2.3, radius * 4.6, radius * 4.6);
    const r = radius, waist = radius * 0.1;
    ctx.beginPath();
    ctx.moveTo(0, -r * 1.25);
    ctx.quadraticCurveTo(waist, -waist, r, 0);
    ctx.quadraticCurveTo(waist, waist, 0, r * 1.25);
    ctx.quadraticCurveTo(-waist, waist, -r, 0);
    ctx.quadraticCurveTo(-waist, -waist, 0, -r * 1.25);
    ctx.closePath();
    ctx.fillStyle = rgba("#FFF8DD", alpha);
    ctx.fill();
    ctx.strokeStyle = rgba(color, alpha * 0.78);
    ctx.lineWidth = Math.max(0.45, r * 0.055);
    ctx.stroke();
    ctx.fillStyle = rgba("#FFFFFF", alpha);
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(0.5, r * 0.12), 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  function drawAtmosphere(ctx, s, layout, time) {
    if (!s.effect || !s.text.trim()) return;
    const {bounds: b, fitScale: fit} = layout;
    const random = randomGenerator(s.seed);
    const cx = (b.left + b.right) / 2, cy = (b.top + b.bottom) / 2;
    const spread = s.scatter / 100;
    const width = Math.max(b.width, 180) * (0.82 + spread * 0.18);
    const height = Math.max(b.height, 90);
    if (s.glowOpacity && s.glowSpread) {
      // Several soft gold flecks, not an opaque rectangular glow behind the caption.
      for (let i = 0; i < 11; i++) {
        const x = cx + (i / 10 - 0.5) * width;
        const y = cy + (i % 2 ? -0.3 : 0.32) * height;
        const radius = s.glowSpread * (0.72 + random() * 0.7) * Math.max(fit, 0.45);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, rgba(s.top, s.glowOpacity * 0.25));
        glow.addColorStop(0.38, rgba(s.top, s.glowOpacity * 0.12));
        glow.addColorStop(1, rgba(s.top, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }
    }
    for (let i = 0; i < Math.round(s.dustCount); i++) {
      const x = cx + (random() - 0.5) * (width + 100 * spread);
      const centerBias = (random() + random() - 1);
      const y = cy + centerBias * (height * 0.62 + 54 * spread);
      const r = s.dustSize * (0.2 + Math.pow(random(), 2) * 1.15) * Math.max(fit, 0.5);
      const opacity = s.dustOpacity * (0.2 + random() * 0.7);
      if (r < 0.1) continue;
      if (i % 10 === 0) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5);
        glow.addColorStop(0, rgba(s.highlight, opacity * 0.8));
        glow.addColorStop(0.18, rgba(s.top, opacity * 0.65));
        glow.addColorStop(1, rgba(s.top, 0));
        ctx.fillStyle = glow;
        ctx.fillRect(x - r * 4.5, y - r * 4.5, r * 9, r * 9);
      }
      ctx.fillStyle = rgba(i % 4 ? s.top : s.outer, opacity);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fill();
    }
    for (let i = 0; i < Math.round(s.starCount); i++) {
      const x = cx + (random() - 0.5) * (width + 85 * spread);
      const side = random() > 0.5 ? 1 : -1;
      const y = cy + side * (height * 0.38 + random() * 42 * spread);
      const phase = random() * TAU;
      const frequency = (0.65 + random() * 0.7) * s.twinkleSpeed;
      const twinkle = s.twinkleSpeed > 0 ? 0.42 + 0.58 * Math.pow((Math.sin(time * frequency * 1.9 + phase) + 1) / 2, 2) : 0.8;
      const radius = s.starSize * (0.18 + Math.pow(random(), 2.2) * 0.85) * Math.max(fit, 0.55);
      sparkle(ctx, x, y, radius * (0.85 + twinkle * 0.15), s.starOpacity * twinkle, s.top, (random() - 0.5) * 0.45);
    }
  }
  function makeGradient(ctx, glyph, s) {
    const width = Math.max(glyph.right - glyph.left, 1);
    const height = glyph.ascent + glyph.descent;
    const cx = (glyph.left + glyph.right) / 2, cy = (-glyph.ascent + glyph.descent) / 2;
    const angle = radians(s.gradientAngle), vx = Math.cos(angle), vy = Math.sin(angle);
    const length = Math.abs(width * vx) + Math.abs(height * vy);
    const gradient = ctx.createLinearGradient(cx - vx * length / 2, cy - vy * length / 2, cx + vx * length / 2, cy + vy * length / 2);
    const stop = s.highlightStop / 100;
    gradient.addColorStop(0, s.top);
    gradient.addColorStop(Math.max(0.01, stop - 0.3), s.highlight);
    gradient.addColorStop(Math.max(0.02, stop - 0.14), s.top);
    gradient.addColorStop(Math.max(0.03, stop - 0.055), s.top);
    gradient.addColorStop(stop, s.highlight);
    gradient.addColorStop(Math.min(0.99, stop + 0.17), s.bottom);
    gradient.addColorStop(1, s.bottom);
    return gradient;
  }
  function drawGlyph(ctx, glyph, s) {
    if (/^\s$/.test(glyph.char)) return;
    ctx.save();
    ctx.transform(...glyph.matrix);
    ctx.font = `${s.fontWeight} ${glyph.fontSize}px ${s.fontFamily}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.lineJoin = "round";
    ctx.miterLimit = 2;
    const dx = Math.cos(radians(s.shadowAngle)), dy = Math.sin(radians(s.shadowAngle));
    if (s.depth > 0 || s.blur > 0) {
      ctx.fillStyle = s.shadow;
      ctx.strokeStyle = s.shadow;
      const shadowStroke = 2 * (s.outlineWidth + s.outerWidth);
      if (shadowStroke > 0) ctx.lineWidth = shadowStroke;
      ctx.shadowColor = rgba(s.shadow, 0.4);
      ctx.shadowBlur = s.blur;
      const steps = Math.max(1, Math.min(8, Math.ceil(s.depth)));
      for (let step = steps; step >= 1; step--) {
        const distance = s.depth * step / steps;
        if (shadowStroke > 0) ctx.strokeText(glyph.char, dx * distance, dy * distance);
        ctx.fillText(glyph.char, dx * distance, dy * distance);
        ctx.shadowBlur = 0;
      }
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
    }
    if (s.outerWidth > 0) {
      ctx.lineWidth = 2 * (s.outlineWidth + s.outerWidth);
      ctx.strokeStyle = s.outer;
      ctx.strokeText(glyph.char, 0, 0);
    }
    if (s.outlineWidth > 0) {
      ctx.lineWidth = 2 * s.outlineWidth;
      ctx.strokeStyle = s.outline;
      ctx.strokeText(glyph.char, 0, 0);
    }
    ctx.fillStyle = glyph.color || (s.gradient ? makeGradient(ctx, glyph, s) : s.top);
    ctx.fillText(glyph.char, 0, 0);
    ctx.restore();
  }
  function draw(canvas, state, options = {}) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return {glyphs: [], fitScale: 1, bounds: null};
    const s = normalize(state || {});
    const time = number(options.time, 0, 0, 1e9);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!options.transparent) {
      ctx.fillStyle = s.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    const outputScale = Math.min(canvas.width / WIDTH, canvas.height / HEIGHT);
    const outputOffsetX = (canvas.width - WIDTH * outputScale) / 2;
    const outputOffsetY = (canvas.height - HEIGHT * outputScale) / 2;
    ctx.translate(outputOffsetX, outputOffsetY);
    ctx.scale(outputScale, outputScale);
    const layout = makeLayout(ctx, s);
    drawAtmosphere(ctx, s, layout, time);
    for (const glyph of layout.glyphs) drawGlyph(ctx, glyph, s);
    ctx.restore();
    return {
      glyphs: layout.glyphs.map(({index, char, corners}) => ({index, char, corners})),
      fitScale: layout.fitScale,
      bounds: layout.bounds,
      width: WIDTH,
      height: HEIGHT,
      outputScaleX: outputScale,
      outputScaleY: outputScale,
      outputOffsetX,
      outputOffsetY,
    };
  }
  window.GoldCaptionRenderer = {defaults, draw};
})();
