"""Food animation — hotteok made by living ingredients (yummyworldstory)."""
from common import VERTICAL

DOUGH = [
    ["원본: 하얀 반죽 덩어리", "round soft white bread-dough blob character with tiny black bead eyes, a small o-shaped mouth, faint pink cheeks and two stubby dough arms"],
    ["햄스터 모양 반죽", "soft white bread dough shaped like a chubby hamster with tiny round dough ears, black bead eyes and pink cheeks"],
    ["아기 물범 반죽", "soft white bread dough shaped like a baby harp seal with tiny flippers and black bead eyes"],
    ["병아리 반죽", "soft pale-yellow bread dough shaped like a round baby chick with a tiny dough beak"],
    ["토끼 모양 반죽", "soft white bread dough shaped like a round bunny with two short dough ears"],
    ["곰 모양 반죽", "soft white bread dough shaped like a chubby bear cub with round ears"],
    ["고양이 모양 반죽", "soft white bread dough shaped like a loaf cat with small triangle ears"],
]
HELPERS = [
    ["원본: 재료가 직접 캐릭터", "each ingredient is itself a tiny cute character with bead eyes and thin legs"],
    ["햄스터 셰프들이 재료 운반", "each ingredient is carried in by a tiny hamster chef wearing a white chef hat"],
    ["아기 펭귄들이 재료 운반", "each ingredient is carried in by a tiny baby penguin wearing a little apron"],
    ["다람쥐들이 재료 운반", "each ingredient is carried in by a tiny squirrel wearing a striped apron"],
]

LOOK = ("cozy stop-motion claymation meets photoreal food cinematography, warm golden kitchen light from the left, "
        "creamy bokeh, butcher-block wooden counter, shelves with ceramic bowls, jars and wooden cutting boards in the "
        "blurred background, 50mm lens at counter level, " + VERTICAL)

A = "{{A}}"
B = "{{B}}"

