function getHour() {
    d = new Date();
    hour = d.getHours();
    min = d.getMinutes();
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (min < 10) {
        min = "0" + min;
    }
    return "[" + hour + ":" + min + "]";
}

function IsManualRemoval(string2){
	systemMessages=document.getElementsByClassName('entry ng-scope systemEntry');
	found=0;	
	if(systemMessages.length>0){
	string1 = systemMessages[systemMessages.length-1].innerText;
		if(string1.indexOf(string2)>0){
		//console.log(string2+" was manually removed.")
		return true;
	}
	}	
	return false;
}

function IsInBannedList(title){
	if(blacklist.length==0){return false;}	
	ltitle=title.toLowerCase();	
	for(i=0;i<blacklist.length;i++){				
		//console.log("comparing "+ blacklist[i] +" with  "+ltitle);
		if(ltitle.indexOf(blacklist[i].toLowerCase())>=0){
			return true;
		}
	}	
	return false;
}

function checkAddition(addition){
	header=addition.children[0];
	title=header.getElementsByClassName('ng-binding')[0].innerText.trim();	
	
	rmbutton=header.getElementsByClassName('btn')[0];
	content=addition.children[1];
	duration=content.getElementsByClassName('thumbnail-info')[0].innerText;
	resultSongTimes2=handleTimeSpan(duration);
	isbanned = IsInBannedList(title);
	
	if(resultSongTimes2>MAX_SONG_LENGTH || isbanned){
		rmbutton.click(); 
		//console.log("Removed: "+title+" with length: "+duration);
	}
}

function AddSongTitleToChat(songtitle){
	chat=document.getElementsByClassName('panel-body')[0];
	insertSongTochat = document.createElement("span");
	timestamp = '</br><b>'+getHour()+' - Now playing: '+songtitle+'</b>';
	insertSongTochat.innerHTML=timestamp;
	msgs=chat.children;
	lastmsg=msgs[msgs.length-1];
	lastmsg.appendChild(insertSongTochat);
}

function handleTimeSpan(tIn){
	ltime = tIn.length; //get the string's length (i.e. "05:32" or "01:05:00") //l = 6;l=8
	if(ltime==5){return parseInt(tIn.substring(0,2));}	//first two numbers are minutes
	else if(ltime>=8){return 60*parseInt(tIn.substring(0,2))+parseInt(tIn.substring(3,5));}	//song has an hour indication, multiply minutes of hour by 60, add minutes		
	else{return -1;}		
}

trackind=-1;
logArray=[];lastGethPlay=[];
function RemoveGethVotes(){														//removes geth's autovotes	
	gethVotes=[];
	eltjes=document.getElementsByClassName('voteStatus');
	for(q=0;q<eltjes.length;q++){								
		voteString=eltjes[q].getElementsByClassName('ng-binding')[0].textContent; //innerText?
		votebutton=eltjes[q].getElementsByClassName('btn')[0];		
		if(voteString.startsWith("1")){
			if(UNVOTEALL){votebutton.click();}			
		}		//remove vote
	}
}

