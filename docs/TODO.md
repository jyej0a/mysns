# 📋 SNS 프로젝트 TODO

Instagram 클론 SNS 프로젝트 개발 진행 상황 체크리스트

**기준 문서**: [PRD.md](./PRD.md)

---

## ✅ 완료된 작업

### 기본 인프라
- [x] Next.js 15 프로젝트 생성 및 설정
- [x] TypeScript 설정
- [x] Tailwind CSS v4 설정 (globals.css)
- [x] Clerk 인증 연동 (한국어 설정)
- [x] Supabase 프로젝트 생성 및 연동
- [x] 데이터베이스 스키마 설계 (`sns_schema.sql`)
- [x] 환경 변수 설정 (.env)
- [x] 기본 UI 컴포넌트 (shadcn/ui)
  - [x] Button
  - [x] Dialog
  - [x] Form, Input, Textarea, Label
  - [x] Accordion

### 라우트 그룹 설정
- [x] `(main)` Route Group 생성 (`app/(main)/layout.tsx`)
  - [x] 메인 레이아웃 (Sidebar, MobileHeader, BottomNav)
  - [x] 홈 피드, 프로필, 게시물 상세 페이지에 적용
- [ ] `(auth)` Route Group 생성 (선택사항)
  - [ ] 커스텀 로그인/회원가입 페이지가 필요한 경우에만
  - [ ] 현재는 Clerk 기본 페이지 사용 중

### 인증 및 사용자 관리
- [x] Clerk + Supabase 네이티브 통합 설정
  - [x] `lib/supabase/clerk-client.ts` (Client Component용)
  - [x] `lib/supabase/server.ts` (Server Component용)
  - [x] `lib/supabase/service-role.ts` (관리자 권한용)
  - [x] `lib/supabase/client.ts` (공개 데이터용)
- [x] 사용자 동기화 기능
  - [x] `hooks/use-sync-user.ts` 훅
  - [x] `components/providers/sync-user-provider.tsx`
  - [x] `/api/sync-user` API 라우트
- [x] Middleware 설정 (`middleware.ts`)

### 레이아웃 및 네비게이션
- [x] Navbar 컴포넌트 (`components/Navbar.tsx`)
  - [x] Clerk 로그인/로그아웃 버튼
  - [x] UserButton 통합

### 테스트 페이지 (개발용)
- [x] 인증 테스트 페이지 (`app/auth-test/page.tsx`)
  - [x] Clerk + Supabase 연동 테스트
  - [x] 사용자 데이터 조회/생성 테스트
  - [x] 에러 핸들링 및 해결 방법 안내
- [x] Storage 테스트 페이지 (`app/storage-test/page.tsx`)
  - [x] Supabase Storage 업로드 테스트

---

## 📝 개발 진행 상황

### 1. 홈 피드 페이지

#### 1-1. 기본 세팅 ✅
- [x] Next.js + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정 (인스타 컬러 스키마)
- [x] Clerk 인증 연동 (한국어 설정)
- [x] Supabase 프로젝트 생성 및 연동
- [x] Supabase 클라이언트 설정 (4가지 타입 모두 구현)
- [ ] **⚠️ Supabase Dashboard에서 `sns_schema.sql` 마이그레이션 실행 필요**

#### 1-2. 레이아웃 구조 ✅
- [x] Sidebar 컴포넌트 생성 (`components/layout/Sidebar.tsx`)
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트
  - [x] Tablet: 72px 너비, 아이콘만
  - [x] 메뉴: 홈, 검색, 만들기, 프로필
  - [x] Hover 효과 및 Active 상태 스타일
- [x] MobileHeader 컴포넌트 생성 (`components/layout/MobileHeader.tsx`)
  - [x] 높이 60px
  - [x] 로고 + 알림/DM/프로필 아이콘
- [x] BottomNav 컴포넌트 생성 (`components/layout/BottomNav.tsx`)
  - [x] 높이 50px
  - [x] 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
- [x] (main) Route Group 생성 (`app/(main)/layout.tsx`)
  - [x] Sidebar/MobileHeader/BottomNav 통합
  - [x] 반응형 레이아웃 적용

#### 1-3. 홈 피드 - 게시물 목록 ✅
- [x] PostCard 컴포넌트 생성 (`components/post/PostCard.tsx`)
  - [x] 헤더: 프로필 이미지(32px), 사용자명, 시간, ⋯ 메뉴
  - [x] 이미지 영역: 1:1 정사각형
  - [x] 액션 버튼: 좋아요, 댓글, 공유(UI만), 북마크(UI만)
  - [x] 컨텐츠: 좋아요 수, 캡션(100자 초과 시 "... 더 보기"), 댓글 미리보기(최신 2개)
  - [x] 클릭 시 게시물 상세 페이지로 이동 (모바일)
- [x] PostCardSkeleton 컴포넌트 생성 (`components/post/PostCardSkeleton.tsx`)
  - [x] 로딩 UI (회색 박스 + Shimmer 효과)
