function init() {
  loadNavbar();
  // 페이지별 다른 초기화 코드들...
}

document.addEventListener('DOMContentLoaded', init);


// 카카오 지도 초기화 함수
function initMap(startLocation, shoppingCourse) {
    const mapContainer = document.getElementById('map');

   
    const mapOption = {
        center: new kakao.maps.LatLng(startLocation.lat, startLocation.lng), // 지도의 중심좌표
        level: 8 // 지도의 확대 레벨
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    // 마커와 선을 그리기 위한 배열
    const points = [new kakao.maps.LatLng(startLocation.lat, startLocation.lng)];
    
    // 시작 위치 마커
    const startMarker = new kakao.maps.Marker({
        position: points[0],
        map: map,
        title: startLocation.name
    });

    // 마트 위치에 마커와 정보 표시
    shoppingCourse.forEach((course, index) => {
        const martPosition = new kakao.maps.LatLng(course.martLocation.lat, course.martLocation.lng);
        points.push(martPosition);

        const marker = new kakao.maps.Marker({
            position: martPosition,
            map: map,
            title: course.martName
        });
        
        // 인포윈도우에 마트 이름 표시
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

    // 이동 거리 계산 - 배열 points 사이 각 좌표 간 거리 합산
let totalDistance = 0;
for (let i = 0; i < points.length - 1; i++) {
    totalDistance += kakao.maps.geometry.spherical.computeDistanceBetween(points[i], points[i + 1]);
}

// 총 거리(m)를 km 단위로 변환 소수점 2자리까지 표시
const totalDistanceKm = (totalDistance / 1000).toFixed(2);

// 커스텀 오버레이로 지도에 거리 표시
const distanceOverlay = new kakao.maps.CustomOverlay({
    position: points[Math.floor(points.length / 2)], // 경로 중간 지점
    content: `<div style="padding:5px 10px; background:rgba(255,255,255,0.8); border-radius:5px; font-size:14px; font-weight:bold;">
                총 이동 거리: ${totalDistanceKm} km
              </div>`,
    map: map,
    yAnchor: 1
});

}

// 백엔드에서 데이터 받아와서 화면에 표시하는 함수
// async function fetchAndDisplayData() {
//     const backendUrl = 'https://YOUR_AWS_LAMBDA_API_URL.amazonaws.com/prod/shopping-course'; // 백엔드 URL

//     try {
//         const response = await fetch(backendUrl);
//         const data = await response.json(); // 백엔드로부터 받은 JSON 데이터

//         // 1. 총비용 표시
//         const totalCostDiv = document.getElementById('total-cost');
//         totalCostDiv.innerHTML = `<h2>총 예상 비용: ${data.totalCost.toLocaleString()}원</h2>`;

//         // 2. 장보기 코스 컨테이너에 마트별 상품 목록 표시
//         const container = document.getElementById('shopping-course-container');
//         container.innerHTML = ''; // 기존 내용 초기화

//         data.shoppingCourse.forEach(mart => {
//             // 마트별 박스 생성
//             const martBox = document.createElement('div');
//             martBox.className = 'mart-box';

//             // 마트 이름과 총비용
//             martBox.innerHTML = `
//                 <h3>${mart.martName}</h3>
//                 <p>총비용: ${mart.martTotalCost.toLocaleString()}원</p>
//                 <div class="item-list"></div>
//             `;
            
//             const itemListDiv = martBox.querySelector('.item-list');
            
//             // 상품 목록 표시
//             mart.items.forEach(item => {
//                 const itemDiv = document.createElement('div');
//                 itemDiv.className = 'item';
//                 itemDiv.innerHTML = `
//                     <img src="${item.image}" alt="${item.name}">
//                     <p>${item.name}</p>
//                     <p>${item.price.toLocaleString()}원</p>
//                 `;
//                 itemListDiv.appendChild(itemDiv);
//             });

//             container.appendChild(martBox);
//         });
        
//         // 3. 카카오 지도 표시
//         if (data.startLocation && data.shoppingCourse.length > 0) {
//             initMap(data.startLocation, data.shoppingCourse);
//         } else {
//             document.getElementById('map').textContent = '지도 정보를 불러올 수 없습니다.';
//         }

//     } catch (error) {
//         console.error('데이터를 불러오는 중 오류 발생:', error);
//         document.getElementById('shopping-course-container').textContent = '결과를 불러오지 못했습니다.';
//     }
// }


// 이 부분이 중요합니다!
// kakao.maps.load()를 사용하여 API가 로드된 후 코드가 실행되도록 보장합니다.
// document.addEventListener('DOMContentLoaded', function() {
//     // 카카오 지도가 로드되면 콜백 함수를 실행합니다.
//     kakao.maps.load(function() {
//         fetchAndDisplayData();
//     });
// });


//테스트용 데이터와 코드
async function fetchAndDisplayDataMock() {
    // 모의 데이터 예시
    const data = {
        totalCost: 123456,
        startLocation: { lat: 37.5665, lng: 126.9780, name: "서울" },
        shoppingCourse: [
            {
                martName: "마트 A",
                martLocation: { lat: 37.5700, lng: 126.9820 },
                martTotalCost: 65432,
                items: [
                    { name: "사과", price: 3000, image: "images/테스트.jpg" },
                    { name: "바나나", price: 2500, image: "https://via.placeholder.com/50" }
                ]
            },
            {
                martName: "마트 B",
                martLocation: { lat: 37.5710, lng: 126.9830 },
                martTotalCost: 58024,
                items: [
                    { name: "우유", price: 4000, image: "https://via.placeholder.com/50" },
                    { name: "빵", price: 3500, image: "https://via.placeholder.com/50" }
                ]
            }
        ]
    };

    const totalCostDiv = document.getElementById('total-cost');
    totalCostDiv.innerHTML = `<h2>총 예상 비용: ${data.totalCost.toLocaleString()}원</h2>`;

    const container = document.getElementById('shopping-course-container');
    container.innerHTML = '';

    data.shoppingCourse.forEach(mart => {
        const martBox = document.createElement('div');
        martBox.className = 'mart-box';

        martBox.innerHTML = `
            <h3>${mart.martName}</h3>
            <p>총비용: ${mart.martTotalCost.toLocaleString()}원</p>
            <div class="item-list"></div>
        `;

        const itemListDiv = martBox.querySelector('.item-list');

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

        container.appendChild(martBox);
    });

    if (data.startLocation && data.shoppingCourse.length > 0) {
        initMap(data.startLocation, data.shoppingCourse);
    } else {
        document.getElementById('map').textContent = '지도 정보를 불러올 수 없습니다.';
    }
}

// 테스트용 함수로 변경 후 실행
document.addEventListener('DOMContentLoaded', function() {
    kakao.maps.load(function() {
        fetchAndDisplayDataMock();
    });
});

// 페이지 로딩 후 함수 실행
document.addEventListener('DOMContentLoaded', fetchAndDisplayData);