"use client";

/**
 * @file components/comment/CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * Instagram 스타일의 댓글 입력 폼입니다.
 * - 입력창: "댓글 달기..."
 * - Enter 또는 "게시" 버튼으로 제출
 *
 * @dependencies
 * - react: useState, FormEvent
 * - @clerk/nextjs: useAuth
 */

import { useState, FormEvent } from "react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface CommentFormProps {
  postId: string;
  onSubmit: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function CommentForm({ postId: _postId, onSubmit, isLoading = false }: CommentFormProps) {
  const { isSignedIn } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSignedIn || !content.trim() || isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent(""); // 성공 시 입력창 초기화
    } catch (error) {
      console.error("Failed to submit comment:", error);
      // 에러는 상위 컴포넌트에서 처리
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter 키로 제출 (Shift+Enter는 줄바꿈 허용하지 않음)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (content.trim() && !isSubmitting && !isLoading) {
        handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-[#dbdbdb]">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder={isSignedIn ? "댓글 달기..." : "로그인이 필요합니다."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!isSignedIn || isSubmitting || isLoading}
          aria-label="댓글 입력"
          aria-describedby={!isSignedIn ? "comment-login-required" : undefined}
          className={cn(
            "flex-1 text-sm outline-none text-[#262626] placeholder:text-[#8e8e8e]",
            "focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2 rounded px-2 py-1",
            (!isSignedIn || isSubmitting || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        />
        {!isSignedIn && (
          <span id="comment-login-required" className="sr-only">
            댓글을 작성하려면 로그인이 필요합니다.
          </span>
        )}
        <button
          type="submit"
          disabled={!isSignedIn || !content.trim() || isSubmitting || isLoading}
          aria-label="댓글 게시"
          className={cn(
            "text-sm font-semibold text-[#0095f6] transition-opacity",
            "focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2 rounded px-2",
            (!isSignedIn || !content.trim() || isSubmitting || isLoading) &&
            "opacity-50 cursor-not-allowed",
            isSignedIn &&
            content.trim() &&
            !isSubmitting &&
            !isLoading &&
            "hover:opacity-70"
          )}
        >
          게시
        </button>
      </div>
    </form>
  );
}

