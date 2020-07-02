// @ts-nocheck
import { Transition } from "https://unpkg.com/@okikio/native@latest/lib/api.mjs";
import { animate } from "https://unpkg.com/@okikio/animate@latest/lib/api.mjs";

//== Transitions
export class Fade extends Transition {
    protected name = "default";
    protected duration = 500;

    out({ from }) {
        let { duration } = this;
        let fromWrapper = from.getWrapper();
        window.scroll({
            top: 0,
            behavior: 'smooth'  // 👈 
        });

        return new Promise(async resolve => {
            await animate({
                target: fromWrapper,
                opacity: [1, 0],
                duration,
                onfinish(el: { style: { opacity: string; }; }) {
                    el.style.opacity = '0';
                }
            });

            window.scrollTo(0, 0);
            resolve();
        });
    }

    in({ to }) {
        let { duration } = this;
        let toWrapper = to.getWrapper();
        toWrapper.style.transform = "translateX(0%)";
        return animate({
            target: toWrapper,
            opacity: [0, 1],
            duration,
            onfinish(el: { style: { opacity: string; }; }) {
                el.style.opacity = '1';
            }
        });
    }
}