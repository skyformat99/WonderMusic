var gulp = require('gulp');

var minhtml = require('gulp-htmlmin'),
    mincss = require('gulp-clean-css'),
    minimage = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');


gulp.task('minhtml', function(){
    gulp.src('src/*.html')
        .pipe(minhtml({collapseWhitespace:true}))
        .pipe(gulp.dest('dist'))
});

gulp.task('sass', function(){
    gulp.src('src/sass/*.scss')
        .pipe(sass())
        .pipe(mincss())
        .pipe(gulp.dest('src/css'))
});

gulp.task('autoprefixer',['sass'],function(){
    gulp.src('src/css/*.css')
        .pipe(concat('style.css'))
        .pipe(autoprefixer({
            browsers:['last 2 versions','Android>=4.0','> 5% in CN','> 0.1%',"ie 6-8","Firefox < 20"]
        }))
        .pipe(gulp.dest('dist/css'))
});

gulp.task('minimage',function(){
    gulp.src('src/img/**/*')
        .pipe(minimage())
        .pipe(gulp.dest('dist/img'))
});

gulp.task('uglify',function(){
    gulp.src('src/js/*')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

gulp.task('watch', function (){
    gulp.watch('src/**/*',['minhtml','autoprefixer','minimage','uglify']);
});

gulp.task('default', ['minhtml','autoprefixer','minimage','uglify','watch']);
