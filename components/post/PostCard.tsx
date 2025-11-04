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
 */

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="relative w-full aspect-square bg-gray-100">
        <Link href={`/post/${post.id}`} className="md:hidden">
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 630px"
          />
        </Link>
        <div className="hidden md:block">
          <Image
            src={post.image_url}
            alt={post.caption || "게시물 이미지"}
            fill
            className="object-cover"
            sizes="630px"
          />
        </div>
      </div>

      {/* 액션 버튼 (48px) */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-4">
          <button className="text-[#262626] hover:opacity-70 transition-opacity">
            <Heart
              className={cn(
                "w-6 h-6",
                post.is_liked ? "fill-[#ed4956] text-[#ed4956]" : ""
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
        {post.likes_count !== undefined && post.likes_count > 0 && (
          <p className="text-sm font-semibold text-[#262626]">
            좋아요 {formatNumber(post.likes_count)}개
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

