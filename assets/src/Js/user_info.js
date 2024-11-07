

const nomeAluno = localStorage.getItem('nomeAluno');

console.log('Nome do aluno recuperado do localStorage:', nomeAluno);

document.getElementById('nomeAlunoTitulo').innerText = `Bem-vindo(a) ${nomeAluno}`;

