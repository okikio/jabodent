
import { getTheme, setTheme, mediaTheme } from "./theme";
import { PJAX, App, _URL, Router } from "./framework/api";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";

import { CarouselBlockIntent } from "./blocks/Carousel";

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

    .add("block", CarouselBlockIntent)
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
    let waitOnScroll = false;
    let layer: HTMLElement, top: number, navHeight: number = navbar.navbar.getBoundingClientRect().height;
    app.on("CONTENT_REPLACED READY", () => {
        let layers = document.getElementsByClassName("layer") || [];
        layer = layers[0] as HTMLElement || null;
        top = layer ? layer.getBoundingClientRect().top + window.pageYOffset : null;

        navbar.navbar.classList.remove("focus");
        navbar.navbar.classList.remove("active");

        let backToTop = document.getElementsByClassName("back-to-top")[0];
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        let scrollBtn = document.getElementsByClassName("scroll-btn");
        if (scrollBtn[0]) {
            scrollBtn[0].addEventListener("click", () => {
                let scrollPt = document.getElementsByClassName("scroll-point")
                if (scrollPt[0]) scrollPt[0].scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    window.addEventListener("scroll", () => {
        if (!waitOnScroll) {
            let scrollTop = window.scrollY;
            requestAnimationFrame(() => {
                if ((scrollTop + 10 + navHeight) >= top) {
                    navbar.navbar.classList.add("focus");
                } else navbar.navbar.classList.remove("focus");
                waitOnScroll = true;
            });
        }

        waitOnScroll = false;
    }, { passive: true });

    router.add({
        path: {
            from: /services\/+/,
            to: true
        },
        method() {
            navbar.navbar.classList.remove("light");
        }
    });

    router.add({
        path: /services\/+/,
        method() {
            navbar.navbar.classList.add("light");
        }
    });

    router.add({
        path: {
            from: /(index(.html)?|\/$)/,
            to: true
        },
        method() {
            navbar.navbar.classList.remove("light");
        }
    });

    router.add({
        path: /(index(.html)?|\/$)/,
        method() {
            let heroImg = new Image();
            heroImg.src = "https://res.cloudinary.com/okikio-assets/image/upload/e_improve,ar_16:9,c_fill,g_auto,f_auto/waves.webp";
            heroImg.onload = () => {
                let overlay = document.getElementsByClassName("hero-overlay")[0];
                if (overlay) overlay.classList.add("loaded");
            };

            navbar.navbar.classList.add("light");
        }
    });

    app.boot();
} catch (err) {
    // splashscreen.show();
    console.warn("[App] boot failed,", err);
}