function CPFmodel(cpf) {
    cpf = cpf.replace(/\D/g, ''); // Just accepts number caracters
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 3 firts numbers
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2'); // Add a point after 6 firts numbers
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Add "-" before lats two digits
    return cpf;
}

function PhoneModel(telefone) {
    telefone = telefone.replace(/\D/g, ''); // Just accepts number caracters
    telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2'); // Adiciona () to DDD
    telefone = telefone.replace(/(\d{4,5})(\d{4})$/, '$1-$2'); // Add "-" between the group numbers
    return telefone;
}

// Applies the functions to the specified fields
document.getElementById('cpf').addEventListener('input', (event) => {
    event.target.value = CPFmodel(event.target.value);
});

document.getElementById('telefone').addEventListener('input', (event) => {
    event.target.value = PhoneModel(event.target.value);
});

document.getElementById('registerForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    // Get the datas from forms
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

    const formDataJson = JSON.stringify(formData);

    console.log('Json gerado', formDataJson)

    // TODO: criar a endpoint /register 
});
