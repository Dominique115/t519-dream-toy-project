// ===== 3D circuit viewer for the base boards =====
// Pure CSS 3D transforms, no libraries. Each board has a front and back face.
// Back faces are flipped top-to-bottom, so a part at (x, y) on the front sits at (x, 200 - y) on the back.
(function () {
  const root = document.getElementById("circuit-viewer");
  if (!root) return;

  const W = 320, H = 200;
  const svg = (inner) =>
    `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" class="cv-wood"/>${inner}</svg>`;
  const label = (text) => `<text x="16" y="${H - 14}" class="cv-label">${text}</text>`;
  const note = (x, y, text) => `<text x="${x}" y="${y}" class="cv-note" text-anchor="middle">${text}</text>`;
  const hole = (x, y) => `<circle cx="${x}" cy="${y}" r="13" class="cv-hole"/>`;
  // tape pads are drawn as small squares; tape runs are drawn as lines with a dot at each end.
  // Each path is drawn in the direction current flows (battery + → switch → rocket → battery −),
  // because the flow animation moves from the start of the path toward its end.
  const patch = (x, y, r = 14) =>
    `<rect x="${x - r * 0.7}" y="${y - r * 0.7}" width="${r * 1.4}" height="${r * 1.4}" rx="3" class="cv-tape cv-patch"/>`;
  const strip = (d) => {
    const pts = d.match(/-?\d+(\.\d+)?/g).map(Number);
    let x = pts[0], y = pts[1];
    const cmds = d.replace(/^M\s*-?\d+\s+-?\d+/, "").match(/[HV]\s*-?\d+/g) || [];
    cmds.forEach((c) => { const v = Number(c.slice(1)); if (c[0] === "H") x = v; else y = v; });
    return `<path d="${d}" class="cv-tape cv-strip"/><path d="${d}" class="cv-flow"/>
      <circle cx="${pts[0]}" cy="${pts[1]}" r="3.5" class="cv-tape-end"/><circle cx="${x}" cy="${y}" r="3.5" class="cv-tape-end"/>`;
  };

  // Board 1, front: score track outline, two magnets and the switch
  const b1Front = svg(`
    <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="14" class="cv-track"/>
    ${hole(110, 100)}<circle cx="110" cy="100" r="9" class="cv-magnet"/>${note(110, 130, "− magnet")}
    ${hole(210, 100)}<circle cx="210" cy="100" r="9" class="cv-magnet"/>${note(210, 130, "+ magnet")}
    <rect x="146" y="141" width="28" height="14" rx="4" class="cv-switch"/>
    <rect x="149" y="144" width="10" height="8" rx="2" class="cv-switch-knob"/>${note(160, 170, "switch")}
    ${label("Board 1 · front")}`);

  // Board 1, back: tape behind both magnets; + magnet → switch → battery +
  const b1Back = svg(`
    ${patch(110, 100)}${patch(210, 100)}
    ${strip("M144 140 H70 V52 H146")}
    ${strip("M174 52 H210 V100")}
    ${patch(160, 140, 16)}
    <rect x="146" y="45" width="28" height="14" rx="3" class="cv-switch-back"/>
    ${note(110, 80, "−")}${note(226, 80, "+")}${note(160, 176, "to battery +")}
    ${label("Board 1 · back")}`);

  // Board 2, front: coin battery (+ up), switch pocket, − tape up through a hole
  const b2Front = svg(`
    <circle cx="160" cy="60" r="20" class="cv-battery"/>${note(160, 65, "+")}${note(160, 96, "coin battery")}
    <rect x="144" y="137" width="32" height="20" rx="4" class="cv-pocket"/>${note(160, 172, "switch pocket")}
    ${patch(110, 100, 13)}<circle cx="110" cy="100" r="4" class="cv-thru"/>${note(110, 130, "− tape")}
    ${label("Board 2 · front")}`);

  // Board 2, back: battery − → the hole under the − magnet
  const b2Back = svg(`
    <circle cx="160" cy="140" r="20" class="cv-battery cv-battery-back"/>${note(160, 145, "−")}
    ${strip("M110 100 V140 H160")}
    ${patch(160, 140, 10)}${patch(110, 100, 11)}<circle cx="110" cy="100" r="4" class="cv-thru"/>
    ${note(110, 78, "up through hole")}
    ${label("Board 2 · back")}`);

  const b3Front = svg(`${note(160, 104, "cover board")}${label("Board 3 · front")}`);
  const b3Back = svg(label("Board 3 · back"));

  // Kid-style rocket; its two magnet feet are 100px apart to match the board magnets
  const rocketSvg = `<svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
    <line x1="52" y1="92" x2="10" y2="116" class="cv-leg"/><line x1="68" y1="92" x2="110" y2="116" class="cv-leg"/>
    <path d="M110 116 L68 92 L62 50" class="cv-flow cv-flow-rocket"/><path d="M58 50 L52 92 L10 116" class="cv-flow cv-flow-rocket"/>
    <circle cx="10" cy="116" r="4" class="cv-foot"/><circle cx="110" cy="116" r="4" class="cv-foot"/>
    <path d="M60 6 C 74 22, 76 62, 70 92 L50 92 C 44 62, 46 22, 60 6 Z" class="cv-rocket-body"/>
    <circle cx="60" cy="44" r="9" class="cv-led"/>
    <path d="M48 72 L36 96 L50 92 Z M72 72 L84 96 L70 92 Z" class="cv-rocket-fin"/>
  </svg>`;

  const boards = [
    { id: "b1", front: b1Front, back: b1Back },
    { id: "b2", front: b2Front, back: b2Back },
    { id: "b3", front: b3Front, back: b3Back },
  ];

  const scene = root.querySelector(".cv-scene");
  scene.innerHTML =
    boards.map((b) => `<div class="cv-board" data-board="${b.id}">
        <div class="cv-face cv-front">${b.front}</div>
        <div class="cv-face cv-back">${b.back}</div>
      </div>`).join("") +
    `<div class="cv-rocket"><div class="cv-rocket-plane">${rocketSvg}</div></div>`;

  const stage = root.querySelector(".cv-stage");
  const toggleBtn = root.querySelector("#cv-toggle");
  const switchBtn = root.querySelector("#cv-switch");
  const peekBtn = root.querySelector("#cv-peek");
  const resetBtn = root.querySelector("#cv-reset");
  const status = root.querySelector(".cv-status");
  const boardEls = scene.querySelectorAll(".cv-board");
  const rocketEl = scene.querySelector(".cv-rocket");

  const DEFAULT = { tilt: 58, spin: -28 };
  let tilt = DEFAULT.tilt, spin = DEFAULT.spin;
  let layered = false, switchOn = true;

  // board 1 on top; the rocket stands on board 1 between the two magnets
  function layout() {
    const gap = layered ? 7 : 100;
    boardEls.forEach((el, i) => {
      el.style.transform = `translateZ(${gap * (1 - i)}px)`;
    });
    rocketEl.style.transform = `translate(${W / 2}px, ${100}px) translateZ(${gap + 2}px)`;
    scene.style.transform = `rotateX(${tilt}deg) rotateZ(${spin}deg)`;
    peekBtn.textContent = isUnderneath() ? "Back to the top" : "Peek underneath";

    const lit = layered && switchOn;
    root.classList.toggle("lit", lit);
    root.classList.toggle("layered", layered);
    root.classList.toggle("switch-off", !switchOn);
    root.classList.toggle("underneath", isUnderneath());
    toggleBtn.textContent = layered ? "Pull the boards apart" : "Snap the boards together";
    toggleBtn.setAttribute("aria-pressed", String(layered));
    switchBtn.textContent = switchOn ? "Switch: on" : "Switch: off";
    switchBtn.setAttribute("aria-pressed", String(switchOn));
    status.textContent = !layered
      ? "Boards apart: the tape paths don't touch, so the LED stays dark."
      : !switchOn
        ? "Boards together, but the switch is off. The circuit has a gap."
        : "Circuit closed! Battery + → switch → + magnet → LED → − magnet → back to battery −.";
  }

  // tilt is unclamped so the stack can flip all the way over to show the back faces
  function setView(t, s) {
    tilt = t;
    spin = s;
    layout();
  }

  // past 90° the backs face the viewer
  const isUnderneath = () => Math.cos((tilt * Math.PI) / 180) < 0;

  // drag to rotate (pointer events cover mouse, trackpad and touch)
  let drag = null;
  stage.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, tilt, spin };
    stage.setPointerCapture(e.pointerId);
    root.classList.add("dragging");
  });
  stage.addEventListener("pointermove", (e) => {
    if (!drag) return;
    setView(drag.tilt - (e.clientY - drag.y) * 0.4, drag.spin + (e.clientX - drag.x) * 0.4);
  });
  const endDrag = () => { drag = null; root.classList.remove("dragging"); };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  stage.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: [0, -10], ArrowRight: [0, 10], ArrowUp: [10, 0], ArrowDown: [-10, 0] }[e.key];
    if (!step) return;
    e.preventDefault();
    setView(tilt + step[0], spin + step[1]);
  });

  toggleBtn.addEventListener("click", () => { layered = !layered; layout(); });
  switchBtn.addEventListener("click", () => { switchOn = !switchOn; layout(); });
  // flip between the top view and the underneath view
  peekBtn.addEventListener("click", () => setView(isUnderneath() ? DEFAULT.tilt : 180 - DEFAULT.tilt, spin));
  resetBtn.addEventListener("click", () => setView(DEFAULT.tilt, DEFAULT.spin));

  layout();
})();
