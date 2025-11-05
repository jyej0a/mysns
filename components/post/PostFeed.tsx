"use client";

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하고 관리하는 컴포넌트입니다.
 * Intersection Observer를 사용한 무한 스크롤 구현.
 *
 * @dependencies
 * - components/post/PostCard
 * - components/post/PostCardSkeleton
 * - react: useEffect, useState, useRef, useCallback
 * - @clerk/nextjs: useAuth
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
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
  const { userId: clerkUserId } = useAuth();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false); // 에러 발생 시 재시도 방지
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const LIMIT = 10;

  // 게시물 가져오기
  const fetchPosts = useCallback(async (offset: number = 0, append: boolean = false) => {
    // 에러가 발생한 경우 재시도하지 않음
    if (hasError && !append) {
      return;
    }

    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null); // 새로 로드할 때는 에러 초기화
      }

      const response = await fetch(`/api/posts?limit=${LIMIT}&offset=${offset}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // 네트워크 에러와 서버 에러 구분
        if (response.status === 500) {
          throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } else if (response.status === 404) {
          throw new Error("게시물을 찾을 수 없습니다.");
        } else if (response.status >= 400 && response.status < 500) {
          throw new Error(errorData.error || "요청을 처리할 수 없습니다.");
        } else {
          throw new Error(errorData.error || "게시물을 불러오는데 실패했습니다. 네트워크 연결을 확인해주세요.");
        }
      }

      const data = await response.json();
      const newPosts = data.posts || [];
      
      // 현재 사용자 ID 설정 (첫 로드 시 또는 업데이트)
      if (data.currentUserId !== undefined) {
        setCurrentUserId(data.currentUserId);
      }
      
      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      // 더 불러올 게시물이 있는지 확인 (게시물이 limit보다 적으면 더 이상 없음)
      const hasMoreData = newPosts.length === LIMIT && (data.pagination?.hasMore ?? false);
      setHasMore(hasMoreData);
      setHasError(false); // 성공 시 에러 상태 해제
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(errorMessage);
      setHasError(true); // 에러 발생 표시
      setHasMore(false); // 더 이상 로드하지 않음
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [hasError]);

  // 초기 로딩 (한 번만 실행)
  useEffect(() => {
    if (initialPosts.length > 0) {
      setPosts(initialPosts);
      setLoading(false);
      // 초기 게시물이 있으면 더 불러올 수 있는지 확인
      setHasMore(initialPosts.length === LIMIT);
      return;
    }

    // 초기 게시물이 없으면 한 번만 로드
    fetchPosts(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 변경하여 마운트 시 한 번만 실행

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    // 에러가 발생했거나 더 불러올 게시물이 없거나 로딩 중이면 Observer 등록하지 않음
    if (hasError || !hasMore || loading || posts.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading && !hasError) {
          fetchPosts(posts.length, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
    // fetchPosts를 dependency에서 제거하고 직접 호출
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isLoadingMore, loading, hasError, posts.length]);

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
      <div className="bg-white border border-[#dbdbdb] rounded-lg p-8 text-center space-y-4">
        <div className="space-y-2">
          <p className="text-[#262626] font-semibold">오류가 발생했습니다</p>
          <p className="text-sm text-[#8e8e8e]">{error}</p>
        </div>
        <button
          onClick={() => {
            setHasError(false);
            setError(null);
            fetchPosts(0, false);
          }}
          className="px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:bg-[#0085e5] transition-colors font-semibold"
        >
          다시 시도
        </button>
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

  // 게시물 삭제 핸들러
  const handlePostDelete = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDelete={handlePostDelete}
        />
      ))}
      
      {/* 무한 스크롤 트리거 요소 */}
      {hasMore && (
        <div ref={observerTarget} className="py-4">
          {isLoadingMore && (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <PostCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

