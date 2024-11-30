document.addEventListener('DOMContentLoaded', () => {
    const tabelaAlunos = document.querySelector('#tabela-alunos tbody');
    const quantidadeAlunos = document.getElementById('retangulo-quantidade');

    // Função para buscar dados do ranking geral
    async function carregarRankingGeral() {
        try {
            const response = await fetch('http://localhost:3000/ranking-geral');
            if (!response.ok) {
                throw new Error('Erro ao buscar ranking geral');
            }

            const data = await response.json();

            // Limpa a tabela antes de adicionar novos dados
            tabelaAlunos.innerHTML = '';

            // Adiciona os dados na tabela
            data.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row[0]}</td>
                    <td>${row[1]}</td>
                    <td>${row[2]}</td>
                `;
                tabelaAlunos.appendChild(tr);
            });

            // Atualiza a quantidade de alunos
            atualizarQuantidadeAlunos();

            // Ordena a tabela por nome
            ordenarTabelaPorHoras();
        } catch (error) {
            console.error('Erro:', error);
            alert('Não foi possível carregar o ranking geral dos alunos.');
        }
    }

    // Função para contar o número de linhas na tabela e atualizar o campo de quantidade de alunos
    function atualizarQuantidadeAlunos() {
        const quantidadeAlunos = tabelaAlunos.getElementsByTagName("tr").length;
        document.getElementById("retangulo-quantidade").textContent = "Quantidade de alunos: " + quantidadeAlunos;
    }

    // Função para ordenar as linhas da tabela por ordem alfabética com base no nome completo
    // Função para ordenar as linhas da tabela por quantidade de horas treinadas
    function ordenarTabelaPorHoras() {
        const linhas = Array.from(tabelaAlunos.querySelectorAll("tr"));

        linhas.sort((a, b) => {
            const horasA = parseFloat(a.querySelectorAll("td")[2].textContent.trim());
            const horasB = parseFloat(b.querySelectorAll("td")[2].textContent.trim());
            return horasB - horasA;
        });

        // Remove as linhas existentes do tbody e reinsere na ordem correta
        linhas.forEach(linha => tabelaAlunos.appendChild(linha));
    }

    // Chama a função para carregar os dados ao carregar a página
    carregarRankingGeral();
});
