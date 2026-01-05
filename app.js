/* ============================
   ACCOUNT SWITCHER + PROFILE SCOPES
   ============================ */
(function () {
  const trigger = document.querySelector(".account-trigger");
  const menu = document.querySelector(".account-menu");
  const currentName = document.getElementById("currentAccountName");

  if (!trigger || !menu || !currentName) return;

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (menu.hidden) openMenu();
    else closeMenu();
  }

  // Klik na "Profi-DJ ▾"
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Klik mimo menu = zavřít
  document.addEventListener("click", closeMenu);

  // ESC = zavřít
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Klik na položku profilu v menu
  menu.addEventListener("click", (e) => {
    const btn = e.target.closest(".account-item[data-account]");
    if (!btn) return;

    // 1) Změní text nahoře
    const label = btn.childNodes[0].textContent.trim();
    currentName.textContent = label;

    // 2) Active stav v menu
    menu.querySelectorAll(".account-item").forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");

    // 3) Přepne viditelné bloky v sidebaru (WORK vs PRIVATE)
    const selected = btn.dataset.account;
    document.querySelectorAll(".profile-scope").forEach((scope) => {
      scope.hidden = scope.dataset.account !== selected;
    });

    // (Volitelně) uložíme vybraný profil do body datasetu
    document.body.dataset.account = selected;

    closeMenu();
  });
})();

/* ============================
   ASSIGN DROPDOWN LOGIC
   ============================ */
(function () {
  const trigger = document.querySelector(".assign-trigger");
  const menu = document.querySelector(".assign-menu");
  const btnLabel = document.getElementById("assignBtnLabel");
  const inspectorValue = document.getElementById("assignedAgentValue");

  if (!trigger || !menu || !btnLabel) return;

  function openMenu() {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    if (menu.hidden) openMenu();
    else closeMenu();
  }

  // Klik na tlačítko "Přiřadit"
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Klik mimo = zavřít
  document.addEventListener("click", closeMenu);

  // ESC = zavřít
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Klik na konkrétního agenta v menu
  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".assign-item[data-agent]");
    if (!item) return;

    const raw = item.dataset.agent;
const agent = raw === "Unassigned" ? null : raw;


    // Active stav
    menu.querySelectorAll(".assign-item").forEach((x) => x.classList.remove("active"));
    item.classList.add("active");

    // Update UI
    if (agent === "Unassigned") {
      btnLabel.textContent = "Přiřadit";
      if (inspectorValue) inspectorValue.textContent = "Nepřiřazeno";
    } else {
      btnLabel.textContent = agent;
      if (inspectorValue) inspectorValue.textContent = agent;
    }
    // Propis agenta do aktuálního vlákna + překreslení náhledu
if (window.mailUI?.setAgentForCurrentThread) {
  window.mailUI.setAgentForCurrentThread(agent);
}


    closeMenu();
  });
})();

/* ============================
   VYŘEŠIT / OTEVŘÍT (stav konverzace)
   ============================ */
(function () {
  const resolveBtn = document.querySelector(".btn-resolve");
  const statusValue = document.getElementById("statusValue");

  if (!resolveBtn) return;

  // Stav konverzace (zdroj pravdy)
  let isResolved = false; // výchozí: Otevřeno

  function setResolved(nextResolved) {
    isResolved = nextResolved;

    // 1) TLAČÍTKO: zelené má být "Vyřešit" => když je OTEVŘENO (isResolved = false)
    resolveBtn.classList.toggle("is-resolved", !isResolved);

    // 2) Text tlačítka
    resolveBtn.textContent = isResolved ? "Otevřít" : "Vyřešit";

    // 3) Status vpravo + zelený obal celého field
    if (statusValue) {
      statusValue.textContent = isResolved ? "Vyřešeno" : "Otevřeno";

      const statusField = statusValue.closest(".field");
      if (statusField) {
        statusField.classList.toggle("status-resolved", isResolved);
      }
    }
  }

  // První vykreslení
  setResolved(false);

  // Klik přepíná stav
resolveBtn.addEventListener("click", () => {
  const nextResolved = !isResolved;

  // nastav stav vyřešeno / otevřeno
  setResolved(nextResolved);

  // ✅ pokud se právě vyřešilo, označ jako přečtené
  if (nextResolved && currentThreadId && threads[currentThreadId]) {
    threads[currentThreadId].unread = false;
    renderThreadList();
  }
});

})();

/* ============================
   THREADY: klik → detail, vyřešit, unread, agent, export pro Assign
   ============================ */
