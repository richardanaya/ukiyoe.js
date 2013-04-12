var buildify = require('buildify');

buildify()
    .concat([
        '../lib/key.js',
        '../lib/jquery.js',
        '../lib/stats.js',
        '../lib/howler.min.js',
        '../ukiyoe.js'
    ])
    .uglify({mangle: true})
    .save('../ukiyoe.min.js');

buildify()
    .concat([
        '../ukiyoe.css'
    ])
    .cssmin()
    .save('../ukiyoe.min.css');