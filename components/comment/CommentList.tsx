"use client";

/**
 * @file components/comment/CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * Instagram 스타일의 댓글 목록입니다.
 * - 댓글 목록 표시
 * - 사용자 정보 포함
 * - 시간 표시
 * - 본인 댓글 삭제 기능
 *
 * @dependencies
 * - next/link: 라우팅
 * - lucide-react: 아이콘
 * - components/ui/dialog: 삭제 확인 다이얼로그
 */

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    clerk_id?: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string | null;
  onDelete?: (commentId: string) => void;
}

export function CommentList({
  comments,
  currentUserId,
  onDelete,
}: CommentListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCommentId || !onDelete) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(selectedCommentId);
      setDeleteDialogOpen(false);
      setSelectedCommentId(null);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  if (!comments || comments.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-2 space-y-3">
        {comments.map((comment) => {
          const isOwnComment = currentUserId === comment.user.id;

          return (
            <div key={comment.id} className="text-sm text-[#262626]">
              <div className="flex items-start gap-2 group">
                <Link
                  href={`/profile/${comment.user.id}`}
                  className="font-semibold hover:opacity-70"
                >
                  {comment.user.name}
                </Link>
                <span className="flex-1">{comment.content}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8e8e8e]">
                    {formatTimeAgo(comment.created_at)}
                  </span>
                  {/* 본인 댓글에만 ⋯ 메뉴 표시 */}
                  {isOwnComment && onDelete && (
                    <button
                      onClick={() => handleDeleteClick(comment.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#262626] hover:opacity-70"
                      title="댓글 삭제"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedCommentId(null);
              }}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

