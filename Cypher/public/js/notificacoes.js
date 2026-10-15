/* Interações do sino e do popover de notificações. */
(() => {
  const menus = document.querySelectorAll("[data-notifications]");
  if (!menus.length) return;

  const atualizarContador = menu => {
    const contador = menu.querySelector(".notifications-count");
    const naoLidas = menu.querySelectorAll(
      "[data-notification-item].is-unread"
    ).length;
    const botao = menu.querySelector("[data-notifications-trigger]");
    const marcarTodas = menu.querySelector("[data-notifications-read-all]");

    if (botao) {
      botao.setAttribute(
        "aria-label",
        naoLidas
          ? `Abrir notificações: ${naoLidas} não lidas`
          : "Abrir notificações"
      );
    }
    if (contador) {
      contador.textContent = naoLidas > 99 ? "99+" : String(naoLidas);
      contador.setAttribute("aria-label", `${naoLidas} não lidas`);
      contador.hidden = naoLidas === 0;
    }
    if (marcarTodas) marcarTodas.disabled = naoLidas === 0;
  };

  const fechar = (menu, devolverFoco = false) => {
    const painel = menu.querySelector("[data-notifications-panel]");
    const trigger = menu.querySelector("[data-notifications-trigger]");
    if (!painel || !trigger) return;
    painel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    if (devolverFoco) trigger.focus();
  };

  const abrirOuFechar = menu => {
    const painel = menu.querySelector("[data-notifications-panel]");
    const trigger = menu.querySelector("[data-notifications-trigger]");
    if (!painel || !trigger) return;
    const aberto = !painel.hidden;
    painel.hidden = aberto;
    trigger.setAttribute("aria-expanded", String(!aberto));
    if (!aberto) painel.querySelector("a, button")?.focus();
  };

  const enviarAcao = async (form, aoConcluir) => {
    try {
      const resposta = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      if (!resposta.ok) throw new Error("Falha ao atualizar notificação");
      const resultado = await resposta.json();
      if (resultado.sucesso) aoConcluir();
    } catch {
      form.submit();
    }
  };

  menus.forEach(menu => {
    const trigger = menu.querySelector("[data-notifications-trigger]");
    if (!trigger) return;
    trigger.addEventListener("click", () => abrirOuFechar(menu));

    menu.addEventListener("submit", evento => {
      const form = evento.target.closest("form");
      if (
        !form ||
        (!form.matches("[data-notification-read]") &&
          !form.matches("[data-notifications-read-all]"))
      )
        return;
      evento.preventDefault();
      enviarAcao(form, () => {
        if (form.matches("[data-notifications-read]")) {
          const item = form.closest("[data-notification-item]");
          item?.classList.remove("is-unread");
          form.remove();
        } else {
          menu
            .querySelectorAll("[data-notification-item]")
            .forEach(item => item.classList.remove("is-unread"));
          menu
            .querySelectorAll("[data-notification-read]")
            .forEach(item => item.remove());
        }
        atualizarContador(menu);
      });
    });
  });

  document.addEventListener("click", evento => {
    menus.forEach(menu => {
      if (!menu.contains(evento.target)) fechar(menu);
    });
  });

  document.addEventListener("keydown", evento => {
    if (evento.key !== "Escape") return;
    menus.forEach(menu => {
      if (!menu.querySelector("[data-notifications-panel]")?.hidden)
        fechar(menu, true);
    });
  });
})();
