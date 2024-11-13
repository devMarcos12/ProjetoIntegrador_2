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

        if (response.ok) {
            const loginData = await response.json();
            const alunoNome = loginData.user;

            const infoResponse = await fetch('http://localhost:3000/getStudentInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (infoResponse.ok) {
                const studentInfo = await infoResponse.json();
                localStorage.setItem('nomeAluno', studentInfo.aluno_nome);
                localStorage.setItem('horasTreinadas', studentInfo.horas_treinadas);
                localStorage.setItem('classificacao', studentInfo.classificacao);
                window.location.href = './user_info.html';
            } else if (infoResponse.status === 404) {
                alert('Informações do aluno não encontradas.');
            } else {
                alert('Erro ao obter informações do aluno. Tente novamente.');
            }
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
