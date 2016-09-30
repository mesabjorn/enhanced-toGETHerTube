//RNG
function RNG(seed) {
  // LCG using GCC's constants
  this.m = 0x80000000; // 2**31;
  this.a = 1103515245;
  this.c = 12345;
  this.state = seed ? seed : Math.floor(Math.random() * (this.m-1));
}

RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
}

RNG.prototype.nextRange = function(start, end) {
  // returns in range [start, end): including start, excluding end
  // can't modulu nextInt because of weak randomness in lower bits
  var rangeSize = end - start;
  var randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
}

var rng = new RNG(new Date().getTime());
function GetRandomTrackInd(){
	return rng.nextRange(0,tracks.length);
}
//END RNG

//chatbot
AllowChatCommands=false;DiscoveryMode=false;
commands = ['?','help','progress','nuke','last'];longestCommand=8;
LastCommandDate=new Date();LastCommandDate.setSeconds(LastCommandDate.getSeconds()-10);
function handleCommand(commandIndex){
	if(AllowChatCommands){
	switch(commandIndex) {
    case 0:
        SubmitAChatMessage('[Geth]: Monitored by Geth V1.4.');
		//console.log("switched on commandind: "+ commandIndex);
        break;  
	case 1:
		SubmitAChatMessage('[Geth]: Monitored by Geth V1.4. Allowed commands: /?, /help, /progress,/last and /nuke');
		break;
	case 2:
        SubmitAChatMessage('[Geth]: Playing playlist "'+playlistName+'" of which '+logArray.length+ ' of '+tracks.length+ ' tracks have been suggested.');
		break;	
	case 3:
        SubmitAChatMessage('[Geth]: Nuking suggestions.');ToggleUserSuggest(false);
		break;
	case 4:	
		offset=Math.round(Math.random()*10);
        SubmitAChatMessage("[Geth]: Recently added to playlist: '"+tracks[tracks.length-1-offset]+"'.");		
		break;		
    default:
        console.log("unknown command");
	}
	LastCommandDate=new Date();
	}
	else{
		console.log("Chat commands disabled.");
	}
}

function checkGethCommands(command){	
	if(command.indexOf('/')==0){		
	command=command.toLowerCase();
	command=command.slice(1,longestCommand+1);		//trim string to prevent injection	
	for(i=0;i<commands.length;i++){ 				//go through command list
		if(commands[i]===command && new Date()-LastCommandDate>3000){ //allow commands every 3s
			handleCommand(i);		
			return;
		}
	}
	}	
}

//f = $("[data-ng-submit^='sendMessage']")[0]; //get form
forms=document.getElementsByTagName('form');
for(i=0;i<forms.length;i++){
	if(forms[i].hasAttribute('data-ng-submit')){f=forms[i];}	
}

btn = document.createElement("button");
btn.setAttribute("data-ng-submit","sendMessage(chatEntry); chatEntry = '';");
btn.setAttribute("id","btnType");btn.style.display='none';
f.appendChild(btn);
var event = new Event('change');	
function SubmitAChatMessage(message){
	
	formControls=document.getElementsByClassName('form-control')
	for(i=0;i<formControls.length;i++){
	if(formControls[i].hasAttribute('placeholder')){
		if(formControls[i].getAttribute('placeholder')==="Share your thoughts..."){
				formControls[i].value=message;
				formControls[i].dispatchEvent(event);																			//init change without jquery
		}
	}	
	}
	document.getElementById('btnType').click();	
	
	//console.log("submitted message: "+ message);
}
//end chatbot

//GetSimilarTracks

function PerformDiscoverySearch(songname){
		var filteredsong = songname.replace(/\(.*\)/i, "");
		var songparts= filteredsong.split("-");
		var artist=songparts[0];
		var track =songparts[1];
		getSimilar(artist.trim(),track.trim());
		console.log("Performing discovery for "+artist + "-" + track);
}

function getTracksSongMatch(song){ //gets closest match in current playlist
	hitcounter=[];
	for(i=0;i<tracks.length;i++){
		listentry=tracks[i].toLowerCase();	
		song=song.toLowerCase();
		strparts=song.split(" ");
		hitcounter[i]=0;
		for(j=0;j<strparts.length;j++){	
			if(listentry.indexOf(strparts[j])>-1){
				hitcounter[i]=hitcounter[i]+1;		
			}	
		}	
	}
	return indexOfMax(hitcounter); //get index where max value is found (closest match)
}

