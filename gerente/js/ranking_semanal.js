function updateStudentCount() {
    var studentCount = document.getElementById('studentTableBody').getElementsByTagName('tr').length;
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
    sortTableByTotal(); // Ordena a tabela pela coluna TOTAL ao carregar a página
};