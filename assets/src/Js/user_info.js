const nomeAluno = localStorage.getItem('nomeAluno');
console.log('Nome do aluno recuperado do localStorage:', nomeAluno); // Adicione este log
document.getElementById('nomeAlunoTitulo').innerText = `Bem-vindo(a) ${nomeAluno}`;
