/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지
 *
 * 게시물 피드를 표시하는 메인 페이지입니다.
 *
 * @dependencies
 * - components/post/PostFeed
 */

import { PostFeed } from "@/components/post/PostFeed";

export default function HomePage() {
  return (
    <div className="w-full py-4">
      <PostFeed />
    </div>
  );
}

