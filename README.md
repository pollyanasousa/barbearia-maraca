# barbearia-maraca

Sistema de Agendamento para Barbearia - Formação Alpha EdTech

## IMPORTANTE

Após clonar, rode `npm install` na raiz — os hooks do Husky são registrados automaticamente.

| Hook         | Validação                                           |
| ------------ | --------------------------------------------------- |
| `pre-commit` | ESLint + Prettier nos arquivos staged               |
| `commit-msg` | Conventional Commits (`feat:`, `fix:`, `chore:`...) |
| `pre-push`   | Typecheck do backend                                |

##  Padrão de Commits (Conventional Commits)

Este repositório utiliza **Husky** e **Commitlint** para automatizar e garantir a consistência das mensagens de commit. Commits que não seguirem a estrutura abaixo serão **rejeitados automaticamente**.

### 🏗️ Estrutura do Commit

As mensagens de commit devem seguir o seguinte formato:

```text
<tipo>(<escopo opcional>): <descrição curta em letras minúsculas>
```

*Exemplo:* `feat(auth): adiciona login com Google`

---

### 🏷️ Tipos Permitidos

| Tipo | Descrição | Exemplo |
| :--- | :--- | :--- |
| **feat** | Uma nova funcionalidade para o usuário | `feat: adiciona botão de modo escuro` |
| **fix** | Correção de um bug ou problema | `fix: corrige quebra de layout no mobile` |
| **chore** | Atualizações de tarefas de build, pacotes ou ferramentas (sem mexer no código de produção) | `chore: atualiza versão do Axios` |
| **docs** | Alterações exclusivamente na documentação | `docs: atualiza instruções de instalação no README` |
| **style** | Alterações que não afetam o significado do código (espaços, formatação, ponto e vírgula) | `style: formata código com Prettier` |
| **refactor** | Uma alteração de código que não corrige um bug nem adiciona uma funcionalidade | `refactor: simplifica a função de validação` |
| **perf** | Uma alteração de código que melhora o desempenho | `perf: reduz o tempo de carregamento da API` |
| **test** | Adição de testes ausentes ou correção de testes existentes | `test: adiciona teste unitário para o login` |
| **ci** | Modificações em arquivos de configuração e scripts de CI/CD | `ci: ajusta pipeline do GitHub Actions` |

---

### 🚨 Regras Importantes

* **Use letras minúsculas:** O assunto do commit deve começar com letra minúscula.
* **Sem ponto final:** Não coloque ponto (.) ao final da mensagem de commit.
* **Seja direto:** Escreva uma descrição curta e clara no tempo presente (ex: `adiciona` e não `adicionado`).


após procedimento rode o comando: git config core.hooksPath e verifique se ".husky/_" aparece
