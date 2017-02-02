var gulp = require('gulp');

var minhtml = require('gulp-htmlmin'),
    mincss = require('gulp-minify-css'),
    minimage = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

gulp.task('minhtml', function(){
    gulp.src('src/*.html')
        .pipe(minhtml({collapseWhitespace:true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('autoprefixer',function(){
    gulp.src('src/sass/style.scss')
        .pipe(autoprefixer({
            browsers:['last 2 versions','Android>=4.0']
        }))
        .pipe(gulp.dest('dist/sass'));
});

gulp.task('sass', function(){
    gulp.src('dist/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('mincss',function(){
    gulp.src('dist/css/*.css')
        .pipe(mincss())
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
    gulp.watch('src/**/*',['minhtml','autoprefixer','sass','mincss','minimage','uglify']);
});

gulp.task('default', ['minhtml','autoprefixer','sass','mincss','minimage','uglify','watch']);
