"""페이지·편집 키트가 함께 쓰는 공통 데이터: 동물 캐릭터, 소품, AI 모델 사양(Pollo 2026-09-23 조회값), 공통 네거티브."""

ANIMALS = [
    {"id": "otter", "ko": "수달", "noun": "otter", "pun": "달",
     "en": "a fluffy baby Asian small-clawed otter with glossy chocolate-brown fur, a cream-colored face, throat and chest, tiny rounded ears, big glossy black eyes, a dark button nose and long whiskers"},
    {"id": "chinchilla", "ko": "친칠라", "noun": "chinchilla", "pun": "칠",
     "en": "a fluffy grey chinchilla with ultra-soft silver-grey fur, a white belly, large round ears, big glossy black eyes and long whiskers"},
    {"id": "chipmunk", "ko": "다람쥐", "noun": "chipmunk", "pun": "람",
     "en": "a small Korean chipmunk with warm orange-brown fur, five dark stripes down its back, white cheek stripes, big glossy black eyes, tiny paws and a bushy tail"},
    {"id": "kitten", "ko": "아기 고양이", "noun": "kitten", "pun": "냥",
     "en": "a fluffy cream-colored British Shorthair kitten with round copper eyes, a short round face, tiny ears and soft plush fur"},
    {"id": "puppy", "ko": "말티즈 강아지", "noun": "puppy", "pun": "멍",
     "en": "a fluffy white Maltese puppy with a round face, big glossy black eyes, a black button nose and soft cotton-like fur"},
    {"id": "penguin", "ko": "아기 펭귄", "noun": "penguin chick", "pun": "펭",
     "en": "a fluffy baby emperor penguin chick with soft silver-grey down, a white face mask, a black head cap, tiny flippers and big glossy eyes"},
    {"id": "bunny", "ko": "토끼", "noun": "bunny", "pun": "토",
     "en": "a small Holland Lop bunny with creamy-white fur, floppy ears, a twitching pink nose and big glossy dark eyes"},
    {"id": "redpanda", "ko": "레서판다", "noun": "red panda cub", "pun": "판",
     "en": "a fluffy red panda cub with rusty red-orange fur, white facial markings, dark legs, a ringed bushy tail and big glossy eyes"},
    {"id": "capybara", "ko": "카피바라", "noun": "baby capybara", "pun": "바라",
     "en": "a small baby capybara with coarse warm-brown fur, a blunt square muzzle, tiny rounded ears and calm half-closed eyes"},
    {"id": "guineapig", "ko": "기니피그", "noun": "guinea pig", "pun": "뀨",
     "en": "a fluffy tri-color guinea pig with white, ginger and black patches, a round body, tiny ears and big glossy eyes"},
    {"id": "hedgehog", "ko": "고슴도치", "noun": "hedgehog", "pun": "슴",
     "en": "a tiny African pygmy hedgehog with soft cream-and-brown quills, a white fluffy face, a pointed pink nose and small glossy black eyes"},
    {"id": "hamster", "ko": "햄스터(원본 참고용)", "noun": "hamster", "pun": "햄",
     "en": "a fluffy golden Syrian hamster with cream-orange fur, a white heart-shaped patch on its chest, tiny pink paws, big glossy black eyes, a pink nose and long whiskers"},
]

# 주인공을 '작은 직장인'처럼 보이게 하는 공통 문구 (실사 동물 해부 구조 유지)
# 채널의 '귀여움 기본값'(모든 주인공 프롬프트에 자동으로 붙음): 동글한 몸·짧은 팔·큰 눈·실제 천 재질 미니 소품
HERO_SUFFIX = ("about 20 cm tall, chubby round body, short stubby arms with tiny paws, big round glossy eyes with bright catchlights, "
               "soft fluffy fur, any clothing or props are real-fabric miniatures tailored exactly to its tiny body, "
               "sitting or standing upright like a tiny office worker, realistic animal anatomy, not a cartoon")

