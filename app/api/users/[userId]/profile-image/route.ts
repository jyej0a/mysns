/**
 * @file app/api/users/[userId]/profile-image/route.ts
 * @description 프로필 이미지 업로드/삭제 API
 *
 * POST: 프로필 이미지 업로드
 * - Supabase Storage에 이미지 업로드
 * - users 테이블의 profile_image_url 업데이트
 *
 * DELETE: 프로필 이미지 삭제
 * - Supabase Storage에서 이미지 삭제
 * - users 테이블의 profile_image_url을 NULL로 업데이트
 *
 * @dependencies
 * - lib/supabase/service-role: getServiceRoleClient
 * - @clerk/nextjs/server: auth
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth } from "@clerk/nextjs/server";

/**
 * POST: 프로필 이미지 업로드
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    console.group("📤 [Profile Image API] 프로필 이미지 업로드 시작");
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

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    // 이미지 파일 검증
    if (!imageFile) {
      console.error("❌ 이미지 파일이 제공되지 않음");
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지를 선택해주세요." },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (!imageFile.type.startsWith("image/")) {
      console.error("❌ 이미지 파일이 아님:", imageFile.type);
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지 파일만 업로드할 수 있습니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      console.error("❌ 파일 크기 초과:", imageFile.size);
      console.groupEnd();
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    const serviceRoleSupabase = getServiceRoleClient();

    // 사용자 ID 가져오기 및 권한 검증
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

    // 권한 검증: 본인만 업로드 가능
    if (userData.clerk_id !== clerkUserId) {
      console.error("❌ 권한 없음:", { userClerkId: userData.clerk_id, currentClerkId: clerkUserId });
      console.groupEnd();
      return NextResponse.json(
        { error: "본인의 프로필 이미지만 업로드할 수 있습니다." },
        { status: 403 }
      );
    }

    // 기존 프로필 이미지가 있으면 삭제
    if (userData.profile_image_url) {
      const oldImagePath = userData.profile_image_url.split("/").slice(-2).join("/");
      await serviceRoleSupabase.storage
        .from("uploads")
        .remove([`${clerkUserId}/profile/${oldImagePath}`]);
    }

    // 파일 확장자 추출
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    
    // Storage 경로: {clerk_user_id}/profile/{filename}
    const filePath = `${clerkUserId}/profile/${fileName}`;

    // Supabase Storage에 이미지 업로드
    console.log("📤 Storage에 이미지 업로드 중...", filePath);
    const { data: uploadData, error: uploadError } = await serviceRoleSupabase.storage
      .from("uploads")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Storage 업로드 실패:", uploadError);
      console.groupEnd();
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
      console.error("❌ 이미지 URL 가져오기 실패");
      console.groupEnd();
      return NextResponse.json(
        { error: "이미지 URL을 가져오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // users 테이블의 profile_image_url 업데이트
    console.log("💾 profile_image_url 업데이트 중...");
    const { error: updateError } = await serviceRoleSupabase
      .from("users")
      .update({ profile_image_url: urlData.publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ profile_image_url 업데이트 실패:", updateError);
      // 업로드한 파일은 삭제
      await serviceRoleSupabase.storage
        .from("uploads")
        .remove([filePath]);
      console.groupEnd();
      return NextResponse.json(
        { error: "프로필 이미지 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 프로필 이미지 업로드 성공:", urlData.publicUrl);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      profile_image_url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 프로필 이미지 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { userId: clerkUserId } = await auth();

    console.group("🗑️ [Profile Image API] 프로필 이미지 삭제 시작");
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
      .select("id, clerk_id, profile_image_url")
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

    // 권한 검증: 본인만 삭제 가능
    if (userData.clerk_id !== clerkUserId) {
      console.error("❌ 권한 없음");
      console.groupEnd();
      return NextResponse.json(
        { error: "본인의 프로필 이미지만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 프로필 이미지가 없으면 이미 삭제된 상태
    if (!userData.profile_image_url) {
      console.log("ℹ️ 프로필 이미지가 이미 없음");
      console.groupEnd();
      return NextResponse.json({
        success: true,
        message: "프로필 이미지가 이미 삭제되어 있습니다.",
      });
    }

    // Storage에서 이미지 파일 삭제
    // URL에서 파일 경로 추출 (예: https://.../{clerk_id}/profile/{filename})
    const urlParts = userData.profile_image_url.split("/");
    const profileIndex = urlParts.indexOf("profile");
    if (profileIndex > 0) {
      const filePath = urlParts.slice(profileIndex - 1).join("/");
      console.log("🗑️ Storage에서 파일 삭제 중...", filePath);
      const { error: deleteError } = await serviceRoleSupabase.storage
        .from("uploads")
        .remove([filePath]);

      if (deleteError) {
        console.warn("⚠️ Storage 파일 삭제 실패 (무시):", deleteError);
      }
    }

    // users 테이블의 profile_image_url을 NULL로 업데이트
    console.log("💾 profile_image_url을 NULL로 업데이트 중...");
    const { error: updateError } = await serviceRoleSupabase
      .from("users")
      .update({ profile_image_url: null })
      .eq("id", userId);

    if (updateError) {
      console.error("❌ profile_image_url 업데이트 실패:", updateError);
      console.groupEnd();
      return NextResponse.json(
        { error: "프로필 이미지 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("✅ 프로필 이미지 삭제 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "프로필 이미지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

