import { Service } from "../framework/api";
// import { animate } from "@okikio/animate";

export class Splashscreen extends Service {
  protected rootElement: HTMLElement;
  protected innerEl: HTMLElement;
  protected bgEl: HTMLElement;
  protected delay: number = 800; // ms
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

        // rootElementAnim.pause();
        // overlayElAnim.pause();
        // innerElAnim.pause();

        // rootElementAnim.currentTime = this.delay;
        // overlayElAnim.currentTime = this.delay;
        // innerElAnim.currentTime = this.delay;
        this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");

        let rootElementAnimFinish = () => {
          this.rootElement.style.transform = "translateY(100%)";
          this.rootElement.style.visibility = "hidden";
          this.rootElement.style.pointerEvents = "none";
        };

        if (rootElementAnim) {
          rootElementAnim.onfinish = rootElementAnimFinish;
        } else { rootElementAnimFinish(); }




        let overlayElAnimFinish = () => {
          this.overlayEl.style.opacity = `0`;
          this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
        };

        if (overlayElAnim) {
          overlayElAnim.onfinish = overlayElAnimFinish;
        } else { overlayElAnimFinish(); }




        let innerElAnimFinish = () => {
          this.innerEl.style.opacity = `0`;
        };

        if (innerElAnim) {
          innerElAnim.onfinish = innerElAnimFinish;
        } else { innerElAnimFinish(); }


        // window.setTimeout(() => {
        //   // rootElementAnim.play();
        //   // overlayElAnim.play();
        //   // innerElAnim.play();
        // }, this.delay);
      }
    } else {
      this.EventEmitter.emit("BEFORE_SPLASHSCREEN_HIDE");
      this.EventEmitter.emit("START_SPLASHSCREEN_HIDE");
    }
  }
}
