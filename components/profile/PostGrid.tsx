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
import { Heart, MessageCircle } from "lucide-react";

interface PostGridProps {
  userId: string;
}

interface Post {
  id: string;
  image_url: string;
  likes_count: number;
  comments_count: number;
}

export function PostGrid({ userId }: PostGridProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/posts?userId=${userId}&limit=100`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const { posts: fetchedPosts } = await response.json();
        setPosts(fetchedPosts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
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

  if (posts.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-[#8e8e8e]">아직 게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="relative aspect-square bg-gray-100 group"
            onMouseEnter={() => setHoveredPostId(post.id)}
            onMouseLeave={() => setHoveredPostId(null)}
          >
            <Image
              src={post.image_url}
              alt="게시물 이미지"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 300px"
            />

            {/* Hover 오버레이 */}
            {hoveredPostId === post.id && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 text-white">
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
          </Link>
        ))}
      </div>
    </div>
  );
}

