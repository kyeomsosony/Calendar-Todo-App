# ✅ Vercel 배포 체크리스트

배포 과정을 단계별로 확인하세요!

---

## 📋 배포 전 준비

- [ ] Figma Make에서 프로젝트 다운로드 완료
- [ ] GitHub 계정 생성 또는 로그인
- [ ] Vercel 계정 생성 또는 로그인
- [ ] Supabase 정보 확인 (아래 환경 변수)

```
URL: https://kdxuetpkzxztamkavlxb.supabase.co
Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik
```

---

## 🔵 1단계: GitHub 레포지토리 생성

- [ ] [github.com/new](https://github.com/new) 접속
- [ ] Repository 이름 입력: `calendar-todo-app`
- [ ] Public 또는 Private 선택
- [ ] **"Create repository"** 클릭
- [ ] 레포지토리 생성 완료

---

## 🔵 2단계: 코드 업로드

### 옵션 A: 웹에서 업로드 (추천)

- [ ] **"uploading an existing file"** 클릭
- [ ] 다운로드한 모든 파일 선택
- [ ] 드래그 앤 드롭으로 업로드
- [ ] **"Commit changes"** 클릭
- [ ] 업로드 완료 확인

### 옵션 B: Git 명령어

```bash
cd calendar-todo-app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

- [ ] 모든 명령어 실행
- [ ] GitHub에서 파일 업로드 확인

---

## 🟢 3단계: Vercel 프로젝트 생성

- [ ] [vercel.com](https://vercel.com) 접속
- [ ] **"Continue with GitHub"** 클릭 (GitHub 연동)
- [ ] **"Add New..."** → **"Project"** 클릭
- [ ] `calendar-todo-app` 레포지토리 찾기
- [ ] **"Import"** 클릭
- [ ] 배포 설정 화면 진입

---

## 🟢 4단계: 환경 변수 설정 ⚠️ 중요!

- [ ] **"Environment Variables"** 섹션 펼치기
- [ ] 첫 번째 변수 추가:
  - Name: `VITE_SUPABASE_URL`
  - Value: `https://kdxuetpkzxztamkavlxb.supabase.co`
- [ ] 두 번째 변수 추가:
  - Name: `VITE_SUPABASE_ANON_KEY`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik`
- [ ] 환경 변수 2개 추가 완료 확인

---

## 🟢 5단계: 배포 시작

- [ ] **"Deploy"** 버튼 클릭
- [ ] 빌드 진행 상황 확인 (2-3분)
- [ ] 빌드 로그에서 에러 없는지 확인
- [ ] **"Congratulations!"** 메시지 확인
- [ ] 생성된 URL 복사

배포 URL 형식: `https://[project-name]-[hash].vercel.app`

---

## 🔍 6단계: 배포 확인

- [ ] Vercel URL 클릭
- [ ] 로그인 화면 정상 표시 확인
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 홈 화면 정상 작동 확인
- [ ] 캘린더 페이지 확인
- [ ] 기록 페이지 확인
- [ ] 설정 페이지 확인

---

## 📱 7단계: iPhone PWA 설치

### iPhone 준비

- [ ] iPhone Safari 앱 열기
- [ ] Vercel URL 주소창에 입력
- [ ] 웹사이트 로딩 확인

### 홈 화면에 추가

- [ ] 하단 **공유 버튼 (⎙)** 탭
- [ ] 스크롤해서 **"홈 화면에 추가"** 찾기
- [ ] **"홈 화면에 추가"** 탭
- [ ] 앱 이름 확인: "CalTodo" 또는 "캘린더 투두 앱"
- [ ] 우측 상단 **"추가"** 탭
- [ ] 홈 화면에 앱 아이콘 생성 확인

### PWA 실행 테스트

- [ ] 홈 화면에서 앱 아이콘 탭
- [ ] **주소창이 안 보이는지 확인** ✅
- [ ] **Safari UI가 안 보이는지 확인** ✅
- [ ] 전체 화면으로 실행되는지 확인 ✅
- [ ] 상단 상태바만 보이는지 확인 ✅

---

## 🎯 8단계: PWA 기능 확인

- [ ] 설정 페이지 접속
- [ ] "앱 설치" 섹션 확인
- [ ] **"설치됨"** 초록색 배지 표시 확인 ✅
- [ ] 앱을 닫았다가 다시 열기
- [ ] 빠르게 로딩되는지 확인 (캐싱)
- [ ] 네트워크 끊고 앱 열기 테스트 (오프라인)

---

## 🎉 완료! 축하합니다!

모든 체크리스트를 완료했다면 성공적으로 배포된 것입니다!

---

## 🔧 추가 설정 (선택사항)

### 커스텀 도메인 연결

- [ ] Vercel 프로젝트 > Settings > Domains
- [ ] 도메인 입력
- [ ] DNS 설정 완료
- [ ] SSL 인증서 자동 설정 확인

### GitHub Actions 연동

- [ ] 자동 배포 설정 확인
- [ ] main 브랜치 push 시 자동 배포되는지 테스트

### 성능 모니터링

- [ ] Vercel Analytics 활성화
- [ ] Web Vitals 확인
- [ ] 방문자 통계 확인

---

## ⚠️ 문제 발생 시

### 빌드 실패

- [ ] 환경 변수 재확인
- [ ] Vercel 빌드 로그 확인
- [ ] GitHub 레포지토리에 모든 파일 있는지 확인

### PWA 작동 안 함

- [ ] HTTPS 연결 확인 (Vercel은 자동)
- [ ] manifest.json 접근 가능한지 확인
- [ ] service-worker.js 등록 확인
- [ ] Safari 개발자 도구로 에러 확인

### iPhone에서 주소창 보임

- [ ] **Figma 도메인이 아닌 Vercel 도메인 사용 확인**
- [ ] 홈 화면에서 기존 앱 삭제
- [ ] Safari 설정 > 방문 기록 삭제
- [ ] Safari 완전 종료
- [ ] 다시 홈 화면에 추가

### 로그인 실패

- [ ] Supabase 환경 변수 재확인
- [ ] 네트워크 탭에서 API 호출 확인
- [ ] 콘솔에서 에러 메시지 확인

---

## 📊 성공 기준

✅ **완벽한 배포:**
- Vercel URL로 접속 가능
- 모든 기능 정상 작동
- iPhone PWA 설치 완료
- 주소창 없이 전체 화면 실행
- "설치됨" 배지 표시

---

## 📚 참고 문서

- 빠른 시작: `QUICK_START.md`
- 상세 가이드: `VERCEL_DEPLOY_GUIDE.md`
- PWA 정보: `PWA_SETUP.md`
- 전체 문서: `README.md`

---

**모든 체크리스트를 완료했나요? 축하합니다! 🎉**

배포 URL: `https://your-project-name.vercel.app`
