# REF08–24 · 기존 GitHub 디자인 허브 소스 감사

감사 기준 커밋: `6b91d1f82d2d2dfc181ab4c8acba11806412ef7b`. 이전 `afbaeea38ea78804b5ba4d1e5dfde4950e7e0090`에서 관련 허브/방송 디자인 폴더 변경 없음. 저장소는 읽기만 수행했다.

## 핵심 결론

**색상 지시가 없어서만 생긴 문제가 아니다. 레퍼런스 카드가 정확한 자막 프리셋 대신 범용 프리셋을 적용하고, 설명에 쓴 색과 실제 레이어 기본색이 다른 경우가 소스에서 확인된다.** 다만 실제 51~54편 MP4 및 render_v8_page.js는 확인하지 않았으므로 그 파일들의 직접 원인 또는 수정 완료라고 말할 수 없다.

| 항목 | 소스에서 확인한 사실 | 적용 방향 |
|---|---|---|
| F01 T07 레퍼런스 적용 버튼은 전용 자막의 정확한 색을 전달하지 않는다 | 영상편집 디자인 실험실은 T07 사진을 keyword 범용 프리셋에 연결하고 applyRef에서 #FF4545를 다시 지정한다. 전용 8종 자막 편집기는 T07 강조 #E03C3E, 흰색 #FDFDFC, 외곽선/그림자 0을 지정한다. | 같은 T07 사진을 보고 적용해도 서로 다른 화면으로 나오는 구조적 원인이 소스에 있다. |
| F02 T04 재능이 없는 선수도 다른 프리셋에 연결된다 | video-edit-lab의 T04는 quote로 연결된다. quote의 기본 강조는 #FFE14D, font=system이다. T04 전용 자막은 #E25254→#F26163 그라데이션과 티몬 몬소리/도현/검은고딕 후보를 쓴다. applyRef에는 T04 전용 색상 재설정이 없다. | 기울인 강조 사진을 눌러도 색/서체/문구 구성이 보존되지 않는다. |
| F03 구형 NO 썸네일 실험실 안에서도 설명과 실제 layer 색이 다르다 | 설명/spec은 NO #F22B15→#C30E0C, 하단 #FFE713. 실제 PRESETS.layers는 NO #FF6820→#E6090C, 하단 #FFF55C→#EBA400이다. | 문서에 HEX를 써두는 것만으로 화면 구현이 같아지지 않는 직접 사례다. |
| F04 T05 3폰트 비교 사진과 현재 T05 7폰트 편집기는 다른 버전이다 | 정적 guide는 레코체/G마켓/평창평화 3후보와 이전 금빛 팔레트를 갖지만 editor.js는 T05를 mountGoldEditor로 교체한다. 현재 gold-renderer 기본은 검은고딕, #F9D56B/#FFF7B8/#F8DD78 + #3C280B/#D1A13B/#7B5019이며 7폰트 편집기를 쓴다. | REF20을 현재 화면의 유일한 토큰 출처로 단정하면 다시 색·폰트가 섞인다. 원본 사진/구형 재현값/현재 편집기/사용자 확정값을 구분해야 한다. |
| F05 T07 첫 선택 폰트는 티몬으로 고정되지 않는다 | guide의 T07 후보 순서는 검은고딕, 티몬 몬소리, SB 어그로이며 editor.js의 selected=0이다. 따라서 새로 여는 기본 선택은 검은고딕 후보다. T04는 티몬이 첫 후보다. | 사용자가 티몬을 확정했다면 default selected=0 관례 대신 명시적인 font token을 전달해야 한다. |
| F06 색상 모음은 서로 다른 역할의 목록이며 자동으로 편집기 전체를 지배하지 않는다 | PALETTE는 방송 캡처 근사값, PALETTE_OLD는 구형 실험실/편집기 값과 제안색이다. #E21317은 충격 박스, #B71512는 붉은 배경조명. #FFE94A에는 명시적으로 제안 표시가 있다. #F6FA55는 T08 모음 낱말만의 선택색으로 기록되어 있다. | 분홍 배지/인물 외곽광/박스/문구/그래프를 하나의 공통 강조색으로 병합하면 사용자 요구가 소실된다. |

## 사용자가 캡처한 메뉴 → 실제 소스

| 메뉴 | 허브 링크 | 실제 파일/함수 |
|---|---|---|
| 사용자 링크: 표정 19 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=faces) | `internal facesPage() in studio.js` |
| 색상 HEX 모음 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=palette) | `PALETTE + PALETTE_OLD in data.js` |
| 폰트 점검표 29종 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=fonts) | `fonts-audit.json via initFonts()` |
| 썸네일 레이어 실험실(구형) | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=layer) | `research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html` |
| 방송 글씨 8종·금빛 편집 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=typo) | `research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html` |
| 자막 글씨 8종·금빛 편집 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-video&sub=vtypo) | `research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html` |
| 영상편집 디자인 실험실 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-video&sub=vlab) | `research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html` |
| 장면별 연출 프리셋 | [열기](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-video&sub=vfx) | `media.js + studio.js vRender()` |

## 색상 코드와 역할

스크린샷/기존 코드의 역할을 유지한다. 목록에 존재한다는 사실이 모든 영상 장면에 공통 적용된다는 뜻은 아니다.

| HEX | 기록된 역할 | 코드 |
|---|---|---|
| `#FFE713` | 추격자 해외반응 노랑·금색 | `data.js:200` |
| `#C30E0C` | 썸네일 뒤 빨간색·인물 누끼 외곽광 | `data.js:200` |
| `#F000D0` | 이슈 PICK 형광 분홍 배지 | `data.js:200` |
| `#F01515` | 수능, 이대로 치르겠다고? 빨강 | `data.js:200` |
| `#F6FA55` | T08 모음 낱말만 노랑(RGB 246,250,85) | `data.js:200` |
| `#BCFF34` | 영상편집 형광연두 | `data.js:201` |
| `#FFE94A` | 공통 네온 노랑(제안) | `data.js:202` |
| `#78EDF5` | 강아지 하늘색 프레임 | `data.js:192` |
| `#F0F44C` | ㅋㅋㅋ 노랑 | `data.js:195` |
| `#B71512` | 충격 배경 붉은 조명 | `data.js:197` |
| `#F22B15` | NO!! 빨강 그라데이션 | `data.js:200` |
| `#FFED00` | 경고 테두리 노랑·검정 45° 사선 | `data.js:200` |
| `#39D5FF` | 영상편집 파랑 | `data.js:201` |
| `#E21317` | 충격 박스 빨강 | `data.js:197` |

