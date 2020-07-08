import { Block, IBlockInit, BlockIntent } from "../framework/api";

//== Blocks
function _getClosest(item, array, getDiff) {
    var closest,
        diff;

    if (!Array.isArray(array)) {
        throw new Error("Get closest expects an array as second argument");
    }

    array.forEach(function (comparedItem, comparedItemIndex) {
        var thisDiff = getDiff(comparedItem, item);

        if (thisDiff >= 0 && (typeof diff == "undefined" || thisDiff < diff)) {
            diff = thisDiff;
            closest = comparedItemIndex;
        }
    });

    return closest;
}

function number(item, array) {
    return _getClosest(item, array, function (comparedItem, item) {
        return Math.abs(comparedItem - item);
    });
}

function lerp(a, b, n) {
    return (1 - n) * a + n * b
}

// class Slider {
//   constructor(options = {}) {
//     this.bind()

//     this.opts = {
//       el: options.el || '.js-slider',
//       ease: options.ease || 0.1,
//       speed: options.speed || 1.5,
//       velocity: 25,
//       scroll: options.scroll || false
//     }

//     this.slider = document.querySelector('.js-slider')
//     this.sliderInner = this.slider.querySelector('.js-slider__inner')
//     this.slides = [...this.slider.querySelectorAll('.js-slide')]
//     this.slidesNumb = this.slides.length

//     this.rAF = undefined

//     this.sliderWidth = 0

//     this.onX = 0
//     this.offX = 0

//     this.currentX = 0
//     this.lastX = 0

//     this.min = 0
//     this.max = 0

//     this.centerX = window.innerWidth / 2
//   }

//   bind() {
//     ['setPos', 'run', 'on', 'off', 'resize'].forEach((fn) => this[fn] = this[fn].bind(this))
//   }

//   setBounds() {
//     const bounds = this.slides[0].getBoundingClientRect()
//     const slideWidth = bounds.width

//     this.sliderWidth = this.slidesNumb * slideWidth
//     this.max = -(this.sliderWidth - window.innerWidth)

//     this.slides.forEach((slide, index) => {
//       slide.style.left = `${index * slideWidth}px`
//     })
//   }

//   setPos(e) {
//     if (!this.isDragging) return
//     this.currentX = this.offX + ((e.clientX - this.onX) * this.opts.speed)
//     this.clamp()
//   }

//   clamp() {
//     this.currentX = Math.max(Math.min(this.currentX, this.min), this.max)
//   }

//   run() {
//     this.lastX = lerp(this.lastX, this.currentX, this.opts.ease)
//     this.lastX = Math.floor(this.lastX * 100) / 100 

//     const sd = this.currentX - this.lastX
//     const acc = sd / window.innerWidth
//     let velo =+ acc

//     this.sliderInner.style.transform = `translate3d(${this.lastX}px, 0, 0) skewX(${velo * this.opts.velocity}deg)`

//     this.requestAnimationFrame()
//   }

//   on(e) {
//     this.isDragging = true
//     this.onX = e.clientX
//     this.slider.classList.add('is-grabbing')
//   }

//   off(e) {
//     this.snap()
//     this.isDragging = false
//     this.offX = this.currentX
//     this.slider.classList.remove('is-grabbing')
//   }

//   closest() {
//     const numbers = []
//     this.slides.forEach((slide, index) => {
//       const bounds = slide.getBoundingClientRect()
//       const diff = this.currentX - this.lastX
//       const center = (bounds.x + diff) + (bounds.width / 2)
//       const fromCenter = this.centerX - center
//       numbers.push(fromCenter)
//     })

//     let closest = number(0, numbers)
//     closest = numbers[closest]

//     return {
//       closest
//     }
//   }

//   snap() {
//     const { closest } = this.closest()

//     this.currentX = this.currentX + closest
//     this.clamp()
//   }

//   requestAnimationFrame() {
//     this.rAF = requestAnimationFrame(this.run)
//   }

//   cancelAnimationFrame() {
//     cancelAnimationFrame(this.rAF)
//   }

//   addEvents() {
//     this.run()

//     this.slider.addEventListener('mousemove', this.setPos, { passive: true })
//     this.slider.addEventListener('mousedown', this.on, false)
//     this.slider.addEventListener('mouseup', this.off, false)

//     window.addEventListener('resize', this.resize, false)
//   }

//   removeEvents() {
//     this.cancelAnimationFrame(this.rAF)

//     this.slider.removeEventListener('mousemove', this.setPos, { passive: true })
//     this.slider.removeEventListener('mousedown', this.on, false)
//     this.slider.removeEventListener('mouseup', this.off, false)
//   }

//   resize() {
//     this.setBounds()
//   }

//   destroy() {
//     this.removeEvents()

//     this.opts = {}
//   }

//   init() {
//     this.setBounds()
//     this.addEvents()
//   }
// }

// const slider = new Slider()
// slider.init()

export class Carousel extends Block {
    public ease: number = 0.1;
    public speed: number = 1.5;

