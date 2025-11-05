"use client";

/**
 * @file BottomNav.tsx
 * @description 모바일 전용 하단 네비게이션 컴포넌트
 *
 * 모바일 화면(< 768px)에서만 표시되는 하단 네비게이션입니다.
 * - 높이: 50px
 * - 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 라우팅
 * - next/navigation: usePathname
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { useCreatePost } from "@/components/providers/create-post-provider";

interface BottomNavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isUserButton?: boolean;
  isAction?: boolean;
}

const navItems: BottomNavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "#", icon: PlusSquare, label: "만들기", isAction: true },
  { href: "/activity", icon: Heart, label: "좋아요" },
  { href: "/profile", icon: User, label: "프로필", isUserButton: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { openModal } = useCreatePost();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50 flex items-center justify-around" aria-label="하단 네비게이션">
      {navItems.map((item) => {
        const Icon = item.icon;
        // 프로필 메뉴는 /profile 또는 /profile/[userId] 모두 활성화
        const isActive = item.href === "/profile"
          ? pathname === "/profile" || pathname?.startsWith("/profile/")
          : pathname === item.href;

        if (item.isUserButton) {
          return (
            <div key={item.href} className="flex items-center justify-center">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-6 h-6",
                  },
                }}
              />
            </div>
          );
        }

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
              <Icon className="w-6 h-6 text-[#8e8e8e]" aria-hidden="true" />
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
              isActive && "bg-gray-50"
            )}
            title={item.label}
          >
            {/* 활성 상태 표시 - 상단 작은 점 */}
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
  );
}

