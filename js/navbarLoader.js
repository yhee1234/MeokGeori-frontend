async function loadNavbar() {
  const res = await fetch('partials/navbar.html');
  const navbarHtml = await res.text();
  document.getElementById('navbar_input').innerHTML = navbarHtml;

  // 삽입 완료 후 토글 버튼 이벤트 등록
  const toggleBtn = document.querySelector('.navbar__toggleBtn');
  const menu = document.querySelector('.navbar__menu');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', (event) => {
      event.preventDefault();
      menu.classList.toggle('active');
    });
  }
}