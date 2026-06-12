# EFT 이론의 디지털 구현: couple.exe 설계 원리

> 본 문서는 정서중심치료(Emotionally Focused Therapy, EFT) 및 가트만 이론(Gottman Method)의 핵심 메커니즘이 couple.exe 애플리케이션에 어떻게 구현되었는지를 기술합니다. 심사 및 학술 발표용으로 작성된 설계 근거 문서입니다.

---

## 1. EFT의 핵심 변화 요인을 앱이 어떻게 구현했는가

EFT의 연구자들은 치료적 변화를 이끄는 세 가지 핵심 내담자 요인을 제안한다: **과제 동맹(Task Alliance)**, **정서적 깊이(Emotional Depth)**, **친화적 나눔(Affiliative Sharing)**(Johnson, 2004). couple.exe는 이 세 요인 각각을 디지털 메커니즘으로 구현한다.

### 1-1. 과제 동맹 → 매일 맞춤 퀘스트

과제 동맹이란 내담자가 치료자가 제안하는 과제를 "나의 문제와 연결된다"고 느끼는 정도를 의미한다. EFT에서 과제 동맹이 형성되지 않을 경우 내담자는 기법을 기계적으로 수행할 뿐 정서적 변화를 경험하지 못한다(Greenberg & Johnson, 1988).

couple.exe의 퀘스트 시스템은 오늘 두 사람이 실제로 쓴 일기에서 추출된 정서 신호를 기반으로 생성된다. "오늘 일기에서 감지된 담쌓기(Stonewalling) 패턴이 있었기 때문에 이 퀘스트가 제시된다"는 맥락이 AI가 생성하는 퀘스트 설명에 명시되며, 이를 통해 사용자는 퀘스트를 임의적 게임 미션이 아닌 자신의 관계 맥락에서 의미 있는 과제로 인식하게 된다.

> **구현:** `lib/analyzer.ts` → `todayQuest.instruction` 필드에 오늘 감지된 신호와 퀘스트의 관계를 명시

**참고문헌:**
- Johnson, S. M. (2004). *The practice of emotionally focused couple therapy: Creating connection* (2nd ed.). Brunner-Routledge.
- Greenberg, L. S., & Johnson, S. M. (1988). *Emotionally focused couples therapy*. Guilford Press.

---

### 1-2. 정서적 깊이 → 환기식 일기 질문 설계

EFT의 핵심 가정은 표면에 드러나는 이차 정서(분노, 짜증, 무관심)가 아니라 그 밑에 있는 일차 정서(두려움, 외로움, 수치심)에 접근해야 치료적 변화가 일어난다는 것이다(Johnson, 2004; Greenberg, 2002). 이차 정서는 상대방에게 방어적 반응을 유발하지만, 일차 정서는 상대방의 공감과 연결을 이끌어낸다.

couple.exe의 일기 질문은 Pennebaker(1997)의 표현적 글쓰기(Expressive Writing) 원칙과 EFT의 환기적 질문(Evocative Question) 기법을 결합하여 설계되었다. 5개 질문은 다음의 3단 구조를 따라 사용자를 점진적으로 일차 정서로 안내한다:

1. **사건 착지** (Q1: 가장 마음에 남은 순간) — 방어 없이 시작
2. **이차 정서 탐색** (Q2: 삼킨 감정) — 억압된 이차 정서 표면화
3. **일차 정서 · 갈망 환기** (Q3~4: 듣고 싶었던 말, 보이는 느낌) — 애착 욕구 직접 언어화

특히 Q2의 "왜 말하지 못했을까요?"는 억압의 이유(두려움, 수치심)를 통해 일차 정서로 진입하는 통로 역할을 한다.

> **구현:** `docs/diary_questions.md` 설계 원칙, `app/diary/new/page.tsx` Q1~Q5 구조

**참고문헌:**
- Greenberg, L. S. (2002). *Emotion-focused therapy: Coaching clients to work through their feelings*. APA.
- Pennebaker, J. W. (1997). Writing about emotional experiences as a therapeutic process. *Psychological Science, 8*(3), 162–166.

---

### 1-3. 친화적 나눔 → 일기 비밀 보장 + AI 정서 번역 시스템

EFT의 정서중심 부부치료에서 솔직한 일차 정서가 표현되려면 "이 감정을 드러내도 공격받지 않는다"는 안전한 정서적 공간(Safe Emotional Space)이 전제되어야 한다(Johnson & Greenberg, 1994). 일기를 파트너에게 직접 공개할 경우 사용자는 검열하거나 방어적으로 서술하게 되어 일차 정서로의 접근이 차단된다.

