const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const noop = require('gulp-noop');
const bs = require('browser-sync').create();

var config = {
    generateMaps: true
}

var paths = {
    output: 'dist',
    images: {
        input: 'src/images/**/*',
        output: 'dist/images/'
    },
    html: {
        input: 'src/html/**/*',
        output: 'dist/'
    },
    scss: {
        input: 'src/scss/**/*',
        output: 'dist/css'
    },
    js: {
        input: ['src/js/**/*'],
        output: 'dist/js'
    }
}

// auto reload
function serve() {
    bs.init({
        server: {
            baseDir: "./dist/"
        }
    });
}

function watch(done) {
    gulp.watch(paths.scss.input, scss);
    gulp.watch(paths.images.input).on('change', gulp.series(images, reload));
    gulp.watch(paths.html.input).on('change', gulp.series(html, reload));
    gulp.watch(paths.js.input).on('change', gulp.series(js, reload));
    return done();
}

function reload() {
    bs.reload();
}

// image processing
function images() {
    return gulp.src(paths.images.input)
        .pipe(newer(paths.images.output))
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(paths.images.output));
};

// html
function html() {
    return gulp.src(paths.html.input)
        .pipe(newer(paths.html.output))
        .pipe(gulp.dest(paths.html.output));
}

// css
function scss() {
    return gulp.src(paths.scss.input)
        .pipe(config.generateMaps ? sourcemaps.init() : noop())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(cleanCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(config.generateMaps ? sourcemaps.write('.') : noop())
        .pipe(gulp.dest(paths.scss.output))
        .pipe(bs.reload({ stream: true }));
}

// js
function js() {
    return gulp.src(paths.js.input)
        .pipe(config.generateMaps ? sourcemaps.init() : noop())
        .pipe(babel({presets: ['@babel/preset-env']}))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(config.generateMaps ? sourcemaps.write() : noop())
        .pipe(gulp.dest(paths.js.output));
}


function clean(cb) {
    del.sync([paths.output]);
    cb();
}

exports.build = gulp.series(clean, gulp.parallel(images, html, scss, js));
exports.serve = gulp.series(exports.build, watch, serve);