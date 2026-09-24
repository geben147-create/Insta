"""Hamster #1 — pink bathroom cleaning + dance (itsbrainsnack)."""
from common import SMALL_ANIMALS, SWAP_NOTES_SMALL, VERTICAL

CHAR = ("{{A}}, anthropomorphic, standing upright on hind legs like a small person, big glossy dark eyes, "
        "long fluttery eyelashes, visible whiskers, pink nose, wet dark hair-dye-coated fur on the head covered by a "
        "clear plastic shower cap tied with a pink bow, white wired earphones in the ears with the cable hanging down, "
        "oversized cream white T-shirt with small pink lettering 'brainsnack' on the chest, baggy heather-grey "
        "jogger sweatpants with white drawstrings, bare pink feet, bright pink rubber cleaning gloves")

SET = ("cozy modern bathroom with soft pink accents: white toilet with the lid up on the LEFT, pink towel on a chrome "
       "towel bar and a framed pink botanical print on the grey tile wall behind it, a lit white candle and a green "
       "potted plant on the toilet tank, marble vanity on the RIGHT with a black bowl of purple hair dye and a tint "
       "brush, pump bottles, a round pink heart-pattern bath mat on the floor, black cleaning caddy with toilet paper, "
       "pink spray bottle and pink towel in the bottom-left foreground, white plastic-lined trash bin bottom-right")

LOOK = ("photorealistic, warm soft practical lighting from the candle and vanity, gentle bathroom ambience, shallow "
        "depth of field, 35mm lens at the character's eye level, static tripod camera, " + VERTICAL)

