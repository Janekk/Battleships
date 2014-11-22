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
  browserify(paths.src.client.app,
    {
      extensions: ['.jsx', '.js']
    })
    .require('react') //chrome tools for React
    .transform('reactify') //don't generate intermediate js files
    .bundle()
    .on('error', function(err){
      console.log(err.message);
    })
    .pipe(source(paths.dest.client.bundle))
    .pipe(gulp.dest(paths.dest.client.scripts));
});

gulp.task('watch-browserify', function () {
  gulp.watch([paths.src.client.scripts], ['browserify'])
});

var nodemon = require('gulp-nodemon');
gulp.task('watch-server', function () {
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
    .on('restart', function () {
      console.log('watch-server restarted!');
    });
  }
);
