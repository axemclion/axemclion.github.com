module.exports = function(grunt) {
	grunt.initConfig({
		clean: ['./bin'],

		// JS Tasks
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js'],
		},

		// CSS Tasks
		less: {
			all: {
				options: {
					sourceMap: true,
					sourceMapURL: 'main.css.map',
					sourceMapRootpath: './',
					compress: true
				},
				files: {
					'bin/main.css': 'src/less/main.less'
				}
			}
		},
		autoprefixer: {
			less: {
				src: 'bin/main.css',
				dest: './bin/main.css'
			}
		},

		// Images
		copy: {
			all: {
				expand: true,
				cwd: 'src/media',
				src: '**',
				dest: 'bin/',
				flatten: true,
				filter: 'isFile',
			},
		},

		// HTML Tasks
		processhtml: {
			options: {
				recursive: true
			},
			dev: {
				files: {
					'bin/index.html': 'src/index.html',
					'bin/404.html': 'src/404.html',
					'bin/contact.html': 'src/contact.html'
				}
			},
			dist: {
				files: {
					'bin/index.html': 'src/index.html',
					'bin/404.html': 'src/404.html',
					'bin/contact.html': 'src/contact.html'
				}
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					collapseBooleanAttributes: true,
					removeIgnored: true,
					minifyJS: true
				},
				files: {
					'bin/index.html': 'bin/index.html',
					'bin/404.html': 'bin/404.html',
					'bin/contact.html': 'bin/contact.html'
				}
			},
		},

		// Server and Watch
		connect: {
			options: {
				useAvailablePort: true,
				hostname: '*',
				port: 9000,
				base: ['bin', '.'],
				livereload: true,
			},
			server: {}
		},
		watch: {
			options: {
				livereload: true,
			},
			html: {
				files: ['src/**/*.html'],
				tasks: ['processhtml']
			},
			css: {
				files: ['src/**/*.less'],
				tasks: ['less']
			}
		}
	});

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('dev', ['clean', 'less', 'processhtml:dev', 'connect', 'watch']);

	grunt.registerTask('css', ['less', 'autoprefixer']);
	grunt.registerTask('js', ['jshint']);
	grunt.registerTask('html', ['processhtml:dist', 'htmlmin']);
	grunt.registerTask('build', ['css', 'js', 'copy', 'html']);

	grunt.registerTask('dist', ['clean', 'build']);
	grunt.registerTask('default', ['dist']);
};