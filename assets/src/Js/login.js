function CPFmodel(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Just accepts number characters
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 3 first numbers
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 6 first numbers
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Add "-" before last two digits
    return cpf;
}

document.getElementById('CPF').addEventListener('input', (event) => {
    event.target.value = CPFmodel(event.target.value);
});

document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const cpf = document.getElementById('CPF').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cpf })
        });

        if (response.ok) {
            const loginData = await response.json();

            const infoResponse = await fetch('http://localhost:3000/getStudentInfo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ cpf })
            });

            if (infoResponse.ok) {
                const studentInfo = await infoResponse.json();
                localStorage.setItem('nomeAluno', studentInfo.aluno_nome);
                localStorage.setItem('horasTreinadas', studentInfo.horas_treinadas);
                localStorage.setItem('classificacao', studentInfo.classificacao);
                localStorage.setItem('cpfAluno', studentInfo.aluno_cpf);
                window.location.href = './user_info.html';
            } else if (infoResponse.status === 404) {
                alert('Informações do aluno não encontradas.');
            } else {
                alert('Erro ao obter informações do aluno. Tente novamente.');
            }
        } else if (response.status === 404) {
            alert('Usuário não encontrado. Verifique o CPF e tente novamente.');
        } else {
            alert('Erro ao realizar o login. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        alert('Erro ao conectar ao servidor. Tente novamente.');
    }
});
