// Import external modules
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const esbuild = require("rollup-plugin-esbuild");
const { rollup } = require("rollup");

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
import nodeResolve from '@rollup/plugin-node-resolve';
import querySelector from "posthtml-match-helper";
import minifyJSON from 'gulp-minify-inline-json';
import phTransformer from 'posthtml-transformer';
import commonJS from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import { init, write } from 'gulp-sourcemaps';
const rollupBabel from '@rollup/plugin-babel';
import browserSyncModule from 'browser-sync';
import icons from './material-design-icons';
import postHTMLTextr from "posthtml-textr";
import postHTMLLorem from "posthtml-lorem";
import sass, { logError } from 'gulp-sass';
import buble from '@rollup/plugin-buble';
import sitemapModule from 'gulp-sitemap';
import autoprefixer from 'autoprefixer';
import rollup from 'gulp-better-rollup';
import { spawn } from 'child_process';
import posthtml from 'gulp-posthtml';
import htmlmin from 'gulp-htmlmin';
import postcss from 'gulp-postcss';
import header from 'gulp-header';
import rename from 'gulp-rename';
import csso from "postcss-csso";
import moment from 'moment';

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
const destFolder = `docs`;

// Source file folders
const tsFolder = `${srcFolder}/ts`;
const pugFolder = `${srcFolder}/pug`;
const sassFolder = `${srcFolder}/sass`;

// Destination file folders
const jsFolder = `${destFolder}/js`;
const cssFolder = `${destFolder}/css`;
const htmlFolder = `${destFolder}`;

// HTML Tasks
const dataPath = `./data.js`;
const resolve = require.resolve(dataPath);
task("html", async () => {
    let data = require(resolve);
    let pages = [
        [
            `${pugFolder}/pages/**/*.pug`,
            {
                pipes: [
                    plumber(), // Recover from errors without cancelling build task
                    // Compile src html using Pug
                    pug({
                        basedir: pugFolder,
                        data,
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
                        data: Object.assign(
                            {
                                index: i,
                                len,
                                next,
                                service,
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

    let pipe = await streamList(pages);
    delete require.cache[resolve];
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
        return stream(
            [`${cssFolder}/tailwind.css`, `!${cssFolder}/**/*.min.css`],
            {
                pipes: [
                    // Remove unused CSS
                    purge({
                        content: [`${pugFolder}/**/*.pug`],
                        whitelistPatterns: [/active/, /focus/, /show/, /hide/],
                        keyframes: false,
                        fontFace: false,
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
                end: [browserSync.stream()],
            }
        );
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

task("js", async () => {
    const bundle = await rollup({
        input: `${tsFolder}/main.ts`,
        treeshake: true,
        preserveEntrySignatures: false,
        plugins: [
            nodeResolve(),
            esbuild({
                // watch: watching,
                target: "es2020", // default, or 'es20XX', 'esnext'
            }),
        ],
        onwarn,
    });

    await bundle.write({
        format: "es",
        file: `${jsFolder}/main.js`,
    });

    return new Promise((resolve) => {
        browserSync.reload();
        resolve();
    });
});

const browserSync = bs.create();
task("reload", async (done) => {
    await stream(`${htmlFolder}/**/*.html`, {});
    browserSync.reload();
    done();
});

// Build & Watch Tasks
task("build", parallel("html", "css", "js"));
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

    watch([`${pugFolder}/**/*.pug`, dataPath], series("html", "reload"));
    watch(`${sassFolder}/**/*.scss`, series("app-css"));
    watch(
        [`${sassFolder}/tailwind.css`, `./tailwind.js`],
        series("tailwind-css")
    );
    watch(`${tsFolder}/**/*.ts`, series("js"));
});

task("default", series("build", "watch"));