ACCESSORIES = [
    {"id": "lanyard", "ko": "사원증 목걸이 (추천)", "en": "wearing a tiny navy lanyard with a white employee ID card on its chest"},
    {"id": "glasses", "ko": "동그란 뿔테 안경", "en": "wearing tiny round tortoiseshell glasses"},
    {"id": "beanie", "ko": "머스타드 비니", "en": "wearing a tiny mustard-yellow knitted beanie"},
    {"id": "scarf", "ko": "빨간 스카프", "en": "wearing a tiny red neckerchief"},
    {"id": "headphones", "ko": "은색 헤드폰 (원본 상징 — 비추천)", "en": "wearing silver over-ear headphones"},
    {"id": "none", "ko": "소품 없음", "en": ""},
]

MODELS = {
    "kling-v3": {"name": "Kling 3.0", "kind": "이미지→영상", "spec": "시작·끝 프레임, 3~15초, std/pro/4K 모드, 오디오 생성",
                 "best": "실사 털·미세 표정·손동작이 안정적인 기본 주력"},
    "kling-v3-omni": {"name": "Kling 3.0 Omni", "kind": "참조→영상", "spec": "참조 이미지 최대 7장(영상 참조 시 4장), 3~15초, 16:9·9:16·1:1, 최대 4K",
                      "best": "캐릭터 시트+의상·세트 참조로 같은 동물을 여러 컷에 고정"},
    "seedance-2-0": {"name": "Seedance 2.0", "kind": "참조→영상", "spec": "참조 이미지 9장+영상 3+오디오 3, 4~15초, 최대 4K, 오디오",
                     "best": "참조를 가장 많이 넣을 수 있어 여러 인물·세트가 한 화면에 나올 때 유리"},
    "seedance-2-5": {"name": "Seedance 2.5", "kind": "이미지→영상", "spec": "시작·끝 프레임, 4~30초, 최대 1080p, 오디오",
                     "best": "긴 롱테이크·카메라 패닝(풍경·브이로그)"},
    "minimax-h3": {"name": "MiniMax H3", "kind": "이미지→영상", "spec": "시작·끝 프레임, 4~15초, 480p·768p·2K (참조형 버전 별도)",
                   "best": "과장된 표정·코믹 리액션 1순위 후보(사양 기준 추천 — A/B 테스트 권장)"},
    "hailuo-2-3": {"name": "Hailuo 2.3", "kind": "이미지→영상", "spec": "시작 프레임, 6초 또는 10초, 768p/1080p(1080p는 6초만)",
                   "best": "표정 연기·가성비 리액션 컷"},
    "veo-3-1": {"name": "Veo 3.1", "kind": "이미지→영상", "spec": "시작·끝 프레임, 4·6·8초, 최대 4K, 16:9·9:16, 오디오",
                "best": "사람 손·상반신 실사, 폰 핸드헬드 질감"},
    "gemini-omni-1-1-flash": {"name": "Gemini Omni 1.1 Flash", "kind": "참조→영상", "spec": "참조 최대 13개(이미지·영상), 3~10초, 최대 4K, 16:9·9:16",
                              "best": "참조를 많이 넣어 세트·소품·인물 동시 고정(사양 기준 추천)"},
    "viduq3-pro": {"name": "Vidu Q3 Pro", "kind": "이미지→영상", "spec": "시작·끝 프레임, 1~16초(1초 가능), 최대 2K, 오디오",
                   "best": "0.5~1초 초단컷을 싸게, 시작→끝 동작 지정"},
    "still": {"name": "정지 이미지 + 편집 줌", "kind": "이미지", "spec": "Nano Banana Pro(참조 8장, 최대 4K) 등 이미지 모델",
              "best": "0.5초 이하 인서트·초근접은 영상 생성 없이 편집 줌으로 충분"},
    "edit": {"name": "편집 효과", "kind": "편집", "spec": "FFmpeg / HyperFrames",
             "best": "암전·휩 팬·글리치·스티커·타이틀 카드"},
}

