//last fm 
//Lastfm scrobbling
EnableScrobbling = true;
APIKEY		=	'';
APISecret 	=	'';

curTrack = ""; // currently playing track


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

function authenticate(){
	if(!docCookies.hasItem('lastfmkey') && !docCookies.hasItem('gettingsessionkey')){
		docCookies.setItem('gettingsessionkey', 'true');
		window.location.replace("http://www.last.fm/api/auth/?api_key="+APIKEY+"&cb="+window.location.href);
	}
	if(!docCookies.hasItem('lastfmkey') && docCookies.hasItem('gettingsessionkey')){
		token = getUrlParameter('token');
		signing=hex_md5('api_key'+APIKEY+'methodauth.getSessiontoken'+token+APISecret)+'';
		$.get("https://ws.audioscrobbler.com/2.0/?method=auth.getSession&token="+token+"&api_key="+APIKEY+"&api_sig="+signing, function(data){
		  $xml = $(data);
		  console.log($xml);
		  key = $xml.find('key').text();
		  docCookies.setItem('lastfmkey',key,{expires:10000,path:'/',domain:'.togethertube.com'});
		  docCookies.removeItem('gettingsessionkey');
		});	
	}
	//else{console.log('Authentication set.');}
}