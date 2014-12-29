var gulp        = require('gulp'),
    g           = require('gulp-load-plugins')(),       // Charge les plugins Gulp automatiquement et les attach à "g"
    paths       = require('./package.json').conf.paths,
    runSequence = require('run-sequence'),              // Solution temporaire jusqu'à gulp 4 (https://github.com/gulpjs/gulp/issues/355)
    prod        = false;

// **********************************
// CLEAN : Nettoyage de dist avant chaque rebuil
gulp.task('clean', function() {
  return gulp.src(paths.dist + '/**', { read: false })
            .pipe(g.rimraf());
});

// **********************************
// JS : hint + min/concat
gulp.task('js', function (cb) {
  runSequence(['js:hint', 'js:min'], cb);
});

gulp.task('js:hint', function () {
  
});

gulp.task('js:min', function () {
  
});

// **********************************
// CSS
gulp.task('css', function () {
  
});

// **********************************
// HTML
gulp.task('html', function () {
  return gulp.src(paths.src + '/index.html')
            .pipe(g.inject(
              gulp.src(
                prod ? [paths['js-prod'], paths['css-prod']] : [paths.src + '/**/*.js', paths.src + '/**/*.css'],
                {read: false}
              ),
              {relative: true}
            ))
            .pipe(gulp.dest(prod ? paths.dist : paths.src));
});

// **********************************
// Build : nettoyage + minifications/concat sur les JS/CSS + construction de l'index.html + copie des autres fichiers
gulp.task('build', function (cb) {
  prod = true;
  runSequence(['clean', 'js', 'css', 'html'], cb);
});

// Dev : serveur livereload + lint + watch
gulp.task('dev', function () {
  runSequence(['html', 'js:hint', 'server']);
});

// Par défaut : lancement de l'env de dév
gulp.task('default', ['dev']);
