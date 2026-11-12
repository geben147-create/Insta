# 설치 명령어와 n8n 워크플로 JSON

Ollama·Qwen3.5, Docker, n8n, 인스타 API, FFmpeg. 확인일 2026-11-07

## Qwen3.5 9B·27B 받기

```powershell
# ① Ollama 설치: https://ollama.com/download (Windows 설치 파일)
# ② Qwen 받기 (PowerShell)
ollama pull qwen3.5:9b      # 약 6.6GB VRAM (8GB 그래픽카드 OK)
ollama pull qwen3.5:27b     # 약 17~18GB VRAM (24GB 그래픽카드 권장)

# ③ 잘 되는지 테스트
ollama run qwen3.5:9b "인스타 릴스 훅 5개를 써줘. 주제: 배당주"
```

## n8n 도커 실행 (PowerShell)

```powershell
# Docker Desktop 설치 후 (PowerShell)
docker volume create n8n_data
docker run -d --name n8n --restart unless-stopped -p 5678:5678 `
  -e GENERIC_TIMEZONE="Asia/Seoul" -e TZ="Asia/Seoul" `
  -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true `
  -v n8n_data:/home/node/.n8n n8nio/n8n

# 브라우저에서 열기
start http://localhost:5678
```

## Ollama API 테스트

```powershell
# n8n(도커) 안에서 내 PC의 Ollama 부르는 주소: http://host.docker.internal:11434
# PowerShell에서 Ollama API 직접 테스트
$body = @{ model="qwen3.5:9b"; prompt="배당주 릴스 훅 3개"; stream=$false } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:11434/api/generate -Method Post -Body $body -ContentType "application/json"
```

## n8n 워크플로 JSON (매일 07시 → Qwen 대본 → IG 예약)

```json
{
  "name": "인스타 릴스 대본 자동생성 + 예약 게시 (by claude 샘플)",
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 7 * * *"
            }
          ]
        }
      },
      "name": "매일 07시",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        0,
        0
      ]
    },
    {
      "parameters": {
        "jsCode": "// 오늘 주제: 실제로는 Google Sheets 노드로 'by claude_분야별TOP60' 상위 훅을 읽어 오세요\nreturn [{json:{field:'주식', benchmark_hook:'1,000만원으로 1억? 이건 가능한 시나리오입니다', keyword:'배당주 추천'}}];"
      },
      "name": "오늘 주제",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        220,
        0
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://host.docker.internal:11434/api/generate",
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({model:'qwen3.5:27b', stream:false, prompt:'너는 인스타 릴스 작가다. 분야: '+$json.field+' / 벤치마크 훅: '+$json.benchmark_hook+' / 키워드: '+$json.keyword+'\\n30초 릴스 대본을 JSON으로만 출력: {hook, scenes:[{sec, visual, caption}], cta_comment, caption, hashtags}'}) }}",
        "options": {
          "timeout": 300000
        }
      },
      "name": "Qwen 27B 대본",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        440,
        0
      ]
    },
    {
      "parameters": {
        "jsCode": "const t=$json.response||'';const m=t.match(/\\{[\\s\\S]*\\}/);let o={};try{o=JSON.parse(m[0])}catch(e){o={raw:t}}\nreturn [{json:o}];"
      },
      "name": "JSON 정리",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        660,
        0
      ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/{{API_VERSION}}/{{IG_USER_ID}}/media",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "media_type",
              "value": "REELS"
            },
            {
              "name": "video_url",
              "value": "https://내-공개-서버/오늘영상.mp4"
            },
            {
              "name": "caption",
              "value": "={{$json.caption}}"
            },
            {
              "name": "access_token",
              "value": "{{IG_TOKEN}}"
            }
          ]
        }
      },
      "name": "IG 릴스 컨테이너 생성",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        880,
        0
      ],
      "disabled": true
    },
    {
      "parameters": {
        "amount": 90
      },
      "name": "영상 처리 대기",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        1100,
        0
      ],
      "disabled": true
    },
    {
      "parameters": {
        "method": "POST",
        "url": "=https://graph.facebook.com/{{API_VERSION}}/{{IG_USER_ID}}/media_publish",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "creation_id",
              "value": "={{$('IG 릴스 컨테이너 생성').item.json.id}}"
            },
            {
              "name": "access_token",
              "value": "{{IG_TOKEN}}"
            }
          ]
        }
      },
      "name": "IG 게시",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1320,
        0
      ],
      "disabled": true
    }
  ],
  "connections": {
    "매일 07시": {
      "main": [
        [
          {
            "node": "오늘 주제",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "오늘 주제": {
      "main": [
        [
          {
            "node": "Qwen 27B 대본",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Qwen 27B 대본": {
      "main": [
        [
          {
            "node": "JSON 정리",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "JSON 정리": {
      "main": [
        [
          {
            "node": "IG 릴스 컨테이너 생성",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "IG 릴스 컨테이너 생성": {
      "main": [
        [
          {
            "node": "영상 처리 대기",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "영상 처리 대기": {
      "main": [
        [
          {
            "node": "IG 게시",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 인스타 API 릴스 게시 2단계

```powershell
# 인스타 공식 API로 릴스 게시 = 2단계
# 1) 컨테이너 만들기 (video_url은 공개 URL이어야 함)
POST https://graph.facebook.com/{API_VERSION}/{IG_USER_ID}/media
     ?media_type=REELS&video_url={공개영상URL}&caption={캡션}&access_token={토큰}
# → {"id":"컨테이너ID"}  (영상 처리에 1~몇 분)
# 2) 게시
POST https://graph.facebook.com/{API_VERSION}/{IG_USER_ID}/media_publish
     ?creation_id={컨테이너ID}&access_token={토큰}
# 제한: 계정당 24시간 100개. 비즈니스/크리에이터 계정 + Meta 앱 필요
```

## 자막·9:16·이어붙이기

```powershell
# 자막(SRT) 입히고 9:16 맞추기 (FFmpeg)
ffmpeg -i scene.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,subtitles=sub.srt:force_style='FontName=Pretendard,FontSize=14,Outline=2'" -c:a copy out.mp4
# 여러 장면 이어붙이기
ffmpeg -f concat -safe 0 -i list.txt -c copy final.mp4
```

## n8n HTTP 노드로 외부 LLM 부르기

```powershell
# n8n Cloud에서는 내 PC의 Ollama를 못 부르므로 외부 API 사용
# HTTP Request 노드 예시 (OpenAI 호환 API라면 공통)
POST {API_BASE}/v1/chat/completions
Authorization: Bearer {API_KEY}
{"model":"{모델명}","messages":[{"role":"user","content":"{대본 프롬프트}"}]}
```