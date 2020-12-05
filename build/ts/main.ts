import { themeSet, themeGet } from "./theme";
import { PJAX, App, _URL, Router } from "./framework/api";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";
import { Search } from "./services/Search";
import { Image } from "./services/Image";

import { CarouselBlockIntent } from "./blocks/Carousel";

import { Fade } from "./transitions/Fade";
// import { BigTransition } from "./transitions/BigTransition";
// import { Slide, SlideLeft, SlideRight } from "./transitions/Slide";

let app: App = new App();
let navbar: Navbar, router: Router, splashscreen: Splashscreen;
let search = new Search(), pjax;
app.addService(new IntroAnimation())
    .addService(new Splashscreen())
    .add("service", pjax = new PJAX())
    .add("service", new Image())
    .add("service", search)

    .addService((navbar = new Navbar()))
    .setService("router", (router = new Router()))

    .add("block", CarouselBlockIntent)
    .add("transition", new Fade());

// On theme switcher button click (mouseup is a tiny bit more efficient) toggle the theme between dark and light mode
let themeSwitch = document.querySelector(".theme-switch");
if (themeSwitch) {
    themeSwitch.addEventListener("click", () => {
        themeSet(themeGet() === "dark" ? "light" : "dark");
    });
}

try {
    let waitOnScroll = false;
    let layers,
        backToTop,
        scrollBtn,
        scrollPt,
        layer: HTMLElement,
        top: number,
        navHeight: number = navbar.navbar.getBoundingClientRect().height;
    let scroll = () => {
        if (!waitOnScroll) {
            let scrollTop = window.scrollY;
            requestAnimationFrame(() => {
                if (scrollTop + 10 + navHeight >= top + (pjax.isTransitioning ? 100 : 0)) {
                    navbar.navbar.classList.add("focus");
                } else navbar.navbar.classList.remove("focus");
                waitOnScroll = true;
            });
        }

        waitOnScroll = false;
    };
    let go = () => {
        requestAnimationFrame(() => {
            navbar.navbar.classList.remove("focus");
            navbar.navbar.classList.remove("active");

            if (
                /(index(.html)?|\/$)|(services\/+)/g.test(
                    window.location.pathname
                )
            ) {
                navbar.navbar.classList.add("light");
            } else if (navbar.navbar.classList.contains("light")) {
                navbar.navbar.classList.remove("light");
            }
        });
        scroll();
    };

    let backtotop_fn = () => {
        requestAnimationFrame(() => {
            window.scroll({
                top: 0,
                behavior: "smooth",
            });
            // window.scroll(0, 0);
        });
    };

    let scrolldown_fn = () => {
        requestAnimationFrame(() => {
            if (scrollPt)
                scrollPt.scrollIntoView({ behavior: "smooth" });
        });
    };
    let load = () => {
        layers = document.querySelectorAll(".layer");
        layer = (layers[0] as HTMLElement) || null;
        top = layer
            ? layer.getBoundingClientRect().top +
            window.pageYOffset -
            navHeight / 2
            : 0;

        go();
        backToTop = document.querySelector(".back-to-top");
        if (backToTop) {
            backToTop.addEventListener("click", backtotop_fn);
            backToTop = undefined;
        }

        scrollBtn = document.querySelector(".scroll-btn");
        scrollPt = document.querySelector(".scroll-point");
        if (scrollBtn) {
            scrollBtn.addEventListener("click", scrolldown_fn);
            scrollBtn = undefined;
            scrollPt = undefined;
        }

        layers = undefined;
        layer = undefined;
        // top = 0;
    };

    app.on("POPSTATE", () => {
        search.getActive() && search.toggle();
    });
    app.on("GO", go);
    app.on("READY", load);
    app.on("AFTER_TRANSITION_OUT", () => {
        layers = undefined;
        layer = undefined;
        waitOnScroll = undefined;
        top = 0;
        if (backToTop) {
            backToTop.removeEventListener("click", backtotop_fn);
        }
        backToTop = undefined;

        if (scrollBtn) {
            scrollBtn.removeEventListener("click", scrolldown_fn);
        }

        scrollBtn = undefined;
        scrollPt = undefined;
    });
    app.on("CONTENT_REPLACED", load);
    window.addEventListener("scroll", scroll, { passive: true });

    app.boot();
} catch (err) {
    // splashscreen.show();
    console.warn("[App] boot failed,", err);
}
