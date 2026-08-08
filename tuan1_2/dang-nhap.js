document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const formError = document.getElementById('form-error');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loginBtn = document.getElementById('btn-login');

 
    
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // [^\s@]: có ít nhất 1 kí tự kp khoảng trắng / @ 
    const MIN_PASSWORD_LENGTH = 6;
    const MAX_FAILED_ATTEMPTS = 5;


    const DEMO_ACCOUNT = { email: 'admin@gmail.com', password: 'Admin@123' };

    let failedAttempts = 0;

    togglePasswordBtn.addEventListener('click', () => {
        const isHidden = passwordInput.type === 'password';
        passwordInput.type = isHidden ? 'text' : 'password';
        if (isHidden) {
            togglePasswordBtn.textContent = '🙈';
        } else {
            togglePasswordBtn.textContent = '👁';
        }
        togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });

    function clearErrors() {
        emailError.textContent = '';
        passwordError.textContent = '';
        formError.textContent = '';
    }

    function validateEmail(value) {
        if (!value) return 'Vui lòng nhập email.';
        if (!EMAIL_REGEX.test(value)) return 'Email không đúng định dạng.';
        return '';
    }

    function validatePassword(value) {
        if (!value) return 'Vui lòng nhập mật khẩu.';
        if (value.length < MIN_PASSWORD_LENGTH) return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`;
        return '';
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        clearErrors();

        if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            formError.textContent = 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau.';
            return;
        }

        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value;

        const emailErrMsg = validateEmail(emailValue);
        const passwordErrMsg = validatePassword(passwordValue);

        if (emailErrMsg) emailError.textContent = emailErrMsg;
        if (passwordErrMsg) passwordError.textContent = passwordErrMsg;
        if (emailErrMsg || passwordErrMsg) return;

        if (emailValue === DEMO_ACCOUNT.email && passwordValue === DEMO_ACCOUNT.password) {
            failedAttempts = 0;
            window.location.href = 'doi-mat-khau.html';
            return;
        }

        failedAttempts++;
        const remaining = MAX_FAILED_ATTEMPTS - failedAttempts;

        if (remaining <= 0) {
            formError.textContent = 'Bạn đã nhập sai tài khoản hoặc mật khẩu quá 5 lần. Vui lòng thử lại sau.';
            loginBtn.disabled = true;
        } else {
            formError.textContent = `Tài khoản hoặc mật khẩu không đúng. Bạn còn ${remaining} lần thử.`;
        }
    });
});
