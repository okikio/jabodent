// Import external modules
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const esbuild = require("rollup-plugin-esbuild");
const buble = require("@rollup/plugin-buble");
const rollup = require("gulp-better-rollup");
const babel = require("gulp-babel");

const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const tailwind = require("tailwindcss");
const purge = require("gulp-purgecss");
const csso = require("postcss-csso");
const bs = require("browser-sync");

const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const pug = require("gulp-pug");

/**
 * import { websiteURL, dev, debug, author, homepage, license, copyright, github, netlify } from './config';
import querySelector from "posthtml-match-helper";
import minifyJSON from 'gulp-minify-inline-json';
import phTransformer from 'posthtml-transformer';
import icons from './material-design-icons';
import postHTMLTextr from "posthtml-textr";
import postHTMLLorem from "posthtml-lorem";
import posthtml from 'gulp-posthtml';
import htmlmin from 'gulp-htmlmin';
import header from 'gulp-header';
 */

// Gulp utilities
const {
    stream,
    streamList,
    tasks,
    task,
    watch,
    parallel,
    series,
    parallelFn,
    seriesFn,
} = require("./util");

// Origin folders (source and destination folders)
const srcFolder = `build`;
const destFolder = `public`;

// Source file folders
const tsFolder = `${srcFolder}/ts`;
const pugFolder = `${srcFolder}/pug`;
const sassFolder = `${srcFolder}/sass`;
const assetsFolder = `${srcFolder}/assets`;

// Destination file folders
const jsFolder = `${destFolder}/js`;
const cssFolder = `${destFolder}/css`;
const htmlFolder = `${destFolder}`;

// Main ts file bane
const tsFile = `main.ts`;

// BrowserSync
const browserSync = bs.create();
task("reload", (resolve) => {
    browserSync.reload();
    resolve();
});

// HTML Tasks
const dataPath = `./data.js`;
const iconPath = `./icons.js`;
const resolve = require.resolve(dataPath);
const iconResolve = require.resolve(iconPath);
task("html", async () => {
    let data = require(resolve);
    let icons = require(iconResolve);
    let pages = [
        [
            `${pugFolder}/pages/**/*.pug`,
            {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        basedir: pugFolder,
                        data: { ...data, icons },
                        self: true,
                    }),
                ],
                dest: htmlFolder,
            },
        ],
    ];

    let values = Object.values(data.services);
    for (let i = 0, len = values.length; i < len; i++) {
        let next = i + 1 < len ? values[i + 1] : values[0];
        let service = values[i];
        let { pageURL } = service;
        pages.push([
            `${pugFolder}/layouts/service.pug`,
            {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        basedir: pugFolder,
                        self: true,
                        data: Object.assign(
                            {
                                index: i,
                                len,
                                next,
                                service,
                                icons,
                            },
                            data
                        ),
                    }),
                    rename(pageURL),
                ],
                dest: `${htmlFolder}/services`,
            },
        ]);
    }

    let team = Object.values(data.team);
    for (let i = 0, len = team.length; i < len; i++) {
        let person = team[i];
        let { pageURL } = person;
        pages.push([
            `${pugFolder}/layouts/person.pug`,
            {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        basedir: pugFolder,
                        self: true,
                        data: Object.assign(
                            {
                                index: i,
                                len,
                                person,
                                icons,
                            },
                            data
                        ),
                    }),
                    rename(pageURL),
                ],
                dest: `${htmlFolder}/team`,
            },
        ]);
    }

    let pipe = await streamList(pages);
    delete require.cache[resolve];
    delete require.cache[iconResolve];
    return Promise.resolve(pipe);
});

