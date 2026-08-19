# Skill/Card — US02: Login e Logout do Cliente

> Card real do Trello (Sprint 1, 2 pts, Alta). **Esta execução cobre só o back-end** — os 2 itens `[Front]`
> do Checklist Técnico ficam fora, mesmo padrão do US01. Formato de entrada esperado pelo
> `.opencode/agent/desenvolvedor.md`.

## História de Usuário
Como **cliente**, quero **fazer login e logout**, para **acessar minhas informações com segurança**.

## Objetivo
Permitir que o cliente (já cadastrado, ver US01) acesse e saia do sistema com segurança, protegendo suas
informações e agendamentos.

## Regras
- Login exige e-mail e senha cadastrados.
- Sistema deve validar credenciais e retornar erro amigável se estiverem incorretas (RF04).
- Sessão do usuário deve expirar ou ser encerrada corretamente no logout.
- Rotas protegidas (RF02) só podem ser acessadas por usuário autenticado.

## Por que isso vem cedo
Login é o que protege o restante da aplicação — sem ele, não existe controle de quem está agendando o quê.

## Escopo desta execução
**Só back-end.** Formulário de login e exibição de erro (itens `[Front]`) ficam para o responsável de
front-end, contra o contrato fechado aqui (`LoginRequestDTO`/`LoginResponseDTO` + `POST /login`/`POST /logout`).

## Critérios de Aceite
1. Cliente consegue fazer login com e-mail e senha corretos.
2. Sistema exibe mensagem de erro clara ao tentar login com credenciais inválidas.
3. Cliente consegue fazer logout e a sessão é encerrada corretamente.
4. Rotas protegidas redirecionam para tela de login se usuário não estiver autenticado.

(Critérios 1, 2 e 4 dependem também do front-end para fechar 100% — igual aconteceu no US01. O que sai daqui
cobre a parte de back de cada um: back retorna token/erro certo, e retorna 401 em rota protegida sem token.)

## Checklist Técnico (Trello — itens `[Front]` NÃO fazem parte desta execução)
- [ ] `[Back - Repository]` Criar query de busca de cliente por e-mail — **já existe**: `buscarPorEmail` já foi
      criado no `ClienteRepository`/`InMemoryClienteRepository` do US01. Reutilizar, não recriar.
- [ ] `[Back - Service]` Validar credenciais (e-mail + senha com hash)
- [ ] `[Back - Service]` Gerar e gerenciar token/sessão de autenticação
- [ ] `[Back - Controller]` Criar endpoint `POST /login`
- [ ] `[Back - Controller]` Criar endpoint `POST /logout`
- [ ] `[Back - Middleware]` Criar middleware de autenticação para proteger rotas (RF02)
- [ ] ~~`[Front]` Criar formulário de login (e-mail + senha)~~ — feito pelo responsável de front
- [ ] ~~`[Front]` Exibir mensagem de erro em credenciais inválidas~~ — feito pelo responsável de front

## Decisões técnicas já fixadas (reutilizar, não redecidir — ver `desenvolvedor.md` seções 2.3/2.5)
- **JWT** assinado no back-end, enviado no header `Authorization: Bearer <token>`. Front guarda em memória
  (fora do escopo desta execução, é responsabilidade do front).
- Env vars já fixas: `JWT_SECRET`, `JWT_EXPIRES_IN` (já estão em `backend/.env.example`, adicionadas no US01).
- Hash de senha: **bcrypt** (já usado no US01, reutilizar `bcrypt.compare` aqui para conferir a senha).
- **Não implementar refresh token nem persistência de sessão** (trade-off já aceito pelo time) — a sessão expira
  sozinha via `exp` do JWT (`JWT_EXPIRES_IN`).

