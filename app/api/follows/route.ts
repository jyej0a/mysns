/**
 * @file app/api/follows/route.ts
 * @description 팔로우 API 라우트
 *
 * POST: 팔로우 추가
 * DELETE: 언팔로우 (followingId query parameter 사용)
 *
 * @dependencies
 * - @clerk/nextjs/server: auth
 * - lib/supabase/service-role: getServiceRoleClient
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 팔로우 추가
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 요청 본문에서 followingId 가져오기
    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId is required" },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // Clerk user ID를 Supabase user_id로 변환
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const followerId = userData.id;

    // 자기 자신 팔로우 방지 (CHECK 제약으로도 방지되지만 명시적으로 처리)
    if (followerId === followingId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // 팔로우 추가 (UNIQUE 제약으로 중복 방지)
    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();

    if (error) {
      // 중복 팔로우 에러 처리
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Already following", success: false },
          { status: 409 }
        );
      }

      // 자기 자신 팔로우 시도 (CHECK 제약)
      if (error.code === "23514") {
        return NextResponse.json(
          { error: "Cannot follow yourself" },
          { status: 400 }
        );
      }

      console.error("Follow insert error:", error);
      return NextResponse.json(
        { error: "Failed to follow user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      follow: data,
    });
  } catch (error) {
    console.error("Follow POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 언팔로우
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query parameter에서 followingId 가져오기
    const searchParams = request.nextUrl.searchParams;
    const followingId = searchParams.get("followingId");

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId query parameter is required" },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = getServiceRoleClient();

    // Clerk user ID를 Supabase user_id로 변환
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const followerId = userData.id;

    // 팔로우 삭제
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) {
      console.error("Follow delete error:", error);
      return NextResponse.json(
        { error: "Failed to unfollow user", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Follow DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

