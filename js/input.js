
//초기화 함수
function init() {
  loadNavbar();
  // 초기화코드
  document.getElementById('prompt-form')?.addEventListener('submit', handleSubmit);
}


// DOMContentLoaded 이벤트 시 init 실행
document.addEventListener('DOMContentLoaded', init);


async function handleSubmit(event) {
  event.preventDefault(); // 폼 제출 기본동작 막기
  
  const promptText = document.getElementById('prompt-text').value.trim();
  
  if (!promptText) {
    alert('내용을 입력해주세요');
    return;
  }

  try {
    // 서버에 POST 요청 보내기 
    const response = await fetch('서버주소', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: promptText,
        userLocation: userlocation})
    });

    if (!response.ok) {
      throw new Error('서버 응답 오류: ' + response.status);
    }

    // 서버 응답 성공 시 다음 페이지로 이동
    window.location.href = 'output.html';

  } catch (error) {
    alert('서버 전송 중 오류가 발생했습니다: ' + error.message);
  }
}