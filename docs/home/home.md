# 홈 피드 페이지

## 개요
메인 피드 페이지 (`/`) 구현 작업 목록

## 완료된 작업
- [x] PostFeed 컴포넌트 기본 구조
- [x] PostCard 컴포넌트 (헤더, 이미지, 액션 버튼)
- [x] PostCardSkeleton 로딩 UI
- [x] `/api/posts` GET API (페이지네이션)
- [x] 무한 스크롤 구현 (Intersection Observer)
- [x] 좋아요 기능 (버튼 클릭, 애니메이션)
- [x] 이미지 더블탭 좋아요 (모바일)
- [x] 좋아요 애니메이션 개선 (더블탭 시 큰 하트)
- [x] 댓글 미리보기 (최신 2개)
- [x] 댓글 "모두 보기" 링크 (게시물 상세 페이지로 이동)
- [x] 캡션 "... 더 보기" 기능 (클릭 시 전체 캡션 표시, 접기 기능 포함)
- [x] 게시물 삭제 기능 (본인만) - [post-delete.md](../post-delete/post-delete.md) 참고
- [x] 에러 핸들링 개선 (사용자 친화적 메시지, 네트워크/서버 에러 구분)
- [x] 로딩 상태 개선 (Skeleton UI Shimmer 효과 최적화)

## 진행 중 / 예정 작업
- [ ] (현재 모든 주요 기능 완료)

## 관련 파일
- `app/(main)/page.tsx`
- `components/post/PostFeed.tsx`
- `components/post/PostCard.tsx`
- `components/post/PostCardSkeleton.tsx`
- `app/api/posts/route.ts`

