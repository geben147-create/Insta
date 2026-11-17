# PC 잔존 파일·870 전달·추가 중국 SNS 조사

by aside sonnet · 2026-11-17 KST, 약 21시 이후 조사

## 1. 이 PC에 남은 파일

실제 읽은 폴더: `C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션`

영상 확장자(mp4/mkv/webm) 290개, 3,349,499,818바이트(약 3.35GB). 0바이트 1개 포함. 파일 내용·재생·현재 870와의 바이트 대조는 이번 단계에서 하지 않았습니다.

- `C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션\빌리빌리_신규30_20261115`: 3개
- `C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션\빌리빌리_전문가반응`: 127개
- `C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션\샤오홍슈`: 160개(0바이트 1개 포함)
- `C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션\중국크리에이터_일본_신규_독립`: 이번 재귀 검사에서 영상 확장자 파일 0개

[전체 경로·크기 목록](./PC-remaining-20261117.tsv). 경로를 잘라 적지 않았습니다.

이번 조사에서 파일을 삭제하거나 이동하지 않았습니다. 이전 PC→870 작업의 전체 삭제 이력을 확인한 것은 아니므로 과거에 단 하나도 삭제하지 않았다고 단정하지 않습니다. 이전 E: 복사본은 이번 접근 범위에 포함하지 않았습니다. 최근 직접전송 작업은 PC 디스크에 MP4를 저장하지 않고 870으로 보내는 방식이었으므로, PC에 없는 영상이 전부 삭제된 것은 아닙니다.

Explorer 열기 요청은 실행했습니다. 창이 사용자에게 보이는지까지는 확인하지 못했습니다. 안 보이면 Win+E → 주소 표시줄에 위 전체 경로를 붙여넣고 Enter를 누르세요.

### PC PowerShell: 폴더 열기

```powershell
explorer.exe 'C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션'
```

## 2. PC 기존 파일을 870에 복사할 때

아래는 Windows PowerShell용입니다. 새 시각별 폴더로 복사하며 원본을 지우지 않습니다. ssh/scp, Tailscale 연결, 870의 SSH 서비스가 필요합니다. 이번에 실행하거나 전송 성공을 확인한 명령은 아닙니다.

```powershell
$src='C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션'
$dst='aside_import_'+(Get-Date -Format 'yyyyMMdd_HHmmss')
ssh yh@100.86.21.51 "mkdir ~/$dst"
if($LASTEXITCODE -ne 0){throw '870 연결 또는 새 폴더 생성 실패'}
scp -r "$src" "yh@100.86.21.51:$dst/"
if($LASTEXITCODE -ne 0){throw '복사 실패: 원본을 보존하고 오류 확인'}
Write-Output "870 복사 대상: /home/yh/$dst/국뽕_리액션"
```

scp 성공만으로 삭제하지 마세요. 870의 SHA256과 PC의 SHA256을 대조한 뒤에도 최종 삭제는 사용자가 결정합니다.

## 3. 새 영상을 PC 저장 없이 870에서 바로 받는 예

아래는 870 Linux 터미널용입니다. 원본 URL은 실행 후 입력합니다. 영상 권한과 사이트 로그인 조건에 따라 실패할 수 있으며, 성공 여부는 종료 코드와 파일을 확인하세요. 별도 저장 폴더를 쓰고 기존 파일을 덮어쓰지 않습니다. 플랫폼 자막은 제공되는 언어만 받을 수 있습니다.

```bash
read -r -p '다운로드할 원본 URL: ' URL
DEST='/run/media/yh/새 볼륨/틱톡/샤오(한국 일본 영상들)/추가수집_20261117'
mkdir -p "$DEST"
if command -v yt-dlp >/dev/null 2>&1; then
  DL=(yt-dlp)
else
  DL=("$HOME/whisper-env/bin/python" -m yt_dlp)
fi
"${DL[@]}" --no-playlist --no-overwrites --continue --write-info-json --write-subs --write-auto-subs --sub-langs 'zh.*,en.*,ko.*,ja.*' --sub-format 'srt/best' -P "$DEST" -o '%(id)s/%(id)s.%(ext)s' "$URL"
```

이 명령은 CPU를 이용한 Whisper 추출이나 한국어 번역을 대신하지 않습니다. 자막이 없거나 불완전하면 기존 보완 작업을 이어야 합니다. yt-dlp가 두 경로 모두에 없으면 설치가 필요한 상태입니다.

