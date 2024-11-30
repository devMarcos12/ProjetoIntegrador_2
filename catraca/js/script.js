// Função para formatar o CPF
function CPFmodel(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após os primeiros 3 números
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Adiciona ponto após os primeiros 6 números
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona "-" antes dos últimos 2 dígitos
    return cpf;
}

// Formata o CPF em tempo real
document.getElementById('cpf').addEventListener('input', (event) => {
    event.target.value = CPFmodel(event.target.value);
});

// Relógio e Data
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
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
    const ano = agora.getFullYear();
    document.getElementById('data').textContent = `${dia}/${mes}/${ano}`;
}

setInterval(atualizarRelogio, 1000);
setInterval(atualizarData, 1000);

// Seleciona os botões de entrada e saída
const entradaButton = document.getElementById('entrada');
const saidaButton = document.getElementById('saida');

// Função para adicionar ou remover a classe 'active' nos botões
entradaButton.addEventListener('click', () => {
    entradaButton.classList.add('active-entrada');
    saidaButton.classList.remove('active-saida');
});

saidaButton.addEventListener('click', () => {
    saidaButton.classList.add('active-saida');
    entradaButton.classList.remove('active-entrada');
});

// Função para mostrar o formulário e ajustar os botões
function mostrarFormulario(botao) {
    btnEntrada.classList.remove('active');
    btnSaida.classList.remove('active');
    botao.classList.add('active');
    cpfForm.style.display = 'block';

    if (botao.id === 'entrada') {
        btnEnviarEntrada.style.display = 'block';
        btnEnviarSaida.style.display = 'none';
    } else {
        btnEnviarEntrada.style.display = 'none';
        btnEnviarSaida.style.display = 'block';
    }
}

// Referências aos botões
const btnEntrada = document.getElementById('entrada');
const btnSaida = document.getElementById('saida');
const cpfForm = document.getElementById('cpf-form');
const btnEnviarEntrada = document.getElementById('enviar-entrada');
const btnEnviarSaida = document.getElementById('enviar-saida');

// Eventos de clique nos botões de entrada e saída
btnEntrada.addEventListener('click', () => mostrarFormulario(btnEntrada));
btnSaida.addEventListener('click', () => mostrarFormulario(btnSaida));

// Validação e requisição para entrada
btnEnviarEntrada.addEventListener('click', async () => {
    const cpfField = document.getElementById('cpf');
    const cpf = cpfField.value.trim();

    if (!cpf) {
        alert('Por favor, insira um CPF válido.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/registerEntry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf }),
        });

        if (response.ok) {
            alert('Entrada registrada com sucesso!');
            cpfField.value = '';
            cpfForm.style.display = 'none';
        } else if (response.status === 409) {
            alert('CPF não encontrado. Por favor, registre-se antes.');
        } else {
            const errorData = await response.json();
            alert(`Erro ao registrar entrada: ${errorData.message || 'Erro desconhecido'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    }
});

// Validação e requisição para saída
btnEnviarSaida.addEventListener('click', async () => {
    const cpfField = document.getElementById('cpf');
    const cpf = cpfField.value.trim();

    if (!cpf) {
        alert('Por favor, insira um CPF válido.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/registerExit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf }),
        });

        if (response.ok) {
            alert('Saída registrada com sucesso!');
            cpfField.value = '';
            cpfForm.style.display = 'none';
        } else if (response.status === 409) {
            alert('CPF não encontrado. Por favor, registre-se antes.');
        } else {
            const errorData = await response.json();
            alert(`Erro ao registrar saída: ${errorData.message || 'Erro desconhecido'}`);
        }
    } catch (err) {
        console.error(err);
        alert('Erro ao conectar com o servidor. Tente novamente mais tarde.');
    }
});
