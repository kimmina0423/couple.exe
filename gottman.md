# 가트만 이론 (Gottman Method)

---

## 1. 이론 요약

### 4가지 독 (Four Horsemen)

| 독 | 정의 | 반대 행동 |
|----|------|-----------|
| **비난 (Criticism)** | 행동이 아닌 상대방 인격 자체를 공격 | 부드러운 시작 (Gentle Start-Up) |
| **방어 (Defensiveness)** | 책임을 거부하고 역으로 피해자 자처 | 책임 수용 |
| **경멸 (Contempt)** | 상대를 열등하게 보는 비웃음·냉소 | 감사와 존중 문화 |
| **담쌓기 (Stonewalling)** | 감정 범람 시 대화 자체를 차단 | 자기진정 (Self-Soothing) |

> **경멸**이 이혼 예측력이 가장 높음. 텍스트 감지 최우선 신호.

### 사랑의 지도 (Love Maps)
- 파트너의 내면세계(좋아하는 것, 두려움, 꿈)를 얼마나 상세히 알고 있는가
- 일기에서: 상대방을 구체적으로 언급하는지, 추측·오해를 기록하는지로 파악

### 감정은행계좌 (Emotional Bank Account)
- 긍정적 상호작용 = 입금 / 부정적 상호작용 = 출금
- 잔고 > 0 이면 갈등도 복구 가능
- 일기 분석: 긍정 언급 vs 부정 언급 비율로 잔고 추정

### 5:1 긍정-부정 비율
- 안정적 커플: 긍정 상호작용이 부정의 **5배 이상**
- 위험 커플: 갈등 상황에서도 1:1 이하
- 계산 단위: 일기 1편 내 긍정 문장 수 / 부정 문장 수

---

## 2. 일기 분석 신호 패턴

### 비난 감지 패턴
```
"너는 항상 ~해"         → always/never 절대화 표현
"당신은 왜 그렇게 ~야"  → 인격 단정 의문문
"결국 너란 사람은 ~"    → 본질 귀속 표현
"매번 이런 식이야"      → 반복 패턴 일반화
```

### 방어 감지 패턴
```
"나는 그런 거 아니었는데"           → 의도 부정 + 설명 과잉
"그건 네가 먼저 ~했으니까"          → 역공격·책임 전가
"나만 잘못한 것처럼 말하네"         → 피해자화
"맞아, 하지만 ~"                   → Yes-but 패턴
```

### 경멸 감지 패턴
```
"정말 한심해", "어이가 없어"        → 조롱/비웃음 어휘
"어차피 말해봤자"                  → 무가치화
"그러면 그렇지"                    → 냉소적 예측
눈알 굴리기 묘사, "(웃음)" 비꼬기  → 멸시 비언어 기술
```

### 담쌓기 감지 패턴
```
"그냥 아무 말도 하기 싫었다"        → 철수·회피 선언
"대화가 의미없다고 느꼈다"          → 포기 표현
"혼자 있고 싶었다"                 → 단절 욕구
짧은 단답 묘사, 무시 묘사           → 행동적 담쌓기
```

### 긍정 신호 패턴 (감정은행계좌 입금)
```
"고마워", "덕분에", "잘해줬어"      → 감사 표현
"같이 ~하니까 좋았어"              → 공유 경험 긍정
"이해해줘서", "들어줘서"            → 공감 수용 표현
상대방 강점·노력 언급               → 인정 표현
```

---

## 3. 코드로 구현 가능한 규칙

### 감지 함수 구조 (의사코드)
```python
def analyze_gottman(diary_text: str) -> dict:
    scores = {
        "criticism": 0,
        "defensiveness": 0,
        "contempt": 0,
        "stonewalling": 0,
        "positivity": 0
    }

    # 키워드 기반 1차 점수
    CRITICISM_PATTERNS = ["항상", "매번", "결국 너는", "왜 그렇게", "never", "always"]
    DEFENSIVENESS_PATTERNS = ["나는 아니었는데", "네가 먼저", "나만 잘못한", "맞아 하지만"]
    CONTEMPT_PATTERNS = ["한심해", "어이없어", "어차피", "그러면 그렇지", "웃기고 있네"]
    STONEWALLING_PATTERNS = ["말하기 싫었다", "대화가 의미없", "혼자 있고 싶"]
    POSITIVE_PATTERNS = ["고마워", "덕분에", "좋았어", "이해해줘", "잘해줬어"]

    for pattern in CRITICISM_PATTERNS:
        scores["criticism"] += diary_text.count(pattern)
    # ... 반복

    # 5:1 비율 계산
    scores["ratio"] = scores["positivity"] / max(
        scores["criticism"] + scores["defensiveness"] +
        scores["contempt"] + scores["stonewalling"], 1
    )

    return scores

def get_horseman_level(score: int) -> str:
    if score == 0: return "safe"
    if score <= 2: return "warning"
    return "danger"
```

### 갈등 위험도 등급
```
ratio >= 5.0  → 🟢 안정 (GREEN)
ratio 2.0~4.9 → 🟡 주의 (YELLOW)
ratio < 2.0   → 🔴 위험 (RED)
contempt > 0  → 즉시 🔴 강제 상향
```

### 퀘스트 연동 아이디어
- `criticism` 감지 → "부드러운 시작 연습" 퀘스트 트리거
- `stonewalling` 감지 → "5분 자기진정 미니게임" 팝업
- `ratio >= 5` 7일 연속 → "골든 커플" 칭호 + 캐릭터 아이템 해금
