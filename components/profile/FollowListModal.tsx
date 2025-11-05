"use client";

/**
 * @file components/profile/FollowListModal.tsx
 * @description 팔로워/팔로잉 목록 모달 컴포넌트
 *
 * 사용자의 팔로워 또는 팔로잉 목록을 표시하는 모달입니다.
 *
 * @dependencies
 * - components/ui/dialog: Dialog 컴포넌트
 * - react: useState, useEffect, useCallback
 * - next/image: Image
 * - next/link: Link
 */

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { extractApiError, getErrorMessage } from "@/lib/error-handler";

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: "followers" | "following";
  title: string;
}

interface User {
  id: string;
  name: string;
  profile_image_url: string | null;
}

export function FollowListModal({
  open,
  onOpenChange,
  userId,
  type,
  title,
}: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = type === "followers" ? "followers" : "following";
      const response = await fetch(`/api/users/${userId}/${endpoint}`);

      if (!response.ok) {
        const error = await extractApiError(response);
        throw new Error(error.message);
      }

      const data = await response.json();
      const userList = type === "followers" ? data.followers : data.following;
      setUsers(userList || []);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, type]);

  useEffect(() => {
    if (open && userId) {
      fetchUsers();
    } else {
      // 모달이 닫히면 데이터 초기화
      setUsers([]);
      setError(null);
    }
  }, [open, userId, type, fetchUsers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] h-[80vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-4 py-3 border-b border-[#dbdbdb] flex-shrink-0">
          <div className="flex items-center justify-center relative">
            <DialogTitle className="text-base font-semibold text-[#262626]">
              {title}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5 text-[#262626]" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-[#0095f6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-[#8e8e8e]">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-[#0095f6] text-white rounded-lg hover:bg-[#0085e5] transition-colors font-semibold text-sm"
              >
                다시 시도
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#8e8e8e]">
                {type === "followers" ? "팔로워가 없습니다." : "팔로잉이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {/* 프로필 이미지 */}
                  <div className="w-11 h-11 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                    {user.profile_image_url ? (
                      <Image
                        src={user.profile_image_url}
                        alt={`${user.name}의 프로필 이미지`}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-[#262626]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* 사용자명 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#262626] truncate">
                      {user.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

