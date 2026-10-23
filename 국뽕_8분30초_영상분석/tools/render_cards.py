"""키워드 카드(CARD)와 클립 위 자막 오버레이(CLIP)를 PNG로 만든다. 형광 파랑 + 형광 빨강, Pretendard."""
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

from common import SECTION_LABEL, parse_rows

W_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_BOLD = os.path.join(W_DIR, "font", "Pretendard-Bold.otf")
FONT_XB = os.path.join(W_DIR, "font", "Pretendard-ExtraBold.otf")
OUT_CARDS = os.path.join(W_DIR, "cards")
OUT_OV = os.path.join(W_DIR, "overlays")

W, H = 1920, 1080
N = 102
BG = (11, 11, 18)
BLUE = (0, 183, 255)
RED = (255, 31, 75)
WHITE = (255, 255, 255)
SEPS = {"·", "→", "=", "<", ">", "×", ","}
MARGIN = 96
TEXT_MAX_W = 1560


def font(path, size):
    return ImageFont.truetype(path, size)


def split_tokens(kw):
    return kw.split(" ")


def emphasis_index(toks):
    digit = [i for i, t in enumerate(toks) if any(c.isdigit() for c in t)]
    if digit:
        return max(digit, key=lambda i: (len(toks[i]), -i))
    words = [i for i, t in enumerate(toks) if t not in SEPS]
    return words[-1]


def layout(toks, fpath, max_w, sizes):
    """가장 큰 글자 크기에서 1줄 또는 2줄로 들어가는 배치를 찾는다."""
    for size in sizes:
        f = font(fpath, size)
        sp = f.getlength(" ")
        widths = [f.getlength(t) for t in toks]

        def line_w(a, b):
            return sum(widths[a:b]) + sp * (b - a - 1)

        if line_w(0, len(toks)) <= max_w:
            return size, [(0, len(toks))]
        best = None
        for k in range(1, len(toks)):
            m = max(line_w(0, k), line_w(k, len(toks)))
            if best is None or m < best[0]:
                best = (m, k)
        if best and best[0] <= max_w:
            return size, [(0, best[1]), (best[1], len(toks))]
    size = sizes[-1]
    return size, [(0, len(toks))]


def draw_tokens(draw, toks, ranges, f, x_center, y_top, line_h, emph, base_color,
                mode="center", emph_color=RED, sep_color=(255, 255, 255)):
    sp = f.getlength(" ")
    for li, (a, b) in enumerate(ranges):
        widths = [f.getlength(t) for t in toks[a:b]]
        total = sum(widths) + sp * (b - a - 1)
        x = x_center - total / 2 if mode == "center" else x_center
        y = y_top + li * line_h
        for j, t in enumerate(toks[a:b]):
            idx = a + j
            if idx == emph and len(toks) > 1:
                color = emph_color
            elif t in SEPS:
                color = sep_color
            else:
                color = base_color
            draw.text((x, y), t, font=f, fill=color)
            x += widths[j] + sp


def chrome(draw, n, section, on_video=False):
    """상단 챕터 칩 + 하단 진행 바."""
    label = SECTION_LABEL[section]
    f = font(FONT_BOLD, 34)
    tw = f.getlength(label)
    box = (MARGIN - 20, 52, MARGIN + 44 + tw + 20, 52 + 66)
    if on_video:
        draw.rounded_rectangle(box, radius=10, fill=(8, 8, 14, 205))
    draw.rectangle((MARGIN, 52 + 24, MARGIN + 18, 52 + 24 + 18), fill=RED)
    draw.text((MARGIN + 36, 52 + 14), label, font=f, fill=(255, 255, 255))
    y0, y1 = 1020, 1028
    if on_video:
        draw.rectangle((0, 1004, W, H), fill=(8, 8, 14, 170))
    draw.rectangle((MARGIN, y0, W - MARGIN, y1), fill=(255, 255, 255, 46) if on_video else (60, 60, 72))
    fill_x = MARGIN + (W - 2 * MARGIN) * n / N
    draw.rectangle((MARGIN, y0, fill_x, y1), fill=BLUE)
    draw.rectangle((fill_x - 6, y0 - 4, fill_x, y1 + 4), fill=RED)


