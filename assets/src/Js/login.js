document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('Nome').value.toLowerCase();

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });


        console.log('Response status:', response.status);
        if (response.ok) {
            const responseData = await response.json();
            localStorage.setItem('nomeAluno', responseData.user);
            window.location.href = './user_info.html';
        } else if (response.status === 404) {
            alert('Usuário não encontrado. Verifique o nome e tente novamente.');
        } else {
            alert('Erro ao realizar o login. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        alert('Erro ao conectar ao servidor. Tente novamente.');
    }
});