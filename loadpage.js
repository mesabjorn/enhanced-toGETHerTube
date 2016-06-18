//script to load current playlist
function renderStatus(statusText,showtime=5000,permanent=false) {
    var status = document.getElementById('texthelper');
	el=document.createElement("div");
	el.innerHTML = statusText;
	appendedChild=status.insertBefore(el,status.childNodes[0]);	
    if(!permanent){setTimeout(function() {status.removeChild(status.childNodes[status.childNodes.length-1]);}, showtime);}
}

handleBanned=false;
function remtrack(e){
	nrinlist = e.currentTarget.getAttribute("numberinlist");
	renderStatus("Removed "+tracks[nrinlist]+'. ');
	tracks.splice(nrinlist, 1);	
	printItems(tracks);
	document.querySelector('#savebutton').style.display='inherit';	
}

function appendToPlaylist(){
	tracklist=document.querySelector('#addinputtext').value;	
	if(tracklist ==""){return;}
	t=tracks;
	parts=tracklist.split(",");
	additions=0;
	for(i=0;i<parts.length;i++){
		if(parts[i].length>0){
			t[t.length]=parts[i].replace(/"/g, '');//remove quotes				
			additions++;
		}
	}
	document.querySelector('#addinputtext').value='';	
	renderStatus('Added '+additions+' titles. ');

	printItems(tracks);		
	updateTracks();
}

function updateTracks(){
	newtracks=tracks;
	list=document.getElementById('listcontainer');
	for(i=0;i<list.childElementCount;i++){
		//html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		stringinput=list.childNodes[i].childNodes[2].innerText;
		//stringinput=stringinput.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		newtracks[i]=stringinput;	
	}	
	if(handleBanned){
		chrome.storage.local.set({blacklist: newtracks}, function() {printItems(newtracks);});
	}else{		
		chrome.storage.local.get({
		playlists: [],		
		playlistIDs:[],			
		}, function(items){			
			listpos = getPlaylistPosFromListID(items.playlists,items.playlistIDs);
			var newplaylists = items.playlists;
			newplaylists[listpos]=newtracks;
			chrome.storage.local.set({playlists: newplaylists}, function() {printItems(newtracks);});			
		});
		
		//chrome.storage.local.set({tracks: newtracks}, function() {printItems(newtracks);});
	}
	renderStatus('Saved the list.');
}

function approvetrack(e){	
	 if(e.type == 'click' || (e.type=='keydown' && e.which==13)){ //is mouseclick or enter keydown 
		
		spanParent=e.currentTarget.parentNode;
		curValue=spanParent.childNodes[2].innerText;
		
		if(spanParent.getAttribute("isediting")=="true"){			
			spanParent.childNodes[1].style.display='none';
			spanParent.childNodes[2].innerText=spanParent.childNodes[1].value;
			spanParent.childNodes[2].style.display='inherit';
			spanParent.childNodes[3].style.display='inherit';
			spanParent.childNodes[4].style.display='none';		
			spanParent.setAttribute("isediting","false");
			//save();
		}
		//console.log(curValue);
		//console.log(spanParent.childNodes[2].innerHTML);
		if(curValue!=spanParent.childNodes[2].innerHTML){//unsaved changes?
			document.querySelector('#savebutton').style.display='inherit';	
		}		
	}
}

function edittrack(e){	
	spanParent=e.currentTarget.parentNode;
	//console.log(spanParent.outerHTML);
	//console.log(spanParent.hasAttribute('isediting'));
	//console.log(spanParent.getAttribute("isediting"));
	if(spanParent.getAttribute("isediting")=="false"){		
		spanParent.childNodes[1].style.display='inherit';
		spanParent.childNodes[1].select();
		spanParent.childNodes[2].style.display='none';
		spanParent.childNodes[3].style.display='none';
		spanParent.childNodes[4].style.display='inherit';		
		spanParent.setAttribute("isediting","true");
	}
}

function HoverOn(e){
	spanParent=e.currentTarget;
	if(spanParent.getAttribute("isediting")=="false"){
	nrinlist = e.currentTarget.getAttribute("numberinlist");
	
	spanParent.childNodes[0].style.display='inherit';
	spanParent.childNodes[3].style.display='inherit';			
	}
}

function HoverOff(e){
	spanParent=e.currentTarget;
	if(spanParent.getAttribute("isediting")=="false"){		
		nrinlist = e.currentTarget.getAttribute("numberinlist");
		spanParent.childNodes[0].style.display='none';
		spanParent.childNodes[3].style.display='none';		
	}
}

function SetPlaylistName(name){
	document.getElementById('title').innerHTML= name+"</br>";	
}

function printItems(t){
	tracks=t;
	list=document.querySelector('#listcontainer');
	while(list.firstChild){list.removeChild(list.firstChild);}
	
	if(t.length==0){
		SetPlaylistName("There's nothing here.");
	}
	else{
		if(handleBanned){
			SetPlaylistName("Blacklist: ("+t.length +" titles):");		
		}
		else{
			SetPlaylistName("Playlist '"+listName+ "'("+t.length +" titles):");		
		}
	}
	
	for(i=0;i<t.length;i++){
		insertspan = document.createElement("span");
		insertspan.addEventListener("mouseover", HoverOn);
		insertspan.addEventListener("mouseleave", HoverOff);

		insertspan.setAttribute("numberinlist", i);
		insertspan.setAttribute("isediting", false);
		
		insertionimg = document.createElement("img");insertionimg.src= "figs/cross.png";insertionimg.style.height='16px';insertionimg.style.width='16px';insertionimg.style.display='none';
		insertionimg2 = document.createElement("img");insertionimg2.src= "figs/pencil.png";insertionimg2.style.height='16px';insertionimg2.style.width='16px';insertionimg2.style.display='none';
		insertionimg3 = document.createElement("img");insertionimg3.src= "figs/approve.png";insertionimg3.style.height='16px';insertionimg3.style.width='16px';insertionimg3.style.display='none';
		insertionimg.setAttribute("numberinlist", i);
		insertionimg2.setAttribute("numberinlist", i);
		insertionimg3.setAttribute("numberinlist", i);
		insertionimg3.style.display='none';
		
		insertinput = document.createElement("input");
		insertinput.type="text";
		insertinput.value=tracks[i];
		insertinput.style.display='none';
		insertinput.addEventListener("keydown", approvetrack);
		
		insertionimg.addEventListener('click', remtrack);	
		insertionimg2.addEventListener('click', edittrack);	
		insertionimg3.addEventListener('click', approvetrack);	
		
		insertdiv = document.createElement("span");		
		insertdiv.innerText = t[i];
		
		insertspan.insertBefore(insertionimg,insertspan.childNodes[0]);
		insertspan.appendChild(insertinput);	
		insertspan.appendChild(insertdiv);	
		
		insertspan.appendChild(insertionimg2);	
		insertspan.appendChild(insertionimg3);	
		insertspan.appendChild(document.createElement("br"));
			
		list.appendChild(insertspan);
	}
}

function getPlaylistPosFromListID(playlists,ids){
	//listID
	var listpos=[];
	for(i=0;i<playlists.length;i++){
		if(ids[i]==listID){
			listpos=i;
			break;
		}		
	}
	return listpos;
	
}

function restore_options(blacklist=false){
  chrome.storage.local.get({
    playlists: [],
	playlistNames:[],
	playlistIDs:[],	
	blacklist:[]
  }, function(items){
		if(blacklist){
			handleBanned=true;			
			printItems(items.blacklist);		
			listName='Blacklist';
		}else{			
			listpos = getPlaylistPosFromListID(items.playlists,items.playlistIDs);
			listName=items.playlistNames[listpos];	
			printItems(items.playlists[listpos]);		
									
		}
  });  
}

function GetGetParameter(val) {
    var result = "Not found",tmp = [];
    location.search.substr(1).split("&")
	.forEach(function (item) {tmp = item.split("=");if (tmp[0] === val) result = decodeURIComponent(tmp[1]);});
    return result;
}

document.addEventListener('DOMContentLoaded', function() {
	listType=GetGetParameter("list");
	listID=GetGetParameter("id");	
	
	if(listType=="normal"){
		restore_options();	
	}
	else if(listType=="banned"){
		restore_options(true);
	}
	document.querySelector('#savebutton').addEventListener('click', updateTracks);
	document.querySelector('#addbutton').addEventListener('click', appendToPlaylist);
	document.querySelector('#savebutton').style.display='none';
});