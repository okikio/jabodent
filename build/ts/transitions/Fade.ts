import { Transition, ITransitionData } from "../framework/api";
import { animate } from "@okikio/animate";

//== Transitions
export class Fade extends Transition {
    protected name = "default";
    protected duration = 350;
    public static scroll = true;

    out({ from, trigger }: ITransitionData) {
        let { duration } = this;
        let fromWrapper = from.getWrapper();
        return new Promise(async (resolve) => {
            // animate({
            //     target: fromWrapper,
            //     transform: ["translateY(0)", `translateY(${window.scrollY > 550 ? 550 : 0}px)`],
            //     easing: "out",
            //     duration: 250,
            //     onfinish(el: { style: { opacity: string, transform: string } }) {
            //         requestAnimationFrame(() => {
            //             el.style.transform = `translateY(${window.scrollY > 550 ? 550 : 0}px)`;
            //             // window.scroll(0, 0);
            //         });
            //     },
            // })
            await animate({
                target: fromWrapper,
                keyframes: [{
                    transform: "translateY(0)",
                }, {
                    opacity: 1
                }, {

                    opacity: 0,
                    transform: `translateY(${window.scrollY > 100 && !/back|popstate|forward/.test(trigger as string) ? 100 : 0}px)`,
                }],
                // opacity: [1, 0],
                easing: "out",
                duration,
                onfinish(el: { style: { opacity: string, transform: string } }) {
                    requestAnimationFrame(() => {
                        el.style.opacity = "0";
                        // el.style.transform = "translateY(0)";
                        window.scroll(0, 0);
                    });
                },
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
        requestAnimationFrame(() => {
            toWrapper.style.transform = "translateX(0%)";
        });
        return animate({
            target: toWrapper,
            opacity: [0, 1],
            easing: "in",
            duration,
            onfinish(el: { style: { opacity?: string } }) {
                requestAnimationFrame(() => {
                    el.style.opacity = "1";
                    el.style = {};
                });
            },
        });
    }
}