shuffle=false;
function AddSong(){
	itemsPerPage = 0 ;		// start index for search tab (may change if site alters)
	serviceMode = 2; 		// set service mode = youtube (2), dailymotion (4), soundcloud (6) or vimeo (8)
	initItemsPerPage = 10;	//initial items per page
	//MAX_SONG_LENGTH = 30; 	//in minutes minutes
	
	toggelbutton = document.getElementsByClassName("btn btn-primary dropdown-toggle")[0]; 	//get the dropdown button
	searchbar = document.getElementById("videoSearchInput"); 		
	playlistlength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);		
	//alert("list length:"+playlistlength+"; playlistlimit:"+playlistlimit);
	var event = new Event('change');	
	if(playlistlength<playlistlimit){																			//playlist too short?
		if(playlistlength<initItemsPerPage){itemsPerPage=playlistlength;}else{itemsPerPage=initItemsPerPage;}
		toggelbutton.click();																					//click dropdown button: has no use..I think..
		if(shuffle){trackind=Math.floor(Math.random(new Date().getTime())*tracks.length);}						//get random track
		else{
			trackind++;
			if(trackind>=tracks.length){trackind=0;}
			//console.log("Geth works without shuffle");
		}
		if(logArray.length==tracks.length){logArray=[];}; 														//reset logarray if all songs have been played once
		while(logArray.indexOf(trackind)>=0){trackind=Math.floor(Math.random(new Date().getTime())*tracks.length)}
		searchbar.value=tracks[trackind];																		//search for random track
		logArray[logArray.length]=trackind;																		//log it		
		
		if(trackind>tracks.length){trackind=tracks.length;}  													//out of range error handler
		searchbar.dispatchEvent(event);																			//init search without jquery
	  
		dropdown = document.getElementsByClassName("dropdown-menu dropdown-menu-right"); 						//get the opened dropdown menu
		nodes = dropdown[0].childNodes;
		
		n=nodes[serviceMode].childNodes[0].click(); //click youtube node //node order = youtube (2), dailymotion (4), soundcloud (6) or vimeo (8)
		timeSpans = document.getElementsByClassName("thumbnail-info ng-binding"); 								//get the timespan elements containing the duration of a song	
		resultSongTimes = [];
		for(i=itemsPerPage;i<timeSpans.length;i++){resultSongTimes[i]=handleTimeSpan(timeSpans[i].innerHTML);}

		buttonlist = document.getElementsByClassName("voteStatus"); 											//get the upvote buttons
		
		for(i=itemsPerPage;i<buttonlist.length;i++){ 															//skip first itemsPerPage (=10) results from the upcoming videos list						
			if(resultSongTimes[i]<MAX_SONG_LENGTH){				
				buttonlist[i].getElementsByClassName('btn btn-success btn-block')[0].click(); 					// click vote button and confirm song addition
				lastGethPlay[lastGethPlay.length]=timeSpans[i].parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('ng-binding')[0].innerText.trim();				
				//console.log("Added a track");
				break;
			}
		}			
	}	
}


function AddSongTitleToVideo(songtitle){
	if(document.getElementById("songTitleTarget")==null){
	//if(typeof songTitleTarget=='undefined'){	
		target=document.getElementsByClassName('container-non-responsive')[2];
		row=target.getElementsByClassName('row')[0];
		insertion = document.createElement("div");
		insertion.id="songTitleTarget";
		insertion.innerText='Waiting for queue to change...';
		songTitleTarget = target.insertBefore(insertion,row);
	}
	else{
		songTitleTarget.innerText=songtitle.trim();
	}
}

waitfunc=function WaitASecThenCheckForManRemovalAndUpdate(songtitle){
	if(!IsManualRemoval(songtitle)){		
		if(titleToChat){AddSongTitleToChat(songtitle);}
		if(titleToTop){AddSongTitleToVideo(songtitle);}
		console.log(songtitle+" is playing now.");
	}
	//listlength=parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);
	if(radioMode){
		AddSong();
		SetRadioState(true);		
	}
};	

function SetUpGeth(items){	
	if(items.hideThumbs){
		toMove = document.getElementsByClassName('col-xs-8 playlist-tabset')[0];
		chat=document.getElementsByClassName('col-xs-4')[0];
		target = document.getElementsByClassName('row')[1];
		target.insertBefore(toMove,chat);							//move playlist under video
		userlist=document.getElementsByClassName('col-xs-4')[1];
		target.appendChild(userlist,chat);
	}
	
	prevListLength=parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);	
	playlistlimit=items.minListLength;
	shuffle=items.shuffle;
	minimalLayout=items.hideThumbs;
	titleToTop=items.tToTop;
	titleToChat=items.tToChat;
	MAX_SONG_LENGTH=items.MaxSongLength;
	targetNode=document.getElementsByClassName('videoList');	
	radioMode=items.radioMode;	
	
	observer = new MutationObserver(function(mutations){
		mutations.forEach(function(mutation){
		if(mutation.type == 'childList'){
			//console.log("Mutation detected!");
			if (mutation.addedNodes.length >= 1) {
				if (mutation.addedNodes[0].nodeName != '#text') {
					if(radioMode){
					madd=mutation.addedNodes[0];
					checkAddition(madd);		
					RemoveGethVotes();
					}
					if(items.hideThumbs){formatList();}					
				}
			}		
			else if(mutation.removedNodes.length >= 1){	
				console.log("Detected removal");						
			
				curListLength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);
				m=mutation.removedNodes[0];
				if(m.nodeName!='#comment'){				
					songtitle=m.getElementsByClassName('ng-binding')[0].innerText.trim();	
					//console.log("Removed: "+songtitle +' with nodeName: '+m.nodeName);										
					if(curListLength<prevListLength){	
						//setTimeout(function() {waitfunc(songtitle,items.shuffle);},3000);
						setTimeout(waitfunc,3000,songtitle);
						console.log("Set TimeOut for " + songtitle);						
					}
				}
			}
			prevListLength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);		
		}
		});   
	});	
	observerConfig={childList: true};
	observer.observe(targetNode[0], observerConfig);	

	playlistlength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);		
	UNVOTEALL=true;
	listlength=document.getElementsByClassName('badge ng-binding')[0];

    observerlist = new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){	
	    if(mutation.type == 'characterData'){
		    prevListLength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);
	}
    });   
    });  
    observerConfiglist={characterData: true,subtree: true};
    observerlist.observe(listlength, observerConfiglist);
	
	toggleVideoShow(items.showVideo);		
	HandleColorizer(items.colorize,items.timestamps);		
	toggleWidechat(items.wideChat,items.showVideo);		
		
    if(titleToTop){AddSongTitleToVideo("Waiting for queue to change...")};
    if(minimalLayout){formatList();};	
	if(items.radioMode && tracks.length>0){SetRadioState(true);}
	if(playlistlength<playlistlimit && items.radioMode && tracks.length>0){		
		for (var i = 0; i <= (3000*playlistlimit); i += 3000) {
			setTimeout(AddSong,i);
		}
	} //init it if the playlist is empty	
	
}
function SetRadioState(mode){
		chrome.storage.sync.set({
		ontheair:mode
		}, function() {});	
}

