(() => {
  "use strict";

  const editor = document.querySelector("[data-profile-editor]");
  if (!editor) return;

  const tabs = [...editor.querySelectorAll("[data-profile-edit-tab]")];
  const panels = [...editor.querySelectorAll("[data-profile-edit-panel]")];
  const forms = [...editor.querySelectorAll("form[data-profile-section-form]")];
  const draftStatus = editor.querySelector("[data-profile-draft-status]");
  const markers = new Map();
  const snapshots = new Map();
  const dirtyForms = new Set();
  let submitting = false;

  const sectionExists = name =>
    panels.some(panel => panel.dataset.profileEditPanel === name);

  function setSection(name, updateAddress = true) {
    const section = sectionExists(name)
      ? name
      : editor.dataset.defaultSection || "pessoal";
    panels.forEach(panel => {
      panel.hidden = panel.dataset.profileEditPanel !== section;
    });
    tabs.forEach((tab, index) => {
      const active = tab.dataset.profileEditTab === section;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle("is-active", active);
      if (active) tab.focus({ preventScroll: true });
    });

    if (updateAddress) {
      const url = new URL(window.location.href);
      url.searchParams.set("secao", section);
      window.history.replaceState(window.history.state, "", url);
    }
  }

  function fingerprint(form) {
    return JSON.stringify(
      [...form.querySelectorAll("input, select, textarea")].map(control => ({
        name:
          control.name ||
          control.dataset.respostaAtuacao ||
          control.dataset.visibilidadeAtuacao ||
          control.dataset.visibilidadeCategoria ||
          control.id,
        type: control.type,
        value:
          control.type === "checkbox" || control.type === "radio"
            ? control.checked
            : control.value,
        disabled: control.disabled,
      }))
    );
  }

  function labelFor(form) {
    const section = form.dataset.profileSection;
    return (
      tabs
        .find(tab => tab.dataset.profileEditTab === section)
        ?.textContent.trim() || "esta seção"
    );
  }

  function updateDraftStatus() {
    const dirtySections = new Set([...dirtyForms].map(form => labelFor(form)));
    tabs.forEach(tab => {
      const section = tab.dataset.profileEditTab;
      const hasDraft = [...dirtyForms].some(
        form => form.dataset.profileSection === section
      );
      let marker = markers.get(tab);
      if (!marker) {
        marker = document.createElement("span");
        marker.className = "profile-edit-tab__draft";
        marker.textContent = "Não salvo";
        marker.hidden = true;
        tab.append(marker);
        markers.set(tab, marker);
      }
      marker.hidden = !hasDraft;
    });

    if (!draftStatus) return;
    draftStatus.hidden = dirtySections.size === 0;
    draftStatus.textContent = dirtySections.size
      ? `Há alterações ainda não salvas em: ${[...dirtySections].join(", ")}. Trocar de seção mantém estes rascunhos nesta página; salve cada um antes de sair.`
      : "";
  }

  function checkForm(form) {
    const current = fingerprint(form);
    if (current === snapshots.get(form)) dirtyForms.delete(form);
    else dirtyForms.add(form);
    updateDraftStatus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setSection(tab.dataset.profileEditTab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
              tabs.length;
      tabs[nextIndex]?.click();
    });
  });

  forms.forEach(form => {
    snapshots.set(form, fingerprint(form));
    form.addEventListener("input", () => checkForm(form));
    form.addEventListener("change", () => checkForm(form));
    form.addEventListener("submit", () => {
      submitting = true;
      const button = form.querySelector('button[type="submit"]');
      if (button) {
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        button.dataset.originalText = button.textContent.trim();
        button.textContent = "Salvando…";
      }
    });
  });

  window.addEventListener("beforeunload", event => {
    if (dirtyForms.size === 0 || submitting) return;
    event.preventDefault();
    event.returnValue = "";
  });

  const requested = new URL(window.location.href).searchParams.get("secao");
  setSection(
    sectionExists(requested)
      ? requested
      : editor.dataset.defaultSection || "pessoal",
    false
  );
})();
