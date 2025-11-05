/**
 * @file PostCardSkeleton.tsx
 * @description 게시물 카드 로딩 스켈레톤 UI
 *
 * 최적화된 Shimmer 효과를 적용한 로딩 상태 UI입니다.
 * fade-in 애니메이션과 함께 부드러운 로딩 경험을 제공합니다.
 */

export function PostCardSkeleton() {
  return (
    <article className="bg-white border border-[#dbdbdb] rounded-lg mb-4 overflow-hidden animate-[fadeIn_0.3s_ease-in]">
      {/* 헤더 스켈레톤 */}
      <header className="h-[60px] flex items-center justify-between px-4 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-20 bg-gray-200 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            <div className="h-3 w-16 bg-gray-200 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
        </div>
        <div className="w-5 h-5 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </header>

      {/* 이미지 스켈레톤 */}
      <div className="w-full aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>

      {/* 액션 버튼 스켈레톤 */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[#dbdbdb]">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>

      {/* 컨텐츠 스켈레톤 */}
      <div className="px-4 py-2 space-y-2">
        <div className="h-4 w-24 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="space-y-1">
          <div className="h-4 w-full bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
          <div className="h-4 w-3/4 bg-gray-200 rounded relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
      </div>
    </article>
  );
}

