var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var paths = {
  src: {
    client: {
      scripts: './client/*',
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
      bundle: 'bundle.js'
    },
    bundlesFilter: '!public/scripts/**/*.js'
  }
};


gulp.task('browserify', function () {
  return gulpClientBundle();
});

var gulpClientBundle = function () {
  var plumber = require('gulp-plumber');
  return browserify(paths.src.client.app,
    {
      extensions: ['.jsx', '.js']
    })
    .require('react') //chrome tools for React
    .transform('reactify') //don't generate intermediate js files
    .bundle()
    .pipe(source(paths.dest.client.bundle))
    .pipe(plumber())
    .pipe(gulp.dest(paths.dest.client.scripts));
}

//var watch = require('gulp-watch');
gulp.task('watch', function () {
  gulp.watch([paths.src.client.scripts], ['browserify']);
});

//// Rerun the task when a file changes
//var watch = require('gulp-watch');
//gulp.task('watch', function() {
//
//  watch({glob: [paths.src.client.scripts, paths.src.jsx, paths.dest.bundlesFilter]}, function () {
//    return gulpClientBundle();
//  });
//});

//"watch" for server
var nodemon = require('gulp-nodemon');
gulp.task('watchserver', function () {
    nodemon({
      script: 'app.js',
      ext: 'js jsx json',
      ignore: ['client/*', 'public/*', 'gulpfile.js'],
      watch: [
        'app.js',
        'views',
        'routes'
      ]
    })
      //.on('change', ['lint'])
      .on('restart', function () {
        console.log('restarted!');
      });
  }
);
