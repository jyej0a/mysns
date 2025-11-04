"use client";

/**
 * @file components/providers/create-post-provider.tsx
 * @description 게시물 작성 모달 상태 관리 Provider
 *
 * Sidebar와 BottomNav에서 게시물 작성 모달을 열 수 있도록
 * 전역 상태를 제공합니다.
 *
 * @dependencies
 * - react: createContext, useContext, useState
 * - components/post/CreatePostModal
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { CreatePostModal } from "@/components/post/CreatePostModal";

interface CreatePostContextType {
  openModal: () => void;
  closeModal: () => void;
  isOpen: boolean;
}

const CreatePostContext = createContext<CreatePostContextType | undefined>(
  undefined
);

export function CreatePostProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <CreatePostContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}
      <CreatePostModal open={isOpen} onOpenChange={setIsOpen} />
    </CreatePostContext.Provider>
  );
}

export function useCreatePost() {
  const context = useContext(CreatePostContext);
  if (context === undefined) {
    throw new Error("useCreatePost must be used within a CreatePostProvider");
  }
  return context;
}