Aside가 로그인된 브라우저에서 수집해 수신기로 직접 보내는 경로도 별도로 있었지만, 이번 점검 시 `100.86.21.51:8765` 연결은 fetch failed였습니다. 870 자체가 꺼졌다고 단정할 수는 없습니다. 이번 신규 후보는 전송하지 않았습니다.

## 4. 전원 종료 상태의 5가지 선택

완전히 종료된 PC의 CPU/GPU를 그 상태 그대로 사용할 수는 없습니다. 내장 HDD/SSD도 전원 및 네트워크 호스트가 없으면 접근 불가입니다. HDD에 대기전원만 공급한다고 파일서버가 되지는 않습니다.

1. **WoL+Tailscale 도우미**: 같은 LAN에 켜진 공유기/NAS/미니PC가 WoL 패킷을 보내 870을 부팅한 뒤 사용. 기존 내장 디스크·CPU/GPU를 그대로 이용. UEFI/NIC/Linux 지원 및 유선 LAN 검증이 필요. Tailscale 단독이 잠든 기기를 깨우는 것은 아님.
2. **절전+WoL**: 종료 대신 절전하고 필요할 때 깨우기. 복귀가 빠를 수 있으나 절전 중 다운로드·Whisper가 실행되지는 않음. GPU 복귀 안정성과 실제 전력은 실측 필요.
3. **NAS**: NAS를 켜 두고 그쪽에 저장. 870을 꺼도 NAS 파일 수신 가능. 구매/구성 부담. 870 내부 디스크가 자동으로 NAS에서 보이지는 않음.
4. **미니PC+USB HDD/SSD**: 미니PC에 디스크를 연결하고 Tailscale+SFTP로 수신. 870을 끈 상태로 파일 받기가 가능하며 WoL 도우미도 겸용. 미니PC와 디스크 전원은 유지해야 함. 같은 일반 디스크를 두 PC에 동시에 직접 연결하지 말 것.
5. **클라우드 임시 보관**: 870이 꺼져도 업로드 후 켤 때 가져오기. 상시 집 장비는 불필요. 870 내장 디스크/CPU/GPU 사용은 아니며 용량·전송요금·개인정보 고려.

추천: 기존 상시 장치가 있다면 1번이 변경이 가장 적음. '870을 정말 꺼 둔 채 저장만' 원하고 미니PC가 이미 있다면 4번. 아무 상시 장비도 없고 간헐적 전달이면 5번. 새 NAS를 WoL 하나 때문에 살 필요는 낮음. 장비 보유·요금제 미확인이라 금액은 제시하지 않음.

ASRock 공식 설명서는 X870 Taichi Creator의 Marvell AQC113 10GbE 항목에 WoL 지원을 표시하지만 해당 PC의 실기 설정과 기동은 아직 미검증입니다.

공식 근거:
- https://tailscale.com/blog/wake-on-lan-tailscale-upsnap
- https://docs.kernel.org/admin-guide/pm/sleep-states.html
- https://networkmanager.dev/docs/api/latest/nm-settings-nmcli.html
- https://tailscale.com/docs/use-cases/personal-or-at-home-use/access-nas-media-file-servers
- https://ubuntu.com/server/docs/how-to/security/openssh-server
- https://rclone.org/commands/rclone_copy
- https://download.asrock.com/Manual/X870%20Taichi%20Creator_Korean.pdf

## 5. 오늘 Google 트렌드: 대한민국·스포츠·지난 24시간

2026-11-17 21:01 KST 표시, 검색량 내림차순으로 직접 확인했습니다. 아래는 그 시점의 버킷값이며 정확한 검색 건수나 특정 영상 인기도가 아닙니다.

- 전체 스포츠 탭 첫 행: 싱가포르 대 브라질 1만+, +1,000%.
- 두 번째 행: 한국 카타르 5천+, +500%.
- 한국 관련 확장 키워드: 장민기 2천+, 신영철 1천+, 최지훈 1천+, 권순우 1천+, 윤이나 1천+, 쇼트트랙 500+, 원주 DB 대 안양 정관장 500+.
- 동률 구간의 정밀 순위는 단정하지 않습니다. 중국 SNS 조회 순위나 중국인 반응의 순위를 뜻하지 않습니다.
- 공식 페이지: https://trends.google.com/trending?geo=KR&hl=ko&category=17&sort=search-volume
- [당시 페이지 접근성 스냅샷](./google-trends-sports-20261117.txt)

## 6. 추가 자료 27건

