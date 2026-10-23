"""공개판 폴더의 마크다운을 모아 한 페이지(index.html)로 만든다. 사용법: python build_page.py <폴더>"""
import pathlib
import re
import sys

import markdown

base = pathlib.Path(sys.argv[1])


def md(name):
    text = (base / name).read_text(encoding="utf-8")
    h = markdown.markdown(text, extensions=["tables", "fenced_code"])
    return h.replace("<table>", '<div class="tw"><table>').replace("</table>", "</table></div>")


tools = sorted(p.name for p in (base / "tools").iterdir() if p.is_file())
tool_html = "<h1>제작 도구</h1><p>제작에 쓴 스크립트입니다. 경로가 작성 PC 기준으로 박혀 있어 그대로 돌리기보다 참고용입니다.</p><ul>" + "".join(
    f'<li><a href="tools/{n}">{n}</a></li>' for n in tools
) + "</ul>"

PAGE = """<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>국뽕 8분 30초 영상 분석</title><style>
:root{--bg:#0d0f14;--panel:#151922;--line:#2a3142;--tx:#e8ecf4;--mut:#9aa4b8;--acc:#ff4d6d;--blue:#00b7ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);font-family:"Pretendard","Malgun Gothic",system-ui,sans-serif;line-height:1.65}
.wrap{max-width:980px;margin:0 auto;padding:24px 16px 80px}
h1{font-size:26px;margin:.6em 0 .4em}h2{font-size:20px;margin:1.6em 0 .5em;color:var(--blue)}h3{font-size:17px}
a{color:var(--blue)}a:hover{color:var(--acc)}
.top a.back{color:var(--mut);text-decoration:none;font-size:14px}
nav{position:sticky;top:0;background:var(--bg);padding:10px 0;display:flex;gap:8px;flex-wrap:wrap;z-index:2;border-bottom:1px solid var(--line)}
nav button{background:var(--panel);color:var(--tx);border:1px solid var(--line);border-radius:999px;padding:8px 16px;font:inherit;font-weight:700;cursor:pointer}
nav button.on{border-color:var(--acc);color:var(--acc)}
.panel{display:none}.panel.on{display:block}
.tw{overflow-x:auto;margin:12px 0}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border:1px solid var(--line);padding:7px 10px;text-align:left;vertical-align:top}
th{background:var(--panel);white-space:nowrap}
pre{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;overflow-x:auto;position:relative;font-size:13px;line-height:1.55}
code{font-family:ui-monospace,Consolas,monospace}
p code,li code,td code{background:var(--panel);padding:1px 5px;border-radius:5px}
.cp{position:absolute;top:8px;right:8px;background:var(--acc);color:#fff;border:0;border-radius:8px;padding:5px 10px;font:inherit;font-size:12px;font-weight:700;cursor:pointer}
.bar{display:flex;gap:8px;margin:10px 0;flex-wrap:wrap}.bar button{background:var(--acc);color:#fff;border:0;border-radius:10px;padding:9px 14px;font:inherit;font-weight:700;cursor:pointer}
.note{color:var(--mut);font-size:14px}
</style></head><body><div class="wrap">
<div class="top"><a class="back" href="../">← Insta 영상 분석 모음</a></div>
<h1>국뽕 8분 30초 영상 분석</h1>
<p class="note">외국이 직접 매긴 점수만 모아 "왜 한국이 연달아 터졌나"를 푸는 해설 영상. 원본 영상·완성본·자막 원문·음성은 저작권과 개인정보 때문에 올리지 않았습니다.</p>
<nav id="nav"><button data-p="sum" class="on">요약·정정</button><button data-p="script">대본 102컷</button><button data-p="orig">독창성 측정</button><button data-p="desc">설명란 초안</button><button data-p="tools">제작 도구</button></nav>
<section class="panel on" id="sum">{{SUM}}</section>
<section class="panel" id="script"><div class="bar"><button id="copyNar">나레이션만 전체 복사</button></div>{{SCRIPT}}</section>
<section class="panel" id="orig">{{ORIG}}</section>
<section class="panel" id="desc">{{DESC}}</section>
<section class="panel" id="tools">{{TOOLS}}</section>
</div>
<script>
const btns=[...document.querySelectorAll('#nav button')],panels=[...document.querySelectorAll('.panel')];
function show(id){btns.forEach(b=>b.classList.toggle('on',b.dataset.p===id));panels.forEach(p=>p.classList.toggle('on',p.id===id));try{history.replaceState(null,'','#'+id)}catch(e){}}
btns.forEach(b=>b.onclick=()=>show(b.dataset.p));
if(location.hash&&document.getElementById(location.hash.slice(1)))show(location.hash.slice(1));
function copy(t,el,label){const done=()=>{const o=el.textContent;el.textContent='복사됨';setTimeout(()=>el.textContent=o,1200)};
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done,()=>fb(t,done))}else fb(t,done)}
function fb(t,done){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');done()}catch(e){}a.remove()}
document.querySelectorAll('pre').forEach(pre=>{const b=document.createElement('button');b.className='cp';b.textContent='복사';b.onclick=()=>copy(pre.innerText.replace(/\\n복사$/,''),b);pre.appendChild(b)});
document.getElementById('copyNar').onclick=e=>{const rows=[...document.querySelectorAll('#script tbody tr')];
 copy(rows.map(r=>r.cells[r.cells.length-1].textContent.trim()).join('\\n'),e.target)};
</script></body></html>"""

sum_html = md("README.md") + "<hr>" + md("작업요약.md")
out = (
    PAGE.replace("{{SUM}}", sum_html)
    .replace("{{SCRIPT}}", md("대본_국뽕_8분30초.md"))
    .replace("{{ORIG}}", md("독창성_측정.md"))
    .replace("{{DESC}}", md("설명란_출처.md"))
    .replace("{{TOOLS}}", tool_html)
)
(base / "index.html").write_text(out, encoding="utf-8")
print("index.html", len(out.encode("utf-8")), "bytes")
