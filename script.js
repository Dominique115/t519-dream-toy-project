// ===== scroll reveal =====
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => revealObserver.observe(el));

// ===== theme-based background decoration =====
// Each <section data-theme="..."> activates the matching .bg-doodle[data-theme] set
// while that section is the one most centered in the viewport.
const themedSections = document.querySelectorAll("section[data-theme]");
const bgDoodles = document.querySelectorAll(".bg-doodle");

function setActiveTheme(theme) {
  bgDoodles.forEach((doodle) => {
    doodle.classList.toggle("active", doodle.dataset.theme === theme);
  });
}

const themeObserver = new IntersectionObserver((entries) => {
  // pick the entry closest to vertical center of the viewport among currently intersecting ones
  let best = null;
  let bestDist = Infinity;

  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const rect = entry.target.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const dist = Math.abs(center - window.innerHeight / 2);
    if (dist < bestDist) {
      bestDist = dist;
      best = entry.target;
    }
  });

  if (best) setActiveTheme(best.dataset.theme);
}, { threshold: 0.2, rootMargin: "-10% 0px -10% 0px" });

themedSections.forEach((section) => themeObserver.observe(section));

// ===== decision card interactions =====
document.querySelectorAll(".decision-card").forEach((card) => {
  const buttons = card.querySelectorAll(".choice-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;

      // mark this button selected, leave the other clickable (viewer can explore both)
      buttons.forEach((b) => b.classList.toggle("selected", b === btn));

      // reveal the matching outcome, hide any other outcome in this card
      card.querySelectorAll(".outcome").forEach((outcome) => {
        const match = outcome.dataset.outcome === choice;
        outcome.hidden = !match;
      });
    });
  });
});
