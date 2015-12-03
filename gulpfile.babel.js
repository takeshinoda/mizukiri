import gulp    from 'gulp'
import babel   from 'gulp-babel'
import mocha   from 'gulp-mocha'
import runSequence from 'run-sequence'

const SOURCES    = 'src/**/*.js'
const TEST_FILES = ['test/**/*.js', '!test/fixtures/*.js']

gulp.task('test', () => {
  return gulp.src(TEST_FILES)
             .pipe(babel())
             .pipe(gulp.dest('test_dist'))
             .pipe(mocha({ reporter: 'nyan' }))
})

gulp.task('compile', () => {
  return gulp.src(SOURCES)
             .pipe(babel())
             .pipe(gulp.dest('lib'))
})

gulp.task('watch', (done) => {
  gulp.watch(SOURCES, ['default'])
      .on('end', done)
})

gulp.task('default', (done) => runSequence('compile', 'test', done))

