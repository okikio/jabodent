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
    protected bg: HTMLElement;
    protected clearIcon: HTMLElement;

    public init() {
        super.init();

        this.html = document.querySelector("html");
        this.navbar = this.html.querySelector(".navbar");
        this.rootElement = this.html.querySelector(".search-overlay");

        this.btn = this.navbar.querySelector(".search-btn");
        this.close = this.btn.querySelector(".search-close");
        this.icon = this.btn.querySelector(".search-icon");
        this.bg = this.btn.querySelector(".search-bg");

        this.inner = this.rootElement.querySelector(".search-inner");
        this.input = this.inner.querySelector(".search-input");
        if (this.input) {
            this.results = this.inner.querySelector(".search-results");
            this.clearIcon = this.inner.querySelector(".clear-search");
            this.worker = new Worker("/js/FuzzySearch.min.js");
        }
    }

    protected transformArr(args) {
        return args.map((num: number) => `translateY(${num}%)`);
    }

    public async toggle() {
        const bgClass = "bg-secondary border-2 border-solid border-secondary text-black".split(" ");
        this.active = !this.active;
        !this.navbar.classList.contains("focus") && this.navbar.classList.add("focus");
        this.html.classList.toggle("no-scroll", this.active);
        this.bg.classList[this.active ? "add" : "remove"](...bgClass);

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
            duration: 600,
            easing: "cubic-bezier(0.645, 0.045, 0.355, 1)",
            // easing: "out-sine",
            onfinish(el: HTMLElement) {
                el.style.transform = `${
                    transform[transform.length - 1]
                    }`;
                el.style.pointerEvents = `${pointerEvents}`;
            },
        });

        await animate({
            target: this.inner,
            opacity,
            duration: 500,
            delay: 100,
            easing: "ease",
            onfinish: (el: HTMLElement) => {
                el.style.opacity = `${opacity[opacity.length - 1]}`;
            },
        });
    }


    /**
     * Returns the href or an Anchor element
     */
    public getHref(el: HTMLAnchorElement): string | null {
        if (
            el &&
            el.tagName &&
            el.tagName.toLowerCase() === "a" &&
            typeof el.href === "string"
        )
            return el.href;
        return null;
    }
    /**
     * Check if event target is a valid anchor with an href, if so, return the link
     */
    public getLink(event): HTMLAnchorElement {
        let el = event.target as HTMLAnchorElement;
        let href: string = this.getHref(el);

        while (el && !href) {
            el = (el as HTMLElement).parentNode as HTMLAnchorElement;
            href = this.getHref(el);
        }

        // Check for a valid link
        if (!el) return;
        return el;
    }

    public initEvents() {
        if (this.input) {
            this.btn.addEventListener("click", this.toggle.bind(this));
            this.input.addEventListener("keyup", () => {
                const { value } = this.input as HTMLInputElement;
                this.value = value;
                this.worker.postMessage(value);
            });

            this.results.addEventListener("click", e => {
                let el = this.getLink(event);
                if (!el || !el.classList.contains("search-result")) return;

                const href = this.getHref(el);
                (this.input as HTMLInputElement).value = "";
                this.value = "";
                (async () => {
                    await this.toggle();
                    this.resetResults();
                })();

                if (window.location.href === href) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            });

            this.navbar.addEventListener("click", e => {
                let el = this.getLink(event);
                if (!el) return;
                if (this.active) this.toggle();
            });

            this.clearIcon.addEventListener("click", () => {
                (this.input as HTMLInputElement).value = "";
                this.value = "";
                this.resetResults();
            });

            // Receive data from a worker
            this.worker.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.length === 0 && this.value.length > 0) {
                    this.noResults();
                } else if (this.value.length === 0) {
                    this.resetResults();
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
        this.results.innerHTML = "<span class='px-5'>No results...</span>";
    }

    public addResult({ title, description, href }: { title: string; description: string, href: string }) {
        let el = document.createElement("a");
        el.href = `${href}`;
        el.className = "search-result rounded-lg p-5 hover:bg-gray-600 hover:bg-opacity-15 block";
        el.innerHTML = `
      <h5 class="font-title text-xl search-result-title pb-2 mb-4">${title}</h5>
      <p>${description}</p>`;
        this.results.appendChild(el);
    }

    public resetResults() {
        this.removeResults();
        this.results.innerHTML = `
        <div class="flex justify-center py-10">
            <div class="self-center text-center">
                <div class="py-5">
                    <p class="text-lg font-bold">Waiting for input</p>
                    <p class="text-base">Don't be shy start typing.</p>
                </div>
                <img src="/search-illustration.svg" alt="An image of a lady looking at a plant. From unDraw." />
            </div>
        </div>`;
    }

    public removeResults() {
        let firstChild = this.results.firstChild;

        while (firstChild) {
            this.results.removeChild(firstChild);
            firstChild = this.results.firstChild;
        }
    }
}