## Decisão nova deste card (registrar no `desenvolvedor.md` depois de executar)
- Payload do JWT: `{ clienteId: number }`, assinado com `JWT_SECRET`, expiração `JWT_EXPIRES_IN`.
- Código de erro de login inválido: `code: "CREDENCIAIS_INVALIDAS"` (`401`), mensagem genérica — **não revelar**
  se foi o e-mail ou a senha que errou (mesma lógica de segurança já usada no US01 pra e-mail duplicado, mas
  aqui é o oposto: não vazar informação).
- Código de erro de rota protegida sem token válido (middleware): `code: "NAO_AUTENTICADO"` (`401`).
- **`POST /logout` é stateless por design** (consequência direta do trade-off "sem refresh token/persistência de
  sessão" já fixado): como o JWT não fica guardado em nenhum lugar no back-end (nem em memória, nem em banco),
  não existe nada pra "invalidar" no servidor. O endpoint existe para simetria da API e para o front ter uma
  chamada explícita de logout, mas a ação real de encerrar a sessão é o **front-end descartar o token da
  memória**. `POST /logout` deve exigir autenticação (usa o mesmo middleware) e responder `204` sem corpo — não
  crie blacklist de token nem tabela de sessões, isso seria escopo novo não pedido pelo card.

## Middleware de autenticação (reutilizável para rotas futuras)
Criar como middleware exportável (ex: `backend/src/middlewares/autenticar.ts`), não acoplado só ao cliente —
outros cards (ex: rotas de agendamento) vão reusar o mesmo middleware depois. Comportamento:
- Lê o header `Authorization: Bearer <token>`; ausente ou mal formatado → `401` `NAO_AUTENTICADO`.
- Verifica assinatura e expiração do JWT com `JWT_SECRET`; inválido/expirado → `401` `NAO_AUTENTICADO`.
- Válido → segue pra próxima etapa da rota com o `clienteId` do token disponível pro controller/service (ex:
  anexado na própria `Request`).

## Contrato de Tipos (ponto de partida — ajustar/estender no card)
```typescript
// backend/src/dtos/Auth.dto.ts
export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  token: string;
  cliente: ClienteDTO; // reutiliza o ClienteDTO já criado no US01, não duplicar campos
}
```
```typescript
// frontend/src/types/auth.types.ts
export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface LoginResponseDTO {
  token: string;
  cliente: ClienteDTO;
}
```
(O arquivo do front-end é só o contrato — não crie a tela em si, ver "Escopo desta execução".)

## Endpoints
`POST /login` — recebe `LoginRequestDTO`.
- Sucesso: `200` com `LoginResponseDTO`.
- Credenciais inválidas (e-mail não existe OU senha não confere): `401` com `ApiErrorResponse`,
  `code: "CREDENCIAIS_INVALIDAS"`, mensagem genérica.
- Payload inválido (campo ausente): `400` com `ApiErrorResponse` e `details` por campo.

`POST /logout` — protegida pelo middleware de autenticação.
- Sucesso: `204`, sem corpo.
- Sem token / token inválido: `401` com `ApiErrorResponse`, `code: "NAO_AUTENTICADO"`.

## Repository compartilhado (não duplicar o mock)
O `ClienteRepository`/`InMemoryClienteRepository` do US01 precisa ser a **mesma instância** usada tanto pelo
fluxo de cadastro quanto pelo de login (injeção de dependência única em `server.ts`) — senão login nunca vai
encontrar um cliente cadastrado na mesma execução do servidor. Não criar um segundo repository separado só
para autenticação.

## Dependências novas
Adicionar `jsonwebtoken` (+ `@types/jsonwebtoken` em dev) ao `backend/package.json`.

## Fora de escopo deste card (não implementar)
- Tela de login no front-end — feita por outra pessoa do time, contra o contrato desta execução.
- Refresh token / persistência de sessão entre reloads (trade-off já aceito).
- Login do barbeiro — persona separada, ainda sem card no backlog.
- Recuperação de senha.
- Blacklist/invalidação de token no logout.

## Registro Trello (preencher ao executar)
`Agente: Desenvolvedor TS/SPA | Etapa: Implementação | Pedido: Login e logout do cliente — só back-end (US02)`
