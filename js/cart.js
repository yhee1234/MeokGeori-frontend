// js/cart.js (최종 버전)

// initMap 함수는 cart.js 내부에서만 사용되므로 export 하지 않습니다.
// customComputeDistanceBetween은 main.js로부터 전달받는 하버사인 함수입니다.
function initMap(userLocation, shoppingCourse, customComputeDistanceBetween) { 
    const mapContainer = document.getElementById('map2');

    // map2가 유효한지 먼저 확인합니다.
    if (!mapContainer) {
        console.error("Map2 컨테이너 (id='map2')를 찾을 수 없습니다.");
        return;
    }
   
    const mapOption = {
        center: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude), // 지도의 중심좌표를 userLocation에서 가져옴
        level: 5 // 지도의 확대 레벨 (이전 버전 5)
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커와 선을 그리기 위한 배열
    const points = [new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude)]; // userLocation을 시작점으로 사용
    
    // 시작 위치 마커
    const startMarker = new kakao.maps.Marker({
        position: points[0],
        map: map,
        title: '시작 위치'
    });

    // 시작위치 정보창 표시 (바로 열림)
    const startInfowindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:5px;font-size:12px;">출발 위치</div>'
    });
    startInfowindow.open(map, startMarker);


    // 마트 위치에 마커와 정보 표시
    shoppingCourse.forEach((course, index) => {
        const martPosition = new kakao.maps.LatLng(course.martLocation.lat, course.martLocation.lng);
        points.push(martPosition);

        const marker = new kakao.maps.Marker({
            position: martPosition,
            map: map,
            title: course.martName
        });
        
        // 인포윈도우에 마트 이름 표시 (마우스 오버 시 열리도록 변경)
        const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${index + 1}. ${course.martName}</div>`
        });
        kakao.maps.event.addListener(marker, 'mouseover', () => infowindow.open(map, marker));
        kakao.maps.event.addListener(marker, 'mouseout', () => infowindow.close());
    });
    
    // 경로 선 그리기
    const polyline = new kakao.maps.Polyline({
        path: points,
        strokeWeight: 5,
        strokeColor: '#FF5733',
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
    });
    polyline.setMap(map);

    // 각 구간별 이동 시간 표시 (새로 추가된 로직)
    for (let i = 0; i < points.length - 1; i++) {
        const midLat = (points[i].getLat() + points[i + 1].getLat()) / 2;
        const midLng = (points[i].getLng() + points[i + 1].getLng()) / 2;
        const midPosition = new kakao.maps.LatLng(midLat, midLng);

        // 각 구간 소요 시간 가져오기 (데이터에 travelTime 속성 필요)
        const traveltimeText = shoppingCourse[i]?.travelTime || '시간 정보 없음';

        const customOverlay = new kakao.maps.CustomOverlay({
            position: midPosition,
            content: `<div style="padding:4px 8px; background:rgba(255,255,255,0.9); border-radius:6px; font-size:12px; border:1px solid #ccc;">
                        ${traveltimeText}
                    </div>`,
            map: map,
            yAnchor: 1
        });
    }

    // ⭐ 총 이동 거리 계산 (하버사인 공식 기반 customComputeDistanceBetween 사용) ⭐
    // sphericalGeometry가 로드되지 않는 문제에 대응하기 위함입니다.
    let totalDistance = 0;
    if (customComputeDistanceBetween) { // customComputeDistanceBetween 함수가 유효한지 확인
        for (let i = 0; i < points.length - 1; i++) {
            totalDistance += customComputeDistanceBetween(points[i], points[i + 1]);
        }
        const totalDistanceKm = (totalDistance / 1000).toFixed(2); // KM 단위 변환
        const distanceOverlay = new kakao.maps.CustomOverlay({
            position: points[Math.floor(points.length / 2)],
            content: `<div style="padding:5px 10px; background:rgba(255,255,255,0.8); border-radius:5px; font-size:14px; font-weight:bold;">
                        총 이동 거리: ${totalDistanceKm} km
                      </div>`,
            map: map,
            yAnchor: 1
        });
    } else {
        console.warn("customComputeDistanceBetween 함수가 없어 총 이동 거리를 계산할 수 없습니다.");
    }
}


// ⭐ main.js에서 호출될 initCartService 함수 (customComputeDistanceBetween 인자 받음) ⭐
// sphericalGeometryRef는 customComputeDistanceBetween 함수 자체입니다.
export function initCartService(customComputeDistanceBetweenRef) {
    // 장바구니 총 금액 계산 버튼 관련 기능은 현재 UI에 없으므로 calcTotalBtn 관련 로직은 제거했습니다.
    // 이전 calcTotal 함수도 더 이상 호출되지 않습니다.

    // customComputeDistanceBetween 함수를 내부에서 사용할 수 있도록 저장합니다.
    window._customComputeDistanceBetween = customComputeDistanceBetweenRef;

    
    fetchAndDisplayDataMock(window._customComputeDistanceBetween); 
}

// ⭐ 장보기 서비스 시작 버튼 클릭 시 데이터를 다시 로드하고 지도를 표시하는 함수 ⭐
export function loadShoppingDataAndMap() {
    // initCartService에서 저장한 customComputeDistanceBetween 함수를 사용합니다.
    fetchAndDisplayDataMock(window._customComputeDistanceBetween);
}


// 테스트용 데이터와 코드 (내부 함수로 사용)
// customComputeDistanceBetween를 인자로 받아 initMap에 전달
async function fetchAndDisplayDataMock(customComputeDistanceBetween) {
    // sessionStorage에서 userLocation 가져오기
    const userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
        console.warn("sessionStorage에 사용자 위치 정보가 없어 장보기 지도를 표시할 수 없습니다.");
        const map2Element = document.getElementById('map2');
        if (map2Element) {
            map2Element.textContent = '사용자 위치 정보를 찾을 수 없습니다. 위치 확인을 먼저 진행해주세요.';
        }
        return;
    }

    const storedData = sessionStorage.getItem('recommendationData');
    // if (!storedData) {
    //     alert('추천 데이터가 없습니다. 다시 시도해 주세요.');
    //     return;
    // }
    const data = JSON.parse(storedData);


    const totalCostDiv = document.getElementById('total-cost');
    if(totalCostDiv) totalCostDiv.innerHTML = `<h2>총 예상 비용: ${data.totalCost.toLocaleString()}원</h2>`;

    const container = document.getElementById('shopping-course-container');
    if(container) container.innerHTML = '';

    data.shoppingCourse.forEach(mart => {
        const martBox = document.createElement('div');
        martBox.className = 'mart-box';

        martBox.innerHTML = `
            <h3>${mart.martName}</h3>
            <p>총비용: ${mart.martTotalCost.toLocaleString()}원</p>
            <div class="item-list"></div>
        `;

        const itemListDiv = martBox.querySelector('.item-list');
        if(itemListDiv){
            mart.items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <p>${item.name}</p>
                    <p>${item.price.toLocaleString()}원</p>
                `;
                itemListDiv.appendChild(itemDiv);
            });
        }
        if(container) container.appendChild(martBox);
    });

    if (data.shoppingCourse.length > 0) { // data.startLocation 조건 제거
        initMap(userLocation, data.shoppingCourse, customComputeDistanceBetween); // initMap에 userLocation 및 customComputeDistanceBetween 전달
    } else {
        console.warn("지도 정보를 불러올 수 없습니다. shoppingCourse 데이터 없음.");
        const map2Element = document.getElementById('map2');
        if (map2Element) {
            map2Element.textContent = '추천 장보기 코스 데이터가 없습니다.';
        }
    }
}