/**
 * @file app/api/comments/route.ts
 * @description 댓글 API 라우트
 *
 * POST: 댓글 작성
 * - 게시물 ID, 사용자 ID, 댓글 내용 포함
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
 * 댓글 작성
 */
export async function POST(request: NextRequest) {
  try {
    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 본문에서 데이터 가져오기
    const body = await request.json();
    const { postId, content } = body;

    // 입력 검증
    if (!postId) {
      return NextResponse.json(
        { error: "postId는 필수입니다." },
        { status: 400 }
      );
    }

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    // 댓글 내용 길이 검증 (최대 길이 제한 - 예: 1000자)
    const MAX_COMMENT_LENGTH = 1000;
    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `댓글은 최대 ${MAX_COMMENT_LENGTH}자까지 입력할 수 있습니다.` },
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

    // 게시물 존재 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("Post lookup error:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 댓글 저장
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select(
        `
        id,
        content,
        created_at,
        user:users!comments_user_id_fkey (
          id,
          name,
          clerk_id
        )
      `
      )
      .single();

    if (commentError) {
      console.error("Comment creation error:", commentError);
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "댓글이 성공적으로 작성되었습니다.",
        comment: commentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

