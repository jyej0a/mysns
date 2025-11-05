"use client";

/**
 * @file components/profile/PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * 사용자의 게시물을 3열 그리드로 표시합니다.
 * - 3열 그리드 레이아웃 (반응형)
 * - 1:1 정사각형 썸네일
 * - Hover 시 좋아요/댓글 수 표시
 * - 클릭 시 게시물 상세 페이지 이동
 * - 게시물/릴스/태그된 게시물 탭 메뉴
 *
 * @dependencies
 * - react: useState, useEffect
 * - next/link: Link
 * - next/image: Image
 * - lucide-react: Heart, MessageCircle
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Grid3x3, Film, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractApiError, getErrorMessage } from "@/lib/error-handler";
import { usePostModal } from "@/components/providers/post-modal-provider";

interface PostGridProps {
  userId: string;
}

interface Post {
  id: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
}

type TabType = "posts" | "reels" | "tagged";

export function PostGrid({ userId }: PostGridProps) {
  const { openModal } = usePostModal();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/posts?userId=${userId}&limit=100`);
        if (!response.ok) {
          const error = await extractApiError(response);
          throw new Error(error.message);
        }
        const { posts: fetchedPosts } = await response.json();
        setPosts(fetchedPosts || []);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        console.error("Error fetching posts:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}천`;
    return `${(num / 1000000).toFixed(1)}만`;
  };

  if (isLoading) {
    return (
      <div className="w-full py-8">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 text-center space-y-4">
        <p className="text-[#262626] font-semibold">오류가 발생했습니다</p>
        <p className="text-sm text-[#8e8e8e]">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetch(`/api/posts?userId=${userId}&limit=100`)
              .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
              })
              .then((data) => setPosts(data.posts || []))
              .catch((err) => setError(getErrorMessage(err)))
              .finally(() => setIsLoading(false));
          }}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:bg-[#0085e5] transition-colors font-semibold text-sm"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-[#8e8e8e]">아직 게시물이 없습니다.</p>
      </div>
    );
  }

  const tabs = [
    { id: "posts" as TabType, label: "게시물", icon: Grid3x3 },
    { id: "reels" as TabType, label: "릴스", icon: Film },
    { id: "tagged" as TabType, label: "태그됨", icon: Bookmark },
  ];

  return (
    <div className="w-full">
      {/* 탭 메뉴 */}
      <div className="border-t border-[#dbdbdb]">
        <div className="flex justify-center gap-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 py-4 border-t-2 transition-colors",
                  isActive
                    ? "border-[#262626] text-[#262626]"
                    : "border-transparent text-[#8e8e8e] hover:text-[#262626]"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "fill-current" : "")} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 게시물 그리드 */}
      <div className="py-8" data-post-grid>
        {activeTab === "posts" && (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="relative aspect-square bg-gray-100 group"
            onMouseEnter={() => setHoveredPostId(post.id)}
            onMouseLeave={() => setHoveredPostId(null)}
          >
            {/* Mobile: Link로 페이지 이동 */}
            <Link
              href={`/post/${post.id}`}
              className="md:hidden relative w-full h-full block"
            >
              <Image
                src={post.image_url}
                alt="게시물 이미지"
                fill
                className="object-cover"
                sizes="33vw"
              />
            </Link>

            {/* Desktop: 버튼으로 모달 열기 */}
            <button
              onClick={() => openModal(post.id)}
              className="hidden md:block relative w-full h-full cursor-pointer"
              aria-label={`${post.id} 게시물 보기`}
            >
              <Image
                src={post.image_url}
                alt="게시물 이미지"
                fill
                className="object-cover"
                sizes="300px"
              />
            </button>

            {/* Hover 오버레이 */}
            {hoveredPostId === post.id && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 text-white pointer-events-none">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-white" />
                  <span className="font-semibold">
                    {formatNumber(post.likes_count || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-white" />
                  <span className="font-semibold">
                    {formatNumber(post.comments_count || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
        </div>
        )}

        {/* 릴스 탭 (향후 구현) */}
        {activeTab === "reels" && (
          <div className="py-12 text-center">
            <p className="text-[#8e8e8e]">릴스 기능은 곧 추가될 예정입니다.</p>
          </div>
        )}

        {/* 태그된 게시물 탭 (향후 구현) */}
        {activeTab === "tagged" && (
          <div className="py-12 text-center">
            <p className="text-[#8e8e8e]">태그된 게시물 기능은 곧 추가될 예정입니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

