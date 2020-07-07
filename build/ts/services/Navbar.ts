import { Service, _URL } from "../framework/api";

export class Navbar extends Service {
    protected navbar: HTMLElement;
    protected elements: HTMLElement[];
    protected menu: HTMLElement;

    public init() {
        // Elements
        this.navbar = (document.getElementsByClassName("navbar")[0] as HTMLElement)
        this.elements = ([...this.navbar.getElementsByClassName('navbar-link')] as HTMLElement[]);
        this.menu = (document.getElementsByClassName("navbar-menu")[0] as HTMLElement);

        super.init();
        this.click = this.click.bind(this);
    }

    public validLink(el: HTMLAnchorElement): boolean {
        return el && el.tagName && el.tagName.toLowerCase() === 'a';
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

    public click(event) {
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
            let URLmatch = _URL.equal((item as HTMLAnchorElement).href, href);
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