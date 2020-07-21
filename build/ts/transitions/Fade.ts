import { Transition, ITransitionData } from "../framework/api";
import { animate } from "@okikio/animate";

//== Transitions
export class Fade extends Transition {
    protected name = "default";
    protected duration = 500;

    out({ from }: ITransitionData) {
        let { duration } = this;
        let fromWrapper = from.getWrapper();
        return new Promise(async resolve => {
            await animate({
                target: fromWrapper,
                opacity: [1, 0],
                duration,
                onfinish(el: { style: { opacity: string; }; }) {
                    el.style.opacity = '0';
                }
            });

            // window.scroll({
            //     top: 0,
            //     behavior: 'auto'  // 👈
            // });
            resolve();
        });
    }

    in({ to }: ITransitionData) {
        let { duration } = this;
        let toWrapper = to.getWrapper();
        toWrapper.style.transform = "translateX(0%)";
        return animate({
            target: toWrapper,
            opacity: [0, 1],
            duration,
            onfinish(el: { style: { opacity?: string; }; }) {
                el.style.opacity = '1';
                el.style = {};
            }
        });
    }
}
