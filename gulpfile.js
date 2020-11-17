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
const dartSass = require('sass');
const pug = require("gulp-pug");

const querySelector = require("posthtml-match-helper");
const minifyJSON = require("gulp-minify-inline-json");
const inline = require("posthtml-inline-assets");
const posthtml = require("gulp-posthtml");
const stringify = require("fast-stringify");
const path = require("path");
const fs = require("fs");

/**
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

const dotenv = require('dotenv');
dotenv.config();

const env = process.env;
const dev = 'dev' in env ? env.dev == "true" : false;
const netlify = 'netlify' in env ? env.netlify == "true" : false;

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
task("html", () => {
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
                        data: { ...data, icons, netlify },
                        self: true,
                    }),
                    minifyJSON(), // Minify application/ld+json
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
                                netlify
                            },
                            data
                        ),
                    }),
                    minifyJSON(), // Minify application/ld+json
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
                                netlify
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

    delete require.cache[resolve];
    delete require.cache[iconResolve];

    return streamList(pages);
});

// CSS Tasks
const { logError } = sass;
sass.compiler = dartSass;
tasks({
    "app-css": () => {
        return stream(`${sassFolder}/**/*.scss`, {
            pipes: [
                rename({ suffix: ".min" }), // Rename
                sass({ outputStyle: "compressed" }).on("error", logError),
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
                    safelist: [/min-h-400/, /min-h-500/],// ["active", "show", "focus", "hide"],
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
            pipes: [
                // Prefix & Compress CSS
                !dev ? postcss([
                    autoprefixer({
                        overrideBrowserslist: ["defaults"],
                    }),
                    csso(),
                ]) : null,
            ],
            dest: cssFolder,
            end: [browserSync.stream()],
        })
    },

    css: parallelFn("app-css", dev ? "tailwind-css" : seriesFn("tailwind-css", "purge", "minify-css")),
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
                                target: "es2015", // default, or 'es20XX', 'esnext'
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
                                    chrome: "54",
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
                babel({
                    compact: true,
                    presets: [
                        [
                            "@babel/env",
                            {
                                targets: {
                                    ie: "11",
                                    chrome: "54",
                                },
                            },
                        ],
                    ],
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
        end() {
            fs.writeFile(
                path.join(__dirname, destFolder, "searchindex.json"),
                stringify(index),
                (err) => {
                    if (err) throw err;
                    console.log("Search index json created successfully.");
                }
            );
        },
    });
});

// Inline assets
task("inline", () => {
    return stream(`${htmlFolder}/**/*.html`, {
        pipes: [
            posthtml([
                inline({
                    transforms: {
                        script: {
                            resolve(node) {
                                return node.tag === 'script' && node.attrs && ("inline" in node.attrs) &&
                                    typeof node.attrs.src == "string" && node.attrs.src.length > 1 &&
                                    (node.attrs.src[0] == "/" ? (node.attrs.src + "").slice(1) : node.attrs.src);
                            },
                            transform(node, data) {
                                delete node.attrs.src;
                                delete node.attrs["inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.content = [
                                    data.buffer.toString('utf8')
                                ];
                                return node;
                            }
                        },
                        style: {
                            resolve(node) {
                                return node.tag === 'link' && node.attrs && node.attrs.rel === "stylesheet" && ("inline" in node.attrs) &&
                                    typeof node.attrs.href === "string" && node.attrs.href.length > 1 &&
                                    (node.attrs.href[0] == "/" ? (node.attrs.href + "").slice(1) : node.attrs.href);
                            },
                            transform(node, data) {
                                delete node.attrs.href;
                                delete node.attrs.rel;
                                delete node.attrs["inline"];
                                if ("async" in node.attrs)
                                    delete node.attrs.async;

                                node.tag = 'style';
                                node.content = [
                                    data.buffer.toString('utf8')
                                ];
                                return node;
                            }
                        },
                        favicon: false,
                        image: false
                    }
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
            ])
        ],
        dest: htmlFolder
    });
});

// Build & Watch Tasks
task("build", parallel(
    series("html", "indexer"),
    series(
        parallel("css", "js", "assets"),
        "inline")
));
task("watch", () => {
    browserSync.init(
        {
            notify: true,
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
        series(`html`, "indexer", `reload`)
    );
    watch(`${sassFolder}/**/*.scss`, series(`app-css`));
    watch(
        [`${sassFolder}/tailwind.css`, `./tailwind.js`],
        series(`tailwind-css`)
    );
    watch(
        [`${tsFolder}/**/*.ts`, `!${tsFolder}/*.ts`, `${tsFolder}/${tsFile}`],
        series(parallelFn(`modern-js`, dev ? null : `legacy-js`), `reload`)
    );
    watch(
        [`!${tsFolder}/${tsFile}`, `${tsFolder}/*.ts`],
        series(`other-js`, `reload`)
    );
    watch(`${assetsFolder}/**/*`, series(`assets`, `reload`));
});

task(
    "default",
    series(
        parallel(
            series("html", "indexer"),
            "app-css", "tailwind-css", "js", "assets"),
        "watch"
    )
);
