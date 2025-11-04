/**
 * @file app/(main)/layout.tsx
 * @description 메인 레이아웃 컴포넌트
 *
 * Instagram 스타일의 메인 레이아웃입니다.
 * - Desktop: Sidebar (244px) + Main Feed (최대 630px 중앙 정렬)
 * - Tablet: Icon-only Sidebar (72px) + Main Feed
 * - Mobile: MobileHeader + Main Feed + BottomNav
 *
 * @dependencies
 * - components/layout/Sidebar
 * - components/layout/MobileHeader
 * - components/layout/BottomNav
 */

import { Sidebar } from "@/components/layout/Sidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { CreatePostProvider } from "@/components/providers/create-post-provider";
import { cn } from "@/lib/utils";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CreatePostProvider>
        <div className="min-h-screen bg-[#fafafa]">
        {/* Sidebar (Desktop & Tablet) */}
        <Sidebar />

        {/* Mobile Header */}
        <MobileHeader />

        {/* Main Content */}
        <main
          className={cn(
            // Desktop: Sidebar 너비만큼 왼쪽 여백
            "lg:ml-[244px]",
            // Tablet: Icon-only Sidebar 너비만큼 왼쪽 여백
            "md:ml-[72px] lg:ml-[244px]",
            // Mobile: Header 높이만큼 상단 여백
            "pt-[60px] md:pt-0",
            // BottomNav 높이만큼 하단 여백 (Mobile)
            "pb-[50px] md:pb-0",
            // 최대 너비 및 중앙 정렬
            "flex justify-center"
          )}
        >
          <div className="w-full max-w-[630px]">{children}</div>
        </main>

        {/* Bottom Navigation (Mobile) */}
        <BottomNav />
      </div>
    </CreatePostProvider>
  );
}

