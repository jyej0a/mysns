/**
 * @file app/api/users/[userId]/route.ts
 * @description 사용자 정보 조회 API
 *
 * GET: 특정 사용자의 정보와 통계 조회
 * - user_stats 뷰를 활용하여 게시물 수, 팔로워 수, 팔로잉 수 포함
 *
 * @dependencies
 * - lib/supabase/server: createClerkSupabaseClient
 * - lib/supabase/service-role: getServiceRoleClient
 * - @clerk/nextjs/server: auth
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // user_stats 뷰에서 사용자 정보와 통계 가져오기
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (statsError || !userStats) {
      console.error("User stats error:", statsError);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // users 테이블에서 추가 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("User data error:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    // 현재 로그인한 사용자 정보 가져오기 (팔로우 상태 확인용)
    const { userId: clerkUserId } = await auth();
    let isFollowing = false;
    let currentUserId: string | null = null;

    if (clerkUserId) {
      const serviceRoleSupabase = getServiceRoleClient();
      const { data: currentUserData } = await serviceRoleSupabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (currentUserData) {
        currentUserId = currentUserData.id;

        // 팔로우 상태 확인
        if (currentUserId !== userId) {
          const { count } = await supabase
            .from("follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", currentUserId)
            .eq("following_id", userId);

          isFollowing = (count || 0) > 0;
        }
      }
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        clerk_id: userData.clerk_id,
        name: userData.name,
        created_at: userData.created_at,
        posts_count: userStats.posts_count || 0,
        followers_count: userStats.followers_count || 0,
        following_count: userStats.following_count || 0,
        is_following: isFollowing,
        is_current_user: currentUserId === userId,
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

