# 게시물 작성 기능

## 개요
게시물 작성 모달 및 이미지 업로드 구현 작업 목록

## 완료된 작업
- [x] CreatePostModal 컴포넌트 기본 구조
- [x] 이미지 미리보기 UI
- [x] 텍스트 입력 필드 (캡션)
- [x] `/api/posts` POST API
- [x] Supabase Storage 업로드
- [x] 파일 검증 (타입, 크기)
- [x] CreatePostProvider (Context)

## 진행 중 / 예정 작업
- [ ] 이미지 크롭/리사이즈 기능 (선택사항)
- [ ] 업로드 진행률 표시
- [ ] 여러 이미지 업로드 (선택사항 - 1차 제외)
- [ ] 업로드 후 피드 자동 새로고침
- [ ] 에러 핸들링 개선
- [ ] 모달 닫기 시 폼 초기화

## 관련 파일
- `components/post/CreatePostModal.tsx`
- `components/providers/create-post-provider.tsx`
- `app/api/posts/route.ts` (POST)
- `lib/supabase/service-role.ts` (Storage 업로드용)

