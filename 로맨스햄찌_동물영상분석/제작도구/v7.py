"""Cute character — peeks from behind a wall and brings a crystal heart (powy_mozzi)."""
from common import SMALL_ANIMALS, VERTICAL

OPTIONS = [["원본: 하얀 모찌 요정", "round snow-white fluffy mochi-like baby creature with a huge round head, tiny dot eyes and pink blush cheeks"]] + [
    ["아기 " + lab.split(" (")[0], val.replace("chubby ", "").replace("fluffy ", "") + ", baby version with an oversized round head and pink blush cheeks"]
    for lab, val in SMALL_ANIMALS]

CHAR = ("{{A}}, Pixar-style 3D plush character, ultra-soft dense fur you want to touch, tiny black bead eyes, small "
        "pink nose, rosy blush cheeks, short stubby arms, a small fluffy round tail, wearing little mint-green gingham "
        "overalls with a bib pocket, wooden buttons and rolled-up cuffs, pink feet")

SET = ("secret garden at golden hour: an old reddish brick pillar covered in green ivy and blue-grey moss on the RIGHT, "
       "a low stone garden wall with ivy behind, lush grass sprinkled with tiny white and pink daisies in the foreground, "
       "warm low sun behind the wall creating rim light and orange bokeh at the top-left")

LOOK = ("high-end 3D animated film look (Pixar / Disney quality), subsurface-scattered fur, golden-hour backlight with "
        "warm rim light, very shallow depth of field, 50mm lens at the character's eye level, " + VERTICAL)

