/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지 (임시)
 *
 * 추후 PostCard와 PostFeed 컴포넌트로 대체될 예정입니다.
 * 현재는 기본 레이아웃 구조 확인용 임시 페이지입니다.
 */

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      {/* 임시 컨텐츠 */}
      <div className="p-8">
        <h1 className="text-2xl font-bold text-[#262626] mb-4">홈 피드</h1>
        <p className="text-[#8e8e8e]">
          게시물 목록이 여기에 표시됩니다. (PostCard 컴포넌트 구현 예정)
        </p>
      </div>
    </div>
  );
}

