import { Service } from "../framework/api";
import { animate } from "@okikio/animate";

export class Search extends Service {
    protected worker: Worker;
    protected value: string = "";
    protected active: boolean = false;

    protected rootElement: HTMLElement;
    protected html: HTMLElement;
    protected navbar: HTMLElement;
    protected input: HTMLElement;
    protected results: HTMLElement;
    protected btn: HTMLElement;

    public init() {
        super.init();

        this.html = document.querySelector("html");
        this.navbar = this.html.querySelector(".navbar");
        this.rootElement = this.html.querySelector(".search-overlay");

        this.btn = this.navbar.querySelector(".navbar .search-btn");
        this.input = this.rootElement.querySelector(".search-input");
        if (this.input) {
            this.results = this.rootElement.querySelector(".search-results");
            this.worker = new Worker("js/FuzzySearch.min.js");
        }
    }

    protected transformArr(args) {
        return args.map((num: number) => `translateY(${num}%)`);
    }

    public initEvents() {
        if (this.input) {
            this.btn.addEventListener("click", () => {
                this.active = !this.active;
                this.navbar.classList.toggle("focus", this.active);
                this.html.classList.toggle("no-scroll", this.active);

                let opacity = this.active ? [0, 1] : [1, 0];
                let transform = this.transformArr(
                    this.active ? [-100, 0] : [0, -100]
                );

                animate({
                    target: this.rootElement,
                    transform,
                    opacity,
                    onfinish(el: HTMLElement) {
                        el.style.transform = `${
                            transform[transform.length - 1]
                        }`;
                        el.style.opacity = `${opacity[opacity.length - 1]}`;
                        // el.style.pointerEvent = this.active ? "auto" : "none";
                        el.style.pointerEvents = this.active ? "auto" : "none";
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
                this.removeResults();
                const data = JSON.parse(event.data);
                if (data.length < 1 && this.value.length === 0) {
                    this.noResults();
                } else {
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
        this.results.textContent = "No results.";
    }

    public addResult(data: {
        item: { title: string; description: string };
        refIndex: number;
    }) {
        const { title, description } = data.item;
        let el = document.createElement("div");
        el.className = "search-result p-5";
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