function indexOfMax(arr) { //gets index of max value
	if (arr.length === 0) {return -1;} max = arr[0];maxIndex = 0;
	for (var i = 1; i < arr.length; i++) {if (arr[i] > max) {maxIndex = i;max = arr[i];}}	
	return maxIndex;
}

function GetNewTrack(songs){ //go through playlist to see if discovery was new.
	for(i=0;i<songs.length;i++){	//for all songs from last fm
		isNew=true;	
		for(j=0;j<tracks.length;j++){	//check all songs in tracklist
			songname=tracks[j];
					
			var songparts= songname.toLowerCase().replace(/\(.*\)/i, "").split("-");
			var artist1=songparts[0].trim();
			var track1 =songparts[1].trim();
					
			var songparts= songs[i].toLowerCase().replace(/\(.*\)/i, "").split("-");
			var artist2=songparts[0].trim();
			var track2 =songparts[songparts.length-1].trim();
			
			if(songparts.length==2){
				if(artist1==artist2 && track1==track2){
					isNew=false;
					break;			
				}		
			}
			else{
				if(track1==track2){
					isNew=false;
					break;			
				}		
			}
		}
		if(isNew){
			console.log("New song= "+artist2+" - "+track2);
			newSong = artist2+" - "+track2;
			return newSong;
		}
		else{
			console.log("No new song could be found, using random.");
			return songs[Math.round(Math.random()*songs.length)];				
		}
	}
}


APIKEY=-1;//
function getSimilar(ain,tin){
var songs=[];
if(APIKEY!=-1){
url = "https://ws.audioscrobbler.com/2.0/?method=track.getSimilar&artist="+ain+"&track="+tin+"&api_key="+APIKEY;
	$.get(url, function (data) {
		$xml = $(data);
		$t = $xml.find('track');
		tt = $t.next().children("name");
		aa = $t.next().children("artist").children("name");
	
		for (var i = 0; i < tt.length; i++) {songs[i]=aa[i].innerHTML + " - " + tt[i].innerHTML;}

		//for (var i = 0; i < songs.length; i++) {console.log(songs[i]);}
		if(songs.length>0){
			similarSong = GetNewTrack(songs);	
			setTimeout(AddSong,1000,similarSong);console.log("Suggested "+ similarSong+" through discovery!");
		}
		else{console.log("Discovery resulted nothing!");setTimeout(AddSong,1000);console.log("Suggested "+ ain +"-"+ tin+"!");}		
	});
	//return songs;	
}
else{
	alert('No last fm api key supplied discovery won\'t work. (http://www.last.fm/api/account/create)');
}
}
//

optionsWindow=-1;
function ToggleUserSuggestHelper(toggle,target){
	frame=document.getElementById('settingsFrame');

	frame.contentDocument.getElementsByClassName('list-group')[0].children[1].click()
	toggles=frame.contentDocument.getElementsByClassName('permission-toggle-link');

	if(toggle){ //enable suggesting
		if(toggles[30].childNodes[1].className.indexOf('fa-square-o')>-1){//Registered user can suggest new video is unchecked?
			toggles[30].click();
		}
		if(toggles[31].childNodes[1].className.indexOf('fa-square-o')>-1){//Registered user can suggest new video is unchecked? i.e suggesting disabled?
			toggles[31].click();										//click disable
		}	
		//console.log(getHour()+"Enabled suggesting");
		SubmitAChatMessage("[Geth]"+getHour()+"Enabled suggestions.");
		WriteEventLogEntry("System: Enabled suggesting.");
	}
	else{//disabling suggesting
		if(toggles[30].childNodes[1].className.indexOf('fa-check')>-1){//Registered user can suggest new video is checked?
			toggles[30].click();
		}
		if(toggles[31].childNodes[1].className.indexOf('fa-check')>-1){//Registered user can suggest new video is checked? i.e suggesting enabled?
			toggles[31].click();										//click disable
		}		
		//console.log(getHour()+"Disabled suggesting");
		SubmitAChatMessage("[Geth]"+getHour()+"Disabled suggestions.");
		WriteEventLogEntry("System: Disabled suggesting.");
	}
	frame.contentDocument.getElementsByTagName('button')[1].click(); //click save	
}

