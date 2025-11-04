/**
 * @file app/(main)/profile/[userId]/page.tsx
 * @description 사용자 프로필 페이지
 *
 * 특정 사용자의 프로필 정보와 게시물을 표시하는 페이지입니다.
 *
 * @dependencies
 * - components/profile/ProfileHeader
 * - components/profile/PostGrid
 */

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      <div className="max-w-[935px] mx-auto px-4 py-8">
        <ProfileHeader userId={userId} />
        <PostGrid userId={userId} />
      </div>
    </div>
  );
}

