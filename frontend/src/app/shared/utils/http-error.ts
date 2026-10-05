import { HttpErrorResponse } from '@angular/common/http';

// Extrai a mensagem devolvida pela API (campo "detail") ou usa o texto padrão.
export function mensagemDeErro(erro: unknown, padrao: string): string {
  if (!(erro instanceof HttpErrorResponse)) return padrao;
  if (erro.status === 0) return 'Não foi possível conectar ao servidor.';
  if (erro.status === 403) return 'Você não tem permissão para fazer isso.';

  const detail = erro.error?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') {
    return detail[0].msg.replace(/^Value error, /, '');
  }
  return padrao;
}