couple.exe는 일기 원문을 파트너에게 절대 공개하지 않는다. 대신 AI가 두 사람의 일기에서 추출한 일차 정서와 애착 갈망을 다음 형식으로 번역한다:

> "오늘 [파트너]는 겉으로는 [이차 정서]를 표현했지만, 그 밑에는 [일차 정서]가 있었던 것 같아요. 지금 [파트너]가 당신에게 가장 바라는 것은 [애착 갈망]이에요."

이 번역 형식은 가트만의 부드러운 시작(Soft Start-up) 원칙을 따르며, 비난 언어와 원문 인용을 엄격히 금지한다. 임상적으로 이 구조는 갈등 대화의 시작 방식이 결과의 96%를 결정한다는 가트만 연구(Gottman & Levenson, 1999)에 기반한다.

> **구현:** `prompts/analyzer_system.ts` 번역문 생성 규칙, `app/today/page.tsx` "파트너의 마음을 번역했어요" 카드

**참고문헌:**
- Johnson, S. M., & Greenberg, L. S. (1994). *The heart of the matter: Perspectives on emotion in marital therapy*. Brunner/Mazel.
- Gottman, J. M., & Levenson, R. W. (1999). Dysfunctional marital conflict: Women are being unfairly blamed. *Journal of Divorce & Remarriage, 31*(3–4), 1–17.

---

## 2. EFT 5가지 회기 내 움직임의 디지털 구현

Johnson(2004)은 EFT 회기에서 반복적으로 나타나는 다섯 가지 치료적 움직임(Therapeutic Moves)을 제시한다. couple.exe는 이 다섯 움직임 각각을 앱의 핵심 기능으로 구현한다.

| EFT 움직임 | 임상적 의미 | couple.exe 구현 |
|---|---|---|
| **내외적 경험 반영 (Reflect)** | 사용자가 지금 경험하는 것을 거울처럼 되돌려주어 현존감 강화 | 환기식 일기 질문 (Q1~Q4) — "그때 몸 어디에서 어떤 느낌이 들었나요?" |
| **정서를 깊게 하기 (Deepen)** | 이차 정서에서 일차 정서로의 이행 촉진 | AI 일차 정서 추론 엔진 (Step 1~3) — 이차 → 일차 매핑 테이블 26개 패턴 |
| **새로운 정서 경험의 재연 (Re-enact)** | 과거 갈등 상황을 지금-여기에서 새롭게 경험하게 함 | 퀘스트 시스템 — 오늘 감지된 패턴에 대한 행동 과제를 당일 수행 |
| **개방에 대한 처리 (Process Disclosure)** | 파트너의 자기개방에 어떻게 반응하는지 처리 | 정서 번역 보고서 — 파트너의 원문 없이 갈망만 전달, 안전한 수신 유도 |
| **접촉의 새로운 경험 통합 (Integrate)** | 변화된 정서 경험을 관계 정체성으로 통합 | 공동 캐릭터 레벨업 — 퀘스트 완료 시 "우리"의 성장으로 귀속, 공유된 의미 생성 |

**참고문헌:**
- Johnson, S. M. (2004). *The practice of emotionally focused couple therapy* (2nd ed.). Brunner-Routledge.

---

## 3. 일차 정서 → 갈망 환기를 AI가 어떻게 수행하는가

### 3-1. 분석 파이프라인 9단계

AI 분석 엔진(`lib/analyzer.ts`)은 다음 9단계 순서를 엄격히 따른다:

| 단계 | 수행 내용 | 이론 근거 |
|---|---|---|
| Step 1 | 각 일기에서 이차 정서 추출 | EFT 이차 정서 개념 (Johnson, 2004) |
| Step 2 | 이차 정서 밑 일차 정서 추론 (26개 패턴 매핑) | EFT 일차/이차 정서 구분 (Greenberg, 2002) |
| Step 3 | 일차 정서에서 애착 갈망 추출 (12개 매핑) | EFT 애착 갈망 이론 (Johnson, 2004) |
| Step 4 | 가트만 4독 신호 탐지 (비난/방어/경멸/담쌓기) | Gottman & Silver (1999) |
| Step 5 | 14일 history 대조 → 비난자-위축자 고리 판정 | EFT 부정적 사이클 (Johnson, 2004) |
| Step 6 | 두 사람 갈망 비교 → 충돌/정렬 판단 | EFT 갈망 정렬 개념 |
| Step 7 | 정서 번역문 2개 생성 (A→B, B→A) | Soft Start-up (Gottman & Silver, 1999) |
| Step 8 | 오늘의 몬스터 결정 (부정적 사이클 외재화) | EFT 외재화 기법 (Johnson, 2004) |
| Step 9 | 몬스터 약화 퀘스트 1개 생성 | BCT 행동 과제 + EFT 재연 |

