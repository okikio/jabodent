import { Service } from "@okikio/native";

export class Splashscreen extends Service {
    protected rootElement: HTMLElement;
    protected innerEl: HTMLElement;
    protected bgEl: HTMLElement;
    protected delay: number = 1800; // ms
    protected overlayEl: HTMLElement;

    public init() {
        super.init();

        // Elements
        this.rootElement = document.querySelector(".splashscreen") as HTMLElement;
        this.overlayEl = document.querySelector(".splashscreen-overlay");

        if (this.rootElement) {
            this.innerEl = this.rootElement.querySelector(".splashscreen-inner");
        }
    }

    public async boot() {
        if (this.rootElement && this.rootElement.classList.contains("active")) {
            if (typeof this.rootElement.getAnimations === "function") {
                let rootElementAnim = this.rootElement.getAnimations()[0];
                let overlayElAnim = this.overlayEl.getAnimations()[0];
                let innerElAnim = this.innerEl.getAnimations()[0];

                this.emitter.emit("BEFORE_SPLASHSCREEN_HIDE");

                let rootElementAnimFinish = () => {
                    this.rootElement.style.transform = "translateY(100%)";
                    this.rootElement.style.visibility = "hidden";
                    this.rootElement.style.pointerEvents = "none";
                    this.emitter.emit("AFTER_SPLASHSCREEN_HIDE");
                    rootElementAnimFinish = undefined;
                };

                if (rootElementAnim) {
                    rootElementAnim.onfinish = rootElementAnimFinish;
                } else { rootElementAnimFinish(); }

                let overlayElAnimFinish = () => {
                    this.overlayEl.style.opacity = `0`;
                    this.overlayEl.style.visibility = "hidden";
                    this.overlayEl.style.pointerEvents = "none";
                    this.overlayEl = undefined;
                    overlayElAnim = undefined;
                };

                if (overlayElAnim) {
                    overlayElAnim.onfinish = overlayElAnimFinish;
                } else { overlayElAnimFinish(); }


                let innerElAnimFinish = () => {
                    this.innerEl.style.opacity = `0`;
                    this.innerEl = undefined;
                    innerElAnim = undefined;
                };

                if (innerElAnim) {
                    innerElAnim.onfinish = innerElAnimFinish;
                } else { innerElAnimFinish(); }


                window.setTimeout(() => {
                    this.emitter.emit("AFTER_SPLASHSCREEN_DELAY");
                    // rootElementAnim.play();
                    // overlayElAnim.play();
                    // innerElAnim.play();
                }, this.delay);
            }
        } else {
            this.emitter.emit("BEFORE_SPLASHSCREEN_HIDE");
            this.emitter.emit("AFTER_SPLASHSCREEN_HIDE");
        }

        super.boot();
    }

    public uninstall() {
        this.rootElement = undefined;
        this.overlayEl = undefined;
        this.innerEl = undefined;
    }
}
