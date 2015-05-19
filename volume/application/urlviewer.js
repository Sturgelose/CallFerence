"use strict";

var spaceify = require("./spaceifyapplication/spaceifyapplication.js");


function UrlViewer()
{
var self = this;

var currentUrl = "http://spacecall.herokuapp.com/speaker.html"; 
		

self.onClientConnected = function(id)
	{
	};
	
self.onClientDisconnected = function(id)
	{
	};	

self.onScreenConnected = function(id)
	{
	console.log("UrlViewer::onScreenConnected() "+id);
	if (currentUrl)
		spaceify.getProvidedService("spaceify.org/services/urlviewerscreen").callRpc("showUrl", [currentUrl], self, null, id);
	};
	
self.onScreenDisconnected = function(id)
	{
	};	

self.showUrl = function(url)
	{
	
	console.log("UrlViewer::showUrl() "+url);
	
	if (url.substring(0, "http://".length) !== "http://" && url.substring(0, "https://".length) !== "https://")
		currentUrl = "http://" + url;
	else	
		currentUrl = url;
	
	var screenUrl = spaceify.getOwnUrl(false)+"/screen.html";	
	spaceify.getRequiredService("spaceify.org/services/bigscreen").callRpc("setContentURL", [screenUrl, "default", null], self);
	
	spaceify.getProvidedService("spaceify.org/services/urlviewerscreen").notifyAll("showUrl",[currentUrl]);
	};

self.start = function()
	{
	console.log("UrlViewer::start()");	
	spaceify.getProvidedService("spaceify.org/services/urlviewer").exposeRpcMethod("showUrl", self, self.showUrl);			
	console.log("UrlViewer::start() rcp method exposed");	
	spaceify.getProvidedService("spaceify.org/services/urlviewer").setConnectionListener(self, self.onClientConnected);
	console.log("UrlViewer::start() connectionlistener added ");
	spaceify.getProvidedService("spaceify.org/services/urlviewer").setDisconnectionListener(self, self.onClientDisconnected);
	
	spaceify.getProvidedService("spaceify.org/services/urlviewerscreen").setConnectionListener(self, self.onScreenConnected);
	spaceify.getProvidedService("spaceify.org/services/urlviewerscreen").setDisconnectionListener(self, self.onScreenDisconnected);
	console.log("UrlViewer::start() all listeners added");
	};

var stop = function()
	{
	spaceify.stop();
	};

}


var urlViewer = new UrlViewer();

spaceify.start(urlViewer, function(err,data) 
	{
	if(err) 
		console.log(err);
	});	
	
