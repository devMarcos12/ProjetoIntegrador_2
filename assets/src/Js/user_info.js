// Recupera os dados do localStorage
const nomeAluno = localStorage.getItem('nomeAluno');
const classificacao = localStorage.getItem('classificacao');
const horasTreinadas = localStorage.getItem('horasTreinadas');
const cpfAluno = localStorage.getItem('cpfAluno'); // CPF do aluno

console.log("Dados recuperados do localStorage:", {
    nomeAluno,
    classificacao,
    horasTreinadas,
    cpfAluno
});

if (nomeAluno) {
    document.getElementById('nomeAlunoTitulo').innerText = `Bem-vindo(a), ${nomeAluno}`;
    document.getElementById('classificacaoAluno').innerText = classificacao;
    document.getElementById('horasTreinadas').innerText = horasTreinadas;
} else {
    console.warn("Nome do aluno não encontrado. Redirecionando para a página de login.");
    window.location.href = './index_login.html';
}

// Função para obter o dia da semana de uma data no formato YYYY-MM-DD ou DD/MM/YYYY
function obterDiaSemana(dataStr) {
    let data;
    if (dataStr.includes("-")) { // Verifica se a data está no formato YYYY-MM-DD
        const [ano, mes, dia] = dataStr.split("-").map(Number);
        data = new Date(ano, mes - 1, dia);
    } else { // Presume que está no formato DD/MM/YYYY
        const [dia, mes, ano] = dataStr.split("/").map(Number);
        data = new Date(ano, mes - 1, dia);
    }
    console.log("Convertendo data:", dataStr);
    return data.getDay();
}

// Array dos nomes dos dias da semana para facilitar a marcação no HTML
const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Função para marcar os dias de treino na interface
function marcarDiasDeTreino(treinoDatas) {
    console.log("Chamando marcarDiasDeTreino com:", treinoDatas);
    treinoDatas.forEach(data => {
        const diaSemana = obterDiaSemana(data);
        const elementoDia = document.querySelector(`.day[data-dia='${diasDaSemana[diaSemana]}']`);
        if (elementoDia) {
            if (!elementoDia.querySelector('.icon-check')) {
                elementoDia.classList.add("present");
                
                const iconCheck = document.createElement("span");
                iconCheck.classList.add("icon-check");
                iconCheck.innerHTML = "✓";
                elementoDia.appendChild(iconCheck);
                console.log(`Ícone de verificação adicionado para o dia: ${diasDaSemana[diaSemana]}`);
            } else {
                console.log(`Ícone já existe para o dia: ${diasDaSemana[diaSemana]}`);
            }
        } else {
            console.warn(`Elemento do dia ${diasDaSemana[diaSemana]} não encontrado.`);
        }
    });
}

async function buscarDatasTreino() {
    if (!cpfAluno) {
        console.error('CPF do aluno não encontrado no localStorage.');
        return;
    }

    try {
        console.log("Fazendo requisição para /last7days com CPF:", cpfAluno);
        const response = await fetch(`http://localhost:3000/last7days/${cpfAluno}`);
        if (response.ok) {
            const datasDeTreino = await response.json();
            console.log('Datas de treino obtidas:', datasDeTreino);
            
            // Marca os dias de treino na interface com as datas obtidas do servidor
            marcarDiasDeTreino(datasDeTreino);

            // Exibe as datas de treino em uma lista para visualização
            const treinoContainer = document.getElementById('treinoDatasContainer');
            if (treinoContainer) {
                treinoContainer.innerHTML = datasDeTreino.map(data => `<li>${data}</li>`).join('');
            } else {
                console.warn("Elemento treinoDatasContainer não encontrado no DOM.");
            }
        } else {
            console.error('Erro ao buscar as datas de treino. Status:', response.status);
        }
    } catch (error) {
        console.error('Erro ao conectar ao servidor:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada. Iniciando buscarDatasTreino...");
    buscarDatasTreino();
});
