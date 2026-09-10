const USUARIO_VALIDO = {

    email: "cypheracima@gmail.com",
    senha: "cypherGOAT",
};

document.getElementById("entrar").addEventListener("click", autenticar());

function autenticar () {
    const emailDigitado = document.getElementById("email").value;
    const senhaDigitada = document.getElementById("senha").value;

    if (emailDigitado == USUARIO_VALIDO.email && senhaDigitada == USUARIO_VALIDO.senha) {
        
        alert("Login efetuado com sucesso!")
        window.location.href = "./View/2cadastro.html"  
    }
}