**전사 정정:** NO 코드는 `#F22B15`. `#F22115`는 감사 초기 전사 오류이며 사용자 지시 간 충돌이 아니다. `#E21317`(박스)와 `#B71512`(배경조명)도 서로 다른 역할이다.

## 자막 전용 구현과 구형 실험실의 차이

| 스타일 | 전용 구현 | 구형 실험실 버튼 동작 |
|---|---|---|
| T07 풀 파티 | `#E03C3E`, 흰색 `#FDFDFC`, 외곽선/그림자 0. 후보 검은고딕·티몬·SB 어그로, 초기 선택 0(검은고딕). | `keyword` 프리셋 → `#FF4545` 재지정. 잘난고딕 계열 기본을 받음. |
| T04 재능이 없는 선수 | `#E25254 → #F26163`, 티몬·도현·검은고딕 후보, 라벨 포함. | `quote` 프리셋 → `#FFE14D`, system 폰트. T04 색상 재지정 없음. |
| T02 NO | 전용 비교 `#E8451A → #E2170E`; 한글은 잘난체 고정, 영문 NO만 Bangers/Anton/Bebas 후보. | 구형 NO 설명 `#F22B15 → #C30E0C`; 실제 레이어는 `#FF6820 → #E6090C`. |
| T05 금빛(REF20 구형) | `#F6CB52 / #FCEC82 / #F2CF5C`, 레코체·G마켓·평창평화 3후보. | 이 정적 편집기는 현재 T05 실행 경로에서 mountGoldEditor로 교체됨. |
| T05 금빛(현재) | `#F9D56B / #FFF7B8 / #F8DD78`, 외곽 `#3C280B / #D1A13B`, 그림자 `#7B5019`. 검은고딕 기본, 7후보. | 구형 video-edit-lab의 금빛 버튼은 또 다른 `#FFE173 / #F5BE22` 조합. |

폰트 후보와 방송 원본 폰트는 같은 개념이 아니다. 이 감사는 방송 원본 글꼴을 확정하지 않는다. `fonts-audit.json` 29개 기록은 사용자 컴퓨터의 과거 파일 목록이며, 현재 브라우저에서 실제 로딩되었다는 증거가 아니다. 현재 T05 편집기에는 명시적 폰트 로딩 검사 및 실패 시 PNG 저장 차단 코드가 있으나 이번 감사에서는 실행하지 않았다.

## 최소 통합 연결

새 통합 문서 폴더: `research-hub-20261108/kukppong-v4-claude/design-reference-master-20261124/`. 기존 `data.js`의 `MENUS.thumb`와 `MENUS.video`에 각각 아래 항목 하나를 추가하면 된다. 다른 편집기·라우터 변경은 필요 없다.

```js
{ id:'design-reference',
  t:'통합 디자인 자료 · REF01–24',
  s:'색·폰트·지도·댓글·캐릭터', tag:'new',
  f:'../../research-hub-20261108/kukppong-v4-claude/design-reference-master-20261124/' },
```