VIDEO = {
    "id": 4, "page": "p4_flour_hotteok.html", "short": "④ 밀가루1 호떡",
    "rank_label": "밀가루 1 · 음식 의인화",
    "title": "밀가루와 물방울이 부딪혀 호떡이 되기까지",
    "creator": "Yummy World Story @yummyworldstory", "url": "https://www.instagram.com/p/DdIX6nvp4Ih/",
    "likes": 1001925, "comments": 788, "date": "2026-09-11", "duration": 20.5, "res": "1080×1920", "fps": 60,
    "model_guess": "우하단 ✦✦ 반짝이 워터마크 = Google Gemini(Veo) 생성 표시 → Veo 3 / Veo 3.1로 8초 이하 클립 여러 개 생성 후 편집. 60fps는 후처리 보간/업스케일 (추정).",
    "caption": "호떡 🥞 Hotteok | Korean Sweet Pancake (#foodanimation #koreanfood #shorts) — 텍스트 없이 요리 과정만",
    "hook": "0초에 투명 물방울 캐릭터가 비명을 지르며 밀가루 더미로 돌진 → 1.5초에 '퍽' 충돌. 첫 1.5초 안에 사건(충돌)이 일어남.",
    "formula": "재료 1개 = 1컷(평균 2.6초) × 7단계 레시피 → 완성 요리 클로즈업 1초 = '레시피를 캐릭터 이벤트로 바꾼' 구조",
    "viral": [
        "실제 호떡 레시피 순서(반죽→이스트→흑설탕→시나몬→견과→기름→누르기→뒤집기)를 캐릭터 사건으로 치환 → 교육+귀여움.",
        "매 컷마다 새 캐릭터 등장 = 2~3초마다 새 자극 (시청 유지).",
        "주인공(반죽)은 고정, 조연(재료)만 교체 → 스토리 따라가기 쉬움.",
        "마지막에 김 나는 완성 호떡 + 흘러나오는 시럽 = 식욕 자극 엔딩 → 저장/공유.",
        "대사·자막 없이 효과음 ASMR로만 진행 → 전 세계 공통.",
        "밝은 우드톤 주방 한 세트만 반복 → 시리즈(돈까스 등)로 확장 쉬움.",
    ],
    "look": [
        ("화면비/해상도", "9:16, 원본 1080×1920 60fps (생성은 24~30fps, 후보정 60fps 보간 추정)"),
        ("카메라", "카운터 높이(재료 눈높이) 50mm, 대부분 고정 + 아주 느린 푸시인. 팬 쇼트는 6컷에서 프라이팬 쪽으로 약간 이동"),
        ("주인공 위치", "반죽이 화면 가로 35~50%, 세로 45~60% (하단 1/3 선 바로 위). 조연은 항상 반죽 오른쪽에서 등장"),
        ("배경", "크림색 타일 벽, 나무 선반(도자기 볼·유리병), 나무 도마, 매달린 행주. 3·4번 컷은 나무 주걱 꽂힌 테라코타 항아리 배경으로 바뀜"),
        ("조명", "왼쪽 창에서 들어오는 따뜻한 골든 라이트, 부드러운 그림자, 반죽 표면 하이라이트"),
        ("색 팔레트", "버터크림 #F4EBDD · 오크우드 #B98555 · 흑설탕 브라운 #7A4A25 · 황금 크러스트 #D69A45"),
        ("워터마크", "우하단 Gemini ✦ 반짝이 (재현 시 제거하거나 본인 로고)"),
    ],
    "slots": {"A": {"label": "주인공 반죽", "default": DOUGH[0][1], "options": DOUGH},
              "B": {"label": "재료 조연 스타일", "default": HELPERS[0][1], "options": HELPERS}},
    "characters": [("주인공 반죽 (공통)", A), ("조연 규칙 (공통)", B), ("룩 (공통)", LOOK)],
    "negative": "human hands, people, text, subtitles, logo, horror, messy kitchen, cold light, extra eyes, melting face, "
                "cut to a different kitchen style",
    "swaps": [
        ["반죽 → 동물 모양 반죽", "'shaped like a …' 로 모양만 바꾸고 재질(soft white bread dough)은 유지해야 반죽이 늘어나고 합쳐지는 물리 표현이 살아있음."],
        ["조연 → 동물 셰프", "동물이 재료를 '들고 와서 넣는' 동작으로 바뀜 → 각 컷 길이가 0.5초 정도 늘어남. 전체 22초 이내 유지."],
        ["다른 음식으로 확장", "같은 공식: 주재료 1개 주인공 + 레시피 단계별 조연 + 완성 클로즈업. (예: 붕어빵, 떡볶이, 김밥)"],
    ],
    "shots": [
        {"t0": 0.0, "t1": 3.17, "name": "물방울이 밀가루에 돌진 → 반죽 탄생", "frames": [0.2, 1.5, 2.6],
         "size": "풀샷 (카운터 위 두 캐릭터)", "angle": "카운터 눈높이", "move": "고정",
         "comp": "밀가루 더미 가로 25%·세로 55%, 물방울은 오른쪽(가로 65%)에서 왼쪽으로 달려옴. 배경 선반이 상단 40%.",
         "action": "투명 물방울이 두 팔 들고 비명 지르며 달려와 밀가루에 충돌 → 밀가루와 물이 섞이며 공중에서 빙글 돌아 둥근 반죽으로 변신.",
         "line": "없음", "audio": "달려오는 발소리, 퍽 충돌 + 스플래시, 섞이는 찰흙 소리",
         "trans": "cut", "trans_note": "반죽이 완성되는 순간 컷",
         "img": f"A small mound of white flour with tiny bead eyes on a wooden counter on the left; a clear glossy water-droplet "
                f"character with thin legs runs in from the right with both arms raised, screaming. {LOOK}.",
         "vid": f"A clear water-droplet character runs in from the right screaming and crashes into a small flour mound "
                f"character; flour bursts, they merge, the mixture spins in mid-air and forms {A}, which lands softly and blinks. "
                f"Static camera. {LOOK}. Audio: tiny footsteps, splat, squishy dough sounds.",
         "models": [("google veo-3-1", "원본 계열, 액체+가루 물리 충돌 표현 최고"), ("kling-v3", "변신(morph) 연결 자연스러움"),
                    ("seedance-2-0", "짧은 이벤트 순서 이행 정확"), ("minimax-h3", "캐릭터 표정")]},
        {"t0": 3.17, "t1": 6.77, "name": "이스트가 뛰어들어 반죽이 부풀어 오름", "frames": [3.3, 4.5, 6.0],
         "size": "미디엄샷 (반죽 크게)", "angle": "카운터 눈높이", "move": "고정 + 미세 푸시인",
         "comp": "반죽 중앙(가로 45%), 이스트 조각이 오른쪽 위에서 점프해 반죽 오른쪽 옆구리로 들어감.",
         "action": "작은 이스트 큐브 캐릭터가 점프해 반죽 속으로 쏙 → 반죽이 기지개 켜듯 두 배로 부풀고 살짝 튀어 오름(발효).",
         "line": "없음", "audio": "퐁 들어가는 소리, 부풀어 오르는 스트레치 소리",
         "trans": "cut", "trans_note": "반죽이 화면 밖으로 튀어나가며 컷 (액션 컷)",
         "img": f"{A} sits on the counter; a tiny beige yeast-cube character with stick legs leaps toward its side. {LOOK}.",
         "vid": f"A tiny yeast-cube character leaps into the side of {A}; the dough giggles, slowly puffs up to double its size, "
                f"bounces once and settles with a happy face. {B}. Static camera. {LOOK}.",
         "models": [("google veo-3-1", "부풀기(스케일 변화) 자연스러움"), ("kling-v3", "캐릭터 일관성"),
                    ("hailuo-2-3", "가성비")]},
        {"t0": 6.77, "t1": 9.88, "name": "흑설탕 속을 삼키기", "frames": [7.0, 7.6, 9.2],
         "size": "미디엄샷", "angle": "카운터 눈높이", "move": "고정",
         "comp": "배경이 바뀜: 나무 주걱 꽂힌 테라코타 항아리·설탕 단지. 반죽 가로 50%, 흑설탕 더미 오른쪽 하단.",
         "action": "반죽이 흑설탕 경단 위로 뛰어 덮치고 꿀꺽 삼킴 → 만족한 표정, 주변에 설탕 알갱이.",
         "line": "없음", "audio": "사르륵 설탕 소리, 꿀꺽",
         "trans": "cut", "trans_note": "만족 표정 홀드 후 컷",
         "img": f"{A} beside a glossy ball of brown sugar and cinnamon filling on a wooden counter, terracotta crock with "
                f"wooden spoons and a white sugar jar blurred behind, warm window light. {LOOK}.",
         "vid": f"{A} hops onto a ball of dark brown sugar filling, wraps around it and swallows it, then sits back with a "
                f"satisfied smile while sugar crystals scatter on the counter. Static camera. {LOOK}.",
         "models": [("google veo-3-1", "감싸기·흡수 물리"), ("kling-v3", "반죽 질감 유지"), ("seedance-2-0", "동작 순서")]},
        {"t0": 9.88, "t1": 12.87, "name": "시나몬 스틱이 가루를 뿌려줌", "frames": [10.0, 11.0, 12.4],
         "size": "미디엄샷", "angle": "카운터 눈높이", "move": "고정",
         "comp": "원래 주방 배경으로 복귀. 반죽 왼쪽(가로 35%), 시나몬 스틱 캐릭터 오른쪽(가로 85%) 세로로 서 있음.",
         "action": "시나몬 스틱이 몸을 톡톡 털어 가루를 뿌림 → 반죽이 신나서 폴짝 뛰었다 착지, 볼 발그레.",
         "line": "없음", "audio": "톡톡 가루 떨어지는 소리, 반죽 폴짝",
         "trans": "cut", "trans_note": "하드컷(같은 배경이라 매치컷처럼 보임)",
         "img": f"{A} on the left and a standing cinnamon-stick character with tiny eyes on the right, a small pile of cinnamon "
                f"powder between them. {LOOK}.",
         "vid": f"A cinnamon-stick character taps itself and sprinkles cinnamon powder; {A} jumps happily in the air, lands "
                f"and blushes with delight. {B}. Static camera. {LOOK}.",
         "models": [("google veo-3-1", "가루 파티클"), ("kling-v3", "점프 착지 탄성"), ("minimax-h3", "볼 발그레 표정")]},
        {"t0": 12.87, "t1": 15.58, "name": "견과류 친구들이 다진 견과 배달", "frames": [13.0, 13.8, 15.2],
         "size": "미디엄샷", "angle": "카운터 눈높이", "move": "고정",
         "comp": "반죽 왼쪽(가로 30%), 땅콩·호두·아몬드 캐릭터 4개가 오른쪽에서 일렬로 걸어옴(세로 58% 라인).",
         "action": "견과 캐릭터들이 다진 견과 더미를 밀어주고 퇴장 → 반죽이 흡수하고 다시 동그랗게.",
         "line": "없음", "audio": "종종걸음, 바삭 견과 소리",
         "trans": "cut", "trans_note": "카운터 → 가스레인지로 장소 이동 컷",
         "img": f"{A} on the left; a peanut, a walnut and an almond character with tiny legs stand in a row on the right next "
                f"to a pile of chopped nuts. {LOOK}.",
         "vid": f"Little peanut, walnut and almond characters march in from the right and push a pile of chopped nuts toward "
                f"{A}, which absorbs them and becomes round and plump again. {B}. Static camera. {LOOK}.",
         "models": [("kling-v3", "다수 캐릭터 동시 걷기"), ("seedance-2-0", "여러 캐릭터 동선"), ("google veo-3-1", "원본 계열")]},
        {"t0": 15.58, "t1": 19.05, "name": "기름방울 입수 → 반죽 점프 → 호떡 누르개", "frames": [15.8, 17.0, 18.6],
         "size": "미디엄샷 (프라이팬 + 가스레인지)", "angle": "약간 위에서 (15°)", "move": "고정",
         "comp": "무쇠 프라이팬이 화면 하단 50%. 반죽은 팬 왼쪽 가장자리(가로 20%, 세로 40%)에 앉아 있다가 중앙으로 점프.",
         "action": "황금 기름방울 캐릭터가 팬에 다이빙 → 동심원 물결 → 반죽이 '야호' 점프해 기름에 착지 → 스테인리스 호떡 누르개 캐릭터가 위에서 꾹 눌러 납작하게.",
         "line": "없음", "audio": "기름 첨벙, 치이익 지글지글, 꾹 누르는 소리",
         "trans": "cut", "trans_note": "누르는 순간에서 컷 → 뒤집기",
         "img": f"{A} sits on the rim of a cast-iron frying pan on a gas stove; a golden oil-droplet character jumps into the "
                f"pan making ripples, cozy kitchen behind. {LOOK}.",
         "vid": f"A golden oil-droplet character dives into the hot pan creating ripples; {A} happily jumps into the pan and "
                f"lands with a sizzle; a stainless-steel hotteok press character with tiny eyes presses it flat. {LOOK}. "
                f"Audio: splash, sizzling oil.",
         "models": [("google veo-3-1", "기름 물결·지글 사운드까지 한 번에"), ("kling-v3", "점프 궤적"),
                    ("seedance-2-0", "3단 이벤트 순서")]},
        {"t0": 19.05, "t1": 19.45, "name": "공중 뒤집기 (황금 크러스트 공개)", "frames": [19.15],
         "size": "미디엄샷", "angle": "팬 높이", "move": "고정",
         "comp": "납작한 호떡이 화면 상단 중앙(세로 25~45%)에 떠 있음, 기름이 실처럼 떨어짐.",
         "action": "호떡이 공중에서 뒤집혀 노릇한 면을 보여줌.",
         "line": "없음", "audio": "휙 + 기름 떨어지는 소리",
         "trans": "cut", "trans_note": "0.4초 초단컷 = 리듬 가속",
         "img": f"A flattened golden-brown hotteok pancake flipping in mid-air above the pan, oil dripping in threads. {LOOK}.",
         "vid": f"The flattened hotteok flips in mid-air, showing a crisp golden-brown lace crust, oil dripping back into the pan. "
                f"Slow motion. {LOOK}.",
         "models": [("google veo-3-1", "슬로모션 음식 물리"), ("kling-v3", "회전 궤적")]},
        {"t0": 19.45, "t1": 20.5, "name": "완성 — 김 나는 호떡, 시럽 흘러나옴", "frames": [19.6, 20.3],
         "size": "클로즈업 (접시 위 호떡)", "angle": "45° 하이앵글", "move": "아주 느린 푸시인",
         "comp": "호떡이 화면 하단 중앙(세로 55~75%), 위로 김이 피어오름. 배경은 밝은 주방 보케.",
         "action": "갈라진 틈에서 흑설탕 시럽이 흘러나오고 김이 모락모락.",
         "line": "없음", "audio": "은은한 마무리 효과음",
         "trans": "end", "trans_note": "완성 컷에서 끝",
         "img": f"Close-up of a finished Korean hotteok on a speckled ceramic plate, golden crispy crust, a crack oozing dark "
                f"brown sugar syrup with nuts, soft steam rising, bright kitchen bokeh. {LOOK}.",
         "vid": f"Close-up of the finished hotteok on a plate: steam curls rise, dark brown sugar syrup slowly oozes from the "
                f"crack, very slow push-in. {LOOK}.",
         "models": [("google veo-3-1", "음식 광고 수준 김·시럽"), ("kling-v3", "슬로우 푸시인"), ("seedance-2-0", "시럽 흐름")]},
    ],
    "audio": {
        "bgm": "대사 없음. 경쾌한 BGM(약 123 BPM 추정) 위에 캐릭터 효과음(충돌·퐁·지글) 중심의 폴리 ASMR. 8초·15~17초 부근에 소리가 거의 꺼지는 구간(-40dB 이하)이 있어 효과음이 도드라지게 설계.",
        "bpm": "약 123 BPM (컷 전환 3.17 / 6.77 / 9.88 / 12.87 / 15.58초 ≈ 약 3초 간격 = 6박 단위)",
        "mix": "BGM -12dB 바닥 + 효과음 앞으로. 컷 바뀔 때마다 첫 프레임에 효과음 1개(오디오 훅).",
        "music_prompt": "Playful cozy cooking cartoon music, pizzicato strings, marimba, light ukulele, soft hand claps, "
                        "123 BPM, bouncy and warm, 20 seconds, no vocals, room for sound effects",
        "bgm_db": -12,
        "sfx": [
            (0.1, "물방울 뛰어오는 발소리 + 비명", "tiny squeaky cartoon footsteps and a high-pitched cute scream"),
            (1.5, "밀가루 충돌 퍽", "soft flour puff impact with a wet splat"),
            (2.2, "반죽 뭉쳐지는 소리", "squishy dough kneading squelch"),
            (3.3, "이스트 퐁", "small cute plop into dough"),
            (7.4, "흑설탕 꿀꺽", "cartoon gulp swallowing sound, cute"),
            (10.5, "시나몬 톡톡 + 점프", "light tapping powder sprinkle, cartoon boing jump"),
            (13.0, "견과 종종걸음", "tiny woody footsteps marching"),
            (15.8, "기름 다이빙", "oil drop splash in a pan"),
            (17.2, "지글지글", "hot oil sizzling in cast iron pan"),
            (18.5, "꾹 누르기", "metal press squishing dough on a sizzling pan"),
            (19.1, "뒤집기 휙", "quick whoosh flip"),
            (19.5, "완성 반짝", "warm magical twinkle, soft"),
        ],
    },
    "edit_terms": [
        ("스텝 몽타주 (Process montage)", "레시피 단계 1개 = 1컷. 평균 컷 길이 약 2.6초."),
        ("액션 컷 (Cut on action)", "반죽이 점프·이탈하는 순간에 컷 → 컷이 튀지 않고 이어져 보임."),
        ("매치 컷 (Match cut)", "같은 배경·같은 구도로 조연만 바뀌는 컷(시나몬→견과)이라 컷이 거의 안 느껴짐."),
        ("컷 가속 (Pacing ramp)", "3초 컷 → 끝에서 0.4초 뒤집기 컷 → 1초 완성컷. 끝으로 갈수록 빨라짐."),
        ("오디오 훅 (Sound on cut)", "매 컷 첫 프레임에 효과음 = 귀로도 장면 전환 인식."),
        ("머니샷 (Money shot)", "마지막 김 나는 완성 요리 클로즈업."),
    ],
    "grade": "eq=contrast=1.03:saturation=1.12:gamma=1.02,colorbalance=rm=0.03:gm=0.01:bm=-0.03,unsharp=5:5:0.3",
    "grade_note": "우드·반죽 톤을 따뜻하게(미드톤 레드+, 블루-). 채도 +12%로 음식 식욕감.",
    "subs": [],
    "strip_step": 0.5,
    "checklist": [
        "주방 세트 이미지 1장 먼저 확정 → 모든 컷 이미지를 그 세트 위에서 생성 (Nano Banana Pro 편집 모드로 캐릭터만 교체)",
        "주인공 반죽은 모든 컷에서 같은 크기·같은 눈 (레퍼런스 이미지 반복 입력)",
        "컷 길이: 3.2 / 3.6 / 3.1 / 3.0 / 2.7 / 3.5 / 0.4 / 1.05초",
        "매 컷 첫 프레임에 효과음 배치",
        "마지막 완성 호떡은 실사 음식 광고 퀄리티로 따로 생성",
        "60fps로 보간(선택): ffmpeg minterpolate=fps=60",
    ],
    "cc_prompt": "너는 음식 의인화 애니메이션 쇼츠 감독이다. 레퍼런스 '호떡 만들기(20.5초, 8컷)'를 주인공 {{A}}, 조연 규칙 '{{B}}' 로 똑같이 만든다.\n"
                 "1) 이미지: ⑥의 컷별 이미지 프롬프트 8장 (nano-banana-pro 권장, 1번 컷 결과를 레퍼런스로 2~8번 생성).\n"
                 "2) 영상: 컷별 영상 프롬프트로 veo-3-1 (없으면 kling-v3) image2video. 각 컷 길이는 ⑧ '생성해야 할 클립 길이' 표대로 트림.\n"
                 "3) 사운드: ⑦ 음악 프롬프트 + 효과음 12개.\n"
                 "4) 편집: ⑧ build.sh 실행.\n"
                 "5) 원본 대비 컷 타이밍 오차 ±0.1초 이내인지 검증 리포트.\n"
                 "🔴 승인 전 업로드 금지. 수정 가능 범위: 작업 폴더의 clips/, audio/, sfx/, build.sh.",
}
