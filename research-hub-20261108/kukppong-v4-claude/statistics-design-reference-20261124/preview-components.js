/*
 * Diagram studies inspired by user-supplied screenshots, not finished renders.
 * Static educational data only. No external assets, fonts, or dependencies.
 * API: StatsPreview.render(host, { kind, orientation, palette, character })
 */
(function (global) {
  'use strict';
  var serial = 0;
  var NS = 'http://www.w3.org/2000/svg';
  var kinds = ['map', 'growth', 'pie_glass', 'pie_glow', 'funnel', 'bars', 'review'];
  var titles = {
    map: ['분포를 한눈에', '지도 자산 + 큰 수치 + 지역 요약'],
    growth: ['성장을 숫자로', '큰 수치 + 선형 막대 + 기준 시점'],
    pie_glass: ['구성 비율을 선명하게', '투명한 재질 · 정확한 30 : 70'],
    pie_glow: ['핵심 비율에 시선 집중', '화이트 디스크 · 중심 발광 · 정확한 비율'],
    funnel: ['단계마다 얼마나 남았나', '단계별 인원 + 직전 단계 대비 전환율'],
    bars: ['네 항목을 같은 기준으로', '같은 0선 · 같은 눈금 · 같은 막대 폭'],
    review: ['후기에서 사례까지', '유리 아이콘 + 연결 경로 + 짧은 설명']
  };
  var palettes = {
    blue: { main: '#1951FC', dark: '#03195B', mid: '#3781FC', light: '#CBE9FD', glow: '#1951FC' },
    lime: { main: '#C7F001', dark: '#405000', mid: '#DAF65F', light: '#F4FBD6', glow: '#C7F001' },
    orange: { main: '#F76D0B', dark: '#784019', mid: '#FFA243', light: '#FFE7BB', glow: '#F76D0B' }
  };
  var demo = Object.freeze({
    barValues: Object.freeze([50, 25, 100, 75]),
    pieValues: Object.freeze([30, 70]),
    funnelValues: Object.freeze([450000, 18000, 8280, 1656]),
    funnelStepRates: Object.freeze([null, 4, 46, 20])
  });

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function txt(x, y, value, size, color, weight, anchor, extra) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + (color || '#16233C') + '" font-weight="' + (weight || 500) + '" text-anchor="' + (anchor || 'start') + '" ' + (extra || '') + '>' + esc(value) + '</text>';
  }
  function rect(x, y, w, h, r, fill, more) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + r + '" fill="' + fill + '" ' + (more || '') + '/>';
  }
  function line(x1, y1, x2, y2, color, width, more) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + width + '" ' + (more || '') + '/>';
  }
  function circle(x, y, r, fill, more) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + fill + '" ' + (more || '') + '/>';
  }
  function path(d, fill, more) {
    return '<path d="' + d + '" fill="' + fill + '" ' + (more || '') + '/>';
  }
  function g(body, transform, more) {
    return '<g' + (transform ? ' transform="' + transform + '"' : '') + ' ' + (more || '') + '>' + body + '</g>';
  }
  function url(c, key) { return 'url(#' + c.id + '-' + key + ')'; }
  function shadow(c) { return 'filter="' + url(c, 'shadow') + '"'; }
  function glass(c, x, y, w, h, radius) {
    return rect(x, y, w, h, radius || 32, url(c, 'glass'), 'stroke="#FFFFFF" stroke-width="3" ' + shadow(c));
  }
  function pill(c, x, y, w, label, fill, color) {
    return rect(x, y, w, 46, 23, fill || c.p.light) + txt(x + w / 2, y + 31, label, 24, color || c.p.dark, 700, 'middle');
  }
  function defs(c) {
    var p = c.p;
    var s = '<defs>';
    s += '<linearGradient id="' + c.id + '-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF0F5"/></linearGradient>';
    s += '<linearGradient id="' + c.id + '-glass" x1="0" y1="0" x2="0.7" y2="1"><stop stop-color="#FFFFFF" stop-opacity="0.98"/><stop offset="0.52" stop-color="#F7FAFF" stop-opacity="0.68"/><stop offset="1" stop-color="' + p.light + '" stop-opacity="0.55"/></linearGradient>';
    s += '<linearGradient id="' + c.id + '-accent" x1="0" y1="1" x2="1" y2="0"><stop stop-color="' + p.dark + '"/><stop offset="0.45" stop-color="' + p.main + '"/><stop offset="1" stop-color="' + p.mid + '"/></linearGradient>';
    s += '<linearGradient id="' + c.id + '-rise" x1="0" y1="1" x2="0" y2="0"><stop stop-color="' + p.light + '"/><stop offset="0.55" stop-color="' + p.mid + '"/><stop offset="1" stop-color="' + p.main + '"/></linearGradient>';
    s += '<linearGradient id="' + c.id + '-rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#FFFFFF"/><stop offset="0.4" stop-color="' + p.light + '"/><stop offset="0.6" stop-color="#FFFFFF"/><stop offset="1" stop-color="' + p.main + '" stop-opacity="0.25"/></linearGradient>';
    s += '<radialGradient id="' + c.id + '-glow"><stop stop-color="' + p.glow + '" stop-opacity="0.95"/><stop offset="0.68" stop-color="' + p.main + '" stop-opacity="0.8"/><stop offset="1" stop-color="' + p.main + '" stop-opacity="0"/></radialGradient>';
    s += '<filter id="' + c.id + '-shadow" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="8" dy="16" stdDeviation="18" flood-color="#455975" flood-opacity="0.15"/></filter>';
    s += '<filter id="' + c.id + '-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>';
    ['#FE9E13', '#013476', '#01EFD1', '#FC395B'].forEach(function (col, i) {
      var actual = c.palette === 'reference' ? col : [p.mid, p.main, p.dark, p.mid][i];
      s += '<linearGradient id="' + c.id + '-bar' + i + '" x1="0" y1="1" x2="0.6" y2="0"><stop stop-color="' + actual + '" stop-opacity="0.36"/><stop offset="0.6" stop-color="' + actual + '"/><stop offset="1" stop-color="' + actual + '"/></linearGradient>';
    });
    return s + '</defs>';
  }
  function frame(c, body) {
    var m = c.stats.x;
    var heading = titles[c.kind];
    var s = rect(0, 0, c.w, c.h, 0, url(c, 'bg'));
    s += circle(c.w * 0.82, c.h * 0.25, c.tall ? 400 : 430, c.p.light, 'opacity="0.16"');
    s += '<g data-region="statistics" data-box="' + [c.stats.x,c.stats.y,c.stats.w,c.stats.h].join(' ') + '">';
    s += txt(m, c.tall ? 230 : 144, heading[0], c.tall ? 58 : 58, '#15233C', 850);
    s += txt(m, c.tall ? 288 : 203, heading[1], c.tall ? 32 : 32, '#68778C', 500);
    if (!c.tall) s += pill(c, 1648, 78, 176, '🌸 DEMO', '#E8EDF4', '#4E5E73');
    s += '<g data-region="body" data-box="' + [c.body.x,c.body.y,c.body.w,c.body.h].join(' ') + '">' + body + '</g>';
    if (c.character) {
      var slot = c.characterRect;
      var cx = slot.x, cy = slot.y;
      s += '<g data-region="character" data-box="' + [slot.x,slot.y,slot.w,slot.h].join(' ') + '">';
      s += rect(cx, cy, slot.w, slot.h, 24, '#FFFFFF', 'stroke="#98A4B4" stroke-width="2.5" stroke-dasharray="10 8" opacity="0.93"');
      if (c.tall) {
        s += txt(cx + slot.w / 2, cy + 57, '캐릭터 선택 자리 · 제작용 개별 자산 대기', 35, '#66758A', 700, 'middle');
        s += txt(cx + slot.w / 2, cy + 105, 'ON: 공간 예약 / OFF: 차트가 공간 회수', 30, '#8A94A4', 500, 'middle');
      } else {
        s += txt(cx + slot.w / 2, cy + 192, '캐릭터 선택 자리', 30, '#66758A', 700, 'middle');
        s += txt(cx + slot.w / 2, cy + 241, '제작용 개별 자산 대기', 28, '#8A94A4', 500, 'middle');
        s += txt(cx + slot.w / 2, cy + 304, '별도 열 예약', 28, '#8A94A4', 500, 'middle');
      }
      s += '</g>';
    }
    s += '</g>';
    var sr = c.source;
    s += '<g data-region="source" data-box="' + [sr.x,sr.y,sr.w,sr.h].join(' ') + '">';
    s += txt(sr.x, sr.y + (c.tall ? 29 : 31), c.tall ? '예시 데이터 · 디자인 배치 설명용' : '예시 데이터 · 디자인 배치 설명용   |   실제 영상에는 출처 · 기준일 · 단위를 연결', c.tall ? 31 : 28, '#617184', 600);
    if (c.tall) s += txt(sr.x, sr.y + 67, '실제 출처·기준일을 연결한 뒤 사용', 30, '#7B8797', 450);
    s += '</g>';
    var cr = c.caption;
    s += '<g data-region="caption" data-box="' + [cr.x,cr.y,cr.w,cr.h].join(' ') + '">';
    s += rect(cr.x, cr.y, cr.w, cr.h, 18, '#E1E7EE', 'stroke="#C3CDD9" stroke-width="2" stroke-dasharray="9 9"');
    s += txt(cr.x + cr.w / 2, cr.y + (c.tall ? 66 : 61), '하단 주자막 예약 영역', c.tall ? 40 : 32, '#768599', 600, 'middle');
    if (c.tall) s += txt(cr.x + cr.w / 2, cr.y + 121, '주자막은 한 시점에 한 종류', 32, '#8794A4', 400, 'middle');
    s += '</g>';
    return s;
  }

  function mapPin(c, x, y, scale) {
    return g(path('M0 -42 C-27 -42 -37 -22 -30 -3 C-25 11 0 36 0 36 C0 36 25 11 30 -3 C37 -22 27 -42 0 -42Z', url(c, 'accent'), 'stroke="#FFFFFF" stroke-width="4"') + circle(0, -12, 11, '#FFFFFF'), 'translate(' + x + ' ' + y + ') scale(' + scale + ')', shadow(c));
  }
  function mapAsset(c, x, y, w, h) {
    var s = glass(c, x, y, w, h, 38);
    // Deliberately not a fabricated geographic outline.
    for (var i = 1; i < 6; i++) s += line(x + w * i / 6, y + 65, x + w * i / 6, y + h - 60, '#D8E1EA', 2);
    for (var j = 1; j < 4; j++) s += line(x + 45, y + 60 + j * (h - 120) / 4, x + w - 45, y + 60 + j * (h - 120) / 4, '#D8E1EA', 2);
    s += path('M' + (x + w * 0.20) + ' ' + (y + h * 0.53) + ' Q' + (x + w * 0.47) + ' ' + (y + h * 0.12) + ' ' + (x + w * 0.78) + ' ' + (y + h * 0.42), 'none', 'stroke="' + c.p.mid + '" stroke-width="5" stroke-dasharray="12 10" opacity="0.55"');
    s += mapPin(c, x + w * 0.20, y + h * 0.53, 0.9);
    s += mapPin(c, x + w * 0.49, y + h * 0.38, 0.9);
    s += mapPin(c, x + w * 0.78, y + h * 0.42, 0.9);
    s += rect(x + w * 0.17, y + h * 0.68, w * 0.66, 92, 20, '#FFFFFF', 'opacity="0.96"');
    s += txt(x + w / 2, y + h * 0.68 + 39, '실제 지도 자산 자리', c.tall ? 34 : 36, '#52637B', 750, 'middle');
    s += txt(x + w / 2, y + h * 0.68 + 73, '핀 위치는 가상 도식', 25, '#8996A6', 500, 'middle');
    return s;
  }
  function map(c) {
    var s = '';
    if (c.tall) {
      s += txt(72, 440, '90%', 166, c.p.main, 900);
      s += txt(78, 504, '큰 지표 1개를 먼저', 42, c.p.dark, 700);
      s += mapAsset(c, 72, 550, 864, c.character ? 350 : 470);
      var cardY = c.character ? 952 : 1080;
      ['지역 A', '지역 B', '지역 C'].forEach(function (label, i) {
        var x = 72 + (i % 2) * 446, y = cardY + Math.floor(i / 2) * 174;
        s += glass(c, x, y, 418, 152, 26);
        s += txt(x + 28, y + 65, [31, 8, 6][i], 64, c.p.main, 850);
        s += txt(x + 28, y + 119, label, 40, '#6A7688', 600);
      });
    } else {
      // The documented split is graphic LEFT 60%, gutter 6%, metric RIGHT 34%.
      var leftW = c.body.w * 0.60, rightX = c.body.x + c.body.w * 0.66;
      s += mapAsset(c, c.body.x, 300, leftW, 510);
      s += txt(rightX, 460, '90%', 140, c.p.main, 900);
      s += txt(rightX + 4, 521, '큰 지표 1개를 먼저', 36, c.p.dark, 700);
      ['지역 A', '지역 B', '지역 C'].forEach(function (label, i) {
        var y = 607 + i * 78;
        s += line(rightX, y - 34, rightX, y + 17, '#CAD3DE', 2);
        s += txt(rightX + 22, y + 5, [31, 8, 6][i], 48, c.p.main, 850);
        s += txt(rightX + 140, y + 3, label, 32, '#6A7688', 550);
      });
    }
    return s;
  }

  function barChart(c, x, y, w, h, values, names, colored, unit) {
    var s = '', max = 100, top = y + 86, bottom = y + h - 100, ch = bottom - top;
    var left = x + 66, right = x + w - 34, plotW = right - left;
    [0, 25, 50, 75, 100].forEach(function (v) {
      var py = bottom - ch * v / max;
      s += line(left, py, right, py, v === 0 ? '#AAB7C7' : '#DCE4ED', v === 0 ? 3 : 1.5);
      s += txt(left - 15, py + 11, String(v), c.tall ? 32 : 26, '#8A98AA', 500, 'end');
    });
    var gap = plotW / values.length, bw = Math.min(gap * 0.60, c.tall ? 130 : 190);
    values.forEach(function (v, i) {
      var bx = left + gap * i + (gap - bw) / 2, bh = ch * v / max, by = bottom - bh;
      s += rect(bx + 9, by + 11, bw, bh, 7, '#5B7499', 'opacity="0.10"');
      s += rect(bx, by, bw, bh, 7, colored ? url(c, 'bar' + i) : url(c, 'rise'), 'stroke="#FFFFFF" stroke-width="2"');
      s += line(bx + 7, by + 7, bx + bw - 7, by + 7, '#FFFFFF', 3, 'opacity="0.70"');
      s += line(bx + 7, by + 8, bx + 7, bottom - 6, '#FFFFFF', 2, 'opacity="0.45"');
      s += txt(bx + bw / 2, by - 22, v + (unit || ''), c.tall ? 46 : 44, '#243953', 850, 'middle');
      var lines = Array.isArray(names[i]) ? names[i] : [names[i]];
      lines.forEach(function (label, n) {
        s += txt(bx + bw / 2, bottom + 44 + n * 41, label, c.tall ? 40 : 30, '#596A80', 650, 'middle');
      });
    });
    return s;
  }
  function growth(c) {
    var s = '';
    if (c.tall) {
      s += txt(72, 450, '+15%', 172, c.p.main, 900);
      s += txt(78, 516, '최근 구간의 증가율', 42, c.p.dark, 700);
      var height = c.character ? 620 : 800;
      s += glass(c, 72, 580, 864, height, 38);
      s += barChart(c, 84, 610, 840, height - 60, [40, 55, 80, 92], [['시점','1'], ['시점','2'], ['시점','3'], ['시점','4']], false, '');
      s += txt(74, c.character ? 1270 : 1448, '지수 예시 · 80 → 92 = +15%', 34, '#6F7E91', 600);
    } else {
      var gx = c.body.x + c.body.w * 0.43, gw = c.body.w * 0.57;
      s += txt(96, 497, '+15%', 140, c.p.main, 900);
      s += txt(102, 562, '최근 구간의 증가율', 36, c.p.dark, 750);
      s += txt(102, 628, '비교 기준을 함께 표시', 30, '#6F7E91', 500);
      s += pill(c, 102, 675, 322, '예시: 80 → 92 = +15%');
      s += glass(c, gx, 300, gw, 520, 38);
      s += barChart(c, gx + 12, 311, gw - 24, 494, [40, 55, 80, 92], ['시점 1', '시점 2', '시점 3', '시점 4'], false, '');
    }
    return s;
  }

  function sector(cx, cy, r, startDeg, percent) {
    var a = startDeg * Math.PI / 180, b = (startDeg + percent * 3.6) * Math.PI / 180;
    var x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
    var x2 = cx + Math.cos(b) * r, y2 = cy + Math.sin(b) * r;
    return 'M' + cx + ' ' + cy + ' L' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + (percent > 50 ? 1 : 0) + ' 1 ' + x2 + ' ' + y2 + ' Z';
  }
  function pie(c, glow) {
    var cx = c.tall ? 504 : c.body.x + c.body.w * 0.29;
    var cy = c.tall ? (c.character ? 665 : 748) : 550;
    var r = c.tall ? (c.character ? 270 : 328) : (c.character ? 250 : 260);
    var s = '<ellipse cx="' + (cx + 10) + '" cy="' + (cy + r + 28) + '" rx="' + (r * 0.84) + '" ry="24" fill="#8FA3BB" opacity="0.16" filter="' + url(c, 'blur') + '"/>';
    s += circle(cx, cy + 15, r, '#D8E1EB', 'opacity="0.58"');
    s += circle(cx, cy, r, '#FAFCFF', 'stroke="#FFFFFF" stroke-width="7" ' + shadow(c));
    if (glow) {
      s += circle(cx, cy, r * 0.94, url(c, 'glow'));
      s += path(sector(cx, cy, r, -90, 30), '#FFFFFF', 'opacity="0.19"');
      s += path(sector(cx, cy, r, 18, 70), '#FFFFFF', 'opacity="0.05"');
    } else {
      s += path(sector(cx, cy, r - 7, -90, 30), url(c, 'rise'), 'opacity="0.92"');
      s += path(sector(cx, cy, r - 7, 18, 70), url(c, 'glass'), 'opacity="0.82"');
      s += circle(cx, cy, r - 10, 'none', 'stroke="' + url(c, 'rim') + '" stroke-width="9"');
      s += circle(cx, cy, r - 27, 'none', 'stroke="#A5B5C7" stroke-width="2" opacity="0.35"');
    }
    // 108 and 252 degrees: exact 30 / 70. No exploded slices or area distortion.
    s += line(cx, cy, cx, cy - r, '#FFFFFF', 5);
    s += line(cx, cy, cx + r * Math.cos(Math.PI / 10), cy + r * Math.sin(Math.PI / 10), '#FFFFFF', 5);
    var col = glow ? '#FFFFFF' : c.p.dark;
    s += txt(cx + r * 0.44, cy - r * 0.30, '30%', c.tall ? 64 : 52, col, 850, 'middle');
    s += txt(cx - r * 0.29, cy + r * 0.32, '70%', c.tall ? 68 : 58, glow ? '#FFFFFF' : '#60758D', 850, 'middle');
    if (c.tall) {
      [30, 70].forEach(function (v, i) {
        var x = 72 + i * 446, y = c.character ? 1052 : 1198;
        s += glass(c, x, y, 418, 210, 28);
        s += txt(x + 28, y + 57, i === 0 ? '구성 A' : '구성 B', 40, '#7A8799', 600);
        s += txt(x + 26, y + 174, v + '%', 124, c.p.main, 850);
      });
    } else {
      var rx = c.body.x + c.body.w * 0.64;
      s += txt(rx, 465, '70%', 140, c.p.main, 900);
      s += txt(rx + 5, 526, '핵심 구성의 비율', 38, c.p.dark, 700);
      s += line(rx + 5, 581, c.body.x + c.body.w - 8, 581, '#CDD7E3', 2);
      s += circle(rx + 20, 641, 13, c.p.main) + txt(rx + 55, 653, '구성 A  30%', 34, '#5C6E85', 650);
      s += circle(rx + 20, 714, 13, '#B9CADC') + txt(rx + 55, 726, '구성 B  70%', 34, '#5C6E85', 650);
    }
    return s;
  }

  function funnelCard(c, x, y, w, h, i) {
    var names = ['방문', '가입', '활성', '유료'];
    var nums = ['450,000', '18,000', '8,280', '1,656'];
    var accent = i >= 2;
    var fill = accent ? url(c, 'accent') : url(c, 'glass');
    var ink = accent ? '#FFFFFF' : '#243753';
    var s = rect(x, y, w, h, 28, fill, 'stroke="#FFFFFF" stroke-width="3" ' + shadow(c));
    s += path('M' + (x + 24) + ' ' + (y + 11) + ' H' + (x + w - 24), 'none', 'stroke="#FFFFFF" stroke-width="3" opacity="0.58"');
    s += txt(x + 28, y + 48, (i + 1) + '  ' + names[i], c.tall ? 33 : 29, ink, 700);
    s += txt(x + 28, y + (c.tall ? 115 : 116), nums[i], c.tall ? 64 : 58, ink, 850);
    if (i) s += txt(x + 28, y + (c.tall ? 163 : 168), '직전 대비 ' + demo.funnelStepRates[i] + '%', c.tall ? 30 : 27, ink, 550, 'start', 'opacity="0.90"');
    else s += txt(x + 28, y + (c.tall ? 163 : 168), '시작 모수', c.tall ? 30 : 27, ink, 550, 'start', 'opacity="0.72"');
    return s;
  }
  function arrow(c, x, y, direction) {
    return direction === 'down' ? path('M' + (x - 12) + ' ' + (y - 7) + ' L' + x + ' ' + (y + 7) + ' L' + (x + 12) + ' ' + (y - 7), 'none', 'stroke="' + c.p.main + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"') : path('M' + (x - 7) + ' ' + (y - 12) + ' L' + (x + 7) + ' ' + y + ' L' + (x - 7) + ' ' + (y + 12), 'none', 'stroke="' + c.p.main + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"');
  }
  function funnel(c) {
    var s = '';
    if (c.tall) {
      var available = c.body.h - 90, gap = 28, cardH = (available - gap * 3) / 4;
      [864, 804, 744, 684].forEach(function (w, i) {
        var x = 72 + (864 - w) / 2, y = c.body.y + i * (cardH + gap);
        s += funnelCard(c, x, y, w, cardH, i);
        if (i < 3) s += arrow(c, 504, y + cardH + 14, 'down');
      });
      s += txt(72, c.body.y + c.body.h - 47, '8,280 ÷ 18,000 = 46%', 38, c.p.dark, 750);
      s += txt(72, c.body.y + c.body.h - 5, '너비는 단계 배치용 · 데이터 면적 아님', 32, '#7B8798', 500);
    } else {
      // Wide rule: vertical funnel left 56%, notes right 38%, gap 6%.
      var leftW = c.body.w * 0.56, rx = c.body.x + c.body.w * 0.62;
      var names = ['방문', '가입', '활성', '유료'];
      var values = ['450,000', '18,000', '8,280', '1,656'];
      [0, 1, 2, 3].forEach(function (i) {
        var w = leftW * (1 - i * 0.10), x = c.body.x + (leftW - w) / 2, y = 288 + i * 132;
        var ink = i >= 2 ? '#FFFFFF' : '#243753';
        s += rect(x, y, w, 112, 25, i >= 2 ? url(c, 'accent') : url(c, 'glass'), 'stroke="#FFFFFF" stroke-width="3" ' + shadow(c));
        s += txt(x + 26, y + 48, (i + 1) + '  ' + names[i], 32, ink, 700);
        s += txt(x + w - 26, y + 62, values[i], 56, ink, 850, 'end');
        s += txt(x + w - 26, y + 98, i ? '직전 대비 ' + demo.funnelStepRates[i] + '%' : '시작 모수', 27, ink, 500, 'end');
        if (i < 3) s += arrow(c, c.body.x + leftW / 2, y + 122, 'down');
      });
      s += txt(rx, 453, '46%', 140, c.p.main, 900);
      s += txt(rx + 4, 514, '가입 → 활성 전환', 36, c.p.dark, 700);
      s += txt(rx + 4, 581, '8,280 ÷ 18,000', 34, '#576B84', 650);
      s += txt(rx + 4, 638, '원본의 45%를 계산값으로 교정', 28, '#738399', 550);
      s += line(rx + 4, 683, c.body.x + c.body.w - 4, 683, '#CBD6E2', 2);
      s += txt(rx + 4, 742, '단계 너비는 배치용', 30, '#7B8798', 550);
      s += txt(rx + 4, 789, '실제 수량의 면적 비례 아님', 28, '#7B8798', 500);
    }
    return s;
  }

  function bars(c) {
    var s = '';
    if (c.tall) {
      s += txt(72, 440, '100%', 166, c.p.main, 900);
      s += txt(78, 506, '가장 큰 항목을 먼저 읽기', 42, '#5C7089', 650);
      var height = c.character ? 620 : 800;
      s += glass(c, 72, 580, 864, height, 38);
      s += barChart(c, 84, 610, 840, height - 60, demo.barValues, [['항목','A'], ['항목','B'], ['항목','C'], ['항목','D']], true, '%');
      s += txt(74, c.character ? 1270 : 1448, '정면 높이 비교 · 50 / 25 / 100 / 75', 32, '#718198', 550);
    } else {
      var chartW = c.body.w * 0.68, rx = c.body.x + c.body.w * 0.73;
      s += glass(c, c.body.x, 295, chartW, 525, 38);
      s += barChart(c, c.body.x + 12, 302, chartW - 24, 507, demo.barValues, ['항목 A', '항목 B', '항목 C', '항목 D'], true, '%');
      s += txt(rx, 465, '100%', 132, c.p.main, 900);
      s += txt(rx + 4, 526, '항목 C가 최대', 34, c.p.dark, 750);
      s += line(rx + 4, 580, c.body.x + c.body.w - 4, 580, '#CAD6E2', 2);
      s += txt(rx + 4, 638, '공통 기준 100', 30, '#64768E', 650);
      s += txt(rx + 4, 692, '장식보다 앞면 높이', 30, '#64768E', 550);
      s += txt(rx + 4, 744, '같은 기준선에서 비교', 28, '#7C8899', 500);
    }
    return s;
  }

  function icon(c, kind, x, y, size) {
    var s = '', sc = size / 160;
    if (kind === 'star') {
      s += circle(80, 80, 68, url(c, 'glass'), 'stroke="' + url(c, 'rim') + '" stroke-width="8"');
      s += path('M80 36 L94 65 L126 70 L103 93 L109 125 L80 109 L51 125 L57 93 L34 70 L66 65Z', '#FFFFFF', 'stroke="' + c.p.main + '" stroke-width="3" opacity="0.90"');
    } else if (kind === 'comment') {
      s += path('M25 23 H130 Q148 23 148 43 V105 Q148 124 129 124 H77 L45 148 L48 124 H30 Q12 124 12 105 V43 Q12 23 25 23Z', url(c, 'accent'), 'stroke="' + url(c, 'rim') + '" stroke-width="5"');
      [48, 80, 112].forEach(function (cx) { s += circle(cx, 76, 9, '#FFFFFF', 'opacity="0.92"'); });
    } else if (kind === 'document') {
      s += path('M32 13 H103 L134 45 V145 H32Z', url(c, 'glass'), 'stroke="' + url(c, 'rim') + '" stroke-width="7"');
      s += path('M103 14 V46 H133', 'none', 'stroke="' + c.p.main + '" stroke-width="3" opacity="0.5"');
      [69, 91, 113].forEach(function (yy) { s += line(52, yy, 111, yy, c.p.main, 4, 'opacity="0.45" stroke-linecap="round"'); });
    } else {
      s += rect(14, 21, 132, 119, 21, url(c, 'glass'), 'stroke="' + url(c, 'rim') + '" stroke-width="6"');
      s += path('M44 110 L70 83 L92 99 L120 59', 'none', 'stroke="' + c.p.main + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"');
      s += circle(49, 57, 11, c.p.mid);
    }
    return g(s, 'translate(' + x + ' ' + y + ') scale(' + sc + ')', shadow(c));
  }
  function review(c) {
    var names = ['후기', '핵심 인용', '이야기', '사례'];
    var desc = ['원문 확인', '한 문장 선택', '맥락 연결', '근거와 결과'];
    var ik = ['star', 'comment', 'document', 'case'];
    var s = '';
    if (c.tall) {
      var rowGap = 25, cardH = (c.body.h - 80 - 3 * rowGap) / 4;
      var lastCenter = c.body.y + 3 * (cardH + rowGap) + cardH / 2;
      s += line(170, c.body.y + cardH / 2, 170, lastCenter, '#B6C9DC', 20, 'stroke-linecap="round"');
      s += line(164, c.body.y + cardH / 2, 164, lastCenter, '#FFFFFF', 7, 'stroke-linecap="round" opacity="0.95"');
      [0, 1, 2, 3].forEach(function (i) {
        var y = c.body.y + i * (cardH + rowGap);
        s += glass(c, 286, y, 650, cardH, 29);
        s += icon(c, ik[i], 82, y + (cardH - 176) / 2, 176);
        s += txt(326, y + cardH / 2 - 10, '0' + (i + 1) + '  ' + names[i], 44, '#263D5B', 800);
        s += txt(326, y + cardH / 2 + 49, desc[i], 40, '#738299', 550);
      });
      s += txt(72, c.body.y + c.body.h - 10, '댓글 내용이 아닌 정보 흐름의 배치 도식', 32, '#728196', 500);
    } else {
      var gap = c.body.w / 4, iconSize = c.character ? 190 : 225;
      var firstX = c.body.x + gap / 2, lastX = c.body.x + 3.5 * gap;
      s += line(firstX, 618, lastX, 618, '#B6C9DC', 22, 'stroke-linecap="round"');
      s += line(firstX, 611, lastX, 611, '#FFFFFF', 8, 'stroke-linecap="round" opacity="0.96"');
      [0, 1, 2, 3].forEach(function (i) {
        var center = c.body.x + gap * (i + 0.5);
        s += icon(c, ik[i], center - iconSize / 2, 330, iconSize);
        s += line(center, 330 + iconSize + 15, center, 605, '#9FB1C7', 2);
        s += circle(center, 618, 16, '#EAF6FF', 'stroke="' + c.p.mid + '" stroke-width="3"');
        s += txt(center, 699, '0' + (i + 1) + '  ' + names[i], 38, '#2A4262', 800, 'middle');
        s += txt(center, 756, desc[i], 30, '#7C899B', 550, 'middle');
      });
      s += txt(96, 824, '댓글 원문은 실제 자료에서 연결 · 이 화면은 정보 흐름의 배치 도식', 27, '#738399', 500);
    }
    return s;
  }

  function render(host, options) {
    if (!host || typeof host.replaceChildren !== 'function') throw new TypeError('StatsPreview.render: a DOM host element is required.');
    options = options || {};
    var kind = kinds.indexOf(options.kind) >= 0 ? options.kind : 'map';
    var orientation = options.orientation === 'tall' ? 'tall' : 'wide';
    var palette = ['reference', 'blue', 'lime'].indexOf(options.palette) >= 0 ? options.palette : 'reference';
    var colorKey = palette === 'reference' ? (['map', 'growth', 'pie_glass'].indexOf(kind) >= 0 ? 'orange' : 'blue') : palette;
    var c = { id: 'sp-' + (++serial), kind: kind, palette: palette, tall: orientation === 'tall', character: options.character === true, p: palettes[colorKey] };
    c.w = c.tall ? 1080 : 1920;
    c.h = c.tall ? 1920 : 1080;
    c.stats = c.tall ? {x:72,y:160,w:864,h:1320} : {x:96,y:64,w:1728,h:800};
    c.source = c.tall ? {x:72,y:1496,w:864,h:76} : {x:96,y:876,w:1728,h:42};
    c.caption = c.tall ? {x:72,y:1596,w:864,h:164} : {x:96,y:940,w:1728,h:100};
    c.characterRect = c.tall ? {x:72,y:1320,w:864,h:140} : {x:1524,y:310,w:300,h:460};
    c.body = c.tall ? {x:72,y:330,w:864,h:c.character ? 970 : 1130} : {x:96,y:270,w:c.character ? 1388 : 1728,h:560};
    var drawings = { map: map, growth: growth, pie_glass: function (ctx) { return pie(ctx, false); }, pie_glow: function (ctx) { return pie(ctx, true); }, funnel: funnel, bars: bars, review: review };
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('xmlns', NS);
    svg.setAttribute('viewBox', '0 0 ' + c.w + ' ' + c.h);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', c.id + '-title ' + c.id + '-description');
    svg.setAttribute('font-family', 'Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif');
    svg.innerHTML = '<title id="' + c.id + '-title">' + esc(titles[kind][0]) + ' — ' + (c.tall ? '세로' : '가로') + ' 디자인 배치 예시</title><desc id="' + c.id + '-description">실제 통계가 아닌 교육용 예시. 출처 영역과 하단 주자막 영역을 분리한 정적 SVG 구성입니다.</desc>' + defs(c) + frame(c, drawings[kind](c));
    host.classList.add('stats-preview-frame');
    host.dataset.orientation = orientation;
    host.dataset.kind = kind;
    host.dataset.palette = palette;
    host.replaceChildren(svg);
    return svg;
  }
  global.StatsPreview = Object.freeze({ render: render, kinds: Object.freeze(kinds.slice()), demoData: demo, version: '1.1.0' });
})(typeof window === 'undefined' ? globalThis : window);
