var gulp = require('gulp');

var minhtml = require('gulp-htmlmin'),
    mincss = require('gulp-minify-css'),
    minimage = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass');

gulp.task('minhtml', function() {
    gulp.src('src/*.html')
        .pipe(minhtml({collapseWhitespace:true}))
        .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
    gulp.src('src/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('dist/css'));
});

// gulp.task('mincss',function(){
//     gulp.src('dist/sass/*.sass')
//         .pipe(mincss())
//         .pipe(gulp.dest('dist/sass'))
// });

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

gulp.task('watch', function () {
    gulp.watch('src/**/*',['minhtml','sass','minimage','uglify']);
});

gulp.task('default', ['minhtml','sass','minimage','uglify','watch']);
