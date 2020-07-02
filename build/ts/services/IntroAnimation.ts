// @ts-nocheck
import { Service } from "https://unpkg.com/@okikio/native@latest/lib/api.mjs";
import { animate } from "https://unpkg.com/@okikio/animate@latest/lib/api.mjs";

export class IntroAnimation extends Service {
    protected elements: Array<Element>;
    protected rootElement: HTMLElement;

    public init() {
        super.init();

        // Elements
        this.elements = [...document.querySelectorAll('.intro-animation')];
    }

    public newPage() {
        this.init();
        this.prepareToShow();
    }

    public initEvents() {
        this.EventEmitter.on("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
        this.EventEmitter.on("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.on("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
    }

    public stopEvents() {
        this.EventEmitter.off("BEFORE_SPLASHSCREEN_HIDE", this.prepareToShow, this);
        this.EventEmitter.off("CONTENT_REPLACED", this.newPage, this);
        this.EventEmitter.off("START_SPLASHSCREEN_HIDE BEFORE_TRANSITION_IN", this.show, this);
    }

    public stop() {
        for (let el of this.elements) {
            (el as HTMLElement).style.transform = "translateY(0px)";
            (el as HTMLElement).style.opacity = '1';
        }

        super.stop();
    }

    public prepareToShow() {
        for (let el of this.elements) {
            (el as HTMLElement).style.transform = "translateY(200px)";
            (el as HTMLElement).style.opacity = '0';
        }

        window.scroll(0, 0);
    }

    public async show() {
        return await animate({
            target: (this.elements as HTMLElement[]),
            keyframes: [
                { transform: "translateY(200px)", opacity: 0 },
                { transform: "translateY(0px)", opacity: 1 },
            ],
            // @ts-ignore
            delay(i: number) {
                return 200 * (i + 1);
            },
            onfinish(el: { style: { transform: string; opacity: string; }; }) {
                el.style.transform = "translateY(0px)";
                el.style.opacity = "1";
            },
            easing: "out-cubic",
            duration: 500
        });
    }
}