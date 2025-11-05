"use client";

/**
 * @file components/profile/ProfileHeader.tsx
 * @description 프로필 페이지 헤더 컴포넌트
 *
 * 사용자 프로필 정보를 표시하는 헤더입니다.
 * - 프로필 이미지: 150px (Desktop) / 90px (Mobile)
 * - 사용자명
 * - 통계: 게시물 수, 팔로워 수, 팔로잉 수
 * - 팔로우/언팔로우 버튼 (다른 사람 프로필)
 *
 * @dependencies
 * - react: useState, useEffect
 * - @clerk/nextjs: useAuth
 * - lucide-react: UserPlus, Check
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  userId: string;
}

interface UserData {
  id: string;
  name: string;
  bio: string | null;
  posts_count: number;
  followers_count: number;
  following_count: number;
  is_following: boolean;
  is_current_user: boolean;
}

export function ProfileHeader({ userId }: ProfileHeaderProps) {
  const { isSignedIn } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`);
        
        // 응답 본문을 텍스트로 먼저 읽기 (디버깅용)
        const responseText = await response.text();
        
        if (!response.ok) {
          // JSON 파싱 시도
          let errorData = {};
          let errorMessage = `Failed to fetch user data (${response.status})`;
          
          try {
            errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (parseError) {
            // JSON이 아닌 경우 텍스트를 에러 메시지로 사용
            errorMessage = responseText || errorMessage;
          }
          
          console.error("Error fetching user data:", {
            status: response.status,
            statusText: response.statusText,
            error: errorMessage,
            errorData,
            responseText,
            userId,
          });
          
          throw new Error(errorMessage);
        }
        
        // 성공 응답 파싱
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Failed to parse response JSON:", parseError, responseText);
          throw new Error("서버 응답을 파싱할 수 없습니다.");
        }
        
        if (!data.user) {
          console.error("Invalid response format:", data);
          throw new Error("사용자 데이터 형식이 올바르지 않습니다.");
        }
        
        setUserData(data.user);
        setIsFollowing(data.user.is_following);
      } catch (error) {
        console.error("Error fetching user data:", {
          error,
          message: error instanceof Error ? error.message : String(error),
          userId,
        });
        // 에러 상태를 설정하여 UI에 표시
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // 팔로우/언팔로우 토글
  const handleFollowToggle = async () => {
    if (!isSignedIn || isFollowLoading || userData?.is_current_user) return;

    setIsFollowLoading(true);
    const previousIsFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      if (isFollowing) {
        // 언팔로우
        const response = await fetch(`/api/follows?followingId=${userId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unfollow");
        }

        // 팔로워 수 감소
        if (userData) {
          setUserData({
            ...userData,
            followers_count: Math.max(0, userData.followers_count - 1),
          });
        }
      } else {
        // 팔로우
        const response = await fetch("/api/follows", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ followingId: userId }),
        });

        if (!response.ok) {
          throw new Error("Failed to follow");
        }

        // 팔로워 수 증가
        if (userData) {
          setUserData({
            ...userData,
            followers_count: userData.followers_count + 1,
          });
        }
      }
    } catch (error) {
      // 실패 시 롤백
      setIsFollowing(previousIsFollowing);
      console.error("Follow toggle error:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}천`;
    return `${(num / 1000000).toFixed(1)}만`;
  };

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* 프로필 이미지 스켈레톤 */}
          <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 animate-pulse" />
          {/* 정보 스켈레톤 */}
          <div className="flex-1 space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-[#8e8e8e]">사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 border-b border-[#dbdbdb]">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* 프로필 이미지 */}
        <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
          <span className="text-3xl md:text-5xl font-semibold text-[#262626]">
            {userData.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1 w-full">
          {/* 사용자명과 팔로우 버튼 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-light text-[#262626]">
              {userData.name}
            </h1>

            {/* 팔로우/언팔로우 버튼 */}
            {!userData.is_current_user && (
              <button
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={handleFollowToggle}
                disabled={!isSignedIn || isFollowLoading}
                className={cn(
                  "px-6 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isFollowing
                    ? hovering
                      ? "bg-white border border-red-500 text-red-500"
                      : "bg-[#efefef] text-[#262626]"
                    : "bg-[#0095f6] text-white hover:bg-[#1877f2]"
                )}
              >
                {isFollowLoading ? (
                  "처리 중..."
                ) : isFollowing ? (
                  hovering ? (
                    "언팔로우"
                  ) : (
                    <>
                      <Check className="w-4 h-4 inline-block mr-1" />
                      팔로잉
                    </>
                  )
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 inline-block mr-1" />
                    팔로우
                  </>
                )}
              </button>
            )}
          </div>

          {/* Bio 표시 */}
          {userData.bio && (
            <div className="mb-4">
              <p className="text-sm text-[#262626]">{userData.bio}</p>
            </div>
          )}

          {/* 통계 */}
          <div className="flex gap-6 mb-4">
            <div className="text-sm">
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.posts_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">게시물</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.followers_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로워</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.following_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로잉</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

