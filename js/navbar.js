const toggleBtn = document.querySelector('.navbar__toggleBtn');

const menu = document.querySelector('.navbar__menu');

toggleBtn.addEventListener('click', (event)=>{
  event.preventDefault();
  menu.classList.toggle('active');
});
