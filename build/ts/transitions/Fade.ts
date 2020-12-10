import { Transition, ITransitionData, _URL } from "../framework/api";
import { animate } from "@okikio/animate";

//== Transitions
export class Fade extends Transition {
    protected name = "default";
    protected duration = 350;
    public scrollable = true;

    public hashAction(hash: string = window.location.hash) {
        try {
            let _hash = hash[0] == "#" ? hash : new _URL(hash).hash;
            if (_hash.length > 1) {
                let el = document.querySelector(_hash) as HTMLElement;

                if (el) {
                    return { x: el.offsetLeft, y: el.offsetTop };
                }
            }
        } catch (e) {
            console.warn("[Transition] hashAction error out", e);
        }

        return { x: 0, y: 0 };
    }

    out({ from, trigger }: ITransitionData) {
        let { duration } = this;
        let fromWrapper = from.getWrapper();
        return new Promise(async (resolve) => {
            await animate({
                target: fromWrapper,
                keyframes: [
                    {
                        transform: "translateY(0)",
                        opacity: 1,
                    },
                    {
                        opacity: 0,
                        transform: `translateY(${window.scrollY > 100 &&
                            !/back|popstate|forward/.test(trigger as string)
                            ? 100
                            : 0
                            }px)`,
                    },
                ],
                // opacity: [1, 0],
                easing: "out",
                duration,
                onfinish(el: {
                    style: { opacity: string; transform: string };
                }) {
                    requestAnimationFrame(() => {
                        el.style.opacity = "0";
                    });
                },
            });

            resolve();
        });
    }

    in({ to, trigger }: ITransitionData) {
        let { duration, scroll, hashAction } = this;
        let toWrapper = to.getWrapper();
        requestAnimationFrame(() => {
            toWrapper.style.transform = "translateX(0%)";
        });

        if (!/back|popstate|forward/.test(trigger as string)) {
            scroll = hashAction();
        }

        scroll && window.scroll(scroll.x, scroll.y);

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
