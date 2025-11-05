/**
 * @file app/api/users/[userId]/following/route.ts
 * @description 팔로잉 목록 조회 API
 *
 * GET: 특정 사용자가 팔로우하는 사용자 목록 조회
 *
 * @dependencies
 * - lib/supabase/server: createClerkSupabaseClient
 */

import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // 팔로잉 목록 조회 (내가 팔로우하는 사람들)
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (followsError) {
      console.error("Error fetching follows:", followsError);
      return NextResponse.json(
        { error: "팔로잉 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    if (!follows || follows.length === 0) {
      return NextResponse.json({
        following: [],
        count: 0,
      });
    }

    // 팔로잉 ID 목록 추출
    const followingIds = follows.map((f) => f.following_id);

    // 사용자 정보 조회
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, profile_image_url")
      .in("id", followingIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "사용자 정보를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    // 데이터 변환
    const followingList = (users || []).map((user: any) => ({
      id: user.id,
      name: user.name,
      profile_image_url: user.profile_image_url || null,
    }));

    return NextResponse.json({
      following: followingList,
      count: followingList.length,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

