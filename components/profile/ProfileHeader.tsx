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
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { extractApiError, getErrorMessage } from "@/lib/error-handler";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { FollowListModal } from "@/components/profile/FollowListModal";

interface ProfileHeaderProps {
  userId: string;
}

interface UserData {
  id: string;
  name: string;
  bio: string | null;
  profile_image_url: string | null;
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      console.group("🔍 [ProfileHeader] 사용자 정보 가져오기");
      console.log("userId:", userId);
      
      try {
        console.log("📡 API 요청 시작:", `/api/users/${userId}`);
        const response = await fetch(`/api/users/${userId}`);
        
        console.log("📥 API 응답 상태:", response.status, response.statusText);
        console.log("📥 API 응답 헤더:", {
          contentType: response.headers.get("content-type"),
          contentTypeAll: Array.from(response.headers.entries()),
        });
        
        if (!response.ok) {
          // 응답 본문을 클론하여 읽기 (한 번만 읽을 수 있으므로)
          const clonedResponse = response.clone();
          const error = await extractApiError(clonedResponse);
          
          // 에러 정보를 명확하게 로그에 출력
          const errorDetails = error.details 
            ? (typeof error.details === 'string' 
                ? error.details 
                : JSON.stringify(error.details, null, 2))
            : "없음";
          
          console.error("❌ API 에러:", {
            status: error.status,
            message: error.message,
            details: errorDetails,
            statusText: response.statusText,
            url: response.url,
            userId: userId,
          });
          
          // 404 에러인 경우 더 명확한 메시지
          if (error.status === 404) {
            throw new Error("사용자를 찾을 수 없습니다.");
          }
          
          throw new Error(error.message || "사용자 정보를 불러올 수 없습니다.");
        }
        
        const data = await response.json();
        console.log("✅ API 응답 데이터:", data);
        
        if (!data.user) {
          console.error("❌ 사용자 데이터 형식 오류:", data);
          throw new Error("사용자 데이터 형식이 올바르지 않습니다.");
        }
        
        console.log("✅ 사용자 데이터 설정:", {
          id: data.user.id,
          name: data.user.name,
          is_current_user: data.user.is_current_user,
        });
        
        setUserData({
          ...data.user,
          profile_image_url: data.user.profile_image_url || null,
        });
        setIsFollowing(data.user.is_following);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        
        // 에러 정보를 안전하게 직렬화
        let errorInfo: Record<string, unknown> = {
          errorMessage,
          userId,
        };
        
        if (err instanceof Error) {
          errorInfo = {
            ...errorInfo,
            name: err.name,
            message: err.message,
            // stack은 너무 길 수 있으므로 제외하거나 제한
            hasStack: !!err.stack,
          };
        } else {
          errorInfo.error = String(err);
        }
        
        console.error("❌ Error fetching user data:", errorInfo);
        
        // 에러 상태를 설정하여 UI에 표시
        setUserData(null);
      } finally {
        setIsLoading(false);
        console.groupEnd();
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
      <div className="w-full py-8 text-center space-y-4">
        <p className="text-[#262626] font-semibold text-lg">사용자를 찾을 수 없습니다</p>
        <p className="text-sm text-[#8e8e8e]">
          요청하신 사용자 프로필이 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:bg-[#0085e5] transition-colors font-semibold text-sm"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-8 border-b border-[#dbdbdb]">
      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* 프로필 이미지 */}
        <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
          {userData.profile_image_url ? (
            <Image
              src={userData.profile_image_url}
              alt={`${userData.name}의 프로필 이미지`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 90px, 150px"
            />
          ) : (
            <span className="text-3xl md:text-5xl font-semibold text-[#262626]">
              {userData.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1 w-full">
          {/* 사용자명과 팔로우 버튼 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <h1 className="text-xl md:text-2xl font-light text-[#262626]">
              {userData.name}
            </h1>

            {/* 프로필 편집 버튼 (본인 프로필) */}
            {userData.is_current_user && (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-6 py-1.5 rounded-lg text-sm font-semibold bg-white border border-[#dbdbdb] text-[#262626] hover:bg-[#fafafa] transition-colors focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2"
                aria-label="프로필 편집"
              >
                프로필 편집
              </button>
            )}

            {/* 팔로우/언팔로우 버튼 */}
            {!userData.is_current_user && (
              <button
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={handleFollowToggle}
                disabled={!isSignedIn || isFollowLoading}
                aria-label={isFollowing ? (hovering ? "언팔로우" : "팔로잉 중") : "팔로우"}
                aria-pressed={isFollowing}
                className={cn(
                  "px-6 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  "focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2",
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
            <button
              onClick={() => {
                // 게시물 수 클릭 시 게시물 그리드로 스크롤
                const postGrid = document.querySelector('[data-post-grid]');
                if (postGrid) {
                  postGrid.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.posts_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">게시물</span>
            </button>
            <button
              onClick={() => setFollowersModalOpen(true)}
              className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.followers_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로워</span>
            </button>
            <button
              onClick={() => setFollowingModalOpen(true)}
              className="text-sm hover:opacity-70 transition-opacity cursor-pointer"
            >
              <span className="font-semibold text-[#262626]">
                {formatNumber(userData.following_count)}
              </span>
              <span className="text-[#8e8e8e] ml-1">팔로잉</span>
            </button>
          </div>
        </div>
      </div>

      {/* 프로필 편집 모달 */}
      {userData.is_current_user && (
        <EditProfileModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          userId={userId}
          currentBio={userData.bio}
          currentProfileImageUrl={userData.profile_image_url}
          onUpdate={() => {
            // 프로필 업데이트 후 데이터 새로고침
            const fetchUserData = async () => {
              try {
                const response = await fetch(`/api/users/${userId}`);
                if (!response.ok) {
                  const error = await extractApiError(response);
                  throw new Error(error.message);
                }
                const data = await response.json();
                setUserData({
                  ...data.user,
                  profile_image_url: data.user.profile_image_url || null,
                });
              } catch (err) {
                console.error("Failed to refresh user data:", err);
              }
            };
            fetchUserData();
          }}
        />
      )}

      {/* 팔로워 목록 모달 */}
      <FollowListModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        userId={userId}
        type="followers"
        title="팔로워"
      />

      {/* 팔로잉 목록 모달 */}
      <FollowListModal
        open={followingModalOpen}
        onOpenChange={setFollowingModalOpen}
        userId={userId}
        type="following"
        title="팔로잉"
      />
    </div>
  );
}

