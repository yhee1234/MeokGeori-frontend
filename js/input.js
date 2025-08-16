function init() {
  loadNavbar();
  // 페이지별 다른 초기화 코드들...
  document.getElementById('prompt-form')?.addEventListener('submit', handleSubmit);
}

document.addEventListener('DOMContentLoaded', init);



// OpenAI API 요청 및 결과 처리 함수
async function handleSubmit(event) {
  event.preventDefault();
  const prompt = document.getElementById('prompt-text').value.trim();
  if (!prompt) {
    alert('프롬프트를 입력하세요!');
    return;
  }
  const resultDiv = document.getElementById('result');
  resultDiv.textContent = '결과를 불러오는 중...';

  const apiKey = 'OPENAI_API_KEY'; // 실제 API 키로 교체 필요

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      resultDiv.textContent = data.choices[0].message.content;
    } else {
      resultDiv.textContent = 'API 응답 오류: 결과가 없습니다.';
    }
  } catch (error) {
    resultDiv.textContent = 'API 호출 실패: ' + error.message;
  }
}

// 초기화 함수
function init() {
  loadNavbar();
  document.getElementById('prompt-form').addEventListener('submit', handleSubmit);
}

// DOMContentLoaded 이벤트 시 init 실행
document.addEventListener('DOMContentLoaded', init);
