"use client";

/**
 * @file components/post/CreatePostModal.tsx
 * @description 게시물 작성 모달 컴포넌트
 *
 * Instagram 스타일의 게시물 작성 모달입니다.
 * - Dialog 기반 (shadcn/ui)
 * - 이미지 선택 및 미리보기
 * - 캡션 입력 필드 (최대 2,200자)
 * - "게시" 버튼
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - components/ui/textarea: Textarea 컴포넌트
 * - react: useState, useRef
 * - lucide-react: ImageIcon, X
 */

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { extractApiError, getErrorMessage } from "@/lib/error-handler";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
}: CreatePostModalProps) {
  const { user } = useUser();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 사용자 이름 가져오기
  const userName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "사용자";

  // 파일 검증 및 처리 공통 함수
  const processFile = useCallback((file: File) => {
    // 에러 상태 초기화
    setError(null);

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setSelectedImage(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setError("이미지 미리보기를 생성하는데 실패했습니다.");
    };
    reader.readAsDataURL(file);
  }, []);

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시 핸들러
  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("이미지를 선택해주세요.");
      return;
    }

    // 에러 상태 초기화
    setError(null);
    setIsSubmitting(true);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append("image", selectedImage);
      if (caption.trim()) {
        formData.append("caption", caption.trim());
      }

      // API 호출
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await extractApiError(response);
        throw new Error(error.message);
      }

      await response.json();

      // 성공 시 모달 닫기 및 상태 초기화
      handleClose();
      onOpenChange(false);

      // 피드 새로고침 이벤트 발생 (PostFeed가 자동으로 새 게시물을 불러옴)
      window.dispatchEvent(new CustomEvent("postCreated"));

      // 페이지 새로고침은 더 이상 필요하지 않지만, 혹시 모를 경우를 대비해 유지
      // window.location.reload();
    } catch (err) {
      console.error("게시물 작성 오류:", err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 및 상태 초기화
  const handleClose = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setCaption("");
    setIsDragging(false);
    setError(null); // 에러 상태도 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // 모달 상태 변경 핸들러
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // 모달이 닫힐 때 상태 초기화
      handleClose();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-[#dbdbdb]">
          <DialogTitle className="text-center text-base font-semibold text-[#262626]">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* 이미지 선택/미리보기 영역 */}
          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center py-12 px-4 min-h-[400px] transition-colors",
                isDragging && "bg-blue-50 border-2 border-dashed border-[#0095f6]"
              )}
            >
              <ImageIcon className="w-12 h-12 text-[#8e8e8e] mb-4" />
              <p className="text-xl text-[#262626] font-light mb-4">
                사진을 여기에 끌어다 놓으세요
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0095f6] text-white hover:bg-[#1877f2]"
              >
                컴퓨터에서 선택
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-square bg-gray-100">
              <Image
                src={imagePreview}
                alt="미리보기"
                fill
                className="object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
                aria-label="이미지 제거"
              >
                <X className="w-5 h-5 text-white" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* 캡션 입력 영역 */}
          <div className="px-4 py-4 border-t border-[#dbdbdb]">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-[#262626]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <Textarea
                placeholder="문구 입력..."
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  setError(null); // 입력 시 에러 초기화
                }}
                maxLength={2200}
                aria-label="게시물 캡션 입력"
                aria-describedby="caption-counter"
                className="resize-none min-h-[100px] border-0 focus-visible:ring-2 focus-visible:ring-[#0095f6] focus-visible:ring-offset-2 p-0 text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <span
                id="caption-counter"
                className={cn(
                  "text-xs text-[#8e8e8e]",
                  caption.length >= 2200 && "text-red-500"
                )}
                aria-live="polite"
              >
                {caption.length}/2,200
              </span>
            </div>
            {/* 에러 메시지 표시 */}
            {error && (
              <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}
          </div>

          {/* 게시 버튼 */}
          <div className="px-4 py-3 border-t border-[#dbdbdb] space-y-2">
            {/* 업로드 진행률 표시 */}
            {isSubmitting && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-[#0095f6] animate-pulse" style={{ width: "100%" }} />
              </div>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage || isSubmitting}
              aria-label={isSubmitting ? "게시 중" : "게시물 게시"}
              aria-busy={isSubmitting}
              className="w-full bg-[#0095f6] text-white hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
            >
              {isSubmitting ? "게시 중..." : "게시"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

