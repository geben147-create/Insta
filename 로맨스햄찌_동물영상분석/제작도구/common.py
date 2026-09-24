"""Shared option lists and prompt fragments used by several video data files."""

SMALL_ANIMALS = [
    ["골든 햄스터 (원본)", "chubby golden Syrian hamster with soft orange-and-cream fur"],
    ["코기 강아지", "fluffy Pembroke Welsh corgi puppy with short legs and big ears"],
    ["레서판다", "round fluffy red panda with russet fur and a striped tail"],
    ["해달(수달)", "sleek chubby sea otter with glossy brown fur and whiskers"],
    ["친칠라", "fluffy grey chinchilla with huge round ears"],
    ["카피바라", "calm chubby capybara with coarse brown fur"],
    ["아기 고양이", "fluffy ginger kitten with big round eyes"],
    ["토끼", "fluffy white lop-eared bunny"],
    ["포메라니안", "tiny cream Pomeranian puppy with a fluffy mane"],
    ["펭귄", "chubby baby emperor penguin with grey down fluff"],
]

SWAP_NOTES_SMALL = [
    ["햄스터 → 코기/포메", "주둥이가 길어지므로 ECU(초근접)에서 코·입 위치가 화면 중앙보다 아래로 내려감. 귀가 크게 서서 머리 소품(캡·리본)은 귀 사이로 배치하라고 명시."],
    ["햄스터 → 레서판다/해달", "손(앞발)이 커서 브러시·스프레이 같은 작은 소품을 '두 손으로' 쥐는 동작이 더 자연스러움. 해달은 발이 물갈퀴라 'webbed paws' 명시."],
    ["햄스터 → 친칠라/토끼", "귀가 화면 위로 튀어나오므로 원본보다 카메라를 5~10% 뒤로(zoom out) 빼야 같은 구도가 됨. 토끼는 'lop-eared'로 귀를 내리면 소품 가림 방지."],
    ["햄스터 → 카피바라", "몸이 옆으로 긴 체형이라 세로(9:16) 화면에서 비율이 깨짐. '앞발로 선 자세(standing upright on hind legs)'를 반드시 넣기."],
    ["공통 규칙", "캐릭터 시트 문장은 모든 샷 프롬프트에 똑같이 복붙 (한 글자도 바꾸지 않기). 첫 샷 이미지를 레퍼런스 이미지로 계속 넣어 일관성 유지 (Kling Omni/Seedance 2.0 레퍼런스 슬롯)."],
]

VERTICAL = "vertical 9:16 frame, 1080x1920"