(function () {
  // ===== Data (jediný zdroj pravdy) =====
  const threads = {
    t1: {
      from: "Kristína Pernišová",
      email: "kristina.pernisova@gmail.com",
      subject: "Re: info obj. č. 2002000",
      bodyHtml: `
        <p>Dobrý deň,</p>
        <p>chcela by som sa informovať o stave objednávky. Ako je to s chýbajúcim tovarom, už Vám prišiel?</p>
        <p>Ďakujem<br> S pozdravom<br> Pernišová</p>
      `,
      resolved: false,
      unread: true,
      agent: null,
    },
    t2: {
      from: "Lukáš Preizler",
      email: "lukas.preizler@email.cz",
      subject: "Re: Objednávku 102428…",
      bodyHtml: `
        <p>Ahoj,</p>
        <p>prosím o potvrzení termínu dodání a fakturace.</p>
        <p>Díky<br>Lukáš</p>
      `,
      resolved: false,
      unread: true,
      agent: null,
    },
    t3: {
      from: "Věra Žitková",
      email: "vera.zitkova@firma.cz",
      subject: "Vrácená zásilka – Objednávka…",
      bodyHtml: `
        <p>Dobrý den,</p>
        <p>zásilka se nám vrátila jako nedoručitelná. Jak máme postupovat?</p>
        <p>Věra</p>
      `,
      resolved: false,
      unread: true,
      agent: null,
    },
  };
  // ===== Inbox badge (počet nepřečtených) =====
const inboxBadge = document.getElementById("inboxBadge");

function renderInboxBadge() {
  if (!inboxBadge) return;

  const unreadCount = Object.values(threads).filter(t => t.unread).length;

  inboxBadge.textContent = unreadCount;
  inboxBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
}


  // ===== Stav aplikace =====
  let currentThreadId = null;

  // ===== DOM: detail zprávy =====
  const msgFrom = document.getElementById("msgFrom");
  const msgEmail = document.getElementById("msgEmail");
  const msgSubject = document.getElementById("msgSubject");
  const msgBody = document.getElementById("msgBody");

  // ===== DOM: resolve + status =====
  const resolveBtn = document.querySelector(".btn-resolve");
  const statusValue = document.getElementById("statusValue");

  // ===== DOM: seznam threadů =====
  const threadEls = Array.from(document.querySelectorAll(".thread[data-thread-id]"));

  if (!msgFrom || !msgEmail || !msgSubject || !msgBody) return;
  if (!resolveBtn || threadEls.length === 0) return;

  function renderDetail(threadId) {
    const data = threads[threadId];
    if (!data) return;

    msgFrom.textContent = data.from;
    msgEmail.textContent = data.email;
    msgSubject.textContent = data.subject;
    msgBody.innerHTML = data.bodyHtml;
  }

  function renderResolveUI(threadId) {
    const data = threads[threadId];
    if (!data) return;

    const isResolved = data.resolved;

    // Tlačítko: zelené = Vyřešit (když je otevřeno)
    resolveBtn.classList.toggle("is-resolved", !isResolved);
    resolveBtn.textContent = isResolved ? "Otevřít" : "Vyřešit";

    // Status vpravo
    if (statusValue) {
      statusValue.textContent = isResolved ? "Vyřešeno" : "Otevřeno";
      const statusField = statusValue.closest(".field");
      if (statusField) statusField.classList.toggle("status-resolved", isResolved);
    }
  }

  function renderThreadList() {
    threadEls.forEach((el) => {
      const id = el.dataset.threadId;
      const data = threads[id];
      if (!data) return;

      // aktivní highlight
      el.classList.toggle("active", id === currentThreadId);

      // vyřešeno / unread
      el.classList.toggle("is-resolved", data.resolved);
      el.classList.toggle("is-unread", data.unread);

      // stav text
      const stateEl = el.querySelector(".thread-state");
      if (stateEl) stateEl.textContent = data.resolved ? "Vyřešeno" : "Otevřeno";

      // agent pod časem
      const agentEl = el.querySelector(".thread-agent");
      if (agentEl) agentEl.textContent = data.agent ? data.agent : "Nepřiřazeno";
    });
    renderInboxBadge();

  }

  function setCurrentThread(threadId) {
    currentThreadId = threadId;
    renderDetail(threadId);
    renderResolveUI(threadId);
    renderThreadList();
  }

  // Klik na thread = otevřít + označit jako přečtené
  threadEls.forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.threadId;
      if (threads[id]) threads[id].unread = false;
      setCurrentThread(id);
    });
  });

  // Klik Vyřešit/Otevřít
  resolveBtn.addEventListener("click", () => {
  if (!currentThreadId) return;

  const t = threads[currentThreadId];
  if (!t) return;

  // toggle vyřešeno/otevřeno
  t.resolved = !t.resolved;

  // ✅ chovej se jako klik na thread: označ jako přečtené
  t.unread = false;

  renderResolveUI(currentThreadId);
  renderThreadList();
});


  // ✅ Export pro Assign dropdown
  window.mailUI = window.mailUI || {};
  window.mailUI.setAgentForCurrentThread = function (agent) {
    if (!currentThreadId || !threads[currentThreadId]) return;
    threads[currentThreadId].agent = agent;
    renderThreadList();
  };

  // Inicializace
  const initial = threadEls.find((el) => el.classList.contains("active")) || threadEls[0];
  setCurrentThread(initial.dataset.threadId);
})();


/* ============================
   THREAD CONTROLLER
   ============================ */
(function () {

  const threads = {
    t1: {
      agent: null,
      unread: true

    },
    t2: {
      agent: null,
     unread: true

    },
    t3: {
      agent: null,
      unread: true

    },
  };

  let currentThreadId = "t1";

  const threadEls = Array.from(document.querySelectorAll(".thread[data-thread-id]"));

  function renderThreadList() {
    threadEls.forEach((el) => {
      const id = el.dataset.threadId;
      const data = threads[id];
      if (!data) return;

      const agentEl = el.querySelector(".thread-agent");
      if (agentEl) {
        agentEl.textContent = data.agent ? data.agent : "Nepřiřazeno";
      }
    });
  }
  

  // klik na vlákno
  threadEls.forEach((el) => {
    el.addEventListener("click", () => {
      currentThreadId = el.dataset.threadId;
      renderThreadList();
    });
  });

  // ⬇️⬇️⬇️ TOTO JE KLÍČ ⬇️⬇️⬇️
  window.mailUI = {
    setAgentForCurrentThread(agent) {
      if (!currentThreadId || !threads[currentThreadId]) return;
      threads[currentThreadId].agent = agent;
      renderThreadList();
    },
  };

  renderThreadList();

})();
