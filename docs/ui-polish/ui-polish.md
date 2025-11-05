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

### 타이포그래피 ✅
- [x] 폰트 패밀리 확인 (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
  - [x] globals.css에 시스템 폰트 스택 설정 완료
- [x] 텍스트 크기 확인
  - [x] --text-xs: 12px (시간) - PostCard 시간 표시에 사용
  - [x] --text-sm: 14px (기본) - 기본 텍스트, 댓글에 사용
  - [x] --text-base: 16px (입력창) - 입력창, 사이드바에 사용
  - [x] --text-xl: 20px (프로필) - 프로필 헤더에 사용
- [x] 폰트 굵기 확인
  - [x] --font-normal: 400 - 기본 텍스트
  - [x] --font-semibold: 600 - 강조 텍스트, 버튼에 사용
  - [x] --font-bold: 700 - 제목, 로고에 사용

### 컬러 스키마 ✅
- [x] Instagram Blue (#0095f6) - 버튼, 링크
- [x] Background (#fafafa) - 전체 배경
- [x] Card Background (#ffffff) - 카드
- [x] Border (#dbdbdb) - 테두리
- [x] Text Primary (#262626) - 본문
- [x] Text Secondary (#8e8e8e) - 보조
- [x] Like (#ed4956) - 빨간 하트
- [x] CSS 변수로 정의 완료 (globals.css)

### 애니메이션 & 인터랙션 ✅
- [x] 모달 열기/닫기 애니메이션 (fade in/out)
  - [x] Dialog 컴포넌트에 fade-in/out 애니메이션 적용 (duration-300 ease-out)
  - [x] Overlay에 backdrop-blur-sm 효과 추가
  - [x] 부드러운 전환 효과 구현
- [x] 모달 닫기 개선 (ESC 키, 배경 클릭)
  - [x] ESC 키로 모달 닫기 (Radix UI 기본 기능 활용)
  - [x] 배경 클릭으로 모달 닫기 (onPointerDownOutside 활용)
- [x] Skeleton UI Shimmer 효과 최적화
  - [x] Shimmer 애니메이션 속도 최적화 (2s → 1.5s)
  - [x] Shimmer 효과 강도 개선 (via-white/20 → via-white/30)
  - [x] Skeleton에 fade-in 애니메이션 추가
- [x] 버튼 Hover 효과 일관성 확인
  - [x] Button 컴포넌트에 transition-all 적용 확인
  - [x] 모든 버튼에 일관된 hover 효과 적용
  - [x] CSS 유틸리티 클래스 추가 (.btn-hover)
- [x] 로딩 상태 전환 애니메이션
  - [x] 초기 로딩 시 fade-in 애니메이션 적용
  - [x] 무한 스크롤 로딩 시 slide-up 애니메이션 적용
  - [x] 전환 애니메이션 keyframes 정의 (fadeIn, slideUp)

### 접근성
- [ ] 키보드 네비게이션 (Tab, Enter, ESC)
- [ ] ARIA 라벨 추가
- [ ] 포커스 표시 개선

## 관련 파일
- `app/globals.css` (Tailwind CSS 설정)
- 모든 컴포넌트 파일

