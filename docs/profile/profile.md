# 프로필 페이지

## 개요
사용자 프로필 페이지 (`/profile/[userId]`) 구현 작업 목록

## 완료된 작업

### 기본 정보
- [x] 동적 라우트 설정 (`/profile/[userId]/page.tsx`)
- [x] 프로필 헤더 컴포넌트 (`ProfileHeader.tsx`)
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명
  - [x] 팔로우/팔로잉 버튼 (본인 프로필 제외)
  - [x] 통계 표시 (게시물 수, 팔로워 수, 팔로잉 수)
  - [x] Bio 표시 (사용자 소개)
- [x] `/api/users/[userId]` GET API
  - [x] 사용자 기본 정보 조회
  - [x] 게시물 수 계산 (user_stats 뷰 활용)
  - [x] 팔로워/팔로잉 수 계산 (user_stats 뷰 활용)
  - [x] 팔로우 상태 확인 (현재 사용자 기준)
  - [x] Bio 필드 포함

### 게시물 그리드
- [x] PostGrid 컴포넌트
  - [x] 3열 그리드 레이아웃 (반응형)
  - [x] 1:1 정사각형 이미지
  - [x] Hover 시 좋아요/댓글 수 표시
  - [x] 클릭 시 게시물 상세로 이동
- [x] `/api/posts` GET API에 `userId` 필터 추가
  - [x] 특정 사용자 게시물만 조회

### 팔로우 기능
- [x] 팔로우/언팔로우 버튼
  - [x] 미팔로우: "팔로우" (파란색)
  - [x] 팔로우 중: "팔로잉" (회색)
  - [x] Hover: "언팔로우" (빨간 테두리)
- [x] `/api/follows` POST/DELETE API
  - [x] 팔로우 생성
  - [x] 팔로우 삭제 (언팔로우)
  - [x] 권한 검증 (본인은 팔로우 불가)
- [x] follows 테이블 확인 (이미 `sns_schema.sql`에 포함됨)
- [x] 팔로우 상태 즉시 UI 업데이트 (optimistic update)

### 반응형
- [x] Desktop 레이아웃 (프로필 이미지 150px)
- [x] Mobile 레이아웃 (프로필 이미지 90px)
- [x] Tablet 레이아웃

## 진행 중 / 예정 작업

### 프로필 이미지 기능 (사용자 직접 업로드) ✅
- [x] 데이터베이스 스키마 업데이트
  - [x] `users` 테이블에 `profile_image_url` 필드 추가 (마이그레이션)
  - [x] 필드 타입: TEXT, nullable
  - [x] Storage 정책 추가 (프로필 이미지 공개 접근)
- [x] 프로필 이미지 업로드 API
  - [x] `/api/users/[userId]/profile-image` POST API 생성
  - [x] Supabase Storage에 이미지 업로드 (`{clerk_id}/profile/{filename}`)
  - [x] 업로드된 이미지 URL을 `users.profile_image_url`에 저장
  - [x] 파일 검증 (이미지 형식만, 최대 5MB)
  - [x] 권한 검증 (본인만 업로드 가능)
- [x] 프로필 이미지 삭제 API
  - [x] `/api/users/[userId]/profile-image` DELETE API 생성
  - [x] Storage에서 기존 이미지 파일 삭제
  - [x] `users.profile_image_url`을 NULL로 업데이트
- [x] 프로필 편집 UI
  - [x] 프로필 편집 모달 컴포넌트 생성 (`EditProfileModal.tsx`)
  - [x] 프로필 이미지 업로드/삭제 기능
  - [x] Bio 수정 기능
  - [x] 본인 프로필에만 "프로필 편집" 버튼 표시
- [x] 프로필 이미지 표시
  - [x] `/api/users/[userId]` API에 `profile_image_url` 포함
  - [x] ProfileHeader에서 프로필 이미지 표시 (없으면 이니셜 폴백)
  - [ ] 모든 프로필 이미지 표시 위치 업데이트 (PostCard, CommentList 등) - 추후 작업

### UI/UX 개선 ✅
- [x] Desktop에서 게시물 클릭 시 모달 열기
  - [x] PostGrid에서 Desktop 클릭 시 PostModal 사용
  - [x] usePostModal 훅 사용하여 모달 상태 관리
  - [x] Mobile은 기존대로 페이지 이동
- [x] 통계 클릭 기능
  - [x] 게시물 수 클릭 시 게시물 그리드로 스크롤
  - [x] 팔로워 수 클릭 시 팔로워 목록 모달
  - [x] 팔로잉 수 클릭 시 팔로잉 목록 모달
  - [x] 팔로워/팔로잉 목록 API 생성
  - [x] FollowListModal 컴포넌트 생성

### 2차 확장 기능
- [ ] 릴스 탭 기능 구현
- [ ] 태그된 게시물 탭 기능 구현

## 관련 파일
- `app/(main)/profile/[userId]/page.tsx`
- `components/profile/ProfileHeader.tsx`
- `components/profile/PostGrid.tsx`
- `app/api/users/[userId]/route.ts`
- `app/api/follows/route.ts`
- `supabase/migrations/YYYYMMDDHHmmss_create_follows_table.sql`

