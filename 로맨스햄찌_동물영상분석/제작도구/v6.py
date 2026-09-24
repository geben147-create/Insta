"""Cat family comedy — helicopter war dream, reality on the bed (markmogerz12)."""
from common import VERTICAL

DAD = [["원본: 뚱뚱한 치즈 태비 아빠 고양이", "huge chubby orange tabby cat dad with a grumpy face"],
       ["햄스터 아빠", "huge chubby golden hamster dad with a grumpy face"],
       ["코기 아빠", "big chubby Pembroke Welsh corgi dad with a grumpy face"],
       ["카피바라 아빠", "big chubby capybara dad with a deadpan face"],
       ["레서판다 아빠", "big chubby red panda dad with a grumpy face"],
       ["펭귄 아빠", "big chubby emperor penguin dad with a grumpy face"]]
MOM = [["원본: 스코티시폴드 엄마 고양이", "orange-and-white Scottish Fold cat mom with folded ears and big round eyes"],
       ["햄스터 엄마", "cream-and-white fluffy hamster mom with big round eyes"],
       ["코기 엄마", "sable-and-white corgi mom with big round eyes"],
       ["카피바라 엄마", "slightly smaller light-brown capybara mom"],
       ["레서판다 엄마", "lighter russet red panda mom with a white face"],
       ["펭귄 엄마", "slightly smaller emperor penguin mom"]]
KID = [["원본: 아기 치즈 고양이", "tiny orange tabby kitten"],
       ["아기 햄스터", "tiny golden baby hamster"],
       ["아기 코기", "tiny corgi puppy"],
       ["아기 카피바라", "tiny baby capybara"],
       ["아기 레서판다", "tiny red panda cub"],
       ["아기 펭귄", "tiny fluffy grey penguin chick"]]

GEAR = "wearing a tan tactical military helmet with a chin strap"
HELI = ("inside a military helicopter cabin in flight: olive canvas troop seats with black harness straps and steel "
        "frames on the left, riveted dark-grey fuselage, the large side door open on the RIGHT showing a bright blue sky, "
        "white clouds and a green coastline with turquoise sea far below, rotor shadow flickering")
ROOM = ("cozy real bedroom in soft morning daylight: white rumpled linen duvet, white pillows, cream upholstered "
        "headboard on the right, wooden nightstand with a linen lamp shade, phone and stacked books, sheer white curtains "
        "and a window with bare trees on the left")
LOOK_DREAM = ("photorealistic action-movie look, high contrast, saturated sky blue, handheld documentary camera with "
              "slight shake, 28mm lens, " + VERTICAL)
LOOK_REAL = ("photorealistic smartphone home-video look, soft flat daylight, muted neutral colors, slight handheld, "
             "26mm phone lens, " + VERTICAL)

A, B, C = "{{A}}", "{{B}}", "{{C}}"

