/**
 * @file app/api/posts/route.ts
 * @description 게시물 API 라우트
 *
 * GET: 게시물 목록 조회 (페이지네이션, 시간 역순 정렬)
 * POST: 게시물 생성 (이미지 업로드 + 게시물 저장)
 *
 * @dependencies
 * - lib/supabase/server: Server Component용 Supabase 클라이언트
 * - lib/supabase/service-role: 관리자 권한 Supabase 클라이언트
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: NextRequest) {
  try {
    console.group("[API] GET /api/posts 시작");
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("환경 변수 누락:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return NextResponse.json(
        { error: "서버 설정 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const userId = searchParams.get("userId"); // 특정 사용자의 게시물만 필터링

    console.log("쿼리 파라미터:", { limit, offset, userId });

    let supabase;
    let posts: any[] | null = null;

    try {
      supabase = createClerkSupabaseClient();
      console.log("Supabase 클라이언트 생성 성공");

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

      console.log("데이터베이스 쿼리 실행 중...");
      const { data: postsData, error } = await query;

      if (error) {
        console.error("Supabase 쿼리 에러:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return NextResponse.json(
          { error: "게시물을 불러오는데 실패했습니다.", details: error.message },
          { status: 500 }
        );
      }

      posts = postsData;
      console.log(`게시물 ${posts?.length || 0}개 조회 성공`);
    } catch (clientError) {
      console.error("Supabase 클라이언트 생성 또는 쿼리 실행 중 에러:", clientError);
      return NextResponse.json(
        { error: "데이터베이스 연결에 실패했습니다.", details: clientError instanceof Error ? clientError.message : String(clientError) },
        { status: 500 }
      );
    }

    // 현재 사용자 정보 가져오기 (좋아요 상태 확인용)
    const { userId: clerkUserId } = await auth();
    let currentUserId: string | null = null;

    if (clerkUserId) {
      const serviceRoleSupabase = getServiceRoleClient();
      const { data: userData } = await serviceRoleSupabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (userData) {
        currentUserId = userData.id;
      }
    }

    // 좋아요 정보와 댓글 미리보기 가져오기
    const postsWithDetails = await Promise.all(
      (posts || []).map(async (post: any) => {
        // 좋아요 수 계산
        const { count: likesCount } = await supabase!
          .from("likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        // 댓글 수 계산
        const { count: commentsCount } = await supabase!
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", post.id);

        // 최신 댓글 2개 가져오기
        const { data: comments } = await supabase!
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

        // 현재 사용자가 좋아요를 눌렀는지 확인
        let isLiked = false;
        if (currentUserId) {
          const { count: likeCount } = await supabase!
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", post.id)
            .eq("user_id", currentUserId);

          isLiked = (likeCount || 0) > 0;
        }

        return {
          id: post.id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          user: post.user,
          likes_count: likesCount || 0,
          comments_count: commentsCount || 0,
          is_liked: isLiked,
          comments: comments || [],
        };
      })
    );

    console.log(`총 ${postsWithDetails.length}개 게시물 반환 완료`);
    console.groupEnd();

    return NextResponse.json({
      posts: postsWithDetails,
      pagination: {
        limit,
        offset,
        hasMore: postsWithDetails.length === limit,
      },
      currentUserId: currentUserId, // 현재 사용자 ID 반환 (게시물 삭제 기능용)
    });
  } catch (error) {
    console.error("API error:", error);
    console.groupEnd();
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST: 게시물 생성
 * 
 * 1. 이미지 파일 업로드 (Supabase Storage)
 * 2. 게시물 데이터 저장 (posts 테이블)
 * 
 * @param request - FormData 포함 (image: File, caption: string)
 */
export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const caption = formData.get("caption") as string | null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지를 선택해주세요." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 캡션 길이 검증 (최대 2,200자)
    if (caption && caption.length > 2200) {
      return NextResponse.json(
        { error: "캡션은 최대 2,200자까지 입력할 수 있습니다." },
        { status: 400 }
      );
    }

    // Service Role 클라이언트 사용 (Storage 업로드 및 DB 저장)
    const serviceRoleSupabase = getServiceRoleClient();

    // 사용자 ID 가져오기 (clerk_id로 users 테이블에서 조회)
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

    const userId = userData.id;

    // 파일 확장자 추출
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Storage 경로: {clerk_user_id}/posts/{filename}
    const filePath = `${clerkUserId}/posts/${fileName}`;

    // Supabase Storage에 이미지 업로드
    const { data: uploadData, error: uploadError } = await serviceRoleSupabase.storage
      .from("uploads")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다." },
        { status: 500 }
      );
    }

    // 업로드된 파일의 공개 URL 가져오기
    const { data: urlData } = serviceRoleSupabase.storage
      .from("uploads")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "이미지 URL을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 게시물 데이터 저장 (posts 테이블)
    const { data: postData, error: postError } = await serviceRoleSupabase
      .from("posts")
      .insert({
        user_id: userId,
        image_url: urlData.publicUrl,
        caption: caption || null,
      })
      .select()
      .single();

    if (postError) {
      console.error("Post creation error:", postError);
      // 업로드된 파일 삭제 시도 (실패해도 무시)
      await serviceRoleSupabase.storage
        .from("uploads")
        .remove([filePath]);
      
      return NextResponse.json(
        { error: "게시물 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "게시물이 성공적으로 작성되었습니다.",
        post: postData,
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

