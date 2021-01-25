import { Service } from "@okikio/native";

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
    protected newSearch: HTMLElement;
    protected noResultsEl: HTMLElement;
    protected overlay: HTMLElement;
    protected container: HTMLElement;
    protected scrollArea: HTMLElement;
    protected nonClickable: HTMLElement;

    public setActive(value: boolean) {
        this.active = value;
        return this;
    }

    public getActive() {
        return this.active;
    }

    public init() {
        super.init();
        this.toggle = this.toggle.bind(this);

        [
            "toggle",
            "keyup",
            "resultClick",
            "outOfFocus",
            "navClick",
            "clearBtnClick",
        ].forEach((key: string) => {
            this[key] = this[key]?.bind(this);
        });

        this.html = document.querySelector("html");
        this.navbar = this.html.querySelector(".navbar");
        this.rootElement = this.html.querySelector(".search-banner");
        this.overlay = this.html.querySelector(".search-overlay");

        this.btn = this.navbar.querySelector(".search-btn");
        this.icon = this.btn.querySelector(".search-icon");
        this.bg = this.btn.querySelector(".search-bg");

        this.inner = this.rootElement.querySelector(".search-inner");
        this.close = this.inner.querySelector(".search-close");
        this.input = this.inner.querySelector(".search-input");
        this.container = this.inner.querySelector(".search-container");
        this.scrollArea = this.inner.querySelector(".search-scrollable-area");
        this.nonClickable = this.inner.querySelector(".search-non-clickable");
        if (this.input) {
            this.results = this.inner.querySelector(".search-results");
            this.clearIcon = this.inner.querySelector(".clear-search");
            this.newSearch = this.inner.querySelector(".new-search");
            this.noResultsEl = this.inner.querySelector(".no-results");
        }
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
    public getLink(event: { target: HTMLAnchorElement; }): HTMLAnchorElement {
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

    public toggle() {
        if (!this.worker) {
            this.worker = new Worker("/js/FuzzySearch.min.js");

            // Receive data from a worker
            this.worker.onmessage = (event) => {
                let data = JSON.parse(event.data);
                if (data.length === 0 && this.value.length > 0) {
                    this.noResults();
                } else if (this.value.length === 0) {
                    this.resetResults();
                } else {
                    this.removeResults();
                    this.noResultsEl.classList.add("hide");
                    this.newSearch.classList.remove("show");
                    for (let i = 0, len = data.length; i < len; i++) {
                        this.addResult(data[i]);
                    }
                }
            };
        }

        this.active = !this.active;
        return new Promise<void>((resolve) => {
            this.navbar.blur();
            this.navbar.classList.toggle("focus", !this.active);
            this.navbar.classList.contains("active") &&
                this.navbar.classList.remove("active");

            this.navbar.classList.toggle("searching", this.active);
            this.overlay.classList.toggle("show", this.active);
            this.rootElement.classList.toggle("show", this.active);

            this.active && this.input.focus();
            resolve();
        });
    }

    keyup() {
        let { value } = this.input as HTMLInputElement;
        this.value = value;
        this.worker && this.worker.postMessage(value);
    }

    resultClick(e) {
        let el = this.getLink(e);
        if (!el || !el.classList.contains("search-result")) return;

        let href = this.getHref(el);
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
    }

    outOfFocus(e) {
        if (this.active) {
            let el = e.target as HTMLElement;
            if (
                this.nonClickable.contains(el) ||
                this.container.contains(el)
            )
                return;

            this.toggle();
        }
    }

    navClick(e) {
        let el = this.getLink(e);
        if (!el) return;
        if (this.active) this.toggle();
    }

    clearBtnClick() {
        (this.input as HTMLInputElement).value = "";
        this.value = "";
        this.resetResults();
    }

    public initEvents() {
        if (this.input) {
            this.btn.addEventListener("click", this.toggle, false);
            this.input.addEventListener("keyup", this.keyup, false);

            this.results.addEventListener("click", this.resultClick, false);

            this.rootElement.addEventListener("click", this.outOfFocus, false);
            this.navbar.addEventListener("click", this.navClick, false);
            this.clearIcon.addEventListener("click", this.clearBtnClick, false);
        }

        this.emitter.on("POPSTATE", this.popstate, this);
    }

    public popstate() {
        this.getActive() && this.toggle();
    }

    public stopEvents() {
        if (this.worker) {
            this.worker.terminate();
        }

        this.btn.removeEventListener("click", this.toggle);
        this.input.removeEventListener("keyup", this.keyup);

        this.results.removeEventListener("click", this.resultClick);

        this.rootElement.removeEventListener("click", this.outOfFocus);
        this.navbar.removeEventListener("click", this.navClick);
        this.clearIcon.removeEventListener("click", this.clearBtnClick);

        this.emitter.off("POPSTATE", this.popstate, this);
    }

    public uninstall() {
        if (this.worker) {
            this.worker = undefined;
        }

        this.html = undefined;
        this.navbar = undefined;
        this.rootElement = undefined;
        this.overlay = undefined;

        this.btn = undefined;
        this.icon = undefined;
        this.bg = undefined;

        this.inner = undefined;
        this.close = undefined;
        this.input = undefined;
        this.container = undefined;
        this.scrollArea = undefined;
        this.nonClickable = undefined;

        this.results = undefined;
        this.clearIcon = undefined;
        this.newSearch = undefined;
        this.noResultsEl = undefined;
    }

    public noResults() {
        this.removeResults();
        this.newSearch.classList.remove("show");
        this.noResultsEl.classList.remove("hide");
    }

    public addResult({
        title,
        description,
        href,
        keywords,
    }: {
        title: string;
        description: string;
        href: string;
        keywords: string;
    }) {
        let el = document.createElement("a");
        el.href = `${href}`;
        el.className = "search-result rounded-lg p-5 bg-gray-600 bg-opacity-15 hover:bg-opacity-35 block";
        el.innerHTML = `\
        <h5 class="font-title text-xl search-result-title pb-2 mb-4">${title}</h5>\
        <p>${description}</p>\
        <p class="mt-5 italic text-3">Keywords: ${keywords}</p>`;
        this.results.appendChild(el);
        el = undefined;
    }

    public resetResults() {
        this.removeResults();

        this.newSearch.classList.add("show");
        this.noResultsEl.classList.add("hide");
        this.active && this.input.focus();
    }

    public removeResults() {
        let firstChild = this.results.firstChild;

        while (firstChild) {
            this.results.removeChild(firstChild);
            firstChild = this.results.firstChild;
        }
        firstChild = undefined;
    }
}
