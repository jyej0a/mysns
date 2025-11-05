# UI/UX 개선 & 디자인 시스템

## 개요
반응형 디자인, 타이포그래피, 컬러 스키마, 애니메이션 등 UI/UX 개선 작업 목록

## 완료된 작업
- [x] 기본 반응형 레이아웃 (Desktop, Tablet, Mobile)
- [x] Instagram 컬러 스키마 기본 적용
- [x] Skeleton UI (PostCardSkeleton)
- [x] 좋아요 애니메이션 (scale)
- [x] 더블탭 좋아요 애니메이션 (큰 하트)

## 진행 중 / 예정 작업

### 반응형 디자인 세부사항
- [ ] 메인 피드 최대 너비 630px 중앙 정렬 확인
- [ ] 배경색 확인 (#FAFAFA 전체, #FFFFFF 카드)
- [ ] Desktop Sidebar 너비 244px 확인
- [ ] Tablet Sidebar 너비 72px 확인
- [ ] Mobile Header 높이 60px 확인
- [ ] Mobile BottomNav 높이 50px 확인
- [ ] 프로필 이미지 크기 반응형 (150px Desktop / 90px Mobile)

### 타이포그래피
- [ ] 폰트 패밀리 확인 (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- [ ] 텍스트 크기 확인
  - [ ] --text-xs: 12px (시간)
  - [ ] --text-sm: 14px (기본)
  - [ ] --text-base: 16px (입력창)
  - [ ] --text-xl: 20px (프로필)
- [ ] 폰트 굵기 확인
  - [ ] --font-normal: 400
  - [ ] --font-semibold: 600
  - [ ] --font-bold: 700

### 컬러 스키마
- [ ] Instagram Blue (#0095f6) - 버튼, 링크
- [ ] Background (#fafafa) - 전체 배경
- [ ] Card Background (#ffffff) - 카드
- [ ] Border (#dbdbdb) - 테두리
- [ ] Text Primary (#262626) - 본문
- [ ] Text Secondary (#8e8e8e) - 보조
- [ ] Like (#ed4956) - 빨간 하트

### 애니메이션 & 인터랙션
- [ ] 모달 열기/닫기 애니메이션 (fade in/out)
- [ ] Skeleton UI Shimmer 효과 최적화
- [ ] 버튼 Hover 효과 일관성 확인
- [ ] 로딩 상태 전환 애니메이션

### 접근성
- [ ] 키보드 네비게이션 (Tab, Enter, ESC)
- [ ] ARIA 라벨 추가
- [ ] 포커스 표시 개선

## 관련 파일
- `app/globals.css` (Tailwind CSS 설정)
- 모든 컴포넌트 파일

