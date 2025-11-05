# 게시물 삭제 기능

## 개요
게시물 삭제 기능 구현 작업 목록 (PRD 7.2)

## 완료된 작업
- [ ] (없음 - 아직 미구현)

## 진행 중 / 예정 작업

### API 구현
- [ ] `/api/posts/[postId]` DELETE API 생성
  - [ ] Clerk 인증 확인
  - [ ] 본인 게시물인지 권한 검증
  - [ ] 게시물 삭제
  - [ ] 관련 데이터 삭제 (좋아요, 댓글 - CASCADE 또는 수동)
  - [ ] Supabase Storage에서 이미지 파일 삭제

### UI 구현
- [ ] PostCard 헤더에 ⋯ 메뉴 클릭 시 삭제 옵션 표시 (본인 게시물만)
- [ ] PostModal 헤더에 ⋯ 메뉴 클릭 시 삭제 옵션 표시 (본인 게시물만)
- [ ] 삭제 확인 다이얼로그 (Dialog 컴포넌트 사용)
- [ ] 삭제 후 피드에서 자동 제거 또는 새로고침
- [ ] 삭제 후 모달/페이지 닫기 (상세 보기 중인 경우)

## 관련 파일
- `app/api/posts/[postId]/route.ts` (DELETE)
- `components/post/PostCard.tsx`
- `components/post/PostModal.tsx`
- `app/(main)/post/[postId]/page.tsx`