function ToggleUserSuggest(toggle){ //creates the iframe
	frame=document.getElementById('settingsFrame');
	waitTime=100;
	if(frame==null){
	target=document.getElementsByClassName('content-wrapper')[0]
	node=document.createElement('iframe');
	node.name="theFrame";
	frame=target.appendChild(node);
	frame.style.display="none";
	frame.style.width="600px";
	frame.style.height="400px";

	frame.id="settingsFrame";
	
	roomname=document.location.pathname;
	optionsWindow=window.open("https://togethertube.com"+roomname+"/settings","theFrame");
	waitTime=5000;
	}	
	setTimeout(ToggleUserSuggestHelper,waitTime,toggle,target);
	setTimeout(ToggleUserSuggestHelper,900*1000,!toggle,target);
}

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
		console.log("Removed: "+title+" with length: "+duration);
		WriteEventLogEntry("System: Removed: "+title+" with length: "+duration);
		if(isbanned){ToggleUserSuggest(false);} //disable user suggestions if something from banned list gets suggested
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

lastGethPlay=[];
function RemoveGethVotes(title=""){														//removes geth's autovotes		
	gethVotes=[];
	eltjes=document.getElementsByClassName('voteStatus');
	//p = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);		
		
	for(q=0;q<Math.min(eltjes.length,10);q++){								
	foundTitle=eltjes[q].parentNode.parentNode.parentNode.parentNode.children[0].innerText.trim();
	flag=title==foundTitle;
		
	if(foundTitle==title){
		//console.log('Removing vote for: ' + title);
		voteString=eltjes[q].getElementsByClassName('ng-binding')[0].textContent; //innerText?
		votebutton=eltjes[q].getElementsByClassName('btn')[0];		
		if(voteString.startsWith("1")){votebutton.click();}		//remove vote	
	}		
	}
}

function WriteEventLogEntry(entry){
	eventLog[eventLog.length]=[new Date().toString(),entry];
	chrome.storage.local.set({eventLog:eventLog}, function(){});	
}

function printArrayToConsole(arr){text='';for(q=0;q<arr.length;q++){if(q<arr.length-1){text+=arr[q]+","}else{text+=arr[q]}}console.log("arr=["+text+"];");	}

shuffle=false;
PrevSongWasRecovery=false;
function AddSong(songToAdd=""){
	itemsPerPage = 0 ;		// start index for search tab (may change if site alters)
	serviceMode = 2; 		// set service mode = youtube (2), dailymotion (4), soundcloud (6) or vimeo (8)
	initItemsPerPage = 10;	//initial items per page
	//MAX_SONG_LENGTH = 30; 	//in minutes minutes
	
	toggelbutton = document.getElementsByClassName("btn btn-primary dropdown-toggle")[0]; 	//get the dropdown button
	searchbar = document.getElementById("videoSearchInput"); 		
	playlistlength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);		
	//alert("list length:"+playlistlength+"; playlistlimit:"+playlistlimit);	
	if(playlistlength<playlistlimit){																			//playlist too short?
		if(playlistlength<initItemsPerPage){itemsPerPage=playlistlength;}else{itemsPerPage=initItemsPerPage;}
		toggelbutton.click();																					//click dropdown button: has no use..I think..
		if(shuffle){trackind=GetRandomTrackInd();}//Math.floor(Math.random(new Date().getTime())*tracks.length);}						//get random track
		else{
			trackind++;//logArray[logArray.length];
			if(trackind>=tracks.length){trackind=0;}
			//console.log("Geth works without shuffle");
		}
		if(logArray.length==tracks.length){logArray=[];}; 														//reset logarray if all songs have been played once		
		while(logArray.indexOf(trackind)>=0){trackind=GetRandomTrackInd();}
		searchbar.value=tracks[trackind];																		//search for random track		
		
		if(songToAdd.length>0){searchbar.value=songToAdd;}		
		if(DiscoveryMode && Math.random()>0.9 && songToAdd.length==0){PerformDiscoverySearch(tracks[trackind]); return;}	//one in ten songs is geth discovered		
		
		if(trackind>tracks.length){trackind=tracks.length;}  													//out of range error handler
		logArray[logArray.length]=trackind;																		//log it		
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
						
				suggestedSongName = timeSpans[i].parentNode.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('ng-binding')[0].innerText.trim();				
				
				if(DiscoveryMode && PrevSongWasRecovery){										
						SubmitAChatMessage("[GETH]: '"+suggestedSongName+"' was added through GETH discovery mode.");
						suggestedSongName+="*";
						PrevSongWasRecovery=false;					
				}				
				lastGethPlay[lastGethPlay.length]=suggestedSongName;
				WriteEventLogEntry("Suggested: "+suggestedSongName);				
				break;
			}
		}
		if(songToAdd.length>0){PrevSongWasRecovery=true;}
		chrome.storage.local.set({logArray: logArray}, function(){
			//if((logArray.length%10)==0){
			//printArrayToConsole(logArray);
			//}
		});		
	}	
}

