# 캘린더 투두 앱 📅✅

캘린더와 투두리스트가 결합된 일정 관리 웹 애플리케이션입니다.

## 🚀 Vercel 배포 가이드

### 1단계: 코드 다운로드 (Figma Make에서)

1. Figma Make에서 **"Export"** 또는 **"Download"** 버튼 클릭
2. 프로젝트 파일 다운로드
3. 압축 해제

### 2단계: GitHub 레포지토리 생성

1. [GitHub](https://github.com) 로그인
2. 우측 상단 **"+"** → **"New repository"** 클릭
3. Repository 이름 입력 (예: `calendar-todo-app`)
4. **Public** 또는 **Private** 선택
5. **"Create repository"** 클릭

### 3단계: 코드를 GitHub에 업로드

#### 방법 A: GitHub 웹사이트에서 업로드 (쉬움)
1. 생성된 레포지토리 페이지에서 **"uploading an existing file"** 클릭
2. 다운로드한 모든 파일을 드래그 앤 드롭
3. **"Commit changes"** 클릭

#### 방법 B: Git 명령어 사용 (추천)
```bash
cd calendar-todo-app  # 다운로드한 폴더로 이동
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calendar-todo-app.git
git push -u origin main
```

### 4단계: Vercel 배포

1. [Vercel](https://vercel.com) 접속 및 로그인 (GitHub 계정으로 로그인 추천)
2. **"Add New..."** → **"Project"** 클릭
3. GitHub 레포지토리 선택 (처음이면 GitHub 연동 필요)
4. **"Import"** 클릭

### 5단계: 환경 변수 설정

**중요! 이 단계를 건너뛰지 마세요!**

배포 설정 화면에서:

1. **"Environment Variables"** 섹션 펼치기
2. 다음 환경 변수 추가:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://kdxuetpkzxztamkavlxb.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik` |

3. **"Deploy"** 클릭

### 6단계: 배포 완료! 🎉

- 2-3분 후 배포 완료
- `https://your-project-name.vercel.app` 형태의 URL 생성
- URL을 클릭해서 앱 확인

### 7단계: iOS PWA 설치 (iPhone)

1. **Safari**로 Vercel URL 접속
2. 하단 **공유 버튼 (⎙)** 클릭
3. **"홈 화면에 추가"** 선택
4. **"추가"** 클릭
5. 홈 화면에서 앱 아이콘 클릭
6. ✅ **주소창 없이 전체 화면으로 실행됨!**

## 📱 PWA 기능

- ✅ 홈 화면 아이콘
- ✅ 전체 화면 모드 (주소창 없음)
- ✅ 오프라인 지원
- ✅ 빠른 로딩 (캐싱)
- ✅ 자동 업데이트

## 🔧 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 브라우저에서 http://localhost:3000 열림
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📂 프로젝트 구조

```
calendar-todo-app/
├── public/              # 정적 파일
│   ├── manifest.json    # PWA 매니페스트
│   ├── service-worker.js # Service Worker
│   ├── icon-192.png     # 앱 아이콘
│   └── icon-512.png     # 앱 아이콘
├── src/
│   └── main.tsx         # 진입점
├── components/          # React 컴포넌트
│   ├── ui/              # Shadcn UI 컴포넌트
│   ├── BottomTabBar.tsx
│   ├── InstallPWA.tsx   # PWA 설치 배너
│   └── ...
├── pages/               # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── CalendarPage.tsx
│   ├── RecordsPage.tsx
│   └── SettingsPage.tsx
├── contexts/            # React Context
│   ├── AuthContext.tsx
│   └── TodoContext.tsx
├── utils/               # 유틸리티
│   ├── api.ts
│   └── supabase/
│       ├── client.ts
│       └── config.ts
├── styles/
│   └── globals.css      # Tailwind CSS
├── App.tsx              # 메인 앱 컴포넌트
├── index.html           # HTML 템플릿
├── vite.config.ts       # Vite 설정
├── vercel.json          # Vercel 설정
└── package.json         # 프로젝트 설정
```

## 🎯 주요 기능

### 홈 화면
- 프로필 필터 (나 / 친구 / 그룹)
- 투두 리스트 (공개/비공개 설정)
- 완료 상태 관리

### 캘린더
- 주간/월간 뷰
- 일정 추가/수정/삭제
- 반복 일정 설정
- 알림 설정

### 기록
- 일일 기록 작성
- 사진 업로드
- 댓글 기능
- 친구 기록 보기

### 설정
- 프로필 관리
- 친구 초대/관리
- 그룹 생성/관리
- PWA 설치 안내

## 🔒 인증 시스템

- Supabase Auth 기반
- 이메일/비밀번호 로그인
- 세션 관리
- 친구 요청 시스템

## 🌐 브라우저 지원

- ✅ Chrome/Edge (완벽 지원)
- ✅ Safari iOS (PWA 지원)
- ✅ Firefox (기본 기능)
- ⚠️ IE (지원 안 함)

## 📝 환경 변수

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🐛 문제 해결

### PWA가 작동하지 않을 때
1. HTTPS 연결 확인 (Vercel은 자동 HTTPS)
2. 브라우저 캐시 삭제
3. Service Worker 재등록
4. 개발자 도구 > Application > Service Workers 확인

### iOS에서 주소창이 보일 때
1. 홈 화면에서 기존 앱 삭제
2. Safari 설정 > 방문 기록 삭제
3. Safari 완전 종료
4. 다시 홈 화면에 추가

### 배포 실패 시
1. 환경 변수가 올바르게 설정되었는지 확인
2. Vercel 로그 확인
3. GitHub 레포지토리에 모든 파일이 업로드되었는지 확인

## 🚀 업데이트 배포

코드 수정 후:

```bash
git add .
git commit -m "Update: 변경 내용"
git push
```

→ Vercel이 자동으로 재배포합니다!

## 📞 문의 및 지원

문제가 발생하면 GitHub Issues에 등록해주세요.

## 📄 라이선스

MIT License

---

**Vercel 배포 후 생성된 URL을 iPhone Safari로 접속하면 완벽한 PWA 앱을 경험할 수 있습니다!** 🎉
