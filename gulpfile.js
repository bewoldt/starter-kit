const gulp 							= require('gulp');
const sass 							= require('gulp-sass');
const postcss 						= require('gulp-postcss');
const postcssCustomProperties 		= require('postcss-custom-properties');
const autoprefixer 					= require('autoprefixer');
const calc 							= require("postcss-calc")
const sourcemaps 					= require('gulp-sourcemaps');
const concat 						= require('gulp-concat');
const uglify 						= require('gulp-uglify');
const imagemin 						= require('gulp-imagemin');
const browserSync 					= require('browser-sync').create();
const del 							= require('del');

sass.compiler = require('node-sass');

/*
	* Define our source and destination file paths
*/
const paths = {
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'dist/css/'
	},
	scripts: {
		src: 'src/js/**/*.js',
		dest: 'dist/js/'
	},
	markup: {
		src: 'src/**/*.+(php|html)',
		dest: 'dist/'
	},
	images: {
		src: 'src/images/*',
		dest: 'dist/images/'
	}
};

function clean() {
  return del([ paths.styles.dest, paths.markup.dest, paths.images.dest ]);
}

/*
	* Define our tasks using plain functions
*/
function styles() {
	return gulp.src(paths.styles.src) // Gets all files ending with .scss in src/scss and children dirs
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) // Passes it through a gulp-sass, log errors to console
		.pipe(postcss([ autoprefixer(), postcssCustomProperties({preserve: true}), calc() ]))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(paths.styles.dest)) // Outputs it in the dist/css folder
		.pipe(browserSync.stream());
}


function scripts() {
	return gulp.src(paths.scripts.src, { sourcemaps: true })// Gets all files ending with .js in src/js and children dirs
		.pipe(sourcemaps.init())
		.pipe(uglify()) // Passes it through a uglify
		.pipe(concat('main.min.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.scripts.dest)) // Outputs it in the dist/js folder
		.pipe(browserSync.stream());
}


function markup() {
	return gulp.src(paths.markup.src, { sourcemaps: true })// Gets all markup files in the source folder and children dirs
		.pipe(gulp.dest(paths.markup.dest)) // Outputs it in the dist/templates folder
		.pipe(browserSync.reload({ // Reloading with Browser Sync
			stream: true
		}));
}

/*
	* Minify images
*/
function images() {
	return gulp.src(paths.images.src, {since: gulp.lastRun(images)})
		.pipe(imagemin()) // Passes through image optimizer
		.pipe(gulp.dest(paths.images.dest)); // Outputs it in the destination folder
}

/*
	* Setup server using browserSync
*/
function serve() {
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
};

/*
	* Watch for file changes
*/
function watch() {
	gulp.watch(paths.styles.src, styles);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.markup.src, markup);
	gulp.watch(paths.images.src, images);
}

/*
	* Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
*/
const build = gulp.series(clean, gulp.parallel(styles, scripts, markup, images, serve, watch));


/*
	* Define default task that can be called by just running `gulp` from cli
*/
exports.default = build;

