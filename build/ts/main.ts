import { themeSet, themeGet } from "./theme";
import { PJAX, App, _URL, Router } from "./framework/api";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";
import { Search } from "./services/Search";

import { CarouselBlockIntent } from "./blocks/Carousel";

import { Fade } from "./transitions/Fade";
// import { BigTransition } from "./transitions/BigTransition";
// import { Slide, SlideLeft, SlideRight } from "./transitions/Slide";

const app: App = new App();
let navbar: Navbar, router: Router, splashscreen: Splashscreen;

app
  .addService(new IntroAnimation())
  .addService(new Splashscreen())
  .add("service", new PJAX())
  .add("service", new Search())

  .addService((navbar = new Navbar()))
  .setService("router", (router = new Router()))

  .add("block", CarouselBlockIntent)
  .add("transition", new Fade());

// On theme switcher button click (mouseup is a tiny bit more efficient) toggle the theme between dark and light mode
const themeSwitch = document.getElementsByClassName("theme-switch")[0];
if (themeSwitch) {
  themeSwitch.addEventListener("click", () => {
    themeSet(themeGet() === "dark" ? "light" : "dark");
  });
}

try {
  let waitOnScroll = false;
  let layer: HTMLElement,
    top: number,
    navHeight: number = navbar.navbar.getBoundingClientRect().height;
  const scroll = () => {
    if (!waitOnScroll) {
      let scrollTop = window.scrollY;
      requestAnimationFrame(() => {
        if (scrollTop + 10 + navHeight >= top) {
          navbar.navbar.classList.add("focus");
        } else navbar.navbar.classList.remove("focus");
        waitOnScroll = true;
      });
    }

    waitOnScroll = false;
  };

  const load = () => {
    let layers = document.getElementsByClassName("layer") || [];

    navbar.navbar.classList.remove("focus");
    navbar.navbar.classList.remove("active");

    if (/(index(.html)?|\/$)|(services\/+)/g.test(window.location.pathname)) {
      navbar.navbar.classList.add("light");
    } else if (navbar.navbar.classList.contains("light")) {
      navbar.navbar.classList.remove("light");
    }

    layer = (layers[0] as HTMLElement) || null;
    top = layer
      ? layer.getBoundingClientRect().top + window.pageYOffset - navHeight / 2
      : 0;

    let backToTop = document.getElementsByClassName("back-to-top")[0];
    if (backToTop) {
      backToTop.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    }

    let scrollBtn = document.getElementsByClassName("scroll-btn")[0];
    if (scrollBtn) {
      scrollBtn.addEventListener("click", () => {
        let scrollPt = document.getElementsByClassName("scroll-point")[0];
        if (scrollPt) scrollPt.scrollIntoView({ behavior: "smooth" });
      });
    }

    scroll();
  };

  app.on("READY", load);
  app.on("CONTENT_REPLACED", load);
  window.addEventListener("scroll", scroll, { passive: true });

  app.boot();
} catch (err) {
  // splashscreen.show();
  console.warn("[App] boot failed,", err);
}
