var gulp        = require('gulp'),                      // Burp !
    g           = require('gulp-load-plugins')(),       // Charge les plugins Gulp automatiquement et les attach à l'objet "g"
    conf        = require('./package.json'),            // Récupération de la configuration déclarée dans package.json
    paths       = conf.paths,                           // Récupération des chemins de l'application
    runSequence = require('run-sequence'),              // Solution temporaire jusqu'à gulp 4 (https://github.com/gulpjs/gulp/issues/355)
    streamqueue = require('streamqueue'),
    prod        = false,                                // Par défaut en dév. Si on lance la tâche "build" : de la prod (voir tâche "build")
    banner      =   '/*! ' + conf.name + ' v' + conf.version +
                    ' | ' + conf.author + ' -' + conf.contact +
                    ' | ' + conf.license.type + ' License' +
                    ' | ' + conf.homepage + ' */\n\n';

// **********************************
// CLEAN : Nettoyage de dist avant chaque rebuil
gulp.task('clean', function() {
  return gulp.src(paths.dist + '/**', { read: false })
            .pipe(g.rimraf());
});

// **********************************
// JS : hint + min/concat
gulp.task('js:hint', function () {
  return gulp.src([
              'gulpfile.js',
              paths.src + '/js/**/.js',

              !paths.src + '/js/vendor/**'
            ])
            .pipe(g.jshint())
            .pipe(g.jshint.reporter('jshint-stylish'));
});

gulp.task('js:min', function () {
  return streamqueue(
            { objectMode: true },
            gulp.src(paths.src + '/js/vendor/**'),
            gulp.src(paths.src + '/js/*.js')
                .pipe(g.uglify())
        )
        .pipe(g.concat('app.' + conf.version + '.min.js'))
        .pipe(g.header(banner))
        .pipe(gulp.dest(paths.dist + '/js'));
});

// **********************************
// CSS
gulp.task('css:min', function () {
  return streamqueue(
            { objectMode: true },
            gulp.src(paths.src + '/css/vendor/**'),
            gulp.src(paths.src + '/css/*.css')
                .pipe(g.autoprefixer({
                          browsers: ['last 2 versions'],
                          cascade: false
                      }))
                .pipe(g.minifyCss())
        )
        .pipe(g.concat('app.' + conf.version + '.min.css'))
        .pipe(g.header(banner))
        .pipe(gulp.dest(paths.dist + '/css'));
});

// **********************************
// HTML
gulp.task('html', function () {
  return gulp.src(paths.src + '/index.html')
            .pipe(g.inject(
              gulp.src(
                prod ? [paths.dist + '/**/*.js', paths.dist + '/**/*.css'] : [paths.src + '/**/*.js', paths.src + '/**/*.css'],
                {read: false}
              ),
              {relative: true}
            ))
            .pipe(g.if(prod, g.htmlMinifier({collapseWhitespace: true})))
            .pipe(gulp.dest(prod ? paths.dist : paths.src));
});

// **********************************
// DEV
gulp.task('server', function() {
  var watcher = gulp.watch(paths.src + 'js/**', ['html', 'js:hint']);
  watcher.on('change', function(event) {
    console.log('Fichier ' + event.path + ' changé !');
  });

  gulp.src(paths.src)
      .pipe(g.webserver({
        host: "localhost",
        port: 4000,
        livereload: true,
        open:true
      }));
});

// **********************************
// Build : nettoyage + minifications/concat sur les JS/CSS + construction de l'index.html + copie des autres fichiers
gulp.task('build', function () {
  prod = true;
  runSequence('clean', 'js:hint', 'js:min', 'css:min', 'html');
});

// Dev : serveur livereload + lint + watch
gulp.task('dev', function () {
  runSequence('html', 'js:hint', 'server');
});

// Par défaut : lancement de l'env de dév
gulp.task('default', ['dev']);
