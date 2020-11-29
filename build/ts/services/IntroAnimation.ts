import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class IntroAnimation extends Service {
    protected elements: Array<Element>;
    protected rootElement: HTMLElement;
    entries: Array<Element>;

    public init() {
        super.init();

        // Elements
        this.elements = Array.prototype.slice.call(document.querySelectorAll(".intro-animation")) as HTMLElement[];
        this.entries = [];

        let scrollTop = window.scrollY;
        let scrollBottom = window.scrollY + window.innerHeight;
        for (let el of this.elements) {
            let { bottom, top } = el.getBoundingClientRect();
            if ((bottom > scrollTop && bottom < scrollBottom) ||
                (top < scrollBottom && top > scrollTop)) {
                this.entries.push(el);
            }
        }
    }

    public newPage() {
        this.init();
        this.prepareToShow();
    }

    public initEvents() {
        this.EventEmitter.on(
            "BEFORE_SPLASHSCREEN_HIDE",
            this.prepareToShow,
            this
        );
        this.EventEmitter.on("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.on(
            "START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN",
            this.show,
            this
        );
    }

    public stopEvents() {
        this.EventEmitter.off(
            "BEFORE_SPLASHSCREEN_HIDE",
            this.prepareToShow,
            this
        );
        this.EventEmitter.off("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.off(
            "START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN",
            this.show,
            this
        );
    }

    public stop() {
        requestAnimationFrame(() => {
            for (let el of this.entries) {
                // (el as HTMLElement).style.visibility = "visible";
                (el as HTMLElement).style.opacity = "1";
            }
        });

        super.stop();
    }

    public prepareToShow() {
        requestAnimationFrame(() => {
            for (let el of this.entries) {
                (el as HTMLElement).style.opacity = "0";
                // (el as HTMLElement).style.visibility = "hidden";
            }
            // this.entries = [];
            // window.scroll(0, 0);
        });
    }

    public async show() {
        if (this.entries.length > 0) {
            return await animate({
                target: this.entries as HTMLElement[],
                opacity: [0, 1],
                delay(i: number) {
                    return 300 * (i);
                },
                onfinish: (el: { style: { opacity: string, visibility: string } }) => {
                    requestAnimationFrame(() => {
                        el.style.opacity = "1";
                        // el.style.visibility = "visible";
                    });
                },
                easing: "ease-out",
                duration: 650,
            });
        }
    }
}
