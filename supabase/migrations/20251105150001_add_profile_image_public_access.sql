-- ============================================
-- Add public access policy for profile images
-- ============================================
-- 프로필 이미지는 모든 사용자가 조회할 수 있어야 합니다.
-- 경로가 {clerk_id}/profile/* 인 경우 공개 접근 허용
-- ============================================

-- SELECT: 프로필 이미지는 모든 사용자가 조회 가능 (공개 접근)
CREATE POLICY "Public can view profile images"
ON storage.objects FOR SELECT
TO public
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[2] = 'profile'
);

