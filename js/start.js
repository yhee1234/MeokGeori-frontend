function init() {
  loadNavbar();
  // 페이지별 다른 초기화 코드들...
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function () {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const startButton = document.getElementById('startButton');
    const statusMessage = document.getElementById('statusMessage');
    const mapContainer = document.getElementById('map');

    let map = null; // 카카오 지도 객체
    let marker = null; // 위치 표시 마커
    let geocoder = null; // Geocoder 객체
    
    // 페이지 로드 시 초기 메시지 설정
    statusMessage.textContent = '위치 확인을 시작하려면 \'내 위치 확인하기\' 버튼을 누르세요.';
    statusMessage.className = 'message-default'; 
    startButton.disabled = true; // 시작 버튼 초기 비활성화

    // 지도 영역에 초기 텍스트 표시
    mapContainer.innerHTML = '지도가 여기에 표시됩니다.';
    mapContainer.style.backgroundColor = '#e9ecef'; // 초기 배경색 유지

    // ⭐⭐ 카카오 지도 API 로드 및 초기화 로직 ⭐⭐
    // API의 모든 컴포넌트(map, services)가 로드 완료된 후에 지도/Geocoder 객체를 생성합니다.
    if (typeof kakao !== 'undefined' && kakao.maps && kakao.maps.load) {
        kakao.maps.load(function() {
            geocoder = new kakao.maps.services.Geocoder();
            console.log("Kakao Maps API 및 Geocoder 객체 생성 완료.");
            
            statusMessage.textContent = '서비스 준비 완료! \'내 위치 확인하기\' 버튼을 눌러 위치를 찾으세요.';
            statusMessage.className = 'message-success';
            
        }, { 
            libraries: ['services'] 
        });
    } else {
        console.error("Kakao Maps API 로드 객체를 찾을 수 없거나 kakao.maps.load 함수가 없습니다. API 스크립트 로드에 문제가 있을 수 있습니다.");
        statusMessage.textContent = '지도 서비스 로드에 실패했습니다. API 키 또는 네트워크를 확인하세요.';
        statusMessage.className = 'message-error';
        getLocationBtn.disabled = true; 
        startButton.disabled = true;
        return;
    }

    // '내 위치 확인하기' 버튼 클릭 이벤트 리스너
    getLocationBtn.addEventListener('click', function () {
        console.log("getLocationBtn 클릭됨. 위치 정보 요청 시작.");

        if (!navigator.geolocation) {
            statusMessage.textContent = '현재 브라우저에서는 위치 정보를 지원하지 않습니다.';
            statusMessage.className = 'message-error';
            startButton.disabled = true;
            return;
        }
        
        if (!geocoder) { 
            statusMessage.textContent = '위치 서비스가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.';
            statusMessage.className = 'message-error';
            console.error("Geocoder 객체가 아직 초기화되지 않았습니다. Kakao API 로드 문제.");
            return;
        }

        statusMessage.textContent = '위치 정보를 가져오는 중입니다...';
        statusMessage.className = 'message-loading';
        startButton.disabled = true; 

        mapContainer.innerHTML = '위치 확인 중, 지도 로딩 대기...'; // 로딩 메시지
        mapContainer.style.backgroundColor = '#e9ecef'; 


        navigator.geolocation.getCurrentPosition(
            function (position) { 
                console.log("getCurrentPosition 성공 콜백 진입.");

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                console.log(`Geolocation 성공: 위도 ${lat}, 경도 ${lng}`);
                
                const locPosition = new kakao.maps.LatLng(lat, lng);
                if (map === null) { 
                    map = new kakao.maps.Map(mapContainer, {
                        center: locPosition, 
                        level: 3, 
                    });
                    console.log('새로운 카카오 지도가 생성되었습니다.');

                    // 지도가 생성된 직후, 그리고 타일 로드 완료 시점에 relayout 호출 (가장 안정적)
                    kakao.maps.event.addListener(map, 'tilesloaded', function() {
                        if (map) {
                           map.relayout();
                           console.log('Map relayout triggered after tilesloaded event.');
                           // ⭐⭐⭐ 문제 해결: 맵 로딩 후 메시지만 제거하고 innerHTML 비우지 않음 ⭐⭐⭐
                           mapContainer.style.backgroundColor = 'transparent'; // 배경색 투명화
                           console.log('mapContainer 배경 투명화 완료.');
                        }
                    });

                } else { 
                    map.setCenter(locPosition);
                    map.setLevel(3); 
                    if (map) {
                        map.relayout(); 
                        console.log('Existing map center moved and relayout triggered.');
                        // ⭐⭐⭐ 문제 해결: 맵 로딩 후 메시지만 제거하고 innerHTML 비우지 않음 ⭐⭐⭐
                        mapContainer.style.backgroundColor = 'transparent'; // 배경색 투명화
                        console.log('mapContainer 배경 투명화 완료.');
                    }
                }
                
                // 마커 생성 또는 이동
                if (marker === null) {
                    marker = new kakao.maps.Marker({
                        position: locPosition, 
                        map: map, 
                    });
                    console.log('새로운 마커가 추가되었습니다.');
                } else {
                    marker.setPosition(locPosition); 
                    marker.setMap(map); 
                    console.log('기존 마커 위치가 업데이트되었습니다.');
                }
                

                // 좌표를 주소로 변환하는 역지오코딩 요청
                geocoder.coord2Address(lng, lat, function(result, status) {
                    // mapContainer.style.backgroundColor는 tilesloaded 이벤트에서 처리됩니다.

                    if (status === kakao.maps.services.Status.OK && result[0]) {
                        const address = result[0].address ? result[0].address.address_name : '주소 정보 없음';
                        
                        statusMessage.innerHTML = `
                            현재 위치: ${address}<br> (위도: ${lat.toFixed(2)}, 경도: ${lng.toFixed(2)})
                        `;
                        statusMessage.className = 'message-success';
                        startButton.disabled = false; 
                        console.log('역지오코딩 성공:', address);

                    } else {
                        statusMessage.innerHTML = `
                            현재 위치: 주소 정보를 가져오지 못했습니다.<br> (위도: ${lat.toFixed(2)}, 경도: ${lng.toFixed(2)})
                        `;
                        statusMessage.className = 'message-error';
                        startButton.disabled = false; 
                        console.error('역지오코딩 실패. Kakao API 상태:', status);
                    }
                });
            },
            function (error) { 
                console.log("getCurrentPosition 실패 콜백 진입.");

                let message = '위치 정보를 가져오는데 실패했습니다.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = '사용자가 위치 정보 사용을 거부했습니다. 브라우저 설정에서 위치 권한을 허용하세요.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = '위치 정보를 사용할 수 없습니다. 장치의 위치 서비스가 켜져 있는지 확인하세요.';
                        break;
                    case error.TIMEOUT:
                        message = '위치 정보를 가져오는 시간이 초과되었습니다. 네트워크 연결 상태를 확인하고 다시 시도하세요.';
                        break;
                    default:
                        message = '알 수 없는 오류가 발생했습니다.';
                        break;
                }
                statusMessage.textContent = message;
                statusMessage.className = 'message-error';
                startButton.disabled = true; 
                mapContainer.innerHTML = '위치 정보 로딩 실패.'; 
                mapContainer.style.backgroundColor = '#f8d7da'; 
                console.error('Geolocation 실패:', error.code, message);
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,             
                maximumAge: 0,             
            }
        );
    });

    // '서비스 시작하기' 버튼 클릭 시 동작 
    startButton.addEventListener('click', function () {
        console.log("서비스 시작하기 버튼 클릭 시도됨.");
        if (!startButton.disabled) { 
            alert('서비스가 시작되었습니다! 이제 다음 기능 구현을 준비하세요.');
            console.log('서비스 시작 버튼이 클릭되었습니다.');
        } else {
            console.log("버튼이 disabled 상태라 클릭 이벤트가 동작하지 않았습니다.");
        }
    });
});