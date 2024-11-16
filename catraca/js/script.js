function CPFmodel(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Just accepts number characters
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 3 first numbers
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 6 first numbers
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Add "-" before last two digits
    return cpf;
}

// Apply the functions to the specified fields (cpf, phone)
document.getElementById('cpf').addEventListener('input', (event) => {
    event.target.value = CPFmodel(event.target.value);
});

// relogio 
function atualizarRelogio() {
    const agora = new Date();
    const horas = agora.getHours().toString().padStart(2, '0');
    const minutos = agora.getMinutes().toString().padStart(2, '0');
    const segundos = agora.getSeconds().toString().padStart(2, '0');
    document.getElementById('relogio').textContent = `${horas}:${minutos}:${segundos}`;
}

function atualizarData() {
    const agora = new Date();
    const dia = agora.getDate().toString().padStart(2, '0');
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0'); // mes é 0 a 11(janeiro é 0, por isso o +1)
    const ano = agora.getFullYear();
    document.getElementById('data').textContent = `${dia}/${mes}/${ano}`;
}


setInterval(atualizarRelogio, 1000);
setInterval(atualizarData, 1000);


// troca de botao
const btnEntrada = document.getElementById('entrada');
const btnSaida = document.getElementById('saida');
const cpfForm = document.getElementById('cpf-form');
const btnEnviarEntrada = document.getElementById('enviar-entrada');
const btnEnviarSaida = document.getElementById('enviar-saida');

function mostrarFormulario(botao) {
    btnEntrada.classList.remove('active');
    btnSaida.classList.remove('active');
    botao.classList.add('active');
    cpfForm.style.display = 'block';

    // mostra o botao certo
    if (botao.id === 'entrada') {
        btnEnviarEntrada.style.display = 'block';
        btnEnviarSaida.style.display = 'none';
    } else {
        btnEnviarEntrada.style.display = 'none';
        btnEnviarSaida.style.display = 'block';
    }
}

btnEntrada.addEventListener('click', () => mostrarFormulario(btnEntrada));
btnSaida.addEventListener('click', () => mostrarFormulario(btnSaida));

btnEnviarEntrada.addEventListener('click', async () => {
    const cpfField = document.getElementById('cpf');
    const cpf = cpfField.value;

    // Enviar requisição para o servidor
    const response = await fetch('http://localhost:3000/registerEntry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
    });

    if (response.ok) {
        alert('Entrada registrada com sucesso!');

        // Limpar o campo CPF
        cpfField.value = '';

        // Esconder o formulário e o botão após o envio
        cpfForm.style.display = 'none';
        btnEnviarEntrada.style.display = 'none';
    } else if (response.status === 409) {
        alert('CPF não encontrado. Tente novamente.');
    } else {
        alert(`Erro ao registrar entrada, tente novamente.`);
    }
});

btnEnviarSaida.addEventListener('click', async () => {
    const cpfField = document.getElementById('cpf');
    const cpf = cpfField.value;

    // Enviar requisição para o servidor
    const response = await fetch('http://localhost:3000/registerExit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
    });

    if (response.ok) {
        alert('Saída registrada com sucesso!');

        // Limpar o campo CPF
        cpfField.value = '';

        // Esconder o formulário e o botão após o envio
        cpfForm.style.display = 'none';
        btnEnviarSaida.style.display = 'none';
    } else if (response.status === 409) {
        alert('CPF não encontrado. Tente novamente.');
    } else {
        alert(`Erro ao registrar saída, tente novamente.`);
    }
});



btnEnviarSaida.addEventListener('click', async () => {
    const cpf = document.getElementById('cpf').value;
    await fetch('http://localhost:3000/registerExit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf }),
    });
    alert('Saída registrada com sucesso!');
});
