"use client";

/**
 * @file components/providers/post-modal-provider.tsx
 * @description 게시물 상세 모달 상태 관리 Provider
 *
 * PostCard에서 Desktop 클릭 시 게시물 상세 모달을 열 수 있도록
 * 전역 상태를 제공합니다.
 *
 * @dependencies
 * - react: createContext, useContext, useState
 * - components/post/PostModal
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { PostModal } from "@/components/post/PostModal";

interface PostModalContextType {
  openModal: (postId: string) => void;
  closeModal: () => void;
  isOpen: boolean;
  postId: string | null;
}

const PostModalContext = createContext<PostModalContextType | undefined>(
  undefined
);

export function PostModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState<string | null>(null);

  const openModal = (id: string) => {
    setPostId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // 모달이 닫힌 후 약간의 지연을 두고 postId 초기화 (애니메이션 완료 대기)
    setTimeout(() => {
      setPostId(null);
    }, 200);
  };

  return (
    <PostModalContext.Provider value={{ openModal, closeModal, isOpen, postId }}>
      {children}
      {postId && (
        <PostModal open={isOpen} onOpenChange={setIsOpen} postId={postId} />
      )}
    </PostModalContext.Provider>
  );
}

export function usePostModal() {
  const context = useContext(PostModalContext);
  if (context === undefined) {
    throw new Error("usePostModal must be used within a PostModalProvider");
  }
  return context;
}

