# 🌸 효과음 교체 조사 · 2026-11-25

## 선택 기준

이번 10종은 **용도별 선정**이다. 편집자 전체의 사용량을 집계한 인기 순위가 아니다. 사용자가 요청한 칼/공기 휙, 책장 넘김을 먼저 두고 종이 찢김·클릭·팝·딩·카메라·타이핑을 보탰다. 직접 만든 발진음/합성음으로 대체하지 않고 기존 배포자가 공개한 오디오 파일을 사용한다.

국내 편집자 자료의 추천 종류를 참고했으며, 실제로 묶어 제공하는 파일은 각각 재배포가 허용된 Freesound CC0 자료다. 국내 추천 영상의 음원을 추출했다는 뜻이 아니다.

## 편집자/커뮤니티 조사 근거

1. [뚜규 · 11년차 종편감독 Pick! 자주 사용하는 효과음 추천](https://www.youtube.com/watch?v=IFHFylnVLcs)
   - 작성자 설명에서 강조용 신호음, 키보드, 클릭성 포인트, 카메라, 팝 등을 추천한다.
   - 확인 범위: 검색이 제공한 영상 제목·채널·설명. 원본 영상 전체 청취/타임코드 검증은 하지 않았다.
2. [뮤팟 · 현직 편집자들의 PICK](https://www.mewpot.com/mixes/1914)
   - 편집자별 모음을 제공하고 반전, 자막 등장, 모션 그래픽, 다음 장면의 신호 등 용도 태그를 확인할 수 있다.
   - 해당 음원을 GitHub에 재배포하지 않았다. 원문을 찾아 듣는 참고 링크다.
3. [크박 · 효과음 자료실 이용 가이드](https://creativebox.kr/soundeffect/3)
   - 영상 제작 커뮤니티의 효과음 자료실과 태그 검색을 확인했다. 다운로드 포인트와 개별 게시물의 이용 조건이 있으므로 이번 공개 파일 묶음에는 사용하지 않았다.

네이버 카페도 검색했으나 공개 검색 결과에서 검증 가능한 효과음 10종의 집계 근거는 확보하지 못했다. 따라서 '네이버 카페 인기 TOP10' 표기는 하지 않는다.

## 실제 포함 음원

|순서|파일|제작자|용도|원문|
|---|---|---|---|---|
|1|whoosh-bamboo.mp3|qubodup|짧은 공기 휙·슬라이드|https://freesound.org/people/qubodup/sounds/60013/|
|2|whoosh-sword.mp3|velcronator|칼 휙·VS 전환|https://freesound.org/people/velcronator/sounds/733888/|
|3|page-turn-light.mp3|OwlStorm / Ashe Kirk|짧은 책장 넘김|https://freesound.org/people/OwlStorm/sounds/151220/|
|4|page-turn-soft.mp3|OwlStorm / Ashe Kirk|긴 책장 넘김|https://freesound.org/people/OwlStorm/sounds/151221/|
|5|paper-tear.mp3|batchku|종이 찢김|https://freesound.org/people/batchku/sounds/10428/|
|6|mouse-click.mp3|HunteR4708|작은 항목 강조|https://freesound.org/people/HunteR4708/sounds/256455/|
|7|pop.mp3|magicjoshua|말풍선·아이콘 등장|https://freesound.org/people/magicjoshua/sounds/704170/|
|8|bell-ding.mp3|mark205|핵심 수치·체크 표시|https://freesound.org/people/mark205/sounds/580649/|
|9|camera-shutter.mp3|jdaniel1999|사진·캡처 등장|https://freesound.org/people/jdaniel1999/sounds/376205/|
|10|keyboard.mp3|yottasounds|기사·댓글 타이핑|https://freesound.org/people/yottasounds/sounds/380135/|

모두 각 원작자 페이지에 Creative Commons 0가 표시되어 있다. 제공 파일은 Freesound가 공개 미리듣기로 배포한 HQ MP3다. 로그인 후 받는 원본 WAV/FLAC/AIFF와 구분한다. 배포용은 10개 모두 샘플 피크 약 -7dBFS로 보정하고 양끝에 짧은 페이드를 넣었다. 팝은 0.10~0.38초, 카메라는 0.88~1.40초, 키보드는 3.20~5.00초를 발췌했다. 나머지는 길이를 유지했다. 원작자 원본 전체 파일은 해당 출처에서 확인한다.

## 구현 연결

- 배포용 10 MP3는 기존 편집기 `edit-preview-audio/curated-20261125/01.mp3`부터 `10.mp3`에 저장했다.
- `sfx-curated.js`의 `window.EDIT_SFX10` 배열을 읽어 카드 10개를 만든다. 자세한 측정은 같은 음원 폴더의 `manifest.json`에 기록했다.
- 각 카드에 제목·길이·용도·출처·CC0·재생·정지를 붙인다.
- 여러 파일이 겹쳐 재생되지 않도록 기존 Audio를 멈춘 뒤 새 파일을 재생한다.
- 사운드만 재생/화면과 함께 재생을 분리하되, 어느 버튼을 눌러도 왼쪽 미리보기가 보이도록 한다.
- 브라우저 사용자 클릭 후에만 재생한다. 음량 조절과 음소거를 제공한다.
- 효과음의 길이에 맞춰 영상 속도까지 억지로 늘리거나 반복하지 않는다.
- 추천 사용 장면과 전환 연결은 🌸 편집 제안이다.

## 확인 결과

- 10개 모두 MP3 디코딩 성공, 유효한 샘플 포함.
- 최종 배포용 10개 총 용량 189,944 bytes.
- 최종 샘플 피크 범위 -7.383~-6.599dBFS. HTML 재생 음량 0.5 기준으로 사용 가능.
- 카메라 0.96초의 앞 무음, 작은 책장 소리의 상대 음량 차이를 보정했다.
- 파일별 실제 길이·샘플레이트·SHA-256·파형 64지점은 JSON에 기록했다.
- 주관적인 청취 만족이나 '실제 편집자가 이 정확한 파일을 사용한다'는 사실까지 검증한 것은 아니다.

