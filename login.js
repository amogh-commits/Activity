document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('loginForm').addEventListener('submit', function (event) {
        event.preventDefault(); 

        const username = document.getElementById('userName').value;
        const password = document.getElementById('password').value;

        fetch('https://localhost:7263/api/Auth/Login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json(); 
            } else {
                return response.text(); 
            }
        })
        .then(data => {
            if (typeof data === 'string') {
                console.error('Error during login:', data);
                alert('Login failed: ' + data);
            } else {
                localStorage.setItem('jwtToken', data.token);
                window.location.href = 'timesheet.html'; 
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('An error occurred during login.');
        });
    });
});
