var path 	= require('path');
var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var less 	= require('gulp-less');
var jbb 	= require('gulp-jbb');
var merge 	= require('merge-stream');
var webpack = require('webpack-stream');
var notify = require('gulp-notify');

/**
 * List of experiments to compile
 */
var experiments = [ "masking", "delay", "threshold", "introduction" ];

/**
 * Externals, as exposed by iconeezin run-time
 */
var IconeezinExternals = {

	// Iconeezin components
	'iconeezin' 		: 'Iconeezin',
	'iconeezin/api'		: 'Iconeezin.API',
	'iconeezin/runtime' : 'Iconeezin.Runtime',

	// Iconeezin exposed libraries in order to
	// include them only once
	'three': 'Iconeezin.Libraries.three',
	'jquery': 'Iconeezin.Libraries.jquery',

};

/**
 * Compile and pack Javascript files
 */
gulp.task('js/depends', function() {
	return gulp.src(['node_modules/iconeezin/dist/*.js'])
		.pipe(gulp.dest('dist/js'));
});

/**
 * Compile and pack iconeezin resources
 */
gulp.task('img/depends', function() {
	return gulp.src(['node_modules/iconeezin/dist/img/*.jpg'])
		.pipe(gulp.dest('dist/img'));
});

/**
 * Copy libraries
 */
gulp.task('js/lib', function() {
	return gulp.src(['src/js/lib/**'])
		.pipe(gulp.dest('dist/js'));
});

/**
 * Compile and pack Javascript files
 */
gulp.task('js/website', function() {
	return gulp.src('src/js/index.jsx')
		.pipe(webpack({
			module: {
				loaders: [
					{
						test: /\.svg$/,
						loader: 'babel?presets[]=es2015,presets[]=react!svg-react'
					},
					{
						test: /\.jsx?$/,
						exclude: /(node_modules|bower_components)/,
						loader: 'babel',
						query: {
							presets: ['react', 'es2015']
						}
					},
					{ test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192&name=img/[name].[ext]' },
				],
			},
			node: {
				fs: 'empty'
			},
			output: {
				filename: 'iconeezin-web.js',
			},
			externals: IconeezinExternals,
			plugins: [
				// new webpack.webpack.optimize.DedupePlugin(),
				// new webpack.webpack.optimize.UglifyJsPlugin({
				// 	minimize: true
				// })
			],
			resolve: {
				extensions: ['', '.js', '.jsx'],
			}
		}))
		.pipe(gulp.dest('dist/js'))
});

/**
 * Compile css
 */
gulp.task('css/website', function() {
	return gulp.src('src/css/*.less')
		.pipe(less({
		}))
		.pipe(gulp.dest('dist/css'));
});

/**
 * Copy static files
 */
gulp.task('html/website', function() {
	return gulp.src(['src/html/index.html'])
		.pipe(gulp.dest('dist'));
});

/**
 * Copy static files
 */
gulp.task('static/website', function() {
	return gulp.src(['src/img/**'])
		.pipe(gulp.dest('dist/img'));
});

/**
 * Copy eperiment metadata
 */
gulp.task('exp/meta', function() {
	return gulp.src(['experiments/specs.json'])
		.pipe(gulp.dest('dist/experiments'));
});

/**
 * Build experiments
 */
experiments.forEach(function(experiment) {

	//
	// Build javascript
	//
	gulp.task('exp/'+experiment+'/build', function() {
		return gulp
			.src([ 'experiments/'+experiment+'.jbbsrc/main.js' ])
	        .on('end', function(){ gutil.log("Compiling experiment", gutil.colors.green(experiment)); })
			.pipe(webpack({
				module: {
					loaders: [
						{ test: /\.json$/, loader: 'json' },
					],
			    },
				node: {
					fs: 'empty'
				},
				output: {
					filename: '.build.js',
					library: [ 'Iconeezin', 'Experiments', experiment ]
				},
				externals: IconeezinExternals,
				plugins: [
					new webpack.webpack.optimize.DedupePlugin(),
					new webpack.webpack.optimize.UglifyJsPlugin({
						minimize: true
					})
				],
				resolve: {
				}
			}))
      .on('error', notify.onError({
        message: 'Error: <%= error.message %>',
        sound: false // deactivate sound?
      }))
      .on('error', function (err) {
        console.log('Error:', err);
      })
			.pipe(gulp.dest('experiments/'+experiment+'.jbbsrc'))
	});

	//
	// Build bundle
	//
	gulp.task('exp/'+experiment+'/bundle', [ 'exp/'+experiment+'/build' ], function() {
		return gulp
			.src([ 'experiments/'+experiment+'.jbbsrc' ])
	        .on('end', function(){ gutil.log("Creating experiment bundles"); })
			.pipe(jbb({ }))
      .on('error', notify.onError({
        message: 'Error: <%= error.message %>',
        sound: false // deactivate sound?
      }))
      .on('error', function (err) {
        console.log('Error:', err);
      })
			.pipe(notify('Bundle '+experiment+'.jbb completed'))
			.pipe(gulp.dest('dist/experiments'));
	});

	//
	// Live watch
	//
	gulp.task('exp/'+experiment+'/live', [ 'exp/'+experiment+'/bundle' ], function() {
		gulp.watch('experiments/'+experiment+'.jbbsrc/**/*.js', ['exp/'+experiment+'/bundle'], function(event) { })
		gulp.watch('experiments/'+experiment+'.jbbsrc/assets/**', ['exp/'+experiment+'/bundle'], function(event) { })
		gulp.watch('experiments/'+experiment+'.jbbsrc/bundle.json', ['exp/'+experiment+'/bundle'], function(event) { })
	});

});

/**
 * Shorthands for all experiments
 */
gulp.task('exp/bundles', experiments.map(function(experiment) {
	return 'exp/' + experiment + '/bundle';
}));
gulp.task('exp/live', experiments.map(function(experiment) {
	return 'exp/' + experiment + '/live';
}));

/**
 * Stay live
 */
gulp.task('live', ['default', 'exp/live'], function() {
	gulp.watch('node_modules/iconeezin/dist/**/*.js', ['js/depends'], function(event) { })
	gulp.watch('node_modules/iconeezin/dist/**/*.jpg', ['img/depends'], function(event) { })
	gulp.watch('src/js/**', ['js/website'], function(event) { })
	gulp.watch('src/css/**', ['css/website'], function(event) { })
	gulp.watch('src/html/**', ['html/website'], function(event) { })
	gulp.watch('src/img/**', ['static/website'], function(event) { })
	gulp.watch('experiments/specs.json', ['exp/meta'], function(event) { })
});

/**
 * Entry point
 */
gulp.task('default', [ 'js/depends', 'img/depends', 'js/lib', 'js/website', 'css/website', 'html/website', 'static/website', 'exp/bundles', 'exp/meta' ], function() {
});
