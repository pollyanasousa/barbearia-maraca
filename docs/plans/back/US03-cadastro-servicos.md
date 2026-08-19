# Skill/Card — US03: Cadastro de Serviços do Barbeiro

> Card real do Trello (Sprint 1, 3 pts, Alta). **Esta execução cobre só o back-end** — itens `[Front]` ficam
> fora, mesmo padrão do US01/US02. Formato de entrada esperado pelo `.opencode/agent/desenvolvedor.md`.

## História de Usuário
Como **barbeiro**, quero **cadastrar meus serviços (nome, duração, preço)**, para **que os clientes possam
escolhê-los**.

## Objetivo
Permitir que o barbeiro cadastre os serviços que oferece, para que fiquem disponíveis para os clientes
escolherem na hora de agendar.

## Regras
- Cada serviço deve ter: nome, duração (em minutos) e preço.
- Duração do serviço é usada depois para calcular os horários disponíveis (US05).
- Somente o barbeiro autenticado pode cadastrar serviços (RF02).
- Validação de campos obrigatórios no front-end e back-end (RF04).

## Por que isso vem cedo
Sem serviço cadastrado, o cliente não tem o que escolher na hora de agendar — bloqueia diretamente a US05 e
US06.

## Escopo desta execução
**Só back-end.** Os 3 itens `[Front]` do Checklist Técnico ficam de fora — feitos pelo responsável de
front-end contra o contrato fechado aqui.

## Critérios de Aceite
1. Barbeiro consegue cadastrar um serviço com nome, duração e preço.
2. Sistema valida que todos os campos obrigatórios foram preenchidos.
3. Serviço cadastrado aparece na lista de serviços do barbeiro.
4. Somente usuário autenticado como barbeiro consegue acessar essa funcionalidade.

---

## ⚠️ Pré-requisito não previsto no checklist original do Trello: Login do Barbeiro
O critério 4 e a task `[Back - Controller]` exigem rota **protegida por autenticação do barbeiro**, mas isso
ainda não existe no projeto — só temos autenticação de **cliente** (US02). Sem isso, não dá pra cumprir o
critério 4 nem testar de verdade. Combinado com você: construir aqui, como pré-requisito mínimo, **antes** do
restante do card.

### Por que é pequeno e não é uma US completa nova
Barbeiro é **administrador único** (sem multi-barbeiro, ver Escopo seção 2.2) — não existe card pedindo tela
de cadastro público de barbeiro, e não deve ser criada uma (evitaria "Fora de Escopo" sem pedido da PO). A
solução é uma **conta única semeada** (seed) na subida do servidor, não um fluxo de registro.

