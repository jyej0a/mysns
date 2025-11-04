/**
 * @file app/api/posts/[postId]/route.ts
 * @description 게시물 상세 조회 API
 *
 * GET: 특정 게시물의 상세 정보 조회
 * - 게시물 정보, 사용자 정보
 * - 좋아요 수 및 현재 사용자 좋아요 상태
 * - 전체 댓글 목록 (시간 역순)
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
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;

    if (!postId) {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // 게시물 정보 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
        id,
        image_url,
        caption,
        created_at,
        user:users!posts_user_id_fkey (
          id,
          name,
          clerk_id
        )
      `
      )
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("Post fetch error:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 현재 사용자 정보 가져오기 (좋아요 상태 확인용)
    const { userId: clerkUserId } = await auth();
    let currentUserId: string | null = null;
    let isLiked = false;

    if (clerkUserId) {
      const serviceRoleSupabase = getServiceRoleClient();
      const { data: userData } = await serviceRoleSupabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (userData) {
        currentUserId = userData.id;

        // 좋아요 상태 확인
        const { count: likeCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId)
          .eq("user_id", currentUserId);

        isLiked = (likeCount || 0) > 0;
      }
    }

    // 좋아요 수 계산
    const { count: likesCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    // 댓글 수 계산
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    // 전체 댓글 목록 가져오기 (시간 역순)
    const { data: comments } = await supabase
      .from("comments")
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
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    return NextResponse.json({
      post: {
        id: post.id,
        image_url: post.image_url,
        caption: post.caption,
        created_at: post.created_at,
        user: post.user,
        likes_count: likesCount || 0,
        comments_count: commentsCount || 0,
        is_liked: isLiked,
        comments: comments || [],
      },
      currentUserId: currentUserId, // 현재 사용자 ID 반환 (댓글 삭제용)
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

