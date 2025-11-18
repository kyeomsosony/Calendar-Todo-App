# 📂 프로젝트 파일 구조

Vercel 배포를 위해 생성/수정된 파일들입니다.

---

## 🆕 새로 생성된 파일 (Vercel 배포용)

### 📝 설정 파일

| 파일 | 설명 | 필수 |
|------|------|------|
| `package.json` | 프로젝트 의존성 및 스크립트 | ✅ 필수 |
| `vite.config.ts` | Vite 빌드 설정 | ✅ 필수 |
| `tsconfig.json` | TypeScript 설정 | ✅ 필수 |
| `vercel.json` | Vercel 배포 설정 (라우팅, 헤더) | ✅ 필수 |
| `postcss.config.js` | PostCSS 설정 (Tailwind) | ✅ 필수 |
| `.gitignore` | Git 무시 파일 목록 | ⭐ 권장 |
| `.env.example` | 환경 변수 예시 | ⭐ 권장 |

### 📱 PWA 파일

| 파일 | 설명 | 필수 |
|------|------|------|
| `public/manifest.json` | PWA 매니페스트 (앱 메타데이터) | ✅ 필수 |
| `public/service-worker.js` | Service Worker (오프라인 지원) | ✅ 필수 |
| `public/icon-192.png` | 앱 아이콘 192x192 | ✅ 필수 |
| `public/icon-512.png` | 앱 아이콘 512x512 | ✅ 필수 |
| `components/InstallPWA.tsx` | PWA 설치 안내 배너 | ⭐ 권장 |

### 🔧 유틸리티 파일

| 파일 | 설명 | 필수 |
|------|------|------|
| `utils/supabase/config.ts` | 환경 변수 래퍼 | ✅ 필수 |
| `src/main.tsx` | 앱 진입점 | ✅ 필수 |
| `index.html` | HTML 템플릿 | ✅ 필수 |

### 📚 문서 파일

| 파일 | 설명 |
|------|------|
| `README.md` | 전체 프로젝트 문서 |
| `QUICK_START.md` | 5분 빠른 시작 가이드 |
| `VERCEL_DEPLOY_GUIDE.md` | 상세 배포 가이드 |
| `DEPLOYMENT_CHECKLIST.md` | 배포 체크리스트 |
| `PWA_SETUP.md` | PWA 설정 정보 |
| `PROJECT_FILES.md` | 이 파일 |

---

## 🔄 수정된 파일

### 기존 파일 변경사항

| 파일 | 변경 내용 |
|------|----------|
| `App.tsx` | - Service Worker 등록 코드 추가<br>- iOS PWA 메타 태그 동적 추가<br>- InstallPWA 컴포넌트 import |
| `utils/supabase/client.ts` | - config.ts에서 환경 변수 가져오도록 수정 |
| `utils/api.ts` | - config.ts에서 환경 변수 가져오도록 수정 |
| `pages/SettingsPage.tsx` | - PWA 설치 상태 확인 기능 추가<br>- "앱 설치" 섹션 추가 |

---

## 📦 전체 프로젝트 구조

```
calendar-todo-app/
│
├── 📄 설정 파일
│   ├── package.json              # NPM 패키지 설정
│   ├── vite.config.ts            # Vite 빌드 설정
│   ├── tsconfig.json             # TypeScript 설정
│   ├── vercel.json               # Vercel 배포 설정
│   ├── postcss.config.js         # PostCSS 설정
│   ├── .gitignore                # Git 무시 파일
│   └── .env.example              # 환경 변수 예시
│
├── 📱 PWA 관련
│   ├── public/
│   │   ├── manifest.json         # PWA 매니페스트
│   │   ├── service-worker.js     # Service Worker
│   │   ├── icon-192.png          # 앱 아이콘
│   │   └── icon-512.png          # 앱 아이콘
│   └── components/
│       └── InstallPWA.tsx        # 설치 안내 배너
│
├── 📝 진입점
│   ├── index.html                # HTML 템플릿
│   ├── src/
│   │   └── main.tsx              # React 진입점
│   └── App.tsx                   # 메인 앱 컴포넌트
│
├── 🎨 컴포넌트
│   ├── components/
│   │   ├── ui/                   # Shadcn UI 컴포넌트
│   │   ├── BottomTabBar.tsx
│   │   ├── CalendarDetailList.tsx
│   │   ├── CreateTodoDialog.tsx
│   │   ├── EventItem.tsx
│   │   ├── FloatingActionButton.tsx
│   │   ├── InlineCalendar.tsx
│   │   ├── InlineTimePicker.tsx
│   │   ├── InstallPWA.tsx        # 🆕 PWA 배너
│   │   ├── InviteForm.tsx
│   │   ├── MonthCalendar.tsx
│   │   ├── NotificationPanel.tsx
│   │   ├── ProfileFilter.tsx
│   │   ├── RecurringForm.tsx
│   │   ├── ReminderForm.tsx
│   │   ├── ShareForm.tsx
│   │   ├── TodoDetailDialog.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoList.tsx
│   │   ├── UserHeader.tsx
│   │   └── WeekCalendar.tsx
│   │
│   └── pages/
│       ├── HomePage.tsx
│       ├── CalendarPage.tsx
│       ├── RecordsPage.tsx
│       ├── SettingsPage.tsx       # 🔄 PWA 섹션 추가
│       ├── DailyRecordPage.tsx
│       ├── DailyRecordOthersPage.tsx
│       └── LoginPage.tsx
│
├── 🧠 상태 관리
│   └── contexts/
│       ├── AuthContext.tsx
│       └── TodoContext.tsx
│
├── 🔧 유틸리티
│   ├── utils/
│   │   ├── api.ts                # 🔄 환경 변수 사용
│   │   └── supabase/
│   │       ├── client.ts         # 🔄 환경 변수 사용
│   │       ├── config.ts         # 🆕 환경 변수 래퍼
│   │       └── info.tsx          # 원본 (개발용)
│   │
│   └── types/
│       └── todo.ts
│
├── 🎨 스타일
│   └── styles/
│       └── globals.css           # Tailwind CSS + 커스텀 스타일
│
├── 🗄️ 백엔드
│   └── supabase/
│       └── functions/
│           └── server/
│               ├── index.tsx
│               └── kv_store.tsx
│
├── 📚 문서
│   ├── README.md                 # 🆕 전체 문서
│   ├── QUICK_START.md            # 🆕 빠른 시작
│   ├── VERCEL_DEPLOY_GUIDE.md    # 🆕 배포 가이드
│   ├── DEPLOYMENT_CHECKLIST.md   # 🆕 체크리스트
│   ├── PWA_SETUP.md              # 🆕 PWA 정보
│   ├── PROJECT_FILES.md          # 🆕 이 파일
│   ├── FIXES_SUMMARY.md          # 기존 수정 내역
│   ├── Attributions.md           # 라이선스 정보
│   └── guidelines/
│       └── Guidelines.md
│
└── 📊 데이터
    └── data/
        └── mockData.ts
```

