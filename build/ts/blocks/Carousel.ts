import { Block, IBlockInit, BlockIntent } from "../framework/api";

//== Blocks
const lerp = (a: number, b: number, n: number): number => (1 - n) * a + n * b;

export class Carousel extends Block {
    public ease: number = 0.15;
    public speed: number = 2.5;
    public delay: number = 3000;

    public carouselBtn: HTMLElement;
    public prevBtn: HTMLElement;
    public nextBtn: HTMLElement;

    public container: HTMLElement;
    public viewport: HTMLElement;
    public slides: HTMLElement[];

    public dotContainer: HTMLElement;
    public dots: HTMLElement[];
    public dot: HTMLElement;

    public viewportWidth: number;
    public width: number;

    public interval: number;
    public rAF: number;

    public lastIndex: number;
    public index: number;
    public slideLen: number;

    public currentX: number;
    public lastX: number;
    public maxX: number;
    public minX: number;

    public offX: number;
    public onX: number;

    public center: number;
    public isDragging: boolean;

    public init(value: IBlockInit) {
        super.init(value);
        this.dots = [];

        this.container = this.rootElement.getElementsByClassName("carousel-container")[0] as HTMLElement;
        this.viewport = this.rootElement.getElementsByClassName("carousel-viewport")[0] as HTMLElement;
        this.slides = [...this.rootElement.getElementsByClassName("carousel-item")] as HTMLElement[];

        this.carouselBtn = this.rootElement.getElementsByClassName("carousel-btn")[0] as HTMLElement;
        this.prevBtn = this.carouselBtn.getElementsByClassName("prev-btn")[0] as HTMLElement;
        this.nextBtn = this.carouselBtn.getElementsByClassName("next-btn")[0] as HTMLElement;

        this.dotContainer = this.rootElement.getElementsByClassName("carousel-dots")[0] as HTMLElement;
        this.dots = [...this.rootElement.getElementsByClassName("carousel-dot")] as HTMLElement[];
        this.dot = this.dots[0] as HTMLElement;

        this.slideLen = this.slides.length;
        this.center = window.innerWidth / 2;

        this.viewportWidth = 0;
        this.currentX = 0;
        this.width = 0;

        this.index = 0;
        this.lastIndex = this.index;

        this.lastX = 0;
        this.maxX = 0;
        this.minX = 0;

        this.offX = 0;
        this.onX = 0;

        this.isDragging = false;

        this.clearDots();
        this.setDots();
        this.setBounds();
        this.select(this.index);

        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.run = this.run.bind(this);
        this.next = this.next.bind(this);
        this.prev = this.prev.bind(this);
        this.loop = this.loop.bind(this);
        this.setPos = this.setPos.bind(this);
        this.resize = this.resize.bind(this);
        this.dotClick = this.dotClick.bind(this);
    }

    public setDots() {
        for (let i = 0; i < this.slideLen; i++) {
            const newDot = this.dot.cloneNode() as HTMLElement;
            if (i === this.index) newDot.classList.add("active");
            newDot.setAttribute("data-index", `${i}`);
            this.dotContainer.appendChild(newDot);
            this.dots[i] = newDot;
        }
    }

    public setActiveDot() {
        this.dots[this.lastIndex].classList.remove("active");
        this.dots[this.index].classList.add("active");
    }

    public clearDots() {
        for (let i = this.dots.length; --i >= 0;) {
            this.dots[i].classList.remove("active");
            this.dots[i].removeAttribute("data-index");
            this.dots[i].remove();
            this.dots.pop();
        }
    }

    public setHeight() {
        let { height } = (this.slides[this.index].children[0] as HTMLElement).getBoundingClientRect();
        this.container.style.height = `${height}px`;
    }

    public setBounds() {
        const { width } = this.slides[0].getBoundingClientRect();

        this.width = width;
        this.viewportWidth = this.width * this.slideLen;
        this.maxX = -(this.viewportWidth - window.innerWidth);
        this.setHeight();
    }

    public setPos(e: MouseEvent) {
        if (!this.isDragging) return;
        this.setCurrentX(this.offX + ((e.clientX - this.onX) * this.speed));
    }

    public closest() {
        let minDist: number, closest: number;
        const difference = this.parsePercent(this.currentX);
        for (let i = 0; i < this.slideLen; i++) {
            const dist = Math.abs((i * this.width) + difference);

            if (dist < minDist || typeof minDist == "undefined") {
                minDist = dist;
                closest = i;
            }
        }

        return closest;
    }

    public snap() {
        let closest = this.closest();
        this.select(closest);
    }

    public on(e: MouseEvent) {
        window.clearInterval(this.interval);
        this.isDragging = true;
        this.onX = e.clientX;
        this.rootElement.classList.add('is-grabbing');
    }

    public parsePercent(value: number) {
        return (value * this.viewportWidth) / 100;
    }

    public off(e: MouseEvent) {
        this.snap();
        this.isDragging = false;
        this.offX = this.parsePercent(this.currentX);
        this.rootElement.classList.remove('is-grabbing');
    }

    public toPercent(value: number) {
        return (value / this.viewportWidth) * 100;
    }

    public setCurrentX(value: number) {
        this.currentX = this.toPercent(value);
    }

    public select(index: number) {
        this.lastIndex = this.index;
        this.index = Math.min(Math.max(index, 0), this.slideLen - 1);
        this.setCurrentX(-this.index * this.width);
        this.setActiveDot();
        this.setHeight();
    }

    public run() {
        this.lastX = lerp(this.lastX, this.currentX, this.ease);
        this.lastX = Math.floor(this.lastX * 100) / 100;

        this.viewport.style.transform = `translate3d(${this.lastX}%, 0, 0)`;
        this.requestAnimationFrame();
    }

    public requestAnimationFrame() {
        this.rAF = requestAnimationFrame(this.run);
    }

    public initEvents() {
        this.run();
        this.interval = window.setInterval(this.loop, this.delay);

        this.nextBtn.addEventListener("click", this.next, false);
        this.prevBtn.addEventListener("click", this.prev, false);

        this.dotContainer.addEventListener("click", this.dotClick, false);

        window.addEventListener('pointermove', this.setPos, { passive: true });
        window.addEventListener('pointerdown', this.on, false);
        window.addEventListener('pointerup', this.off, false);
        window.addEventListener('resize', this.resize, false);
    }

    private dotClick(e: MouseEvent) {
        let target = e.target as HTMLElement;
        if (target.classList && target.classList.contains("carousel-dot")) {
            let index = +target.getAttribute("data-index");
            this.select(index);
        }
    }

    private loop() {
        if (this.index < (this.slideLen - 1))
            this.next();
        else this.select(0);
    }

    private prev() {
        this.select(this.index - 1);
    }

    private next() {
        this.select(this.index + 1);
    }

    public stopEvents() {
        window.clearInterval(this.interval);
        this.cancelAnimationFrame();

        this.nextBtn.removeEventListener("click", this.next, false);
        this.prevBtn.removeEventListener("click", this.prev, false);

        this.dotContainer.removeEventListener("click", this.dotClick, false);

        window.removeEventListener('pointermove', this.setPos);
        window.removeEventListener('pointerdown', this.on, false);
        window.removeEventListener('pointerup', this.off, false);
        window.removeEventListener('resize', this.resize, false);
    }

    public cancelAnimationFrame() {
        cancelAnimationFrame(this.rAF);
    }

    public resize() {
        this.setBounds();
    }
}

export const CarouselBlockIntent = new BlockIntent({
    name: "Carousel",
    block: Carousel
});