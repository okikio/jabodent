// @ts-nocheck
import { Transition } from "https://unpkg.com/@okikio/native@latest/lib/api.mjs";
import { animate } from "https://unpkg.com/@okikio/animate@latest/lib/api.mjs";

//== Transitions
export class Slide extends Transition {
    protected name = "slide";
    protected duration = 500;
    protected direction: string = "right";

    out({ from }) {
        let { duration, direction } = this;
        let fromWrapper = from.getWrapper();
        window.scroll({
            top: 0,
            behavior: 'smooth'  // 👈 
        });
        return animate({
            target: fromWrapper,
            keyframes: [
                { transform: "translateX(0%)", opacity: 1 },
                { transform: `translateX(${direction === "left" ? "-" : ""}25%)`, opacity: 0 },
            ],
            duration,
            easing: "in-quint",
            onfinish: (el: { style: { opacity: string; transform: string; }; }) => {
                el.style.opacity = '0';
                el.style.transform = `translateX(${direction === "left" ? "-" : ""}25%)`;
            }
        });
    }

    in({ to }) {
        let { duration } = this;
        let toWrapper = to.getWrapper();
        return animate({
            target: toWrapper,
            keyframes: [
                { transform: `translateX(${this.direction === "right" ? "-" : ""}25%)`, opacity: 0 },
                { transform: "translateX(0%)", opacity: 1 },
            ],
            duration,
            easing: "out-quint",
            onfinish(el: { style: { opacity: string; transform: string; }; }) {
                el.style.opacity = '1';
                el.style.transform = `translateX(0%)`;
            }
        });
    }
}

export class SlideLeft extends Slide {
    protected name = "slide-left";
    protected duration = 500;
    protected direction: string = "left";
}

export class SlideRight extends Slide {
    protected name = "slide-right";
    protected duration = 500;
    protected direction: string = "right";
}