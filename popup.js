function renderStatus(statusText,showtime=750,permanent=false) {
    var status = document.getElementById('status');
    status.textContent = statusText;
    if(!permanent){setTimeout(function() {status.textContent = '';}, showtime);}
}

function toggleColorizer(toggleColor,toggleTimeStamp,tabId) {
  	chrome.tabs.sendMessage(tabId, {greeting: "color",colorize: toggleColor,timestamps: toggleTimeStamp}, function(response) {});	
}

function toggleVideoShow(toggleVideo,tabId) {
  	chrome.tabs.sendMessage(tabId, {greeting: "vidshow",togglevid: toggleVideo}, function(response) {});	
}

function toggleWideChat(toggleWideChat,tabId) {
  	chrome.tabs.sendMessage(tabId, {greeting: "toggleWidechat",toggleWChat: toggleWideChat}, function(response) {});	
}

//chrome.tabs.executeScript(tabId, {file: "jquery.js"}); //insert file into tab

function SetTrackLength(){
	chrome.storage.local.get({
		tracks:[]
		}, function(items){
			document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+items.tracks.length;			
		});
}

function handleOptions(items){
	if(items==0){ //no updated items?
		chrome.storage.sync.get({
		showVideo:false,
		wideChat:false,
		colorize:false,
		timestamps:false,
		shuffle:false,
		hideThumbs:false,
		minListLength:10,
		ontheair: false,
		MaxSongLength:30,
		RunAtStartup:false,
		tToTop: false,
		tToChat: false,
		radioMode:false,
		tabId:-1		
		}, function(items) {		
			handleOptions(items);
		});  		
		return;
	}
	
	document.querySelector('#cbToggleShowVideo').checked = items.showVideo;
	document.querySelector('#cbWideChat').checked = items.wideChat;
	document.querySelector('#cbColorizer').checked = items.colorize;
	document.getElementById('cbTimestamper').checked = items.timestamps;

		
	document.querySelector('#cbshuffle').checked = items.shuffle;	
	document.querySelector('#cbHideThumbs').checked = items.hideThumbs;	
	document.querySelector('#txtMinPlaylistLength').value = items.minListLength;	
	document.getElementById('txtMaxSongLength').value = items.MaxSongLength;
	
	document.querySelector('#cbTogglePlaysOverVid').checked = items.tToTop;	
	document.querySelector('#cbTogglePlaysInChat').checked = items.tToChat;	
	
	document.getElementById('cbToggleRunAtStartup').checked = items.RunAtStartup;
	document.getElementById('cbradio').checked=items.radioMode;

	if(items.radioMode){
		document.querySelector('#radiofieldset').style.display='inherit';
	}
	else{
		document.querySelector('#radiofieldset').style.display='none';		
	}
	
	SetTrackLength();	
	
	if(items.ontheair){document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair.png';}
	else{document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair_disabled.png';}
	
	if(items.tabId!=-1){	
		toggleVideoShow(items.showVideo,items.tabId);
		toggleColorizer(items.colorize,items.timestamps,items.tabId);	
		//toggleWideChat(items.wideChat,items.tabId);
	}
	//toggleThumbNails(items.hideThumbs,items.tabId);	
}

//Saves options to chrome.storage
function save_options(){
  var s = document.getElementById('cbToggleShowVideo').checked;
  var wideChat = document.getElementById('cbWideChat').checked;   
  var c = document.getElementById('cbColorizer').checked;  
  var tstamps = document.getElementById('cbTimestamper').checked;  
  
  var shuffle = document.getElementById('cbshuffle').checked;  
  var thumbs = document.getElementById('cbHideThumbs').checked;  
  var mListLength=document.getElementById('txtMinPlaylistLength').value;
  
  var titleToTop = document.getElementById('cbTogglePlaysOverVid').checked;  
  var titleToChat = document.getElementById('cbTogglePlaysInChat').checked;  
  var maxsonglength=document.getElementById('txtMaxSongLength').value;
  var startup = document.getElementById('cbToggleRunAtStartup').checked;   
  var radioMode = document.getElementById('cbradio').checked;   
  
	
  var blacklist = ["meme","leafy","and they don't stop coming (raccoovius full version)","wake me up inside skeleton chair meme","killa meme star",
	"alright alright alright alright","rick astley","reaction vid","Don't Stop Comin","full album","dubstep","pomf pomf","genitals"];
  
  chrome.storage.local.set({
	  blacklist:blacklist
	 });  
  
  chrome.storage.sync.set({
    showVideo: s,
    colorize: c,
	tToTop: titleToTop,
	tToChat: titleToChat,
	shuffle:shuffle,
	RunAtStartup:startup,
	timestamps: tstamps,
	MaxSongLength:maxsonglength,
	minListLength:mListLength,
	hideThumbs: thumbs,
	wideChat:wideChat,
	radioMode:radioMode
  }, function() {
    renderStatus('Options saved.');
  });
  handleOptions(0); //handle with current settings, to make it realtime  
}

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
    showVideo:false,
	colorize:false,
	timestamps: false,
	shuffle:false,
	minListLength:10,
	tToTop: false,
	MaxSongLength:30,
	RunAtStartup:false,
	tToChat: false,
	ontheair: false,
	tabId:-1,
	wideChat:false,
	radioMode:false,
	hideThumbs: false	
  }, function(items) {			
		handleOptions(items);
  });  
}

