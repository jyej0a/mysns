"use client";

/**
 * @file PostCard.tsx
 * @description Instagram 스타일 게시물 카드 컴포넌트
 *
 * PRD.md 섹션 3을 기반으로 구현:
 * - 헤더: 프로필 이미지(32px), 사용자명, 시간, ⋯ 메뉴
 * - 이미지: 1:1 정사각형
 * - 액션 버튼: 좋아요, 댓글, 공유(UI만), 북마크(UI만)
 * - 컨텐츠: 좋아요 수, 캡션, 댓글 미리보기(최신 2개)
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 라우팅
 * - next/image: 이미지 최적화
 * - react: useState, useCallback, useRef
 * - @clerk/nextjs: useAuth (인증 확인용)
 */

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { usePostModal } from "@/components/providers/post-modal-provider";

interface PostCardProps {
  post: {
    id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    user: {
      id: string;
      name: string;
      clerk_id?: string;
    };
    likes_count?: number;
    comments_count?: number;
    is_liked?: boolean;
    comments?: Array<{
      id: string;
      content: string;
      created_at: string;
      user: {
        name: string;
      };
    }>;
  };
}

export function PostCard({ post }: PostCardProps) {
  const { isSignedIn } = useAuth();
  const { openModal } = usePostModal();
  
  // 좋아요 상태 관리 (optimistic update)
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 더블탭 감지를 위한 타이머
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}천`;
    return `${(num / 1000000).toFixed(1)}만`;
  };

  // 좋아요 토글 핸들러
  const handleLikeToggle = useCallback(async () => {
    if (!isSignedIn || isLoading) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;
    
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    setIsAnimating(true);
    setIsLoading(true);

    // 애니메이션 완료 대기
    setTimeout(() => setIsAnimating(false), 150);

    try {
      if (isLiked) {
        // 좋아요 취소
        const response = await fetch(`/api/likes?postId=${post.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unlike");
        }
      } else {
        // 좋아요 추가
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.id }),
        });

        if (!response.ok) {
          const error = await response.json();
          // 중복 좋아요는 이미 좋아요 상태이므로 성공으로 처리
          if (response.status === 409 && error.error === "Already liked") {
            // 이미 좋아요 상태이므로 롤백 불필요
            return;
          }
          throw new Error("Failed to like");
        }
      }
    } catch (error) {
      // 실패 시 롤백
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error("Like toggle error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLiked, likesCount, post.id, isSignedIn, isLoading]);

  // 더블탭 좋아요 핸들러 (모바일)
  const handleDoubleTap = useCallback(() => {
    if (!isSignedIn || isLoading) return;

    // 단일 탭과 더블탭 구분을 위한 지연 처리
    if (tapTimerRef.current) {
      // 더블탭 감지
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      
      // 좋아요 상태가 아니면 좋아요 추가
      if (!isLiked) {
        setShowDoubleTapHeart(true);
        handleLikeToggle();
        
        // 1초 후 큰 하트 사라짐
        setTimeout(() => {
          setShowDoubleTapHeart(false);
        }, 1000);
      }
    } else {
      // 첫 번째 탭 - 300ms 후 단일 탭으로 처리
      tapTimerRef.current = setTimeout(() => {
        tapTimerRef.current = null;
      }, 300);
    }
  }, [isLiked, isSignedIn, isLoading, handleLikeToggle]);

  return (
    <article className="bg-white border border-[#dbdbdb] rounded-lg mb-4">
      {/* 헤더 (60px) */}
      <header className="h-[60px] flex items-center justify-between px-4 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-3">
          {/* 프로필 이미지 (32px 원형) */}
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            <span className="text-xs font-semibold text-[#262626]">
              {post.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold text-sm text-[#262626] hover:opacity-70"
            >
              {post.user.name}
            </Link>
            <span className="text-xs text-[#8e8e8e]">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>
        <button className="text-[#262626] hover:opacity-70">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </header>

      {/* 이미지 영역 (1:1 정사각형) */}
      <div 
        className="relative w-full aspect-square bg-gray-100"
        onDoubleClick={handleDoubleTap}
      >
        {/* 더블탭 큰 하트 애니메이션 (모바일) */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <Heart
              className={cn(
                "w-24 h-24 text-[#ed4956] fill-[#ed4956]",
                "animate-[heartPulse_1s_ease-out]"
              )}
            />
          </div>
        )}
        
        {/* 모바일: 더블탭을 위해 Link를 제거하고 클릭 핸들러 추가 */}
        <div
          className="md:hidden relative w-full h-full cursor-pointer"
          onClick={() => {
            // 더블탭이 아닌 경우에만 페이지 이동
            if (!showDoubleTapHeart) {
              window.location.href = `/post/${post.id}`;
            }
          }}
        >
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 630px"
          />
        </div>
        {/* Desktop: 모달 열기 */}
        <button
          onClick={() => openModal(post.id)}
          className="hidden md:block relative w-full h-full cursor-pointer"
        >
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            sizes="630px"
          />
        </button>
      </div>

      {/* 액션 버튼 (48px) */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeToggle}
            disabled={!isSignedIn || isLoading}
            className={cn(
              "transition-opacity",
              !isSignedIn && "cursor-not-allowed opacity-50",
              isLoading && "cursor-wait",
              isSignedIn && !isLoading && "hover:opacity-70"
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-transform duration-150",
                isLiked ? "fill-[#ed4956] text-[#ed4956]" : "text-[#262626]",
                isAnimating && "scale-[1.3]"
              )}
            />
          </button>
          <Link
            href={`/post/${post.id}`}
            className="text-[#262626] hover:opacity-70 transition-opacity"
          >
            <MessageCircle className="w-6 h-6" />
          </Link>
          <button className="text-[#262626] hover:opacity-70 transition-opacity">
            <Send className="w-6 h-6" />
          </button>
        </div>
        <button className="text-[#262626] hover:opacity-70 transition-opacity">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 py-2 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <p className="text-sm font-semibold text-[#262626]">
            좋아요 {formatNumber(likesCount)}개
          </p>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-sm text-[#262626]">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-semibold hover:opacity-70"
            >
              {post.user.name}
            </Link>
            <span className="ml-2">
              {post.caption.length > 100 ? (
                <>
                  {post.caption.substring(0, 100)}
                  <button className="text-[#8e8e8e] ml-1">... 더 보기</button>
                </>
              ) : (
                post.caption
              )}
            </span>
          </div>
        )}

        {/* 댓글 미리보기 (최신 2개) */}
        {post.comments && post.comments.length > 0 && (
          <div className="space-y-1">
            {post.comments_count !== undefined && post.comments_count > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-sm text-[#8e8e8e] hover:opacity-70"
              >
                댓글 {post.comments_count}개 모두 보기
              </Link>
            )}
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="text-sm text-[#262626]">
                <Link
                  href={`/profile/${comment.user.name}`}
                  className="font-semibold hover:opacity-70"
                >
                  {comment.user.name}
                </Link>
                <span className="ml-2">{comment.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

