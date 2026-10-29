(() => {
  'use strict';

  const formSelector = 'form[data-atuacao-form]';

  function valuesFor(elements) {
    const first = elements[0];
    if (!first) return undefined;

    if (first.type === 'radio') {
      const selected = elements.find((element) => element.checked);
      if (!selected) return undefined;
      if (selected.getAttribute('data-tipo-resposta-atuacao') === 'booleano') {
        return selected.value === 'true';
      }
      return selected.value;
    }

    if (first.type === 'checkbox') {
      const selected = elements.filter((element) => element.checked).map((element) => element.value);
      return selected.length ? selected : undefined;
    }

    return first.value;
  }

  function collect(form, selector, category) {
    const result = {};
    const elements = Array.from(form.querySelectorAll(selector)).filter((element) => {
      const panel = element.closest('[data-atuacao-questionario][data-categoria]');
      return panel && panel.dataset.categoria === category && !element.disabled;
    });
    const grouped = new Map();

    elements.forEach((element) => {
      const key = element.getAttribute(selector === '[data-resposta-atuacao]' ? 'data-resposta-atuacao' : 'data-visibilidade-atuacao');
      if (!key) return;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(element);
    });

    grouped.forEach((items, key) => {
      const value = valuesFor(items);
      if (value !== undefined && !(typeof value === 'string' && value.trim() === '')) {
        result[key] = value;
      }
    });

    return result;
  }

  function updateDependencies(panel) {
    panel.querySelectorAll('[data-depende-campo]').forEach((field) => {
      const parentName = field.getAttribute('data-depende-campo');
      const parentValue = field.getAttribute('data-depende-valor');
      const parents = Array.from(panel.querySelectorAll('[data-resposta-atuacao]'))
        .filter((control) => control.getAttribute('data-resposta-atuacao') === parentName);
      const active = parents.some((control) => control.checked && control.value === parentValue);
      field.hidden = !active;
      field.querySelectorAll('input, select, textarea').forEach((control) => {
        control.disabled = !active;
        if (!active) {
          if (control.type === 'checkbox' || control.type === 'radio') control.checked = false;
          else control.value = '';
        }
      });
    });
  }

  function updatePanels(form) {
    const checked = new Set(
      Array.from(form.querySelectorAll('[name="categorias"]:checked')).map((input) => input.value)
    );

    form.querySelectorAll('[data-atuacao-questionario][data-categoria]').forEach((panel) => {
      const category = panel.dataset.categoria;
      const visible = checked.has(category);
      panel.hidden = !visible;

      const controls = form.querySelectorAll('[name="categorias"]');
      controls.forEach((control) => {
        if (control.value !== category) return;
        if (panel.id) control.setAttribute('aria-controls', panel.id);
        control.setAttribute('aria-expanded', String(visible));
      });
      updateDependencies(panel);
    });
  }

  function serialize(form) {
    const responses = {};
    const visibilities = {};
    const checked = new Set(
      Array.from(form.querySelectorAll('[name="categorias"]:checked')).map((input) => input.value)
    );

    form.querySelectorAll('[data-atuacao-questionario][data-categoria]').forEach((panel) => {
      const category = panel.dataset.categoria;
      if (!checked.has(category)) return;
      responses[category] = collect(form, '[data-resposta-atuacao]', category);
      visibilities[category] = collect(form, '[data-visibilidade-atuacao]', category);
      const categoryVisibility = panel.querySelector('[data-visibilidade-categoria]');
      if (categoryVisibility) {
        const key = categoryVisibility.getAttribute('data-visibilidade-categoria');
        if (key) visibilities[category][key] = categoryVisibility.value;
      }
    });

    const responsesInput = form.querySelector('input[data-respostas-atuacoes-json]');
    const visibilitiesInput = form.querySelector('input[data-visibilidades-atuacoes-json]');
    if (responsesInput) responsesInput.value = JSON.stringify(responses);
    if (visibilitiesInput) visibilitiesInput.value = JSON.stringify(visibilities);
  }

  document.querySelectorAll(formSelector).forEach((form) => {
    form.addEventListener('change', (event) => {
      if (event.target.matches('[name="categorias"]')) updatePanels(form);
      else form.querySelectorAll('[data-atuacao-questionario]').forEach(updateDependencies);
    });
    form.addEventListener('submit', () => serialize(form));
    updatePanels(form);
  });
})();