### 3-2. 매핑 테이블의 학술적 근거

이차 → 일차 정서 매핑(26개)은 Greenberg(2002)의 정서 코칭 모델과 Johnson(2004)의 임상 사례집에서 반복적으로 관찰된 패턴을 한국어 커플 맥락에 맞게 변형하였다. 일차 정서 → 애착 갈망 매핑(12개)은 Johnson(2004)이 제시한 원본 4개 매핑에 한국 커플 맥락 반영 항목 8개를 추가하여 구성하였다.

14일 히스토리 누적 추적은 Gottman(1999)이 제안한 종단적 커플 관찰 방법론의 디지털 구현이며, 7일 이상 동일 패턴이 지속될 때 "고착된 부정적 사이클"로 격상하는 기준은 임상 경험적 임계값을 참조하였다.

> **구현:** `prompts/analyzer_system.ts` Step 1~9, `lib/pattern_learner.ts` 14일 누적 분석

**참고문헌:**
- Greenberg, L. S. (2002). *Emotion-focused therapy*. APA.
- Johnson, S. M. (2004). *The practice of emotionally focused couple therapy* (2nd ed.). Brunner-Routledge.
- Gottman, J. M., & Silver, N. (1999). *The seven principles for making marriage work*. Crown Publishers.

---

## 4. 비난자-위축자 고리의 자동 탐지

EFT의 핵심 치료 목표 중 하나는 커플이 빠진 "부정적 상호작용 사이클"을 외재화(externalize)하여, 두 사람이 서로를 적이 아닌 "같이 사이클과 싸우는 팀"으로 재포지셔닝하는 것이다(Johnson, 2004). 이 외재화 기법의 디지털 구현이 couple.exe의 몬스터 시스템이다.

### 탐지 파이프라인

```
텍스트 신호 감지
  ↓
역할 분류 (비난자/위축자/중립)
  ↓
14일 history 누적 추적
  ↓
임계값 초과 → 부정적 사이클 확정
  ↓
몬스터 등장 (외재화)
  ↓
퀘스트: "우리가 같이 이 패턴을 깨보자"
```

**비난자(Pursuer/Criticizer) 감지:** "왜 또", "넌 항상", "몇 번을 말해야", 확인 요구, 추궁성 질문 등의 언어 패턴을 탐지한다. 이는 가트만의 비난(Criticism) 패턴과 EFT의 추구(Pursuit) 행동이 언어적으로 중첩되는 지점이다.

**위축자(Withdrawer) 감지:** "몰라", "됐어", "어차피 말해봤자", 짧은 단답 묘사, 침묵 언급 등을 탐지한다. 이는 가트만의 담쌓기(Stonewalling)와 EFT의 철수(Withdrawal)가 중첩되는 지점이다.

**고리 감지 기준:** 한쪽의 비난자 패턴 2개 이상 + 상대방의 위축자 패턴 2개 이상이 같은 날 양쪽 일기에서 동시에 탐지될 때 사이클로 판정한다. 이 패턴이 7일 이상 누적될 때 "고착된 부정적 사이클"로 격상하며, 이는 임상적으로 전문 개입이 필요한 수준으로 간주된다.

**몬스터 유형:**
- **침묵 괴물** — Gottman Stonewalling + EFT Withdrawal 패턴
- **비난 드래곤** — Gottman Criticism/Contempt + EFT 이차 정서(분노) 패턴
- **불안 유령** — EFT 유기 불안 + Anxious Attachment 패턴
- **공허 괴물** — EFT 정서적 마비 + Mutual Withdrawal 패턴

> **구현:** `lib/analyzer.ts` Step 5, `lib/monster.ts` syncMonsters(), `lib/pattern_learner.ts` CycleSummary

**참고문헌:**
- Johnson, S. M. (2004). *The practice of emotionally focused couple therapy* (2nd ed.). Brunner-Routledge.
- Gottman, J. M. (1994). *What predicts divorce: The relationship between marital processes and marital outcomes*. Lawrence Erlbaum Associates.

