// js/utils.js (최종 버전)

// 섹션으로 스크롤 이동
export function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 지도 이벤트 리스너 추가 (Kakao Map 객체를 인자로 받음)
// 이 함수는 map 객체가 생성된 후에 한 번만 호출되어야 합니다.
export function addMapEventListener(map, geocoder, statusMessage, setMapCenterBtn) { // 사용되지 않는 setPositionOnMapCallback 제거
    if (!map) return;
    
    // 맵 중심이 변경될 때 (지도를 드래그하여 움직일 때)
    kakao.maps.event.addListener(map, 'center_changed', function() {
        const latlng = map.getCenter();
        if (geocoder && statusMessage) { // geocoder와 statusMessage가 존재하는지 확인
            geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function(result, status) {
                if (status === kakao.maps.services.Status.OK && result[0]) {
                    const detailAddr = result[0].road_address ? result[0].road_address.address_name : result[0].address.address_name;
                    statusMessage.innerHTML = `지도의 중심: ${detailAddr}<br>(위치로 설정하려면 아래 버튼 클릭)`;
                    statusMessage.className = 'status-message message-default';
                    if (setMapCenterBtn) setMapCenterBtn.style.display = 'inline-block'; // 버튼 보이기
                } else {
                    statusMessage.textContent = '지도의 중심 주소를 찾을 수 없습니다.';
                    statusMessage.className = 'status-message message-error';
                    if (setMapCenterBtn) setMapCenterBtn.style.display = 'inline-block'; // 버튼 보이기
                }
            });
        }
    });

    // 지도 확대/축소 종료 시
    kakao.maps.event.addListener(map, 'zoom_changed', function() {
        const level = map.getLevel();
        console.log(`지도 확대/축소 레벨 변경: ${level}`);
    });

    // 지도가 로드된 직후 relayout 호출 (타일이 제대로 보이도록)
    kakao.maps.event.addListener(map, 'tilesloaded', function() {
        if (map) {
           map.relayout();
           console.log('Map relayout triggered after tilesloaded event.');
           // mapContainer의 배경색은 이미 투명으로 설정됨
        }
    });
}