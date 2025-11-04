/**
 * @file app/api/posts/route.ts
 * @description 게시물 API 라우트
 *
 * GET: 게시물 목록 조회 (페이지네이션, 시간 역순 정렬)
 * POST: 게시물 생성 (추후 구현)
 *
 * @dependencies
 * - lib/supabase/server: Server Component용 Supabase 클라이언트
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId"); // 특정 사용자의 게시물만 필터링

    const supabase = createClerkSupabaseClient();

    // 기본 쿼리 구성
    let query = supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 특정 사용자의 게시물만 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "게시물을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 좋아요 정보와 댓글 미리보기 가져오기
    const postsWithDetails = await Promise.all(
      (posts || []).map(async (post: any) => {
        // 좋아요 수 계산
        const { count: likesCount } = await supabase
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        // 댓글 수 계산
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        // 최신 댓글 2개 가져오기
        const { data: comments } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            user:users!comments_user_id_fkey (
              name
            )
          `
          )
          .eq("post_id", post.id)
          .order("created_at", { ascending: false })
          .limit(2);

        // 현재 사용자가 좋아요를 눌렀는지 확인 (추후 구현)
        // const { data: auth } = await auth();
        // const isLiked = false; // TODO: 좋아요 확인 로직

        return {
          id: post.id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          user: post.user,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: false, // TODO: 현재 사용자 좋아요 상태 확인
          comments: comments || [],
        };
      })
    );

    return NextResponse.json({
      posts: postsWithDetails,
      pagination: {
        limit,
        offset,
        hasMore: postsWithDetails.length === limit,
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

