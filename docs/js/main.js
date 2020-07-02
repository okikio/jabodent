import { Block, Service, Transition, App, Router, PJAX, BlockIntent } from 'https://unpkg.com/@okikio/native@latest/lib/api.mjs';
import { animate } from 'https://unpkg.com/@okikio/animate@latest/lib/api.mjs';

const getTheme = () => {
  const theme = window.localStorage.getItem("theme");
  if (typeof theme === "string")
    return theme;
  return null;
};
const setTheme = (theme) => {
  if (typeof theme === "string")
    window.localStorage.setItem("theme", theme);
};
const mediaTheme = () => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const hasMediaQueryPreference = typeof mql.matches === "boolean";
  if (hasMediaQueryPreference)
    return mql.matches ? "dark" : "light";
  return null;
};

class InViewBlock extends Block {
  constructor() {
    super(...arguments);
    this.inView = false;
  }
  init(value) {
    super.init(value);
    this.observerOptions = {
      root: null,
      rootMargin: "0px",
      thresholds: Array.from(Array(20), (_nul, x) => (x + 1) / 20)
    };
    this.observer = new IntersectionObserver((entries) => {
      this.onIntersectionCallback(entries);
    }, this.observerOptions);
    this.imgs = [];
    this.direction = "right";
    this.xPercent = 30;
    if (this.rootElement.hasAttribute("data-direction")) {
      this.direction = this.rootElement.getAttribute("data-direction");
    }
    if (this.direction === "left") {
      this.xPercent = -this.xPercent;
    }
    this.imgs = [...this.rootElement.querySelectorAll("img")];
    this.observe();
  }
  observe() {
    this.observer.observe(this.rootElement);
  }
  unobserve() {
    this.observer.unobserve(this.rootElement);
  }
  onScreen() {
    animate({
      target: this.rootElement,
      transform: [`translateX(${this.xPercent}%)`, "translateX(0%)"],
      opacity: [0, 1],
      duration: 1500,
      delay: 0.15,
      easing: "out-quint",
      onfinish(el) {
        el.style.transform = "translateX(0%)";
        el.style.opacity = "1";
      }
    });
  }
  offScreen() {
    this.rootElement.style.transform = `translateX(${this.xPercent}%)`;
    this.rootElement.style.opacity = "0";
  }
  onIntersectionCallback(entries) {
    for (let entry of entries) {
      if (entry.intersectionRatio > 0) {
        this.onScreen();
      } else {
        this.offScreen();
      }
    }
  }
  stopEvents() {
    this.unobserve();
  }
}

class Splashscreen extends Service {
  constructor() {
    super(...arguments);
    this.minimalDuration = 1e3;
  }
  init() {
    super.init();
    this.rootElement = document.getElementById("splashscreen");
    if (this.rootElement) {
      this.innerEl = this.rootElement.querySelector(".splashscreen-inner");
      this.bgEl = this.rootElement.querySelector(".splashscreen-bg");
    }
    this.rootElement.style.visibility = "visible";
    this.rootElement.style.pointerEvents = "auto";
  }
  boot() {
    if (this.rootElement) {
      this.hide();
    }
  }
  async hide() {
    await new Promise((resolve) => {
      window.setTimeout(() => {
        this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");
        resolve();
      }, this.minimalDuration);
    });
    await new Promise(async (resolve) => {
      animate({
        target: this.innerEl,
        opacity: [1, 0],
        autoplay: true,
        duration: 500,
        onfinish(el) {
          el.style.opacity = "0";
        }
      });
      this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
      await this.show();
      resolve();
    });
  }
  async show() {
    await animate({
      target: this.rootElement,
      transform: ["translateY(0%)", "translateY(100%)"],
      duration: 1200,
      easing: "in-out-cubic"
    });
    this.rootElement.style.transform = "translateY(100%)";
    this.rootElement.style.visibility = "hidden";
    this.rootElement.style.pointerEvents = "none";
  }
}

