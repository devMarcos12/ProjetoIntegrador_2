async function fetchRankingSemanal() {
    try {
        const response = await fetch('http://localhost:3000/ranking-semanal');
        if (!response.ok) {
            throw new Error('Erro ao buscar o ranking semanal');
        }

        const data = await response.json();
        console.log(data)
        const rankingTableBody = document.getElementById('rankingTableBody');
        rankingTableBody.innerHTML = ''; // Limpa a tabela antes de inserir novos dados

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.CLASSIFICACAO}</td>
                <td>${row.ALUNO_CPF}</td>
                <td>${row.ALUNO_NOME}</td>
                <td>${row.TOTAL_HORAS_TREINADAS}</td>
            `;
            rankingTableBody.appendChild(tr);
        });

        updateStudentCount(); // Atualiza a contagem após o fetch
        sortTableByTotal();   // Ordena após preencher
    } catch (error) {
        console.error(error.message);
    }
}



function updateStudentCount() {
    const studentCount = document.getElementById('rankingTableBody').getElementsByTagName('tr').length;
    document.getElementById('quantity').textContent = studentCount;
}


function sortTableByTotal() {
    var tableBody = document.getElementById('studentTableBody');
    var rows = Array.from(tableBody.getElementsByTagName('tr'));

    rows.sort(function (a, b) {
        var totalA = parseInt(a.cells[9].textContent.trim(), 10); // Coluna TOTAL do aluno A
        var totalB = parseInt(b.cells[9].textContent.trim(), 10); // Coluna TOTAL do aluno B
        return totalB - totalA; // Ordena em ordem decrescente (maior TOTAL primeiro)
    });

    // Remove todas as linhas da tabela
    tableBody.innerHTML = "";

    // Reanexando as linhas ordenadas
    rows.forEach(function (row) {
        tableBody.appendChild(row);
    });
}

window.onload = function () {
    updateStudentCount();
    fetchRankingSemanal();
    sortTableByTotal(); // Ordena a tabela pela coluna TOTAL ao carregar a página
};