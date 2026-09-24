"""Food animation — tonkatsu: sleepy pork gets a spa treatment and becomes a cutlet (yummyworldstory)."""
from common import VERTICAL
from v4 import HELPERS

MAIN = [
    ["원본: 졸린 돼지고기 등심", "thick block of raw pink pork loin with a white fat cap, a sleepy blissful face and tiny stubby pink limbs"],
    ["닭가슴살 (치킨까스)", "plump raw chicken breast with a sleepy blissful face and tiny stubby limbs"],
    ["햄스터 모양 고기", "raw pink pork loin block shaped like a chubby sleeping hamster with tiny ears and stubby limbs"],
    ["아기 돼지 모양", "raw pork loin block shaped like a sleeping baby piglet with a tiny snout and stubby legs"],
    ["물범 모양 흰살생선 (생선까스)", "white fish fillet shaped like a sleepy baby seal with tiny flippers"],
]

LOOK = ("cozy 3D claymation-meets-photoreal food animation, warm late-afternoon sunlight from a window on the left "
        "casting long soft shadows, light oak butcher-block counter, glass flour jars with wooden lids, hanging wooden "
        "utensils, creamy bokeh, 50mm lens at counter level, " + VERTICAL)

A = "{{A}}"
B = "{{B}}"

VIDEO = {
    "id": 5, "page": "p5_flour_tonkatsu.html", "short": "⑤ 밀가루2 돈까스",
    "rank_label": "밀가루 2 · 음식 의인화",
    "title": "마사지 받던 돼지고기가 돈까스 정식이 되기까지",
    "creator": "Yummy World Story @yummyworldstory", "url": "https://www.instagram.com/yummyworldstory/reel/Dc00m8zsO6b/",
    "likes": 823314, "comments": 843, "date": "2026-09-03", "duration": 20.27, "res": "1080×1920", "fps": 30,
    "model_guess": "우하단 Gemini ✦ 워터마크 → Google Veo 3 / 3.1로 생성한 클립 6개를 편집 (추정). 호떡 편과 같은 제작 공식.",
    "caption": "돈까스 🍛 Tonkatsu | Japanese Pork Cutlet (#foodanimation #foodshorts #shorts)",
    "hook": "0초: 도마 위 돼지고기가 수건 베개를 베고 '스파 마사지'받는 표정 + 셰프모자 고기망치가 등 위에서 망치질. '고기 두드리기 = 마사지'라는 말장난 한 컷으로 웃김.",
    "formula": "스파(고기 두드리기) → 밀가루 샤워 → 계란 다이빙 → 빵가루 부대 → 결연히 걸어가 튀김 입수 → 황금 슬라이스 → 정식 완성(양배추·밥·소스)",
    "viral": [
        "요리 과정 = 캐릭터 '고생담'. 마사지로 행복 → 튀김 앞에서 비장한 표정 → 튀겨져서 웃는 얼굴: 감정 곡선이 있음.",
        "튀김 냄비로 스스로 걸어가는 결연한 표정(9~12초) = 가장 많이 캡처되는 밈 포인트.",
        "0~7.6초 한 컷 안에 이벤트 5개(망치·밀가루·계란·빵가루) → 초반 몰입도 극대화.",
        "마지막 6초 '재료가 하늘에서 떨어져 정식이 완성' = 만족감(satisfying) 엔딩.",
        "시리즈형 포맷(호떡 편과 동일 세트·룩) → 팔로우 유도.",
    ],
    "look": [
        ("화면비/해상도", "9:16, 1080×1920 30fps"),
        ("카메라", "카운터 눈높이 50mm, 대부분 고정. 7.6초 컷만 45° 하이앵글, 12.2초 튀김 컷은 냄비 위에서 약간 내려다봄"),
        ("주인공 위치", "0~7.6초: 고기가 화면 하단 55~72%, 가로 전체의 80% / 9~12초: 서 있는 커틀릿이 좌측 1/3 / 엔딩: 접시가 하단 60%"),
        ("배경", "밝은 오크 카운터, 나무 뚜껑 유리병(밀가루·설탕), 행주, 창문 역광. 튀김 컷은 스테인리스 냄비 + 인덕션"),
        ("조명", "왼쪽 창문 늦은 오후 햇살, 긴 그림자, 밀가루 먼지에 빛이 산란(볼류메트릭)"),
        ("색 팔레트", "생고기 핑크 #E9A3A0 · 빵가루 베이지 #E6D2AE · 튀김 골드 #C98B3A · 양배추 연두 #CFE3A6 · 소스 브라운 #5A2A12"),
    ],
    "slots": {"A": {"label": "주인공 고기", "default": MAIN[0][1], "options": MAIN},
              "B": {"label": "조연 스타일", "default": HELPERS[0][1], "options": HELPERS}},
    "characters": [("주인공 (공통)", A), ("조연 규칙 (공통)", B), ("룩 (공통)", LOOK)],
    "negative": "human hands, people, blood, gore, knife cutting on screen, text, subtitles, horror face, burnt food, "
                "cold blue light",
    "swaps": [
        ["돼지 → 닭/생선", "음식 이름과 소스만 바꾸면 같은 구조: 치킨까스(데미글라스), 생선까스(타르타르)."],
        ["고기를 동물 모양으로", "귀여움은 올라가지만 '튀긴다'는 설정이 잔인해 보일 수 있음 → 표정을 항상 행복/당당하게, 튀김 컷은 '온천 입욕'처럼 연출(수건 머리에 얹기)."],
        ["조연 → 동물 셰프", "고기망치를 햄스터 셰프가 들고 두드리는 식. 동작이 커지므로 첫 컷을 8초로 늘려 생성."],
    ],
    "shots": [
        {"t0": 0.0, "t1": 7.6, "name": "스파 마사지 → 밀가루 → 계란 → 빵가루 (한 컷 5이벤트)", "frames": [1.0, 4.8, 6.0, 7.0],
         "size": "미디엄 클로즈업 (도마 위 고기)", "angle": "카운터 눈높이 약간 위", "move": "고정",
         "comp": "고기가 화면 하단 절반을 가로로 꽉 채움, 얼굴은 왼쪽(가로 30%, 세로 62%). 조연은 항상 고기 위/오른쪽 위(세로 25~45%)에서 등장.",
         "action": "0~3.8: 셰프모자 쓴 나무 고기망치가 고기 등 위에서 톡톡 두드림, 고기는 수건 베개 베고 황홀한 미소. 3.8~5.4: 밀가루 모찌 캐릭터가 그릇에서 밀가루를 퍼 뿌리고 올라타 밀가루 폭발. 5.4~6.3: 계란이 두 팔 벌려 점프, 고기 위에서 깨지며 노른자 스플래시. 6.3~7.6: 모닝빵 캐릭터 부대가 뛰어와 빵가루를 뿌림.",
         "line": "없음", "audio": "통통 망치 소리, 밀가루 푸슉, 계란 톡+철퍽, 빵가루 사르륵",
         "trans": "cut", "trans_note": "빵가루 범벅 순간 → 튀김옷 완성 컷으로",
         "img": f"{A}, lying on a wooden cutting board with its head resting on a folded white towel like at a spa, eyes "
                f"closed in bliss; a small wooden meat-mallet character wearing a white chef hat stands on its back holding a "
                f"tiny mallet. Glass flour jars behind. {LOOK}.",
         "vid": f"{A} lies on a cutting board resting on a towel like at a spa, smiling blissfully. 0-3.8s: a meat-mallet "
                f"chef character taps its back rhythmically like a massage. 3.8-5.4s: a round flour character scoops flour from "
                f"a bowl and showers it, then hops on, making a cloud of flour. 5.4-6.3s: a cheerful egg character leaps in and "
                f"cracks open on top with a yolk splash. 6.3-7.6s: little bread-roll characters run in and sprinkle panko crumbs. "
                f"{B}. Static camera. {LOOK}.",
         "models": [("google veo-3-1", "원본 계열, 밀가루·계란 파티클/액체 최강"), ("seedance-2-0", "한 컷 4이벤트 순서 이행 1위"),
                    ("kling-v3", "캐릭터 다수 등장 일관성"), ("minimax-h3", "황홀한 표정 연기")]},
        {"t0": 7.6, "t1": 9.07, "name": "튀김옷 입은 커틀릿 클로즈업 (미소)", "frames": [8.0, 8.8],
         "size": "클로즈업", "angle": "45° 하이앵글", "move": "아주 느린 푸시인",
         "comp": "빵가루 커틀릿이 화면 중앙 대각선, 얼굴(점 눈+웃는 입) 세로 40%. 뒤로 칼·볼 보케.",
         "action": "빵가루 옷을 입고 만족스럽게 웃음, 눈 깜빡.",
         "line": "없음", "audio": "빵가루 바삭 ASMR",
         "trans": "cut", "trans_note": "하드컷 → 걸어가는 컷",
         "img": f"{A}, now fully coated in thick fluffy white panko breadcrumbs, lying on a bamboo board, simple dot eyes "
                f"and a happy smile, 45-degree high angle. {LOOK}.",
         "vid": f"Close-up of the panko-coated cutlet character on a bamboo board, it blinks and smiles contentedly, crumbs "
                f"falling, very slow push-in. {LOOK}.",
         "models": [("google veo-3-1", "빵가루 질감"), ("kling-v3", "얼굴 유지"), ("hailuo-2-3-fast", "짧은 컷 가성비")]},
        {"t0": 9.07, "t1": 12.17, "name": "결연하게 기름 냄비로 걸어가기", "frames": [9.5, 10.6, 11.8],
         "size": "미디엄샷", "angle": "카운터 눈높이", "move": "고정",
         "comp": "커틀릿이 좌측 1/3(가로 30%)에서 서서 걸음, 우측 하단에 기름 담긴 스테인리스 냄비(화면 오른쪽 40%).",
         "action": "두 발로 서서 도마 위를 걸어오다 멈춤 → 눈썹 찡그린 비장한 표정으로 냄비를 봄.",
         "line": "없음", "audio": "바삭바삭 발소리, 긴장감 효과음",
         "trans": "cut", "trans_note": "시선이 냄비로 향한 뒤 컷 = 시선 컷(eyeline cut)",
         "img": f"The panko-coated cutlet character standing upright on thin legs on a wooden board, determined frowning "
                f"eyebrows, facing a stainless pot of hot oil on the right, window light. {LOOK}.",
         "vid": f"The panko-coated cutlet character walks on its little legs across the cutting board toward a pot of hot "
                f"oil, stops at the edge and looks at the pot with a determined frowning face, taking a deep breath. {LOOK}.",
         "models": [("kling-v3", "걷기+표정 전환"), ("minimax-h3", "비장한 표정"), ("seedance-2-0", "정지 타이밍")]},
        {"t0": 12.17, "t1": 13.77, "name": "튀김 입수 (시무룩)", "frames": [12.5, 13.4],
         "size": "미디엄샷 (냄비 위)", "angle": "약간 하이앵글", "move": "고정",
         "comp": "냄비가 화면 하단 60%, 커틀릿 얼굴이 기름 중앙(세로 50%)에 떠 있음.",
         "action": "보글보글 튀겨지며 입꼬리 내린 시무룩한 표정.",
         "line": "없음", "audio": "튀김 소리 크게",
         "trans": "cut", "trans_note": "튀김 소리 유지한 채 슬라이스 컷으로",
         "img": f"The breaded cutlet character floating in a stainless pot of bubbling frying oil, grumpy pouting face, "
                f"wooden counter behind. {LOOK}.",
         "vid": f"The breaded cutlet character deep-fries in bubbling oil, pouting grumpily as it slowly turns golden. {LOOK}. "
                f"Audio: loud crackling deep-fry sizzle.",
         "models": [("google veo-3-1", "튀김 기포+사운드"), ("kling-v3", "얼굴 유지")]},
        {"t0": 13.77, "t1": 14.93, "name": "황금 슬라이스들 웃음", "frames": [14.0, 14.6],
         "size": "미디엄샷", "angle": "약간 하이앵글", "move": "고정",
         "comp": "6조각 슬라이스가 냄비 안 가로로 나란히(세로 45%), 각자 얼굴.",
         "action": "잘린 단면이 보이는 슬라이스들이 동시에 방긋 웃음.",
         "line": "없음", "audio": "지글 + 귀여운 효과",
         "trans": "cut", "trans_note": "→ 접시 엔딩",
         "img": "Six golden-brown tonkatsu slices lined up in the frying pot, each with tiny smiling faces, juicy white pork "
                f"cross-sections visible. {LOOK}.",
         "vid": f"Six golden tonkatsu slices sit in the oil and smile together, a little wiggle, bubbling oil. {LOOK}.",
         "models": [("google veo-3-1", "튀김 질감"), ("kling-v3", "다수 얼굴")]},
        {"t0": 14.93, "t1": 20.27, "name": "정식 완성: 다리 달린 슬라이스 → 양배추 → 밥 → 소스병", "frames": [15.5, 17.0, 19.0, 20.1],
         "size": "미디엄샷 (접시)", "angle": "30° 하이앵글", "move": "고정",
         "comp": "흰 접시가 화면 하단 55~75%. 양배추는 뒤쪽 중앙, 밥은 앞 중앙, 소스병 캐릭터는 좌측 위(가로 25%, 세로 30%).",
         "action": "15~16: 슬라이스들이 작은 다리로 접시 위에 줄 서기 → 16.5~17.5: 채 썬 양배추 회오리가 위에서 내려와 쌓임(+마요네즈) → 18~19: 밥이 톡 떨어짐 → 19.5~20.3: 소스병 캐릭터가 등장해 돈까스 소스를 뿌림.",
         "line": "없음", "audio": "톡톡 떨어지는 소리, 소스 주르륵",
         "trans": "end", "trans_note": "소스 뿌리는 순간 끝 = 식욕 최고점 엔딩",
         "img": "A white plate on an oak counter with six golden tonkatsu slices with tiny legs, a tall mound of finely "
                "shredded cabbage with mayo, a scoop of white rice, and a small tonkatsu-sauce bottle character with dot eyes "
                f"standing beside it drizzling sauce. {LOOK}.",
         "vid": "On a white plate, golden tonkatsu slices with tiny legs line up; a swirl of shredded cabbage drops in from "
                "above and stacks, a dollop of mayo lands on top, a scoop of rice pops onto the plate, then a cute sauce-bottle "
                f"character hops in and drizzles glossy tonkatsu sauce across the slices. Static camera. {LOOK}.",
         "models": [("seedance-2-0", "순차 낙하 이벤트 이행"), ("google veo-3-1", "음식 광고 퀄리티"), ("kling-v3", "캐릭터 소스병")]},
    ],
    "audio": {
        "bgm": "대사 없음(Whisper 음성 미검출). 빠르고 통통 튀는 효과음 중심 ASMR + 가벼운 BGM. 소리 크기 변화가 큼(-17~-40dB) = 이벤트마다 효과음 강조.",
        "bpm": "약 184 BPM 측정(빠른 효과음 연타 영향) → 음악 기준으로는 92 BPM 하프타임 느낌",
        "mix": "효과음이 주인공. 튀김 컷(12.2~14.9초)은 지글 소리를 가장 크게(-12dB), 나머지 BGM -14dB.",
        "music_prompt": "Cute bouncy Japanese kitchen cartoon music, koto plucks mixed with marimba and pizzicato, light "
                        "wood blocks, 92 BPM, cheerful and cozy, 20 seconds, no vocals, leaves space for foley",
        "bgm_db": -14,
        "sfx": [
            (0.3, "고기망치 통통 (마사지)", "soft rhythmic wooden mallet tapping on raw meat, gentle thumps"),
            (4.0, "밀가루 푸슉", "flour poof cloud burst, soft powder whoosh"),
            (5.5, "계란 점프 + 깨짐", "cartoon boing then eggshell crack and yolk splat"),
            (6.5, "빵가루 사르륵 + 발소리", "breadcrumbs sprinkling, tiny running footsteps"),
            (9.3, "바삭 발걸음", "crunchy crispy footsteps, small"),
            (11.5, "비장한 효과음", "comedic dramatic tension sting, short"),
            (12.2, "튀김 지글지글", "loud deep fry crackling sizzle"),
            (13.8, "슬라이스 방긋", "cute pop sparkle"),
            (16.5, "양배추 사르르", "shredded cabbage falling rustle"),
            (18.2, "밥 톡", "soft rice plop"),
            (19.6, "소스 주르륵", "thick sauce squeeze drizzle"),
        ],
    },
    "edit_terms": [
        ("멀티 이벤트 롱컷", "0~7.6초 한 컷 안에 조연 4명 순차 등장 → 컷 없이도 빠른 리듬."),
        ("아이라인 컷 (Eyeline cut)", "커틀릿이 냄비를 바라봄 → 다음 컷이 냄비 속. 시선이 연결을 설명."),
        ("감정 곡선 (Emotional arc)", "행복(스파) → 비장(걷기) → 시무룩(튀김) → 행복(슬라이스)."),
        ("J컷 느낌 사운드", "튀김 소리가 컷보다 먼저/길게 이어져 장면을 묶음."),
        ("빌드업 엔딩 (Stacking)", "마지막 5초: 양배추→밥→소스가 하나씩 쌓이며 완성."),
        ("시리즈 룩 (Series look)", "호떡 편과 같은 카운터·빛·워터마크 = 계정 아이덴티티."),
    ],
    "grade": "eq=contrast=1.04:saturation=1.1,colorbalance=rh=0.05:gh=0.02:bh=-0.03,vignette=PI/8",
    "grade_note": "창문 햇살 하이라이트를 더 노랗게(하이라이트 레드/그린+), 튀김 골드가 살아나도록 채도 +10%.",
    "subs": [],
    "strip_step": 0.5,
    "checklist": [
        "컷1(7.6초)은 8초 생성으로 한 번에 — 이벤트 순서가 틀리면 Seedance 2.0으로 재생성",
        "커틀릿 얼굴(점 눈+입)은 모든 컷에서 같은 위치·크기",
        "튀김 컷은 사운드가 핵심 — Veo 네이티브 오디오 유지 또는 지글 효과음 -12dB",
        "엔딩 쌓기 순서: 슬라이스 → 양배추 → 마요 → 밥 → 소스",
        "컷 길이: 7.6 / 1.47 / 3.1 / 1.6 / 1.16 / 5.34초",
    ],
    "cc_prompt": "너는 음식 의인화 애니메이션 쇼츠 감독이다. 레퍼런스 '돈까스 정식(20.3초, 6컷)'을 주인공 {{A}}, 조연 규칙 '{{B}}' 로 똑같이 만든다.\n"
                 "1) 이미지: ⑥ 컷별 이미지 프롬프트 6장 (nano-banana-pro, 1번 결과를 레퍼런스로).\n"
                 "2) 영상: 컷1은 seedance-2-0 또는 veo-3-1 8초, 나머지는 veo-3-1/kling-v3. ⑧ 표의 길이로 트림.\n"
                 "3) 사운드: ⑦ 음악 프롬프트 + 효과음 11개.\n"
                 "4) 편집: ⑧ build.sh 실행.\n"
                 "5) 원본과 컷 타이밍 비교 리포트.\n"
                 "🔴 승인 전 업로드 금지. 수정 가능 범위: 작업 폴더의 clips/, audio/, sfx/, build.sh.",
}
