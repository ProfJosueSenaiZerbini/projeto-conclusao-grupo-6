export function validarEmail(email: string): string | null {
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Informe um endereço de e-mail válido.";
  }
  return null;
}

export function validarSenha(senha: string, obrigatoria = true): string | null {
  if (obrigatoria && senha.length < 8) {
    return "A senha precisa ter entre 8 e 128 caracteres.";
  }
  if (senha.length > 128) {
    return obrigatoria
      ? "A senha precisa ter entre 8 e 128 caracteres."
      : "A senha informada não é válida.";
  }
  return null;
}

export function validarNomeCadastro(nome: string): string | null {
  return nome.length < 2 || nome.length > 80
    ? "Informe um nome entre 2 e 80 caracteres."
    : null;
}
