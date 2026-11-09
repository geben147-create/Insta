# 캐릭터 결합 프롬프트 (Codex 이미지 생성용)

사용자가 `my_character/` 에 캐릭터 시트(정면·측면·표정)를 넣는다. 매번 **그 이미지를 첨부**하고 아래 틀을 쓴다.
캐릭터는 **배경과 따로** 만드는 것을 기본으로 한다(투명 PNG → spec `char.img`). 배경과 합쳐 한 장으로 만들 때만 B를 쓴다.

## A. 캐릭터 단독 컷 (투명 배경, 카드 구석용)
```
Use the attached character sheet as the ONLY reference for the character "Mr. Navy".
Keep exactly: face shape, round glasses, hairstyle, navy suit color and cut, proportions, line weight, coloring style.
Pose: {POSE}   (예: holding a sign / pointing left / thumbs up / sleeping on a sofa / carrying a box)
Prop: {PROP}   (예: small coffee cup held with pinky finger raised / calculator / piggy bank)
Expression: {EXPRESSION}
Full body, facing 3/4 left (toward the text area), centered, transparent background, no shadow on ground,
no text, no letters, no numbers, no logos, no watermark. Square 1024x1024, PNG with alpha.
```
저장: `out_v4/img/NNN/char_<장>.png` → spec의 `char` 요소 `"img"`.

## B. 배경 + 캐릭터 한 장 (표지 연출용)
```
Background scene: {SCENE from spec image_prompts}.
Place the attached character "Mr. Navy" small in the bottom-right corner, about 20% of image width,
same design as the character sheet (glasses, navy suit, proportions, coloring).
Leave the top 45% and the left 70% calm and uncluttered for Korean headline text added later.
Palette: {DESIGN_SYSTEM palette}. Style: {my_design style keywords}.
No text, no letters, no numbers, no logos, no watermark. 1080x1350 portrait.
```

## C. 짝꿍(선택)
흰 모찌 로봇: `a small round white mochi-like robot companion, soft matte, two dot eyes, no mouth`, Mr. Navy 옆에 더 작게.

## 일관성 체크 (생성 후)
- 안경·정장 색·머리 모양이 시트와 같은가 / 손가락 개수 / 글자·로고가 들어가지 않았는가
- 어긋나면 같은 프롬프트에 `Match the attached sheet more strictly: {틀린 부분}` 을 붙여 재생성
