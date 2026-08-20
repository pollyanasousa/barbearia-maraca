# Skill/Card — US01: Cadastro de Conta do Cliente

> Card real do Trello (Sprint 1, 3 pts, Alta). **Esta execução cobre só o back-end** — o front-end deste card
> é responsabilidade de outra pessoa do time e será conectado depois contra o contrato definido aqui (DTOs +
> endpoint `POST /clientes`). Formato de entrada esperado pelo `.opencode/agent/desenvolvedor.md`.

## História de Usuário
Como **cliente**, quero **criar uma conta**, para **acessar o sistema de agendamento**.

## Objetivo
Permitir que o cliente crie uma conta própria no sistema para poder agendar cortes de forma autônoma. O
cadastro deve coletar as informações mínimas para identificar o cliente e vincular futuros agendamentos a ele.

## Regras
- E-mail deve ser único no sistema (não pode haver duas contas com o mesmo e-mail).
- Senha deve ser armazenada de forma segura (hash), nunca em texto puro.
- Validação de campos obrigatórios no front-end e no back-end (RF04).

## Por que isso vem cedo
Sem conta de cliente, nenhuma outra funcionalidade voltada ao cliente (login, agendamento) pode ser testada.

## Escopo desta execução
**Só back-end.** A tela de cadastro (itens `[Front]` do Checklist Técnico) fica de fora desta execução — vai
ser feita pelo responsável de front-end e conectada depois. O que sai daqui precisa ser suficiente pra essa
integração futura sem retrabalho: contrato de tipos fechado (`CadastroClienteRequestDTO`/`ClienteDTO`),
endpoint `POST /clientes` respondendo exatamente os status/erros da seção "Endpoint", testável via
Postman/Insomnia/curl. O mock em memória do banco (seção "Estratégia de implementação SEM banco configurado")
não muda nada desse contrato — quando o Postgres entrar, só troca o repository por baixo.

## Critérios de Aceite
1. Cliente consegue preencher formulário de cadastro com **nome, e-mail, senha e telefone**.
2. Sistema valida e-mail duplicado e exibe mensagem de erro amigável.
3. Senha é armazenada com hash (nunca texto puro) no banco de dados.
4. Após cadastro bem-sucedido, cliente é redirecionado para a tela de login.

## Confirmação de Escopo (não é mudança — já estava no Escopo original)
Correção de uma suposição anterior: o `arquiteto.md` chegou a assumir que só o `barbeiro` teria login. Isso
estava errado — o **Documento de Escopo do Projeto** (Épico E1: "Cadastro e login para Cliente e Barbeiro";
persona Cliente: "Cria conta") já previa login de cliente desde o início. Já corrigido no `arquiteto.md`.

## Checklist Técnico (Trello — itens `[Front]` NÃO fazem parte desta execução)
- [ ] `[BD]` Confirmar estrutura da tabela `Clientes` (já modelada na US12 — ver aviso abaixo)
- [ ] `[Back - Repository]` Criar query/método de inserção de novo cliente
- [ ] `[Back - Service]` Validar e-mail duplicado antes de criar conta
- [ ] `[Back - Service]` Aplicar hash na senha antes de salvar
- [ ] `[Back - Controller]` Criar endpoint `POST /clientes`
- [ ] ~~`[Front]` Criar formulário de cadastro (nome, e-mail, senha, telefone)~~ — feito pelo responsável de front
- [ ] ~~`[Front]` Exibir mensagens de erro de validação (e-mail duplicado, campo vazio)~~ — feito pelo responsável de front
- [ ] ~~`[Front]` Redirecionar para tela de login após cadastro bem-sucedido~~ — feito pelo responsável de front

## Schema necessário (⚠️ PLACEHOLDER — tabela `clientes` já modelada na US12, ainda não confirmada aqui)
O checklist do Trello indica que esta tabela **já foi modelada na US12**, ou seja, o DDL abaixo é uma
suposição minha até ser confirmado contra o schema real da US12. **Antes de gerar a migration de verdade,
confirme se este schema bate com a US12** (nomes de coluna, tipos, constraints); se divergir, ajuste este
card primeiro. Reutiliza a convenção de nomenclatura já fixada para senha (`senha_hash`).

```sql
-- caminho: database/migrations/{YYYYMMDDHHMMSS}_create_clientes.sql
-- (gerar timestamp UTC real no momento da execução; CREATE TABLE pois a tabela ainda não existe)
CREATE TABLE clientes (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Estratégia de implementação SEM banco configurado ainda (mock)
O banco de dados real (Postgres) ainda não está configurado neste projeto. Para não bloquear este card:
- Implemente `backend/src/repositories/ClienteRepository.ts` como uma **interface** (`criar`, `buscarPorEmail`).
- Implemente `InMemoryClienteRepository` (array/Map em memória, dados perdidos ao reiniciar o servidor) como a
  implementação usada por enquanto no `service`.
- O `controller` e o `service` não devem saber que a implementação é em memória — devem depender só da
  interface. Quando o Postgres estiver configurado, troca-se apenas a implementação injetada
  (`PostgresClienteRepository`), sem alterar `controller`/`service`.
- Deixe um comentário no arquivo do repository em memória indicando que é temporário e deve ser substituído
  quando a migration acima for aplicada.

**Importante — o arquivo de migration é escrito, mas não executado nesta etapa:** gere normalmente o arquivo
`database/migrations/{timestamp}_create_clientes.sql` da seção "Schema necessário" (fica como scaffold pronto
pro dia em que o Postgres existir). Isso é diferente de *aplicar* essa migration num banco real — não tente
conectar a nenhum Postgres nem rodar esse `.sql` nesta etapa; o `InMemoryClienteRepository` não lê nem escreve
nesse arquivo, é puramente TypeScript em memória. Cadastro/validação/hash de senha precisam funcionar de ponta
a ponta (front → controller → service → repository em memória) sem nenhuma migration ter sido aplicada.

## Contrato de Tipos (ponto de partida — ajustar/estender no card)
```typescript
// backend/src/dtos/Cliente.dto.ts
export interface ClienteDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface CadastroClienteRequestDTO {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}
```
```typescript
// frontend/src/types/cliente.types.ts
export interface ClienteDTO {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

export interface CadastroClienteRequestDTO {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}
```

## Endpoint
`POST /clientes` — recebe `CadastroClienteRequestDTO`.
- Sucesso: `201` com `ClienteDTO` (nunca retornar `senha`/`senha_hash` no corpo da resposta).
- E-mail duplicado: `409` (conflito de regra de negócio) com `ApiErrorResponse`,
  `code: "CLIENTE_EMAIL_JA_CADASTRADO"`, mensagem amigável.
- Payload inválido (campo obrigatório ausente/e-mail mal formatado): `400` com `ApiErrorResponse` e `details`
  por campo.

## Fora de escopo deste card (não implementar)
- Tela de cadastro no front-end (formulário, validação visual, redirecionamento) — feita por outra pessoa do
  time, contra o contrato desta execução.
- Login do cliente em si (autenticação/token) — card separado, futuro.
- Recuperação de senha.
- Edição de perfil do cliente.

## Registro Trello (preencher ao executar)
`Agente: Desenvolvedor TS/SPA | Etapa: Implementação | Pedido: Cadastro de conta do cliente — só back-end (US01)`