function SetLogArray(items){	
	logArray = typeof items.logArray !== 'undefined' ? items.logArray : [];	
	eventLog = typeof items.eventLog !== 'undefined' ? items.eventLog : [];	
	eventLog=eventLog.slice(eventLog.length-100,eventLog.length);	
	trackind=logArray[logArray.length-1];
	trackind = typeof trackind !== 'undefined' ? trackind : -1;	
	//printArrayToConsole(logArray);	
	console.log("Continuing from previous list of which "+ logArray.length+" items were played.");	
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
	else{songTitleTarget.innerText=songtitle.trim();}
}

waitfunc=function WaitASecThenCheckForManRemovalAndUpdate(songtitle){
	if(!IsManualRemoval(songtitle)){		
		if(titleToChat){AddSongTitleToChat(songtitle);}
		if(titleToTop){AddSongTitleToVideo(songtitle);}
		//console.log(songtitle+" is playing now.");
	}
	//listlength=parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);
	if(radioMode){
		AddSong();
		SetRadioState(true);		
	}
};

function clearConsoleEveryHour() {return window.setInterval( function() {
	try{document.getElementsByClassName('player-overlay-wrapper')[0].style.display;}
	catch(e){
		WriteEventLogEntry("System: Cleared console.");
		console.clear();};	
	}, 3600000);};

