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
  console.group("📄 [Profile Redirect] 본인 프로필 리다이렉트");
  
  const { userId: clerkUserId } = await auth();
  console.log("Clerk userId:", clerkUserId);

  if (!clerkUserId) {
    console.warn("⚠️ Clerk 사용자 인증 실패, 로그인 페이지로 리다이렉트");
    console.groupEnd();
    redirect("/sign-in");
  }

  // Clerk user ID를 Supabase user_id로 변환
  console.log("📋 Supabase에서 사용자 조회 중... (clerk_id:", clerkUserId, ")");
  const supabase = getServiceRoleClient();
  const { data: userData, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error) {
    console.error("❌ Supabase 사용자 조회 에러:", {
      error,
      code: error.code,
      message: error.message,
      clerkUserId,
    });
    console.groupEnd();
    // 사용자가 Supabase에 없으면 동기화 필요
    redirect("/");
  }

  if (!userData) {
    console.error("❌ Supabase에 사용자 데이터 없음:", clerkUserId);
    console.log("💡 사용자 동기화가 필요합니다. 홈으로 리다이렉트합니다.");
    console.groupEnd();
    // 사용자가 Supabase에 없으면 동기화 필요
    redirect("/");
  }

  console.log("✅ 사용자 찾음:", {
    supabaseUserId: userData.id,
    clerkUserId,
  });
  console.log("🔄 리다이렉트:", `/profile/${userData.id}`);
  console.groupEnd();

  // 본인 프로필 페이지로 리다이렉트
  redirect(`/profile/${userData.id}`);
}

