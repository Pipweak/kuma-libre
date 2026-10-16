const body = document.body;
const artboards = [...document.querySelectorAll("[data-screen]")];
const viewButtons = [...document.querySelectorAll("[data-view-mode]")];

function selectScreen(screenId, switchToFocus = true) {
  const nextScreen = artboards.find((artboard) => artboard.dataset.screen === screenId);
  if (!nextScreen) return;

  artboards.forEach((artboard) => artboard.classList.toggle("is-selected", artboard === nextScreen));

  if (switchToFocus) {
    setView("focus");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function setView(view) {
  body.dataset.view = view;
  viewButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.viewMode === view));
}

const initialParameters = new URLSearchParams(window.location.search);
const initialScreen = initialParameters.get("screen");
const initialView = initialParameters.get("view");

if (initialScreen) selectScreen(initialScreen, false);
if (initialView === "focus" || initialView === "board") setView(initialView);

document.addEventListener("click", (event) => {
  const navigationTrigger = event.target.closest("[data-go]");
  if (navigationTrigger) {
    event.preventDefault();
    selectScreen(navigationTrigger.dataset.go);
    return;
  }

  const viewTrigger = event.target.closest("[data-view-mode]");
  if (viewTrigger) {
    setView(viewTrigger.dataset.viewMode);
    return;
  }

  const groupedChoice = event.target.closest("[data-choice-group] button");
  if (groupedChoice) {
    groupedChoice.closest("[data-choice-group]").querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-pressed", String(button === groupedChoice));
    });
    return;
  }

  const multipleChoice = event.target.closest("[data-multi-choice] button:not(.lesson-more)");
  if (multipleChoice) {
    const nextValue = multipleChoice.getAttribute("aria-pressed") !== "true";
    multipleChoice.setAttribute("aria-pressed", String(nextValue));
  }
});

document.addEventListener("keydown", (event) => {
  if (body.dataset.view !== "focus" || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;

  const currentIndex = artboards.findIndex((artboard) => artboard.classList.contains("is-selected"));
  const offset = event.key === "ArrowRight" ? 1 : -1;
  const nextIndex = (currentIndex + offset + artboards.length) % artboards.length;
  selectScreen(artboards[nextIndex].dataset.screen, false);
});
