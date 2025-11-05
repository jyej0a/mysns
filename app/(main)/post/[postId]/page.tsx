/**
 * @file app/(main)/post/[postId]/page.tsx
 * @description 게시물 상세 페이지
 *
 * Mobile: 전체 페이지로 표시
 * Desktop: PostModal 컴포넌트 사용 (클릭 시 모달 열기)
 *
 * @dependencies
 * - components/post/PostCard (재사용 또는 별도 컴포넌트)
 * - components/comment/CommentList
 * - components/comment/CommentForm
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ArrowLeft } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

export default function PostDetailPage() {
  const params = useParams();
  const postId = params.postId as string;
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 게시물 데이터 로딩
  const loadPost = useCallback(async () => {
    if (!postId) return;

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
      setCurrentUserId(data.currentUserId || null);
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  // 좋아요 토글 핸들러
  const handleLikeToggle = useCallback(async () => {
    if (!isSignedIn || isLikeLoading || !post) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? Math.max(0, prev - 1) : prev + 1));
    setIsAnimating(true);
    setIsLikeLoading(true);

    setTimeout(() => setIsAnimating(false), 150);

    try {
      if (isLiked) {
        const response = await fetch(`/api/likes?postId=${post.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unlike");
        }
      } else {
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.id }),
        });

        if (!response.ok) {
          const error = await response.json();
          if (response.status === 409 && error.error === "Already liked") {
            return;
          }
          throw new Error("Failed to like");
        }
      }
    } catch (error) {
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

      await loadPost();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      throw error;
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

      await loadPost();
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  }, [isSignedIn, loadPost]);

  // 게시물 삭제 핸들러
  const handlePostDelete = useCallback(async () => {
    if (!isSignedIn || !postId || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "게시물 삭제에 실패했습니다.");
      }

      // 삭제 성공 시 홈으로 리다이렉트
      setDeleteDialogOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(error instanceof Error ? error.message : "게시물 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  }, [isSignedIn, postId, isDeleting, router]);

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
      <div className="w-full min-h-screen bg-[#fafafa] p-4">
        <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 text-center">
          <p className="text-[#8e8e8e]">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-[#fafafa] p-4">
        <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 text-center">
          <p className="text-[#8e8e8e]">게시물을 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fafafa]">
      {/* Mobile Header */}
      <header className="md:hidden h-[60px] bg-white border-b border-[#dbdbdb] flex items-center px-4 sticky top-0 z-10">
        <Link href="/" className="mr-4">
          <ArrowLeft className="w-6 h-6 text-[#262626]" />
        </Link>
        <h1 className="text-base font-semibold text-[#262626]">게시물</h1>
      </header>

      <article className="bg-white border border-[#dbdbdb] rounded-lg mb-4 md:mb-0">
        {/* 헤더 (60px) */}
        <header className="h-[60px] flex items-center justify-between px-4 border-b border-[#dbdbdb]">
          <div className="flex items-center gap-3">
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
          {/* 본인 게시물일 때만 삭제 메뉴 표시 */}
          {currentUserId && post.user.id === currentUserId ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[#262626] hover:opacity-70">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  삭제
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button className="text-[#262626] hover:opacity-70">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </header>

        {/* 이미지 영역 (1:1 정사각형) */}
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 630px"
          />
        </div>

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
              <span className="ml-2">{post.caption}</span>
            </div>
          )}

          {/* 댓글 수 */}
          {post.comments_count > 0 && (
            <Link
              href={`#comments`}
              className="text-sm text-[#8e8e8e] hover:opacity-70"
            >
              댓글 {post.comments_count}개 모두 보기
            </Link>
          )}
        </div>

        {/* 댓글 목록 */}
        <div id="comments" className="border-t border-[#dbdbdb]">
          <CommentList
            comments={post.comments || []}
            currentUserId={currentUserId}
            onDelete={handleCommentDelete}
          />
        </div>

        {/* 시간 표시 */}
        <div className="px-4 py-2 border-t border-[#dbdbdb]">
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
      </article>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>게시물 삭제</DialogTitle>
            <DialogDescription>
              정말 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handlePostDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
