// Recupera os dados do localStorage
const nomeAluno = localStorage.getItem('nomeAluno');
const classificacao = localStorage.getItem('classificacao');
const horasTreinadas = localStorage.getItem('horasTreinadas');

if (nomeAluno) {
    document.getElementById('nomeAlunoTitulo').innerText = `Bem-vindo(a), ${nomeAluno}`;
    
    document.getElementById('classificacaoAluno').innerText = classificacao;
    document.getElementById('horasTreinadas').innerText = horasTreinadas;
} else {
    window.location.href = './index_login.html';
}
