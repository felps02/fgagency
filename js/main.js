/* =========================================================
   FG AGENCY — Landing page
   ========================================================= */

/* ---------- Configuração ----------
   Número do WhatsApp com DDI + DDD, só dígitos (ex.: '5511999999999').
   Com o número preenchido, os botões e o formulário abrem a conversa com a mensagem pronta.
   Sem ele, usamos o link do QR code do perfil e o formulário copia a mensagem para colar. */
const WHATSAPP_NUMBER = '';
const WHATSAPP_QR_LINK = 'https://wa.me/qr/AC6PTSZQ235WK1';

function whatsappUrl(text) {
  if (!WHATSAPP_NUMBER) return WHATSAPP_QR_LINK;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${WHATSAPP_NUMBER}${query}`;
}

document.querySelectorAll('[data-wa]').forEach((link) => {
  link.href = whatsappUrl(link.dataset.wa);
});

/* ---------- Cabeçalho ao rolar ---------- */
const header = document.querySelector('.site-header');
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ---------- Menu mobile ---------- */
const menuToggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
}

menuToggle.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenu(false);
});
window.matchMedia('(min-width: 861px)').addEventListener('change', (mq) => {
  if (mq.matches) setMenu(false);
});

/* ---------- Animação de entrada ---------- */
const revealEls = document.querySelectorAll('.reveal');

function finishReveal(el) {
  el.addEventListener('transitionend', function done(event) {
    if (event.target !== el || event.propertyName !== 'opacity') return;
    el.classList.remove('reveal');
    el.removeEventListener('transitionend', done);
  });
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      finishReveal(entry.target);
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Formulário → WhatsApp ---------- */
const form = document.getElementById('form-contato');
const formNote = document.getElementById('form-note');

function showNote(message, state) {
  formNote.textContent = message;
  formNote.dataset.state = state;
}

// Cópia síncrona: roda dentro do clique, antes de a nova aba roubar o foco.
function copyText(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
  area.remove();
  return copied;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const nameInput = form.elements.nome;
  const nome = nameInput.value.trim();
  const marca = form.elements.marca.value.trim();
  const servico = form.elements.servico.value;
  const mensagem = form.elements.mensagem.value.trim();

  if (!nome) {
    nameInput.setAttribute('aria-invalid', 'true');
    nameInput.focus();
    showNote('Por favor, informe o seu nome.', 'error');
    return;
  }
  nameInput.removeAttribute('aria-invalid');

  const lines = [`Olá, FG Agency! Me chamo ${nome}${marca ? ` (${marca})` : ''}.`];
  if (servico) lines.push(`Tenho interesse em: ${servico}.`);
  if (mensagem) lines.push(mensagem);
  const text = lines.join('\n');

  if (WHATSAPP_NUMBER) {
    window.open(whatsappUrl(text), '_blank', 'noopener');
    showNote('Abrindo o WhatsApp com a sua mensagem…', 'ok');
    return;
  }

  const copied = copyText(text);
  window.open(WHATSAPP_QR_LINK, '_blank', 'noopener');
  showNote(
    copied
      ? 'Mensagem copiada! É só colar na conversa do WhatsApp que abriu.'
      : 'Abrimos o WhatsApp — conte pra gente sobre o seu projeto por lá.',
    'ok'
  );
});

form.elements.nome.addEventListener('input', (event) => {
  if (event.target.value.trim()) event.target.removeAttribute('aria-invalid');
});

/* ---------- Ano no rodapé ---------- */
document.getElementById('ano').textContent = new Date().getFullYear();
