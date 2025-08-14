document.addEventListener('DOMContentLoaded', () => {
    const getLocationBtn = document.getElementById('getLocationBtn');
    const statusMessageDiv = document.getElementById('statusMessage'); // 메시지 표시 div
    const startButton = document.getElementById('startButton'); // 시작하기 버튼

    // 초기 상태 메시지 설정
    statusMessageDiv.innerHTML = '<p>"내 위치 확인하기" 버튼을 눌러 위치를 설정해주세요.</p>';
    startButton.disabled = true; // 시작하기 버튼 비활성화

    if (getLocationBtn && statusMessageDiv && startButton) {
        getLocationBtn.addEventListener('click', () => {
            // 버튼 클릭 시 초기화
            statusMessageDiv.innerHTML = '<p>위치 정보를 가져오는 중입니다...</p>';
            statusMessageDiv.classList.remove('info-message', 'error-message');
            startButton.disabled = true; // 새 요청 시 시작하기 버튼 비활성화

            // Geolocation API 지원 여부 확인
            if (navigator.geolocation) {
                // 현재 위치 가져오기
                navigator.geolocation.getCurrentPosition(
                    (position) => { // 위치를 성공적으로 가져왔을 때 실행될 함수
                        const latitude = position.coords.latitude;    // 위도
                        const longitude = position.coords.longitude;  // 경도
                        
                        // ⭐⭐ 위도/경도를 소수점 둘째 자리까지 포맷 ⭐⭐
                        const formattedLatitude = latitude.toFixed(2);
                        const formattedLongitude = longitude.toFixed(2);
                        
                        // ⭐⭐ 성공 메시지 내용 변경: 위도와 경도만 표시 ⭐⭐
                        const successMessage = `
                            <p><b>✨ 현재 위치:</b> 위도 ${formattedLatitude}, 경도 ${formattedLongitude}</p>
                            <p>위치 설정이 완료되었습니다! 아래 '시작하기' 버튼을 눌러주세요.</p>
                        `;
                        statusMessageDiv.innerHTML = successMessage;
                        statusMessageDiv.classList.add('info-message'); // 성공 메시지 클래스 추가
                        startButton.disabled = false; // ⭐⭐ 시작하기 버튼 활성화 ⭐⭐

                        console.log(`위도: ${formattedLatitude}, 경도: ${formattedLongitude}`);
                        
                    },
                    (error) => { // 위치 가져오기에 실패했을 때 실행될 함수
                        let errorMessageText = "위치 정보를 가져오는 데 실패했습니다: ";
                        switch(error.code) {
                            case error.PERMISSION_DENIED:
                                errorMessageText += "사용자가 위치 정보 동의를 거부했습니다.<br> (브라우저 설정에서 위치 권한을 허용해주세요)";
                                break;
                            case error.POSITION_UNAVAILABLE:
                                errorMessageText += "위치 정보를 사용할 수 없습니다.<br> (위치 서비스가 켜져 있는지 확인해주세요)";
                                break;
                            case error.TIMEOUT:
                                errorMessageText += "위치 정보를 가져오는 시간이 초과되었습니다.<br> (네트워크 환경 확인 후 다시 시도해주세요)";
                                break;
                            default:
                                errorMessageText += "알 수 없는 오류가 발생했습니다.<br> (다시 시도해주세요)";
                                break;
                        }
                        console.error(errorMessageText);
                        
                        statusMessageDiv.innerHTML = `<p>${errorMessageText}</p>`;
                        statusMessageDiv.classList.add('error-message'); // 오류 메시지 클래스 추가
                        startButton.disabled = true; // 오류 시 시작하기 버튼 비활성화
                    },
                    { // 옵션 (선택 사항) - 속도 개선을 위해 enableHighAccuracy를 false로 설정 가능
                        enableHighAccuracy: false, // 정확도를 낮추고 속도 개선 시도 (선택 사항)
                        timeout: 5000,             // 5초 내 응답 없으면 타임아웃
                        maximumAge: 0              // 캐시된 위치 정보 사용 안 함
                    }
                );
            } else {
                const browserNotSupportMsg = "<p>죄송합니다. 이 브라우저에서는 Geolocation API를 지원하지 않습니다. 😢</p>";
                console.error(browserNotSupportMsg);
                
                statusMessageDiv.innerHTML = browserNotSupportMsg;
                statusMessageDiv.classList.add('error-message');
                startButton.disabled = true;
            }
        });

        // "시작하기" 버튼 클릭 이벤트
        startButton.addEventListener('click', () => {
            if (!startButton.disabled) {
                // 메인 메뉴로 이동하는 로직 (현재는 간단한 메시지로 대체)
                statusMessageDiv.classList.remove('info-message', 'error-message');
                statusMessageDiv.innerHTML = `
                    <p>메인 메뉴로 진입합니다!</p>
                    <p>사용자님을 위한 맞춤형 서비스를 지금부터 경험해 보세요! ✨</p>
                `;
                statusMessageDiv.classList.add('info-message'); // 성공적인 진행 메시지
                startButton.style.display = 'none'; // 시작하기 버튼 숨기기 (선택 사항)
                getLocationBtn.style.display = 'none'; // 위치 확인 버튼 숨기기 (선택 사항)
                
                console.log("메인 메뉴로 이동합니다!");

                // ⭐⭐ 여기에서 메인 메뉴 관련 UI를 띄우거나, 다른 페이지로 리다이렉트 ⭐⭐
                // 예를 들어: window.location.href = 'main_menu.html';
            }
        });
    }
});