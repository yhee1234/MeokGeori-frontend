function init() {
  loadNavbar();
  // 페이지별 다른 초기화 코드들...
  document.getElementById('prompt-form')?.addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('DOMContentLoaded', function() {
  // 총 금액 계산
  function calcTotal() {
    let total = 0;
    document.querySelectorAll('.price').forEach(price => {
      total += parseInt(price.textContent, 10);
    });
    const totalPriceEl = document.getElementById('totalPrice');
    if (totalPriceEl) totalPriceEl.textContent = total.toLocaleString();
  }
  calcTotal();

  // Kakao 지도 표시
  var mapContainer = document.getElementById('map');
  if (!mapContainer) return; // map 요소가 없으면 종료

  var mapOption = {
    center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 중심좌표
    level: 5
  };

  var map = new kakao.maps.Map(mapContainer, mapOption);

  // 사용자 위치 마커
  var userMarker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.5665, 126.9780)
  });
  userMarker.setMap(map);

  // 마트 위치 마커 (예시)
  var martMarker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(37.5700, 126.9820)
  });
  martMarker.setMap(map);

  // 경로 라인
  var linePath = [
    new kakao.maps.LatLng(37.5665, 126.9780),
    new kakao.maps.LatLng(37.5700, 126.9820)
  ];
  var polyline = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 4,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8
  });
  polyline.setMap(map);
});
