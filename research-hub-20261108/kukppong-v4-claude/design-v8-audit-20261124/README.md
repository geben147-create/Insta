# 국뽕 V8 원문 대조·색상·교정 지시서

2026-11-24 · r001

[시각화 HTML 열기](https://geben147-create.github.io/Insta/research-hub-20261108/kukppong-v4-claude/design-v8-audit-20261124/)

## 지금 사용할 것

HTML의 **B. 지금 — 기존 영상·렌더러 최소 교정**을 복사합니다.
A는 최초 원문 등록, C는 대표1편 검수 통과 후 기존 대상 배치 적용용입니다.

## 산출물

- index.html: 외부 의존성 없이 열리는 단일 HTML. 원문·참고 이미지·대조표·견본·프롬프트를 포함합니다.
- execution-prompts.md / execution-prompts.txt: A/B/C 전체 지시문.
- audit-report.md: 기계가 읽을 수 있는 본문 대조 보고서.
- rules-contract.json: 사용자 확정값·캡처 실측값·기존 시안값·🌸제안을 구분한 구현용 제안. 실제 렌더러가 아닙니다.
- original-transcript.txt: 첨부 원문 바이트 그대로. 사용자/제공명세/Claude 발화가 섞여 있습니다.
- instruction-audit.json: 원문 인용·줄번호·출처 유형을 가진25항목.
- color-measurements.json: 캡처 측정 방법·ROI·RGB 및 기존 참고 이미지 교차측정.
- repository-findings.json: 실제 GitHub V8 소스 감사 기록.
- previous-chatgpt-proposals.txt: 이 대화의 앞선 ChatGPT 제안 §3·§4·§9 발췌. 사용자 원문과 분리.

## 검증 범위

확인한 코드 기준: d2d832b480733c636da465e54d94818a17c70611.
첨부 원문·색상 캡처·공개 V8 시안 및 규칙을 대조했습니다.
Ubuntu 실제 렌더러·51~54편 MP4·실제 프레임레이트·허가 문서는 이번에 열어 확인하지 않았습니다.
HTML의 작은 자막 견본은 구조·색 모식도이며 지정 폰트를 검수한 최종 영상이 아닙니다.
기존 V8·HumanTouch·대본·TTS에는 변경을 가하지 않았습니다.

원문 SHA-256: 8ec9c28515a12d96081f00064c16965b6be95fb1719677196ea043a866ee9bca

## 기록

2026-11-24: 사용자 원문 보존,25개 대조,2개 캡처색 실측,11종 스타일·12색 견본,3개 실행 프롬프트를 신규 경로에 추가. by ChatGPT
