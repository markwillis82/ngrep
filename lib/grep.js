var async = require("async");
var fs = require('fs');

var asyncLimit = 10;

var lines = [];
var regPattern = '';

var grep = function(pattern, files, cb) {
	if (!files) {
		cb('no paths given');
		return;
	}

	if (typeof files === 'string') {
		files = [files];
	}
//	    	var patt = csv\b/i;

	regPattern = new RegExp('\\b'+pattern+'\\b','i');

	// TODO: expand wildcards

	lines = [];


	async.forEachLimit(files, asyncLimit, _readFile, function(err) {
		cb(null, lines);
	});

};


var _readFile = function(item, callback) {
	var matches = [];
	var currentLine = 0;
	var read_stream = fs.createReadStream(item, {encoding: 'ascii'});

	read_stream.on("data", function(data){

		fileLines = data.split(/\r*\n/);

	    async.forEachSeries(fileLines, function(line, cb) {
	    	currentLine++;

			if (line.match(regPattern)) {
				lines.push({file: item, line: line, lineNumber: currentLine});
			}
			cb();
	    }, function(err) {

	    });
	});

	read_stream.on("error", function(err){
		console.error("An error occurred ("+item+"): %s", err)
	});

	read_stream.on("close", function(){
		process.nextTick(callback); // fix call stack error
	});

};



exports.grep = grep;