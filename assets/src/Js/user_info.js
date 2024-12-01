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

// Função para obter o dia da semana de uma data no formato YYYY-MM-DD
function obterDiaSemana(dataStr) {
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    return data.getDay();
}

// Função para verificar se a data está na semana atual (de domingo a sábado)
function isDataNaSemanaAtual(dataStr) {
    console.log("Data recebida (dataStr):", dataStr);

    // Força a criação correta da data no formato YYYY-MM-DD
    const [ano, mes, dia] = dataStr.split("-").map(Number);
    const data = new Date(ano, mes - 1, dia); // Cria a data sem interferência de timezone
    data.setHours(0, 0, 0, 0);
    console.log("Data formatada (após zerar horas):", data);

    // Define a data de hoje e zera as horas
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    console.log("Data de hoje (zerada):", hoje);

    // Calcula o início da semana (domingo)
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    console.log("Início da semana:", inicioSemana);

    // Calcula o fim da semana (sábado)
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    console.log("Fim da semana:", fimSemana);

    // Verifica se a data está dentro do intervalo
    const resultado = data >= inicioSemana && data <= fimSemana;
    console.log(`Data ${data} está na semana atual?`, resultado);

    return resultado;
}

// Array dos nomes dos dias da semana para facilitar a marcação no HTML
const diasDaSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Função para limpar a classe `present` dos dias, garantindo que o estilo seja aplicado apenas nos dias dinâmicos
function limparEstiloDias() {
    document.querySelectorAll(".day").forEach(elemento => {
        elemento.classList.remove("present");
    });
}

// Função para marcar os dias de treino na interface
function marcarDiasDeTreino(treinoDatas) {
    console.log("Chamando marcarDiasDeTreino com:", treinoDatas);
    limparEstiloDias(); // Remove o estilo `present` de todos os dias antes de aplicar nos dias específicos
    
    treinoDatas.forEach(data => {
        // Verifica se a data está na semana atual
        if (isDataNaSemanaAtual(data)) {
            const diaSemana = obterDiaSemana(data);
            const elementoDia = document.querySelector(`.day[data-dia='${diasDaSemana[diaSemana]}']`);
            if (elementoDia) {
                elementoDia.classList.add("present"); // Adiciona a classe `present` para marcar o dia dinamicamente
                console.log(`Dia de treino marcado para: ${diasDaSemana[diaSemana]}`);
            } else {
                console.warn(`Elemento do dia ${diasDaSemana[diaSemana]} não encontrado.`);
            }
        } else {
            console.log(`Data ${data} não está na semana atual e será ignorada.`);
        }
    });
}

// Função para buscar as datas de treino dos últimos 7 dias do servidor
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
        } else {
            console.error('Erro ao buscar as datas de treino. Status:', response.status);
        }
    } catch (error) {
        console.error('Erro ao conectar ao servidor:', error);
    }
}

// Executa a função de busca das datas de treino ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    console.log("Página carregada. Iniciando buscarDatasTreino...");
    buscarDatasTreino();
});
