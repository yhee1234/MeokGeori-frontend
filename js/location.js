// js/location.js (최종 버전)

import * as Utils from './utils.js';

// UI 요소 변수는 이 모듈 내에서 관리
let getLocationBtn = null;
let startButton = null;
let statusMessage = null;
let mapContainer = null;
let addressInput = null;
let searchAddressBtn = null;
let setMapCenterBtn = null;
let searchResultList = null;
let pagination = null;
let searchResultWrapper = null; // 검색 결과 래퍼 추가

let map = null;
let marker = null;
// geocoder, places는 이제 main.js에서 인자로 받아서 사용합니다.
let geocoder = null;
let places = null; 
// currentPosition 변수는 이 모듈 내에서 관리 (다른 모듈에서는 sessionStorage를 통해 접근)
let currentPosition = null; 


// initLocationService 함수가 startButton, geocoder, places를 인자로 받도록 수정
export function initLocationService(startButtonRef, geocoderRef, placesRef) {
    startButton = startButtonRef;
    geocoder = geocoderRef; // 인자로 받은 geocoder 할당
    places = placesRef;     // 인자로 받은 places 할당

    // 1. DOM 요소들을 찾아서 변수에 할당
    getLocationBtn = document.getElementById('getLocationBtn');
    statusMessage = document.getElementById('statusMessage');
    mapContainer = document.getElementById('map');
    addressInput = document.getElementById('addressInput');
    searchAddressBtn = document.getElementById('searchAddressBtn');
    setMapCenterBtn = document.getElementById('setMapCenterBtn');
    searchResultList = document.getElementById('searchResultList');
    pagination = document.getElementById('pagination');
    searchResultWrapper = document.getElementById('searchResultWrapper'); // 검색 결과 래퍼 요소 찾기

    // 필수 요소 존재 확인 (방어 코드)
    if (!statusMessage || !mapContainer || !getLocationBtn || !startButton || !searchResultWrapper) {
        console.error("Location Service: 필수 DOM 요소를 찾을 수 없습니다. HTML 구조를 확인하세요.");
        return;
    }

    // 2. 초기 UI 설정
    statusMessage.textContent = '위치 확인을 시작하려면 버튼을 누르세요.';
    statusMessage.className = 'status-message';
    startButton.disabled = true; // 버튼 초기 비활성화

    // 지도 컨테이너의 텍스트를 설정 (지도가 로드되기 전 메시지)
    mapContainer.innerHTML = '지도가 여기에 표시됩니다.';

    // 검색 결과 래퍼 초기에는 숨기기
    searchResultWrapper.classList.remove('active');

    // Kakao Maps API 객체 생성 로직 제거! 이제 main.js에서 객체를 생성하여 전달받습니다.
    if (!geocoder || !places) {
        console.error("Location Service: geocoder 또는 places 객체가 제대로 전달되지 않았습니다. main.js 초기화 확인 필요.");
        statusMessage.textContent = '지도 서비스 초기화 오류.';
        statusMessage.className = 'status-message message-error';
        getLocationBtn.disabled = true;
        startButton.disabled = true;
        if (addressInput) addressInput.disabled = true;
        if (searchAddressBtn) searchAddressBtn.disabled = true;
        if (setMapCenterBtn) setMapCenterBtn.disabled = true;
        return;
    } else {
        console.log("Location Service: Geocoder, Places 객체 준비 완료.");
        statusMessage.textContent = '서비스 준비 완료! \'내 현재 위치 찾기\' 버튼을 누르세요.';
        statusMessage.className = 'status-message message-success';
    }
    
    // 4. 이벤트 리스너 등록
    getLocationBtn.addEventListener('click', handleGetLocation);
    if (searchAddressBtn && addressInput) {
        searchAddressBtn.addEventListener('click', handleSearchAddress);
    }
    if (setMapCenterBtn) {
        setMapCenterBtn.addEventListener('click', handleSetMapCenter);
    }

    // 페이지 로드 시 sessionStorage에 저장된 위치 정보가 있다면 불러와서 지도에 표시
    const storedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    if (storedLocation && storedLocation.latitude && storedLocation.longitude) {
        currentPosition = storedLocation; // currentPosition 업데이트
        setPositionOnMap(currentPosition.latitude, currentPosition.longitude, '이전에 저장된 위치');
    }
}

// --- 이벤트 핸들러 함수들 ---

