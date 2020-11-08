export const runSplashscreen = () => {
  // window.addEventListener('DOMContentLoaded', (event) => {
  try {
    const splashscreen = document.querySelector(".splashscreen");
    const overlay = document.querySelector(".splashscreen-overlay");

    if (splashscreen.classList && !splashscreen.classList.contains("active")) splashscreen.classList.add("active");
    if (overlay.classList && !overlay.classList.contains("active")) overlay.classList.add("active");
  } catch (e) {
    console.warn("The splashscreen isn't available on this browser.", e);
  }
  // });
};
runSplashscreen();
