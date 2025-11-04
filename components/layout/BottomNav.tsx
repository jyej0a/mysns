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

interface BottomNavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isUserButton?: boolean;
}

const navItems: BottomNavItem[] = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/search", icon: Search, label: "검색" },
  { href: "/create", icon: PlusSquare, label: "만들기" },
  { href: "/activity", icon: Heart, label: "좋아요" },
  { href: "/profile", icon: User, label: "프로필", isUserButton: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-[#dbdbdb] z-50 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

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
                isActive ? "text-[#262626]" : "text-[#8e8e8e]"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

