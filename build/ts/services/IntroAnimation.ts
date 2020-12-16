import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class IntroAnimation extends Service {
    protected elements: Array<Element>;
    protected rootElement: HTMLElement;
    entries: Array<Element>;
    observer: IntersectionObserver;
    splashscreen: boolean;

    public init() {
        super.init();
        this.splashscreen = true;

        // Elements
        this.elements = Array.prototype.slice.call(document.querySelectorAll(".intro-animation")) as HTMLElement[];
        this.entries = [];
        let options = {
            rootMargin: '0px',
            threshold: Array.from(Array(100), (_, x) => x / 100)
        };

        let scrollTop = window.scrollY;
        let scrollBottom = window.scrollY + window.innerHeight;
        for (let el of this.elements) {
            let { bottom, top } = el.getBoundingClientRect();
            if ((bottom > scrollTop && bottom < scrollBottom) ||
                (top < scrollBottom && top > scrollTop)) {
                this.entries.push(el);
            }
        }
        this.observerCallback = this.observerCallback.bind(this);
        this.observer = new IntersectionObserver(this.observerCallback, options);

        for (let el of this.elements)
            this.observer.observe(el);
    }

    observerCallback(entries) {
        entries.forEach(({ target, intersectionRatio }) => {
            if (intersectionRatio >= 0.5) {
                if (!this.splashscreen && !this.entries.includes(target)) {
                    // !target.classList.has("show-anim")
                    this.show(target);
                }
            }
            // Each entry describes an intersection change for one observed
            // target element:
            //   entry.boundingClientRect
            //   entry.intersectionRatio
            //   entry.intersectionRect
            //   entry.isIntersecting
            //   entry.rootBounds
            //   entry.target
            //   entry.time
        }, this);
    }

    public newPage() {
        this.unobserve();

        this.init();
        this.prepareToShow();
    }

    public unobserve() {
        for (let el of this.elements)
            this.observer.unobserve(el);
    }

    public initEvents() {
        this.EventEmitter.on(
            "BEFORE_SPLASHSCREEN_HIDE",
            this.prepareToShow,
            this
        );
        this.EventEmitter.on("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.on(
            "AFTER_SPLASHSCREEN_DELAY AFTER_TRANSITION_IN", //
            this.check,
            this
        );
    }

    check() {
        this.splashscreen = false;
        for (let el of this.entries) {
            console.log(el);
            this.show(el as HTMLElement);
        }
    }

    public stopEvents() {
        this.EventEmitter.off(
            "BEFORE_SPLASHSCREEN_HIDE",
            this.prepareToShow,
            this
        );
        this.EventEmitter.off("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.off(
            "AFTER_SPLASHSCREEN_DELAY AFTER_TRANSITION_IN", //  BEFORE_TRANSITION_IN
            this.check,
            this
        );
    }

    public stop() {
        requestAnimationFrame(() => {
            for (let el of this.entries) {
                // (el as HTMLElement).style.visibility = "visible";
                // (el as HTMLElement).style.opacity = "1";
                el.classList.remove("hide-anim");
            }
        });
        this.unobserve();

        super.stop();
    }

    public prepareToShow() {
        requestAnimationFrame(() => {
            for (let el of this.elements) {
                // (el as HTMLElement).style.opacity = "0";
                el.classList.add("hide-anim");
                // (el as HTMLElement).style.visibility = "hidden";
            }
            // this.entries = [];
            // window.scroll(0, 0);
        });
    }

    public show(target: HTMLElement) {
        if (target) {
            target.classList.remove("hide-anim");
            target.classList.add("show-anim");
        }
        // return await animate({
        //     target: this.entries as HTMLElement[],
        //     opacity: [0, 1],
        //     delay(i: number) {
        //         return 300 * (i);
        //     },
        //     onfinish: (el: { style: { opacity: string, visibility: string } }) => {
        //         requestAnimationFrame(() => {
        //             el.style.opacity = "1";
        //             // el.style.visibility = "visible";
        //         });
        //     },
        //     easing: "ease-out",
        //     duration: 650,
        // });
    }
}