def _rect(draw, x0, y0, x1, y1, fill):
    draw.rectangle((min(x0, x1), min(y0, y1), max(x0, x1), max(y0, y1)), fill=fill)


def brackets(draw):
    L, T, m = 90, 6, 48
    for (x, y, dx, dy) in ((m, m, 1, 1), (W - m, H - m, -1, -1)):
        _rect(draw, x, y, x + dx * L, y + dy * T, BLUE)
        _rect(draw, x, y, x + dx * T, y + dy * L, BLUE)
    for (x, y, dx, dy) in ((W - m, m, -1, 1), (m, H - m, 1, -1)):
        _rect(draw, x, y, x + dx * L, y + dy * T, RED)
        _rect(draw, x, y, x + dx * T, y + dy * L, RED)


def background():
    img = Image.new("RGB", (W, H), BG)
    layer = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((1500 - 560, 80 - 560, 1500 + 560, 80 + 560), fill=(0, 74, 104))
    d.ellipse((240 - 480, 1000 - 480, 240 + 480, 1000 + 480), fill=(86, 12, 28))
    layer = layer.filter(ImageFilter.GaussianBlur(170))
    img = ImageChops.add(img, layer)
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    g = ImageDraw.Draw(grid)
    for x in range(0, W, 120):
        g.line((x, 0, x, H), fill=(255, 255, 255, 9), width=1)
    for y in range(0, H, 120):
        g.line((0, y, W, y), fill=(255, 255, 255, 9), width=1)
    img = Image.alpha_composite(img.convert("RGBA"), grid)
    return img


def render_card(r):
    toks = split_tokens(r["kw"])
    emph = emphasis_index(toks)
    size, ranges = layout(toks, FONT_XB, TEXT_MAX_W, list(range(200, 89, -6)))
    f = font(FONT_XB, size)
    line_h = int(size * 1.2)
    block_h = line_h * len(ranges)
    y_top = (H - block_h) / 2 - 20

    img = background()
    # 네온 글로
    glow = Image.new("RGB", (W, H), (0, 0, 0))
    gd = ImageDraw.Draw(glow)
    draw_tokens(gd, toks, ranges, f, W / 2, y_top, line_h, emph, (0, 120, 170),
                emph_color=(150, 20, 48), sep_color=(90, 90, 90))
    glow = glow.filter(ImageFilter.GaussianBlur(26))
    base = ImageChops.add(img.convert("RGB"), glow).convert("RGBA")
    d = ImageDraw.Draw(base)
    draw_tokens(d, toks, ranges, f, W / 2, y_top, line_h, emph, BLUE)
    if len(toks) == 1:
        d.rectangle((W / 2 - 110, y_top + block_h + 26, W / 2 + 110, y_top + block_h + 36), fill=RED)
    brackets(d)
    chrome(d, r["no"], r["section"])
    return base.convert("RGB")


def render_overlay(r):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    chrome(d, r["no"], r["section"], on_video=True)
    if r["kw"]:
        toks = split_tokens(r["kw"])
        emph = emphasis_index(toks)
        f = font(FONT_XB, 78)
        sp = f.getlength(" ")
        total = sum(f.getlength(t) for t in toks) + sp * (len(toks) - 1)
        x0, y0 = MARGIN, 770
        bw, bh = total + 110, 150
        d.rectangle((x0, y0, x0 + bw, y0 + bh), fill=(8, 8, 14, 205))
        d.rectangle((x0, y0, x0 + 14, y0 + bh), fill=BLUE)
        draw_tokens(d, toks, [(0, len(toks))], f, x0 + 52, y0 + 28, 0, emph, BLUE, mode="left")
    return ov


def main():
    os.makedirs(OUT_CARDS, exist_ok=True)
    os.makedirs(OUT_OV, exist_ok=True)
    only = {int(a) for a in sys.argv[1:]}
    for r in parse_rows():
        if only and r["no"] not in only:
            continue
        if r["kind"] == "CARD":
            render_card(r).save(os.path.join(OUT_CARDS, f"{r['no']:03d}.png"))
        else:
            render_overlay(r).save(os.path.join(OUT_OV, f"{r['no']:03d}.png"))
    print("rendered", len(os.listdir(OUT_CARDS)), "cards", len(os.listdir(OUT_OV)), "overlays")


if __name__ == "__main__":
    main()
