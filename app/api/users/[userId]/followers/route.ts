/**
 * @file app/api/users/[userId]/followers/route.ts
 * @description 팔로워 목록 조회 API
 *
 * GET: 특정 사용자를 팔로우하는 사용자 목록 조회
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

    // 팔로워 목록 조회 (나를 팔로우하는 사람들)
    const { data: follows, error: followsError } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (followsError) {
      console.error("Error fetching follows:", followsError);
      return NextResponse.json(
        { error: "팔로워 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    if (!follows || follows.length === 0) {
      return NextResponse.json({
        followers: [],
        count: 0,
      });
    }

    // 팔로워 ID 목록 추출
    const followerIds = follows.map((f) => f.follower_id);

    // 사용자 정보 조회
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, profile_image_url")
      .in("id", followerIds);

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { error: "사용자 정보를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    // 데이터 변환
    const followersList = (users || []).map((user: any) => ({
      id: user.id,
      name: user.name,
      profile_image_url: user.profile_image_url || null,
    }));

    return NextResponse.json({
      followers: followersList,
      count: followersList.length,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

