# Frontend — Formulário de Login (Barbearia Maracá)

Entrega inicial do front-end: **formulário de acesso da área administrativa**, em versão estática (HTML + CSS, sem JavaScript), conforme escopo acordado com a equipe.

## Como visualizar

Basta abrir `login.html` no navegador — ou servir a pasta:

```bash
cd frontend
python3 -m http.server 8080
# http://localhost:8080/login.html
```

## O que está incluído

| Arquivo | Papel |
|---|---|
| `login.html` | Cartão de login: campos Email/Senha, alternador de visibilidade da senha (decorativo nesta versão) e botão Entrar |
| `css/variables.css` | Design tokens (cores, espaçamentos) |
| `css/base.css` | Reset e estilos base |
| `css/components.css` | Componentes (botões, fields, alerts) |
| `css/auth.css` | Layout específico da tela de autenticação |

Dependências externas via CDN apenas: Boxicons 2.1.4 e Google Fonts (Inter).

## Fora desta entrega

- Validação client-side e feedback de erro (o bloco `.alert` já existe oculto no markup, pronto para receber mensagens)
- Bloqueio após tentativas inválidas e gerenciamento de sessão/token
- Fluxos de recuperar/redefinir senha (prototipados separadamente)
- Demais telas do sistema (dashboard de agendamentos etc.)

A lógica completa de login (validação, bloqueio, chamada HTTP) já está prototipada no projeto pessoal da frente de front e será integrada em PRs seguintes.

## Contrato esperado do back-end

Conforme implementado na API deste repositório (`backend/`, US02/US03):

```
POST /login-barbeiro        → login do administrador/barbeiro
Body: { "email": string, "senha": string }
200 → token JWT             401 → CREDENCIAIS_INVALIDAS (mensagem genérica)
```

O formulário consumirá este endpoint quando a camada JS for integrada.
