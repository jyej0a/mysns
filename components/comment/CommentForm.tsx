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

export function CommentForm({ postId, onSubmit, isLoading = false }: CommentFormProps) {
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
          className={cn(
            "flex-1 text-sm outline-none text-[#262626] placeholder:text-[#8e8e8e]",
            (!isSignedIn || isSubmitting || isLoading) && "opacity-50 cursor-not-allowed"
          )}
        />
        <button
          type="submit"
          disabled={!isSignedIn || !content.trim() || isSubmitting || isLoading}
          className={cn(
            "text-sm font-semibold text-[#0095f6] transition-opacity",
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

