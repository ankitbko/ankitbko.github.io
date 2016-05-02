const gulp = require('gulp');
const concat = require('gulp-concat');
const uglifycss = require('gulp-uglifycss')

const cssFiles = [
					'_css/poole.css',
					'_css/hyde.css',
					'_css/**/*.css',
				];

gulp.task('css', function() {
  return gulp.src(cssFiles)
    .pipe(concat('all.min.css'))
	.pipe(uglifycss({
      "maxLineLen": 80,
      "uglyComments": true
    }))
    .pipe(gulp.dest('public/css'))
});

gulp.task('default', ['css']);