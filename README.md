# barbearia-maraca
Sistema de Agendamento para Barbearia - Formação Alpha EdTech

## Estrutura do repositório
```
/.opencode/agent/   agentes de IA (Arquiteto, Desenvolvedor, UI/UX, Code Reviewer)
/docs               Escopo, PRD e as skills/cards de implementação (docs/plans/back)
/frontend           Vanilla TypeScript + HTML5 + CSS3
/backend            Node.js + TypeScript (API RESTful em camadas)
/database           DDLs e migrations (Postgres)
```

## Guia de instalação — do zero até a aplicação rodando

### Passo 1 — Instalar o Node.js (versão 20 ou superior)

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS (com Homebrew):**
```bash
brew install node@20
```

**Windows:** baixe o instalador em https://nodejs.org (versão LTS) e siga o assistente.

Confirme a instalação:
```bash
node -v   # deve mostrar v20 ou superior
npm -v
```

### Passo 2 — Instalar o PostgreSQL

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

**macOS (com Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Windows:** baixe o instalador em https://www.postgresql.org/download/windows/ e siga o assistente
(anota a senha do usuário `postgres` que ele pede na instalação).

Confirme que está rodando:
```bash
pg_isready
# esperado: "accepting connections"
```

### Passo 3 — Clonar o repositório
```bash
git clone https://github.com/pollyanasousa/barbearia-maraca.git
cd barbearia-maraca
```

### Passo 4 — Instalar as dependências do back-end
```bash
cd backend
npm install
```

### Passo 5 — Criar o usuário e o banco de dados do projeto
```bash
sudo -u postgres createuser -P barbearia_app
sudo -u postgres createdb -O barbearia_app barbearia_maraca
```
O `-P` vai pedir pra você **inventar uma senha nova** pro usuário `barbearia_app` — anota ela, você vai
usar no próximo passo. (No Windows, use o `psql`/pgAdmin instalado no Passo 2 para rodar o equivalente:
`CREATE USER barbearia_app WITH PASSWORD '...';` e `CREATE DATABASE barbearia_maraca OWNER barbearia_app;`.)

### Passo 6 — Criar e preencher o `.env` local
```bash
npm run setup
```
Isso gera `backend/.env` a partir do `.env.example`, já com um `JWT_SECRET` aleatório. Abra o
`backend/.env` gerado e preencha:
```
DB_USER=barbearia_app
DB_PASSWORD=<a senha que você definiu no Passo 5>
BARBEIRO_EMAIL=<e-mail de teste do barbeiro>
BARBEIRO_SENHA_INICIAL=<senha de teste do barbeiro>
```
`BARBEIRO_EMAIL`/`BARBEIRO_SENHA_INICIAL` criam a conta única do barbeiro (administrador) na primeira vez
que o servidor sobe — o barbeiro é administrador único do sistema, não tem tela de cadastro pública.

### Passo 7 — Aplicar o schema no banco
```bash
for f in ../database/migrations/*.sql; do
  psql -h localhost -U barbearia_app -d barbearia_maraca -v ON_ERROR_STOP=1 -f "$f"
done
```
(comando executado de dentro de `backend/`; vai pedir a senha do `barbearia_app` do Passo 5 a cada
arquivo. As migrations devem ser aplicadas **em ordem** — os nomes começam com timestamp UTC, então a
ordenação alfabética do glob já garante isso.)

### Passo 8 — Subir a API
```bash
npm run dev
```
A API sobe em `http://localhost:3000`. Teste rápido:
```bash
curl http://localhost:3000/servicos
# esperado: []
```

## Front-end
Ainda sem estrutura de build (pasta `frontend/` em desenvolvimento). Instruções de instalação serão
adicionadas aqui assim que a base do front for definida.

## Scripts disponíveis (dentro de `backend/`)
| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe a API em modo desenvolvimento (recarrega ao salvar) |
| `npm run typecheck` | Confere o TypeScript em modo strict, sem gerar arquivos |
| `npm run build` | Compila para `dist/` |
| `npm run start` | Roda a versão compilada (`dist/server.js`) |
| `npm run setup` | Gera `backend/.env` a partir do `.env.example`, se ainda não existir |

## Fluxo de desenvolvimento com Agentes de IA
Este projeto usa 4 agentes de IA (`.opencode/agent/`) em 3 etapas — Planejamento (Arquiteto), Implementação
(Desenvolvedor/UI-UX) e Code Review — sobre cards documentados em `docs/plans/back/`. Ver
`docs/Escopo_BarbeariaMaraca.pdf` (seção 11) para o detalhamento do workflow.
