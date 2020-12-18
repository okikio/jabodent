// Import external modules
import { default as querySelector } from "posthtml-match-helper";
import { default as inline } from "posthtml-inline-assets";
import { default as posthtml } from "gulp-posthtml";

import { default as minifyJSON } from "gulp-minify-inline-json";
import { default as plumber } from "gulp-plumber";
import { default as pug } from "gulp-pug";

import { default as autoprefixer } from "autoprefixer";
import { default as postcss } from "gulp-postcss";
import { default as tailwind } from "tailwindcss";
import { default as purge } from "gulp-purgecss";
import { default as csso } from "postcss-csso";
import { default as sass } from "gulp-sass";

import { default as esbuildGulp } from "gulp-esbuild";
import { default as bs } from "browser-sync";

import { default as stringify } from "fast-stringify";
import { default as rename } from "gulp-rename";
import { default as fs } from "fs-extra";
import { default as path } from "path";
import { default as del } from "del";

// Gulp utilities
import { default as util } from "./util.js";
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
} = util;

import { default as dotenv } from "dotenv";
dotenv.config();

// BrowserSync
const browserSync = bs.create();

const env = process.env;
const dev = "dev" in env ? env.dev == "true" : false;
const netlify = "netlify" in env ? env.netlify == "true" : false;

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

// HTML Tasks
const dataPath = `./data.js`;
const iconPath = `./icons.js`;

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const resolve = require.resolve(dataPath);
const iconResolve = require.resolve(iconPath);

const pugConfig = {
    pretty: false,
    basedir: pugFolder,
    self: true,
    // debug: false,
    // compileDebug: false,
    // cache: true,
    // inlineRuntimeFunctions: true,
};
tasks({
    "app-html": () => {
        let data = require(resolve);
        let icons = require(iconResolve);
        return stream(`${pugFolder}/pages/**/*.pug`, {
            pipes: [
                plumber(), // Recover from errors without cancelling build task
                // Compile src html using Pug
                pug({
                    ...pugConfig,
                    data: { ...data, icons, netlify },
                }),
            ],
            dest: htmlFolder,
        });
    },
    "services-html": () => {
        let data = require(resolve);
        let icons = require(iconResolve);
        let values = Object.values(data.services),
            pages = [],
            i = 0,
            len = values.length;
        for (; i < len; i++) {
            let next = i + 1 < len ? values[i + 1] : values[0];
            let service = values[i];
            let { pageURL } = service;
            let page = stream(`${pugFolder}/layouts/service.pug`, {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        ...pugConfig,
                        data: Object.assign(
                            {
                                index: i,
                                len,
                                next,
                                service,
                                icons,
                                netlify,
                            },
                            data
                        ),
                    }),
                    rename(pageURL),
                ],
                dest: `${htmlFolder}/services`,
            });

            pages.push(page);
        }

        return streamList(pages);
    },
    "team-html": () => {
        let data = require(resolve);
        let icons = require(iconResolve);
        let team = Object.values(data.team),
            pages = [],
            i = 0,
            len = team.length;
        for (; i < len; i++) {
            let person = team[i];
            let { pageURL } = person;
            let page = stream(`${pugFolder}/layouts/person.pug`, {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        ...pugConfig,
                        data: Object.assign(
                            {
                                index: i,
                                len,
                                person,
                                icons,
                                netlify,
                            },
                            data
                        ),
                    }),
                    rename(pageURL),
                ],
                dest: `${htmlFolder}/team`,
            });

            pages.push(page);
        }

        return streamList(pages);
    },

    html: parallelFn("app-html", "services-html", "team-html"),
});

