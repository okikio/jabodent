// Import external modules
// import { default as querySelector } from "posthtml-match-helper";
// import { default as inline } from "posthtml-inline-assets";
// import { default as posthtml } from "gulp-posthtml";

// import { default as stringify } from "fast-stringify";
// // import { default as rename } from "gulp-rename";
// import { default as fs } from "fs-extra";
// import { default as path } from "path";
// import { default as del } from "del";

// Gulp utilities
// const {
//     stream,
//     streamList,
//     tasks,
//     task,
//     watch,
//     parallel,
//     series,
//     parallelFn,
//     seriesFn,
// } = require("./util");
const gulp = require("gulp");
const mergeStream = require("merge-stream");
const { src, dest, parallel, watch, task, series } = gulp;

// Streamline Gulp Tasks
const stream = (_src, _opt = {}) => {
    let _end = _opt.end;
    let host =
            typeof _src !== "string" && !Array.isArray(_src)
                ? _src
                : src(_src, _opt.opts),
        _pipes = _opt.pipes || [],
        _dest = _opt.dest === undefined ? "." : _opt.dest,
        _log = _opt.log || (() => {});

    _pipes.forEach((val) => {
        if (val !== undefined && val !== null) {
            host = host.pipe(val);
        }
    });

    if (_dest !== null) host = host.pipe(dest(_dest));
    host = host.on("end", (...args) => {
        _log(...args);
        if (typeof _end === "function") _end(...args);
    }); // Output

    if (Array.isArray(_end)) {
        _end.forEach((val) => {
            if (val !== undefined && val !== null) {
                host = host.pipe(val);
            }
        });
    }
    return host;
};

// A list of streams
const streamList = (...args) => {
    // return Promise.all(
    return mergeStream(
        (Array.isArray(args[0]) ? args[0] : args).map((_stream) => {
            return Array.isArray(_stream) ? stream(..._stream) : _stream;
        })
    );
};

// A list of gulp tasks
const tasks = (list) => {
    let entries = Object.entries(list);
    for (let [name, fn] of entries) {
        task(name, (...args) => fn(...args));
    }
};

const parallelFn = (...args) => {
    let tasks = args.filter((x) => x !== undefined && x !== null);
    return function parallelrun(done) {
        return parallel(...tasks)(done);
    };
};

const seriesFn = (...args) => {
    let tasks = args.filter((x) => x !== undefined && x !== null);
    return function seriesrun(done) {
        return series(...tasks)(done);
    };
};

const dotenv =
    "netlify" in process.env || "dev" in process.env
        ? process.env
        : require("dotenv");
if (typeof dotenv.config === "function") dotenv.config();

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

