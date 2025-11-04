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
import { Home, Search, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const menuItems: SidebarItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "/create", icon: PlusSquare, label: "만들기" },
  { href: "/profile", icon: User, label: "프로필" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen bg-white border-r border-[#dbdbdb] z-40 hidden md:block">
      {/* Desktop: 244px 너비 */}
      <div className="hidden lg:flex flex-col w-[244px] h-full pt-8 px-4">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-bold text-[#262626]">
            Instagram
          </Link>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  "hover:bg-gray-50",
                  isActive && "font-semibold"
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    isActive ? "text-[#262626]" : "text-[#262626]"
                  )}
                />
                <span className="text-base text-[#262626]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="lg:hidden flex flex-col w-[72px] h-full pt-8 items-center">
        <div className="mb-8">
          <Link href="/" className="text-xl font-bold text-[#262626]">
            IG
          </Link>
        </div>

        <nav className="flex flex-col gap-4 items-center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg transition-colors",
                  "hover:bg-gray-50",
                  isActive && "bg-gray-50"
                )}
                title={item.label}
              >
                <Icon
                  className={cn(
                    "w-6 h-6",
                    isActive ? "text-[#262626]" : "text-[#262626]"
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

