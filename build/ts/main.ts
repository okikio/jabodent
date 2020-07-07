
// import { getTheme, setTheme, mediaTheme } from "./theme";
import { PJAX, App, _URL } from "./framework/api";

import { Splashscreen } from "./services/Splashscreen";
import { IntroAnimation } from "./services/IntroAnimation";
import { Navbar } from "./services/Navbar";

import { Fade } from "./transitions/Fade";
// import { BigTransition } from "./transitions/BigTransition";
// import { Slide, SlideLeft, SlideRight } from "./transitions/Slide";

const app: App = new App();
let splashscreen: Splashscreen;

app
    .addService(new IntroAnimation())
    .add("service", new PJAX())
    .addService(new Navbar())

    .add("transition", new Fade());
// .addTransition(new BigTransition())
// .addTransition(new Slide())
// .add("transition", new SlideLeft())
// .add("transition", new SlideRight());

try {
    app.boot();
} catch (err) {
    // splashscreen.show();
    console.warn("[App] boot failed,", err);
}