VIDEO = {
    "id": 2, "page": "p2_hamster1_cleaning_dance.html", "short": "② 햄찌1위 청소댄스",
    "rank_label": "햄찌 1위 · 핑크 일상/청소",
    "title": "염색약 바르고 변기 청소하다 춤추는 햄스터",
    "creator": "Roo ✨ @itsbrainsnack", "url": "https://www.instagram.com/p/DdcS7umBjR0/",
    "likes": 361176, "comments": 578, "date": "2026-09-18", "duration": 7.42, "res": "720×1280", "fps": 24,
    "model_guess": "720p · 24fps · 약 8초 단일 테이크 → Google Veo 3 / Veo 3.1 Fast 계열의 기본 출력 규격과 일치 (추정). 음악은 후반에 입힌 보컬 트랙.",
    "caption": "염색약 바르고 기다리는 동안 변기 닦기, 그래도 춤출 시간은 있다 😂 (#cleaning #hamster #hairdye #dance)",
    "hook": "0초부터 바로 '샤워캡 + 핑크 고무장갑 + 변기솔'을 든 햄스터가 화면 정중앙에 서 있음. 설명 없이 첫 프레임만으로 '사람처럼 사는 햄스터'라는 상황이 읽혀서 스크롤이 멈춤.",
    "formula": "일상 노동(0~3.3초) → 카메라 쳐다보기(3.3~4.3초) → 흥 폭발 댄스(4.3~7.4초) = 단일 테이크 3비트",
    "viral": [
        "공감형 셀프케어 상황: 염색약 방치 시간에 청소까지 하는 '멀티태스킹' — 여자 시청자 공감 댓글 유도.",
        "사람 소품 × 작은 동물 체구의 대비 (고무장갑, 이어폰, 조거 팬츠).",
        "7.4초 초단편 → 끝나자마자 다시 재생되며 시청 지속률 100% 이상(반복 재생) 확보.",
        "카메라 정면 응시(3.3초) = 시청자에게 말을 거는 '제4의 벽 깨기' 순간 → 댄스 전환의 신호.",
        "핑크/크림/그레이 3색 팔레트 고정 → 피드에서 한눈에 보이는 계정 톤.",
        "가슴의 'brainsnack' 로고 = 계정 브랜딩을 의상에 자연스럽게 삽입.",
    ],
    "look": [
        ("화면비/해상도", "9:16 세로, 원본 720×1280 24fps (업로드용은 1080×1920 업스케일 권장)"),
        ("카메라", "삼각대 고정(locked-off), 햄스터 눈높이보다 살짝 높은 아이레벨, 35mm 환산 화각, 줌/팬 없음"),
        ("피사체 위치", "햄스터 몸 중심 = 화면 가로 50%, 눈높이 = 세로 30~33% (위쪽 1/3 선), 발끝 = 세로 80%. 화면 높이의 약 65% 차지"),
        ("배경 레이어", "전경: 좌하단 청소바구니(휴지·핑크 스프레이·핑크 수건) / 중경: 좌측 변기(뚜껑 열림)·우측 휴지통·하트 러그 / 후경: 액자·핑크 수건·양초·화분·대리석 세면대·염색약 그릇"),
        ("조명", "따뜻한 3200~3800K 실내등 + 양초 하이라이트, 부드러운 확산광, 강한 그림자 없음"),
        ("색 팔레트", "베이비핑크 #F2B8C6 · 크림 #F5EFE6 · 웜그레이 #9C9A96 · 대리석 화이트"),
        ("질감", "실사(photoreal) 털 결, 젖은 머리털(염색약) 광택, 투명 비닐 샤워캡 반사"),
        ("AI 오류 흔적", "4~5초 사이 휴지통이 '비닐 씌운 통 → 뚜껑 있는 페달 휴지통'으로 바뀜 (Veo 계열 연속성 오류). 재현 시 휴지통을 처음부터 '흰색 뚜껑 달린 페달 휴지통'으로 고정하면 발 올리기 동작이 자연스러움"),
    ],
    "slots": {"A": {"label": "주인공 동물", "default": SMALL_ANIMALS[0][1], "options": SMALL_ANIMALS}},
    "characters": [("주인공 (모든 프롬프트 공통 문장)", CHAR), ("세트 (배경 고정 문장)", SET), ("룩 (촬영 고정 문장)", LOOK)],
    "negative": "text overlay, subtitles, watermark, extra limbs, extra fingers, human hands, cartoon, 3D render look, "
                "plastic toy look, deformed face, camera shake, zoom, cuts, scene change, changing props, blurry",
    "swaps": SWAP_NOTES_SMALL,
    "shots": [
        {
            "t0": 0.0, "t1": 3.3, "name": "변기 솔질 + 음악에 고개 까딱", "frames": [0.3, 1.6, 2.9],
            "size": "풀샷~미디엄 풀샷 (머리~발 전체)", "angle": "아이레벨 정면", "move": "고정 (카메라 움직임 0)",
            "comp": "햄스터 정중앙, 몸이 살짝 왼쪽(변기 쪽)으로 기울어짐. 왼손 변기솔은 화면 좌측 변기 안, 오른손 핑크 스프레이는 가슴 높이 우측.",
            "action": "왼손으로 변기 안을 위아래로 박박 문지르고, 오른손 스프레이는 들고만 있음. 이어폰 음악에 맞춰 고개를 좌우로 까딱, 입을 오물오물.",
            "line": "없음 (화면 텍스트 없음)", "audio": "보컬 R&B/팝 트랙 시작부 — 비트에 맞춰 고개 까딱",
            "trans": "none", "trans_note": "컷 없이 같은 테이크 안에서 고개를 돌리며 다음 비트로",
            "img": f"{CHAR}. It stands in front of the toilet, leaning slightly left, scrubbing inside the toilet bowl with a "
                   f"black toilet brush in its left gloved paw while holding a pink spray bottle at chest height in its right "
                   f"paw, looking down at the bowl with a focused face. {SET}. {LOOK}.",
            "vid": f"[전체 8초 한 번에 생성 — 권장] {CHAR}. {SET}. 0-3s: the character scrubs inside the toilet bowl with the "
                   "black brush in quick up-and-down strokes, head bobbing side to side to the music from its earphones. "
                   "3-4s: it stops, turns its face straight to the camera with a playful expression. 4-8s: it breaks into a "
                   "happy dance, lifting its right foot onto the white lidded pedal trash bin, raising its left fist in the air "
                   "and swaying its hips, still holding the pink spray bottle. Static locked-off camera, no cuts, no zoom. "
                   f"{LOOK}. Audio: soft bathroom room tone, brush scrubbing sounds, faint music leaking from earphones.",
            "models": [("google veo-3-1 (fast)", "8초 단일 테이크 + 실사 털 + 소품 쥐기 정확. 원본과 같은 계열"),
                       ("kling-v3 / kling-v3-omni", "캐릭터 레퍼런스 고정력 최고, 댄스 동작 자연스러움 (10초 옵션)"),
                       ("seedance-2-0", "리듬 있는 반복 동작(솔질)과 카메라 고정 유지가 안정적"),
                       ("minimax-h3", "귀여운 표정 변화·고개 까딱 같은 미세 연기에 강함")],
        },
        {
            "t0": 3.3, "t1": 4.3, "name": "정면 응시 (댄스 신호)", "frames": [3.5, 4.1],
            "size": "풀샷", "angle": "아이레벨 정면", "move": "고정",
            "comp": "얼굴이 화면 정면을 향해 돌아옴. 눈이 세로 30% 선 위에 정확히 걸림.",
            "action": "솔질을 멈추고 카메라(시청자)를 똑바로 쳐다보며 한쪽 다리를 들어올리기 시작.",
            "line": "없음", "audio": "음악 비트 강박 직전",
            "trans": "none", "trans_note": "시선 전환이 곧 '편집점' 역할 (in-camera transition)",
            "img": f"{CHAR}. It has just stopped scrubbing and turns its face straight toward the camera with a cheeky "
                   f"confident look, one foot starting to lift, toilet brush still in the bowl. {SET}. {LOOK}.",
            "vid": f"{CHAR}. {SET}. The character stops scrubbing, slowly turns its head to look directly into the camera "
                   f"with a cheeky smile and starts lifting its right foot. Static camera. {LOOK}.",
            "models": [("kling-v3", "시선 처리(eye contact) 정확"), ("google veo-3-1", "단일 테이크 연속성"),
                       ("hailuo-2-3", "짧은 표정 연기 가성비")],
        },
        {
            "t0": 4.3, "t1": 7.42, "name": "휴지통에 발 올리고 흥 댄스", "frames": [5.0, 6.0, 7.2],
            "size": "풀샷", "angle": "아이레벨 정면", "move": "고정",
            "comp": "오른발이 화면 우측 휴지통 뚜껑 위(세로 62%), 왼주먹이 머리 옆(세로 33%)으로 올라감. 몸 전체가 오른쪽으로 약간 이동해 중심이 가로 55%.",
            "action": "휴지통 뚜껑에 발을 올리고 주먹을 흔들며 골반을 좌우로. 표정은 신난 얼굴, 카메라 응시 유지. 마지막 프레임까지 포즈 유지(루프 대비).",
            "line": "없음", "audio": "후렴 들어가는 부분에 댄스 싱크",
            "trans": "end", "trans_note": "영상 끝 → 인스타가 자동 반복 재생 (루프 엔딩)",
            "img": f"{CHAR}. Dancing happily: its right foot resting on the lid of a white pedal trash bin, left fist raised "
                   f"beside its head, hips swaying, pink spray bottle in the right paw, looking at the camera with a big "
                   f"joyful face. {SET}. {LOOK}.",
            "vid": f"{CHAR}. {SET}. The character dances with its right foot on the white trash bin lid, pumping its raised "
                   "left fist to the beat and swaying its hips side to side, bobbing its head, confident happy face looking at "
                   f"the camera. Static camera, continuous take. {LOOK}.",
            "models": [("kling-v3", "댄스·리듬 동작의 관절 자연스러움 1위"), ("seedance-2-0", "비트 반복 동작 안정"),
                       ("minimax-h3", "표정+몸 동작 동시 연기"), ("gemini-omni-flash", "빠른 시안용")],
        },
    ],
    "audio": {
        "bgm": "보컬이 있는 느린 R&B/팝 트랙 (저작권 음원 — 가사 인용 생략). 소리 크기가 처음부터 끝까지 -16~-18dB로 일정 = 배경음악 하나만 깔린 구조. 효과음 없음.",
        "bpm": "약 76 BPM (하프타임 느낌, 더블 타임 152) — 고개 까딱이 1박마다 들어감",
        "mix": "음악 단독. 원본은 대사·효과음 없이 음악 볼륨 그대로. 재현 시 솔질·발 올리는 소리를 -12dB로 살짝 깔면 '현장감'이 올라감.",
        "music_prompt": "Smooth slow R&B pop groove, 76 BPM half-time feel, warm Rhodes keys, soft 808 bass, crisp snaps on 2 "
                        "and 4, dreamy female vocal hums (no lyrics), confident playful mood, loopable 8-second section, "
                        "no intro, starts on the beat",
        "bgm_db": -3,
        "sfx": [
            (0.2, "변기솔 문지르는 소리", "plastic toilet brush scrubbing inside a ceramic toilet bowl, wet, short rhythmic strokes"),
            (4.5, "휴지통 뚜껑에 발 올리는 톡 소리", "small foot tapping on a plastic trash bin lid, light hollow thud"),
            (5.2, "스프레이 한 번 칙", "single pump of a plastic spray bottle, short mist hiss"),
        ],
    },
    "edit_terms": [
        ("원테이크 (One-take / Oner)", "컷이 하나도 없음. 8초짜리 AI 클립 1개를 통째로 사용."),
        ("락오프 샷 (Locked-off shot)", "카메라 완전 고정. 배경이 안 움직여서 캐릭터 동작만 눈에 들어옴."),
        ("비트 매칭 (Beat sync)", "고개 까딱·주먹질이 음악 박자에 맞음 → 음악을 먼저 고르고 BPM에 맞춰 동작 프롬프트 작성."),
        ("제4의 벽 깨기 (Breaking the 4th wall)", "3.3초 카메라 응시 = 시청자와 눈 맞춤 → 댄스로 넘어가는 '인카메라 전환'."),
        ("루프 엔딩 (Loop ending)", "마지막 포즈에서 바로 끊겨 다시 처음 장면으로 이어짐 → 반복 시청 유도."),
        ("노 텍스트 (Text-less)", "화면 자막 0. 설명은 캡션에만 → 글로벌 시청자에게도 통함."),
    ],
    "grade": "eq=contrast=1.04:saturation=1.08:gamma=1.02,colorbalance=rs=0.03:bs=-0.02,unsharp=5:5:0.4",
    "grade_note": "원본은 이미 따뜻하고 부드러움. 업스케일 후 살짝 선명(unsharp)과 핑크를 조금 더 (red shadow +0.03).",
    "subs": [],
    "strip_step": 0.5,
    "checklist": [
        "첫 프레임 이미지를 먼저 만들고(Nano Banana Pro / Midjourney v8), 그 이미지로 image-to-video 한 번에 8초 생성",
        "캐릭터·세트·룩 3문장을 한 글자도 바꾸지 않고 사용",
        "휴지통은 처음부터 '뚜껑 있는 흰색 페달 휴지통'으로 (발 올리기용)",
        "음악 BPM 76 전후 곡을 먼저 정하고 '고개 까딱'을 프롬프트에 명시",
        "자막·워터마크 없이 7~8초로 끊기 (마지막 포즈에서 하드 엔드)",
        "업로드: 1080×1920, 30fps, -14 LUFS, H.264",
    ],
    "cc_prompt": "너는 세계 최고 수준의 쇼츠 감독 겸 편집자다. 아래 레퍼런스(햄찌 1위: 염색약+변기청소+댄스, 7.4초 원테이크)를 {{A}} 로 바꿔서 똑같이 만든다.\n"
                 "1) 이미지: 페이지 ⑥의 구간#1 이미지 프롬프트로 첫 프레임 1장 생성 (nano-banana-pro 또는 midjourney-v8, 9:16).\n"
                 "2) 영상: 그 이미지를 넣고 구간#1의 '[전체 8초 한 번에 생성]' 프롬프트로 veo-3-1 (없으면 kling-v3) image2video 8초 1회 생성. 3안 생성 후 휴지통 연속성 오류가 없는 것 선택.\n"
                 "3) 음악: ⑦의 음악 프롬프트로 76BPM 트랙 생성, 효과음 3개 생성.\n"
                 "4) 편집: ⑧의 build.sh 그대로 실행 (clips/shot01.mp4, audio/bgm.mp3, sfx/sfx01~03.wav 배치).\n"
                 "5) 결과 final.mp4를 원본과 0.5초 간격 프레임 비교 → 구도(눈높이 30%, 몸 중앙) 어긋나면 이미지부터 재생성.\n"
                 "🔴 승인 전 업로드 금지. 수정 가능 범위: 이 작업 폴더 안의 clips/, audio/, sfx/, build.sh 만.",
}
