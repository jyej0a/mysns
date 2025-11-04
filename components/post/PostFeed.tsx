"use client";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하고 관리하는 컴포넌트입니다.
 * 무한 스크롤은 추후 구현 예정입니다.
 *
 * @dependencies
 * - components/post/PostCard
 * - components/post/PostCardSkeleton
 */

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";

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
}

interface PostFeedProps {
  initialPosts?: Post[];
}

export function PostFeed({ initialPosts = [] }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPosts.length > 0) {
      setPosts(initialPosts);
      setLoading(false);
      return;
    }

    // 게시물 가져오기
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/posts?limit=10");
        
        if (!response.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류");
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [initialPosts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 text-center">
        <p className="text-[#8e8e8e]">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 text-center">
        <p className="text-[#8e8e8e]">게시물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

