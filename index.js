document.getElementById('registrationForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const userName = document.getElementById('userName').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    fetch('https://localhost:7263/api/Auth/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            UserName: userName, 
            Password: password,
            Name: userName 
        })
    })
    .then(response => {
        if (response.ok) {
            alert('Registration successful!');
            window.location.href = 'login.html';
        } else {
            return response.json().then(error => { throw new Error(error.message) });
        }
    })
    .catch(error => console.error('Error during registration:', error));
});
