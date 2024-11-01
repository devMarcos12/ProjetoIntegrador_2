function CPFmodel(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Just accepts number characters
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 3 first numbers
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 6 first numbers
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Add "-" before last two digits
    return cpf;
}

function PhoneModel(telefone) {
    telefone = telefone.replace(/\D/g, ''); // Just accepts number characters
    telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2'); // Add () to DDD
    telefone = telefone.replace(/(\d{4,5})(\d{4})$/, '$1-$2'); // Add "-" between the group numbers
    return telefone;
}

// Apply the functions to the specified fields (cpf, phone)
document.getElementById('cpf').addEventListener('input', (event) => {
    event.target.value = CPFmodel(event.target.value);
});
document.getElementById('telefone').addEventListener('input', (event) => {
    event.target.value = PhoneModel(event.target.value);
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the data from the form
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('telefone').value,
        cpf: document.getElementById('cpf').value,
        data_nasc: document.getElementById('data-nasc').value,
        endereco: document.getElementById('endereço').value,
        peso: document.getElementById('peso').value,
        altura: document.getElementById('altura').value,
    };

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            window.location.href = './index_login.html';
        } else if (response.status === 409) {
            alert('Erro ao cadastrar usuário, este CPF já está em uso');
        } else {
            alert('Erro ao cadastrar usuário');
        }
    } catch (error) {
        console.error('Erro ao enviar os dados:', error);
        alert('Erro ao conectar com o servidor');
    }
});
