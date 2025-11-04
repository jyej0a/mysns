/**
 * @file app/(main)/post/[postId]/page.tsx
 * @description 게시물 상세 페이지
 *
 * 모바일에서는 전체 페이지로 표시되고,
 * 데스크톱에서는 추후 모달로 표시될 예정입니다.
 *
 * @dependencies
 * - components/post/PostCard (재사용 또는 별도 컴포넌트)
 */

export default function PostDetailPage() {
  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-4">
      <p className="text-[#8e8e8e]">
        게시물 상세 페이지 (추후 구현 예정)
      </p>
    </div>
  );
}