function SetUpGeth(items){	
	if(items.hideThumbs){		
		toMove = document.getElementsByClassName('col-xs-8 playlist-tabset')[0];
		//chat=document.getElementsByClassName('col-xs-4')[0];
		chat = document.getElementsByClassName('panel-chat panel panel-default')[0].parentNode.parentNode;
		target = document.getElementsByClassName('row')[1];
		target.insertBefore(toMove,chat);							//move playlist under video
		userlist=document.getElementsByClassName('col-xs-4');
		if(userlist.length==1){userlist=userlist[0];}else{userlist=userlist[1];}
		target.appendChild(userlist,chat);
	}
	var id = clearConsoleEveryHour(); //sets interval function that clears the console every hour if the video was removed
	
	AllowChatCommands=items.allowChatCommands;
	DiscoveryMode=items.discoveryMode;
	
	chrome.storage.local.get({logArray:[],eventLog:[]},function(items){SetLogArray(items);});
	
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
					t=madd.children[0].getElementsByClassName('ng-binding')[0].innerText.trim();					
					RemoveGethVotes(t); //remove votes for this title only
					}
					if(items.hideThumbs){formatList();}					
				}
			}		
			else if(mutation.removedNodes.length >= 1){	
				//console.log("Detected removal");									
				curListLength = parseInt(document.getElementsByClassName("badge ng-binding")[0].innerHTML);
				m=mutation.removedNodes[0];
				if(m.nodeName!='#comment'){				
					songtitle=m.getElementsByClassName('ng-binding')[0].innerText.trim();						
					//console.log("Removed: "+songtitle +' with nodeName: '+m.nodeName);										
					if(curListLength<prevListLength){	
						//setTimeout(function() {waitfunc(songtitle,items.shuffle);},3000);
						setTimeout(waitfunc,3000,songtitle);
						//console.log("Set TimeOut for " + songtitle);						
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
	
	/*testSong = tracks[800];//"Led Zeppelin - Lemon Song";
	console.log(tracks[800]);
	songstring = tracks[getTracksSongMatch(testSong)]
	
	var re = new RegExp("\\([\\S ]*\\)");	
	songparts = songstring.replace(re,"").trim().split("-");
	getSimilar(songparts[0].trim(),songparts[1].trim());	*/
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
		String.prototype.hashCode=function (){var hash=0,i,chr,len;if(this.length===0)return hash;for(i=0,len=this.length;i<len;i++){chr=this.charCodeAt(i);hash=((hash<<5)-hash)+chr;hash|=0;}return hash;};function getHue(text){hash=Math.abs(text.hashCode());hue=Math.floor(hash%360);hash=hash/256;light=Math.floor(hash%40)+30;return "hsl("+hue+",75%,"+light+"%)";}
		Colorizeobserver = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
		if (mutation.addedNodes.length > 0){
			nodes = mutation.addedNodes[0];			
			aNode = nodes.childNodes[2];
			if (aNode.childNodes.length == 9){nodeNumber = 7;} else {nodeNumber = 5;}	
			if(toggleColorize){if(aNode.nodeType==1){aNode.style.color = getHue(aNode.childNodes[nodeNumber].innerHTML);}}
			checkGethCommands(aNode.parentElement.children[1].innerHTML.trim()); //check if message is a command			
			if(toggleColorize){if(aNode.nodeType==1){
				if(aNode.childNodes[nodeNumber].innerText.length>25){
					aNode.childNodes[nodeNumber].innerText=aNode.childNodes[nodeNumber].innerText.slice(0,25);
				}
			}}
			
			if(toggleTimeStamp){if(aNode.nodeType==1){div = document.createElement("span");div.innerHTML = getHour();	div.style.color = "gray";div.style.fontSize = "70%";aNode.childNodes[nodeNumber].appendChild(div);}}
		}
		});
		});
		
		var observerConfig={childList:true};var chatEntries=document.querySelectorAll(".panel-chat .chatlog");
		Colorizeobserver.observe(chatEntries[0],observerConfig);	
		//console.log("Added colorizer:"+toggleColorize+"; timestamps: "+toggleTimeStamp);		
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
	//console.log("completed toggle wide chat");
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
	logArray = typeof items.logArray !== 'undefined' ? items.logArray : [];	
	//console.log('blacklist length: '+blacklist.length);
	listind = getPlaylistPosFromListID(items.playlistIDs,findid);
	playlistName = items.playlistNames[listind];
	if(listind!=-1){
		tracks=items.playlists[listind];				
		trackind=0; 		//reset counter
	}
	else{
		tracks=[];
	}	
}
chrome.storage.local.get({playlists:[],playlistIDs:[],blacklist:[],playlistNames:[]},function(items){initplaylists(items);});

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
		discoveryMode:false,
		allowChatCommands:false,
		minListLength:10		
		}, function(items){			   
			if(items.RunAtStartup){
				SetUpGeth(items);				
			}
		}
);

SetRadioState(false);
thisPagePlaylistID=-1;// playlistid for this tab, sets to id after starting geth, then used as check for resetting logarray
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
			colorize:false,
			timestamps:false,
			discoveryMode:false,
			allowChatCommands:false,
			MaxSongLength:30			
			}, function(items) {				
				chrome.storage.local.get({playlists:[],playlistIDs:[],blacklist:[],playlistNames:[]},function(localitems){					
					initplaylists(localitems,request.playlistid);
					thisPagePlaylistID=request.playlistid;
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
			if(document.getElementById("songTitleTarget")==null && titleToTop){
				AddSongTitleToVideo("Waiting for queue to change...");
			}else if(!titleToTop){
				if(document.getElementById("songTitleTarget")!=null){
					document.getElementById("songTitleTarget").remove();								
				}
			}			
		}
		else if (request.greeting == "toggleToChat"){titleToChat = request.toggleToChat;}
		else if (request.greeting == "toggleChatCommands"){AllowChatCommands = request.allowChatCommands;}
		else if (request.greeting == "toggleDiscoveryMode"){DiscoveryMode=request.discoveryMode;}
		else if (request.greeting == "whatchaplayin"){sendResponse({currentlyPlaying: thisPagePlaylistID});}
		else if (request.greeting == "reset"){				
			logArray=[];
			chrome.storage.local.set({logArray: []}, function(){});
			console.log("Reset logArray");
			
		}
});
