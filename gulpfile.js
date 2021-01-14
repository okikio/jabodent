const mode = process.argv.includes("--watch") ? "watch" : "build";

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
    host.on("data", _log);
    host = host.on("end", (...args) => {
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
};

tasks({
    "app-html": async () => {
        const [{ default: plumber }, { default: pug }] = await Promise.all([
            import("gulp-plumber"),
            import("gulp-pug"),
        ]);

        let data = require(resolve);
        let icons = require(iconResolve);
        return stream(`${pugFolder}/pages/**/*.pug`, {
            opts: { ignoreInitial: false },
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
                opts: { ignoreInitial: false },
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
                opts: { ignoreInitial: false },
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
    "refresh-require": (done) => {
        delete require.cache[resolve];
        delete require.cache[iconResolve];
        done();
    },

    html: seriesFn(
        parallelFn("app-html", "services-html", "team-html"),
        "refresh-require"
    ),
});

let browserSync;
// CSS Tasks
tasks({
    "app-css": async () => {
        const [{ default: sass }] = await Promise.all([import("gulp-sass")]);
        return stream(`${sassFolder}/*.scss`, {
            pipes: [
                sass({ outputStyle: "compressed" }).on("error", sass.logError),
            ],
            dest: cssFolder,
        });
    },

    "tailwind-css": async () => {
        const [
            { default: postcss },
            { default: tailwind },
        ] = await Promise.all([import("gulp-postcss"), import("tailwindcss")]);
        return stream(`${sassFolder}/tailwind.css`, {
            pipes: [postcss([tailwind("./tailwind.js")])],
            dest: cssFolder,
        });
    },

    "reload-css": () => {
        return stream(`${cssFolder}/*.css`, {
            pipes: [],
            dest: null,
            end: browserSync ? [browserSync.stream()] : undefined,
        });
    },

    css: seriesFn(parallelFn("app-css", "tailwind-css"), "reload-css"),
});

// JS Tasks
tasks({
    "modern-js": async () => {
        const [
            { default: gulpEsBuild, createGulpEsbuild },
            { default: gzipSize },
            { default: prettyBytes },
        ] = await Promise.all([
            import("gulp-esbuild"),
            import("gzip-size"),
            import("pretty-bytes"),
        ]);

        const esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    sourcemap: true,
                    outfile: "modern.min.js",
                    target: ["chrome71"],
                }),
            ],
            dest: jsFolder, // Output
            async end() {
                console.log(
                    `=> Gzip size - ${prettyBytes(
                        await gzipSize.file(`${jsFolder}/modern.min.js`)
                    )}\n`
                );
            },
        });
    },
    "legacy-js": async () => {
        const [
            { default: gulpEsBuild, createGulpEsbuild },
        ] = await Promise.all([import("gulp-esbuild")]);

        const esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream(`${tsFolder}/${tsFile}`, {
            pipes: [
                // Bundle Modules
                esbuild({
                    bundle: true,
                    minify: true,
                    outfile: "legacy.min.js",
                    target: ["chrome58", "firefox57", "safari11", "edge16"],
                }),
            ],
            dest: jsFolder, // Output
        });
    },
    "other-js": async () => {
        const [
            { default: gulpEsBuild, createGulpEsbuild },
            { default: rename },
        ] = await Promise.all([import("gulp-esbuild"), import("gulp-rename")]);

        const esbuild = mode == "watch" ? createGulpEsbuild() : gulpEsBuild;
        return stream([`${tsFolder}/*.ts`, `!${tsFolder}/${tsFile}`], {
            pipes: [
                // Bundle Modules
                esbuild({
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
task("indexer", async () => {
    const [
        { default: querySelector },
        { default: posthtml },
        { default: stringify },
        { default: fs },
        { default: path },
        { default: log },
    ] = await Promise.all([
        import("posthtml-match-helper"),
        import("gulp-posthtml"),
        import("fast-stringify"),
        import("fs-extra"),
        import("path"),
        import("fancy-log"),
    ]);
    const index = [];
    return stream([`${htmlFolder}/**/*.html`, `!${htmlFolder}/**/404.html`], {
        opts: {
            base: htmlFolder,
        },
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
                    path.join(__dirname, `${destFolder}/searchindex.json`),
                    stringify(index)
                );
                log("Search index json created successfully.");
            } catch (err) {
                log.warn(err);
            }
        },
    });
});

// Inline assets
task("inline", async () => {
    const [
        { default: minifyJSON },
        { default: querySelector },
        { default: posthtml },
        { default: concat },

        { default: postcss },
        { default: autoprefixer },
        { default: csso },
        { default: purge },
    ] = await Promise.all([
        import("gulp-minify-inline-json"),
        import("posthtml-match-helper"),
        import("gulp-posthtml"),
        import("gulp-concat"),

        import("gulp-postcss"),
        import("autoprefixer"),
        import("postcss-csso"),
        import("@fullhuman/postcss-purgecss"),
    ]);

    return streamList([
        [
            `${htmlFolder}/**/*.html`,
            {
                pipes: [
                    minifyJSON(), // Minify application/ld+json
                    posthtml([
                        (tree) => {
                            tree.match(
                                querySelector("link.style-concat"),
                                (node) => {
                                    delete node;
                                }
                            );

                            tree.match(
                                querySelector("meta#concat-style"),
                                (node) => {
                                    node.tag = "link";
                                    node.attrs = {
                                        rel: "stylesheet",
                                        href: "/css/app.min.css",
                                        async: "",
                                    };

                                    return node;
                                }
                            );
                        },
                    ]),
                ],
                dest: htmlFolder,
            },
        ],
        [
            `${cssFolder}/*.css`,
            {
                pipes: [
                    // Concat all files
                    concat("app.min.css"),

                    postcss([
                        // Purge, Prefix & Compress CSS
                        purge({
                            mode: "all",
                            content: [`${pugFolder}/**/*.pug`],

                            safelist: [
                                "min-h-400",
                                "min-h-500",
                                "searching",
                                // "focus",
                                /-webkit-scrollbar/,
                                /active/,
                                /show/,
                                /hide/,
                                /light/,
                                /dark/,
                            ],
                            keyframes: false,
                            fontFace: false,
                            defaultExtractor: (content) => {
                                // Capture as liberally as possible, including things like `h-(screen-1.5)`
                                const broadMatches =
                                    content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) ||
                                    []; // Capture classes within other delimiters like .block(class="w-1/2") in Pug

                                const innerMatches =
                                    content.match(
                                        /[^<>"'`\s.(){}\[\]#=%]*[^<>"'`\s.(){}\[\]#=%:]/g
                                    ) || [];
                                return broadMatches.concat(innerMatches);
                            },
                        }),
                        csso(),
                        autoprefixer({
                            overrideBrowserslist: ["defaults"],
                        }),
                    ]),
                ],
                dest: cssFolder,
            },
        ],
    ]);
});

// BrowserSync
task("reload", (resolve) => {
    if (browserSync) browserSync.reload();
    delete require.cache[resolve];
    delete require.cache[iconResolve];
    resolve();
});

// Delete destFolder for added performance
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
            notify: true,
            server: {
                baseDir: destFolder,
                serveStaticOptions: {
                    extensions: ["html"],
                },
            },
            online: true,
            scrollThrottle: 250,
        },
        (_err, bs) => {
            bs.addMiddleware("*", (_req, res) => {
                res.writeHead(302, {
                    location: `/404`,
                });
                res.end("404 Error");
            });
        }
    );

    watch(
        [`${pugFolder}/pages/**/*.pug`],
        { delay: 100 },
        series(`app-html`, parallel("refresh-require", "indexer", "reload"))
    );
    watch(
        [`${pugFolder}/layouts/person.pug`],
        { delay: 100 },
        series(`team-html`, parallel("refresh-require", "indexer", "reload"))
    );
    watch(
        [`${pugFolder}/layouts/service.pug`],
        { delay: 100 },
        series(`services-html`, parallel("refresh-require", "indexer", "reload"))
    );
    watch(
        [`${pugFolder}/layouts/layout.pug`, `${pugFolder}/components/**/*.pug`, dataPath, iconPath],
        { delay: 350 },
        series(`html`, parallel("refresh-require", "indexer", "reload"))
    );
    watch(
        `${sassFolder}/**/*.scss`,
        { delay: 100 },
        series(`app-css`, "reload-css")
    );
    watch(
        [`${sassFolder}/tailwind.css`, `./tailwind.js`],
        { delay: 100 },
        series(`tailwind-css`, "reload-css")
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
    series("clean", parallel("html", "css", "js", "assets"), "indexer", "watch")
);
