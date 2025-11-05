-- ============================================
-- Add bio field to users table
-- ============================================
-- 프로필 페이지에서 사용자 소개(Bio)를 표시하기 위한 필드 추가
-- ============================================

-- users 테이블에 bio 필드 추가 (nullable, 최대 150자)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- bio 필드에 대한 코멘트 추가
COMMENT ON COLUMN public.users.bio IS '사용자 소개 (최대 150자 권장)';

