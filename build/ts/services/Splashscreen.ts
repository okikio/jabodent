import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class Splashscreen extends Service {
  protected rootElement: HTMLElement;
  protected innerEl: HTMLElement;
  protected bgEl: HTMLElement;
  protected minimalDuration: number = 1000; // ms
  protected overlayEl: HTMLElement;

  public init() {
    super.init();

    // Elements
    this.rootElement = document.getElementsByClassName(
      "splashscreen"
    )[0] as HTMLElement;
    this.overlayEl = document.querySelector(".splashscreen-overlay");

    if (this.rootElement) {
      this.innerEl = this.rootElement.querySelector(".splashscreen-inner");
    }
  }

  public async boot() {
    if (this.rootElement) {
      if (typeof this.rootElement.getAnimations === "function") {
        let rootElementAnim = this.rootElement.getAnimations()[0];
        let overlayElAnim = this.overlayEl.getAnimations()[0];
        let innerElAnim = this.innerEl.getAnimations()[0];

        rootElementAnim.pause();
        overlayElAnim.pause();
        innerElAnim.pause();

        rootElementAnim.currentTime = this.minimalDuration;
        overlayElAnim.currentTime = this.minimalDuration;
        innerElAnim.currentTime = this.minimalDuration;
        this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");

        rootElementAnim.onfinish = () => {
          this.rootElement.style.transform = "translateY(100%)";
          this.rootElement.style.visibility = "hidden";
          this.rootElement.style.pointerEvents = "none";
        };

        overlayElAnim.onfinish = () => {
          this.overlayEl.style.opacity = `0`;
        };

        innerElAnim.onfinish = () => {
          this.innerEl.style.opacity = `0`;
        };

        window.setTimeout(() => {
          rootElementAnim.play();
          overlayElAnim.play();
          innerElAnim.play();
          this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
        }, this.minimalDuration);
      }
    }
  }
}
