// Sem build/bundler no front-end ainda: ajuste este valor se a API rodar em outro host/porta.
const API_BASE_URL = 'http://localhost:3000';

// Token guardado em memória (variável de módulo), nunca em localStorage/sessionStorage
// (risco de XSS) — decisão fixada para o projeto. Trade-off aceito: sessão se perde ao
// recarregar a página. Quando a SPA autenticada (dashboard etc.) existir, essa variável
// deve migrar para o módulo de sessão compartilhado do router, não ficar duplicada aqui.
let sessaoBarbeiro = null;

// Ponto de leitura para quando a SPA autenticada existir (nenhuma tela consome isto ainda).
export function obterSessaoBarbeiro() {
  return sessaoBarbeiro;
}

const form = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const emailField = emailInput.closest('.field');
const passwordField = passwordInput.closest('.field');
const alertBox = document.getElementById('login-alert');
const submitButton = document.getElementById('login-submit');
const authBox = document.getElementById('view-login');

const togglePasswordButton = document.getElementById('toggle-login-password');
const togglePasswordIcon = togglePasswordButton.querySelector('i');

togglePasswordButton.addEventListener('click', () => {
  const estaOculta = passwordInput.type === 'password';
  passwordInput.type = estaOculta ? 'text' : 'password';
  togglePasswordIcon.classList.toggle('bx-show', !estaOculta);
  togglePasswordIcon.classList.toggle('bx-hide', estaOculta);
  togglePasswordButton.setAttribute('aria-label', estaOculta ? 'Ocultar senha' : 'Mostrar senha');
});

function marcarErroDeCampo(campoEl, mensagem) {
  campoEl.classList.add('has-error');
  if (mensagem) {
    campoEl.querySelector('.field__error').textContent = mensagem;
  }
}

function limparErrosDeCampo() {
  emailField.classList.remove('has-error');
  passwordField.classList.remove('has-error');
}

function esconderAlerta() {
  alertBox.hidden = true;
  alertBox.classList.remove('alert--success');
  alertBox.classList.add('alert--danger');
}

function mostrarAlerta(mensagem, tipo = 'danger') {
  alertBox.textContent = mensagem;
  alertBox.classList.toggle('alert--danger', tipo === 'danger');
  alertBox.classList.toggle('alert--success', tipo === 'success');
  alertBox.hidden = false;
}

function sacudirCard() {
  authBox.classList.add('shake');
  authBox.addEventListener('animationend', () => authBox.classList.remove('shake'), { once: true });
}

function definirCarregando(carregando) {
  submitButton.disabled = carregando;
  submitButton.classList.toggle('is-loading', carregando);
}

const CAMPO_POR_CHAVE_BACKEND = {
  email: emailField,
  senha: passwordField,
};

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErrosDeCampo();
  esconderAlerta();

  const email = emailInput.value.trim();
  const senha = passwordInput.value;

  let temErro = false;
  if (email === '') {
    marcarErroDeCampo(emailField, 'O e-mail é obrigatório.');
    temErro = true;
  }
  if (senha === '') {
    marcarErroDeCampo(passwordField, 'A senha é obrigatória.');
    temErro = true;
  }
  if (temErro) {
    return;
  }

  definirCarregando(true);
  try {
    const resposta = await fetch(`${API_BASE_URL}/login-barbeiro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const dados = await resposta.json();

    if (!resposta.ok) {
      const erro = dados.error ?? {};
      const details = erro.details ?? null;

      if (details) {
        for (const [chave, mensagem] of Object.entries(details)) {
          const campoEl = CAMPO_POR_CHAVE_BACKEND[chave];
          if (campoEl) {
            marcarErroDeCampo(campoEl, mensagem);
          }
        }
      } else {
        mostrarAlerta(erro.message ?? 'Não foi possível entrar. Tente novamente.');
        sacudirCard();
      }
      return;
    }

    sessaoBarbeiro = { token: dados.token, barbeiro: dados.barbeiro };
    mostrarAlerta('Login realizado com sucesso.', 'success');
    form.reset();
  } catch {
    mostrarAlerta(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
    sacudirCard();
  } finally {
    definirCarregando(false);
  }
});
