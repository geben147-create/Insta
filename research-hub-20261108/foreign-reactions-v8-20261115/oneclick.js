/* EP01-10 one-click complete video edit handoff for Codex / Claude. */
(function(){
'use strict';
const episode = document.body && document.body.getAttribute('data-episode');
if (!/^\d{2}$/.test(episode || '')) return;
const script = document.currentScript;
const root = new URL('./', script && script.src ? script.src : location.href);
const fileName = 'EP' + episode + '_EDIT_MASTER.md';
const packageURL = new URL('handoff/' + fileName, root);
const githubURL = 'https://github.com/geben147-create/Insta/blob/main/research-hub-20261108/foreign-reactions-v8-20261115/handoff/' + fileName;
const header = document.querySelector('.headerlinks') || document.querySelector('.global-actions') || document.querySelector('.topright');
if (!header) return;

const style = document.createElement('style');
style.textContent = [
'.oneclick-group{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap;margin-left:6px}',
'.oneclick-primary{background:linear-gradient(115deg,#2a7865,#266e4e)!important;border:1px solid #a2efd2!important;color:#fff9d5!important;font-weight:900!important;box-shadow:0 3px 13px #0003}',
'.oneclick-secondary{background:#5b4030!important;border:1px solid #c3a16b!important;color:#ffedd0!important;font-weight:800!important}',
'.oneclick-primary:disabled{opacity:.55;cursor:wait}',
'.oneclick-status{font-size:10px;color:#a9e5cf;max-width:250px;line-height:1.4}',
'.oneclick-status.err{color:#ffb6ad}',
'.oneclick-mini{color:#b7dfef!important;font-size:11px;text-decoration:underline!important}',
'@media(max-width:760px){.oneclick-group{width:100%;margin:3px 0}.oneclick-group button{font-size:11px;padding:7px}.oneclick-status{max-width:none}}'
].join('');
document.head.appendChild(style);

const group = document.createElement('span');group.className='oneclick-group';
const copyButton = document.createElement('button');copyButton.className='oneclick-primary';copyButton.type='button';copyButton.disabled=true;copyButton.textContent='📋 전체 편집지시 불러오는 중';
copyButton.title='대본·훅·원본 자막·원본 분초·32컷 편집표·음향/폰트·V4형 검수 기준 전부 한 번에 복사';
const linkButton = document.createElement('button');linkButton.className='oneclick-secondary';linkButton.type='button';linkButton.textContent='🔗 링크 1개 복사';linkButton.title='클로드/코덱스에 전달할 GitHub 통합 지시서 링크 하나만 복사';
const view = document.createElement('a');view.className='oneclick-mini';view.href=githubURL;view.target='_blank';view.rel='noopener';view.textContent='📄 원문';
const status = document.createElement('span');status.className='oneclick-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
group.append(copyButton,linkButton,view,status);
header.appendChild(group);
let packageText=null;
function feedback(message,failed){
status.textContent=message;status.classList.toggle('err',!!failed);
}
const ready=fetch(packageURL.toString(),{cache:'no-store'})
 .then(function(response){if(!response.ok)throw Error('패키지 HTTP '+response.status);return response.text();})
 .then(function(content){
 if(!content || !content.includes('전체') || !content.includes('원본'))throw Error('패키지가 올바르지 않습니다');
 packageText=content;
 copyButton.disabled=false;
 copyButton.textContent='📋 대본+영상편집 전체 복사';
 feedback('EP'+episode+' 편집지시서 '+content.length.toLocaleString('ko-KR')+'자 준비됨',false);
 return content;
 })
 .catch(function(err){
 copyButton.disabled=false;
 copyButton.textContent='📋 전체 편집지시 다시 불러오기';
 feedback('GitHub 배포 확인 필요: '+String(err.message||err),true);
 return null;
 });
function currentLocalChanges(){
 try{const edits=JSON.parse(localStorage.getItem('frv8-edits-'+episode)||'{}');
 const rows=Object.entries(edits).filter(function(r){return /^\d+$/.test(r[0]) && typeof r[1]==='string'});
 if(!rows.length)return '';
 return '\n\n---\n## ⚠️ 현재 브라우저에서 수정한 대본 (GitHub 원본보다 우선 적용)\n\n'+
 rows.map(function(x){return '### CUT '+(Number(x[0])+1)+' 변경본\n'+x[1];}).join('\n\n')+
 '\n\n**주의:** 위 문단은 이 브라우저의 로컬 수정값입니다. 단일 GitHub 링크에는 이 변경이 자동 저장되지 않습니다.\n';
 }catch(_){return '';}
}
function legacyCopy(text){
 const area=document.createElement('textarea');area.value=text;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.focus();area.select();
 try{const success=document.execCommand('copy');if(!success)throw Error('복사 거부');return true;}catch(_){return false;}finally{area.remove();}
}
function copyNow(text,ok){
 // Make the clipboard operation directly in the click handler, without awaiting a fetch.
 if(navigator.clipboard && navigator.clipboard.writeText){
   navigator.clipboard.writeText(text).then(function(){feedback(ok,false);}).catch(function(){
      if(legacyCopy(text))feedback(ok,false);
      else feedback('자동 복사가 제한되었습니다. 옆 📄 원문에서 전체 선택 후 복사해 주세요.',true);
   });
 } else if(legacyCopy(text)){feedback(ok,false);}
 else feedback('이 브라우저에서 복사가 제한됩니다. 📄 원문을 사용하세요.',true);
}
copyButton.addEventListener('click',function(){
 if(packageText){
   const content=packageText+currentLocalChanges();
   copyNow(content,'✅ 편집 패키지 '+content.length.toLocaleString('ko-KR')+'자 전체 복사됨. Claude/Codex에 붙여넣으세요.');
 } else {
   feedback('GitHub 파일 확인 중입니다. 링크 1개 복사는 바로 가능합니다.',true);
   fetch(packageURL.toString(),{cache:'no-store'}).then(function(r){if(!r.ok)throw Error('HTTP '+r.status);return r.text();}).then(function(v){packageText=v;copyButton.textContent='📋 대본+영상편집 전체 복사';feedback('준비됨. 다시 누르면 복사합니다.',false);}).catch(function(e){feedback('패키지 조회 실패: '+e.message,true);});
 }
});
linkButton.addEventListener('click',function(){
 copyNow(githubURL,'✅ EP'+episode+' 전체 영상편집 지시서 GitHub 링크 1개 복사됨.');
});
// Page navigation remains available if a reader/agent blocks clipboard.
window.__V8_HANDOFF_META__={episode:episode,packageURL:packageURL.toString(),githubURL:githubURL};
})();