export function handleGetLocation() {
    console.log("handleGetLocation: 위치 정보 요청 시작.");
    if (!navigator.geolocation) {
        statusMessage.textContent = '현재 브라우저에서는 위치 정보를 지원하지 않습니다.';
        statusMessage.className = 'status-message message-error';
        startButton.disabled = true;
        return;
    }
    if (!geocoder) {
        statusMessage.textContent = '위치 서비스가 아직 준비되지 않았습니다.';
        statusMessage.className = 'status-message message-error';
        console.error("Geocoder 객체가 아직 초기화되지 않았습니다.");
        return;
    }

    statusMessage.textContent = '위치 정보를 가져오는 중입니다...';
    statusMessage.className = 'status-message message-loading';
    startButton.disabled = true;
    // 지도 타일 사라지는 문제 해결: mapContainer.innerHTML = ''; 이 줄 제거
    // 이전 팀원 코드에서 이 부분이 다시 추가되었기에, 다시 한번 제거합니다.

    // 검색 결과 래퍼 숨기기 (새로운 검색 시작 시)
    searchResultWrapper.classList.remove('active');

    navigator.geolocation.getCurrentPosition(
        function (position) {
            console.log("Geolocation 성공.");
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            currentPosition = { latitude: lat, longitude: lng }; // currentPosition 업데이트
            sessionStorage.setItem('userLocation', JSON.stringify(currentPosition)); // sessionStorage에 위치 저장
            setPositionOnMap(lat, lng, '현재 위치 (Geolocation)');
        },
        function (error) {
            console.error("Geolocation 실패:", error);
            statusMessage.className = 'status-message message-error';
            startButton.disabled = true;
            let errorMessage = '';
            switch (error.code) {
                case error.PERMISSION_DENIED: errorMessage = '사용자가 위치 정보 사용을 거부했습니다. 브라우저 설정에서 위치 권한을 허용하세요.'; break;
                case error.POSITION_UNAVAILABLE: errorMessage = '위치 정보를 사용할 수 없습니다. 장치의 위치 서비스가 켜져 있는지 확인하세요.'; break;
                case error.TIMEOUT: errorMessage = '위치 정보 가져오기 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도하세요.'; break;
                default: errorMessage = '알 수 없는 오류가 발생했습니다.'; break;
            }
            statusMessage.textContent = `위치 확인 실패: ${errorMessage}`;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

export function handleSearchAddress() {
    const query = addressInput.value.trim();
    if (!query) {
        statusMessage.textContent = '검색할 주소 또는 장소 이름을 입력해주세요.';
        statusMessage.className = 'status-message message-error';
        // 검색어 없으면 결과창 숨기기
        searchResultWrapper.classList.remove('active');
        return;
    }
    if (!places) {
        statusMessage.textContent = '위치 검색 서비스가 아직 준비되지 않았습니다.';
        statusMessage.className = 'status-message message-error';
        return;
    }

    statusMessage.textContent = `"${query}" 검색 중...`;
    statusMessage.className = 'status-message message-loading';
    startButton.disabled = true;

    // 검색 시작 시 결과창 보이도록
    searchResultWrapper.classList.add('active');

    places.keywordSearch(query, placesSearchCB, { size: 10 });
}

function placesSearchCB(data, status, paginationInfo) {
    if (!searchResultList || !pagination) return;
    searchResultList.innerHTML = '';
    pagination.innerHTML = '';

    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(paginationInfo);
        statusMessage.textContent = `"${addressInput.value.trim()}" 검색 결과 ${data.length}개 발견.`;
        statusMessage.className = 'status-message message-success';
        startButton.disabled = false;

        if (data.length > 0) {
            const firstPlace = data[0];
            currentPosition = { latitude: firstPlace.y, longitude: firstPlace.x }; // currentPosition 업데이트
            sessionStorage.setItem('userLocation', JSON.stringify(currentPosition)); // sessionStorage에 위치 저장
            setPositionOnMap(firstPlace.y, firstPlace.x, `검색 결과 (${firstPlace.place_name})`);
        } else {
             // 검색 결과가 없으면 결과창 다시 숨기기
            searchResultWrapper.classList.remove('active');
        }

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        statusMessage.textContent = `"${addressInput.value.trim()}"에 대한 검색 결과가 없습니다.`;
        statusMessage.className = 'status-message message-error';
        startButton.disabled = true;
        searchResultList.innerHTML = '<li style="padding: 10px; color: var(--color-text-light);">검색 결과가 없습니다.</li>';
        // 검색 결과가 없으면 결과창 숨기기
        searchResultWrapper.classList.remove('active');

    } else {
        statusMessage.textContent = '장소 검색 중 오류가 발생했습니다.';
        statusMessage.className = 'status-message message-error';
        startButton.disabled = true;
        console.error('장소 검색 오류:', status);
        // 오류 발생 시 결과창 숨기기
        searchResultWrapper.classList.remove('active');
    }
}

function displayPlaces(placesData) {
    if (!searchResultList) return;
    placesData.forEach(place => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${place.place_name}</strong><br>
            <span>${place.address_name || place.road_address_name || ''}</span>
        `;
        listItem.addEventListener('click', () => {
            currentPosition = { latitude: place.y, longitude: place.x }; // currentPosition 업데이트
            sessionStorage.setItem('userLocation', JSON.stringify(currentPosition)); // sessionStorage에 위치 저장
            setPositionOnMap(place.y, place.x, `선택: ${place.place_name}`);
            searchResultList.innerHTML = '';
            pagination.innerHTML = '';
            addressInput.value = place.place_name;
            // 검색 결과 리스트 항목 선택 후 결과창 숨기기 (깔끔한 UI)
            searchResultWrapper.classList.remove('active');
        });
        searchResultList.appendChild(listItem);
    });
}

function displayPagination(paginationInfo) {
    if (!pagination) return;
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= paginationInfo.last; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (paginationInfo.current === i) {
            pageLink.classList.add('on');
        }
        pageLink.onclick = (e) => {
            e.preventDefault();
            paginationInfo.gotoPage(i);
        };
        fragment.appendChild(pageLink);
    }
    pagination.appendChild(fragment);
}

export function handleSetMapCenter() {
    // navigator.geolocation을 사용하는 것이 아닌, map.getCenter()를 사용합니다.
    // Geolocation 호출 로직은 여기서는 불필요합니다.
    if (!map) {
        statusMessage.textContent = '지도를 초기화해주세요.';
        statusMessage.className = 'status-message message-error';
        startButton.disabled = true;
        return;
    }

    const center = map.getCenter();
    const lat = center.getLat();
    const lng = center.getLng();
    currentPosition = { latitude: lat, longitude: lng }; // currentPosition 업데이트
    sessionStorage.setItem('userLocation', JSON.stringify(currentPosition)); // sessionStorage에 위치 저장
    
    setPositionOnMap(lat, lng, '지도 중심');
    if (setMapCenterBtn) setMapCenterBtn.style.display = 'none'; // 버튼 숨기기
    
    statusMessage.className = 'status-message message-success';
    statusMessage.textContent = '지도 중심이 현재 위치로 설정되었습니다.';
    startButton.disabled = false;
}

// --- 유틸리티 함수들 ---

// 공통: 위치를 지도에 표시하고 상태 메시지를 업데이트하는 함수
function setPositionOnMap(lat, lng, sourceText) {
    const locPosition = new kakao.maps.LatLng(lat, lng);

    if (map === null) {
        map = new kakao.maps.Map(mapContainer, {
            center: locPosition,
            level: 3,
        });
        // Geocoder와 statusMessage는 이미 initLocationService에서 유효한 객체로 설정됩니다.
        Utils.addMapEventListener(map, geocoder, statusMessage, setMapCenterBtn);
    } else {
        map.setCenter(locPosition);
        map.setLevel(3);
    }
    if (map) {
        map.relayout();
        mapContainer.style.backgroundColor = 'transparent';
    }

    if (marker === null) {
        marker = new kakao.maps.Marker({
            position: locPosition,
            map: map,
        });
    } else {
        marker.setPosition(locPosition);
        marker.setMap(map);
    }
    
    // lat, lng가 유효한 숫자인지 확인 (toFixed 오류 방지)
    const displayLat = typeof lat === 'number' ? lat.toFixed(6) : 'N/A';
    const displayLng = typeof lng === 'number' ? lng.toFixed(6) : 'N/A';

    geocoder.coord2Address(locPosition.getLng(), locPosition.getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK && result[0]) {
            const detailAddr = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
            statusMessage.innerHTML = `
                현재 위치: ${detailAddr}<br>
                (위도: ${displayLat}, 경도: ${displayLng})<br>
                설정됨: ${sourceText}
            `;
            statusMessage.className = 'status-message message-success';
            startButton.disabled = false;
        } else {
            statusMessage.innerHTML = `
                주소 정보를 가져올 수 없습니다.<br>
                (위도: ${displayLat}, 경도: ${displayLng})<br>
                설정됨: ${statusMessage.textContent.replace(/(^.*<br>\s*|\s*<br>.*$)/g, '') || sourceText} 
            `;
            statusMessage.className = 'status-message message-error';
            startButton.disabled = false;
        }
    });
}