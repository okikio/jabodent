import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class Search extends Service {
    protected worker: Worker;
    protected value: string = "";
    protected active: boolean = false;

    protected rootElement: HTMLElement;
    protected inner: HTMLElement;
    protected close: HTMLElement;
    protected html: HTMLElement;
    protected navbar: HTMLElement;
    protected input: HTMLElement;
    protected results: HTMLElement;
    protected btn: HTMLElement;
    protected icon: HTMLElement;

    public init() {
        super.init();

        this.html = document.querySelector("html");
        this.navbar = this.html.querySelector(".navbar");
        this.rootElement = this.html.querySelector(".search-overlay");

        this.btn = this.navbar.querySelector(".search-btn");
        this.close = this.btn.querySelector(".search-close");
        this.icon = this.btn.querySelector(".search-icon");

        this.inner = this.rootElement.querySelector(".search-inner");
        this.input = this.rootElement.querySelector(".search-input");
        if (this.input) {
            this.results = this.rootElement.querySelector(".search-results");
            this.worker = new Worker("/js/FuzzySearch.min.js");
        }
    }

    protected transformArr(args) {
        return args.map((num: number) => `translateY(${num}%)`);
    }

    public initEvents() {
        if (this.input) {
            this.btn.addEventListener("click", () => {
                this.active = !this.active;
                !this.navbar.classList.contains("focus") && this.navbar.classList.add("focus");
                this.html.classList.toggle("no-scroll", this.active);

                let opacity = this.active ? [0, 1] : [1, 0];
                let transform = this.transformArr(
                    this.active ? [-100, 0] : [0, -100]
                );
                let pointerEvents = this.active ? "auto" : "none";
                this.close.style.display = this.active ? "flex" : "none";
                this.icon.style.display = !this.active ? "block" : "none";

                animate({
                    target: this.rootElement,
                    transform,
                    duration: 900,
                    easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
                    onfinish(el: HTMLElement) {
                        el.style.transform = `${
                            transform[transform.length - 1]
                            }`;
                        el.style.pointerEvents = `${pointerEvents}`;
                    },
                });

                animate({
                    target: this.inner,
                    opacity,
                    duration: 500,
                    easing: "ease",
                    onfinish: (el: HTMLElement) => {
                        el.style.opacity = `${opacity[opacity.length - 1]}`;
                    },
                });
            });

            this.input.addEventListener("keyup", () => {
                const { value } = this.input as HTMLInputElement;
                this.value = value;
                this.worker.postMessage(value);
            });

            // receive data from a worker
            this.worker.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.length === 0 && this.value.length > 0) {
                    this.noResults();
                } else {
                    this.removeResults();
                    for (let i = 0, len = data.length; i < len; i++) {
                        this.addResult(data[i]);
                    }
                }
            };
        }
    }

    public stopEvents() {
        this.worker.terminate();
        this.worker = undefined;
    }

    public noResults() {
        this.results.textContent = "No results...";
    }

    public addResult({ title, description }: { title: string; description: string }) {
        let el = document.createElement("div");
        el.className = "search-result py-5";
        el.innerHTML = `
      <h5 class="font-title text-xl search-result-title pb-2 mb-4">${title}</h5>
      <p>${description}</p>`;
        this.results.appendChild(el);
    }

    public removeResults() {
        let firstChild = this.results.firstChild;

        while (firstChild) {
            this.results.removeChild(firstChild);
            firstChild = this.results.firstChild;
        }
    }
}
