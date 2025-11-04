/**
 * @file app/(main)/profile/page.tsx
 * @description 본인 프로필 페이지
 *
 * 현재 로그인한 사용자의 프로필로 리다이렉트합니다.
 *
 * @dependencies
 * - @clerk/nextjs/server: auth
 * - lib/supabase/service-role: getServiceRoleClient
 * - next/navigation: redirect
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export default async function ProfilePage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in");
  }

  // Clerk user ID를 Supabase user_id로 변환
  const supabase = getServiceRoleClient();
  const { data: userData } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (!userData) {
    // 사용자가 Supabase에 없으면 동기화 필요
    redirect("/");
  }

  // 본인 프로필 페이지로 리다이렉트
  redirect(`/profile/${userData.id}`);
}

