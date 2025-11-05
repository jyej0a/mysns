# 게시물 상세 페이지

## 개요
게시물 상세 모달 (Desktop) / 페이지 (Mobile) 구현 작업 목록

## 완료된 작업
- [x] PostModal 컴포넌트 (Desktop)
- [x] PostModalProvider (Context)
- [x] PostCard 클릭 시 모달 열기 (Desktop)
- [x] `/api/posts/[postId]` GET API
- [x] 게시물 상세 페이지 (Mobile: `/post/[postId]/page.tsx`)
- [x] 댓글 목록 표시 (CommentList)
- [x] 댓글 작성 기능 (CommentForm)
- [x] 댓글 삭제 기능 (본인만)
- [x] 좋아요 기능 (모달 내부)

## 진행 중 / 예정 작업
- [ ] 모달 닫기 버튼 개선 (ESC 키, 배경 클릭)
- [ ] URL 파라미터 동기화 (Desktop: `?postId=xxx`)
- [ ] 모달 열기/닫기 애니메이션
- [ ] 이미지 로딩 상태 표시
- [ ] 게시물 삭제 기능 (본인만, 모달 내부)
- [ ] 게시물 수정 기능 (선택사항)
- [ ] 공유 버튼 기능 (선택사항)
- [ ] 북마크 버튼 기능 (선택사항)

## 관련 파일
- `components/post/PostModal.tsx`
- `components/providers/post-modal-provider.tsx`
- `app/(main)/post/[postId]/page.tsx`
- `app/api/posts/[postId]/route.ts`
- `components/comment/CommentList.tsx`
- `components/comment/CommentForm.tsx`

