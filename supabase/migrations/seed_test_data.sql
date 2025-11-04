-- ============================================
-- 테스트 데이터 시드 (Seed Data)
-- ============================================
-- 개발 및 테스트용 샘플 데이터 생성
-- ============================================

-- 1. 테스트 사용자 생성 (이미 있으면 건너뛰기)
INSERT INTO public.users (id, clerk_id, name, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'test_user_1', '테스트 사용자 1', now() - interval '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'test_user_2', '테스트 사용자 2', now() - interval '3 days'),
  ('33333333-3333-3333-3333-333333333333', 'test_user_3', '테스트 사용자 3', now() - interval '1 day')
ON CONFLICT (clerk_id) DO NOTHING;

-- 2. 테스트 게시물 생성
-- 이미지 URL은 Unsplash의 무료 이미지를 사용 (실제로는 Supabase Storage에 업로드된 이미지여야 함)
INSERT INTO public.posts (id, user_id, image_url, caption, created_at, updated_at)
VALUES 
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    '첫 번째 테스트 게시물입니다! 🎉',
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
    '두 번째 게시물입니다. 오늘 날씨가 정말 좋네요! ☀️',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    '안녕하세요! 세 번째 게시물입니다 🌲',
    now() - interval '12 hours',
    now() - interval '12 hours'
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    '자연 속에서 힐링하는 시간 🌿',
    now() - interval '6 hours',
    now() - interval '6 hours'
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '33333333-3333-3333-3333-333333333333',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800',
    '오늘도 좋은 하루 보내세요! ✨',
    now() - interval '2 hours',
    now() - interval '2 hours'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '33333333-3333-3333-3333-333333333333',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
    '여섯 번째 게시물입니다 🌸',
    now() - interval '1 hour',
    now() - interval '1 hour'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. 테스트 좋아요 데이터 생성
INSERT INTO public.likes (id, post_id, user_id, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111110', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111120', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', now() - interval '1 day'),
  ('11111111-1111-1111-1111-111111111130', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', now() - interval '12 hours'),
  ('11111111-1111-1111-1111-111111111140', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', now() - interval '6 hours'),
  ('11111111-1111-1111-1111-111111111150', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', now() - interval '3 hours'),
  ('11111111-1111-1111-1111-111111111160', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', now() - interval '2 hours')
ON CONFLICT DO NOTHING;

-- 4. 테스트 댓글 데이터 생성
INSERT INTO public.comments (id, post_id, user_id, content, created_at, updated_at)
VALUES 
  ('21111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '정말 멋진 사진이네요!', now() - interval '1 day', now() - interval '1 day'),
  ('21111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', '좋아요! 👍', now() - interval '23 hours', now() - interval '23 hours'),
  ('21111111-1111-1111-1111-111111111113', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '오늘 날씨가 정말 좋네요!', now() - interval '12 hours', now() - interval '12 hours'),
  ('21111111-1111-1111-1111-111111111114', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', '자연 속에서 힐링하는 시간이 필요해요', now() - interval '6 hours', now() - interval '6 hours'),
  ('21111111-1111-1111-1111-111111111115', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '정말 아름다운 풍경이에요 🌲', now() - interval '2 hours', now() - interval '2 hours')
ON CONFLICT (id) DO NOTHING;

-- 5. 테스트 팔로우 관계 생성
INSERT INTO public.follows (id, follower_id, following_id, created_at)
VALUES 
  ('31111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now() - interval '3 days'),
  ('31111111-1111-1111-1111-111111111112', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', now() - interval '2 days'),
  ('31111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', now() - interval '1 day'),
  ('31111111-1111-1111-1111-111111111114', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', now() - interval '12 hours')
ON CONFLICT DO NOTHING;

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '테스트 데이터 시드 완료!';
  RAISE NOTICE '- 사용자: 3명';
  RAISE NOTICE '- 게시물: 6개';
  RAISE NOTICE '- 좋아요: 6개';
  RAISE NOTICE '- 댓글: 5개';
  RAISE NOTICE '- 팔로우 관계: 4개';
END $$;