- [x] PostFeed 컴포넌트 생성 (`components/post/PostFeed.tsx`)
  - [x] 게시물 목록 표시
  - [x] 로딩 상태 처리
  - [x] 에러 처리
  - [ ] 무한 스크롤 구현 (1-4에서 구현 예정)
- [x] `/api/posts` GET API 생성 (`app/api/posts/route.ts`)
  - [x] 페이지네이션 (10개씩, limit/offset 파라미터)
  - [x] 시간 역순 정렬
  - [x] 사용자 정보 포함 (JOIN)
  - [x] 좋아요 수, 댓글 수 계산
  - [x] 댓글 미리보기 (최신 2개)
  - [x] 특정 사용자 필터링 (userId 쿼리 파라미터)
- [x] 게시물 상세 페이지 라우트 생성 (`app/(main)/post/[postId]/page.tsx`)
  - [x] 기본 라우트 구조 생성
  - [ ] Desktop: 모달로 표시 (추후 구현)
  - [ ] Mobile: 전체 페이지로 표시 (추후 구현)
  - [ ] 게시물 상세 정보 표시 (추후 구현)

#### 1-4. 홈 피드 - 좋아요 기능
- [ ] 좋아요 테이블 확인 (이미 `sns_schema.sql`에 포함됨)
- [ ] `/api/likes` POST API 생성 (`app/api/likes/route.ts`)
  - [ ] 좋아요 추가
  - [ ] 중복 방지 검증
- [ ] `/api/likes` DELETE API 생성 (`app/api/likes/[likeId]/route.ts` 또는 query param)
  - [ ] 좋아요 취소
- [ ] 좋아요 버튼 구현 (`PostCard` 내부)
  - [ ] 빈 하트 ↔ 빨간 하트 상태 관리
  - [ ] 클릭 애니메이션: scale(1.3) → scale(1)
  - [ ] 더블탭 좋아요 (모바일): 이미지 더블탭 시 큰 하트 등장

---

### 2. 게시물 작성 & 댓글 기능

#### 2-1. 게시물 작성 모달
- [ ] CreatePostModal 컴포넌트 생성 (`components/post/CreatePostModal.tsx`)
  - [ ] Dialog 기반 (shadcn/ui)
  - [ ] 이미지 미리보기 UI
  - [ ] 이미지 업로드 버튼
  - [ ] 캡션 입력 필드 (최대 2,200자)
  - [ ] "게시" 버튼

#### 2-2. 게시물 작성 - 이미지 업로드
- [ ] Supabase Storage 버킷 생성 (Supabase Dashboard)
  - [ ] 버킷명: `posts` (또는 `uploads`)
  - [ ] RLS 정책 설정 (인증된 사용자만 업로드)
- [ ] `/api/posts` POST API 생성 (`app/api/posts/route.ts`)
  - [ ] 이미지 파일 업로드 (Supabase Storage)
  - [ ] 파일 검증 (최대 5MB, 이미지 형식만)
  - [ ] 게시물 데이터 저장 (posts 테이블)
  - [ ] 성공 시 피드 리프레시

#### 2-3. 댓글 기능 - UI & 작성
- [ ] 댓글 테이블 확인 (이미 `sns_schema.sql`에 포함됨)
- [ ] CommentList 컴포넌트 생성 (`components/comment/CommentList.tsx`)
  - [ ] 댓글 목록 표시
  - [ ] 사용자 정보 포함
  - [ ] 시간 표시
- [ ] CommentForm 컴포넌트 생성 (`components/comment/CommentForm.tsx`)
  - [ ] 입력창: "댓글 달기..."
  - [ ] Enter 또는 "게시" 버튼으로 제출
- [ ] `/api/comments` POST API 생성 (`app/api/comments/route.ts`)
  - [ ] 댓글 작성
  - [ ] 게시물 ID, 사용자 ID 포함

#### 2-4. 댓글 기능 - 삭제 & 무한스크롤
- [ ] `/api/comments` DELETE API 생성 (`app/api/comments/[commentId]/route.ts`)
  - [ ] 댓글 삭제 (본인만 가능)
- [ ] 댓글 삭제 버튼 추가 (`CommentList` 내부)
  - [ ] 본인 댓글에만 ⋯ 메뉴 표시
  - [ ] 삭제 확인 다이얼로그
- [ ] PostFeed 무한 스크롤 구현
  - [ ] Intersection Observer 사용
  - [ ] 하단 도달 시 다음 10개 로드
  - [ ] 로딩 상태 표시
- [ ] 게시물 상세 페이지 구현 (`app/(main)/post/[postId]/page.tsx`)
  - [ ] PostModal 컴포넌트 생성 (Desktop용)
  - [ ] 게시물 상세 페이지 (Mobile용)
  - [ ] 전체 댓글 목록 표시
  - [ ] 댓글 작성 기능

---

