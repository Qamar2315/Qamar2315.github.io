const scrollToDiv = (divId) => {
    const div = document.getElementById(divId);
    window.scrollTo({
        top: div.offsetTop,
        left: 0,
        behavior:"smooth"
    });
};

const button = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
});

button.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior:"smooth"
  });
});

const buttonServices = document.getElementById('services');
buttonServices.addEventListener('click', () => {
    scrollToDiv('sectionTwo ');
});
const buttonPortfolio = document.getElementById('portfolio');
buttonPortfolio.addEventListener('click', () => {
    scrollToDiv('sectionThree ');
});
const buttonViewPortfolio = document.getElementById('viewPortfolio ');
buttonViewPortfolio.addEventListener('click', () => {
    scrollToDiv('sectionThree ');
});
const buttonContact = document.getElementById('contact');
buttonContact.addEventListener('click', () => {
    scrollToDiv('sectionFive');
});