[new-sources-20261117.tsv](./new-sources-20261117.tsv)에 ID·제목(일부 축약)·원본 URL·표시 게시일·분야·검증 수준을 기록했습니다. 기존 한국/일본 direct-latest 두 목록에 같은 ID 없음. 다른 모든 과거 기획과의 중복까지 배제한 것은 아닙니다.

이번 수집은 후보 조사입니다. 원음 청취·전문 전사·파일 다운로드·새 시트 입력은 하지 않았습니다. 샤오홍슈 검색 결과의 MM-DD·상대 날짜는 표시 문자열로 보존하고 연도를 임의로 채우지 않았습니다. 사진/영상 구분을 최종 확인하지 않은 항목도 있어 재생 확인이 필요합니다. Google 트렌드와 직접 연관을 검증하지 않은 후보의 trend_rank는 UNKNOWN입니다.

우선 확인할 소재:
- CCTV 중국어 스포츠 방송: 한국-중국 탁구, 한국 양궁 성과, 쇼트트랙 여자1500m, 한국-중국 축구, 손흥민 LAFC 소개.
- Bilibili: 안세영 전술 평가, e스포츠 산업사·중계 반응, 교수의 LK-99 비평, 한중일 비교, 한국 직장문화·사회분석.
- rednote: 중국 해설 한국전 탁구, 아시안게임 축구, 쇼트트랙 현장해설, 한국 여자 배드민턴 단체, 한일 드라마·넷플릭스 비교, 한중일 취업, 음악산업/기술경영 교수 인터뷰.

중국 본토 언론, 대만 중국어 채널, 한국어 원음에 중국어 자막을 붙인 영상은 구분했습니다. 교수라는 제목만으로 중국인 교수 또는 전문가 자격을 확정하지 않았습니다.

예능·토크쇼 후속 소재: 금성쇼 2015-02-04 '韩流' 회차 관련 보도에는 한드 영상미·한국 생활 디테일 평가와 비판이 함께 나옵니다. 보도 https://yule.sohu.com/20150205/n408709543.shtml 는 확인됐지만 직접 회차 영상 URL은 아직 UNKNOWN입니다. 검증된 예능 영상으로 세지 않았습니다.

## 7. 다른 세션에 붙일 지시문

```text
현재 기준 문서와 신규 후보 목록을 먼저 읽으세요.
https://github.com/geben147-create/Insta/blob/main/reactions-downloads/UPDATE-20261117-PC-TRANSFER-RESEARCH.md
https://github.com/geben147-create/Insta/blob/main/reactions-downloads/new-sources-20261117.tsv

PC 원본 위치는 C:\Users\llorr\Videos\국쫑깃허브등\국뽕_리액션 입니다.
PC에는 영상 파일 290개가 남아 있고 0바이트 1개 포함입니다. PC에서 파일을 못 찾았다고 870에서도 없다고 판단하지 마세요.
870 루트는 /run/media/yh/새 볼륨/틱톡/샤오(한국 일본 영상들)/ 입니다.
이전 동기화 점검 결과와 실제 파일을 ID로 대조해 재다운로드를 피하세요.
기존 파일 삭제·덮어쓰기 금지. PC에서 870으로 보낼 때는 새 목적지 폴더를 쓰고 해시를 대조하세요.
새 영상은 가능하면 PC 디스크에 저장하지 말고 870에 직접 저장하세요. 수신기나 SSH 연결이 실제 가능한지 먼저 확인하세요.
직접 전송이 막혔으면 성공으로 표시하지 말고 URL·실패 원인·재시도 목록을 남기세요.
원어 자막 우선, 없으면 Whisper, 한국어가 비었으면 번역 보완. 자막 존재만으로 완료 판정 금지.
한국 스포츠를 축구·탁구·배드민턴·양궁·쇼트트랙·테니스·골프·야구·농구·배구·펜싱·e스포츠까지 확장하세요.
중국 매체·교수·중국 예능/토크쇼의 한국 발언 및 한일 비교는 실제 화자·프로그램·원음 시간·출처를 기록하세요.
제목 기반 후보를 실제 칭찬 발언이라고 쓰지 마세요. Google 트렌드 순위와 중국 SNS 인기를 혼동하지 마세요.
기록은 ID·제목·게시일·원본 URL·실제 870 경로·바이트·영상 SHA256·원어/한국어 자막 경로 및 SHA256·상태를 연결해 새 버전으로 저장하세요.
```