function getUserIsOnVidListPage(){
	pages=document.getElementsByClassName('pagination ng-isolate-scope ng-valid')[0].children;
	classVal=[];
	for(i=0;i<pages.length;i++){
		classVal[i]=pages[i].getAttribute('class');
		if(classVal[i].indexOf('active')>-1){
			return parseInt(pages[i].innerText);
		}
	}
	return -1;
}

function formatList(){					//make vid list smaller
vids=document.getElementsByClassName('videoListEntry')//get entries;
playlistlength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);	
userIsOnPage=getUserIsOnVidListPage();
doAmtOfvids=Math.min(playlistlength-((userIsOnPage-1)*10),10);
for(i=0;i<doAmtOfvids;i++){
	example = vids[i];
	try{
		header=example.getElementsByClassName('header')[0];
		header.getElementsByTagName('h5')[0].style.display='inline-block';
		buttonseg = example.getElementsByClassName('content')[0].children[2];
		buttonseg.style.width='5%';
		header.appendChild(buttonseg);
		buttonseg.style.display='inline-block';
		example.getElementsByClassName('content')[0].style.display='none';
	}
	catch(e){}
}
}

function HandleColorizer(toggleColorize,toggleTimeStamp){			
		if((typeof Colorizeobserver !== 'undefined')){Colorizeobserver.disconnect();}		
		String.prototype.hashCode=function (){var hash=0,i,chr,len;if(this.length===0)return hash;for(i=0,len=this.length;i<len;i++){chr=this.charCodeAt(i);hash=((hash<<5)-hash)+chr;hash|=0;}return hash;};function getHue(text){hash=Math.abs(text.hashCode());hue=Math.floor(hash%360);hash=hash/256;light=Math.floor(hash%40)+30;return "hsl("+hue+",100%,"+light+"%)";}
		Colorizeobserver = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
		if (mutation.addedNodes.length > 0){
			nodes = mutation.addedNodes[0];
			aNode = nodes.childNodes[2];
			if (aNode.childNodes.length == 9){nodeNumber = 7;} else {nodeNumber = 5;}	
			if(toggleColorize){if(aNode.nodeType==1){aNode.style.color = getHue(aNode.childNodes[nodeNumber].innerHTML);}}
			if(toggleTimeStamp){if(aNode.nodeType==1){div = document.createElement("span");div.innerHTML = getHour();	div.style.color = "gray";div.style.fontSize = "70%";aNode.childNodes[nodeNumber].appendChild(div);}}
		}
		});
		});
		
		var observerConfig={childList:true};var chatEntries=document.querySelectorAll(".panel-chat .chatlog");
		Colorizeobserver.observe(chatEntries[0],observerConfig);	
		//console.log("Added colorizer");		
}

function toggleVideoShow(toggle) {	
  	if(toggle){		
			document.getElementsByClassName('player-overlay-wrapper')[0].style.display='inherit'
	}
	else if(!toggle){
		document.getElementsByClassName('player-overlay-wrapper')[0].style.display='none'
				
	}  
}

