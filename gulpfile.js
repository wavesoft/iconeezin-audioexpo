var path 	= require('path');
var gulp 	= require('gulp');
var gutil 	= require('gulp-util');
var less 	= require('gulp-less');
var jbb 	= require('gulp-jbb');
var merge 	= require('merge-stream');
var webpack = require('webpack-stream');

/**
 * Externals, as exposed by iconeezin run-time
 */
var IconeezinExternals = {

	// Iconeezin components
	'iconeezin' 		: 'Iconeezin',
	'iconeezin/api'		: 'Iconeezin.API',

	// Iconeezin exposed libraries in order to 
	// include them only once
	'three': 'Iconeezin.Libraries.three',
	'jquery': 'Iconeezin.Libraries.jquery',

};

/**
 * Compile and pack Javascript files
 */
gulp.task('js/depends', function() {
	return gulp.src(['node_modules/iconeezin/dist/iconeezin.js'])
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
						test: /\.jsx?$/,
						exclude: /(node_modules|bower_components)/,
						loader: 'babel',
						query: {
							presets: ['react', 'es2015']
						}
					}
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
				new webpack.webpack.optimize.DedupePlugin(),
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
 * Build experiments
 */
gulp.task('exp/build', function() {

	var experiments = [ "simple" ];
	return merge(experiments.map(function(experiment) {
		
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
			.pipe(gulp.dest('experiments/'+experiment+'.jbbsrc'));

	}));
})

/**
 * Compile experiments
 */
gulp.task('exp/bundle', [ 'exp/build' ], function() {
	return gulp
		.src([ 'experiments/*.jbbsrc' ])
        .on('end', function(){ gutil.log("Creating experiment bundles"); })
		.pipe(jbb({ }))
		.pipe(gulp.dest('dist/experiments'));
});

/**
 * Stay live
 */
gulp.task('live', ['default'], function() {
	gulp.watch('node_modules/iconeezin/dist/iconeezin.js*', ['js/depends'], function(event) { })
	gulp.watch('src/**', ['js/website'], function(event) { })
	gulp.watch('experiments/**/*.js', ['exp/bundle'], function(event) { })
	gulp.watch('experiments/**/assets/**', ['exp/bundle'], function(event) { })
});

/**
 * Entry point
 */
gulp.task('default', [ 'js/depends', 'js/website', 'css/website', 'html/website', 'exp/bundle' ], function() {
});
