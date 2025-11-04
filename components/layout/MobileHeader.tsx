"use client";

/**
 * @file MobileHeader.tsx
 * @description 모바일 전용 헤더 컴포넌트
 *
 * 모바일 화면(< 768px)에서만 표시되는 헤더입니다.
 * - 높이: 60px
 * - 로고 + 알림/DM/프로필 아이콘
 *
 * @dependencies
 * - lucide-react: 아이콘
 * - next/link: 라우팅
 * - @clerk/nextjs: UserButton
 */

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Heart, Send } from "lucide-react";

export function MobileHeader() {
    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-[#dbdbdb] z-50 flex items-center justify-between px-4">
            {/* 로고 */}
            <Link href="/" className="text-xl font-bold text-[#262626]">
                Instagram
            </Link>

            {/* 우측 아이콘들 */}
            <div className="flex items-center gap-4">
                {/* 알림 (좋아요) - 추후 구현 */}
                <button className="text-[#262626] hover:opacity-70 transition-opacity">
                    <Heart className="w-6 h-6" />
                </button>

                {/* DM (메시지) - 추후 구현 */}
                <button className="text-[#262626] hover:opacity-70 transition-opacity">
                    <Send className="w-6 h-6" />
                </button>

                {/* 프로필 */}
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-6 h-6",
                        },
                    }}
                />
            </div>
        </header>
    );
}

