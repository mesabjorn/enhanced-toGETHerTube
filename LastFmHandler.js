function LastfmHandler(){
	this.isAuthenticated = false;
}

function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

LastfmHandler.prototype.authenticate=function(){
	caller = this;
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://ws.audioscrobbler.com/2.0/');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	
	if(!docCookies.hasItem('lastfmkey') && !docCookies.hasItem('gettingsessionkey')){
		//no session key and not getting one yet..
		docCookies.setItem('gettingsessionkey', 'true');
		window.location.replace("http://www.last.fm/api/auth/?api_key="+APIKEY+"&cb="+window.location.href);
		return;
	}
	if(!docCookies.hasItem('lastfmkey') && docCookies.hasItem('gettingsessionkey')){
		//no session key, but got token
		token = getUrlParameter('token');
		signing=md5('api_key'+APIKEY+'methodauth.getSessiontoken'+token+APISecret)+'';
		xhr.onload = function() {			
			//console.log(xhr.responseText);
			key = xhr.responseXML.getElementsByTagName('key')[0].childNodes[0].nodeValue;
			//super.authenticated=true;
			caller.isAuthenticated=true;
			docCookies.setItem('lastfmkey',key,{expires:10000,path:'/',domain:'.togethertube.com'});
			docCookies.removeItem('gettingsessionkey');
		};
		
		xhr.send(encodeURI('method=auth.getSession'+
					   '&token='+token+
					   '&api_key='+APIKEY+
					   '&api_sig='+signing));
	}
	else{
		//console.log('Authentication set.');
	}
}


LastfmHandler.prototype.scrobbleTrack = function(track,artist) {
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://ws.audioscrobbler.com/2.0/');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	
	startedplaying = Math.round(+new Date()/1000);

	info = [];info["track"] = track;info["artist"] = artist;
	signing=md5('api_key'+APIKEY+'artist'+info["artist"]+'methodtrack.scrobblesk'+docCookies.getItem('lastfmkey')+'timestamp'+startedplaying+'track'+info["track"]+APISecret)+'';

	xhr.onload = function() {
		//console.log(xhr.responseText);
		var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");		
		//console.log(xmlDoc);
		var isok = parseInt(xmlDoc.getElementsByTagName("scrobbles")[0].getAttribute("accepted"))==1;
		if(isok){
			console.log("Scrobbled '"+artist+" - "+track+"'");
		}			
	};

	xhr.send(encodeURI('method=track.scrobble'+
				   '&artist='+info["artist"]+
				   '&track='+info["track"]+
				   '&timestamp='+startedplaying+
				   '&api_key='+APIKEY+
				   '&sk='+docCookies.getItem('lastfmkey')+
				   '&api_sig='+signing));
}

LastfmHandler.prototype.getSimilar = function(artist,track){
	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'https://ws.audioscrobbler.com/2.0/');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	
	var songs=[];
	xhr.onload = function() {
		//console.log(xhr.responseText);
		//key = xhr.responseXML.getElementsByTagName('key')[0].childNodes[0].nodeValue;
		var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
		//console.log(xmlDoc);
		var randidx = rng.nextRange(0,xmlDoc.getElementsByTagName("track").length);
		if(xmlDoc.getElementsByTagName("track").length==0){
			console.log("No similar tracks found.");
			return;
		}
		var randtrack = xmlDoc.getElementsByTagName("track")[randidx].getElementsByTagName('name')[0].textContent;
		var randartist = xmlDoc.getElementsByTagName("track")[randidx].getElementsByTagName('artist')[0].getElementsByTagName('name')[0].textContent;
		console.log("Similar song = "+randartist+" - "+randtrack);
		searchbar.value=randartist+" - "+randtrack; //set searchbar
		Discovery.discovery = randartist+" - "+randtrack;
		isdiscovery = true;
		document.getElementById('youtube_search').click();
	};
	
	xhr.send(encodeURI('method=track.getSimilar'+
				   '&artist='+artist+
				   '&track='+track+				   
				   '&api_key='+APIKEY));
}

parser = new DOMParser();

