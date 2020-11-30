import { Service } from "../framework/api";
// import { animate } from "@okikio/animate";

export class Image extends Service {
    images: HTMLImageElement[];
    // observer: IntersectionObserver;

    WebpSupport = false;

    public init() {
        super.init();
        this.test_webp();

        this.get_images();
        requestAnimationFrame(() => {
            this.load_img();
        });
    }

    public get_images() {
        this.images = Array.prototype.slice.call(
            document.querySelectorAll("figure.img")
        );
    }

    public remove_images() {
        while (this.images.length) this.images.pop();
    }

    public load_img() {
        for (let elem of this.images) {
            let img = elem.querySelector(".img-core") as HTMLImageElement;
            let srcset = img.getAttribute("data-src");
            let srcWid = Math.max(Math.round(elem.clientWidth), 10);
            let srcHei = Math.max(Math.round(elem.clientHeight), 10);

            // Use the largest image dimensions it remembers
            let maxW = img.hasAttribute("data-max-w") ? img.getAttribute("data-max-w") : 0;
            if (Number(maxW) < Number(srcWid)) {
                img.setAttribute("data-max-w", "" + srcWid);
                img.setAttribute("width", "" + srcWid);
                img.setAttribute("height", "" + srcHei);
            } else srcWid = Number(maxW);

            let src = srcset.replace(/w_auto/, `w_${srcWid}`);
            if (srcHei > srcWid) src = src.replace(/ar_4:3,/, `ar_3:4,`); // src = src.replace(/ar_4:3/, `ar_3:4`);
            if (!this.WebpSupport) src = src.replace(".webp", ".jpg");

            // If nothing has changed don't bother
            if (src === img.src) return;

            // Ensure the image has loaded, then replace the small preview
            img.src = src;
            if (!elem.classList.contains("img-show"))
                (img.onload = () => { elem.classList.add("img-show"); img.onload = undefined; }); // Hide the image preview

        }
    }

    public initEvents() {
        let waitOnResize = false;
        window.addEventListener(
            "resize",
            () => {
                if (!waitOnResize) {
                    // this.remove_images();
                    // this.get_images();

                    requestAnimationFrame(() => {
                        this.load_img();
                        waitOnResize = true;
                    });
                }

                waitOnResize = false;
            },
            { passive: true }
        );

        this.EventEmitter.on("BEFORE_TRANSITION_OUT", () => {
            this.remove_images();
        });

        this.EventEmitter.on("CONTENT_INSERT", () => {
            this.get_images();

            this.load_img();
        });
    }

    public test_webp() {
        // Quick test for webp support
        try {
            this.WebpSupport =
                document
                    .createElement("canvas")
                    .toDataURL("image/webp")
                    .indexOf("data:image/webp") == 0;
        } catch (e) {
            this.WebpSupport = false;
        }

        if (!this.WebpSupport) {
            // Long Test for webp support
            (() => {
                // If the browser doesn't has the method createImageBitmap, you can't display webp format
                if (!window.createImageBitmap) {
                    this.WebpSupport = false;
                    return;
                }

                // Base64 representation of a white point image
                let webpdata =
                    "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=";

                // Retrieve the Image in Blob Format
                fetch(webpdata)
                    .then((response) => response.blob())
                    .then((blob) => {
                        // If the createImageBitmap method succeeds, return true, otherwise false
                        createImageBitmap(blob)
                            .then(() => {
                                this.WebpSupport = true;
                            })
                            .catch(() => {
                                this.WebpSupport = false;
                            });
                    });
            })();
        }

        if (!this.WebpSupport) {
            // Safari still doesn't support WebP
            console.info(
                "Using JPG instead, of WEBP as this browser doesn't support WEBP."
            );
        }
    }
}
