// script.js (for basic form validation)
document.getElementById('contact-form').addEventListener('submit', function(event) {
    const emailInput = document.getElementById('email');
    if (!emailInput.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) { //very basic email validation. 
        alert('Please enter a valid email address.');
        event.preventDefault(); // Prevent form submission
    }
});