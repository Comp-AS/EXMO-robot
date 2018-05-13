const gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    browsersync = require('browser-sync').create(),
    browserify = require('gulp-browserify'),
    runSequence = require('run-sequence'),
    stylus = require('gulp-stylus'),
    concat_css = require('gulp-concat-css'),
    del = require(`del`);

const path = {
    build: {
        html: 'build/markup/',
        js: 'build/js/',
        css: 'build/styles/',
        img: 'build/static/',
        root: 'build/'
    },
    src: {
        html: 'src/markup/**/*.html',
        js_entry: 'src/js/main.js',
        js: 'src/js/**/*.js',
        css: 'src/styles/**/*.styl',
        img: 'src/static/**/*.*'
    },
    clean: './build'
};

gulp.task('default', (done) => {
    runSequence('clean', 'build', 'watch', () => done());
});

gulp.task('build', [
    'html:build',
    'js:build',
    'css:build',
    'img:build'
], () => {
    gulp.src('settings.json')
        .pipe(gulp.dest(path.build.root));
});

gulp.task('watch', () => {
    browsersync.init({
        server: {
            baseDir: "./build",
            index: "./markup/index.html",
            port: 8080,
            open: true,
        }
    });
    gulp.watch(path.src.css, ['css:build']);
    gulp.watch(path.src.html, ['html:build']);
    gulp.watch(path.src.js, ['js:build']);
});

gulp.task('html:build', () => {
    gulp.src(path.src.html)
        .pipe(gulp.dest(path.build.html))
        .on('end', browsersync.reload);
});

gulp.task('js:build', () => {
    gulp.src(path.src.js_entry)
        .pipe(browserify({
            insertGlobals : true,
            debug : !gulp.env.production
        }))
        .pipe(gulp.dest(path.build.js));
});

gulp.task('css:build', () => {
    gulp.src(path.src.css)
        .pipe(stylus())
        .pipe(autoprefixer())
        .pipe(concat_css('main.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(browsersync.reload({stream: true}));
});

gulp.task('img:build', () => {
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img));
});

gulp.task('clean', () => {
    return del(path.clean);
});