---

## 🔑 환경 변수

### 개발 환경 (로컬)
`utils/supabase/info.tsx`의 값 자동 사용

### 프로덕션 환경 (Vercel)
`.env` 또는 Vercel Dashboard에서 설정:

```env
VITE_SUPABASE_URL=https://kdxuetpkzxztamkavlxb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik
```

---

## 📦 의존성 (package.json)

### 프로덕션 의존성
- `react` - UI 라이브러리
- `react-dom` - React DOM
- `react-router-dom` - 라우팅
- `@supabase/supabase-js` - Supabase 클라이언트
- `date-fns` - 날짜 처리
- `lucide-react` - 아이콘
- `recharts` - 차트
- `sonner` - 토스트 알림
- Tailwind 관련 패키지

### 개발 의존성
- `@vitejs/plugin-react` - React Vite 플러그인
- `vite` - 빌드 도구
- `typescript` - TypeScript
- `tailwindcss` - CSS 프레임워크

---

## 🚀 빌드 프로세스

### 1. 개발 서버
```bash
npm run dev
# → Vite 개발 서버 실행 (localhost:3000)
```

### 2. 프로덕션 빌드
```bash
npm run build
# → TypeScript 컴파일
# → Vite 빌드
# → dist/ 폴더에 결과물 생성
```

### 3. Vercel 배포
```bash
# Git push 시 자동 배포
git push origin main

# 또는 Vercel CLI
vercel --prod
```

---

## 🎯 파일별 역할

### 핵심 파일

**`App.tsx`**
- 라우팅 설정
- PWA 초기화
- 전역 레이아웃

**`src/main.tsx`**
- React 앱 마운트
- 전역 CSS import

**`index.html`**
- HTML 템플릿
- 메타 태그
- PWA 링크

### PWA 파일

**`public/manifest.json`**
```json
{
  "name": "캘린더 투두 앱",
  "short_name": "CalTodo",
  "display": "standalone",
  "icons": [...],
  ...
}
```

**`public/service-worker.js`**
- 캐싱 전략
- 오프라인 지원
- 자동 업데이트

### 설정 파일

**`vercel.json`**
- SPA 라우팅 (rewrites)
- Service Worker 헤더
- 보안 헤더

**`vite.config.ts`**
- React 플러그인
- 빌드 최적화
- 경로 alias

---

## ✅ 배포 전 체크

필수 파일 확인:
- [ ] `package.json`
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `vercel.json`
- [ ] `index.html`
- [ ] `src/main.tsx`
- [ ] `public/manifest.json`
- [ ] `public/service-worker.js`
- [ ] `public/icon-192.png`
- [ ] `public/icon-512.png`

코드 수정 확인:
- [ ] `App.tsx` - PWA 등록
- [ ] `utils/supabase/client.ts` - 환경 변수
- [ ] `utils/api.ts` - 환경 변수
- [ ] `pages/SettingsPage.tsx` - PWA 섹션

---

## 📚 문서 읽는 순서

1. **`QUICK_START.md`** - 5분 배포 가이드 (처음 시작)
2. **`DEPLOYMENT_CHECKLIST.md`** - 단계별 체크리스트
3. **`VERCEL_DEPLOY_GUIDE.md`** - 상세 배포 방법
4. **`PWA_SETUP.md`** - PWA 기술 정보
5. **`README.md`** - 전체 프로젝트 문서
6. **`PROJECT_FILES.md`** - 파일 구조 (현재 문서)

---

**Vercel 배포에 필요한 모든 파일이 준비되었습니다!** 🎉
