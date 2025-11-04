/**
 * @file app/page.tsx
 * @description 루트 페이지 - SNS 홈 피드
 *
 * 루트 경로(/) 접속 시 SNS 홈 피드를 표시합니다.
 * app/(main)/page.tsx의 내용을 재사용합니다.
 *
 * @dependencies
 * - components/post/PostFeed
 */

import { PostFeed } from "@/components/post/PostFeed";

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-[#fafafa] py-4">
      <PostFeed />
    </div>
  );
}
