import { Service } from "@okikio/native";
import { toArr } from "../toArr";

export class Perspective extends Service {
    rootEl: HTMLElement;
    el: HTMLElement[];
    waitOnMouseMove = false;

    public init() {
        super.init();

        this.getEl();
        this.mousemove = this.mousemove.bind(this);
    }

    public getEl() {
        this.rootEl = document.querySelector(".perspective-group");

        let el = this.rootEl?.querySelectorAll(".perspective");
        this.el = this.rootEl ? toArr(el) : undefined;
    }

    public removeEl() {
        while (this.el.length) this.el.pop();
        this.rootEl = undefined;
    }

    public mousemove(e: { clientX: number; clientY: number; }) {
        if (!this.waitOnMouseMove) {
            this.waitOnMouseMove = true;
            requestAnimationFrame(() => {
                let i = 0, len = this.el.length;

                let { left, top, width, height } = this.rootEl.getBoundingClientRect();
                let clientX = e.clientX - left - (width / 2);
                let clientY = e.clientY - top - (height / 2);

                let x = clientX * 40 / width;
                let y = clientY * 40 / height;

                for (; i < len; i++) {
                    let el = this.el[i];
                    el.style.transform = `translate(${x}px, ${y}px)`;
                }

                // Set a timeout to un-throttle
                this.waitOnMouseMove = false;
            });
        }
    }

    public initEvents() {
        if (window.innerWidth > 1024) {
            this?.rootEl.addEventListener(
                "mousemove", this.mousemove,
                { passive: true }
            );
        }

        this.emitter.on("BEFORE_TRANSITION_OUT", this.getEl);
        this.emitter.on("CONTENT_INSERT", this.removeEl);
    }

    public stopEvents() {
        if (window.innerWidth > 1024) {
            this?.rootEl.removeEventListener("mousemove", this.mousemove);
        }

        this.emitter.off("BEFORE_TRANSITION_OUT", this.getEl);
        this.emitter.off("CONTENT_INSERT", this.removeEl);
    }

    public uninstall() {
        this.removeEl();
        this.el = undefined;
    }
}
