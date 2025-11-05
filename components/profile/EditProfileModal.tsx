"use client";

/**
 * @file components/profile/EditProfileModal.tsx
 * @description 프로필 편집 모달 컴포넌트
 *
 * 사용자 프로필을 편집하는 모달입니다.
 * - 프로필 이미지 업로드/삭제
 * - Bio 수정
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - components/ui/button: Button 컴포넌트
 * - components/ui/textarea: Textarea 컴포넌트
 * - react: useState, useRef, useEffect
 * - lucide-react: ImageIcon, X, Trash2
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { extractApiError, getErrorMessage } from "@/lib/error-handler";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentBio: string | null;
  currentProfileImageUrl: string | null;
  onUpdate: () => void; // 프로필 업데이트 후 콜백
}

export function EditProfileModal({
  open,
  onOpenChange,
  userId,
  currentBio,
  currentProfileImageUrl,
  onUpdate,
}: EditProfileModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bio, setBio] = useState(currentBio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (open) {
      setBio(currentBio || "");
      setImagePreview(currentProfileImageUrl);
      setSelectedImage(null);
      setError(null);
    }
  }, [open, currentBio, currentProfileImageUrl]);

  // 파일 검증 및 처리 공통 함수
  const processFile = useCallback((file: File) => {
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
    if (file) {
      processFile(file);
    }
  };

  // 이미지 제거 핸들러
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(currentProfileImageUrl);
  };

  // 프로필 이미지 삭제 핸들러
  const handleDeleteProfileImage = async () => {
    if (!currentProfileImageUrl) return;

    if (!confirm("프로필 이미지를 삭제하시겠습니까?")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/profile-image`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await extractApiError(response);
        throw new Error(error.message);
      }

      // 성공 시 미리보기 제거
      setImagePreview(null);
      setSelectedImage(null);
      onUpdate(); // 부모 컴포넌트에 업데이트 알림
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to delete profile image:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 프로필 이미지 업로드 (새 이미지가 선택된 경우)
      if (selectedImage) {
        const formData = new FormData();
        formData.append("image", selectedImage);

        const uploadResponse = await fetch(`/api/users/${userId}/profile-image`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const error = await extractApiError(uploadResponse);
          throw new Error(error.message);
        }
      }

      // Bio 업데이트 (변경된 경우)
      if (bio !== (currentBio || "")) {
        const updateResponse = await fetch(`/api/users/${userId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bio: bio.trim() || null }),
        });

        if (!updateResponse.ok) {
          const error = await extractApiError(updateResponse);
          throw new Error(error.message);
        }
      }

      // 성공 시 모달 닫기 및 부모 컴포넌트에 업데이트 알림
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to update profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#dbdbdb]">
          <DialogTitle className="text-lg font-semibold text-[#262626] text-center">
            프로필 편집
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6">
          {/* 프로필 이미지 업로드 영역 */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-[#262626]">
              프로필 사진
            </label>

            {/* 이미지 미리보기 */}
            {imagePreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={imagePreview}
                  alt="프로필 이미지 미리보기"
                  fill
                  className="object-cover rounded-full"
                />
                {currentProfileImageUrl && !selectedImage && (
                  <button
                    onClick={handleDeleteProfileImage}
                    disabled={isSubmitting}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    aria-label="프로필 이미지 삭제"
                  >
                    <Trash2 className="w-3 h-3" />
                    삭제
                  </button>
                )}
                {selectedImage && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/90 transition-colors disabled:opacity-50"
                    aria-label="선택한 이미지 제거"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-32 h-32 mx-auto border-2 border-dashed rounded-full flex flex-col items-center justify-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-[#0095f6] bg-[#0095f6]/10"
                    : "border-[#dbdbdb] hover:border-[#8e8e8e]"
                )}
              >
                <ImageIcon className="w-8 h-8 text-[#8e8e8e] mb-2" />
                <span className="text-xs text-[#8e8e8e]">사진 추가</span>
              </div>
            )}

            {/* 파일 입력 (숨김) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* 이미지 선택 버튼 */}
            {!imagePreview && (
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full bg-[#0095f6] text-white hover:bg-[#1877f2] disabled:opacity-50"
              >
                사진 선택
              </Button>
            )}
          </div>

          {/* Bio 입력 영역 */}
          <div className="space-y-2">
            <label
              htmlFor="bio"
              className="block text-sm font-semibold text-[#262626]"
            >
              소개
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자신을 소개해주세요..."
              maxLength={150}
              rows={4}
              className="resize-none text-sm"
              disabled={isSubmitting}
            />
            <div className="text-xs text-[#8e8e8e] text-right">
              {bio.length}/150
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          {/* 제출 버튼 */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!selectedImage && bio === (currentBio || ""))}
            className="w-full bg-[#0095f6] text-white hover:bg-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "저장 중..." : "저장"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

