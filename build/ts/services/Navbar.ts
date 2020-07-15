import { Service, _URL } from "../framework/api";

export class Navbar extends Service {
    public navbar: HTMLElement;
    public elements: HTMLElement[];
    public menu: HTMLElement;

    constructor() {
        super();
        // Elements
        this.navbar = (document.getElementsByClassName("navbar")[0] as HTMLElement)
        this.elements = ([...this.navbar.getElementsByClassName('navbar-item')] as HTMLElement[]);
        this.menu = (document.getElementsByClassName("navbar-menu")[0] as HTMLElement);

        this.click = this.click.bind(this);
    }

    public validLink(el: HTMLAnchorElement): boolean {
        return el && el.tagName && (el.tagName.toLowerCase() === 'a' || el.tagName.toLowerCase() === 'button');
    }

    public getLink({ target }): HTMLAnchorElement {
        let el = target as HTMLAnchorElement;
        while (el && !this.validLink(el)) {
            el = (el as HTMLElement).parentNode as HTMLAnchorElement;
        }
        // Check for a valid link
        if (!el) return;
        return el;
    }

    public click({ target }: Event) {
        let el = this.getLink(event);
        if (!el) return;

        if (el.classList.contains("navbar-menu")) {
            this.navbar.classList.toggle("active");
        } else if (el.classList.contains("navbar-link")) {
            this.navbar.classList.remove("active");
        }
    }

    public activateLink() {
        let { href } = window.location;

        for (let item of this.elements) {
            let itemHref = item.getAttribute("data-path") || (item as HTMLAnchorElement).href;
            if (!itemHref || itemHref.length < 1) continue;

            let URLmatch = new RegExp(itemHref).test(href);
            let isActive = item.classList.contains("active");
            if (!(URLmatch && isActive)) {
                item.classList[URLmatch ? "add" : "remove"]("active");
            }
        }
    }

    public initEvents() {
        this.EventEmitter.on("READY", this.activateLink, this);
        this.EventEmitter.on("GO", this.activateLink, this);
        this.navbar.addEventListener("click", this.click);
    }

    public stopEvents() {
        this.EventEmitter.off("READY", this.activateLink, this);
        this.EventEmitter.off("GO", this.activateLink, this);
        this.navbar.removeEventListener("click", this.click);
    }
}
