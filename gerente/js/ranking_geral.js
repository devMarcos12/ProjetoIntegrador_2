// Função para contar o número de linhas na tabela e atualizar o campo de quantidade de alunos
function atualizarQuantidadeAlunos() {
    var tabela = document.getElementById("tabela-alunos");
    var quantidadeAlunos = tabela.getElementsByTagName("tr").length - 1; // Subtrai 1 para não contar o cabeçalho
    document.getElementById("retangulo-quantidade").textContent = "Quantidade de alunos: " + quantidadeAlunos;
}

// Função para ordenar as linhas da tabela por ordem alfabética com base no nome completo
function ordenarTabelaPorNome() {
    const tabela = document.getElementById("tabela-alunos");
    const linhas = Array.from(tabela.querySelectorAll("tbody tr"));

    // Ordena as linhas alfabeticamente com base no primeiro <td> (Nome Completo)
    linhas.sort((a, b) => {
        const nomeA = a.querySelector("td").textContent.trim().toLowerCase();
        const nomeB = b.querySelector("td").textContent.trim().toLowerCase();
        return nomeA.localeCompare(nomeB);
    });

    // Remove as linhas existentes do tbody e reinsere na ordem correta
    const tbody = tabela.querySelector("tbody");
    linhas.forEach(linha => tbody.appendChild(linha));
}

// Chama a função ao carregar a página
window.onload = function () {
    ordenarTabelaPorNome();
    atualizarQuantidadeAlunos();
};