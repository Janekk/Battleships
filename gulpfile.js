var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var paths = {
  src: {
    client: {
      scripts: './client/**/*',
      fonts: './node_modules/bootstrap/fonts/*',
      app: './client/main.js'
    },
    server: {
      jsx: ['components/*.jsx'],
      js: ['components/js/**/*.js'],
      app: 'app.js'
    }
  },
  dest: {
    client: {
      scripts: 'public/scripts',
      fonts: 'public/fonts',
      bundle: 'bundle.js'
    },
    bundlesFilter: '!public/scripts/**/*.js'
  }
};

var run = require('gulp-run');
gulp.task('init', function () {

  gulp.src(paths.src.client.fonts)
    .pipe(gulp.dest(paths.dest.client.fonts));

  run('node ./node_modules/jquery-builder/bin/builder.js')
    .pipe(gulp.dest('public/scripts/jquery.js'));
});

var argv = require('yargs').argv;
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var buffer = require('vinyl-buffer');
var production = !!(argv.production); // true if --production flag is used

gulp.task('browserify', function () {
  browserify({extensions: ['.jsx', '.js']})
    .transform('reactify', {"es6": true}) //don't generate intermediate js files
    .require(paths.src.client.app, { entry: true })
    .require('react') //chrome tools for React
    .bundle()
    .on('error', function(err){
      console.log(err.message);
    })
    .pipe(source(paths.dest.client.bundle))
    .pipe(buffer())
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest(paths.dest.client.scripts));
});

var less = require('gulp-less');
var path = require('path');

gulp.task('less', function () {
  gulp.src('./public/stylesheets/*.less')
    .pipe(less())
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('watch-client', function () {
  gulp.watch([paths.src.client.scripts], ['browserify'])
});

var nodemon = require('gulp-nodemon');
gulp.task('watch-server', function () {
    nodemon({
      script: 'app.js',
      ext: 'js jsx json',
      ignore: ['client/*', 'public/*', 'gulpfile.js'],
      watch: ['app.js', 'game', 'views', 'routes']
    })
    .on('restart', function () {
      console.log('watch-server restarted!');
    });
  }
);
