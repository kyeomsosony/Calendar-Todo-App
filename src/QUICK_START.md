# ⚡ 빠른 시작 가이드

## 🎯 목표: iPhone에서 완벽한 PWA 앱 사용하기

---

## 📝 필요한 것
- ✅ GitHub 계정 (무료)
- ✅ Vercel 계정 (무료)
- ✅ iPhone (Safari 브라우저)

---

## 🚀 3단계로 완성!

### 1단계: GitHub에 올리기 (2분)

1. [github.com/new](https://github.com/new) 접속
2. Repository 이름: `calendar-todo-app` 입력
3. **"Create repository"** 클릭
4. **"uploading an existing file"** 클릭
5. Figma Make 다운로드한 파일 전부 드래그 앤 드롭
6. **"Commit changes"** 클릭

---

### 2단계: Vercel 배포 (2분)

1. [vercel.com](https://vercel.com) 접속
2. **"Continue with GitHub"** 클릭
3. **"Add New... → Project"** 클릭
4. `calendar-todo-app` 레포지토리 선택
5. **"Import"** 클릭
6. **"Environment Variables"** 섹션 펼치기

**2개 환경 변수 추가:**

```
VITE_SUPABASE_URL
https://kdxuetpkzxztamkavlxb.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHVldHBrenh6dGFta2F2bHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NzcsImV4cCI6MjA3ODIzODg3N30.q77FQH9kJ_y4g94ad2dF34jZd0PnATb4zLxQb_YdHik
```

7. **"Deploy"** 클릭
8. 2-3분 대기 ⏳

✅ **배포 완료!**

생성된 URL 확인 (예: `https://calendar-todo-app-abc123.vercel.app`)

---

### 3단계: iPhone에 설치 (1분)

1. iPhone에서 **Safari** 열기
2. Vercel에서 받은 URL 입력
3. 하단 **공유 버튼 (⎙)** 탭
4. **"홈 화면에 추가"** 선택
5. **"추가"** 탭
6. 홈 화면에서 **앱 아이콘 탭**

### 🎉 완성!
주소창 없이 전체 화면 앱으로 실행됩니다!

---

## ✅ 확인 사항

### 배포가 잘 되었는지 확인:
- [ ] Vercel URL 접속 시 로그인 화면 보임
- [ ] 회원가입 가능
- [ ] 로그인 가능

### PWA가 잘 작동하는지 확인:
- [ ] iPhone Safari로 접속
- [ ] 홈 화면에 추가 가능
- [ ] 앱 실행 시 주소창 안 보임
- [ ] 전체 화면으로 실행됨
- [ ] 설정 > 앱 설치 섹션에서 "설치됨" 배지 보임

---

## 🐛 문제 해결

### Q: 배포 실패 에러
→ 환경 변수 2개를 정확히 입력했는지 확인

### Q: iPhone에서 여전히 주소창 보임
→ **Figma 도메인이 아닌 Vercel 도메인으로 접속했는지 확인!**
→ Safari 캐시 삭제 후 다시 "홈 화면에 추가"

### Q: 로그인 안 됨
→ Vercel 환경 변수에 Supabase URL과 Key가 올바른지 확인

---

## 📱 비교: Before vs After

### Before (Figma Make)
- ❌ 주소창 보임
- ❌ Safari UI 보임
- ❌ Service Worker 작동 안 함
- ❌ manifest.json 로드 안 됨

### After (Vercel)
- ✅ 주소창 없음
- ✅ 전체 화면
- ✅ 완벽한 PWA
- ✅ 빠른 로딩

---

## 🎁 보너스

### 자동 재배포
코드 수정 → GitHub에 커밋 → **자동으로 Vercel 재배포!**

### 무료 HTTPS
Vercel이 자동으로 HTTPS 인증서 설정

### 성능 최적화
CDN, 이미지 최적화 자동 적용

---

## 📞 더 자세한 가이드

- 상세 배포 가이드: `VERCEL_DEPLOY_GUIDE.md`
- PWA 설정 정보: `PWA_SETUP.md`
- 전체 문서: `README.md`

---

**5분이면 완성! 지금 바로 시작하세요!** 🚀