class IntroAnimation extends Service {
  init() {
    super.init();
    this.elements = [...document.querySelectorAll(".intro-animation")];
  }
  newPage() {
    this.init();
    this.prepareToShow();
  }
  initEvents() {
    this.EventEmitter.on("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
    this.EventEmitter.on("CONTENT_REPLACED", this.newPage, this);
    this.EventEmitter.on("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
  }
  stopEvents() {
    this.EventEmitter.off("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
    this.EventEmitter.off("CONTENT_REPLACED", this.newPage, this);
    this.EventEmitter.off("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
  }
  stop() {
    for (let el of this.elements) {
      el.style.transform = "translateY(0px)";
      el.style.opacity = "1";
    }
    super.stop();
  }
  prepareToShow() {
    for (let el of this.elements) {
      el.style.transform = "translateY(200px)";
      el.style.opacity = "0";
    }
    window.scroll(0, 0);
  }
  async show() {
    return await animate({
      target: this.elements,
      keyframes: [
        {transform: "translateY(200px)", opacity: 0},
        {transform: "translateY(0px)", opacity: 1}
      ],
      delay(i) {
        return 200 * (i + 1);
      },
      onfinish(el) {
        el.style.transform = "translateY(0px)";
        el.style.opacity = "1";
      },
      easing: "out-cubic",
      duration: 500
    });
  }
}

class Fade extends Transition {
  constructor() {
    super(...arguments);
    this.name = "default";
    this.duration = 500;
  }
  out({from}) {
    let {duration} = this;
    let fromWrapper = from.getWrapper();
    window.scroll({
      top: 0,
      behavior: "smooth"
    });
    return new Promise(async (resolve) => {
      await animate({
        target: fromWrapper,
        opacity: [1, 0],
        duration,
        onfinish(el) {
          el.style.opacity = "0";
        }
      });
      window.scrollTo(0, 0);
      resolve();
    });
  }
  in({to}) {
    let {duration} = this;
    let toWrapper = to.getWrapper();
    toWrapper.style.transform = "translateX(0%)";
    return animate({
      target: toWrapper,
      opacity: [0, 1],
      duration,
      onfinish(el) {
        el.style.opacity = "1";
      }
    });
  }
}

class BigTransition extends Transition {
  constructor() {
    super(...arguments);
    this.name = "big";
    this.delay = 200;
    this.durationPerAnimation = 700;
  }
  boot() {
    this.mainElement = document.getElementById("big-transition");
    this.spinnerElement = this.mainElement.querySelector(".spinner");
    this.horizontalElements = [...this.mainElement.querySelector("#big-transition-horizontal").querySelectorAll("div")];
    this.maxLength = this.horizontalElements.length;
  }
  out({from}) {
    let {durationPerAnimation: duration, delay} = this;
    let fromWrapper = from.getWrapper();
    window.scroll({
      top: 0,
      behavior: "smooth"
    });
    return new Promise(async (resolve) => {
      animate({
        target: fromWrapper,
        opacity: [1, 0],
        duration,
        onfinish(el) {
          el.style.opacity = "0";
        }
      });
      this.mainElement.style.opacity = "1";
      this.mainElement.style.visibility = "visible";
      await animate({
        target: this.horizontalElements,
        keyframes: [
          {transform: "scaleX(0)"},
          {transform: "scaleX(1)"}
        ],
        delay(i) {
          return delay * (i + 1);
        },
        onfinish(el) {
          el.style.transform = `scaleX(1)`;
        },
        easing: "out-cubic",
        duration: 500
      });
      let loaderDuration = 500;
      this.spinnerElement.style.visibility = "visible";
      let options = await animate({
        target: this.spinnerElement,
        opacity: [0, 1],
        duration: loaderDuration,
        onfinish(el) {
          el.style.opacity = `1`;
        }
      });
      await animate({
        options,
        opacity: [1, 0],
        onfinish(el) {
          el.style.opacity = `0`;
        },
        delay: 1500
      });
      this.spinnerElement.style.visibility = "hidden";
      resolve();
    });
  }
  in({to}) {
    let {durationPerAnimation: duration, delay} = this;
    let toWrapper = to.getWrapper();
    toWrapper.style.transform = "translateX(0%)";
    return new Promise(async (resolve) => {
      animate({
        target: toWrapper,
        opacity: [0, 1],
        onfinish(el) {
          el.style.opacity = `1`;
        },
        duration
      });
      await animate({
        target: this.horizontalElements,
        keyframes: [
          {transform: "scaleX(1)"},
          {transform: "scaleX(0)"}
        ],
        delay(i) {
          return delay * (i + 1);
        },
        onfinish(el) {
          el.style.transform = `scaleX(0)`;
        },
        easing: "out-cubic",
        duration: 500
      });
      this.mainElement.style.opacity = "0";
      this.mainElement.style.visibility = "hidden";
      resolve();
    });
  }
}

class Slide extends Transition {
  constructor() {
    super(...arguments);
    this.name = "slide";
    this.duration = 500;
    this.direction = "right";
  }
  out({from}) {
    let {duration, direction} = this;
    let fromWrapper = from.getWrapper();
    window.scroll({
      top: 0,
      behavior: "smooth"
    });
    return animate({
      target: fromWrapper,
      keyframes: [
        {transform: "translateX(0%)", opacity: 1},
        {transform: `translateX(${direction === "left" ? "-" : ""}25%)`, opacity: 0}
      ],
      duration,
      easing: "in-quint",
      onfinish: (el) => {
        el.style.opacity = "0";
        el.style.transform = `translateX(${direction === "left" ? "-" : ""}25%)`;
      }
    });
  }
  in({to}) {
    let {duration} = this;
    let toWrapper = to.getWrapper();
    return animate({
      target: toWrapper,
      keyframes: [
        {transform: `translateX(${this.direction === "right" ? "-" : ""}25%)`, opacity: 0},
        {transform: "translateX(0%)", opacity: 1}
      ],
      duration,
      easing: "out-quint",
      onfinish(el) {
        el.style.opacity = "1";
        el.style.transform = `translateX(0%)`;
      }
    });
  }
}
class SlideLeft extends Slide {
  constructor() {
    super(...arguments);
    this.name = "slide-left";
    this.duration = 500;
    this.direction = "left";
  }
}
class SlideRight extends Slide {
  constructor() {
    super(...arguments);
    this.name = "slide-right";
    this.duration = 500;
    this.direction = "right";
  }
}

const html = document.querySelector("html");
try {
  let theme2 = getTheme();
  if (theme2 === null)
    theme2 = mediaTheme();
  theme2 && html.setAttribute("theme", theme2);
} catch (e) {
  console.warn("Theming isn't available on this browser.");
}
let themeSet = (theme2) => {
  html.setAttribute("theme", theme2);
  setTheme(theme2);
};
window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
  themeSet(e.matches ? "dark" : "light");
});
const app = new App();
let splashscreen;
let router;
app.addService(new IntroAnimation()).addService(splashscreen = new Splashscreen()).setService("router", new Router()).add("service", new PJAX()).add("transition", new Fade()).addTransition(new BigTransition()).addTransition(new Slide()).add("transition", new SlideLeft()).add("transition", new SlideRight()).add("block", new BlockIntent({
  name: "InViewBlock",
  block: InViewBlock
}));
try {
  app.boot();
  router = app.getService("router");
  let navLink = document.querySelectorAll(".navbar .nav-link");
  for (let item of navLink) {
    let navItem = item;
    router.add({
      path: navItem.getAttribute("data-path") || navItem.pathname,
      method() {
        let isActive = navItem.classList.contains("active");
        if (!isActive)
          navItem.classList.add("active");
        for (let nav of navLink) {
          if (nav !== navItem)
            nav.classList.remove("active");
        }
      }
    });
  }
} catch (err) {
  splashscreen.show();
  console.warn("[App] boot failed,", err);
}