- [새 메뉴 경로](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-thumb&sub=design-reference)
- [새 메뉴 경로](https://geben147-create.github.io/Insta/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/?page=studio-video&sub=design-reference)

근거: `studio.js:62–69`의 m.f iframe 분기, `studio.js:46–59`의 sub 상태 전달, 허브 `index.html:53–54,63`의 tab/sub 경로와 postMessage 동기화. 새 id는 허용 정규식에 맞는다.

## 구현을 바꿀 때 권고

- 🌸 원본 참고/기존 정리/사용자 확정/새 제안을 별도 provenance로 저장하고 장면별 토큰과 실제 구현을 같은 데이터에서 생성한다.
- 🌸 T07/T04 적용은 generic preset 색을 쓰지 말고 사용자 확정 스타일 ID와 명시 HEX/폰트 ID를 전달한다. 외곽선·그림자·레이블·효과도 함께 전달한다.
- 🌸 T05 구형·현재 팔레트는 두 개의 버전으로 보존한다. 현재 사용자가 고른 값이 결정되기 전 자동 통합하지 않는다.
- 🌸 기존 HTML 도구는 보존하고 새 통합 문서 링크만 양쪽 메뉴에 추가한다.
- 🌸 현재 MP4에서의 색/프레임/자막 중복/끊김 완료 여부는 실제 renderer와 출력 파일을 확보한 뒤 별도 검수 상태로 표시한다.

## 상세 증거

### F01 · T07 레퍼런스 적용 버튼은 전용 자막의 정확한 색을 전달하지 않는다

영상편집 디자인 실험실은 T07 사진을 keyword 범용 프리셋에 연결하고 applyRef에서 #FF4545를 다시 지정한다. 전용 8종 자막 편집기는 T07 강조 #E03C3E, 흰색 #FDFDFC, 외곽선/그림자 0을 지정한다.

범위: 실제 51~54편 MP4가 이 코드를 사용했는지는 미확인.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 267

```text
267: ['R07_red_flash.jpg','T07 빨간 번개','짧은 감탄·반전 단어만 ⚡','keyword'],
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 256

```text
256: keyword:{name:'⚡ 핵심어 자막',text:'이게 바로|진짜 반전!',key:'반전',size:142,tracking:-3,primary:'#ffffff',accent:'#ff4545',lines:'2',font:'jalnan',textStyle:'basic',mark:'lightning',animation:'pop',position:'bottom',border:12,strokeColor:'#11141b',shadow:10,shadowColor:'#000000',cardColor:'#111b2b',cardAlpha:88,hint:'불꽃·번개·밑줄은 전체 화면이 아니라 강조할 1개 단어 위에만 올립니다.'},
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 368

```text
368: function applyRef(i){const ref=refs[i];if(!ref)return;setMode(ref[3]);if(i===1){setField('textStyle','gold');setField('primary','#ffe173');setField('accent','#f5be22');setField('strokeColor','#4a2a00');setField('animation','zoom');setField('text','병현표|특급 서비스');setField('key','특급');setField('mark','star')}if(i===2){setField('mark','lightning');setField('accent','#ff4545')}if(i===3){setField('font','brush');setField('textStyle','basic')}if(i===5){setField('boxType','이슈 PICK');setField('accent','#ff43b0')}if(i===6){setField('accent','#ffe600')}if(i===7){setField('text','한국을 보고|충격에 빠졌다!');setField('accent','#ff4545')}render(true);document.getElementById('workbench').scrollIntoView({behavior:'smooth'});notify(ref[1]+' 디자인 적용됨. 아래에서 세부 값을 바꿀 수 있습니다.')}
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 60–62

```text
60:     T07: {size:38, spacing:-1, slant:0, tilt:0, fit:6.8, align:"left", stroke:0, outer:0, shadow:0, blur:0, effect:"lightning", effectInline:"last", minor:true,
61:       colors:[["base","흰 글씨(외곽선 없음)","#FDFDFC"],["color","빨강 강조","#E03C3E"],["edge","외곽선(원본 없음·켤 때만)","#1C1717"],["shade","그림자(원본 없음)","#000000"],["bolt","번개 빨강(PNG)","#D94B50"],["bg","원본 배경","#1C222E"]],
62:       lines:[{fill:"base", scale:.55, indent:1.9},{fill:"base", words:[["풀 파티","color"]]}]},
```

### F02 · T04 재능이 없는 선수도 다른 프리셋에 연결된다

video-edit-lab의 T04는 quote로 연결된다. quote의 기본 강조는 #FFE14D, font=system이다. T04 전용 자막은 #E25254→#F26163 그라데이션과 티몬 몬소리/도현/검은고딕 후보를 쓴다. applyRef에는 T04 전용 색상 재설정이 없다.

범위: 프리셋 버튼 동작을 소스에서 추적한 결과이며 실제 브라우저 사용자 저장값은 읽지 않았다.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 252

```text
252: quote:{name:'💬 실제 외국인 반응',text:'솔직히 한국은 정말 놀랍다.|이런 나라는 처음 봐!',key:'놀랍',size:104,tracking:0,primary:'#111827',accent:'#ffe14d',lines:'2',font:'system',textStyle:'basic',mark:'underline',animation:'pop',position:'middle',border:0,strokeColor:'#ffffff',shadow:0,shadowColor:'#000000',cardColor:'#ffffff',cardAlpha:97,hint:'댓글 카드: 아바타·닉네임·국기·원문 + 한국어 번역 + 좋아요. 실제로 달린 댓글만 옮기고 출처를 남기세요(허구 반응 생성 금지).'},
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 269

```text
269: ['R04_broadcast_assertive.jpg','T04 기울인 강조','감정이 실린 실제 발언·결론','quote'],
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 309

```text
309: function setMode(m){if(!preset[m])return;mode=m;const p=preset[m];Object.keys(p).forEach(k=>{if(FIELDS[k])setField(k,p[k])});el('modeHint').textContent=p.hint;document.querySelectorAll('.chip').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===m)));document.querySelectorAll('details[data-for-mode]').forEach(d=>{d.open=d.dataset.forMode.split(' ').includes(m)});render(true)}
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 368

