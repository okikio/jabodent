import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class Splashscreen extends Service {
  protected rootElement: HTMLElement;
  protected innerEl: HTMLElement;
  protected bgEl: HTMLElement;
  protected minimalDuration: number = 1000; // ms
  protected coverEl: HTMLElement;

  public init() {
    super.init();

    // Elements
    this.rootElement = document.getElementsByClassName(
      "splashscreen"
    )[0] as HTMLElement;

    if (this.rootElement) {
      this.coverEl = this.rootElement.querySelector(".splashscreen-cover");
      this.innerEl = this.rootElement.querySelector(".splashscreen-inner");
    }
  }

  public boot() {
    if (this.rootElement) {
      if (typeof this.coverEl.getAnimations === "function") {
        let coverElAnim = this.coverEl.getAnimations()[0];
        let innerElAnim = this.innerEl.getAnimations()[0];
        console.log(coverElAnim.pause);
        // coverElAnim.pause();
        innerElAnim.pause();

        // coverElAnim.currentTime = this.minimalDuration;
        innerElAnim.currentTime = this.minimalDuration;
        this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");

        coverElAnim.onfinish = () => {
          this.coverEl.style.opacity = `0`;
        };

        innerElAnim.onfinish = () => {
          this.innerEl.style.transform = "translateY(100%)";
          this.rootElement.style.visibility = "hidden";
          this.rootElement.style.pointerEvents = "none";
        };

        window.setTimeout(() => {
          coverElAnim.play();
          innerElAnim.play();
          this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
        }, this.minimalDuration);
      }
    }
  }
}
