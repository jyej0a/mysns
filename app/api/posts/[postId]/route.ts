/**
 * @file app/api/posts/[postId]/route.ts
 * @description 게시물 상세 조회 및 삭제 API
 *
 * GET: 특정 게시물의 상세 정보 조회
 * - 게시물 정보, 사용자 정보
 * - 좋아요 수 및 현재 사용자 좋아요 상태
 * - 전체 댓글 목록 (시간 역순)
 *
 * DELETE: 게시물 삭제
 * - 본인 게시물만 삭제 가능
 * - Supabase Storage에서 이미지 파일 삭제
 * - DB에서 게시물 삭제 (CASCADE로 likes, comments 자동 삭제)
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

/**
 * DELETE: 게시물 삭제
 * 
 * 1. Clerk 인증 확인
 * 2. 본인 게시물인지 권한 검증
 * 3. Supabase Storage에서 이미지 파일 삭제
 * 4. 게시물 삭제 (DB - CASCADE로 likes, comments 자동 삭제)
 */
export async function DELETE(
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

    // Clerk 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceRoleSupabase = getServiceRoleClient();

    // 현재 사용자 ID 가져오기
    const { data: userData, error: userError } = await serviceRoleSupabase
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

    const currentUserId = userData.id;

    // 게시물 정보 조회 및 권한 확인
    const { data: postData, error: postFetchError } = await serviceRoleSupabase
      .from("posts")
      .select("id, image_url, user_id")
      .eq("id", postId)
      .single();

    if (postFetchError || !postData) {
      console.error("Post fetch error:", postFetchError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인 게시물인지 권한 검증
    if (postData.user_id !== currentUserId) {
      return NextResponse.json(
        { error: "본인 게시물만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // image_url에서 Storage 경로 추출
    // publicUrl 형식: https://{project}.supabase.co/storage/v1/object/public/uploads/{clerk_id}/posts/{filename}
    let filePath: string | null = null;
    try {
      const url = new URL(postData.image_url);
      // /storage/v1/object/public/uploads/ 이후의 경로 추출
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/uploads\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        filePath = pathMatch[1];
      }
    } catch (urlError) {
      console.error("Failed to parse image URL:", urlError);
      // URL 파싱 실패해도 게시물 삭제는 진행 (Storage 파일은 남을 수 있음)
    }

    // Supabase Storage에서 이미지 파일 삭제
    if (filePath) {
      const { error: storageError } = await serviceRoleSupabase.storage
        .from("uploads")
        .remove([filePath]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
        // Storage 삭제 실패해도 게시물 삭제는 진행
        // (이미지 파일이 남을 수 있지만, 게시물은 삭제됨)
      }
    }

    // 게시물 삭제 (CASCADE로 likes, comments 자동 삭제)
    const { error: deleteError } = await serviceRoleSupabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("Post delete error:", deleteError);
      return NextResponse.json(
        { error: "게시물 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "게시물이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

