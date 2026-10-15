export function validarConfirmacaoExclusao(
  confirmacao: unknown
): string | null {
  return confirmacao === "EXCLUIR"
    ? null
    : "Digite EXCLUIR para confirmar o encerramento da conta.";
}

export function validarSenhaExclusao(senha: string): string | null {
  return senha.length < 8 || senha.length > 128
    ? "A senha informada não confere. A conta continua ativa."
    : null;
}