// CSS Tasks
const { logError } = sass;
tasks({
    "app-css": () => {
        return stream(`${sassFolder}/**/*.scss`, {
            pipes: [
                rename({ suffix: ".min" }), // Rename
                sass({ outputStyle: "compressed" }).on("error", logError),
                // Prefix & Compress CSS
                postcss([
                    autoprefixer({
                        overrideBrowserslist: ["defaults"],
                    }),
                    csso(),
                ]),
            ],
            dest: cssFolder,
            end: [browserSync.stream()],
        });
    },

    "tailwind-css": () => {
        return stream(`${sassFolder}/tailwind.css`, {
            pipes: [postcss([tailwind("./tailwind.js")])],
            dest: cssFolder,
            end: [browserSync.stream()],
        });
    },

    purge: () => {
        return stream(`${cssFolder}/tailwind.css`, {
            pipes: [
                // Remove unused CSS
                purge({
                    content: [`${pugFolder}/**/*.pug`],
                    //   whitelistPatterns: [/active/, /focus/, /show/, /hide/],
                    //   whitelist: ["active", "show", "focus", "hide"],
                    keyframes: false,
                    fontFace: false,
                    defaultExtractor: (content) => {
                        // Capture as liberally as possible, including things like `h-(screen-1.5)`
                        const broadMatches =
                            content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []; // Capture classes within other delimiters like .block(class="w-1/2") in Pug

                        const innerMatches =
                            content.match(
                                /[^<>"'`\s.(){}\[\]#=%]*[^<>"'`\s.(){}\[\]#=%:]/g
                            ) || [];
                        return broadMatches.concat(innerMatches);
                    },
                }),
                // Prefix & Compress CSS
                postcss([
                    autoprefixer({
                        overrideBrowserslist: ["defaults"],
                    }),
                    csso(),
                ]),
            ],
            dest: cssFolder, // Output
        });
    },

    css: parallelFn("app-css", seriesFn("tailwind-css", "purge")),
});

// JS Tasks
// Rollup warnings are annoying
let ignoreLog = [
    "CIRCULAR_DEPENDENCY",
    "UNRESOLVED_IMPORT",
    "EXTERNAL_DEPENDENCY",
    "THIS_IS_UNDEFINED",
];
let onwarn = ({ loc, message, code, frame }, warn) => {
    if (ignoreLog.indexOf(code) > -1) return;
    if (loc) {
        warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
        if (frame) warn(frame);
    } else warn(message);
};

tasks({
    "modern-js": () => {
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                rollup(
                    {
                        treeshake: true,
                        // preserveEntrySignatures: false,
                        plugins: [
                            nodeResolve(),
                            esbuild({
                                // watch: watching,
                                minify: true,
                                target: "es2017", // default, or 'es20XX', 'esnext'
                            }),
                        ],
                        onwarn,
                    },
                    "es"
                ),
                rename("modern.min.js"), // Rename
            ],
            dest: jsFolder, // Output
        });
    },
    "legacy-js": () => {
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                rollup(
                    {
                        treeshake: true,
                        // preserveEntrySignatures: false,
                        plugins: [
                            nodeResolve(),
                            esbuild({
                                // watch: watching,
                                minify: true,
                                target: "es2015", // default, or 'es20XX', 'esnext'
                            }),
                        ],
                        onwarn,
                    },
                    "umd"
                ),
                babel({
                    compact: true,
                    presets: [
                        [
                            "@babel/env",
                            {
                                targets: {
                                    ie: "11",
                                },
                            },
                        ],
                    ],
                }),
                rename("legacy.min.js"), // Rename
            ],
            dest: jsFolder, // Output
        });
    },
    "other-js": () => {
        return stream([`${tsFolder}/*.ts`, `!${tsFolder}/${tsFile}`], {
            pipes: [
                // Bundle Modules
                rollup(
                    {
                        treeshake: true,
                        // preserveEntrySignatures: false,
                        plugins: [
                            nodeResolve(),
                            esbuild({
                                // watch: watching,
                                minify: true,
                                target: "es2015", // default, or 'es20XX', 'esnext'
                            }),
                            buble({
                                // custom `Object.assign` (used in object spread)
                                objectAssign: "Object.assign",
                            }),
                        ],
                        onwarn,
                    },
                    "umd"
                ),
                rename({ suffix: ".min", extname: ".js" }), // Rename
            ],
            dest: jsFolder, // Output
        });
    },
    js: parallelFn(`modern-js`, `legacy-js`, `other-js`),
});

// Other assets
task("assets", () => {
    return stream(`${assetsFolder}/**/*`, {
        dest: destFolder,
    });
});

// Build & Watch Tasks
task("build", parallel("html", "css", "js", "assets"));
task("watch", () => {
    browserSync.init(
        {
            notify: false,
            server: destFolder,
        },
        (_err, bs) => {
            bs.addMiddleware("*", (_req, res) => {
                res.writeHead(302, {
                    location: `/404.html`,
                });
                res.end("404 Error");
            });
        }
    );
    watch(
        [`${pugFolder}/**/*.pug`, dataPath, iconPath],
        series(`html`, `reload`)
    );
    watch(`${sassFolder}/**/*.scss`, series(`app-css`));
    watch(
        [`${sassFolder}/tailwind.css`, `./tailwind.js`],
        series(`tailwind-css`)
    );
    watch(
        [`${tsFolder}/**/*.ts`, `!${tsFolder}/*.ts`, `${tsFolder}/${tsFile}`],
        series(parallel(`modern-js`, `legacy-js`), `reload`)
    );
    watch(
        [`!${tsFolder}/${tsFile}`, `${tsFolder}/*.ts`],
        series(`other-js`, `reload`)
    );
    watch(`${assetsFolder}/**/*`, series(`assets`, `reload`));
});

task(
    "default",
    series(parallel("html", "app-css", "tailwind-css", "js", "assets"), "watch")
);
