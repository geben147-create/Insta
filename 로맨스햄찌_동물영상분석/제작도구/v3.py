"""Hamster #2 — winged eyeliner fail reveal (itsbrainsnack)."""
from common import SMALL_ANIMALS, SWAP_NOTES_SMALL, VERTICAL

CHAR = ("{{A}}, anthropomorphic 1950s pin-up girl: glossy victory-roll pin curls of golden-brown hair on top of the head, "
        "red bandana with white polka dots tied in a bow on top, long lashes, big glossy black eyes, pink nose, soft "
        "whiskers, single strand pearl necklace, red 1950s swing dress with white piped puff sleeves, three pearl buttons "
        "and small white script 'BrainSnack' embroidered on the chest, tiny pink paws")

SET = ("retro Hollywood dressing-room vanity: large oval gold-framed mirror ringed with glowing round bulbs behind the "
       "character, sage-green paneled wall with framed vintage prints, marble vanity top with pink perfume bottles, "
       "gold makeup brushes and compacts on the left and right edges")

LOOK = ("photorealistic macro photography, soft warm beauty lighting from the mirror bulbs, creamy bokeh, rich reds, "
        "fine fur detail, 100mm macro lens for close-ups, " + VERTICAL)

VIDEO = {
    "id": 3, "page": "p3_hamster2_eyeliner.html", "short": "③ 햄찌2위 아이라인",
    "rank_label": "햄찌 2위 · 화장품/뷰티",
    "title": "완벽한 윙 아이라인 → 뒤돌면 대참사",
    "creator": "Roo ✨ @itsbrainsnack", "url": "https://www.instagram.com/p/DdSeke-xzU7/",
    "likes": 90430, "comments": 246, "date": "2026-09-15", "duration": 8.01, "res": "720×1280", "fps": 24,
    "model_guess": "720p · 24fps · 8.0초 단일 테이크(카메라 풀백 포함) → Veo 3 / Veo 3.1 계열 규격과 일치 (추정). 한 번 생성으로 '초근접→정면→뒤로 빠지기'까지 수행.",
    "caption": "윙을 양쪽 똑같이 그리는 것부터 이미 너무 어려웠어 😭🖤 (#makeuplover #hamster #eyeliner)",
    "hook": "첫 프레임이 햄스터 눈 초근접 + 리퀴드 아이라이너 붓끝. '털 있는 얼굴에 아이라인?'이라는 궁금증으로 3.7초를 버티게 만듦.",
    "formula": "기대(완벽한 옆모습 3.7초) → 반전 공개(정면 번진 아이라인 0.3초) → 줌아웃 리액션 홀드(3.5초) = 기대-반전-정적",
    "viral": [
        "반전 구조 'Expectation vs Reality' — 옆얼굴은 완벽, 정면은 엉망. 뷰티 계정 밈 포맷 그대로.",
        "리빌 타이밍 4.0초 = 전체 8초의 정확히 절반. 앞 절반 긴장, 뒤 절반 웃음.",
        "마지막 3초 '무표정 정지(deadpan hold)' → 시청자가 웃을 시간을 줌 + 댓글('나야 나') 유도.",
        "화장 실패는 누구나 겪는 공감 소재 → 저장·공유(친구 태그)가 잘 됨.",
        "1950년대 핀업 스타일링(빅토리 롤·물방울 반다나·진주)으로 썸네일 한 장만 봐도 콘셉트가 명확.",
    ],
    "look": [
        ("화면비/해상도", "9:16 세로, 원본 720×1280 24fps"),
        ("렌즈/거리", "0~4초: 100mm 매크로 초근접(눈 하나가 화면 폭 25%) / 4.3초: 정면 ECU / 5.3초~: 미디엄샷(허리 위)"),
        ("피사체 위치", "초근접: 눈 = 가로 60%·세로 50%, 붓끝이 눈꼬리 / 마지막: 얼굴 정중앙, 눈높이 세로 38%, 드레스가 하단 40% 채움"),
        ("배경", "원형 금색 거울 + 동그란 전구(할리우드 분장실), 세이지그린 벽, 핑크 향수병. 초근접에선 전부 보케로 날아감"),
        ("조명", "거울 전구의 따뜻한 정면 뷰티 조명, 눈동자에 둥근 캐치라이트"),
        ("색 팔레트", "체리레드 #C8202E · 진주화이트 · 골드 #C9A15B · 세이지 #9FB5A5 · 햄스터 오렌지"),
        ("핵심 소품", "리퀴드 아이라이너(검정 뚜껑 붓펜), 진주 목걸이, 물방울 반다나"),
    ],
    "slots": {"A": {"label": "주인공 동물", "default": SMALL_ANIMALS[0][1], "options": SMALL_ANIMALS}},
    "characters": [("주인공 (공통 문장)", CHAR), ("세트 (공통 문장)", SET), ("룩 (공통 문장)", LOOK)],
    "negative": "text, subtitles, watermark, human hand, extra fingers, cartoon, plastic, symmetrical perfect makeup in the "
                "final shot, cut, scene change, blurry face, deformed eyes",
    "swaps": SWAP_NOTES_SMALL + [["아이라인 반전 주의", "눈이 작은 동물(카피바라·해달)은 번진 아이라인이 잘 안 보임 → '번진 검은 아이라인이 눈 주변 털에 크게 번짐(smeared thick black liner all around the eyes)'을 과장해서 쓰기."]],
    "shots": [
        {
            "t0": 0.0, "t1": 3.7, "name": "초근접 옆모습 — 윙 아이라인 그리기", "frames": [0.2, 1.8, 3.3],
            "size": "익스트림 클로즈업 (눈 하나 + 볼 + 붓)", "angle": "3/4 측면, 눈높이", "move": "아주 느린 푸시인(거의 고정), 미세 핸드헬드 흔들림",
            "comp": "왼쪽 위 1/3에 물방울 반다나와 빅토리 롤, 오른쪽 가운데에 눈. 좌하단에서 핑크 앞발이 아이라이너를 쥐고 대각선으로 눈꼬리를 향함.",
            "action": "앞발로 붓을 눈꼬리에 대고 윙을 바깥으로 쓱 빼기 2회. 눈을 크게 뜨고 집중, 입꼬리 살짝.",
            "line": "없음", "audio": "매우 조용함(-44dB): 붓 스치는 ASMR 소리 정도",
            "trans": "none", "trans_note": "붓을 떼고 얼굴을 돌리는 동작으로 연결",
            "img": f"{CHAR}. Extreme macro close-up of its right eye in three-quarter profile while it carefully draws a sharp "
                   f"black winged eyeliner with a liquid liner brush held in its tiny pink paw from the bottom-left, perfect "
                   f"crisp wing, polka-dot bandana and pin curls at the top-left of frame, pearls at the bottom. {LOOK}.",
            "vid": f"[전체 8초 한 번에 생성 — 권장] {CHAR}. {SET}. 0-3.7s: extreme macro close-up in three-quarter profile, the "
                   "character slowly draws a perfect black winged eyeliner on its right eye with a liquid liner pen, two careful "
                   "outward strokes, focused wide eye. 3.7-4.3s: it lifts the brush, blinks and quickly turns its face toward the "
                   "camera with slight motion blur, revealing that the eyeliner on BOTH eyes is a smeared, uneven, messy disaster "
                   "spreading into the fur. 4.3-5.3s: the camera quickly pulls back to a medium shot showing the whole character "
                   "in the red dress in front of the glowing bulb mirror. 5.3-8s: it holds still, staring into the camera with a "
                   "deadpan shocked face, eyes slowly darting sideways. Single continuous take. "
                   f"{LOOK}. Audio: quiet brush ASMR, then a comedic retro jazz sting on the reveal.",
            "models": [("google veo-3-1", "8초 안에 ECU→풀백 카메라 무브를 한 번에 소화, 원본 계열"),
                       ("kling-v3-omni", "시작/끝 프레임 2장 지정(first+last frame)으로 '완벽 옆모습→망친 정면' 강제 가능"),
                       ("seedance-2-0", "카메라 무브(dolly out) 지시 이행이 정확"),
                       ("minimax-h3", "표정(멍한 무표정) 연기 우수")],
        },
        {
            "t0": 3.7, "t1": 4.3, "name": "깜빡 → 휙 돌아보기 (모션블러)", "frames": [3.8, 4.0],
            "size": "익스트림 클로즈업", "angle": "측면→정면으로 회전", "move": "피사체 회전 + 빠른 모션블러 (휩 턴)",
            "comp": "얼굴이 화면 중앙으로 회전하며 코가 세로 55% 지점에 옴. 붓은 좌하단에 남음.",
            "action": "붓을 떼고 한 번 깜빡, 고개를 카메라 쪽으로 빠르게 돌림.",
            "line": "없음", "audio": "4.0초 — 소리 크기 급상승(-44→-25dB): 반전 효과음/재즈 스팅 시작",
            "trans": "none", "trans_note": "모션블러 자체가 전환(인카메라 휩)",
            "img": f"{CHAR}. Mid-turn toward the camera with strong motion blur, eyes half closed, liner pen still in paw at "
                   f"the lower left, extreme close-up. {LOOK}.",
            "vid": f"{CHAR}. Extreme close-up. The character lifts the liner, blinks once and whips its head toward the camera "
                   f"with natural motion blur. {LOOK}.",
            "models": [("kling-v3", "빠른 머리 회전 시 얼굴 무너짐이 적음"), ("google veo-3-1", "연속 테이크 유지"),
                       ("seedance-2-0", "모션블러 표현 자연스러움")],
        },
        {
            "t0": 4.3, "t1": 5.3, "name": "정면 공개 — 번진 아이라인 + 카메라 뒤로 빠지기", "frames": [4.35, 4.7, 5.1],
            "size": "ECU → 미디엄샷 (1초 만에)", "angle": "정면 눈높이", "move": "빠른 달리아웃/줌아웃 (crash pull-back)",
            "comp": "4.33초 정면 초근접: 양쪽 눈이 가로 30%/70%, 번진 아이라인이 눈 주변 털로 퍼짐. 5.3초엔 얼굴이 세로 38%, 뒤로 전구 거울이 원형 프레임처럼 얼굴을 감쌈.",
            "action": "눈을 동그랗게 뜬 채 가만히. 카메라만 빠르게 뒤로 빠지며 드레스·거울·화장대 공개.",
            "line": "없음", "audio": "반전 효과음 지속",
            "trans": "none", "trans_note": "카메라 풀백이 '리빌 트랜지션'",
            "img": f"{CHAR}. Front-facing extreme close-up, both eyes wide open with a smeared, uneven, messy black eyeliner "
                   f"disaster spreading into the fur around both eyes, surprised deadpan face, pearls visible. {LOOK}.",
            "vid": f"{CHAR}. {SET}. Starting on a front-facing extreme close-up of the messy smeared eyeliner, the camera "
                   f"rapidly pulls back (dolly out) to a medium shot revealing the red polka-dot bandana, pearls, red dress and the "
                   f"glowing bulb mirror behind. The character stays frozen, wide-eyed. {LOOK}.",
            "models": [("seedance-2-0", "dolly-out 속도 지시 정확"), ("kling-v3", "레퍼런스 얼굴 유지"),
                       ("google veo-3-1", "원본 계열")],
        },
        {
            "t0": 5.3, "t1": 8.01, "name": "무표정 리액션 홀드 (데드팬)", "frames": [5.6, 6.5, 7.8],
            "size": "미디엄샷 (허리 위)", "angle": "정면 눈높이", "move": "고정",
            "comp": "얼굴 정중앙, 반다나 리본 끝이 세로 15%, 눈 세로 38%, 'BrainSnack' 자수 세로 68%. 거울 전구가 좌우 대칭 프레임.",
            "action": "눈만 좌우로 굴리며(사이드아이) 멍하게 서 있음. 앞발은 몸 옆.",
            "line": "없음", "audio": "7초부터 다시 조용해짐(-47dB) → 끝",
            "trans": "end", "trans_note": "정지 표정에서 하드 엔드 → 루프 시 다시 '완벽한 옆모습'으로 돌아가며 반전이 한 번 더 웃김",
            "img": f"{CHAR}. Medium shot, standing in front of the vanity, frozen deadpan expression with the smeared messy "
                   f"black eyeliner around both eyes, looking straight at the camera, paws at its sides. {SET}. {LOOK}.",
            "vid": f"{CHAR}. {SET}. Medium shot, the character stands completely still with a deadpan shocked face and messy "
                   f"smeared eyeliner, only its eyes slowly dart left then back to the camera, subtle breathing. Static camera. {LOOK}.",
            "models": [("minimax-h3", "미세 눈동자 연기 최강"), ("kling-v3", "정지 유지 + 털 디테일"),
                       ("hailuo-2-3-fast", "가성비 시안")],
        },
    ],
    "audio": {
        "bgm": "앞 4초는 거의 무음(-43~-44dB)으로 붓 소리 ASMR, 4.0초 반전 순간부터 약 3초간 소리가 크게(-25dB) 올라감 = 코믹 재즈/반전 스팅, 7초 이후 다시 조용. (소리 크기 곡선 분석 기반 추정 — 대사 없음)",
        "bpm": "약 74 BPM (느린 스윙 재즈 느낌)",
        "mix": "무음→스팅→무음의 '다이내믹 대비'가 핵심. 앞부분에 음악을 깔면 반전 효과가 약해짐.",
        "music_prompt": "Short comedic 1950s retro swing jazz sting, muted trumpet 'wah-wah' fall, brushed snare, walking upright "
                        "bass, 74 BPM, 3 seconds long, starts with a hit, ends abruptly, playful embarrassed mood",
        "bgm_db": -4,
        "sfx": [
            (0.4, "리퀴드 라이너 붓 스치는 소리", "soft liquid eyeliner brush stroke on skin, close-mic ASMR, very quiet"),
            (1.9, "두 번째 붓 스트로크", "gentle eyeliner brush swipe, ASMR, short"),
            (3.9, "휙 돌아보는 소리", "quick cartoon whoosh, soft air swish, 0.3 seconds"),
            (4.05, "반전 스팅", "comedic record scratch followed by a sad trombone wah-wah, short"),
        ],
    },
    "edit_terms": [
        ("리빌 (Reveal)", "옆모습→정면 회전으로 숨겨둔 정보(망친 화장)를 공개. 웃음 포인트."),
        ("휩 턴 / 모션블러 전환", "3.7~4.3초 빠른 회전의 번짐이 컷 역할."),
        ("크래시 풀백 (Crash pull-back)", "4.3~5.3초 카메라가 확 뒤로 빠지며 전체 상황 공개."),
        ("데드팬 홀드 (Deadpan hold)", "5.3초~끝 무표정 정지 = 웃을 시간 주기. 코미디 타이밍의 핵심."),
        ("다이내믹 대비 (Loud-quiet)", "무음 → 반전 순간 사운드 폭발 → 무음."),
        ("미드포인트 반전", "반전을 전체 길이 50% 지점(4.0초)에 배치."),
    ],
    "grade": "eq=contrast=1.05:saturation=1.1,colorbalance=rm=0.04:bm=-0.02,vignette=PI/6,unsharp=5:5:0.5",
    "grade_note": "레드를 살짝 진하게, 가장자리 비네팅으로 얼굴에 시선 집중. 매크로 털 디테일은 unsharp로 보강.",
    "subs": [],
    "strip_step": 0.33,
    "checklist": [
        "첫 프레임(완벽한 윙) + 마지막 프레임(번진 정면 미디엄샷) 2장을 먼저 이미지로 만들기",
        "Kling v3 Omni는 first/last frame 모드로, Veo 3.1은 첫 프레임 + 8초 전체 프롬프트로 생성",
        "반전은 반드시 4.0초 전후 — 앞 절반은 조용히",
        "마지막 2.7초는 움직임 최소화 (눈동자만)",
        "반전 스팅은 4.05초에 정확히 (ffmpeg adelay=4050)",
    ],
    "cc_prompt": "너는 뷰티 코미디 쇼츠 전문 감독이다. 레퍼런스 '햄찌2위 아이라인 반전(8초 원테이크)'을 {{A}} 로 똑같이 재현한다.\n"
                 "1) 이미지 2장: 구간#1 이미지 프롬프트(완벽한 옆모습 윙) + 구간#4 이미지 프롬프트(번진 정면 미디엄샷). nano-banana-pro, 9:16.\n"
                 "2) 영상: kling-v3-omni first/last frame 모드로 8초, 또는 veo-3-1에 첫 프레임 + 구간#1의 '[전체 8초]' 프롬프트. 3안 뽑아 4.0초 리빌 타이밍이 맞는 것 선택.\n"
                 "3) 사운드: ⑦ 음악 프롬프트로 3초 재즈 스팅, 효과음 4개 생성.\n"
                 "4) 편집: ⑧ build.sh 실행. 스팅은 4.05초.\n"
                 "5) 원본과 0.33초 간격 프레임 비교 후 리포트.\n"
                 "🔴 승인 전 업로드 금지. 수정 가능 범위: 작업 폴더의 clips/, audio/, sfx/, build.sh.",
}
