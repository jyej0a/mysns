/**
 * @file app/api/likes/route.ts
 * @description 좋아요 API 라우트
 *
 * POST: 좋아요 추가
 * DELETE: 좋아요 취소 (postId query parameter 사용)
 *
 * @dependencies
 * - @clerk/nextjs/server: auth, clerkClient
 * - lib/supabase/service-role: getServiceRoleClient
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 좋아요 추가
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 요청 본문에서 postId 가져오기
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
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

    const userId = userData.id;

    // 좋아요 추가 (UNIQUE 제약으로 중복 방지)
    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      // 중복 좋아요 에러 처리
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Already liked", success: false },
          { status: 409 }
        );
      }

      console.error("Like insert error:", error);
      return NextResponse.json(
        { error: "Failed to add like", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      like: data,
    });
  } catch (error) {
    console.error("Like POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 좋아요 취소
 */
export async function DELETE(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Query parameter에서 postId 가져오기
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json(
        { error: "postId query parameter is required" },
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

    const userId = userData.id;

    // 좋아요 삭제
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);

    if (error) {
      console.error("Like delete error:", error);
      return NextResponse.json(
        { error: "Failed to remove like", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Like DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

