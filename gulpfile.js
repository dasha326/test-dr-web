import gulp from 'gulp';
import plumber from 'gulp-plumber';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import sortMediaQueries from 'postcss-sort-media-queries';
import { createGulpEsbuild } from 'gulp-esbuild';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import browserSync from 'browser-sync';
import { stacksvg } from 'gulp-stacksvg';

const { src, dest, watch, series, parallel } = gulp;
const sass = gulpSass(dartSass);
const PATH_TO_SOURCE = './src/';
const server = browserSync.create();
let isDevelopment = true;

/* Работа со стилями — как в вотчерах: 1) expanded CSS, 2) min.css через PostCSS */
export function createStyles () {
  return src(`${PATH_TO_SOURCE}scss/styles.scss`, { sourcemaps: isDevelopment })
    .pipe(plumber())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(rename({ basename: 'styles', extname: '.css' }))
    .pipe(dest('./src/', { sourcemaps: isDevelopment }))
    .pipe(postcss([sortMediaQueries(), csso()]))
    .pipe(rename({ basename: 'styles', suffix: '.min', extname: '.css' }))
    .pipe(dest('./src/', { sourcemaps: isDevelopment }))
    .pipe(server.stream());
}

/* Работа со скриптами (минификация и бандл) */
export function createScripts () {
  const gulpEsbuild = createGulpEsbuild({ incremental: isDevelopment });

  return src(`${PATH_TO_SOURCE}js/*.js`)
    .pipe(plumber())
    .pipe(gulpEsbuild({
      bundle: true,
      format: 'esm',
      platform: 'browser',
      minify: true,
      sourcemap: isDevelopment,
      target: browserslistToEsbuild(),
    }))
    .pipe(rename({
      basename: 'script',
      suffix: '.min',
      extname: '.js',
    }))
    .pipe(dest('./src/'))
    .pipe(server.stream());
}

/* Сборка stack из папки icons в папку images */
export function createStack () {
  return src(`${PATH_TO_SOURCE}icons/**/*.svg`)
    .pipe(stacksvg())
    .pipe(dest(`${PATH_TO_SOURCE}images`));
}

/* Локальный сервер */
export function startServer (done) {
  server.init({
    server: {
      baseDir: './',
    },
    notify: false,
    ui: false,
  });

  done();
}

/* Вотч для разработки */
export function watchDev () {
  watch(`${PATH_TO_SOURCE}scss/**/*.scss`, series(createStyles));
  watch(`${PATH_TO_SOURCE}js/**/*.js`, series(createScripts));
  watch(`${PATH_TO_SOURCE}icons/**/*.svg`, series(createStack, () => { server.reload(); }));
  watch('index.html').on('change', server.reload);
}

/* Задача по умолчанию для разработки */
export default series(
  parallel(createStyles, createScripts, createStack),
  startServer,
  watchDev,
);
