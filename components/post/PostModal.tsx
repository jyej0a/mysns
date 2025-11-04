"use client";

/**
 * @file components/post/PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트 (Desktop용)
 *
 * Instagram 스타일의 게시물 상세 모달입니다.
 * - Dialog 기반 (shadcn/ui)
 * - 레이아웃: 이미지(50%) + 댓글 영역(50%) 나란히 배치
 * - 이미지 영역: 1:1 정사각형 이미지 표시
 * - 댓글 영역: 헤더(사용자 정보) + 댓글 목록(스크롤) + 액션 버튼 + 댓글 입력창
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - lucide-react: 아이콘
 * - next/image: 이미지 최적화
 * - react: useState, useEffect, useCallback
 * - @clerk/nextjs: useAuth
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

interface Post {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    clerk_id?: string;
  };
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string;
      clerk_id?: string;
    };
  }>;
}

export function PostModal({ open, onOpenChange, postId }: PostModalProps) {
  const { isSignedIn } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // 게시물 데이터 로딩
  const loadPost = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Failed to load post");
      }
      const data = await response.json();
      setPost(data.post);
      setIsLiked(data.post.is_liked || false);
      setLikesCount(data.post.likes_count || 0);
      
      // API에서 현재 사용자 ID 받아오기 (댓글 삭제 기능용)
      setCurrentUserId(data.currentUserId || null);
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (open && postId) {
      loadPost();
    }
  }, [open, postId, loadPost]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = useCallback(async () => {
    if (!isSignedIn || isLikeLoading || !post) return;

    // Optimistic update
    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    setIsAnimating(true);
    setIsLikeLoading(true);

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
      setIsLikeLoading(false);
    }
  }, [isLiked, likesCount, post, isSignedIn, isLikeLoading]);

  // 댓글 작성 핸들러
  const handleCommentSubmit = useCallback(async (content: string) => {
    if (!isSignedIn || !postId || isCommentLoading) {
      return;
    }

    setIsCommentLoading(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "댓글 작성에 실패했습니다.");
      }

      // 댓글 작성 성공 후 게시물 데이터 새로고침하여 댓글 목록 업데이트
      await loadPost();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      throw error; // 상위 컴포넌트에서 처리
    } finally {
      setIsCommentLoading(false);
    }
  }, [isSignedIn, postId, isCommentLoading, loadPost]);

  // 댓글 삭제 핸들러
  const handleCommentDelete = useCallback(async (commentId: string) => {
    if (!isSignedIn || !commentId) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "댓글 삭제에 실패했습니다.");
      }

      // 댓글 삭제 성공 후 게시물 데이터 새로고침
      await loadPost();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error; // 상위 컴포넌트에서 처리
    }
  }, [isSignedIn, loadPost]);

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

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}천`;
    return `${(num / 1000000).toFixed(1)}만`;
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 gap-0 flex flex-row overflow-hidden bg-white border-none rounded-none">
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-[#8e8e8e]">로딩 중...</div>
          </div>
          <div className="flex-1 bg-white flex items-center justify-center">
            <div className="text-[#8e8e8e]">로딩 중...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!post) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 gap-0 flex flex-row overflow-hidden bg-white border-none rounded-none">
          <div className="flex-1 bg-gray-100 flex items-center justify-center">
            <div className="text-[#8e8e8e]">게시물을 불러올 수 없습니다.</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] h-[90vh] p-0 gap-0 flex flex-row overflow-hidden bg-white border-none rounded-none [&>button]:hidden">
        {/* 닫기 버튼 (커스텀) */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        
        {/* 이미지 영역 (50%) */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <div className="relative w-full h-full">
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-contain"
              sizes="50vw"
            />
          </div>
        </div>

        {/* 댓글 영역 (50%) */}
        <div className="flex-1 bg-white flex flex-col h-full">
          {/* 헤더 (60px) */}
          <header className="h-[60px] flex items-center justify-between px-4 border-b border-[#dbdbdb]">
            <div className="flex items-center gap-3">
              {/* 프로필 이미지 (32px 원형) */}
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                <span className="text-xs font-semibold text-[#262626]">
                  {post.user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <Link
                href={`/profile/${post.user.id}`}
                className="font-semibold text-sm text-[#262626] hover:opacity-70"
              >
                {post.user.name}
              </Link>
            </div>
            <button className="text-[#262626] hover:opacity-70">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </header>

          {/* 댓글 목록 (스크롤 가능) */}
          <div className="flex-1 overflow-y-auto">
            {/* 캡션 */}
            {post.caption && (
              <div className="px-4 py-3 border-b border-[#dbdbdb]">
                <div className="text-sm text-[#262626]">
                  <Link
                    href={`/profile/${post.user.id}`}
                    className="font-semibold hover:opacity-70"
                  >
                    {post.user.name}
                  </Link>
                  <span className="ml-2">{post.caption}</span>
                </div>
              </div>
            )}

            {/* 댓글 목록 */}
            <CommentList
              comments={post.comments || []}
              currentUserId={currentUserId}
              onDelete={handleCommentDelete}
            />
          </div>

          {/* 액션 버튼 및 좋아요 수 */}
          <div className="border-t border-[#dbdbdb]">
            {/* 액션 버튼 (48px) */}
            <div className="h-12 flex items-center justify-between px-4 border-b border-[#dbdbdb]">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLikeToggle}
                  disabled={!isSignedIn || isLikeLoading}
                  className={cn(
                    "transition-opacity",
                    !isSignedIn && "cursor-not-allowed opacity-50",
                    isLikeLoading && "cursor-wait",
                    isSignedIn && !isLikeLoading && "hover:opacity-70"
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
                <button className="text-[#262626] hover:opacity-70 transition-opacity">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="text-[#262626] hover:opacity-70 transition-opacity">
                  <Send className="w-6 h-6" />
                </button>
              </div>
              <button className="text-[#262626] hover:opacity-70 transition-opacity">
                <Bookmark className="w-6 h-6" />
              </button>
            </div>

            {/* 좋아요 수 */}
            {likesCount > 0 && (
              <div className="px-4 py-2">
                <p className="text-sm font-semibold text-[#262626]">
                  좋아요 {formatNumber(likesCount)}개
                </p>
              </div>
            )}

            {/* 시간 표시 */}
            <div className="px-4 py-2">
              <span className="text-xs text-[#8e8e8e] uppercase">
                {formatTimeAgo(post.created_at)}
              </span>
            </div>

            {/* 댓글 입력창 */}
            <CommentForm
              postId={postId}
              onSubmit={handleCommentSubmit}
              isLoading={isCommentLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