// import { default as plumber } from "gulp-plumber";
// import { default as pug } from "gulp-pug";
tasks({
    "app-html": async () => {
        const [{ default: plumber }, { default: pug }] = await Promise.all([
            import("gulp-plumber"),
            import("gulp-pug"),
        ]);
        // const  = await import("gulp-plumber");
        // const  = await import("gulp-pug");

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
    "services-html": async () => {
        const [
            { default: plumber },
            { default: pug },
            { default: rename },
        ] = await Promise.all([
            import("gulp-plumber"),
            import("gulp-pug"),
            import("gulp-rename"),
        ]);
        // const { default: plumber } = await import("gulp-plumber");
        // const { default: pug } = await import("gulp-pug");
        // const { default: rename } = await import("gulp-rename");

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
    "team-html": async () => {
        const [
            { default: plumber },
            { default: pug },
            { default: rename },
        ] = await Promise.all([
            import("gulp-plumber"),
            import("gulp-pug"),
            import("gulp-rename"),
        ]);
        // const { default: plumber } = await import("gulp-plumber");
        // const { default: pug } = await import("gulp-pug");
        // const { default: rename } = await import("gulp-rename");

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

// import { default as autoprefixer } from "autoprefixer";
// import { default as postcss } from "gulp-postcss";
// import { default as tailwind } from "tailwindcss";
// import { default as purge } from "gulp-purgecss";
// import { default as csso } from "postcss-csso";

let browserSync;
// CSS Tasks
tasks({
    "app-css": async () => {
        const [{ default: sass }, { default: rename }] = await Promise.all([
            import("gulp-sass"),
            import("gulp-rename"),
        ]);
        // const { default: sass } = await import("gulp-sass");
        // const { default: rename } = await import("gulp-rename");
        return stream(`${sassFolder}/**/*.scss`, {
            pipes: [
                rename({ suffix: ".min" }), // Rename
                sass({ outputStyle: "compressed" }).on("error", sass.logError),
            ],
            end: browserSync && dev ? [browserSync.stream()] : undefined,
            dest: cssFolder,
        });
    },

    "tailwind-css": async () => {
        const [
            { default: postcss },
            { default: tailwind },
        ] = await Promise.all([import("gulp-postcss"), import("tailwindcss")]);
        // const { default: postcss } = await import("gulp-postcss");
        // const { default: tailwind } = await import("tailwindcss");
        return stream(`${sassFolder}/tailwind.css`, {
            pipes: [postcss([tailwind("./tailwind.js")])],
            // end: browserSync && dev ? [browserSync.stream()] : undefined,
            dest: cssFolder,
        });
    },

    "minify-css": async () => {
        const [
            { default: postcss },
            { default: autoprefixer },
            { default: csso },
        ] = await Promise.all([
            import("gulp-postcss"),
            import("autoprefixer"), // import("gulp-autoprefixer"),
            import("postcss-csso"), // import("gulp-csso"),
        ]);
        // const { default: autoprefixer } = await import("autoprefixer");
        // const { default: csso } = await import("postcss-csso");
        return stream(`${cssFolder}/**/*.css`, {
            pipes: !dev
                ? [
                      postcss([
                          // Prefix & Compress CSS
                          csso(),
                          autoprefixer({
                              overrideBrowserslist: ["defaults"],
                          }),
                      ]),
                  ]
                : [],
            dest: cssFolder,
            end: browserSync ? [browserSync.stream()] : undefined,
        });
    },

    css: seriesFn(parallelFn("app-css", "tailwind-css"), "minify-css"),
});

// JS Tasks
tasks({
    "modern-js": async () => {
        const [
            { default: esbuildGulp },
            { default: rename },
        ] = await Promise.all([import("gulp-esbuild"), import("gulp-rename")]);
        // const { default: esbuildGulp } = await import("gulp-esbuild");
        // const { default: rename } = await import("gulp-rename");
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
    "legacy-js": async () => {
        const [
            { default: esbuildGulp },
            { default: rename },
        ] = await Promise.all([import("gulp-esbuild"), import("gulp-rename")]);
        // const { default: esbuildGulp } = await import("gulp-esbuild");
        // const { default: rename } = await import("gulp-rename");
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
    "other-js": async () => {
        const [
            { default: esbuildGulp },
            { default: rename },
        ] = await Promise.all([import("gulp-esbuild"), import("gulp-rename")]);
        // const { default: esbuildGulp } = await import("gulp-esbuild");
        // const { default: rename } = await import("gulp-rename");
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
        opts: {
            base: assetsFolder,
        },
        dest: destFolder,
    });
});

// Search Indexer
// import { default as stringify } from "fast-stringify";
// import { default as fs } from "fs-extra";
// import { default as path } from "path";

// import { default as querySelector } from "posthtml-match-helper";
// import { default as posthtml } from "gulp-posthtml";
task("indexer", async () => {
    const index = [];
    const [
        { default: querySelector },
        { default: posthtml },
        { default: stringify },
        { default: fs },
        { default: path },
    ] = await Promise.all([
        import("posthtml-match-helper"),
        import("gulp-posthtml"),
        import("fast-stringify"),
        import("fs-extra"),
        import("path"),
    ]);
    const __dirname = path.resolve();
    // const { default: querySelector } = await import("posthtml-match-helper");
    // const { default: posthtml } = await import("gulp-posthtml");
    // const { default: stringify } = await import("fast-stringify");
    // const { default: fs } = await import("fs-extra");
    // const { default: path } = await import("path");

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
// import { default as minifyJSON } from "gulp-minify-inline-json";
// import { default as querySelector } from "posthtml-match-helper";
// import { default as inline } from "posthtml-inline-assets";
// import { default as posthtml } from "gulp-posthtml";
task("inline", async () => {
    const [
        { default: minifyJSON },
        { default: querySelector },
        { default: inline },
        { default: posthtml },
    ] = await Promise.all([
        import("gulp-minify-inline-json"),
        import("posthtml-match-helper"),
        import("posthtml-inline-assets"),
        import("gulp-posthtml"),
    ]);
    // const { default: minifyJSON } = await import("gulp-minify-inline-json");
    // const { default: querySelector } = await import("posthtml-match-helper");
    // const { default: inline } = await import("posthtml-inline-assets");
    // const { default: posthtml } = await import("gulp-posthtml");

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

// BrowserSync
// import { default as bs } from "browser-sync";
task("reload", (resolve) => {
    if (browserSync) browserSync.reload();
    delete require.cache[resolve];
    delete require.cache[iconResolve];
    resolve();
});

// Delete destFolder for added performance
// import { default as del } from "del";
task("clean", async (done) => {
    if (netlify) return await Promise.resolve(done());
    const { default: del } = await import("del");
    return del(destFolder);
});
task("watch", async () => {
    const { default: bs } = await import("browser-sync");
    browserSync = bs.create();
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

// Build & Watch Tasks
task(
    "build",
    series(
        "clean",
        parallel("html", "css", "js", "assets"),
        parallel("indexer", "inline")
    )
);
task(
    "default",
    series(
        "clean",
        parallel("html", "css", "js", "assets"),
        parallel("indexer", "watch")
    )
);
