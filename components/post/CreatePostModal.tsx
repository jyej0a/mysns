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

import { useState, useRef } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 현재 사용자 이름 가져오기
  const userName =
    user?.fullName ||
    user?.username ||
    user?.emailAddresses[0]?.emailAddress ||
    "사용자";

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (최대 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setSelectedImage(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 게시 핸들러 (2-2에서 실제 업로드 로직 구현 예정)
  const handleSubmit = async () => {
    if (!selectedImage) {
      alert("이미지를 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 2-2에서 실제 업로드 로직 구현
      // 현재는 콘솔에만 출력
      console.log("게시물 작성:", {
        image: selectedImage,
        caption,
      });

      // 임시로 성공 처리
      alert("게시물 작성 기능은 2-2 단계에서 구현됩니다.");
      
      // 모달 닫기 및 상태 초기화
      handleClose();
    } catch (error) {
      console.error("게시물 작성 오류:", error);
      alert("게시물 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 모달 닫기 및 상태 초기화
  const handleClose = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] p-0 gap-0">
        <DialogHeader className="px-4 py-3 border-b border-[#dbdbdb]">
          <DialogTitle className="text-center text-base font-semibold text-[#262626]">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          {/* 이미지 선택/미리보기 영역 */}
          {!imagePreview ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[400px]">
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
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                aria-label="이미지 제거"
              >
                <X className="w-5 h-5 text-white" />
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
                onChange={(e) => setCaption(e.target.value)}
                maxLength={2200}
                className="resize-none min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                rows={3}
              />
            </div>
            <div className="flex justify-end">
              <span
                className={cn(
                  "text-xs text-[#8e8e8e]",
                  caption.length >= 2200 && "text-red-500"
                )}
              >
                {caption.length}/2,200
              </span>
            </div>
          </div>

          {/* 게시 버튼 */}
          <div className="px-4 py-3 border-t border-[#dbdbdb]">
            <Button
              onClick={handleSubmit}
              disabled={!selectedImage || isSubmitting}
              className="w-full bg-[#0095f6] text-white hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "게시 중..." : "게시"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

