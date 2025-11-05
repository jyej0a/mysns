-- ============================================
-- Add missing columns to users table
-- ============================================
-- bio와 profile_image_url 컬럼이 없는 경우를 대비한 통합 마이그레이션
-- ============================================

-- users 테이블에 bio 필드 추가 (nullable, 최대 150자)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- bio 필드에 대한 코멘트 추가
COMMENT ON COLUMN public.users.bio IS '사용자 소개 (최대 150자 권장)';

-- users 테이블에 profile_image_url 필드 추가 (nullable, Supabase Storage URL)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- profile_image_url 필드에 대한 코멘트 추가
COMMENT ON COLUMN public.users.profile_image_url IS '프로필 이미지 URL (Supabase Storage 경로: {clerk_id}/profile/{filename})';