// CSS Tasks
tasks({
    "app-css": () => {
        return stream(`${sassFolder}/**/*.scss`, {
            pipes: [
                rename({ suffix: ".min" }), // Rename
                sass({ outputStyle: "compressed" }).on("error", sass.logError),
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
                    //   safelistPatterns: [/active/, /focus/, /show/, /hide/],
                    safelist: [
                        /min-h-400/,
                        /min-h-500/,
                        // /searching/,
                        // /active/,
                        // /focus/,
                        // /show/,
                        // /hide/,
                        // /light/,
                        // /dark/,
                    ], // ["active", "show", "focus", "hide"],
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
            ],
            dest: cssFolder, // Output
        });
    },

    "minify-css": () => {
        return stream(`${cssFolder}/*.css`, {
            pipes: !dev
                ? [
                      postcss([
                          // Prefix & Compress CSS
                          autoprefixer({
                              overrideBrowserslist: ["defaults"],
                          }),
                          csso(),
                      ]),
                  ]
                : [],
            dest: cssFolder,
            end: [browserSync.stream()],
        });
    },

    css: parallelFn(
        "app-css",
        dev ? "tailwind-css" : seriesFn("tailwind-css", "purge", "minify-css")
    ),
});

// JS Tasks
tasks({
    "modern-js": () => {
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuildGulp({
                    // target: "es2015", // default, or 'es20XX', 'esnext'
                    bundle: true,
                    minify: true,
                    // sourcemap: true,
                    target: ["chrome71"],
                }),
                rename("modern.min.js"), // Rename
            ],
            dest: jsFolder, // Output
        });
    },
    "legacy-js": () => {
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuildGulp({
                    // target: "es2015", // default, or 'es20XX', 'esnext'
                    bundle: true,
                    minify: true,
                    target: ["chrome58", "firefox57", "safari11", "edge16"],
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
                esbuildGulp({
                    // target: "es2015", // default, or 'es20XX', 'esnext'
                    bundle: true,
                    minify: true,
                    target: ["chrome58", "firefox57", "safari11", "edge16"],
                }),
                rename({ suffix: ".min", extname: ".js" }), // Rename
            ],
            dest: jsFolder, // Output
        });
    },
    js: parallelFn(`modern-js`, dev ? null : `legacy-js`, `other-js`),
});

// Other assets
task("assets", () => {
    return stream(`${assetsFolder}/**/*`, {
        dest: destFolder,
    });
});

// Search Indexer
task("indexer", () => {
    const index = [];
    return stream([`${htmlFolder}/**/*.html`, `!${htmlFolder}/**/404.html`], {
        pipes: [
            posthtml([
                (tree) => {
                    const data = {
                        title: "",
                        description: "",
                        keywords: "",
                    };

                    tree.match(querySelector("title"), (node) => {
                        if (data.title === "" && node.tag === "title") {
                            data.title = node.content.join("");
                        }
                        return node;
                    });

                    tree.match(
                        querySelector('link[rel="canonical"]'),
                        (node) => {
                            data.href = node.attrs.href;
                            return node;
                        }
                    );

                    tree.match(
                        querySelector("meta[name='description']"),
                        (node) => {
                            data.description = node.attrs.content;
                            return node;
                        }
                    );

                    tree.match(
                        querySelector("meta[name='keywords']"),
                        (node) => {
                            data.keywords = node.attrs.content;
                            return node;
                        }
                    );

                    index.push(data);
                },
            ]),
        ],
        dest: null,
        async end() {
            try {
                const __dirname = path.resolve();
                await fs.outputFile(
                    path.join(__dirname, destFolder, "searchindex.json"),
                    stringify(index)
                );
                console.log("Search index json created successfully.");
            } catch (err) {
                throw err;
            }
        },
    });
});

