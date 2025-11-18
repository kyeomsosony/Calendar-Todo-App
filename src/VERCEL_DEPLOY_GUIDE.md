# 🚀 Vercel 배포 가이드 (5분 완성)

## 📋 준비물
- GitHub 계정
- Vercel 계정 (무료)

---

## 🎯 빠른 배포 (5단계)

### 1️⃣ GitHub에 코드 업로드

**옵션 A: 웹에서 업로드 (가장 쉬움)**

1. [GitHub](https://github.com) 접속 → 로그인
2. 우측 상단 **"+"** → **"New repository"**
3. Repository 이름: `calendar-todo-app`
4. **"Create repository"** 클릭
5. **"uploading an existing file"** 클릭
6. Figma Make에서 다운로드한 모든 파일을 드래그 앤 드롭
7. **"Commit changes"** 클릭

**옵션 B: Git 사용 (더 빠름)**

```bash
# 1. 다운로드한 폴더로 이동
cd calendar-todo-app

# 2. Git 초기화 및 업로드
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calendar-todo-app.git
git push -u origin main
```

---

### 2️⃣ Vercel 연결

1. [Vercel](https://vercel.com) 접속
2. **"Continue with GitHub"** 클릭 → GitHub 연동
3. **"Add New..."** → **"Project"** 클릭
4. 방금 만든 레포지토리 찾기
5. **"Import"** 클릭

---

### 3️⃣ 환경 변수 설정 ⚠️ 중요!

배포 설정 화면에서 **"Environment Variables"** 섹션 펼치기

**다음 2개 변수 추가:**

#### Variable 1:
```
Name: VITE_SUPABASE_URL
Value: https://kdxuetpkzxztamkavlxb.supabase.co
```

#### Variable 2:
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik
```

---

### 4️⃣ 배포 시작

**"Deploy"** 버튼 클릭

⏳ 2-3분 대기...

---

### 5️⃣ 완료! 🎉

✅ 배포 성공!

생성된 URL 확인:
```
https://your-project-name.vercel.app
```

---

## 📱 iPhone에서 PWA 설치하기

### iPhone 13에서 테스트:

1. **Safari** 열기 (Chrome 아님!)
2. Vercel URL 접속 (예: `https://calendar-todo-app.vercel.app`)
3. 하단 **공유 버튼 (⎙)** 클릭
4. **"홈 화면에 추가"** 선택
5. **"추가"** 클릭
6. 홈 화면에서 **앱 아이콘 클릭**

### ✨ 결과:
- ✅ **주소창이 사라짐!**
- ✅ **전체 화면으로 실행!**
- ✅ **네이티브 앱처럼 동작!**

---

## 🔄 코드 수정 후 재배포

### 방법 1: GitHub 웹에서
1. GitHub 레포지토리 접속
2. 파일 클릭 → **연필 아이콘 (Edit)** 클릭
3. 수정 후 **"Commit changes"** 클릭
4. → Vercel이 자동으로 재배포! 🚀

### 방법 2: Git 명령어
```bash
git add .
git commit -m "업데이트: 변경사항"
git push
```
→ 자동 재배포!

---

## 🎨 커스텀 도메인 설정 (선택사항)

Vercel 프로젝트 설정:

1. **"Settings"** → **"Domains"**
2. 도메인 입력 (예: `mycaltodo.com`)
3. DNS 설정 안내에 따라 설정
4. ✅ 완료!

---

## ⚠️ 문제 해결

### "Build Failed" 에러
→ 환경 변수를 다시 확인하세요

### PWA가 작동 안 함
→ HTTPS 확인 (Vercel은 자동 HTTPS)

### iOS에서 여전히 주소창 보임
→ Figma Make 도메인이 아닌 **Vercel 도메인**으로 접속했는지 확인!

---

## 📊 배포 상태 확인

Vercel Dashboard에서:
- ✅ 실시간 방문자 수
- ✅ 성능 분석
- ✅ 오류 로그
- ✅ 배포 기록

---

## 🎯 체크리스트

배포 전:
- [ ] GitHub 레포지토리 생성
- [ ] 모든 파일 업로드
- [ ] Vercel 계정 생성

배포 시:
- [ ] 환경 변수 2개 추가
- [ ] Deploy 버튼 클릭
- [ ] 배포 완료 확인

배포 후:
- [ ] URL 접속 테스트
- [ ] 로그인 테스트
- [ ] iPhone Safari로 PWA 설치
- [ ] 주소창 없는지 확인

---

## 💡 팁

### 1. 브랜치로 테스트 배포
- `main` 브랜치 = 프로덕션
- `dev` 브랜치 = 테스트
- Vercel이 각 브랜치마다 별도 URL 생성!

### 2. 자동 미리보기
- Pull Request 생성 시 자동으로 미리보기 배포!
- 수정사항을 안전하게 테스트 가능

### 3. 무료 플랜
- 개인 프로젝트는 영원히 무료
- HTTPS 자동 설정
- 무제한 대역폭 (Fair Use)

---

## 📞 도움이 필요하면?

1. Vercel 문서: https://vercel.com/docs
2. GitHub 가이드: https://docs.github.com
3. PWA 가이드: `PWA_SETUP.md` 참고

---

**이제 Vercel로 배포하고 iPhone에서 완벽한 PWA를 즐기세요!** 🎉

배포 URL: `https://your-project-name.vercel.app`
