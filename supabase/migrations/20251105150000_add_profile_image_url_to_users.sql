-- ============================================
-- Add profile_image_url field to users table
-- ============================================
-- 프로필 이미지는 사용자가 직접 업로드한 이미지를 저장합니다.
-- Clerk 프로필 이미지는 사용하지 않습니다.
-- ============================================

-- users 테이블에 profile_image_url 필드 추가 (nullable, Supabase Storage URL)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- profile_image_url 필드에 대한 코멘트 추가
COMMENT ON COLUMN public.users.profile_image_url IS '프로필 이미지 URL (Supabase Storage 경로: {clerk_id}/profile/{filename})';