VIDEO = {
    "id": 6, "page": "p6_cat_family_war_dream.html", "short": "⑥ 고양이가족 꿈반전",
    "rank_label": "동물 가족 코미디 · 꿈↔현실 반전",
    "title": "아빠가 헬기에서 엄마를 던졌다… 알고 보니 꿈(현실은 침대에서 발로 참)",
    "creator": "Mark Mogerz @markmogerz12", "url": "https://www.instagram.com/p/DdemtdmJ5BQ/",
    "likes": 188273, "comments": 3884, "date": "2026-09-19", "duration": 29.02, "res": "1080×1920", "fps": 30,
    "model_guess": "실사 고양이 + 긴 연속 카메라 무브 → Kling 계열 image2video + 연장(extend)으로 14초 꿈 파트, 별도 클립으로 침대 파트 생성 후 디졸브 (추정). 워터마크 MARKMOGERZ가 화면을 돌아다님.",
    "caption": "아빠가 가족을 전쟁터에 데려감. 엄마는 헬기에서 던져짐. 근데 혼나는 건 아빠 😂 (댓글 3,884개 = 댓글 유도력 7편 중 1위)",
    "hook": "0초: 방탄 헬멧 쓰고 소총 든 뚱뚱한 고양이 아빠와 아기 고양이가 헬기 좌석에 앉아 있음 + 열린 문 밖 하늘. '고양이가 왜 전쟁을?' 한 프레임 훅.",
    "formula": "꿈(액션 14.5초: 경례→엄마 화장→다툼→던지기) ▶ 1.3초 디졸브 ▶ 현실(13초: 침대에서 쫓겨난 엄마의 분노 + 아빠의 뻔뻔한 표정)",
    "viral": [
        "'꿈이었다' 반전: 헬기에서 던짐 = 자다가 발로 차서 침대에서 떨어뜨림. 마지막에 이해되는 구조라 끝까지 보게 됨.",
        "부부 공감 코미디(잠버릇·이불 뺏기) → 배우자 태그 댓글 폭발 (댓글 3,884).",
        "전반 에픽 음악 → 후반 거의 무음 + '야옹 야옹' 잔소리: 소리 대비로 반전 강조.",
        "엄마가 전쟁터에서 화장하는 딴짓 → 아빠 짜증 → 던지기: 캐릭터 성격이 5초 만에 설정됨.",
        "현실 파트의 아빠 '멍한 억울 표정' = 밈 캡처 포인트.",
    ],
    "look": [
        ("화면비/해상도", "9:16, 1080×1920 30fps, 29초"),
        ("꿈 파트 카메라", "0~6.4 고정에 가까운 미디엄샷 → 6.4~7.4 왼쪽으로 팬하며 엄마 등장 → 11.6~14.5 핸드헬드로 오른쪽(문 쪽) 따라감"),
        ("현실 파트 카메라", "침대 발치에서 폰으로 찍은 듯한 하이앵글 미디엄샷, 거의 고정 + 미세 흔들림"),
        ("피사체 위치(꿈)", "아빠 가로 65%·세로 45%, 아기 가로 30%·세로 60%, 엄마는 왼쪽 가장자리(가로 15%)에서 등장. 열린 문 = 우측 25%"),
        ("피사체 위치(현실)", "엄마 좌측(가로 30%, 세로 45%) 앉아서 아빠를 내려다봄, 아빠는 우측 대각선으로 누워 있고 배 위에 아기(가로 55%, 세로 60%)"),
        ("색/조명", "꿈: 쨍한 하늘색+올리브 군용색, 고대비 / 현실: 흰 이불·크림 벽, 부드러운 창가 자연광, 저채도"),
        ("워터마크", "MARKMOGERZ 반투명 텍스트가 위치를 바꿔가며 떠다님 (도용 방지)"),
    ],
    "slots": {"A": {"label": "아빠", "default": DAD[0][1], "options": DAD},
              "B": {"label": "엄마", "default": MOM[0][1], "options": MOM},
              "C": {"label": "아기", "default": KID[0][1], "options": KID}},
    "characters": [("아빠", A), ("엄마", B), ("아기", C), ("꿈 세트", HELI), ("현실 세트", ROOM),
                   ("꿈 룩", LOOK_DREAM), ("현실 룩", LOOK_REAL)],
    "negative": "human, people, blood, injury, real weapon firing, gore, text, subtitles, cartoon, extra legs, "
                "deformed paws, different fur colors between shots",
    "swaps": [
        ["고양이 → 햄스터/코기 가족", "'헬멧+소총' 소품은 몸 크기에 맞춰 'tiny' 명시. 아빠-엄마 체격 차이(아빠가 1.5배)를 반드시 유지해야 '던지기'가 성립."],
        ["고양이 → 펭귄", "헬기에서 떨어지는 장면이 '날지 못하는 새' 개그로 더 웃김. 앞발 대신 날개(flippers)로 경례."],
        ["안전 가이드", "무기는 발사 장면 없이 '들고만 있기'. 떨어지는 엄마는 과장된 코믹 표정(비명)으로 — 폭력 정책 리스크 ⚠️ 최소화."],
        ["공통", "엄마 털무늬(주황+흰색)는 꿈·현실에서 완전히 같아야 반전이 이해됨 → 캐릭터 시트 문장 고정."],
    ],
    "shots": [
        {"t0": 0.0, "t1": 6.4, "name": "[꿈] 헬기 안 아빠+아기 무장, 경례", "frames": [0.5, 3.0, 5.8],
         "size": "미디엄샷", "angle": "앉은 눈높이", "move": "거의 고정, 미세 흔들림",
         "comp": "아빠 가로 65%·세로 45%(헬멧이 세로 35%), 아기 가로 30%·세로 60%. 우측 25%는 열린 문 → 하늘·해안선.",
         "action": "둘이 소총을 안고 정면 응시 → 3초에 동시에 앞발 경례(눈 감고 진지) → 다시 총 잡기.",
         "line": "없음", "audio": "에픽 밀리터리 음악(드럼·브라스) + 헬기 로터음",
         "trans": "none", "trans_note": "카메라가 왼쪽으로 팬하며 엄마 공개 (인카메라 리빌)",
         "img": f"{A} and {C}, both {GEAR}, sitting side by side on olive canvas troop seats holding tiny rifles across their "
                f"chests, serious faces, {HELI}. {LOOK_DREAM}.",
         "vid": f"[꿈 파트 14.5초: Kling 10초 + 연장 5초, 또는 Seedance 2.0 15초] {A} and {C}, {GEAR}, sit on troop seats "
                f"{HELI}. 0-2.5s: they sit holding rifles, looking serious. 2.5-4s: both salute with one paw, eyes closed. 4-6.4s: "
                f"back to holding rifles. 6.4-7.4s: the camera pans left to reveal {B}, {GEAR}, sitting on the next seat. "
                f"7.4-11.6s: the mom calmly powders her face with a pink compact and puff while the dad glares at her. "
                f"11.6-13.4s: the dad lunges and grabs her, they scuffle and he pushes her toward the open door. 13.4-14.5s: she "
                f"tumbles out into the sky, flailing comically, while the dad leans out watching. {LOOK_DREAM}. Audio: rotor "
                f"noise, epic military drums.",
         "models": [("kling-v3", "실사 고양이 털·연속 카메라 팬·연장(extend) 최강"),
                    ("seedance-2-0", "15초 멀티 이벤트 순서 이행, 긴 원테이크"),
                    ("google veo-3-1", "로터음·음악까지 네이티브 오디오"),
                    ("minimax-h3", "표정(째려보기) 연기")]},
        {"t0": 6.4, "t1": 7.4, "name": "[꿈] 왼쪽 팬 → 엄마 등장", "frames": [6.6, 7.2],
         "size": "미디엄 와이드", "angle": "앉은 눈높이", "move": "좌측 팬(pan left) 1초",
         "comp": "엄마가 왼쪽 가장자리(가로 10→25%)로 들어옴, 아빠·아기는 오른쪽으로 밀려남.",
         "action": "엄마가 콤팩트 거울과 퍼프를 들고 앉아 있음.",
         "line": "없음", "audio": "음악 계속",
         "trans": "none", "trans_note": "같은 테이크",
         "img": f"{B}, {GEAR}, sitting on the left troop seat holding a pink compact mirror and a powder puff, {C} and {A} with "
                f"rifles on the right seats, {HELI}. {LOOK_DREAM}.",
         "vid": f"The camera pans left inside the helicopter cabin revealing {B}, {GEAR}, holding a pink compact and puff "
                f"beside {C} and {A}. {LOOK_DREAM}.",
         "models": [("kling-v3", "카메라 팬 중 캐릭터 유지"), ("seedance-2-0", "팬 속도 지시 정확")]},
        {"t0": 7.4, "t1": 11.6, "name": "[꿈] 전쟁터에서 화장하는 엄마, 째려보는 아빠", "frames": [8.0, 10.0, 11.3],
         "size": "미디엄 와이드 (3인)", "angle": "앉은 눈높이", "move": "고정",
         "comp": "엄마 가로 20%, 아기 가로 55%, 아빠 가로 85%. 세 헬멧이 세로 30~45%에 대각선.",
         "action": "엄마는 태평하게 퍼프로 얼굴을 두드림 → 아빠가 옆눈으로 째려보며 콧김.",
         "line": "없음", "audio": "음악 계속",
         "trans": "none", "trans_note": "아빠가 튀어나오는 액션으로 연결",
         "img": f"{B} calmly powdering her face with a pink puff and compact, {C} holding a rifle in the middle, {A} glaring "
                f"at her from the right, all {GEAR}, {HELI}. {LOOK_DREAM}.",
         "vid": f"{B} calmly dabs her face with a powder puff looking into a pink compact; {A} slowly turns his head and "
                f"glares at her, nostrils flaring; {C} looks between them. {LOOK_DREAM}.",
         "models": [("minimax-h3", "째려보기·태평한 표정 대비"), ("kling-v3", "3인 동시 일관성")]},
        {"t0": 11.6, "t1": 13.4, "name": "[꿈] 아빠 돌진 → 몸싸움 → 문 쪽으로 밀기", "frames": [12.0, 12.8, 13.3],
         "size": "미디엄샷", "angle": "눈높이", "move": "핸드헬드로 오른쪽(문) 따라가기",
         "comp": "두 고양이가 엉켜 화면 중앙→우측으로 이동, 문(우측)이 점점 크게.",
         "action": "아빠가 뛰어들어 엄마를 붙잡고 문 쪽으로 밀어붙임. 아기는 좌석에서 구경.",
         "line": "없음", "audio": "음악 클라이맥스, 쿵 몸싸움",
         "trans": "none", "trans_note": "같은 테이크",
         "img": f"{A} lunging at {B}, both {GEAR}, scuffling near the open helicopter door, {C} watching from the seat, "
                f"{HELI}. {LOOK_DREAM}.",
         "vid": f"{A} lunges at {B}, grabs her and wrestles her toward the open door in a comical scuffle while {C} watches; "
                f"the handheld camera follows right. {LOOK_DREAM}.",
         "models": [("kling-v3", "두 동물 몸싸움 물리"), ("seedance-2-0", "동선 이행")]},
        {"t0": 13.4, "t1": 15.15, "name": "[꿈] 엄마 낙하, 아빠가 내려다봄", "frames": [13.6, 14.2],
         "size": "미디엄 와이드 (문 밖 풍경 포함)", "angle": "눈높이", "move": "고정 → 디졸브",
         "comp": "아빠가 문턱(가로 45%)에서 몸을 내밀고, 엄마는 문 밖 하늘(가로 80%, 세로 55→75%)로 떨어지며 작아짐.",
         "action": "엄마가 팔다리 버둥대며 비명, 아빠는 만족한 듯 내려다봄.",
         "line": "없음", "audio": "음악 끝 → 바람 소리",
         "trans": {"type": "fade", "d": 1.3}, "trans_note": "1.3초 크로스 디졸브(더블 익스포저): 떨어지는 엄마 ↔ 침대 위 엄마가 겹쳐 '꿈이었다'를 설명",
         "img": f"{A}, {GEAR}, leaning out of the open helicopter door looking down; far below in the sky {B} falls "
                f"toward the coastline, limbs flailing comically, {HELI}. {LOOK_DREAM}.",
         "vid": f"{B} tumbles away through the bright sky, flailing and screaming comically, getting smaller; {A} leans out "
                f"of the door watching with satisfaction. {LOOK_DREAM}.",
         "models": [("kling-v3", "원근 낙하"), ("google veo-3-1", "하늘·해안 스케일"), ("seedance-2-0", "카메라 고정 유지")]},
        {"t0": 15.15, "t1": 19.6, "name": "[현실] 침대 — 멍한 엄마, 자고 있는 아빠와 아기", "frames": [16.0, 18.0, 19.3],
         "size": "미디엄 와이드 (침대 전체)", "angle": "침대 발치 하이앵글(서서 폰으로)", "move": "거의 고정, 미세 흔들림",
         "comp": "엄마 좌측(가로 30%, 세로 40%)에 앉음, 아빠는 우하단 대각선으로 누워 자고 아기가 배 위(가로 55%, 세로 58%). 우상단 헤드보드·스탠드.",
         "action": "엄마는 입 벌리고 멍하게(방금 차여서 떨어질 뻔), 아빠는 아기를 안고 곤히 잠.",
         "line": "없음", "audio": "음악 뚝 끊김 → 방 안 정적(-41~-44dB)",
         "trans": "none", "trans_note": "같은 테이크",
         "img": f"{ROOM}. {B} sits on the left side of the bed with her mouth open in shock; {A} sleeps sprawled diagonally "
                f"on his back on the right with {C} sleeping on his belly. {LOOK_REAL}.",
         "vid": f"[현실 파트 13.9초: Kling 10초 + 연장] {ROOM}. 0-4.5s: {B} sits stunned with her mouth open while {A} "
                f"sleeps on his back with {C} on his belly. 4.5-11s: {B} leans over and meows angrily at him again and again; "
                f"{A} wakes up and stares back with wide innocent eyes, hugging {C}. 11-13.9s: {B} pauses, glaring, while "
                f"{A} keeps an innocent face. {LOOK_REAL}. Audio: quiet room tone, loud scolding meows.",
         "models": [("kling-v3", "실사 고양이 표정·털 1위"), ("minimax-h3", "억울 표정·잔소리 입모양"),
                    ("google veo-3-1", "야옹 소리까지 네이티브 오디오")]},
        {"t0": 19.6, "t1": 26.5, "name": "[현실] 엄마의 야옹 잔소리, 아빠 억울한 눈빛", "frames": [20.5, 23.0, 25.5],
         "size": "미디엄샷", "angle": "하이앵글", "move": "아주 느린 푸시인",
         "comp": "엄마가 아빠 쪽으로 몸을 기울여 가로 35%까지 들어옴, 아빠 얼굴 가로 70%·세로 40%로 크게.",
         "action": "엄마가 앞발 들고 입을 크게 벌려 '야옹!' 연발 → 아빠가 깨서 눈 동그랗게, 아기를 안은 채 뻔뻔/억울.",
         "line": "야옹! 야옹! 야옹! (20.4~22.4 / 24.4~26.4초)", "audio": "잔소리 야옹 3연타 × 2회",
         "trans": "none", "trans_note": "같은 테이크",
         "img": f"{ROOM}. {B} leans over, one paw raised, mouth wide open meowing angrily at {A}, who lies on his back "
                f"wide awake with big innocent eyes, hugging {C}. {LOOK_REAL}.",
         "vid": f"{B} scolds {A}, meowing loudly three times with her paw raised; {A} stares back with wide innocent eyes, "
                f"hugging {C}; slow push-in. {LOOK_REAL}.",
         "models": [("minimax-h3", "입모양+표정 연기"), ("kling-v3", "실사 유지"), ("google veo-3-1", "네이티브 야옹 사운드")]},
        {"t0": 26.5, "t1": 29.02, "name": "[현실] 정적 + 웃음 한 방", "frames": [27.0, 28.6],
         "size": "미디엄샷", "angle": "하이앵글", "move": "고정",
         "comp": "엄마 좌측에서 째려봄, 아빠·아기 우측에서 정면 응시.",
         "action": "엄마가 입 다물고 노려봄, 아빠는 끝까지 무고한 척.",
         "line": "(27.4초) 히히히 — 촬영자 웃음", "audio": "촬영자 킥킥 웃음 = 홈비디오 리얼리티",
         "trans": "end", "trans_note": "웃음소리에서 끝",
         "img": f"{ROOM}. {B} glares silently at {A}, who looks straight at the camera with innocent round eyes, {C} on "
                f"his belly also staring. {LOOK_REAL}.",
         "vid": f"{B} stops meowing and glares; {A} and {C} look innocently at the camera; stillness. {LOOK_REAL}. Audio: a "
                f"person off-camera giggles.",
         "models": [("kling-v3", "정지 연기"), ("hailuo-2-3", "가성비")]},
    ],
    "audio": {
        "bgm": "0~15초: 드럼·브라스 에픽 밀리터리 음악 + 로터음 (-15dB 대로 큼). 15.5초에 음악이 뚝 끊기며 -41~-56dB 방 안 정적. 20.4~26.4초 '야옹' 잔소리 두 번, 27.4초 사람 웃음.",
        "bpm": "약 123 BPM (꿈 파트 음악)",
        "mix": "소리 대비가 반전의 절반. 디졸브 시작(14.5초)에 음악을 1초 페이드아웃 → 현실은 무음에 가까운 룸톤.",
        "music_prompt": "Epic cinematic military action theme, driving taiko and snare drums, heroic brass stabs, low strings "
                        "ostinato, helicopter-movie energy, 123 BPM, 15 seconds, ends with a big hit then silence, no vocals",
        "bgm_db": -6,
        "sfx": [
            (0.0, "헬기 로터 루프", "military helicopter interior rotor noise loop, heavy thump"),
            (2.6, "경례 척", "crisp military salute foley, fabric snap"),
            (11.8, "몸싸움 쿵", "comedic scuffle, thud and fabric rustle"),
            (13.6, "엄마 비명 + 바람", "cartoonish cat scream fading away with rushing wind"),
            (14.5, "꿈 깨는 휘익", "dreamy reverse whoosh transition, soft"),
            (15.6, "방 안 룸톤", "quiet bedroom room tone, morning birds far outside"),
            (20.4, "화난 야옹 3연타", "angry cat meows three times, scolding"),
            (24.4, "화난 야옹 3연타", "angry cat meows three times, louder"),
            (27.4, "촬영자 웃음", "person giggling softly off camera"),
        ],
    },
    "edit_terms": [
        ("꿈 시퀀스 (Dream sequence)", "비현실(전쟁)을 먼저 보여주고 현실로 깨어나는 구조."),
        ("크로스 디졸브 / 더블 익스포저", "14.5~15.8초 두 장면이 겹침 → '꿈→현실' 연결을 말없이 설명."),
        ("그래픽 매치 (Graphic match)", "떨어지는 엄마 위치 ≈ 침대 위 엄마 위치 → 겹칠 때 인과관계가 보임."),
        ("인카메라 리빌 팬 (Reveal pan)", "6.4초 왼쪽 팬으로 엄마 등장 — 컷 없이 새 인물 소개."),
        ("사운드 하드 스톱 (Smash to silence)", "에픽 음악이 뚝 → 정적. 반전을 귀로 강조."),
        ("룩 대비 (Look contrast)", "꿈 = 고대비 쨍한 색, 현실 = 저채도 폰 영상 톤."),
    ],
    "grade": "eq=contrast=1.03:saturation=1.05",
    "grade_note": "전체는 가볍게. 꿈 파트만 대비·채도를 더 올리고(contrast 1.12, saturation 1.2) 현실 파트는 채도 0.9로 낮추면 룩 대비가 커짐 (클립별 정규화 단계에서 개별 적용).",
    "subs": [],
    "strip_step": 1.0,
    "checklist": [
        "아빠·엄마·아기 캐릭터 시트 이미지 3장 먼저 (털무늬 고정)",
        "꿈 파트: 첫 프레임 이미지 → Kling v3 10초 + extend 5초 (또는 Seedance 2.0 15초)",
        "현실 파트: 침대 이미지 → Kling v3 10초 + extend",
        "디졸브: 14.5초 시작, 1.3초 (xfade=fade:duration=1.3)",
        "음악은 14.5초에서 1초 페이드아웃, 이후 룸톤만",
        "야옹 효과음 20.4초·24.4초, 웃음 27.4초",
        "워터마크는 본인 계정명으로, 위치를 3~5초마다 바꾸기(도용 방지)",
    ],
    "cc_prompt": "너는 동물 코미디 쇼츠 감독이다. 레퍼런스 '고양이 가족 헬기 꿈 반전(29초)'을 아빠 {{A}}, 엄마 {{B}}, 아기 {{C}} 로 똑같이 만든다.\n"
                 "1) 이미지: 캐릭터 시트 3장 + 구간#1(헬기) / 구간#6(침대) 첫 프레임 2장. nano-banana-pro, 9:16.\n"
                 "2) 영상: 꿈 파트 = 구간#1 '[꿈 파트 14.5초]' 프롬프트로 kling-v3 10초 + extend. 현실 파트 = 구간#6 '[현실 파트]' 프롬프트로 kling-v3 10초 + extend. clips/shot01.mp4, shot02.mp4 로 저장.\n"
                 "3) 사운드: ⑦ 음악 프롬프트(15초 에픽) + 효과음 9개.\n"
                 "4) 편집: ⑧ build.sh 실행 (디졸브 1.3초 자동 포함).\n"
                 "5) 원본 대비 디졸브 타이밍·소리 끊김 시점 검증.\n"
                 "⚠️ 무기 발사·부상 묘사 금지(플랫폼 정책). 🔴 승인 전 업로드 금지. 수정 가능 범위: 작업 폴더의 clips/, audio/, sfx/, build.sh.",
}
