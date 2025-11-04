/**
 * @file app/api/comments/[commentId]/route.ts
 * @description 댓글 삭제 API
 *
 * DELETE: 댓글 삭제
 * - 본인만 삭제 가능
 * - Clerk 인증 확인
 *
 * @dependencies
 * - @clerk/nextjs/server: auth
 * - lib/supabase/service-role: getServiceRoleClient
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * 댓글 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { commentId } = await params;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId는 필수입니다." },
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
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // 댓글 조회 및 본인 확인
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("id, user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !commentData) {
      console.error("Comment lookup error:", commentError);
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 댓글인지 확인
    if (commentData.user_id !== userId) {
      return NextResponse.json(
        { error: "본인의 댓글만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Comment delete error:", deleteError);
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