function toggleWidechat(toggle,toggleShowVid){	
	toggleShowVid = typeof toggleShowVid !== 'undefined' ? toggleShowVid : toggle==false;	
  	player=document.getElementById("player");
	if(!toggle){//widen chat means hiding the vid
		//chrome.storage.sync.set({showVideo: true});
		//player.childNodes[1].style.display="inherit";
		player.parentNode.className="col-xs-8";
		document.getElementsByClassName('panel-chat')[0].parentNode.parentNode.className="col-xs-4";		
	}
	else{
		//chrome.storage.sync.set({showVideo: false});
		//player.childNodes[1].style.display="none";
		player.parentNode.className="col-xs-2";
		document.getElementsByClassName('panel-chat')[0].parentNode.parentNode.className="col-xs-10";		
	}
	console.log("completed toggle wide chat");
}

function getPlaylistPosFromListID(ids,findid){	
	var listpos=-1;
	for(i=0;i<ids.length;i++){
		if(ids[i]==findid){
			listpos=i;
			break;
		}		
	}
	return listpos;	
}

function initplaylists(items,findid){
	findid = typeof findid !== 'undefined' ? findid : items.playlistIDs[0];	
	blacklist = typeof items.blacklist !== 'undefined' ? items.blacklist : [];	
	listind = getPlaylistPosFromListID(items.playlistIDs,findid);
	if(listind!=-1){
		tracks=items.playlists[listind];		
		logArray=[];		//reset log list	
		trackind=-1; 		//reset counter
	}
	else{
		tracks=[];
	}	
}
chrome.storage.local.get({playlists:[],playlistIDs:[],blacklist:[]},function(items){initplaylists(items);});

chrome.storage.sync.get({
		showVideo:false,
		hideThumbs:false,
		colorize:false,
		timestamps:false,
		RunAtStartup:false,
		shuffle:false,
		tToTop: false,
		tToChat: false,		
		wideChat:false,
		tabId:-1,
		MaxSongLength:30,
		radioMode:false,
		minListLength:10		
		}, function(items){			   
			if(items.RunAtStartup){
				SetUpGeth(items);				
			}
		}
);
SetRadioState(false);

chrome.runtime.onMessage.addListener(			//handles requests from the popupjs
function(request, sender, sendResponse){
	    if(request.greeting == "startgeth"){					
			chrome.storage.sync.get({
			shuffle:false,
			minListLength:10,
			tabId:-1,
			hideThumbs: false,
			tToTop: false,
			tToChat: false,
			radioMode:false,
			wideChat:false,
			MaxSongLength:30			
			}, function(items) {				
				chrome.storage.local.get({playlists:[],playlistIDs:[],blacklist:[]},function(localitems){					
					initplaylists(localitems,request.playlistid);
					SetUpGeth(items);
					console.log("Started geth with playlist:"+ request.playlistid);	
				});					
				}
			);			
			//sendResponse({farewell: "goodbye"});
		}
		else if (request.greeting == "color"){
			HandleColorizer(request.colorize,request.timestamps);	
			//sendResponse({farewell: "goodbye"});
		}
		else if (request.greeting == "vidshow"){
			toggleVideoShow(request.togglevid);	
			//sendResponse({farewell: "goodbye"});
		}
		else if (request.greeting == "toggleWidechat"){
			toggleWidechat(request.toggleWChat);			
			//sendResponse({farewell: "goodbye"});
		}
		else if (request.greeting == "toggleToTop"){
			titleToTop = request.toggleToTop;
			/*if(typeof songTitleTarget!=='undefined' && !titleToTop){
				songTitleTarget.style.display="none";
			}
			else if(titleToTop){
				AddSongTitleToVideo("Waiting for queue to change...");
			}*/
			if(document.getElementById("songTitleTarget")==null && titleToTop){
				AddSongTitleToVideo("Waiting for queue to change...");
			}else if(!titleToTop){
				document.getElementById("songTitleTarget").remove();								
			}
			
			console.log("caught message: "+request.greeting+": "+request.toggleToTop);  
			//sendResponse({farewell: "goodbye"});
		}
		else if (request.greeting == "toggleToChat"){
			titleToChat = request.toggleToChat;			
			console.log("caught message: "+request.greeting+": "+request.toggleToChat);  
			//sendResponse({farewell: "goodbye"});
		}
});
