// Navbar mobile menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const navbarOverlayEl = document.getElementById("navbar-overlay");
  const hamburgerEl = document.getElementById("hamburger");
  const menuEl = document.querySelector("menu");

  if (!navbarOverlayEl || !hamburgerEl || !menuEl) return;

  function toggleScrollBlock() {
    if (!navbarOverlayEl.classList.contains("hidden")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = null;
    }
  }

  function handleMenuClick() {
    ["hidden", "flex"].forEach((className) => {
      menuEl.classList.toggle(className);
    });
    navbarOverlayEl.classList.toggle("hidden");
    toggleScrollBlock();
  }

  function handleOverlayClick() {
    ["hidden", "flex"].forEach((className) => {
      menuEl.classList.toggle(className);
    });
    navbarOverlayEl.classList.toggle("hidden");
    toggleScrollBlock();
  }

  hamburgerEl.addEventListener("click", handleMenuClick);
  navbarOverlayEl.addEventListener("click", handleOverlayClick);
});