VIDEO = {
    "id": 7, "page": "p7_cute_heart_peekaboo.html", "short": "⑦ 귀여운 캐릭터 하트",
    "rank_label": "귀여움 · 로맨스(고백)",
    "title": "벽 뒤에서 기다리다 하트를 내미는 모찌 캐릭터",
    "creator": "POWY @powy_mozzi (with @openart_ai)", "url": "https://www.instagram.com/p/DYe8VW3xYw4/",
    "likes": 683798, "comments": 1879, "date": "2026-05-18", "duration": 9.59, "res": "720×1280", "fps": 30,
    "model_guess": "OpenArt 태그 → OpenArt에서 이미지(3D 캐릭터) 생성 후 image-to-video (Kling / Hailuo 계열로 추정). 720p 30fps 약 10초 한 컷.",
    "caption": "음.. 안녕.. 벽 뒤에서 너 기다렸어 ☺️ 내 사랑을 가득 담은 하트를 가져왔어 💖 (시청자에게 말 거는 2인칭 캡션)",
    "hook": "0초: 벽 뒤에 반쯤 숨은 캐릭터가 카메라(나)를 훔쳐봄 → 1.2초 쏙 숨어버림(빈 화면). '어? 어디 갔지?' 하는 궁금증이 시청을 붙잡음.",
    "formula": "빼꼼(0~1.2) → 숨기(1.2~2.0) → 다시 빼꼼(2.0~3.0) → 뒷짐 지고 수줍게 걸어옴(3.0~6.9) → 하트 공개(6.9~9.6)",
    "viral": [
        "2인칭 시점 — 캐릭터가 '나'를 향해 걸어와 선물을 줌 → 시청자가 고백받는 느낌 (DM 공유·연인 태그).",
        "숨바꼭질(peek-a-boo) 긴장 → 뒷짐으로 뭔가 숨김 → 마지막에 선물 공개: 3단 기대감.",
        "빨간 크리스탈 하트 = 화면 전체 유일한 강한 빨강 → 마지막 프레임이 썸네일이자 '저장' 포인트.",
        "골든아워 역광 + 솜털 = 누구나 '만지고 싶다'는 반응.",
        "대사 없이 캡션으로만 감정 전달 → 언어 무관 글로벌 확산.",
    ],
    "look": [
        ("화면비/해상도", "9:16, 원본 720×1280 30fps, 약 9.6초"),
        ("카메라", "아이레벨(캐릭터 눈높이 = 지면에서 낮게), 3초부터 캐릭터를 따라 천천히 전진하는 달리인 + 살짝 왼쪽으로 아크"),
        ("피사체 위치", "0초: 기둥 왼쪽에 몸 절반, 얼굴 중심 가로 45%·세로 42% / 7초 이후: 정중앙, 얼굴이 화면 상단 55% 채움, 하트는 세로 65~70%"),
        ("배경", "오른쪽 붉은 벽돌 기둥(담쟁이+푸른 이끼), 뒤쪽 돌담, 앞쪽 데이지 잔디. 후반엔 전부 보케"),
        ("조명", "해 질 녘 역광(좌상단 주황 하이라이트), 털 가장자리 림라이트, 얼굴은 부드러운 반사광"),
        ("색 팔레트", "크림화이트 · 민트 깅엄 #B9D3A8 · 벽돌 #A35C4A · 이끼블루 #5C6F86 · 하트 루비레드 #D11A2A"),
        ("워터마크", "하단 중앙 @powy_mozzi (재현 시 본인 계정명으로)"),
    ],
    "slots": {"A": {"label": "주인공", "default": OPTIONS[0][1], "options": OPTIONS}},
    "characters": [("주인공 (공통 문장)", CHAR), ("세트 (공통 문장)", SET), ("룩 (공통 문장)", LOOK)],
    "negative": "realistic animal, photo, scary, text, subtitles, extra limbs, deformed hands, fast camera, cuts, "
                "harsh light, heart visible before the reveal",
    "swaps": [
        ["모찌 → 아기 동물", "머리 비율을 몸의 1.3배 이상 크게('oversized round head') 유지해야 같은 귀여움이 나옴."],
        ["귀가 큰 동물(토끼·친칠라)", "기둥 뒤에 숨을 때 귀가 삐져나옴 → 1.2~2.0초 '빈 화면'이 깨짐. '귀까지 완전히 숨는다(ears fully hidden)' 명시."],
        ["펭귄·카피바라", "뒷짐이 어려운 체형 → '하트를 몸 뒤에 숨긴 채(hiding the heart behind its back)'로 표현을 바꾸기."],
        ["하트 소품", "빨간 크리스탈 하트는 동물이 바뀌어도 그대로 유지 (이 영상의 '시그니처 오브젝트')."],
    ],
    "shots": [
        {
            "t0": 0.0, "t1": 1.2, "name": "벽 뒤에서 빼꼼", "frames": [0.1, 0.8],
            "size": "풀샷 (전신)", "angle": "로우 아이레벨", "move": "고정",
            "comp": "오른쪽 30%를 벽돌 기둥이 차지. 캐릭터는 기둥 왼쪽에 몸 절반만 보임, 얼굴 가로 45%·세로 42%.",
            "action": "기둥에 몸을 숨긴 채 고개만 내밀고 카메라를 바라보며 살짝 미소.",
            "line": "없음 (캡션: '음.. 안녕..')", "audio": "귀여운 BGM 시작 (136 BPM 추정)",
            "trans": "none", "trans_note": "같은 테이크",
            "img": f"{CHAR}. It is half hidden behind the ivy-covered brick pillar on the right, peeking out shyly and looking "
                   f"straight at the camera with a tiny smile, only the left half of its body visible. {SET}. {LOOK}.",
            "vid": f"[전체 10초 한 번에 생성 — 권장] {CHAR}. {SET}. 0-1.2s: it peeks out from behind the brick pillar, looking at "
                   "the camera. 1.2-2s: it quickly hides completely behind the pillar, leaving only the garden visible. 2-3s: it "
                   "slowly peeks out again with a shy head tilt. 3-6.9s: it steps out and waddles toward the camera with both "
                   "hands hidden behind its back, looking down shyly, while the camera slowly dollies in at its eye level. "
                   "6.9-7.5s: it stops in the center, raises worried shy eyebrows, and brings its hands forward revealing a "
                   "glossy faceted red crystal heart. 7.5-10s: it holds the heart out toward the camera with pleading puppy eyes "
                   f"and gentle breathing. No cuts. {LOOK}.",
            "models": [("kling-v3", "3D 플러시 털·걷기(waddle)·카메라 달리인 동시 처리 최강"),
                       ("minimax-h3", "수줍은 표정·눈썹 연기가 가장 귀여움"),
                       ("seedance-2-0", "10초 롱테이크 동작 순서(숨기→다시 빼꼼) 지시 이행 정확"),
                       ("google veo-3-1", "골든아워 조명·보케 품질")],
        },
        {
            "t0": 1.2, "t1": 2.0, "name": "쏙 숨기 — 빈 화면(기대감)", "frames": [1.4],
            "size": "풀샷 (캐릭터 없음)", "angle": "로우 아이레벨", "move": "고정",
            "comp": "기둥과 정원만. 화면 중앙이 비어 있음 = 시청자 시선이 기둥 가장자리로 쏠림.",
            "action": "캐릭터가 기둥 뒤로 완전히 숨음.",
            "line": "없음", "audio": "BGM 계속",
            "trans": "none", "trans_note": "빈 화면(empty frame)이 '쉼표' 역할",
            "img": f"{SET}. No character visible, empty garden with the brick pillar on the right, golden hour. {LOOK}.",
            "vid": f"{SET}. The character has hidden behind the pillar; the frame shows only the empty garden with gently "
                   f"swaying daisies. Static camera. {LOOK}.",
            "models": [("kling-v3", "원테이크 유지"), ("seedance-2-0", "퇴장→재등장 순서 이행")],
        },
        {
            "t0": 2.0, "t1": 3.0, "name": "다시 빼꼼 (고개 갸웃)", "frames": [2.4],
            "size": "풀샷", "angle": "로우 아이레벨", "move": "고정 → 달리인 시작",
            "comp": "캐릭터가 기둥 가장자리(가로 60%)에 몸을 붙이고 얼굴만. 0초보다 더 오른쪽.",
            "action": "수줍게 고개를 기울이며 다시 등장, 몸을 앞으로 내밀기 시작.",
            "line": "없음", "audio": "BGM 계속",
            "trans": "none", "trans_note": "걸어 나오는 동작으로 연결",
            "img": f"{CHAR}. Peeking out again from the right pillar edge with a shy head tilt and a small smile. {SET}. {LOOK}.",
            "vid": f"{CHAR}. {SET}. It slowly peeks out again from behind the pillar with a shy head tilt, then leans forward "
                   f"to step out. {LOOK}.",
            "models": [("minimax-h3", "갸웃 표정"), ("kling-v3", "연결 동작")],
        },
        {
            "t0": 3.0, "t1": 6.9, "name": "뒷짐 지고 뒤뚱뒤뚱 걸어오기", "frames": [3.4, 4.7, 6.0],
            "size": "풀샷 → 미디엄 풀샷", "angle": "아이레벨 (캐릭터 눈높이)", "move": "천천히 달리인 + 좌측 아크, 캐릭터를 따라감",
            "comp": "캐릭터가 화면 중앙~좌측으로 대각선 이동, 몸이 점점 커짐(화면 높이 40%→60%). 기둥은 화면 밖으로 사라짐.",
            "action": "양손을 등 뒤로 숨기고(뭔가 감춤) 고개를 숙인 채 수줍게 뒤뚱뒤뚱 4~5걸음.",
            "line": "없음 (캡션: '벽 뒤에서 너 기다렸어')", "audio": "발걸음이 BGM 박자(약 0.44초 간격)에 맞음",
            "trans": "none", "trans_note": "멈춰 서는 동작으로 연결",
            "img": f"{CHAR}. Waddling toward the camera across the daisy lawn with both hands hidden behind its back, head "
                   f"lowered shyly, stone wall with ivy blurred behind. {LOOK}.",
            "vid": f"{CHAR}. {SET}. It waddles toward the camera with both hands behind its back, head slightly lowered, "
                   f"shy steps in rhythm, the camera slowly dollies in and arcs slightly left keeping it centered. {LOOK}.",
            "models": [("kling-v3", "뒤뚱 걸음 + 카메라 트래킹"), ("seedance-2-0", "카메라 무브 정확"),
                       ("minimax-h3-fast", "빠른 시안")],
        },
        {
            "t0": 6.9, "t1": 7.5, "name": "하트 공개", "frames": [7.0, 7.3],
            "size": "미디엄샷", "angle": "아이레벨 정면", "move": "달리인 마무리 → 정지",
            "comp": "캐릭터 정중앙, 얼굴 세로 35~45%, 두 손이 가슴 앞(세로 65%)으로.",
            "action": "눈썹을 걱정스럽게 올리고, 숨겼던 두 손을 앞으로 → 빨간 크리스탈 하트 등장.",
            "line": "없음 (캡션: '사랑을 가득 담은 하트를 가져왔어')", "audio": "BGM 계속 (공개 순간 반짝 효과음 추천)",
            "trans": "none", "trans_note": "하트 등장 = 감정 클라이맥스",
            "img": f"{CHAR}. Standing centered, bringing both hands forward from behind its back to reveal a glossy faceted "
                   f"red crystal heart at chest height, worried shy eyebrows. Blurred garden behind. {LOOK}.",
            "vid": f"{CHAR}. It stops in front of the camera, raises shy worried eyebrows and brings its hands from behind its "
                   f"back to reveal a sparkling faceted red crystal heart. {LOOK}.",
            "models": [("kling-v3", "손에서 소품 등장(reveal) 자연스러움"), ("google veo-3-1", "크리스탈 굴절·반짝임 표현")],
        },
        {
            "t0": 7.5, "t1": 9.59, "name": "하트 내밀고 애교 눈빛 홀드", "frames": [8.0, 9.4],
            "size": "미디엄 클로즈업 (얼굴+하트)", "angle": "아이레벨 정면", "move": "거의 고정, 아주 미세한 푸시인",
            "comp": "얼굴이 화면 상단 55%, 하트가 정중앙 하단(세로 68%). 배경 완전 보케.",
            "action": "하트를 카메라 쪽으로 살짝 내밀며 촉촉한 눈으로 바라봄, 호흡에 따라 몸이 살짝 오르내림.",
            "line": "없음", "audio": "BGM 끝부분",
            "trans": "end", "trans_note": "하트 든 정지 컷으로 끝 → 마지막 프레임이 썸네일",
            "img": f"{CHAR}. Medium close-up, holding a glossy red crystal heart out toward the camera with both hands, pleading "
                   f"shy puppy eyes, rosy cheeks, creamy golden bokeh behind. {LOOK}.",
            "vid": f"{CHAR}. It holds the red crystal heart out toward the camera with both hands, looking up with shy pleading "
                   f"eyes, gentle breathing, tiny head tilt. Nearly static camera with a very slow push-in. {LOOK}.",
            "models": [("minimax-h3", "애교 눈빛 연기"), ("kling-v3", "털·크리스탈 디테일 유지")],
        },
    ],
    "audio": {
        "bgm": "귀여운 어쿠스틱/뮤직박스 계열 BGM 한 곡 (대사 없음, Whisper 음성 미검출). 소리 크기 -20→-14dB로 점점 커지는 빌드업.",
        "bpm": "약 136 BPM (강한 박 간격 약 0.44초 — 걷기 발걸음과 일치)",
        "mix": "BGM 단독 + 끝으로 갈수록 볼륨 상승(크레셴도). 재현 시 하트 공개 7.0초에 반짝 효과음을 추가하면 감정 강조.",
        "music_prompt": "Adorable heartwarming kawaii music box and ukulele melody, soft glockenspiel, light pizzicato strings, "
                        "136 BPM, gentle crescendo, shy romantic confession mood, 10 seconds, no vocals",
        "bgm_db": -2,
        "sfx": [
            (0.9, "쏙 숨는 소리", "tiny cute swoosh, soft cartoon hide sound"),
            (3.4, "뒤뚱 발소리 (반복)", "soft plush footsteps on grass, 4 tiny steps, cute"),
            (7.0, "하트 반짝", "magical sparkle twinkle chime, crystal shimmer, 1 second"),
        ],
    },
    "edit_terms": [
        ("피커부 (Peek-a-boo) 구조", "나타남→사라짐→다시 나타남. 최소 1초 이상의 '빈 화면'이 기대감을 만든다."),
        ("POV / 2인칭 연출", "캐릭터가 카메라(시청자)를 향해 다가옴 = 시청자가 주인공."),
        ("트래킹 달리인 (Tracking dolly-in)", "3초부터 캐릭터 걸음 속도에 맞춰 카메라 전진."),
        ("오브젝트 리빌 (Object reveal)", "뒷짐으로 숨긴 하트를 마지막에 공개."),
        ("컬러 포인트 (Color accent)", "화면 유일한 강한 빨강 = 하트. 마지막 프레임 시선 고정."),
        ("크레셴도 사운드", "BGM이 끝으로 갈수록 커지며 감정이 고조."),
    ],
    "grade": "eq=contrast=1.02:saturation=1.1:gamma=1.03,colorbalance=rh=0.04:gh=0.02:bs=0.03,vignette=PI/7",
    "grade_note": "하이라이트는 따뜻하게(골든아워), 그림자는 살짝 푸르게(이끼 톤) = 틸&오렌지 약하게. 비네팅으로 캐릭터 집중.",
    "subs": [],
    "strip_step": 0.33,
    "checklist": [
        "캐릭터 턴어라운드 1장(정면/측면)을 먼저 만들어 레퍼런스로 사용",
        "첫 프레임: 기둥 뒤 빼꼼 이미지 → image2video 10초 1회",
        "1.2~2.0초 '빈 화면'이 반드시 나오게 (안 나오면 재생성)",
        "하트는 7.0초 전에 절대 보이면 안 됨 (네거티브에 명시)",
        "마지막 2초는 움직임 최소화 → 썸네일로 사용",
        "캡션은 2인칭 속삭임 톤 + 하트 이모지",
    ],
    "cc_prompt": "너는 3D 애니메이션 쇼츠 감독이다. 레퍼런스 '벽 뒤 빼꼼 → 하트 고백(9.6초 원테이크)'을 {{A}} 로 똑같이 만든다.\n"
                 "1) 이미지: 구간#1 이미지 프롬프트로 첫 프레임 (midjourney-v8 --ar 9:16 또는 nano-banana-pro).\n"
                 "2) 영상: kling-v3 image2video 10초, 구간#1 '[전체 10초]' 프롬프트. 3안 중 빈 화면(1.2~2.0초)과 하트 공개(7.0초) 타이밍이 맞는 것 선택.\n"
                 "3) 사운드: ⑦ 음악 프롬프트(136BPM) + 효과음 3개.\n"
                 "4) 편집: ⑧ build.sh 실행, 워터마크는 본인 계정명.\n"
                 "5) 원본 대비 0.33초 간격 비교 리포트.\n"
                 "🔴 승인 전 업로드 금지. 수정 가능 범위: 작업 폴더의 clips/, audio/, sfx/, build.sh.",
}