    public container: HTMLElement;
    public viewport: HTMLElement;
    public slides: HTMLElement[];

    public dotContainer: HTMLElement;
    public dots: HTMLElement[];
    public dot: HTMLElement;

    public viewportWidth: number;
    public widths: number[];
    public rAF: number;

    public index: number;
    public slideLen: number;

    public currentX: number;
    public lastX: number;
    public maxX: number;
    public minX: number;

    public offX: number;
    public onX: number;

    public centerX: number;
    public isDragging: boolean;

    public init(value: IBlockInit) {
        super.init(value);

        this.widths = [];
        this.dots = [];

        this.container = this.rootElement.getElementsByClassName("carousel-container")[0] as HTMLElement;
        this.viewport = this.rootElement.getElementsByClassName("carousel-viewport")[0] as HTMLElement;
        this.slides = [...this.rootElement.getElementsByClassName("carousel-item")] as HTMLElement[];
        this.dots = [...this.rootElement.getElementsByClassName("carousel-dot")] as HTMLElement[];
        this.dotContainer = this.rootElement.getElementsByClassName("carousel-dots")[0] as HTMLElement;
        this.dot = this.dots[0] as HTMLElement;

        this.slideLen = this.slides.length;
        this.centerX = window.innerWidth / 2;

        this.viewportWidth = 0;
        this.currentX = 0;

        this.index = 0;
        this.lastX = 0;
        this.maxX = 0;
        this.minX = 0;

        this.offX = 0;
        this.onX = 0;

        this.isDragging = false;

        this.clearDots();
        this.setDots();
        this.setBounds();

        this.setPos = this.setPos.bind(this);
        this.on = this.on.bind(this);
        this.off = this.off.bind(this);
        this.run = this.run.bind(this);
        this.resize = this.resize.bind(this);
    }

    public setDots() {
        for (let i = 0; i < this.slideLen; i++) {
            const newDot = this.dot.cloneNode() as HTMLElement;
            if (i === this.index) newDot.classList.add("active");
            this.dotContainer.appendChild(newDot);
            this.dots[i] = newDot;
        }
    }

    public clearDots() {
        for (let i = this.dots.length; --i >= 0;) {
            this.dots[i].classList.remove("active");
            this.dots[i].remove();
            this.dots.pop();
        }
    }

    public setBounds() {
        this.viewportWidth = 0;
        for (let i = 0; i < this.slideLen; i++) {
            const slide = this.slides[i];
            const { width } = slide.getBoundingClientRect();
            this.widths[i] = width;
            this.viewportWidth += width;
        }

        this.maxX = -(this.viewportWidth - window.innerWidth);
    }

    public setPos(e: MouseEvent) {
        if (!this.isDragging) return;
        this.currentX = this.offX + ((e.clientX - this.onX) * this.speed);
        this.clamp();
    }

    public clamp() {
        this.currentX = Math.max(Math.min(this.currentX, this.minX), this.maxX);
    }

    public run() {
        this.lastX = lerp(this.lastX, this.currentX, this.ease);
        this.lastX = Math.floor(this.lastX * 100) / 100;

        this.viewport.style.transform = `translate3d(${this.lastX}px, 0, 0)`;
        this.requestAnimationFrame();
    }

    public requestAnimationFrame() {
        this.rAF = requestAnimationFrame(this.run);
    }

    public on(e: MouseEvent) {
        this.isDragging = true;
        this.onX = e.clientX;
        this.rootElement.classList.add('is-grabbing');
    }


    public closest() {
        const numbers = []
        this.slides.forEach((slide, index) => {
            const bounds = slide.getBoundingClientRect();
            const diff = this.currentX - this.lastX;
            const center = (bounds.x + diff) + (bounds.width / 2);
            const fromCenter = this.centerX - center;
            numbers.push(fromCenter);
        });

        let closest = number(0, numbers);
        closest = numbers[closest];
        return closest;
    }

    public snap() {
        this.currentX = this.currentX + this.closest();
        this.clamp();
    }

    public off(e: MouseEvent) {
        this.snap();
        this.isDragging = false;
        this.offX = this.currentX;
        this.rootElement.classList.remove('is-grabbing');
    }

    public cancelAnimationFrame() {
        cancelAnimationFrame(this.rAF);
    }

    public resize() {
        this.setBounds();
    }

    public initEvents() {
        this.run();

        this.rootElement.addEventListener('mousemove', this.setPos, { passive: true });
        this.rootElement.addEventListener('mousedown', this.on, false);
        this.rootElement.addEventListener('mouseup', this.off, false);

        window.addEventListener('resize', this.resize, false);
    }

    public stopEvents() {
        this.cancelAnimationFrame();

        // @ts-ignore
        this.rootElement.removeEventListener('mousemove', this.setPos, { passive: true });
        this.rootElement.removeEventListener('mousedown', this.on, false);
        this.rootElement.removeEventListener('mouseup', this.off, false);
    }
}

export const CarouselBlockIntent = new BlockIntent({
    name: "Carousel",
    block: Carousel
});