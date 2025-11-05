# 게시물 삭제 기능

## 개요
게시물 삭제 기능 구현 작업 목록 (PRD 7.2)

## 완료된 작업
- [x] `/api/posts/[postId]` DELETE API 생성
  - [x] Clerk 인증 확인
  - [x] 본인 게시물인지 권한 검증
  - [x] 게시물 삭제
  - [x] 관련 데이터 삭제 (좋아요, 댓글 - CASCADE로 자동 삭제)
  - [x] Supabase Storage에서 이미지 파일 삭제
- [x] PostCard 헤더에 ⋯ 메뉴 클릭 시 삭제 옵션 표시 (본인 게시물만)
- [x] PostModal 헤더에 ⋯ 메뉴 클릭 시 삭제 옵션 표시 (본인 게시물만)
- [x] 삭제 확인 다이얼로그 (Dialog 컴포넌트 사용)
- [x] 삭제 후 피드에서 자동 제거 (PostFeed에서 optimistic update)
- [x] 삭제 후 모달/페이지 닫기 (상세 보기 중인 경우)
- [x] 게시물 상세 페이지에 삭제 메뉴 추가 및 삭제 후 리다이렉트

## 진행 중 / 예정 작업
- [ ] (없음 - 모든 작업 완료)

## 관련 파일
- `app/api/posts/[postId]/route.ts` (DELETE)
- `components/post/PostCard.tsx`
- `components/post/PostModal.tsx`
- `app/(main)/post/[postId]/page.tsx`

