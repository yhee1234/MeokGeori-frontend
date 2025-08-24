// js/ai_chat.js (최종 버전)

// LocationService를 import할 필요 없음 (sessionStorage 사용)
// import * as LocationService from './location.js';

// init 함수를 export 하여 main.js에서 호출할 수 있도록 수정
export function initAiChatService() { 
  document.getElementById('prompt-form')?.addEventListener('submit', handleSubmit);
}

// DOMContentLoaded 이벤트 시 init 실행 (main.js에서 호출하므로 여기서는 제거)
// document.addEventListener('DOMContentLoaded', init); 


async function handleSubmit(event) {
  event.preventDefault(); // 폼 제출 기본동작 막기
  
  const promptInput = document.getElementById('prompt-text'); // input 요소 찾기
  const promptText = promptInput ? promptInput.value.trim() : ''; // 값 가져오기
  
  if (!promptText) {
    alert('내용을 입력해주세요');
    return;
  }

  // sessionStorage에서 위치 가져오기 (js/location.js에서 저장해야 함)
  const userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
  if (!userLocation) {
      alert('사용자 위치 정보가 없습니다. 위치 확인을 먼저 진행해주세요.');
      console.warn('userLocation이 sessionStorage에 없습니다.');
      return;
  }

  // AI 응답을 표시할 div (현재는 리다이렉션되므로 사용하지 않음)
  // const resultDiv = document.getElementById('result');
  // if (resultDiv) resultDiv.textContent = 'AI 응답 대기 중...';


  try {

    // ⭐ 서버에 POST 요청 보내기 - 실제 서버 주소로 변경 필요 ⭐
    const response = await fetch('http://43.200.245.28:8080/api/recommend/course', { // ⭐ 서버 주소 설정 필요 ⭐
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: promptText,
        userLocation: userLocation // userLocation 데이터를 백엔드로 전송
      })
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류: ' + response.status);
    }

    const apiData = await response.json(); // 서버 응답 성공 시 JSON 데이터 파싱
    

    //응답 데이터 변환
    const data = {
      totalCost: apiData.totalCost,
      shoppingCourse: apiData.shoppingCourse.map(sc => ({
        martName: sc.storeName,
        martLocation: {
          lat: sc.storeLocation.latitude,
          lng: sc.storeLocation.longitude
        },
        martTotalCost: sc.storeTotalCost,
        items: sc.items.map(it => ({
          name: it.name,
          price: it.price,
          image: it.imageUrl
        }))
      }))
    };

    sessionStorage.setItem('recommendationData', JSON.stringify(data));

    // AI 응답을 화면에 직접 표시하지 않고 장바구니 섹션으로 이동 (팀원분의 의도 반영)
    console.log('AI 응답:', data); // 콘솔에 응답 출력
    window.location.href = '#cart-list'; // 장바구니 섹션으로 스크롤

    // 만약 AI 응답을 화면에 표시해야 한다면 아래 코드 활용
    // if (resultDiv && data.message) {
    //     resultDiv.textContent = data.message;
    // } else if (resultDiv) {
    //     resultDiv.textContent = JSON.stringify(data, null, 2);
    // }
    
  } catch (error) {
    alert('서버 전송 중 오류가 발생했습니다: ' + error.message);
    console.error('서버 전송 중 오류:', error);
    // if (resultDiv) resultDiv.textContent = '오류: ' + error.message; // 오류 메시지 표시
  }
}