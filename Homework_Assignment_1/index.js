/*
*
*	Create a Hello World
*/

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

var httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});

var httpServerOptions = {
'key' : fs.readFileSync('./https/key.pem'),
'cert' : fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpServerOptions,function(req,res){
	unifiedServer(req,res);
});

var unifiedServer = function(req,res){
	var parsedUrl = url.parse(req.url,true);
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	var method = req.method.toLowerCase();
	var headers = req.headers;
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	console.log(path);
	req.on('data',function(data){
		buffer += decoder.write(data);
	});
	req.on('end',function(){
		buffer += decoder.end();
		var choseHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handler.notFound;
		var data = {
			trimmedPath : trimmedPath,
			method:method,
			headers:headers,
			payLoad : buffer
		}
		choseHandler(data,function(statusCode,payLoad){
			statusCode = typeof(statusCode) == 'number' ? statusCode: 200;
			payLoad = typeof(payLoad) == 'object' ? payLoad : {};
			var payLoadString = JSON.stringify(payLoad);
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payLoadString);
			console.log("The payload is ",payLoadString);
		});
	});
}

httpServer.listen(config.httpPort,function(){
	console.log("Server is listening at port :" + config.httpPort);
});

httpsServer.listen(config.httpsPort,function(){
	console.log("Server is listening at port :" + config.httpsPort);
});


var handler = {};

handler.hello = function(data,callback){
	callback(406,{'name':'Welcome to Pirple!'});
};

handler.notFound = function(data,callback){
	callback(404);
};

var router = {
	'hello' : handler.hello
};