IMAGE_MODELS = [
    ("nano-banana-pro", "Nano Banana Pro", "참조 이미지 최대 8장, 1K~4K, 다양한 비율 — 캐릭터 시트를 넣고 컷별 키프레임 만들기 1순위"),
    ("seedream-5-0-pro", "Seedream 5.0 Pro", "실사 질감·조명 — 대안"),
    ("gpt-image-2-5", "GPT Image 2.5", "지시 이해력·소품 배치 — 대안"),
    ("kling-v3-image", "Kling 3.0 Image", "Kling 영상과 같은 계열 — 영상 변환 시 톤 일치"),
    ("flux-kontext-max", "FLUX Kontext Max", "기존 이미지 부분 수정(의상만 바꾸기 등)"),
]

AUDIO_MODELS = [
    ("eleven-v3", "ElevenLabs v3", "목소리(TTS) — 감정 표현 풍부, 주인공 목소리 1순위"),
    ("speech-2-8-hd", "MiniMax Speech 2.8 HD", "목소리(TTS) — 한국어 자연스러움, 사람 역할"),
    ("seed-audio-1-0", "Seed Audio 1.0", "목소리(TTS) — 대안"),
    ("suno-v5-5", "Suno v5.5", "배경음악(BGM) — 페이지의 Suno 프롬프트 그대로 사용"),
    ("h3-lipsync", "H3 Lipsync", "입 모양 맞추기 — 동물이 크게 말하는 컷에만"),
]

NEGATIVE = ("cartoon, 3D render, plastic toy, plush toy, deformed paws, extra limbs, extra fingers, human hands on the animal, "
            "visible human face or eyes, text, subtitles, watermark, logo, flicker, morphing, warping background, low resolution, oversaturated")

GEN_HINT = {
    "ref": "참조형: 캐릭터 시트(정면·측면·전신) + 이 컷 세트 이미지를 참조로 넣고 5초 생성 → 편집에서 필요한 길이만 사용",
    "i2v": "이미지→영상: 이 컷 키프레임 이미지를 시작 프레임으로 5초 생성 → 가장 좋은 구간만 사용",
    "i2v-fl": "시작+끝 프레임 지정: 시작(등장 전)·끝(등장 후) 이미지 2장으로 동작을 고정",
    "still": "영상 생성 불필요: 이미지 1장 → 편집에서 줌/푸시인",
    "edit": "영상 생성 불필요: 편집 효과로 제작",
}

