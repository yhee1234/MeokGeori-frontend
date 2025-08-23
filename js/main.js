// js/main.js (최종 버전)

import { loadNavbar } from './navbarLoader.js'; // Navbar 로더 임포트
import * as LocationService from './location.js'; // 위치 서비스 임포트
import * as CartService from './cart.js'; // 장바구니 서비스 임포트
import * as AiChatService from './ai_chat.js'; // AI 채팅 서비스 임포트
import * as Utils from './utils.js'; // 유틸리티 함수 임포트

document.addEventListener('DOMContentLoaded', init);

// ----------------------------------------------------------------------
// 초기화 함수: 페이지 로드 후 실행될 모든 초기 설정 및 이벤트 리스너 등록
// ----------------------------------------------------------------------
async function init() {
    console.log("init() 함수 실행 시작.");

    // 1. 네비게이션 바 로드 및 이벤트 리스너 설정
    // loadNavbar() 호출 시 placeholderId 인자는 제거되었습니다.
    await loadNavbar('partials/navbar.html');
    
    const navbarToggleBtn = document.querySelector('.navbar__toggleBtn');
    const navbarMenu = document.querySelector('.navbar__menu');

    if (navbarToggleBtn && navbarMenu) {
        navbarToggleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            navbarMenu.classList.toggle('active');
            console.log("햄버거 버튼 클릭됨! 메뉴 active 클래스 토글!");
            console.log("현재 navbarMenu 클래스 리스트:", navbarMenu.classList);
        });
    } else {
        console.error("오류: 네비게이션 토글 버튼 또는 메뉴 요소를 찾을 수 없습니다. HTML 구조 또는 navbarLoader.js 실행 확인 필요.");
    }

    // startButton 요소를 찾습니다.
    const startButton = document.getElementById('startButton');
    if (!startButton) {
        console.error("오류: '장보기 서비스 시작하기' 버튼 (id='startButton') 요소를 찾을 수 없습니다. HTML 또는 id 확인 필요.");
    }
    
    // ⭐ Kakao Maps API 로드가 완료된 후에 모든 지도 의존 서비스들을 초기화합니다. ⭐
    // 이젠 location.js와 cart.js 내부에서는 kakao.maps.load 호출이 없습니다.
    if (typeof kakao !== 'undefined' && kakao.maps && kakao.maps.load) {
        kakao.maps.load(function() {
            console.log("⭐ Kakao Maps API 모든 라이브러리 로드 및 준비 완료 ⭐");

            // ⭐ 하버사인 공식 기반의 커스텀 거리 계산 함수 정의 ⭐
            // Kakao Maps API의 geometry.spherical.computeDistanceBetween 함수를 대체합니다.
            // sphericalGeometry가 로드되지 않는 문제에 대응하기 위함입니다.
            const customComputeDistanceBetween = (latlng1, latlng2) => {
                const R = 6371e3; // metres, 지구의 평균 반지름 (m)
                const lat1 = latlng1.getLat() * Math.PI / 180; // φ1, 라디안 변환
                const lat2 = latlng2.getLat() * Math.PI / 180; // φ2, 라디안 변환
                const deltaLat = (lat2 - lat1); // Δφ
                const deltaLng = (latlng2.getLng() - latlng1.getLng()) * Math.PI / 180; // Δλ

                const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                          Math.cos(lat1) * Math.cos(lat2) *
                          Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                const d = R * c; // 미터 단위의 거리
                return d;
            };

            // 필요한 Kakao Maps 객체들을 전역 'kakao.maps'에서 직접 참조하여 생성합니다.
            const geocoder = new kakao.maps.services.Geocoder();
            const places = new kakao.maps.services.Places();
            
            // 지도에 의존하는 서비스들을 여기서 초기화합니다.
            // Kakao Maps 객체들과 커스텀 거리 계산 함수를 인자로 전달합니다.
            LocationService.initLocationService(startButton, geocoder, places);
            // CartService에 customComputeDistanceBetween 함수를 전달합니다.
            CartService.initCartService(customComputeDistanceBetween);
            
            // AiChatService는 지도에 직접 의존하지 않으므로, 지도 로드와 별개로도 가능하지만, 여기서 함께 호출하여 초기화 흐름을 일관되게 관리합니다.
            AiChatService.initAiChatService();

        }, {
            // geometry 라이브러리는 하버사인 공식으로 대체되므로 사실상 필요 없으나,
            // Kakao Maps API 특성상 모든 services 라이브러리가 명시되어야 할 수 있어 유지합니다.
            libraries: ['services', 'clusterer', 'drawing', 'geometry'] 
        });
    } else {
        console.error("Kakao Maps API 로드 객체를 찾을 수 없거나 kakao.maps.load 함수가 없습니다. 지도 서비스 초기화 실패.");
        // 지도 서비스 없이 초기화할 다른 컴포넌트들을 여기에 배치할 수 있습니다.
        AiChatService.initAiChatService(); // 지도를 사용하지 않는 서비스는 여기서 초기화
    }

    // 3. 메인 페이지 이벤트 리스너 등록 (섹션 스크롤 등)
    const scrollToLocationBtn = document.getElementById('scrollToLocationBtn');
    if (scrollToLocationBtn) {
        scrollToLocationBtn.addEventListener('click', () => {
            Utils.scrollToSection('location-service');
            console.log("'위치 찾기 시작하기' 버튼 클릭됨.");
        });
    } else {
        console.error("오류: '위치 찾기 시작하기' 버튼 (id='scrollToLocationBtn')을 찾을 수 없습니다. HTML 확인 필요.");
    }

    // 네비게이션 메뉴 클릭 시 부드러운 스크롤
    const navLinks = document.querySelectorAll('.navbar__menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            const targetId = this.getAttribute('href').substring(1); // # 제거
            if (targetId) {
                Utils.scrollToSection(targetId);
            }

            // 모바일 메뉴 열려있으면 닫기
            if (navbarMenu && navbarMenu.classList.contains('active')) {
                navbarMenu.classList.remove('active');
            }
            console.log("네비게이션 메뉴 항목 클릭됨:", targetId);
        });
    });

    // '장보기 서비스 시작하기' 버튼 클릭 시 다음 섹션으로 스크롤 및 장보기 지도 로드
    if (startButton) {
        startButton.addEventListener('click', () => {
            console.log("서비스 시작 버튼 클릭됨. 사용자 입력 페이지로 스크롤합니다.");
            Utils.scrollToSection('ai-guide');
            // ⭐ CartService에서 장보기 데이터를 로드하고 지도를 표시하는 함수 호출 ⭐
            CartService.loadShoppingDataAndMap(); 
        });
    }

    console.log("init() 함수 실행 완료.");
}

// checkKakaoGeometryLoaded 헬퍼 함수는 하버사인 공식 사용으로 더 이상 필요 없으므로 제거합니다.