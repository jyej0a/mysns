# 프로필 페이지

## 개요
사용자 프로필 페이지 (`/profile/[userId]`) 구현 작업 목록

## 완료된 작업
- [ ] (없음 - 아직 미구현)

## 진행 중 / 예정 작업

### 기본 정보
- [ ] 동적 라우트 설정 (`/profile/[userId]/page.tsx`)
- [ ] 프로필 헤더 컴포넌트 (`ProfileHeader.tsx`)
  - [ ] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [ ] 사용자명
  - [ ] 팔로우/팔로잉 버튼 (본인 프로필 제외)
  - [ ] 통계 표시 (게시물 수, 팔로워 수, 팔로잉 수)
  - [ ] Bio 표시
- [ ] `/api/users/[userId]` GET API
  - [ ] 사용자 기본 정보 조회
  - [ ] 게시물 수 계산
  - [ ] 팔로워/팔로잉 수 계산
  - [ ] 팔로우 상태 확인 (현재 사용자 기준)

### 게시물 그리드
- [ ] PostGrid 컴포넌트
  - [ ] 3열 그리드 레이아웃 (반응형)
  - [ ] 1:1 정사각형 이미지
  - [ ] Hover 시 좋아요/댓글 수 표시
  - [ ] 클릭 시 게시물 상세로 이동
- [ ] `/api/posts` GET API에 `userId` 필터 추가
  - [ ] 특정 사용자 게시물만 조회

### 팔로우 기능
- [ ] 팔로우/언팔로우 버튼
  - [ ] 미팔로우: "팔로우" (파란색)
  - [ ] 팔로우 중: "팔로잉" (회색)
  - [ ] Hover: "언팔로우" (빨간 테두리)
- [ ] `/api/follows` POST/DELETE API
  - [ ] 팔로우 생성
  - [ ] 팔로우 삭제 (언팔로우)
  - [ ] 권한 검증 (본인은 팔로우 불가)
- [ ] follows 테이블 생성 (마이그레이션)
- [ ] 팔로우 상태 즉시 UI 업데이트

### 반응형
- [ ] Desktop 레이아웃 (프로필 이미지 150px)
- [ ] Mobile 레이아웃 (프로필 이미지 90px)
- [ ] Tablet 레이아웃

## 관련 파일
- `app/(main)/profile/[userId]/page.tsx`
- `components/profile/ProfileHeader.tsx`
- `components/profile/PostGrid.tsx`
- `app/api/users/[userId]/route.ts`
- `app/api/follows/route.ts`
- `supabase/migrations/YYYYMMDDHHmmss_create_follows_table.sql`