function setPlaylist(){
	tracklist=document.querySelector('#tracklist').value;	
	if(tracklist ==""){renderStatus('List cannot be empty!',1000);return;}
	t=[];
	parts=tracklist.split(",");
	for(i=0;i<parts.length;i++){
		if(parts[i].length>0){
		t[i]=parts[i].replace(/"/g, '');//remove quotes				
		}
	}	
	chrome.storage.local.set({
	tracks: t
	}, function() {
		if(chrome.runtime.lastError)
		{
		/* error */
		alert(chrome.runtime.lastError.message);
		return;
		}	
		renderStatus('Created Playlist of '+t.length+' songs',1000);
		document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+t.length;		
	});			
}

function StartGeth(){
	save_options();
	//chrome.browserAction.setIcon({path : {"19": "icon.png"}},function(){});
	chrome.storage.sync.get({
		tabId:-1,
		}, function(items){			
			chrome.tabs.sendMessage(items.tabId, {greeting: "startgeth"}, function(response){}); 			
		});
}

function gettabinfo(){
	chrome.tabs.query({
    title: "Room:*- TogetherTube"              // Select TT tab
	}, function(array_of_Tabs) {
		if(array_of_Tabs.length>0){
		var url = array_of_Tabs[0].url;    
		var id = array_of_Tabs[0].id; 			
		chrome.storage.sync.set({tabId: id}, function() {});		
		if(array_of_Tabs.length>=2){
			//for(i=0;i<array_of_Tabs.length;i++){alert("Found: "+array_of_Tabs.length+" tab(s). url: "+ array_of_Tabs[i].url+"id: "+array_of_Tabs[i].id);}
		}
		}
		else{
			renderStatus("!No togetherTube tab detected!",1000,true)
		}
	});
}

function controlPlaylist(e){
	switch(e.currentTarget.id) {
    case "editplaylist":		
		chrome.tabs.create({ url: "listviewer.html?list=normal" });	
		break;
    case "clearplaylist":
		chrome.storage.local.set({
		tracks: []
		}, function(items) {
			renderStatus('Cleared playlist',1000);
			document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+items.tracks.length;		
		});				
		break;
	case "btnEditBanned":		
	chrome.tabs.create({ url: "listviewer.html?list=banned" });	
		break;
    default: 
		break;
	}		
}

document.addEventListener('DOMContentLoaded', function(){
	//document.querySelector('#cbToggleShowVideo').addEventListener('change', toggleVideoClickHandler);
	//document.querySelector('#cbColorizer').addEventListener('change', toggleColorizer);
	//restore_options();
	
	document.querySelector('#cbToggleShowVideo').addEventListener('change', save_options);
	document.querySelector('#cbWideChat').addEventListener('change', save_options);
	
	document.querySelector('#cbColorizer').addEventListener('change', save_options);	
	document.querySelector('#cbTimestamper').addEventListener('change', save_options);	
	
	document.querySelector('#cbshuffle').addEventListener('change', save_options);	
	document.querySelector('#cbHideThumbs').addEventListener('change', save_options);	
	document.querySelector('#cbTogglePlaysInChat').addEventListener('change', save_options);	
	document.querySelector('#cbTogglePlaysOverVid').addEventListener('change', save_options);	
	document.querySelector('#btnconfirm').addEventListener('click', setPlaylist);	
	document.querySelector('#btnStart').addEventListener('click', StartGeth);
	document.querySelector('#tracktextinfo').innerText = '';
	document.querySelector('#cbToggleRunAtStartup').addEventListener('change', save_options);	
	document.querySelector('#cbradio').addEventListener('change', save_options);	
		
	//document.querySelector('#btncontrols1').addEventListener('click', controlplayer);	
	//document.querySelector('#btncontrols2').addEventListener('click', controlplayer);	
	
	document.querySelector('#editplaylist').addEventListener('click', controlPlaylist);	
	document.querySelector('#clearplaylist').addEventListener('click', controlPlaylist);	
	
	document.querySelector('#btnEditBanned').addEventListener('click', controlPlaylist);	
		
	gettabinfo();	
	restore_options();	
	
	chrome.storage.onChanged.addListener(function(changes, areaName){
		 var changedItems = Object.keys(changes); 
		for (item of changedItems) {
			restore_options();
			//alert(item + " has changed. Old value: "+changes[item].oldValue+",new value: "+changes[item].newValue);
		}  
	});
		
});

