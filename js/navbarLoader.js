// js/navbarLoader.js (최종 버전)

export async function loadNavbar(navbarPath) { // placeholderId 매개변수를 제거했습니다.
    try {
        const res = await fetch(navbarPath);
        if (!res.ok) {
            throw new Error(`Failed to load navbar: ${res.statusText}`);
        }
        const navbarHtml = await res.text();
        
        // document.body 에 직접 삽입합니다.
        document.body.insertAdjacentHTML('afterbegin', navbarHtml);

    } catch (error) {
        console.error('Error loading navbar:', error);
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'color: red; text-align: center; padding: 10px; background-color: #ffe0e0;';
        errorDiv.textContent = '네비게이션 로드 실패';
        document.body.insertAdjacentElement('afterbegin', errorDiv);
    }
}