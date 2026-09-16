import { cloneData } from '../models/prototypeModel.js';
import { loginView, exploreView, dashboardView, profileView, portfolioView, worksView, beatsView, eventsView, collaborationView, knowledgeView, formView, notFoundView } from '../views/prototypeViews.js';

const protectedRoutes = new Set(['/dashboard', '/perfil', '/perfil/editar', '/portfolio', '/obras', '/obras/cadastro', '/beats/cadastro', '/eventos/cadastro', '/oportunidades/cadastro', '/colaboracao']);
const formRoutes = { '/cadastro': 'cadastro', '/obras/cadastro': 'obra', '/beats/cadastro': 'beat', '/eventos/cadastro': 'evento', '/oportunidades/cadastro': 'oportunidade', '/perfil/editar': 'perfil' };

export class PrototypeController {
  constructor(root) {
    this.root = root;
    this.data = cloneData();
    this.state = { mode: 'guest', user: this.data.user, ...this.data };
    this.message = '';
    this.loadSession();
    window.addEventListener('hashchange', () => this.renderRoute());
    document.addEventListener('click', (event) => this.handleClick(event));
    document.addEventListener('submit', (event) => this.handleSubmit(event));
    this.renderRoute();
  }

  loadSession() {
    try {
      const stored = sessionStorage.getItem('cypher-prototype-session');
      if (stored) this.state.mode = JSON.parse(stored).mode || 'guest';
    } catch { this.state.mode = 'guest'; }
  }

  saveSession(mode) {
    this.state.mode = mode;
    if (mode === 'guest') sessionStorage.removeItem('cypher-prototype-session');
    else sessionStorage.setItem('cypher-prototype-session', JSON.stringify({ mode }));
  }

  currentPath() {
    return window.location.hash.replace(/^#/, '') || (this.state.mode === 'user' ? '/dashboard' : this.state.mode === 'ghost' ? '/explorar' : '/login');
  }

  go(path) {
    if (window.location.hash === `#${path}`) this.renderRoute();
    else window.location.hash = path;
  }

  showMessage(message) {
    this.message = message;
    this.renderRoute();
  }

  renderRoute() {
    const path = this.currentPath();
    let html;
    if (path === '/login') html = loginView(this.message);
    else if (protectedRoutes.has(path) && this.state.mode !== 'user') html = loginView('Faça o login demonstrativo para acessar esta área.');
    else if (path === '/' || path === '/explorar') html = exploreView(this.state);
    else if (path === '/dashboard') html = dashboardView(this.state);
    else if (path === '/perfil') html = profileView(this.state);
    else if (path === '/portfolio') html = portfolioView(this.state);
    else if (path === '/obras') html = worksView(this.state);
    else if (path === '/beats') html = beatsView(this.state);
    else if (path === '/eventos') html = eventsView(this.state);
    else if (path === '/colaboracao') html = collaborationView(this.state);
    else if (path === '/conhecimento') html = knowledgeView(this.state);
    else if (formRoutes[path]) html = formView(this.state, formRoutes[path]);
    else html = notFoundView(this.state);
    this.root.innerHTML = html;
    document.title = `Cypher — ${this.pageTitle(path)}`;
    this.message = '';
    this.syncActiveNavigation(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  pageTitle(path) {
    return ({ '/login': 'Entrar', '/explorar': 'Explorar', '/dashboard': 'Dashboard', '/perfil': 'Perfil', '/portfolio': 'Portfólio', '/obras': 'Obras', '/beats': 'Beats', '/eventos': 'Eventos', '/colaboracao': 'Colaboração', '/conhecimento': 'Conhecimento' }[path] || 'Protótipo');
  }

  syncActiveNavigation(path) {
    this.root.querySelectorAll('[data-route]').forEach((link) => {
      const target = link.dataset.route;
      link.classList.toggle('active', target === path || (target === '/obras' && path.startsWith('/obras')));
    });
  }

  handleClick(event) {
    const routeLink = event.target.closest('[data-route]');
    if (routeLink) {
      event.preventDefault();
      this.go(routeLink.dataset.route);
      return;
    }

    if (event.target.closest('[data-ghost-login]')) {
      event.preventDefault();
      this.saveSession('ghost');
      this.go('/explorar');
      return;
    }

    if (event.target.closest('[data-logout]')) {
      event.preventDefault();
      this.saveSession('guest');
      this.go('/login');
      return;
    }

    if (event.target.closest('[data-theme-toggle]')) {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('cypher-prototype-theme', next);
      const label = this.root.querySelector('[data-theme-label]');
      const icon = this.root.querySelector('[data-theme-icon]');
      if (label) label.textContent = next === 'dark' ? 'Tema claro' : 'Tema escuro';
      if (icon) icon.textContent = next === 'dark' ? '☼' : '◐';
      return;
    }

    const player = event.target.closest('[data-demo-player]');
    if (player) {
      player.classList.toggle('playing');
      player.textContent = player.classList.contains('playing') ? 'Ⅱ Pausar demonstração' : '▶ Ouvir demonstração';
      return;
    }

    if (event.target.closest('[data-prototype-action]')) {
      event.preventDefault();
      this.toast('Ação visual do protótipo — nenhum dado foi enviado ou salvo.');
    }

    if (event.target.closest('[data-route-back]')) {
      event.preventDefault();
      this.go(this.state.mode === 'user' ? '/dashboard' : '/explorar');
    }
  }

  handleSubmit(event) {
    const loginForm = event.target.closest('[data-login-form]');
    if (loginForm) {
      event.preventDefault();
      const form = new FormData(loginForm);
      const login = String(form.get('login') || '').trim().toLowerCase();
      const password = String(form.get('password') || '');
      const validLogin = login === 'lianoise' || login === 'cypher@demo.com';
      if (validLogin && password === 'cypher123') {
        this.saveSession('user');
        this.go('/dashboard');
      } else {
        this.showMessage('Login demonstrativo inválido. Use lianoise e cypher123.');
      }
      return;
    }

    const prototypeForm = event.target.closest('[data-prototype-form]');
    if (prototypeForm) {
      event.preventDefault();
      this.toast('Formulário demonstrativo — os dados não foram enviados nem persistidos.');
    }

    const filterForm = event.target.closest('[data-filter-form]');
    if (filterForm) {
      event.preventDefault();
      this.toast('Filtro visual aplicado apenas para a demonstração.');
    }
  }

  toast(message) {
    const region = document.querySelector('#toast-region');
    if (!region) return;
    region.innerHTML = `<div class="prototype-toast">${message}</div>`;
    window.setTimeout(() => { region.innerHTML = ''; }, 3200);
  }
}