---

## 5. 윤리적 고려사항

### 5-1. 일기 비밀 보장의 임상적 필요성

일기 원문의 파트너 공개 금지는 단순한 프라이버시 보호가 아닌 **임상적 치료 설계**다. EFT의 임상 연구에 따르면 솔직한 일차 정서의 표현은 "안전하게 말해도 된다"는 신뢰감이 전제될 때만 가능하다(Johnson & Greenberg, 1994). 일기가 직접 공유되면 사용자는 방어적으로 서술하게 되고, 이차 정서만 기록하게 되어 AI 분석의 정확도와 치료적 효과가 모두 저하된다.

또한 RLS(Row Level Security) 기반 Supabase 데이터베이스 설계를 통해 기술적으로도 파트너의 일기 원문 직접 조회를 차단한다. AI만이 RPC를 통해 두 사람의 일기에 접근하며, 그 결과물(번역문)만이 상호 공유된다.

### 5-2. 폭력/자해 신호 감지 시 전문 상담 안내 우선

AI는 텍스트에서 다음 신호를 감지할 경우 즉시 분석을 중단하고 전문 상담 안내를 우선한다:

- **자해/자살 신호:** "죽고 싶다", "사라지고 싶다", "더 이상 못하겠다" + 절망 표현
- **관계 폭력 신호:** "때렸다", "협박했다", "무서웠다", "강요" + 신체 위협 또는 반복 피해

이 경우 `safetyFlag` 필드가 활성화되며, 퀘스트와 몬스터 반환이 차단되고 위기상담 전화(1393)가 안내된다. 이는 **AI가 전문 상담의 대체재가 아님**을 명시하는 설계 원칙이다.

### 5-3. AI의 역할 한계: 치료사가 아닌 정서적 통역자

couple.exe의 AI는 커플 상담사가 아니다. 본 앱의 AI 역할은 다음으로 제한된다:

1. **정서 통역**: 이차 정서를 일차 정서로 번역하여 전달
2. **패턴 조명**: 두 사람이 스스로 인식하지 못하는 반복 패턴을 가시화
3. **행동 안내**: 임상적으로 검증된 커플 과제를 맞춤 제시

**포함하지 않는 것**: 진단, 치료 계획, 위기 상담, 법적/의학적 판단

이 역할 경계는 Drouin et al.(2020)이 지적한 디지털 정신건강 도구의 남용 위험성에 대한 경고를 반영하며, 앱 내에서도 "AI는 분석 도구이며 전문 상담을 대체하지 않습니다"라는 문구를 통해 사용자에게 명시한다.

**참고문헌:**
- Johnson, S. M., & Greenberg, L. S. (1994). *The heart of the matter: Perspectives on emotion in marital therapy*. Brunner/Mazel.
- Drouin, M., Gettler, L., & Davis, J. (2020). Mental health apps: What do we know about their efficacy? *JMIR Mental Health*.
- Gottman, J. M., & Silver, N. (1999). *The seven principles for making marriage work*. Crown Publishers.

---

## 참고문헌 전체 목록

- Gottman, J. M. (1994). *What predicts divorce*. Lawrence Erlbaum Associates.
- Gottman, J. M., & Levenson, R. W. (1999). Dysfunctional marital conflict. *Journal of Divorce & Remarriage, 31*(3–4).
- Gottman, J. M., & Silver, N. (1999). *The seven principles for making marriage work*. Crown Publishers.
- Greenberg, L. S. (2002). *Emotion-focused therapy: Coaching clients to work through their feelings*. APA.
- Greenberg, L. S., & Johnson, S. M. (1988). *Emotionally focused couples therapy*. Guilford Press.
- Johnson, S. M. (2004). *The practice of emotionally focused couple therapy: Creating connection* (2nd ed.). Brunner-Routledge.
- Johnson, S. M. (2008). *Hold me tight: Seven conversations for a lifetime of love*. Little, Brown.
- Johnson, S. M., & Greenberg, L. S. (1994). *The heart of the matter*. Brunner/Mazel.
- Pennebaker, J. W. (1997). Writing about emotional experiences as a therapeutic process. *Psychological Science, 8*(3), 162–166.
- Deci, E. L., & Ryan, R. M. (1985). *Intrinsic motivation and self-determination in human behavior*. Plenum.
