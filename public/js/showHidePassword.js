const togglePasswordBtn = document.querySelectorAll('.passwordToggle');

togglePasswordBtn.forEach(btn => {
    btn.addEventListener('click',togglePassword);
});

function togglePassword() {
    const passwordInput = this.previousSibling.previousSibling;
    type = passwordInput.type;
    if (type === 'password') {
        passwordInput.type = 'text';
        this.textContent = 'Hide Password';
    } else {
        passwordInput.type = 'password';
        this.textContent = 'Show Password';
    }
}
