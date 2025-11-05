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
    
    console.group("🔍 [Profile API] 사용자 조회 시작");
    console.log("userId:", userId);
    console.log("userId 타입:", typeof userId);
    console.log("userId 길이:", userId?.length);
    
    if (!userId) {
      console.error("❌ userId가 제공되지 않음");
      console.groupEnd();
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // UUID 형식 검증 (선택적)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn("⚠️ userId가 UUID 형식이 아님:", userId);
      console.warn("⚠️ userId 값:", JSON.stringify(userId));
    }

    const supabase = createClerkSupabaseClient();

    // 먼저 users 테이블에서 사용자 존재 여부 확인
    // bio와 profile_image_url 컬럼이 없을 수 있으므로 기본 컬럼만 먼저 조회
    console.log("📋 users 테이블에서 사용자 조회 중...");
    console.log("📋 쿼리 조건: id =", userId);
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", userId)
      .single();
    
    console.log("📋 쿼리 결과:", {
      hasData: !!userData,
      hasError: !!userError,
      errorCode: userError?.code,
      errorMessage: userError?.message,
    });

    if (userError) {
      console.error("❌ User data error:", {
        error: userError,
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
        userId,
      });
      console.groupEnd();
      
      // PGRST116: no rows returned (사용자를 찾을 수 없음)
      if (userError.code === 'PGRST116' || userError.message?.includes('No rows')) {
        return NextResponse.json(
          { error: "사용자를 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      
      // 컬럼이 없는 경우 (마이그레이션 미실행)
      if (userError.message?.includes('does not exist')) {
        console.error("❌ 데이터베이스 컬럼 누락:", userError.message);
        console.error("💡 마이그레이션 실행 필요: supabase/migrations/20251105160000_add_missing_user_columns.sql");
        return NextResponse.json(
          { 
            error: "데이터베이스 스키마가 업데이트되지 않았습니다. 마이그레이션을 실행해주세요.",
            details: userError.message,
            migrationFile: "supabase/migrations/20251105160000_add_missing_user_columns.sql"
          },
          { status: 500 }
        );
      }
      
      // 기타 에러는 500으로 처리
      return NextResponse.json(
        { error: "사용자 정보를 불러올 수 없습니다.", details: userError.message },
        { status: 500 }
      );
    }

    if (!userData) {
      console.error("❌ User data not found:", userId);
      console.groupEnd();
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("✅ 사용자 정보 조회 성공:", userData.name);

    // bio와 profile_image_url을 별도로 조회 (컬럼이 있을 수 있으므로)
    let bio: string | null = null;
    let profile_image_url: string | null = null;
    
    try {
      const { data: extendedData } = await supabase
        .from("users")
        .select("bio, profile_image_url")
        .eq("id", userId)
        .single();
      
      if (extendedData) {
        bio = extendedData.bio || null;
        profile_image_url = extendedData.profile_image_url || null;
      }
    } catch (extendedError: any) {
      // 컬럼이 없으면 null로 처리 (에러 무시)
      console.warn("⚠️ bio/profile_image_url 컬럼 조회 실패 (마이그레이션 미실행 가능):", extendedError?.message);
    }

    // user_stats 뷰에서 사용자 통계 가져오기
    console.log("📊 user_stats 뷰에서 통계 조회 중...");
    const { data: userStats, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (statsError) {
      console.error("❌ User stats error:", {
        error: statsError,
        code: statsError.code,
        message: statsError.message,
        details: statsError.details,
        hint: statsError.hint,
        userId,
      });
      console.groupEnd();
      // 통계 조회 실패해도 사용자 정보는 반환 (통계는 0으로 처리)
      console.warn("⚠️ 통계 조회 실패, 기본값(0) 사용");
    }

    // user_stats가 없으면 기본값 사용
    const stats = userStats || {
      posts_count: 0,
      followers_count: 0,
      following_count: 0,
    };

    console.log("✅ 통계 조회 성공:", stats);
    console.groupEnd();

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

    const responseData = {
      user: {
        id: userData.id,
        clerk_id: userData.clerk_id,
        name: userData.name,
        bio: bio,
        profile_image_url: profile_image_url,
        created_at: userData.created_at,
        posts_count: stats.posts_count || 0,
        followers_count: stats.followers_count || 0,
        following_count: stats.following_count || 0,
        is_following: isFollowing,
        is_current_user: currentUserId === userId,
      },
    };

    console.log("✅ API 응답 성공:", {
      userId: responseData.user.id,
      name: responseData.user.name,
      is_current_user: responseData.user.is_current_user,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 사용자 정보 업데이트 (Bio)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    console.group("✏️ [Profile API] 사용자 정보 업데이트 시작");
    console.log("userId:", userId);
    console.log("clerkUserId:", clerkUserId);

    // 인증 확인
    if (!clerkUserId) {
      console.error("❌ 인증되지 않은 사용자");
      console.groupEnd();
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const serviceRoleSupabase = getServiceRoleClient();

    // 사용자 정보 가져오기 및 권한 검증
    const { data: userData, error: userError } = await serviceRoleSupabase
      .from("users")
      .select("id, clerk_id")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      console.error("❌ 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 검증: 본인만 수정 가능
    if (userData.clerk_id !== clerkUserId) {
      console.error("❌ 권한 없음");
      console.groupEnd();
      return NextResponse.json(
        { error: "본인의 프로필만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { bio } = body;

    // Bio 검증 (최대 150자)
    if (bio !== null && bio !== undefined && bio.length > 150) {
      console.error("❌ Bio 길이 초과:", bio.length);
      console.groupEnd();
      return NextResponse.json(
        { error: "소개는 최대 150자까지 입력할 수 있습니다." },
        { status: 400 }
      );
    }

    // users 테이블 업데이트
    console.log("💾 Bio 업데이트 중...");
    const { data: updatedUser, error: updateError } = await serviceRoleSupabase
      .from("users")
      .update({ bio: bio || null })
      .eq("id", userId)
      .select("id, name, bio, profile_image_url")
      .single();

    if (updateError) {
      console.error("❌ Bio 업데이트 실패:", updateError);
      console.groupEnd();
      return NextResponse.json(
        { error: "프로필 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ Bio 업데이트 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

