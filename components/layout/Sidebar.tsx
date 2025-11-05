"use client";

/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * 데스크톱과 태블릿에서 사용되는 사이드바입니다.
 * - Desktop (1024px+): 244px 너비, 아이콘 + 텍스트
 * - Tablet (768px ~ 1024px): 72px 너비, 아이콘만
 * - Mobile: 숨김 (BottomNav 사용)
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 라우팅
 * - next/navigation: usePathname
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Compass, Video, Send, Heart, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreatePost } from "@/components/providers/create-post-provider";
import { useUser } from "@clerk/nextjs";

interface SidebarItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isAction?: boolean;
}

const menuItems: SidebarItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "/explore", icon: Compass, label: "탐색" },
  { href: "/reels", icon: Video, label: "릴스" },
  { href: "/messages", icon: Send, label: "메시지" },
  { href: "/activity", icon: Heart, label: "알림" },
  { href: "#", icon: PlusSquare, label: "만들기", isAction: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { openModal } = useCreatePost();
  const { user } = useUser();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white border-r border-[#dbdbdb] z-40 hidden md:block">
      {/* Desktop: 244px 너비 */}
      <div className="hidden lg:flex flex-col w-[244px] h-full pt-8 px-4 justify-between">
        <div>
          <div className="mb-8">
            <Link href="/" className="text-2xl font-bold text-[#262626]">
              Instagram
            </Link>
          </div>

          <nav className="flex flex-col gap-1" aria-label="주요 네비게이션">
            {menuItems.map((item) => {
              const Icon = item.icon;
              // 경로가 /profile/[userId] 형태인 경우도 프로필 메뉴 활성화
              const isActive = item.href === "/profile" 
                ? pathname === "/profile" || pathname?.startsWith("/profile/")
                : pathname === item.href;

              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    onClick={openModal}
                    aria-label={item.label}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left",
                      "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2"
                    )}
                  >
                    <Icon className="w-6 h-6 text-[#262626]" aria-hidden="true" />
                    <span className="text-base text-[#262626]">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
                    "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2",
                    isActive && "font-semibold bg-gray-50"
                  )}
                >
                  {/* 활성 상태 표시 - Instagram 스타일 왼쪽 파란색 바 */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0095f6] rounded-r-full" />
                  )}
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-[#262626]" : "text-[#8e8e8e]"
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn(
                    "text-base transition-colors",
                    isActive ? "text-[#262626]" : "text-[#262626]"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 하단 프로필 섹션 */}
        <div className="pb-8">
          <Link
            href="/profile"
            aria-label="프로필"
            aria-current={pathname === "/profile" || pathname?.startsWith("/profile/") ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
              "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2",
              (pathname === "/profile" || pathname?.startsWith("/profile/")) && "font-semibold bg-gray-50"
            )}
          >
            {/* 활성 상태 표시 */}
            {(pathname === "/profile" || pathname?.startsWith("/profile/")) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#0095f6] rounded-r-full" />
            )}
            <div className="relative profile-avatar-wrapper">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "프로필"}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "?"}
                  </span>
                </div>
              )}
            </div>
            <span className={cn(
              "text-base transition-colors",
              (pathname === "/profile" || pathname?.startsWith("/profile/")) ? "text-[#262626]" : "text-[#262626]"
            )}>
              프로필
            </span>
          </Link>
        </div>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="lg:hidden flex flex-col w-[72px] h-full pt-8 items-center justify-between">
        <div>
          <div className="mb-8">
            <Link href="/" className="text-xl font-bold text-[#262626]">
              IG
            </Link>
          </div>

          <nav className="flex flex-col gap-4 items-center" aria-label="주요 네비게이션">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === "/profile"
                ? pathname === "/profile" || pathname?.startsWith("/profile/")
                : pathname === item.href;

              if (item.isAction) {
                return (
                  <button
                    key={item.href}
                    onClick={openModal}
                    aria-label={item.label}
                    className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                      "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2"
                    )}
                    title={item.label}
                  >
                    <Icon className="w-6 h-6 text-[#262626]" aria-hidden="true" />
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg transition-colors relative",
                    "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2",
                    isActive && "bg-gray-100"
                  )}
                  title={item.label}
                >
                  {/* 활성 상태 표시 - 태블릿용 작은 점 */}
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0095f6] rounded-full" />
                  )}
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-[#262626]" : "text-[#8e8e8e]"
                    )}
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 하단 프로필 섹션 */}
        <div className="pb-8">
          <Link
            href="/profile"
            aria-label="프로필"
            aria-current={pathname === "/profile" || pathname?.startsWith("/profile/") ? "page" : undefined}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg transition-colors relative",
              "hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-[#0095f6] focus-visible:outline-offset-2",
              (pathname === "/profile" || pathname?.startsWith("/profile/")) && "bg-gray-100"
            )}
            title="프로필"
          >
            {/* 활성 상태 표시 - 태블릿용 작은 점 */}
            {(pathname === "/profile" || pathname?.startsWith("/profile/")) && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#0095f6] rounded-full" />
            )}
            <div className="relative profile-avatar-wrapper">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "프로필"}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    {user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "?"}
                  </span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}

