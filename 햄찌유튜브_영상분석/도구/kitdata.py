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
HERO_SUFFIX = "about 20 cm tall, sitting or standing upright like a tiny office worker, realistic animal anatomy, not a cartoon"

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

WHO_COLOR = {  # 타임라인 색상 (주인공/사람/상상/인서트/편집)
    "hero": "#f59e0b", "hero_costume": "#eab308", "cw1": "#22c55e", "cw2": "#3b82f6", "boss": "#64748b",
    "leader": "#a3e635", "friend": "#94a3b8", "group": "#a855f7", "insert": "#14b8a6", "black": "#111827", "card": "#6b7280",
}
WHO_KO = {"hero": "주인공", "hero_costume": "주인공(상상 의상)", "cw1": "동료1", "cw2": "동료2", "boss": "윗선 상사",
          "leader": "팀장", "friend": "친구", "group": "여럿", "insert": "인서트", "black": "암전", "card": "타이틀 카드"}
