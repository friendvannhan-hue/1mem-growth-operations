export function nextExpandedState(current) {
  return current !== true;
}

export function shouldElevateHeader(scrollY) {
  return Number(scrollY) > 16;
}

export function menuAccessibilityState(isMobile, isOpen) {
  if (!isMobile) return { ariaHidden: null, inert: false };
  return {
    ariaHidden: String(!isOpen),
    inert: !isOpen,
  };
}

export function calculateScrollProgress(scrollY, scrollHeight, viewportHeight) {
  const available = Number(scrollHeight) - Number(viewportHeight);
  if (available <= 0) return 0;
  return Math.min(100, Math.max(0, (Number(scrollY) / available) * 100));
}

function setupServiceAccordions() {
  document.querySelectorAll(".service-trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));
      const willOpen = nextExpandedState(trigger.getAttribute("aria-expanded") === "true");
      trigger.setAttribute("aria-expanded", String(willOpen));
      panel.hidden = !willOpen;
    });
  });
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".primary-nav");
  if (!toggle || !menu) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const syncMenu = (open) => {
    const state = menuAccessibilityState(mobileQuery.matches, open);
    menu.dataset.open = String(open);
    menu.inert = state.inert;
    if (state.ariaHidden === null) {
      menu.removeAttribute("aria-hidden");
    } else {
      menu.setAttribute("aria-hidden", state.ariaHidden);
    }
  };

  syncMenu(false);

  toggle.addEventListener("click", () => {
    const open = nextExpandedState(toggle.getAttribute("aria-expanded") === "true");
    toggle.setAttribute("aria-expanded", String(open));
    syncMenu(open);
  });

  menu.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    toggle.setAttribute("aria-expanded", "false");
    syncMenu(false);
  });

  mobileQuery.addEventListener("change", () => {
    toggle.setAttribute("aria-expanded", "false");
    syncMenu(false);
  });
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const update = () => header.classList.toggle("is-scrolled", shouldElevateHeader(window.scrollY));
  update();
  window.addEventListener("scroll", update, { passive: true });
}

function setupReadingProgress() {
  const indicator = document.querySelector(".scroll-progress i");
  if (!indicator) return;

  let queued = false;
  const update = () => {
    const progress = calculateScrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight,
    );
    indicator.style.transform = `scaleX(${progress / 100})`;
    queued = false;
  };
  const requestUpdate = () => {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
}

if (typeof document !== "undefined") {
  setupMobileNavigation();
  setupServiceAccordions();
  setupHeaderState();
  setupReadingProgress();
}