```text
368: function applyRef(i){const ref=refs[i];if(!ref)return;setMode(ref[3]);if(i===1){setField('textStyle','gold');setField('primary','#ffe173');setField('accent','#f5be22');setField('strokeColor','#4a2a00');setField('animation','zoom');setField('text','병현표|특급 서비스');setField('key','특급');setField('mark','star')}if(i===2){setField('mark','lightning');setField('accent','#ff4545')}if(i===3){setField('font','brush');setField('textStyle','basic')}if(i===5){setField('boxType','이슈 PICK');setField('accent','#ff43b0')}if(i===6){setField('accent','#ffe600')}if(i===7){setField('text','한국을 보고|충격에 빠졌다!');setField('accent','#ff4545')}render(true);document.getElementById('workbench').scrollIntoView({behavior:'smooth'});notify(ref[1]+' 디자인 적용됨. 아래에서 세부 값을 바꿀 수 있습니다.')}
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 44–49

```text
44:     T04: {size:38, spacing:-1.5, slant:0, tilt:-1.5, stretch:116, fit:5.6, align:"center", stroke:5, outer:0, shadow:2, blur:0, effect:"burst",
45:       word:"정말 연애에 재능이 없는 선수예요", badge:{text:"선수 박탈", stroke:false, left:"36%"},
46:       colors:[["base","흰 본문","#FDFDFD"],["color","빨강 강조(위)","#E25254"],["end","빨강 강조(아래)","#F26163"],["edge","검정 외곽선","#111114"],["shade","검정 그림자","#111114"],
47:         ["badgeBg","‘선수 박탈’ 박스","#040506"],["badgeInk","박스 글씨","#EFEFEF"],["bg","원본 배경","#2B2A2E"]],
48:       fills:{color:{grad:[["color",28],["end",62]]}},
49:       lines:[{fill:"base", words:[["재능이 없는 선수","color"]]}]},
```

### F03 · 구형 NO 썸네일 실험실 안에서도 설명과 실제 layer 색이 다르다

설명/spec은 NO #F22B15→#C30E0C, 하단 #FFE713. 실제 PRESETS.layers는 NO #FF6820→#E6090C, 하단 #FFF55C→#EBA400이다.

범위: NO #F22B15는 사용자 스크린샷과 코드가 일치한다. #F22115는 이번 감사 초기 전사 오류이며 사용자 요구 충돌이 아니다.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html) · line 129–133

```text
129: {id:'thriller',title:'🔥 NO!! 영화 해외반응',sub:'붉은 감탄사 + 금색 제목',ref:'R02_movie_chaser.jpg',description:'붉은 팝아트 NO!!는 독립된 기울임 텍스트 레이어. 하단 금색은 검정·빨강 외곽으로 깊이를 만듭니다.',spec:'NO!! 빨강 #F22B15 → #C30E0C, 검정 외곽 6px 안팎. 하단 노랑 #FFE713, 외곽 검정 8px+짙은 빨강 그림자. 상단 흰색+노랑 분리. 누끼 인물은 레드 림.',colors:[['NO 빨강','#F22B15'],['NO 어두운 빨강','#C30E0C'],['하단 노랑','#FFE713'],['검정 외곽','#130909'],['상단 흰색','#FFFFFF']],rim:'#F42D30',arrow:false,layers:[
130: L('over','상단 흰 글씨','18년 된 한국영화 보고',32,12,66,'black','#FFFFFF',null,6,'#3D0808',6,'#AB1716',-3),
131: L('reaction','상단 노란 강조','충격받은 외국인들',78,12,68,'black','#FFE713',null,5,'#270900',5,'#A20B0B',-3),
132: L('no','중앙 NO!!','NO!!',45,48,222,'bangers','#FF6820','#E6090C',7,'#200707',10,'#9F090B',-6,-12),
133: L('title','하단 금색 제목','추격자 해외반응 리액션',50,82,98,'black','#FFF55C','#EBA400',7,'#0F0809',12,'#820908',-4)
```

### F04 · T05 3폰트 비교 사진과 현재 T05 7폰트 편집기는 다른 버전이다

정적 guide는 레코체/G마켓/평창평화 3후보와 이전 금빛 팔레트를 갖지만 editor.js는 T05를 mountGoldEditor로 교체한다. 현재 gold-renderer 기본은 검은고딕, #F9D56B/#FFF7B8/#F8DD78 + #3C280B/#D1A13B/#7B5019이며 7폰트 편집기를 쓴다.

범위: 현재 기본값과 사용자의 브라우저 localStorage에 저장된 값은 다를 수 있다. 저장값을 읽거나 수정하지 않았다.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 50–54

```text
50:     T05: {size:47, spacing:-1, slant:0, tilt:0, align:"center", stroke:4, outer:2.5, shadow:3, blur:0, effect:"sparkle",
51:       glyphScale:[["병현","nameScale","‘병현’ 크기 (%)"],["특","accentScale","‘특’ 크기 (%)"]],
52:       colors:[["base","금색 윗면","#F6CB52"],["middle","금색 밝은 띠","#FCEC82"],["end","금색 아랫면","#F2CF5C"],["edge","진갈색 외곽선","#2E1A05"],["outerColor","청동빛 바깥 테두리","#A8763C"],["shade","입체 그림자","#2E1A05"],["bg","원본 배경","#5A4636"]],
53:       fills:{base:{grad:[["base",22],["middle",58],["end",86]]}},
54:       lines:[{fill:"base"}]},
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 71–74

```text
71:   for (const card of cards) {
72:     if (card.id === "T05" && typeof window.mountGoldEditor === "function") {
73:       window.mountGoldEditor(card);
74:       continue;
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-renderer.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-renderer.js) · line 11–50

```text
11:   const defaults = {
12:     text: "병현표 특급 서비스",
13:     fontFamily: '"ref-106", sans-serif',
14:     fontWeight: "400",
15:     size: 110,
16:     tracking: -3,
17:     lineHeight: 1.45,
18:     slant: -7,
19:     tilt: -1.4,
20:     stretchX: 100,
21:     stretchY: 100,
22:     positionX: 0,
23:     positionY: 0,
24:     top: "#F9D56B",
25:     highlight: "#FFF7B8",
26:     bottom: "#F8DD78",
27:     outline: "#3C280B",
28:     outer: "#D1A13B",
29:     shadow: "#7B5019",
30:     outlineWidth: 2.4,
31:     outerWidth: 1.2,
32:     depth: 3,
33:     shadowAngle: 90,
34:     blur: 0.7,
35:     gradientAngle: 90,
36:     highlightStop: 54,
37:     gradient: true,
38:     glowOpacity: 0.42,
39:     glowSpread: 48,
40:     starCount: 34,
41:     starSize: 11,
42:     starOpacity: 0.9,
43:     twinkleSpeed: 1,
44:     dustCount: 200,
45:     dustSize: 2.1,
46:     dustOpacity: 0.55,
47:     scatter: 100,
48:     seed: 51024,
49:     effect: true,
50:     bg: "#FFFFFF",
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js) · line 6–14

```text
6:   const FONTS = [
7:     {id:"ref-106",name:"검은고딕",note:"단단하고 넓은 획",url:"https://fonts.google.com/specimen/Black+Han+Sans"},
8:     {id:"ref-738",name:"SB 어그로 B",note:"힘 있는 제목",url:"https://www.sandbox.co.kr/company-ci"},
9:     {id:"ref-jalnan-gothic",name:"여기어때 잘난체 고딕",note:"각진 굵은 획",url:"https://gccompany.co.kr/font"},
10:     {id:"ref-366",name:"G마켓 산스 Bold",note:"반듯한 형태",url:"https://corp.gmarket.com/fonts/"},
11:     {id:"ref-669",name:"카페24 써라운드",note:"둥글고 두툼한 획",url:"https://fonts.cafe24.com/"},
12:     {id:"ref-950",name:"평창평화체",note:"글자 속 별 무늬 장식",url:"https://noonnu.cc/font_page/950"},
13:     {id:"ref-jalnan",name:"여기어때 잘난체",note:"부드러운 예능 제목",url:"https://gccompany.co.kr/font"}
14:   ];
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js) · line 70–75

```text
70:     let restored = false;
71:     let state = clone(defaults);
72:     try {
73:       const saved = localStorage.getItem(STORAGE);
74:       if (saved) { state = validate(JSON.parse(saved)); restored = true; }
75:     } catch (_) { /* Storage is optional; editing remains available. */ }
```

### F05 · T07 첫 선택 폰트는 티몬으로 고정되지 않는다

guide의 T07 후보 순서는 검은고딕, 티몬 몬소리, SB 어그로이며 editor.js의 selected=0이다. 따라서 새로 여는 기본 선택은 검은고딕 후보다. T04는 티몬이 첫 후보다.

범위: 스크린샷의 방송 원본 글꼴이 정확히 어떤 폰트인지 식별했다고 주장하지 않는다.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 76–79

```text
76:     const preset = presets[card.id];
77:     const links = [...card.querySelectorAll(".ty22-fonts a")];
78:     const names = links.map(a => a.textContent.replace(/^\d+\. /, ""));
79:     const families = links.map(a => `"${a.dataset.font || "ref-" + a.pathname.split("/").pop()}", "ref-106", sans-serif`);
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) · line 119–122

```text
119:     const word = fields.word;
120:     let selected = 0;
121:     let range = [0,0];
122:     let overrides = [];
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.css](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.css) · line 70–72

```text
70: @font-face{font-family:"ref-monsori";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/TmonMonsori.woff");font-display:swap}
71: @font-face{font-family:"ref-jalnan";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_four@1.2/JalnanOTF00.woff");font-display:swap}
72: @font-face{font-family:"ref-Do+Hyeon";src:url("https://fonts.gstatic.com/s/dohyeon/v21/TwMN-I8CRRU2zM86HFE3.ttf");font-display:swap}
```

### F06 · 색상 모음은 서로 다른 역할의 목록이며 자동으로 편집기 전체를 지배하지 않는다

PALETTE는 방송 캡처 근사값, PALETTE_OLD는 구형 실험실/편집기 값과 제안색이다. #E21317은 충격 박스, #B71512는 붉은 배경조명. #FFE94A에는 명시적으로 제안 표시가 있다. #F6FA55는 T08 모음 낱말만의 선택색으로 기록되어 있다.

범위: 기존 코드의 근사값 및 추출 주장을 감사에서 새로 픽셀 측정한 것으로 표현하지 않는다.

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/data.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/data.js) · line 189–203

```text
189: /* ── 색상 HEX (JTBC 14컷에서 추출한 근사값) ─── */
190: const PALETTE = [
191:  ['#F3D42D','번개 노랑','01-1'],['#F8D643','막 눈을 꾹꾹 노랑','01-1'],['#F1C933','대성통곡 노랑','01-1'],
192:  ['#78EDF5','강아지 하늘색 프레임','01-2'],['#349FAC','강아지 글씨 청록 외곽','01-2'],
193:  ['#963849','입술 (원본 어두운 톤)','01-4'],['#D23A5A','입술 보정 권장값','01-4 제안'],
194:  ['#E08E41','불꽃·왜애!! 주황','02-1'],['#CC8552','불꽃 그늘 주황','02-1'],['#A62F0C','짙은 빨강 외곽','02-1'],
195:  ['#B54763','핑크 너무해','04-4'],['#D61148','야구 빨강 글씨','06-1'],['#F0F44C','ㅋㅋㅋ 노랑','06-3'],
196:  ['#B5474A','28m 원샷원킬 빨강','07-2'],['#DE6B43','솟는 글씨 아래 주황','07-3'],['#E38C49','솟는 글씨 가운데','07-3'],['#EECB56','왕밤빵 노랑','07-3'],
197:  ['#E21317','충격 박스 빨강','09-4'],['#B71512','충격 배경 붉은 조명','09-4']
198: ];
199: const PALETTE_OLD = [
200:  ['#F22B15','NO!! 빨강 그라데이션'],['#FFE713','추격자 해외반응 노랑·금색'],['#C30E0C','썸네일 뒤 빨간색 · 누끼 외곽광'],['#F000D0','이슈 PICK 형광 분홍 배지'],['#53DFD4','인물 윤곽선 청록 외곽광'],['#E7B318','억대 연봉 황금'],['#FFED00','경고 테두리 노랑·검정 45° 사선'],['#F01515','수능, 이대로 치르겠다고? 빨강'],['#F6FA55','T08 모음 노랑 (RGB 246,250,85)'],
201:  ['#BCFF34','영상편집 형광연두'],['#FFE600','영상편집 노랑'],['#FF4545','영상편집 빨강'],['#39D5FF','영상편집 파랑'],
202:  ['#FFE94A','공통 네온 노랑(제안)'],['#A5FF43','공통 네온 연두(제안)'],['#FF454F','공통 네온 빨강(제안)'],['#42B8FF','공통 네온 파랑(제안)'],['#FF93D7','공통 네온 핑크(제안)']
203: ];
```

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/content.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/content.js) · line 61

```text
61: <li>문구 입력칸에서 글자를 드래그한 뒤 색상 칩을 누르면 선택한 글자만 폰트 3종에서 즉시 바뀜. <code>24625085</code> → RGB 246,250,85 → T08 <code>#F6FA55</code> (「모음」만 노랑, 「블랙박스」는 기존 색 유지).</li>
```

### F07 · 폰트 29종 점검표는 현재 로딩 성공 증거가 아니다

fonts-audit.json은 29개의 과거 로컬 경로·출처·상태 기록이다. 웹 @font-face 선언과 폰트 후보표는 별개다. T05 전용 현재 편집기는 document.fonts.load 결과와 글꼴 로딩 실패 표시 및 PNG export 차단을 구현한다.

범위: 이번 감사는 원격 폰트 CDN의 현재 성공 여부/사용자 컴퓨터 설치 상태/최신 라이선스를 검증하지 않았다.

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/studio.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/studio.js) · line 247–253

```text
247:     const list = await (await fetch('fonts-audit.json?v=1')).json();
248:     if (state.sub !== 'fonts') return;
249:     const cnt = k => list.filter(x => x.status === k).length;
250:     content.innerHTML = `<div class="page"><h1>🔤 폰트 점검표 (${list.length}종)</h1>
251:      <p class="lead">편집 페이지에서 쓰는 폰트와 대화에서 추천된 폰트를 <code>/home/yh/Pictures/폰트들</code> 과 대조했습니다. 원래 있음 <b class="ok">${cnt('local')}</b> · 이번에 자동으로 받음 <b class="ok">${cnt('downloaded')}</b> · 수동 필요 <b class="${cnt('manual') ? 'no' : 'ok'}">${cnt('manual')}</b></p>
252:      <p class="note">WOFF로만 받은 폰트는 웹페이지에서는 바로 쓰이지만, 프리미어·포토샵·캡컷 PC판에 설치하려면 오른쪽 「공식 받기」에서 TTF/OTF 원본을 받아야 합니다. 상세 보고서: <code>/home/yh/Pictures/폰트들/_폰트_점검_20261123.md</code></p>
253:      <div class="tblwrap"><table><tr><th>폰트</th><th>상태</th><th>로컬 경로</th><th>쓰이는 곳</th><th>라이선스</th><th>공식 받기</th></tr>${list.map(x => `<tr><td><b>${esc(x.name)}</b></td><td class="${x.status === 'manual' ? 'no' : 'ok'}">${({local:'원래 있음', downloaded:'이번에 받음', manual:'수동 필요'})[x.status] || esc(x.status)}</td><td><code style="font-size:11px;word-break:break-all">${esc(x.localPath || '')}</code></td><td style="font-size:12px">${esc((x.usedIn || []).join(' · '))}</td><td style="font-size:12px">${esc(x.license || '')}</td><td>${x.manualUrl ? `<a href="${esc(x.manualUrl)}" target="_blank" rel="noopener">공식 받기 ↗</a>` : x.source && /^https?:/.test(x.source) ? `<a href="${esc(x.source)}" target="_blank" rel="noopener">출처 ↗</a>` : ''}</td></tr>`).join('')}</table></div></div>`;
```

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/fonts.css](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/fonts.css) · line 1–11

```text
1: @font-face{font-family:"레코체";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Recipekorea.woff");font-display:swap}
2: @font-face{font-family:"SB어그로";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/SBAggroB.woff");font-display:swap}
3: @font-face{font-family:"카페24아네모네";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff");font-display:swap}
4: @font-face{font-family:"양진체";src:url("https://cdn.jsdelivr.net/gh/supernovice-lab/font@0.9/yangjin.woff");font-display:swap}
5: @font-face{font-family:"티머니둥근바람";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindExtraBold.woff");font-display:swap}
6: @font-face{font-family:"쿠키런블랙";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/CookieRunOTF-Black00.woff");font-display:swap}
7: @font-face{font-family:"G마켓산스";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansBold.woff");font-display:swap}
8: @font-face{font-family:"평창평화";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2206-02@1.0/PyeongChangPeace-Bold.woff2");font-display:swap}
9: @font-face{font-family:"정선아리랑뿌리";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/JSArirangPPURI-RegularA1.woff");font-display:swap}
10: @font-face{font-family:"잉크립퀴드";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_one@1.0/InkLipquid.woff");font-display:swap}
11: @font-face{font-family:"카페24써라운드";src:url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/Cafe24Ssurround.woff");font-display:swap}
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js) · line 530–538

```text
530:     async function loadFont(font) {
531:       if(loaded.has(font.id))return;
532:       loaded.set(font.id,"loading");
533:       try {
534:         const faces=await document.fonts.load(`400 48px "${font.id}"`,"병현표 특급 서비스");
535:         loaded.set(font.id,faces.length>0);
536:       }catch(_){loaded.set(font.id,false);}
537:       const entry=fontCards.get(font.id);if(entry)entry.hint.textContent=loaded.get(font.id)===true?font.note:"글꼴 로딩 실패";
538:       if(isVisible()){drawMain();drawMinis();}
```

[research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js) · line 551–557

```text
551:     async function exportPng(transparent) {
552:       const font=fontFor(state);
553:       if(loaded.get(font.id)!==true){announce("선택한 글꼴을 불러온 뒤 PNG를 저장할 수 있습니다. 로딩 실패라면 다른 글꼴을 선택해 주세요.");return;}
554:       const exportState=clone(state),exportTime=sceneTime;
555:       const output=document.createElement("canvas");output.width=1600;output.height=520;
556:       if(!transparent)exportState.bg="#ffffff";
557:       renderer.draw(output,exportState,{time:exportTime,transparent});
```

### F08 · HTML 디자인 도구에는 MP4 제작 기능이 없다

video-edit-lab.html footer에 MP4 자동 편집·렌더링 기능 미포함이 명시되어 있다. 감사 snapshot의 tracked paths에 render_v8_page.js 및 이름에 51이 포함된 MP4가 발견되지 않았다.

범위: 사용자의 다른 컴퓨터/폴더 파일 존재 여부는 조사하지 않았다.

[research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) · line 244

```text
244: <footer><p>이 페이지는 디자인 파라미터와 미리보기를 실험하는 HTML 도구입니다. 동영상 MP4 자동 편집·렌더링 기능은 포함하지 않습니다. 브라우저에 직접 고른 사진/영상은 서버로 전송하지 않으며, 설정 저장은 해당 브라우저의 localStorage만 사용합니다.</p></footer>
```

### F09 · 구형 장면 프리셋은 후속 사용자 규칙과 다를 수 있다

studio scene preset의 VS 기본은 금색 #FFD54F이며 news 카드는 #F7F3EA 베이지색이다. comment 미리보기에는 3일 전이 고정 텍스트로 포함된다.

범위: 기존 실험실을 삭제하거나 색을 전역 변경하라는 뜻이 아니다.

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/media.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/media.js) · line 85

```text
85:  {key:'vs', name:'⚔️ VS 비교', bg:'', anim:'swipe', font:'Black Han Sans', fill:'#FFFFFF', acc:'#FFD54F', stroke:'#111111', bgmode:'none', vsStyle:'metal', vsSize:18, vsColor:'#FFD54F', vsStroke:'#5a3b00',
```

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/studio.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/studio.js) · line 322–323

```text
322:   if (k === 'comment') h += `<div class="a-side" style="position:absolute;left:12%;right:12%;top:20%;background:#fff;border-radius:2cqw;padding:2.4cqw 3cqw;box-shadow:0 2cqw 4cqw #0008;font-family:'${v.font}';color:${v.fill}"><div style="display:flex;align-items:center;gap:1.5cqw;font-size:2.6cqw"><span style="width:5cqw;height:5cqw;border-radius:50%;background:linear-gradient(135deg,#ffb347,#ff5e62);display:inline-block"></span><b>${esc(v.nick)}</b> ${esc(v.flag)} <span style="color:#888;font-size:2cqw">3일 전</span></div><div style="font-size:3.4cqw;margin:1.4cqw 0;font-family:system-ui;color:#333"><span class="${mini ? '' : 'typing'}">${esc(v.orig)}</span></div><div style="font-size:4.6cqw;font-weight:800">${vText(v.main, {...v, hl: 'marker'}, true)}</div><div style="font-size:2.4cqw;color:#666;margin-top:1cqw">👍 ${esc(v.likes)} · 번역</div></div>`;
323:   if (k === 'news') h += `<div class="a-flip" style="position:absolute;left:14%;right:14%;top:14%;bottom:14%;background:#f7f3ea;border-radius:1cqw;padding:3cqw;box-shadow:0 2cqw 4cqw #000a;font-family:'${v.font}';color:${v.fill}"><div style="font-size:2.2cqw;color:#7a6a55;border-bottom:.3cqw solid #111;padding-bottom:1cqw;font-family:system-ui;font-weight:700">${esc(v.src)}</div><div style="font-size:6cqw;font-weight:900;line-height:1.25;margin-top:3cqw">${vText(v.main, {...v, hl: 'marker'}, true)}</div><div style="font-size:2cqw;color:#7a6a55;margin-top:3cqw;font-family:system-ui">원문 그대로 · 번역이면 “번역” 표시</div></div>`;
```

### F10 · 구형 세로 변환은 단순 확대와 치환이며 새 통계 구성을 대체하지 못한다

toVertical은 cqw font-size를 1.55배하고 2열을 1열/위아래로 치환한다.

범위: 모든 구형 세로 화면이 깨진다고 확인한 것은 아니다.

[국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/studio.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/studio.js) · line 328–334

```text
328: /* 9:16 쇼츠: 글씨 키우기, 좌우 → 위아래, 하단 UI 피하기 */
329: function toVertical(h) {
330:   return h.replace(/font-size:(\d+(?:\.\d+)?)cqw/g, (m, n) => `font-size:${+(n * 1.55).toFixed(2)}cqw`)
331:     .replace('grid-template-columns:1fr 1.2fr', 'grid-template-columns:1fr')
332:     .replace('display:grid;grid-template-columns:1fr 1fr', 'display:grid;grid-template-rows:1fr 1fr')
333:     .replace('class="vk a-stamp" style="top:28%', 'class="vk a-stamp" style="top:39%')
334:     .replace('left:12%;right:12%;top:20%', 'left:5%;right:5%;top:26%')
```

## 소스 파일 무결성

| 파일 | Git blob SHA |
|---|---|
| [국뽕-유튜브-리서치-허브-20261108/index.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/index.html) | `b2f3871edf0646d2e1626ce95b600d70cf86f2c1` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/data.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/data.js) | `96e067fc65a0602e734b5e4c1fdb6cba012378dc` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/studio.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/studio.js) | `70b6bbec29eb6aabd00548ccde34f0b0ebfdffb3` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/index.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/index.html) | `7ce6aa60950003bc937d47180831d0f554544ad1` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/content.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/content.js) | `6385bb8a4f958ecd9a31f854ead949c24e54fd30` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/media.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/media.js) | `c85c4a05ea41090f2fbc80f01cb233ebaebad839` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/fonts.css](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/fonts.css) | `0a6b9a5657539baf69229aaf88fc843c18ac1e4a` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/fonts-audit.json](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/fonts-audit.json) | `8febce9ca48e7055d4690f700e79e50735437f4d` |
| [국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/%EA%B5%AD%EB%BD%95-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EB%A6%AC%EC%84%9C%EC%B9%98-%ED%97%88%EB%B8%8C-20261108/thumb-edit-studio-20261123/editor.js) | `d22203fb63ee5c8c466d3070a09641beb184230d` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html) | `105a9e9a563154638305689710e2a5f1c6b4061d` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html) | `244ff7b393a99b68c6943738e1348d6d1dd8ec9d` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html) | `37baafa7471e69c21c155925dec791d59e045660` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.js) | `6047e55313f3ca6c72eded8ba001d3c5024f387c` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.css](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/editor.css) | `feba485398e57d8307b96c96e6b1544c223ab817` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-renderer.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-renderer.js) | `4d9b81d8f07e85f9c12ee3a436af723d5fba1a09` |
| [research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js](https://github.com/geben147-create/Insta/blob/6b91d1f82d2d2dfc181ab4c8acba11806412ef7b/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/gold-editor.js) | `3e50ed926d236efac7f8c67520e65e282e40dac7` |

## 미확인 사항

- 사용자 컴퓨터의 /run/media 또는 /home/yh 파일을 열었다고 주장하지 않음
- 51~54편 실제 렌더 원인 확정 또는 수정 완료 아님
- 원본 방송 자막의 정확한 폰트 식별 아님
- 코드에 적힌 HEX를 이번에 이미지에서 새로 측정했다고 주장하지 않음
- 폰트 로딩 성공과 라이선스 최신성을 검증했다고 주장하지 않음
- 지도/종이틀/댓글/개구리 원본이 저장소에 이미 존재한다고 주장하지 않음

## 추가: 루트 적용용 정확한 최소 패치안(미적용)

아래 변경은 루트가 검토한 뒤 적용할 수 있도록 작성한 제안이다. 감사 에이전트는 저장소를 수정하지 않았다. 각 before 문자열은 감사 기준 소스에 정확히 1회 존재한다.

### P01 · recommended_minimal

`research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html` · line 368

Before:

```js
if(i===2){setField('mark','lightning');setField('accent','#ff4545')}
```

After:

```js
if(i===2){setField('mark','lightning');setField('accent','#E03C3E')}
```

🌸 T07 버튼의 강조색만 전용 T07 레퍼런스 코드에 일치시킨다. 범용 keyword 프리셋과 다른 장면 빨강은 유지한다.

영향: 미리보기 T07 카드 적용 색값만. 폰트·외곽선·그림자·글자 크기·장식 배치까지 같아지는 패치는 아님.

### P02 · recommended_minimal

`research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html` · line 132

Before:

```js
L('no','중앙 NO!!','NO!!',45,48,222,'bangers','#FF6820','#E6090C',7,'#200707',10,'#9F090B',-6,-12)
```

After:

```js
L('no','중앙 NO!!','NO!!',45,48,222,'bangers','#F22B15','#C30E0C',7,'#200707',10,'#9F090B',-6,-12)
```

🌸 실제 NO layer의 두 채움값을 같은 페이지 spec에 쓰인 #F22B15→#C30E0C로 일치시킨다.

영향: 구형 영화 해외반응 템플릿 새로 불러온 기본값. 기존 localStorage 저장본/이미 내려받은 PNG는 변경되지 않는다.

### P03 · recommended_if_exact_single_yellow_is_intent

`research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html` · line 133

Before:

```js
L('title','하단 금색 제목','추격자 해외반응 리액션',50,82,98,'black','#FFF55C','#EBA400',7,'#0F0809',12,'#820908',-4)
```

After:

```js
L('title','하단 금색 제목','추격자 해외반응 리액션',50,82,98,'black','#FFE713',null,7,'#0F0809',12,'#820908',-4)
```

🌸 spec에 하단 노랑 #FFE713 한 값만 지정되어 있어 그 값 그대로 칠하는 최소안. 두 번째 그라데이션 색을 새로 발명하지 않는다.

영향: 이 템플릿 하단만 기존 황금 그라데이션이 단색 노랑으로 바뀐다. 검정/빨강 외곽·그림자·서체·좌표는 유지. 사용자가 그라데이션도 원하는 경우 #FFE713 역할과 두 번째 색을 별도 확정하기 전 P03은 보류할 수 있다.

### 폰트/스타일 구조 권고

P01은 T07 색값 1개만 수정한다. 티몬 몬소리는 구형 lab에 선언/선택지/fontMap이 없어서 font 값만 바꾸면 제대로 적용되지 않는다. 완전한 T07 스타일 재현을 선택할 때는 기존 HTML 구조에 `@font-face`, `<option>`, fontMap 항목 3개와 i===2 분기만 추가하면 된다. 정확한 문자열은 JSON의 `font_structure_recommendation.optional_t07_style_alignment`에 저장했다. 로딩 성공 여부는 기존 fontWarn으로 확인하고, fallback이면 사용자에게 대체폰트 상태를 표시해야 한다. 최신 T05 편집기와 후보 7개는 그대로 보존한다.

### T04는 이번 최소 범위에서 링크로 연결

quote 모드는 댓글 카드이므로 다홍 2색 그라데이션/위 검정 라벨의 T04 자막과 구조가 다르다. 단순 색값 치환은 해결이 아니다. 이미 T04를 지원하는 `./typography-refs-20261122/guide.html?v=20261124#T04` 바로가기를 제공하는 것이 가장 작은 정확한 조치다. 새 T04 컴포넌트를 범용 lab 안에 만드는 일은 이번 색상 하드코딩 수정에 포함시키지 않는다.

### 검증 범위

🌸 실제 적용 후에는 T07 버튼의 강조색 입력값/미리보기, NO 템플릿의 두 색 입력값/미리보기/PNG, 기존 저장본을 불러올 때의 구값 유지 여부를 확인한다. 새 기본값 수정과 기존 localStorage 저장본의 강제 마이그레이션은 구분한다. 이번 수정으로 MP4의 색/프레임/전환까지 해결되었다고 보고하지 않는다.

### P04 · T04 카드만 기존 전용 편집기로 연결(권고)

`research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html` · line 369

Before:

```js
const b=document.createElement('button');b.type='button';b.className='action';b.textContent='🎨 이 스타일 적용';b.addEventListener('click',()=>applyRef(i));
```

After:

```js
const b=document.createElement(i===4?'a':'button');b.className='action';if(i===4){b.href='./typography-refs-20261122/guide.html?v=20261124#T04';b.target='_blank';b.rel='noopener';b.textContent='🎨 전용 2색·라벨 편집 ↗'}else{b.type='button';b.textContent='🎨 이 스타일 적용';b.addEventListener('click',()=>applyRef(i))};
```

🌸 T04 카드의 「이 스타일 적용」을 「전용 2색·라벨 편집 ↗」 링크로 바꾼다. 기존 랩을 보존하며 이미 존재하는 T04 편집기만 새 탭으로 연다. 나머지 7개 카드는 동일 동작을 유지한다.

상대경로 검산: [https://geben147-create.github.io/Insta/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html?v=20261124#T04](https://geben147-create.github.io/Insta/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html?v=20261124#T04). `editor.js:6–20`은 해시 변경을, `editor.js:352`는 첫 로딩 시 해시를 지원한다. `guide.html`에 id="T04"가 존재한다. 즉 경로/해시 지원은 소스로 확인됐다. 실제 배포 뒤 클릭 검수는 루트가 수행해야 한다.
