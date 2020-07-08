
import { getTheme, setTheme, mediaTheme } from "./theme";
import { PJAX, App, _URL, Router } from "./framework/api";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";

import { Fade } from "./transitions/Fade";
// import { BigTransition } from "./transitions/BigTransition";
// import { Slide, SlideLeft, SlideRight } from "./transitions/Slide";

const app: App = new App();
let navbar: Navbar, router: Router, splashscreen: Splashscreen;

app
    .addService(new IntroAnimation())
    .add("service", new PJAX())

    .addService(navbar = new Navbar())
    .addService(router = new Router())

    .add("transition", new Fade());
// .addTransition(new BigTransition())
// .addTransition(new Slide())
// .add("transition", new SlideLeft())
// .add("transition", new SlideRight());

const html = document.querySelector("html");
try {
    let theme = getTheme();
    if (theme === null) theme = mediaTheme();
    theme && html.setAttribute("theme", theme);
} catch (e) {
    console.warn("Theming isn't available on this browser.");
}

// Set theme in localStorage, as well as in the html tag
let themeSet = (theme: string) => {
    html.setAttribute("theme", theme);
    setTheme(theme);
};

window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
    themeSet(e.matches ? "dark" : "light");
});

try {
    let layer: HTMLElement, top: number, navHeight: number = navbar.navbar.getBoundingClientRect().height;
    app.on("GO READY", () => {
        let layers = document.getElementsByClassName("layer") || [];
        layer = layers[0] as HTMLElement || null;
        top = layer ? layer.getBoundingClientRect().y : null;

        if (/^\/(index(.html)?|$)/.test(window.location.pathname))
            navbar.navbar.classList.add("light");
        else navbar.navbar.classList.remove("light");
        navbar.navbar.classList.remove("focus");

        document.getElementById("back-to-top").addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    router.add({
        path: /index(.html)?/g,
        method() {
            let scrollBtn = document.getElementById("scroll-btn");
            scrollBtn.addEventListener("click", () => {
                document.getElementById("main").scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    app.boot();
    window.addEventListener("scroll", () => {
        let scrollTop = window.scrollY;
        requestAnimationFrame(() => {
            if (top && scrollTop + 10 + navHeight >= top) {
                navbar.navbar.classList.add("focus");
            } else navbar.navbar.classList.remove("focus");
        });
    });
} catch (err) {
    // splashscreen.show();
    console.warn("[App] boot failed,", err);
}