# 귀여운 모먼트 사전: 컷 태그(분석 JSON 의 "cute") → 이미지 문구·움직임 문구(영어, 토큰 치환) · 편집 팁 · 효과음 팁
CUTE_LIBRARY = [
    {"tag": "작은 모자·소품 착용", "img": "{HERO} wearing a tiny real-fabric hat sized exactly to its head, visible knit or stitch texture, hat slightly tilted",
     "mot": "The hat wobbles a little each time the {ANIMAL} moves its head.", "edit": "처음엔 MS로 모자까지 실루엣 전체 → 다음 컷 CU로 모자+눈. 소품이 바뀌는 장면은 하드컷", "sfx": "소품 등장 순간 '뽁'(pop)"},
    {"tag": "의상(꿀벌 옷 등)", "img": "{HERO} wearing a tiny real-fabric fuzzy onesie costume (for example a bee suit with pom-pom antennae and small felt wings) tailored exactly to its round body",
     "mot": "The costume's pom-pom antennae bob and the little wings bounce as the {ANIMAL} moves.", "edit": "상상·꿈 장면 전용 의상 → 하프 글리산도+디졸브로 들어가고 레코드 스크래치로 현실 복귀", "sfx": "진입 하프 글리산도, 복귀 레코드 스크래치"},
    {"tag": "헤드폰·시그니처 소품", "img": "{HERO} wearing its signature accessory in exactly the same way in every shot",
     "mot": "The accessory stays fixed in place while the {ANIMAL} moves.", "edit": "모든 컷 같은 소품 = 캐릭터 인식표. 원본의 은색 헤드폰은 쓰지 말고 맨 위 '소품'에서 고른 것 사용", "sfx": "-"},
    {"tag": "짧은 팔 춤·제스처", "img": "{HERO} raising its short stubby arms, tiny paws open, chubby round belly showing",
     "mot": "The {ANIMAL} bounces and waves its short arms side to side in quick small beats, like a tiny dance.", "edit": "0.4~0.6초 컷 2~3개를 박자에 맞춰 붙이고 마지막 컷만 1초 유지 + 푸시인 5%", "sfx": "박자마다 가벼운 '뿅'·'톡'"},
    {"tag": "앞발 모으기·흔들기", "img": "{HERO} holding its two tiny front paws together in front of its chest",
     "mot": "The {ANIMAL} rubs its tiny paws together, then shakes them quickly at chest height.", "edit": "애교·소원·몰래 기쁨 대사와 CU. 흰 4각 별 스티커를 곁들이면 효과 두 배", "sfx": "'샤랑' 반짝 차임"},
    {"tag": "앞발로 입 가리기", "img": "{HERO} pressing both tiny stubby paws over its mouth in surprise, eyes huge",
     "mot": "The {ANIMAL} gasps and presses both paws to its mouth, trembling slightly.", "edit": "바로 다음 컷을 크래시 줌(초근접)으로 — 놀람 2단 강조", "sfx": "'헉' 숨 + 줌 '쭈욱'"},
    {"tag": "동그란 눈 클로즈업", "img": "extreme close-up of {HERO}'s big round glossy black eyes with bright catchlights, whiskers sharp",
     "mot": "The {ANIMAL}'s eyes slowly widen, then it blinks once.", "edit": "같은 원본을 2~4배 확대하거나 크래시 줌으로 ECU, 0.5~0.9초만 보여 주기", "sfx": "'띠용'·'뾰로롱'"},
    {"tag": "윙크·반짝이", "img": "{HERO} giving a playful wink with a tiny smug smile, one short paw raised to its cheek",
     "mot": "A slow playful wink and a smug little smile, then hold still.", "edit": "흰 4각 별 2~3개를 0.06초 간격으로 톡톡 등장(HyperFrames sparkle)", "sfx": "'띠링' 반짝"},
    {"tag": "볼 빵빵·오물오물", "img": "{HERO} with cheeks stuffed and puffed out, holding food with both tiny paws right at its mouth",
     "mot": "The {ANIMAL} chews rapidly with puffed cheeks, whiskers twitching.", "edit": "먹는 컷은 1.5~3초로 길게, 컷 안 푸시인 3~5%로 볼에 집중", "sfx": "오물오물·바삭 ASMR을 대사보다 살짝 작게"},
    {"tag": "몸보다 큰 물건 안기", "img": "{HERO} hugging an object almost as big as its own body with both short arms, leaning back under the weight",
     "mot": "The {ANIMAL} hugs it tighter and wobbles under the weight.", "edit": "하이앵글 MS로 크기 대비부터 → CU로 표정", "sfx": "부스럭·'끙'"},
    {"tag": "사람과 크기 대비", "img": "tiny {HERO} next to human hands, legs or office furniture at real scale, camera low at the animal's eye level",
     "mot": "The {ANIMAL} looks up at the human and blinks.", "edit": "사람은 입 아래로 자르고, 동물 눈높이 로우앵글 와이드 → 동물 CU", "sfx": "-"},
    {"tag": "빼꼼 고개 내밀기", "img": "{HERO} peeking over an edge with only its round ears, big eyes and two tiny paws gripping the edge visible",
     "mot": "The {ANIMAL} slowly rises into view, grips the edge, then snaps its head left and right.", "edit": "첫 컷 훅으로 최고(0.8~1.5초). 두리번은 모션블러 살리기", "sfx": "솟아오를 때 '뾰롱'"},
    {"tag": "고개 갸웃", "img": "{HERO} tilting its head to one side in confusion, one ear flicked",
     "mot": "The {ANIMAL} slowly tilts its head and one ear flicks.", "edit": "되묻는 대사에 0.6~1초", "sfx": "물음표 '띵?'"},
    {"tag": "멍한 눈", "img": "{HERO} with a blank glassy stare, mouth slightly open, completely still",
     "mot": "The {ANIMAL} stays frozen except for one slow blink.", "edit": "같은 원본 3단 줌(MS→MCU→ECU, 0.7초씩) + 로딩 스피너/수식 오버레이", "sfx": "정적 또는 심장 저음 박동을 컷마다"},
    {"tag": "혀 빼꼼", "img": "{HERO} frozen with a blank stare and the tip of its tiny pink tongue poking out (blep)",
     "mot": "The tip of the {ANIMAL}'s tongue slowly pokes out; nothing else moves.", "edit": "직전에 음악을 끊고 0.5초 정적 → 혀", "sfx": "상승 휘슬 '띠용'"},
    {"tag": "질끈 감은 눈", "img": "{HERO} squeezing its eyes shut tightly, whiskers pulled back",
     "mot": "The {ANIMAL} squeezes its eyes shut and freezes.", "edit": "잔상 전환으로 MS→CU 크래시 줌", "sfx": "임팩트 '쿵'"},
    {"tag": "벌러덩 뒤집어짐·넘어짐", "img": "{HERO} lying flat on its back with its round belly up and short limbs in the air, eyes wide open",
     "mot": "The {ANIMAL} topples backward onto its back with a soft flop, tiny limbs flailing, then freezes.", "edit": "넘어지는 순간 하드컷, 다음 컷은 위에서 내려다보는 하이앵글 1~1.5초", "sfx": "'쿵'·'뿅' + 짧은 정적"},
    {"tag": "기어오르기", "img": "{HERO} clambering up onto a ledge much taller than itself, hind legs scrabbling",
     "mot": "The {ANIMAL} scrambles up, slips once, then makes it and settles.", "edit": "하이앵글 고정, 올라선 순간 컷", "sfx": "기합 숨소리 + '뽁'"},
    {"tag": "낑낑 힘쓰기", "img": "{HERO} straining with both tiny paws to push or lift something bigger than itself",
     "mot": "The {ANIMAL} pushes with a little grunt, wobbling on its hind legs.", "edit": "뒷모습 OTS로 힘쓰는 동작 → 정면 CU로 표정", "sfx": "'끙' 숨소리"},
    {"tag": "뒷모습·엉덩이", "img": "{HERO} seen from behind, round fluffy rear and tiny tail toward the camera",
     "mot": "The {ANIMAL} waddles away, its round rear wiggling.", "edit": "OTS(어깨 너머)로 동물과 화면·상황을 한 번에", "sfx": "종종걸음 '톡톡'"},
    {"tag": "졸림·낮잠", "img": "{HERO} asleep curled up on a soft towel, eyes closed, tiny paws tucked under its chin",
     "mot": "The {ANIMAL} breathes slowly, then opens its eyes and looks at the camera.", "edit": "4~6초 롱테이크, 눈 뜨는 순간 다음 컷", "sfx": "새근새근 숨소리"},
    {"tag": "셀카 초근접", "img": "{HERO}'s face pressed too close to a phone lens, slightly out of focus, big curious eyes",
     "mot": "The {ANIMAL} leans into the lens, then pulls back as the focus snaps in.", "edit": "브이로그 첫 컷, 핸드헬드. 마지막 반전 컷에서 한 번 더", "sfx": "폰 조작 '툭'"},
    {"tag": "엎드려 울기", "img": "{HERO} lying face-down on a desk, both tiny paws covering its face, round back hunched",
     "mot": "The {ANIMAL} slumps forward and sobs, its round back shaking.", "edit": "엔딩 컷 — BGM 하드 컷아웃과 함께", "sfx": "흐느낌"},
]