### 3. 프로필 페이지 & 팔로우 기능

#### 3-1. 프로필 페이지 - 기본 정보
- [ ] 프로필 페이지 라우트 그룹 설정 확인
  - [x] `(main)` Route Group에 포함됨 (이미 설정됨)
- [ ] `/profile/[userId]` 동적 라우트 생성 (`app/(main)/profile/[userId]/page.tsx`)
- [ ] 프로필 헤더 컴포넌트 생성 (`components/profile/ProfileHeader.tsx`)
  - [ ] 프로필 이미지: 150px (Desktop) / 90px (Mobile)
  - [ ] 사용자명
  - [ ] 통계: 게시물 수, 팔로워 수, 팔로잉 수
  - [ ] "팔로우" 또는 "팔로잉" 버튼 (다른 사람 프로필)
  - [ ] "프로필 편집" 버튼 (본인 프로필, 1차 제외)
- [ ] `/api/users/[userId]` GET API 생성 (`app/api/users/[userId]/route.ts`)
  - [ ] 사용자 정보 조회
  - [ ] 통계 정보 포함 (user_stats 뷰 활용)

#### 3-2. 프로필 페이지 - 게시물 그리드
- [ ] PostGrid 컴포넌트 생성 (`components/profile/PostGrid.tsx`)
  - [ ] 3열 그리드 레이아웃 (반응형)
  - [ ] 1:1 정사각형 썸네일
  - [ ] Hover 시 좋아요/댓글 수 표시
  - [ ] 클릭 시 게시물 상세 모달/페이지
- [ ] `/api/posts` GET API에 `userId` 쿼리 파라미터 추가
  - [ ] 특정 사용자의 게시물만 필터링

#### 3-3. 팔로우 기능
- [ ] 팔로우 테이블 확인 (이미 `sns_schema.sql`에 포함됨)
- [ ] `/api/follows` POST API 생성 (`app/api/follows/route.ts`)
  - [ ] 팔로우 추가
  - [ ] 중복 방지 및 자기 자신 팔로우 방지
- [ ] `/api/follows` DELETE API 생성 (`app/api/follows/[followId]/route.ts` 또는 query param)
  - [ ] 언팔로우
- [ ] 팔로우/언팔로우 버튼 구현 (`ProfileHeader` 내부)
  - [ ] 미팔로우: "팔로우" (파란색)
  - [ ] 팔로우 중: "팔로잉" (회색)
  - [ ] Hover: "언팔로우" (빨간 테두리)
  - [ ] 클릭 시 즉시 API 호출 및 UI 업데이트

#### 3-4. 최종 마무리 & 배포
- [ ] 모바일 반응형 테스트
  - [ ] < 768px: BottomNav, MobileHeader
- [ ] 태블릿 반응형 테스트
  - [ ] 768px ~ 1024px: Icon-only Sidebar
- [ ] Desktop 반응형 테스트
  - [ ] 1024px+: Full Sidebar
- [ ] 에러 핸들링
  - [ ] API 에러 처리
  - [ ] 네트워크 에러 처리
  - [ ] 사용자 친화적 에러 메시지
- [ ] Skeleton UI 적용
  - [ ] 모든 로딩 상태에 Skeleton 적용
- [ ] Vercel 배포
  - [ ] 환경 변수 설정
  - [ ] Supabase 프로덕션 연결
  - [ ] 배포 후 테스트

---

## 🚫 1차 MVP 제외 기능 (2차 확장)

다음 기능들은 2차 확장에서 구현 예정:

- [ ] 검색 (사용자, 해시태그)
- [ ] 탐색 페이지
- [ ] 릴스
- [ ] 메시지 (DM)
- [ ] 알림
- [ ] 스토리
- [ ] 동영상
- [ ] 이미지 여러 장
- [ ] 공유 버튼 기능 (현재는 UI만)
- [ ] 북마크 기능 (현재는 UI만)
- [ ] 프로필 편집 (Clerk 기본 사용)
- [ ] 팔로워/팔로잉 목록 모달

---

## 📌 참고사항

### 데이터베이스 마이그레이션
1. Supabase Dashboard → SQL Editor 열기
2. `supabase/migrations/sns_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 실행
4. 생성된 테이블 확인: Table Editor에서 `users`, `posts`, `likes`, `comments`, `follows` 확인

### Storage 버킷 설정
1. Supabase Dashboard → Storage
2. "New bucket" 클릭
3. 버킷명: `posts` (또는 `uploads`)
4. Public/Private 선택 (RLS 정책 설정)

### 개발 우선순위
1. **레이아웃 구조** → 사용자 경험의 기반
2. **홈 피드** → 핵심 기능
3. **게시물 작성** → 콘텐츠 생성
4. **댓글 & 좋아요** → 상호작용
5. **프로필 & 팔로우** → 소셜 기능

---

**마지막 업데이트**: 2025-11-04  
**기준 문서**: [PRD.md](./PRD.md) v3.0