### Schema necessário (⚠️ PLACEHOLDER — confirmar com o time de Banco de Dados)
O título da US12 menciona só "clientes, serviços, agendamentos" — não fica claro se `barbeiro` já está
modelado junto. Igual fizemos no US01 com `clientes`, uso um schema provisório aqui; **confirme com o time de
BD se a tabela `barbeiro` já existe ou se falta ser modelada formalmente**.
```sql
-- caminho: database/migrations/{YYYYMMDDHHMMSS}_create_barbeiro.sql
-- (gerar timestamp UTC real no momento da execução; CREATE TABLE pois a tabela ainda não existe)
CREATE TABLE barbeiro (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
Reutiliza a convenção `senha_hash` já fixada no US01. Escrever o arquivo como scaffold, sem aplicar (mesma
regra do US01/US02 — banco ainda não configurado).

### Seed da conta única (sem endpoint público de cadastro)
- `BarbeiroRepository`: interface **somente leitura** (`buscarPorEmail`) — não expor `criar` publicamente.
- `InMemoryBarbeiroRepository`: recebe os dados do barbeiro (nome, email, senha já hasheada) no construtor e
  cria a única linha internamente, na subida do `server.ts`. Comentário no arquivo indicando que é temporário
  (mesma lógica do `InMemoryClienteRepository`).
- Novas variáveis de ambiente (adicionar ao `backend/.env.example`, não usar outro nome):
  ```
  BARBEIRO_EMAIL=
  BARBEIRO_SENHA_INICIAL=
  ```
  `BARBEIRO_SENHA_INICIAL` é a senha em texto puro usada **só no boot** pra gerar o hash (bcrypt) da conta
  semeada — nunca logar nem persistir em texto puro, nunca reaproveitar essa env var depois do hash gerado.
- Se `BARBEIRO_EMAIL`/`BARBEIRO_SENHA_INICIAL` não estiverem definidas, o servidor deve falhar rápido ao subir
  (mesmo padrão já usado pra `JWT_SECRET` em `config/env.ts`), com mensagem clara apontando pra
  `.env.example`.

### Login do barbeiro
`POST /login-barbeiro` — recebe `LoginRequestDTO` (mesmo tipo já usado no login de cliente, `{ email, senha }`
— não duplicar o tipo).
- Sucesso: `200` com `{ token: string, barbeiro: BarbeiroDTO }`.
- Credenciais inválidas: `401` `ApiErrorResponse`, `code: "CREDENCIAIS_INVALIDAS"` (reutiliza o mesmo código já
  fixado no US02, mensagem genérica, não revela qual campo errou).
- Payload inválido: `400` com `details` por campo (reutiliza `validarLogin` do US02 se o shape bater, ou
  duplica só se o middleware genérico não servir).

```typescript
// backend/src/dtos/Barbeiro.dto.ts
export interface BarbeiroDTO {
  id: number;
  nome: string;
  email: string;
}
```

### Middleware `autenticarBarbeiro` (distingue de token de cliente)
Como cliente e barbeiro usam o mesmo `JWT_SECRET` mas payloads diferentes (`{ clienteId }` vs
`{ barbeiroId }`), o middleware precisa diferenciar:
- Sem token / token malformado / assinatura ou expiração inválida → `401` `NAO_AUTENTICADO` (mesmo código já
  fixado no US02).
- Token válido, mas é um token de **cliente** (`clienteId` presente, sem `barbeiroId`) → `403`
  `ApiErrorResponse`, `code: "ACESSO_NEGADO"`, mensagem "Você não tem permissão para acessar este recurso."
  (aplica a tabela de status HTTP já fixada no `desenvolvedor.md` seção 2.2: 401 = não autenticado, 403 =
  autenticado mas sem permissão).
- Token de barbeiro válido → segue, com `barbeiroId` disponível na `Request` (mesmo padrão do `clienteId` no
  middleware `autenticar` do US02).

---

## Checklist Técnico do Trello (itens `[Front]` NÃO fazem parte desta execução)
- [ ] `[BD]` Confirmar estrutura da tabela Serviços (já modelada na US12 — placeholder abaixo)
- [ ] `[Back - Repository]` Criar query de inserção de novo serviço
- [ ] `[Back - Service]` Validar campos obrigatórios (nome, duração, preço)
- [ ] `[Back - Controller]` Criar endpoint `POST /servicos`, protegido por autenticação do barbeiro
- [ ] ~~`[Front]` Criar formulário de cadastro de serviço~~ — feito pelo responsável de front
- [ ] ~~`[Front]` Exibir feedback visual de validação de campos~~ — feito pelo responsável de front
- [ ] ~~`[Front]` Atualizar lista de serviços após cadastro bem-sucedido~~ — feito pelo responsável de front

## ⚠️ Adição necessária, não listada no checklist do Trello: `GET /servicos`
O critério de aceite 3 ("Serviço cadastrado aparece na lista de serviços") exige uma forma de **listar**
serviços, mas o checklist só lista o `POST`. Sem isso o critério 3 não é testável. Adicionar:
`GET /servicos` — **pública, sem autenticação** (clientes também vão precisar ver a lista pra agendar, US05/06
— não faz sentido travar leitura atrás de login de barbeiro). Só o `POST /servicos` é protegido.

## Schema de Serviços (⚠️ PLACEHOLDER — confirmar com US12)
```sql
-- caminho: database/migrations/{YYYYMMDDHHMMSS}_create_servicos.sql
CREATE TABLE servicos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL,
  preco NUMERIC(10, 2) NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
Preço em `NUMERIC`, nunca float (regra já fixada no `arquiteto.md`). Sem coluna de barbeiro_id — como há um
único barbeiro no sistema (ver Escopo 2.2), não há necessidade de vínculo por enquanto; se isso mudar, é
mudança de escopo a tratar em outro card.

## Contrato de Tipos
```typescript
// backend/src/dtos/Servico.dto.ts
export interface ServicoDTO {
  id: number;
  nome: string;
  duracaoMinutos: number;
  preco: number;
}

export interface CadastroServicoRequestDTO {
  nome: string;
  duracaoMinutos: number;
  preco: number;
}
```
```typescript
// frontend/src/types/servico.types.ts
export interface ServicoDTO {
  id: number;
  nome: string;
  duracaoMinutos: number;
  preco: number;
}

export interface CadastroServicoRequestDTO {
  nome: string;
  duracaoMinutos: number;
  preco: number;
}
```

## Endpoints
`POST /servicos` — protegido por `autenticarBarbeiro`. Recebe `CadastroServicoRequestDTO`.
- Sucesso: `201` com `ServicoDTO`.
- Sem token / token de cliente: `401 NAO_AUTENTICADO` ou `403 ACESSO_NEGADO` (ver middleware acima).
- Payload inválido (nome vazio, duração/preço ausente ou não numérico/≤0): `400` com `details` por campo.

`GET /servicos` — pública.
- Sucesso: `200` com `ServicoDTO[]` (lista vazia se não houver nenhum cadastrado ainda).

## Repository compartilhado
`ServicoRepository`/`InMemoryServicoRepository`, mesmo padrão do `ClienteRepository` — única instância
injetada em `server.ts`, usada tanto pelo `criar` (POST) quanto pelo `listar` (GET).

## Fora de escopo deste card (não implementar)
- Telas de front-end (formulário, feedback, lista) — outra pessoa do time, contra o contrato desta execução.
- Editar ou remover serviço — é o US04, card separado.
- Logout do barbeiro — não pedido por este card; se for necessário depois, reaproveitar o mesmo padrão
  stateless do `POST /logout` do cliente (US02).
- Vincular serviço a um barbeiro específico (`barbeiro_id`) — só faz sentido se o projeto passar a suportar
  múltiplos barbeiros, o que é explicitamente Fora de Escopo do projeto.

## Registro Trello (preencher ao executar)
`Agente: Desenvolvedor TS/SPA | Etapa: Implementação | Pedido: Login do barbeiro (pré-requisito) + cadastro e listagem de serviços — só back-end (US03)`