# 효과음 사전: 편집 키트 파일명 → 쓰는 때·타이밍·볼륨·길이·무료 검색어(영문)
SFX_LIBRARY = {
    "pop.wav": ("팝 '뽁·뾰롱'", "등장·소품·스티커가 톡 나타날 때", "컷 시작과 동시(0~+0.05초)", "0.7~0.8", "0.1~0.3초", "cartoon pop, bubble pop, cute pop"),
    "boing.wav": ("'띠용'", "황당·되묻기·혀 빼꼼", "리액션 컷 시작 +0.05~0.15초", "0.7", "0.4~0.8초", "boing, cartoon spring, slide whistle up"),
    "question_ding.wav": ("물음표 '띵?'", "갸웃·의아", "표정이 바뀌는 순간", "0.6~0.7", "0.3초", "question ding, cute notification, curious ding"),
    "harp_gliss.wav": ("하프 글리산도", "상상·꿈 장면 진입", "디졸브 시작 0.2초 전부터", "0.6", "1~1.5초", "harp glissando, dream transition, magic harp"),
    "sparkle.wav": ("반짝 '샤랑·띠링'", "윙크·반짝이 스티커·좋은 소식", "스티커 등장과 동시", "0.6~0.7", "0.5~1초", "sparkle chime, twinkle, magic shimmer"),
    "record_scratch.wav": ("레코드 스크래치", "상상에서 현실 복귀", "현실 컷 시작과 동시(스매시 컷)", "0.8", "0.5초", "record scratch, vinyl stop"),
    "impact.wav": ("임팩트 '쿵'", "충격·반전·크래시 줌", "크래시 줌 시작과 동시", "0.8~0.9", "0.5~1초", "cinematic impact hit, boom hit, dramatic hit"),
    "whoosh.wav": ("휙(우쉬)", "줌 블러·휩 팬·빠른 전환", "전환 0.05~0.1초 전에 시작해 컷에서 가장 큼", "0.6~0.7", "0.3~0.6초", "whoosh, swish, fast transition"),
    "click.wav": ("클릭·톡톡", "트랙패드·버튼·키 누르기", "앞발이 닿는 프레임", "0.5~0.6", "0.1초", "mouse click, button click, trackpad tap"),
    "keyboard.wav": ("키보드 타자", "일하는 척·게임", "동작 내내(작게)", "0.4", "1~3초", "keyboard typing, mechanical keyboard"),
    "slurp.wav": ("빨대 쪽쪽", "음료 마시기", "빨대 무는 순간", "0.6", "1~2초", "straw slurp, drinking straw"),
    "shutter.wav": ("카메라 셔터 '찰칵'", "사진 컷이 바뀔 때마다", "사진 컷 시작과 동시(연타는 컷마다)", "0.7", "0.2초", "camera shutter, phone camera click"),
    "typing.wav": ("자막 타자 소리", "타이틀 카드·타자 자막", "글자가 찍히는 동안", "0.4~0.5", "자막 길이", "typewriter typing, text typing blips"),
    "fanfare.wav": ("팡파레", "성공·승급(작게 쓰면 '소심한 세레머니')", "성공 컷 시작과 동시", "0.6~0.8", "1~2초", "victory fanfare, level up, small fanfare"),
    "heartbeat.wav": ("심장박동", "긴장·3단 줌 공포", "3단 줌 각 컷 +0.1초", "0.8", "0.4초×회", "heartbeat, tense heartbeat"),
    "drone_low.wav": ("긴장 드론", "위기 구간 바닥에 깔기", "위기 시작 컷부터 구간 끝까지", "0.4~0.5", "3~6초", "tension drone, suspense drone low"),
    "boom_low.wav": ("저음 '둥'", "불길한 반전·위기 시작", "위기 컷 +0.06~0.08초", "0.8", "0.6~1초", "low boom, sub drop, ominous hit"),
    "amb_birds.wav": ("새소리·야외", "야외·하늘 장면", "장면 내내", "0.3~0.4", "장면 길이", "birds ambience, park ambience"),
    "amb_wind.wav": ("바람", "야외 셀카·꽃밭", "장면 내내", "0.3", "장면 길이", "light wind ambience"),
    "amb_water.wav": ("물가", "호수·바다", "장면 내내", "0.3", "장면 길이", "lake ambience, gentle waves"),
    "amb_restaurant.wav": ("레스토랑", "식당 장면", "장면 내내", "0.3", "장면 길이", "restaurant ambience, cutlery"),
    "amb_cafe.wav": ("카페", "카페 장면", "장면 내내", "0.3", "장면 길이", "cafe ambience, coffee shop"),
    "amb_room.wav": ("사무실 룸톤", "음악을 빼고 조용히 보여 줄 때", "구간 내내", "0.3", "구간 길이", "office room tone, office ambience"),
    "laugh_vo.wav": ("웃음", "즐거운 장면", "표정과 동시", "0.6", "1초", "cute giggle, light laugh"),
    "sob_vo.wav": ("흐느낌", "우는 척·엔딩", "동작과 동시", "0.6", "1~2초", "cartoon sob, crying sniff"),
    "breath_vo.wav": ("숨소리·기합", "힘쓰기·기어오르기·한숨", "동작 시작과 동시", "0.7~0.8", "0.3~1초", "small effort grunt, cute sigh"),
    "munch.wav": ("먹는 소리", "먹방", "씹는 동작 내내", "0.5~0.6", "1~3초", "crunchy eating, munching ASMR"),
    "laptop_open.wav": ("노트북 여는 소리", "노트북 열기", "뚜껑이 움직이는 프레임", "0.7", "0.5초", "laptop open, hinge creak"),
    "login_chime.wav": ("로그인 '띠링'", "화면 켜짐·알림", "화면이 밝아지는 순간", "0.6", "0.5초", "login chime, notification ding"),
    "glitch.wav": ("글리치 '지지직'", "깨지는 자막·오류", "글리치 자막 등장과 동시", "0.6", "0.3~0.5초", "digital glitch, static burst"),
    "clatter.wav": ("달그락", "컵·숟가락·그릇을 끌거나 저을 때", "물건이 닿는 프레임", "0.5~0.6", "0.3~1초", "ceramic mug clatter, spoon stirring"),
    "creak.wav": ("삐걱", "의자·문", "움직임 시작과 동시", "0.5", "0.5초", "office chair creak, door creak"),
    "paper_flap.wav": ("종이 펄럭", "서류를 흔들거나 던질 때", "동작과 동시", "0.6", "0.3~0.5초", "paper flap, paper whoosh"),
    "pour.wav": ("쪼르륵", "소스·물 붓기", "붓기 시작과 동시", "0.5", "1~2초", "liquid pouring, sauce pour"),
    "sizzle.wav": ("지글지글", "볶기·굽기", "팬에 닿는 컷부터 구간 내내", "0.4~0.5", "구간 길이", "frying sizzle, pan sizzle"),
    "clink.wav": ("챙", "그릇·유리 부딪힘", "부딪히는 프레임", "0.6", "0.3초", "glass clink, bowl clink"),
    "applause.wav": ("박수", "발표·축하", "박수 동작 컷부터", "0.5", "2~3초", "audience applause, small crowd clapping"),
    "cheer.wav": ("환호", "성공·축하 리액션", "리액션 컷 시작과 동시", "0.6", "1초", "small cheer, yay"),
    "footsteps.wav": ("발소리", "인물 등장·퇴장", "걸음 프레임에 맞춰", "0.4~0.5", "1~2초", "footsteps office, walking"),
}

WHO_COLOR = {  # 타임라인 색상 (주인공/사람/상상/인서트/편집)
    "hero": "#f59e0b", "hero_costume": "#eab308", "cw1": "#22c55e", "cw2": "#3b82f6", "boss": "#64748b",
    "leader": "#a3e635", "friend": "#94a3b8", "group": "#a855f7", "insert": "#14b8a6", "black": "#111827", "card": "#6b7280",
}
WHO_KO = {"hero": "주인공", "hero_costume": "주인공(상상 의상)", "cw1": "동료1", "cw2": "동료2", "boss": "윗선 상사",
          "leader": "팀장", "friend": "친구", "group": "여럿", "insert": "인서트", "black": "암전", "card": "타이틀 카드"}
