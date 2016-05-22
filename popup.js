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

function toggleSongToTop(toggleTop,tabId){
	chrome.tabs.sendMessage(tabId, {greeting: "toggleToTop",toggleToTop: toggleTop}, function(response) {});	

}
function toggleSongToChat(toggleChat,tabId){
	chrome.tabs.sendMessage(tabId, {greeting: "toggleToChat",toggleToChat: toggleChat}, function(response) {});	
}

//chrome.tabs.executeScript(tabId, {file: "jquery.js"}); //insert file into tab
function PopulatePlaylistSelector(GoToNew=false){
	chrome.storage.local.get({
		playlists:[],		
		playlistIDs:[],
		playlistNames:[]
	}, function(items){	
		var playlistdropdown = document.querySelector('#playlistselect');
		while (playlistdropdown.firstChild) {playlistdropdown.removeChild(playlistdropdown.firstChild);} 	// remove all nodes
		for(var i=0;i<items.playlistIDs.length;i++){							// repopulate list
			var optionElement = document.createElement("option");
			optionElement.setAttribute("playlistid",items.playlistIDs[i]);	
			optionElement.innerHTML = items.playlistNames[i];
			playlistdropdown.appendChild(optionElement);
		}
		var optionElement = document.createElement("option");
		optionElement.setAttribute("playlistid",-1);
		optionElement.innerHTML = "Add New";
		playlistdropdown.appendChild(optionElement);
		if(GoToNew){
			SetTrackLength(items.playlistIDs[items.playlistIDs.length-1]);
			playlistdropdown.selectedIndex=items.playlistIDs.length-1;
			showNewPlaylistScreen(false);
		}
		else{
			SetTrackLength(items.playlistIDs[0]);
			}
	});	
}

