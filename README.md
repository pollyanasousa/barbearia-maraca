# barbearia-maraca

Sistema de Agendamento para Barbearia - Formação Alpha EdTech

## IMPORTANTE

Após clonar, rode `npm install` na raiz — os hooks do Husky são registrados automaticamente.

| Hook         | Validação                                           |
| ------------ | --------------------------------------------------- |
| `pre-commit` | ESLint + Prettier nos arquivos staged               |
| `commit-msg` | Conventional Commits (`feat:`, `fix:`, `chore:`...) |
| `pre-push`   | Typecheck do backend                                |

Padrão de commits: `tipo(escopo opcional): descrição`
Ex.: `feat: adiciona endpoint de agendamento`

após procedimento rode o comando: git config core.hooksPath e verifique se ".husky/_" aparece