// Inline assets
task("inline", () => {
    return stream(`${htmlFolder}/**/*.html`, {
        pipes: [
            minifyJSON(), // Minify application/ld+json
            posthtml([
                inline({
                    transforms: {
                        script: {
                            resolve(node) {
                                return (
                                    node.tag === "script" &&
                                    node.attrs &&
                                    "inline" in node.attrs &&
                                    typeof node.attrs.src == "string" &&
                                    node.attrs.src.length > 1 &&
                                    (node.attrs.src[0] == "/"
                                        ? (node.attrs.src + "").slice(1)
                                        : node.attrs.src)
                                );
                            },
                            transform(node, data) {
                                delete node.attrs.src;
                                delete node.attrs["inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.content = [data.buffer.toString("utf8")];
                                return node;
                            },
                        },
                        style: {
                            resolve(node) {
                                return (
                                    node.tag === "link" &&
                                    node.attrs &&
                                    node.attrs.rel === "stylesheet" &&
                                    "inline" in node.attrs &&
                                    typeof node.attrs.href === "string" &&
                                    node.attrs.href.length > 1 &&
                                    (node.attrs.href[0] == "/"
                                        ? (node.attrs.href + "").slice(1)
                                        : node.attrs.href)
                                );
                            },
                            transform(node, data) {
                                delete node.attrs.href;
                                delete node.attrs.rel;
                                delete node.attrs["inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.tag = "style";
                                node.content = [data.buffer.toString("utf8")];
                                return node;
                            },
                        },
                        favicon: false,
                        image: false,
                    },
                }),

                (tree) => {
                    let data = "";

                    tree.match(querySelector("style.style-concat"), (node) => {
                        data += node.content.toString();
                        // delete node;
                    });

                    tree.match(querySelector("meta#concat-style"), (node) => {
                        node.tag = "style";
                        node.content = data;
                        // console.log(node.content);
                        return node;
                    });
                },
            ]),
        ],
        dest: htmlFolder,
    });
});

// Build & Watch Tasks
task(
    "build",
    series("html", parallel("css", "js", "indexer", "assets"), "inline")
);

task("reload", (resolve) => {
    browserSync.reload();
    delete require.cache[resolve];
    delete require.cache[iconResolve];
    resolve();
});

// Delete destFolder for added performance
task("clean", () => del(destFolder));
task("watch", () => {
    browserSync.init(
        {
            // ghostMode: true,
            notify: true,
            server: destFolder,
            online: true,
            scrollThrottle: 250,
            // open: false,
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
        [
            `${pugFolder}/pages/**/*.pug`,
            `${pugFolder}/layouts/layout.pug`,
            `${pugFolder}/components/*.pug`,
            dataPath,
            iconPath,
        ],
        { delay: 100 },
        series(`app-html`)
    );
    watch(
        [
            `${pugFolder}/layouts/person.pug`,
            `${pugFolder}/layouts/layout.pug`,
            `${pugFolder}/components/*.pug`,
            dataPath,
            iconPath,
        ],
        { delay: 100 },
        series(`team-html`)
    );
    watch(
        [
            `${pugFolder}/layouts/service.pug`,
            `${pugFolder}/layouts/layout.pug`,
            `${pugFolder}/components/*.pug`,
            dataPath,
            iconPath,
        ],
        { delay: 100 },
        series(`services-html`)
    );
    watch(
        [`${htmlFolder}/**/*.html`],
        { delay: 500 },
        parallel("indexer", "reload")
    );
    watch(`${sassFolder}/**/*.scss`, { delay: 100 }, series(`app-css`));
    watch(
        [`${sassFolder}/tailwind.css`, `./tailwind.js`],
        { delay: 100 },
        series(`tailwind-css`)
    );
    watch(
        [`${tsFolder}/**/*.ts`, `!${tsFolder}/*.ts`, `${tsFolder}/${tsFile}`],
        { delay: 100 },
        series(parallelFn(`modern-js`, dev ? null : `legacy-js`), `reload`)
    );
    watch(
        [`!${tsFolder}/${tsFile}`, `${tsFolder}/*.ts`],
        { delay: 100 },
        series(`other-js`, `reload`)
    );
    watch(`${assetsFolder}/**/*`, { delay: 500 }, series(`assets`, "reload"));
});

task(
    "default",
    series(
        "clean",
        parallel("html", "css", "js", "assets"),
        parallel("indexer", "watch")
    )
);