function SetTrackLength(playlistid){
	playlistid = typeof playlistid !== 'undefined' ? playlistid : -1;	
	chrome.storage.local.get({
		playlists:[],		
		playlistIDs:[],
		playlistNames:[]
		}, function(items){			
			var listind =-1;
			if(playlistid==-1){listind=0;document.querySelector('#playlisteditingsdiv').style.display="none";}
			else{
				for(i=0;i<items.playlistIDs.length;i++){					
					if(items.playlistIDs[i]==playlistid){listind=i;break;}
				}
				if(listind!=-1){
					tracks = items.playlists[listind];
					document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+tracks.length;	
					document.querySelector('#playlisteditingsdiv').style.display="inherit";
				}
			}				
			
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
	document.querySelector('#txtMaxSongLength').value = items.MaxSongLength;
	
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
	
	if(items.ontheair){document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair.png';}
	else{document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair_disabled.png';}
	
	if(items.tabId!=-1){	
		toggleVideoShow(items.showVideo,items.tabId);
		toggleColorizer(items.colorize,items.timestamps,items.tabId);	
		toggleWideChat(items.wideChat,items.tabId);
		toggleSongToTop(items.tToTop,items.tabId);
		toggleSongToChat(items.tToChat,items.tabId);
	}
	//toggleThumbNails(items.hideThumbs,items.tabId);	
}

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
  	
  //var blacklist = ["meme","leafy","and they don't stop coming (raccoovius full version)","wake me up inside skeleton chair meme","killa meme star",
	//"alright alright alright alright","rick astley","reaction vid","Don't Stop Comin","full album","dubstep","pomf pomf","genitals"];
	
	
  //var playlistIDs = [0,1,2,3,4];
  //var playlistNames =["playlist1","playlist2","playlist3","playlist4","playlist5"];
  /*chrome.storage.local.set({
	  blacklist:blacklist,
	  playlistNames:playlistNames,
	  playlistIDs:playlistIDs
	 });  */
  
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

function StartGeth(){
	save_options();
	var selID = document.querySelector('#playlistselect').options[playlistselect.selectedIndex].getAttribute("playlistid");
	//chrome.browserAction.setIcon({path : {"19": "icon.png"}},function(){});
	chrome.storage.sync.get({
		tabId:-1,
		}, function(items){						
			chrome.tabs.sendMessage(items.tabId, {greeting: "startgeth",playlistid:selID}, function(response){}); 			
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
	var btnid=e.currentTarget.id;
	chrome.storage.local.get({playlists:[],playlistIDs:[]},function(items){
	var selID = document.querySelector('#playlistselect').options[playlistselect.selectedIndex].getAttribute("playlistid");
		
	switch(btnid) {
    case "editplaylist":		
		chrome.tabs.create({ url: "listviewer.html?list=normal&id="+selID});	
		break;
    case "clearplaylist":		
		chrome.storage.local.get({
		playlists: [],
		playlistNames:[],
		playlistIDs:[]	
		}, function(items){
			var newplaylists=items.playlists;
			var newplaylistnames=items.playlistNames;
			var newplaylistIDs=items.playlistIDs;
			spliton=-1;
			console.log("selID: "+selID); 
			for(i=0;i<items.playlists.length;i++){				
				console.log("checking pl id: "+items.playlistIDs[i]);
				if(selID==items.playlistIDs[i]){
					spliton=i;
					break;
				}
			}
			console.log("spliton: "+spliton); 
			if(spliton!=-1){
				console.log('Removing playlist with lenght: '+newplaylists[spliton].length);
				console.log('Removing playlist with ID: '+newplaylistIDs[spliton]);
				console.log('Removing playlist with name: '+newplaylistnames[spliton]);
				newplaylists.splice(spliton, 1);	
				newplaylistnames.splice(spliton, 1);	
				newplaylistIDs.splice(spliton,1);
			}
			chrome.storage.local.set({
				playlists: newplaylists,
				playlistNames:newplaylistnames,
				playlistIDs:newplaylistIDs	
			}, function(items) {				
				renderStatus('Removed playlist',1000);
				PopulatePlaylistSelector();
			});				
			});		
		break;
	case "btnEditBanned":		
	chrome.tabs.create({ url: "listviewer.html?list=banned" });	
		break;
    default: 
		break;
	}		
	});
}

String.prototype.hashCode = function () { //hashcode for unique playlist indexing
    var hash = 0,
        i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
};


function setPlaylist(){
	tracklist=document.querySelector('#texttracklist').value.trim();	
	playlistname=document.querySelector('#texttracklistname').value.trim();
	if(tracklist ==""){renderStatus('List cannot be empty!',1000);return;}
	if(playlistname ==""){renderStatus('Title cannot be empty!',1000);return;}
	t=[];
	parts=tracklist.split(",");
	for(i=0;i<parts.length;i++){
		if(parts[i].length>0){
		t[i]=parts[i].replace(/"/g, '');//remove quotes				
		}
	}	
	chrome.storage.local.get({
	playlists: [],
	tracks: [],
	playlistNames:[],
	playlistIDs:[]	
	}, function(items){
		if(chrome.runtime.lastError){alert(chrome.runtime.lastError.message);return;}	
		
		var newId = playlistname.hashCode();//Math.floor(Math.random()*1000); //should be unique
		var listInd = items.playlists.length; //get amount of playlists
		var newplaylists = items.playlists;
		var newplaylistIDs=items.playlistIDs;
		var newplaylistNames=items.playlistNames;
						
		newplaylists[listInd]=t;		
		newplaylistIDs[listInd]=newId;
		newplaylistNames[listInd]=playlistname;
		
		chrome.storage.local.set({playlists: newplaylists,playlistNames:newplaylistNames,playlistIDs:newplaylistIDs},function(items){});
		renderStatus('Added Playlist of '+t.length+' songs',1000);
		GoToNew=true;
		PopulatePlaylistSelector(GoToNew);
		document.querySelector('#texttracklist').value ='';
		document.querySelector('#texttracklistname').value = '';
		//document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+t.length;		
	});
	
	/*chrome.storage.local.set({
	tracks: t
	}, function() {
		if(chrome.runtime.lastError){alert(chrome.runtime.lastError.message);return;}	
		renderStatus('Created Playlist of '+t.length+' songs',1000);
		document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+t.length;		
	})*/;			
}

function UpdatePlaylistSelector(e){
	var selIndex = e.target.selectedIndex;
	var target = e.target.options[selIndex];
    var selValue = target.innerHTML;	
	var plid = target.getAttribute("playlistid");
	showNewPlaylistScreen(plid==-1);
	if(plid!=-1){SetTrackLength(plid)}
}

function ClickPlaylistSelector(e){
	var selIndex = e.target.selectedIndex;
	var target = e.target.options[selIndex];
    var selValue = target.innerHTML;
	var plid = target.getAttribute("playlistid");
	showNewPlaylistScreen(plid==-1);
	if(plid!=-1){SetTrackLength(plid)}
}

function showNewPlaylistScreen(show){
	if(show){document.querySelector('#playlistaddscreen').style.display="inherit";
	document.querySelector('#playlisteditingsdiv').style.display="none";}
	else{document.querySelector('#playlistaddscreen').style.display="none";
	document.querySelector('#playlisteditingsdiv').style.display="inherit";}
}

document.addEventListener('DOMContentLoaded', function(){
		
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
	
	document.querySelector('#playlistselect').addEventListener('change',UpdatePlaylistSelector);		
	document.querySelector('#playlistselect').addEventListener('click',ClickPlaylistSelector);	
	document.querySelector('#editplaylist').addEventListener('click', controlPlaylist);	
	document.querySelector('#clearplaylist').addEventListener('click', controlPlaylist);	
	
	document.querySelector('#btnEditBanned').addEventListener('click', controlPlaylist);	
	
	gettabinfo();	
	restore_options();	
	PopulatePlaylistSelector();
	chrome.storage.onChanged.addListener(function(changes, areaName){
		var changedItems = Object.keys(changes); 
		for (item of changedItems) {
			//restore_options();
			//alert(item + " has changed. Old value: "+changes[item].oldValue+",new value: "+changes[item].newValue);
		}  
	});
		
});

