import { PJAX, App, Router, TransitionManager, HistoryManager, PageManager } from "@okikio/native";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";
import { Search } from "./services/Search";
import { Image } from "./services/Image";

import { Carousel } from "./services/Carousel";
import { Fade } from "./transitions/Fade";

let app: App = new App(), pjax: PJAX, router: Router;
let splashscreen: Splashscreen, search: Search;
app
    .set("HistoryManager", new HistoryManager())
    .set("PageManager", new PageManager())
    .set("TransitionManager", new TransitionManager([
        [Fade.name, Fade]
    ]))
    .add(pjax = new PJAX())
    .add(new IntroAnimation())
    .add(splashscreen = new Splashscreen())
    .add(new Image())
    .add(search = new Search())

    .add(new Navbar())
    .add(new Carousel())
    .set("router", router = new Router());

try {
    let waitOnScroll = false;
    let navbar = document.querySelector(".navbar");
    let layers: NodeListOf<Element> | HTMLElement[],
        backToTop: HTMLElement,
        scrollBtn: HTMLElement,
        scrollPt: HTMLElement,
        layer: HTMLElement,
        top: number,
        navHeight: number = navbar.getBoundingClientRect().height;
    let scroll = () => {
        if (!waitOnScroll) {
            let scrollTop = window.scrollY;
            requestAnimationFrame(() => {
                if (scrollTop + navHeight >= top + (pjax.isTransitioning ? 100 : 0)) {
                    navbar.classList.add("focus");
                } else navbar.classList.remove("focus");
                waitOnScroll = false;
            });

            waitOnScroll = true;
        }
    };
    let go = () => {
        requestAnimationFrame(() => {
            navbar.classList.remove("focus");
            navbar.classList.remove("active");

            if (
                /(index(.html)?|\/$)|(services\/+)/g.test(
                    window.location.pathname
                )
            ) {
                navbar.classList.add("light");
            } else if (navbar.classList.contains("light")) {
                navbar.classList.remove("light");
            }

            if (
                /(about(.html)?)|(services(.html)?$)|(contact(.html)?)/g.test(
                    window.location.pathname
                ) || document.title.includes("404")
            ) {
                navbar.classList.add("dark");
            } else if (navbar.classList.contains("dark")) {
                navbar.classList.remove("dark");
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
            (navHeight / 4)
            : 0;

        go();
        backToTop = document.querySelector(".back-to-top");
        if (backToTop) {
            backToTop.addEventListener("click", backtotop_fn);
        }

        scrollBtn = document.querySelector(".scroll-btn");
        scrollPt = document.querySelector(".scroll-point");
        if (scrollBtn) {
            scrollBtn.addEventListener("click", scrolldown_fn);
            // scrollBtn = undefined;
            // scrollPt = undefined;
        }

        // layers = undefined;
        // layer = undefined;
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
