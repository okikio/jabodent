import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class Splashscreen extends Service {
  protected rootElement: HTMLElement;
  protected innerEl: HTMLElement;
  protected bgEl: HTMLElement;
  protected minimalDuration: number = 1000; // ms

  public init() {
    super.init();

    // Elements
    this.rootElement = document.getElementsByClassName(
      "splashscreen"
    )[0] as HTMLElement;

    if (this.rootElement) {
      this.innerEl = this.rootElement.querySelector(".splashscreen-inner");
    }
  }

  public async boot() {
    if (this.rootElement) {
      let anim = this.rootElement.getAnimations()[0];
      let innerElAnim = this.innerEl.getAnimations()[0];

      anim.pause();
      innerElAnim.pause();

      anim.currentTime = this.minimalDuration;
      this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");

      anim.onfinish = () => {
        this.rootElement.style.transform = "translateY(100%)";
        this.rootElement.style.visibility = "hidden";
        this.rootElement.style.pointerEvents = "none";
      };

      innerElAnim.onfinish = () => {
        this.innerEl.style.opacity = `0`;
      };

      window.setTimeout(() => {
        anim.play();
        innerElAnim.play();
        this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
      }, this.minimalDuration);
    }
  }
}
