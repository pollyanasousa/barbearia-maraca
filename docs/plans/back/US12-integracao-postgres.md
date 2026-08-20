# Skill/Card — US12 (consumo): Integração do back-end com o schema real do Postgres

> Não é um card novo do Trello — é o trabalho de conectar o back-end (US01/US02/US03, até aqui rodando
> com repositories mockados em memória) ao schema real entregue pelo time de Banco de Dados na branch
> `origin/develop` (US12, Épico E8). Documentado aqui pelo mesmo motivo dos outros cards: rastreabilidade
> do pedido de IA (seção 7.1 do Escopo).

## Contexto
US01/US02/US03 foram implementados com placeholders de schema (`clientes`, `barbeiro`, `servicos`) enquanto
o time de Banco de Dados ainda modelava a US12. O schema real, entregue em `origin/develop`
(`database/barbearia_maraca_ddl.sql` + `povoamento.sql`), é estruturalmente diferente do que foi assumido:

| Placeholder (US01-US03) | Schema real (US12/develop) |
|---|---|
| `clientes` (id, nome, email, senha_hash, telefone) — 1 tabela | `usuario` (email, senha_hash, tipo) + `cliente` (usuario_id, nome, telefone) — 2 tabelas |
| `barbeiro` (id, nome, email, senha_hash) — 1 tabela | `usuario` (tipo='funcionario') + `funcionario` (usuario_id, nome, is_admin, ativo) — 2 tabelas |
| `servicos` (plural) | `servico` (singular), com colunas extras: `descricao`, `ativo`, `created_at`/`updated_at` |

## Decisões tomadas (confirmadas com o time)
1. **Manter os 2 endpoints de login separados** (`POST /login` para cliente, `POST /login-barbeiro` para
   funcionário/barbeiro) — o contrato HTTP que o front (Rai) já pode estar consumindo não muda. Só a
   implementação por trás troca de tabela.
2. **Manter a convenção de env vars já fixada** (`DB_HOST`/`DB_PORT`/`DB_USER`/`DB_PASSWORD`/`DB_NAME`),
   em vez de adotar o `DATABASE_URL` único que apareceu no `.env.example` da `develop`. A lib `pg` aceita os
   campos separados diretamente no `Pool`, não precisou compor string de conexão.
3. **Migration trazida para `database/migrations/`** com timestamp, preservando o conteúdo original da
   pessoa do banco (sem reescrever a DDL dela) — substitui os 3 arquivos placeholder do Desenvolvedor.

## O que foi feito
- `database/migrations/20260819180000_schema_inicial_...sql`: DDL real aplicada num Postgres local
  (`barbearia_maraca`, usuário `barbearia_app`).
- `backend/src/config/db.ts`: pool de conexão (`pg`), usando as env vars já fixadas.
- `backend/src/config/carregarEnv.ts`: bootstrap do `dotenv` com `override: true` — **bug real encontrado e
  corrigido**: o `dotenv` por padrão não sobrescreve variáveis já existentes no shell do SO, então uma
  `DB_PASSWORD` de outro projeto na máquina do dev vencia silenciosamente o `.env` do projeto. Precisa ser o
  **primeiro import** de `server.ts` (efeito colateral puro) — imports em TS/ESM são processados antes do
  corpo do módulo, uma chamada solta no meio de outros imports não funciona.
- `PostgresClienteRepository`, `PostgresBarbeiroRepository` (+ `semearSeNecessario`, fora da interface
  pública, só bootstrap), `PostgresServicoRepository` — mesma interface dos repositories mockados, só troca
  a implementação (exatamente o ponto de extensão que já estava planejado desde o US01).
- **Bug real encontrado e corrigido**: colunas `BIGINT`/`BIGSERIAL`/`NUMERIC` voltam como `string` no driver
  `pg` (não `number`), por padrão — precisa `Number(...)` explícito em todo campo `id`/`preco` lido do banco.
  Sem isso, o `clienteId`/`barbeiroId` do JWT virava string, e o middleware `autenticarBarbeiro` rejeitava
  com `403` mesmo com token de barbeiro válido (`typeof decodificado.barbeiroId !== 'number'` falhava).
- `InMemoryClienteRepository`/`InMemoryBarbeiroRepository`/`InMemoryServicoRepository` **removidos** (não são
  mais usados por `server.ts`, dead code).

## Testado de ponta a ponta contra o Postgres real
Cadastro de cliente → e-mail duplicado (409) → login cliente → login barbeiro (seed automático no boot) →
login barbeiro senha errada (401) → cadastro de serviço sem token (401) → com token de cliente (403) → com
token de barbeiro (201) → listagem → **reiniciar o processo do servidor e confirmar que os dados continuam
lá** (prova real de persistência, diferente do mock).

## Fora de escopo desta integração
- `povoamento.sql` da `develop` não foi adotado como está (hash de senha nele é texto puro, não um bcrypt
  real — não login com esses dados). Seed do barbeiro continua via `BARBEIRO_EMAIL`/`BARBEIRO_SENHA_INICIAL`
  no boot, agora gravando no Postgres em vez de memória.
- Tabelas `horario_trabalho` e `agendamento` (parte da DDL real) não têm repository/endpoint ainda — fora do
  escopo de US01-US03, ficam para os cards de agendamento (US05/US06 em diante).
- Convenção `created_at`/`updated_at` (em vez de `criado_em`, padrão PT-BR já usado no restante do projeto)
  não foi alterada na tabela `servico` — é a DDL original do time de banco, não reescrita aqui.

## Registro Trello (preencher ao executar)
`Agente: Desenvolvedor TS/SPA | Etapa: Implementação | Pedido: Integrar back-end (US01/US02/US03) com o schema real do Postgres (US12), trocando os repositories mockados pelas implementações reais.`
