//script to load current playlist

playlist = [];

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
	//console.log(e.currentTarget.parentNode.innerText);
	
	var flagForRemoval=e.currentTarget.parentNode.innerText;
	//console.log(e.currentTarget.parentNode.getAttribute("numberinlist"));
	console.log("'"+flagForRemoval+"'");
	var removeIDX=e.currentTarget.parentNode.getAttribute("numberinlist");//tracks.indexOf(flagForRemoval);
	console.log(removeIDX);		
	if(removeIDX>-1){
		renderStatus("Removed "+tracks[removeIDX]+'. ');
		tracks.splice(removeIDX, 1);
		e.currentTarget.parentNode.style.display='None'
		document.querySelector('#savebutton').style.display='inherit';	
	}	
}

function appendToPlaylist(){
	tracklist=document.querySelector('#addinputtext').value;
	if(tracklist ==""){return;}
	var t=tracks;
	parts=tracklist.split(",");
	additions=0;
	for(i=0;i<parts.length;i++){
		if(parts[i].length>0){
			t[t.length]=parts[i].replace(/"/g, '');//remove quotes				
			additions++;
		}
	}
	tracks=t;
	document.querySelector('#addinputtext').value='';
	renderStatus('Added '+additions+' titles. ');
	//printItems(tracks);	
	updateTracks();
}

function updateTracks(){
	newtracks=tracks;
	//list=document.getElementById('listcontainer');
	/*for(i=0;i<list.childElementCount;i++){
		//html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		stringinput=list.childNodes[i].childNodes[2].innerText;
		//stringinput=stringinput.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		newtracks[i]=stringinput;	
	}*/	
	if(handleBanned){
		chrome.storage.local.set({blacklist: newtracks}, function() {printItems(newtracks);});
	}else{		
		chrome.storage.local.get({
		playlists: [],		
		playlistIDs:[],			
		}, function(items){		
			console.log(items.playlists);			
			for(var i=0;i<items.playlists.length;i++){						// repopulate list
				console.log(items.playlists[i].id);
			}			
		
			listpos = getPlaylistPosFromListID(items.playlists);
			console.log(listpos);
			
			newplaylists = items.playlists;
			newplaylists[listpos].tracks = newtracks;
			
			
			//var newplaylists = items.playlists;
			//newplaylists[listpos]=newtracks;
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
			tracks[spanParent.getAttribute("numberinlist")]=spanParent.childNodes[2].innerText;
			console.log("Changed: "+curValue +" to -> "+tracks[spanParent.getAttribute("numberinlist")]);
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
	spanParent = e.currentTarget.parentNode;	
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
		spanParent.style.backgroundColor='lightgrey';
		spanParent.style.color='white';
	}
}

function HoverOff(e){
	spanParent=e.currentTarget;
	if(spanParent.getAttribute("isediting")=="false"){		
		nrinlist = e.currentTarget.getAttribute("numberinlist");
		spanParent.childNodes[0].style.display='none';
		spanParent.childNodes[3].style.display='none';
		spanParent.style.backgroundColor='white';
		spanParent.style.color='black';
	}
}

function SetPlaylistName(name){
	document.getElementById('title').innerHTML= name+"</br>";	
}

function printItems(t,start,end,clearlist){
	let list=document.querySelector('#listcontainer');
	if(clearlist){while(list.firstChild){list.removeChild(list.firstChild);}}	//remove all nodes
	
	if(t.length==0){SetPlaylistName("There's nothing here.");}
	else{
		if(handleBanned){SetPlaylistName("Blacklist: ("+t.length +" titles):");}
		else{SetPlaylistName("Playlist '"+playlist.name+ "'("+t.length +" titles):");}
	}
	
	end=Math.min(end,t.length);
	start=Math.max(0,start);
	//end=t.length; //shows all
	for(i=start;i<end;i++){
		insertspan = document.createElement("span");
		insertspan.addEventListener("mouseover", HoverOn);
		insertspan.addEventListener("mouseleave", HoverOff);
		insertspan.addEventListener('click', edittrack);			
		
		insertspan.setAttribute("numberinlist", t.indexOf(t[i].name.replace(/<\/?[^>]+(>|$)/g, "")));
		insertspan.setAttribute("isediting", false);
		
		insertionimg = document.createElement("img");insertionimg.src= "figs/cross.png";insertionimg.style.height='16px';insertionimg.style.width='16px';insertionimg.style.display='none';insertionimg.style.cursor='pointer';
		insertionimg2 = document.createElement("img");insertionimg2.src= "figs/pencil.png";insertionimg2.style.height='16px';insertionimg2.style.width='16px';insertionimg2.style.display='none';insertionimg2.style.cursor='pointer';
		insertionimg3 = document.createElement("img");insertionimg3.src= "figs/approve.png";insertionimg3.style.height='16px';insertionimg3.style.width='16px';insertionimg3.style.display='none';insertionimg3.style.cursor='pointer';
		insertionimg.setAttribute("numberinlist",i);
		insertionimg2.setAttribute("numberinlist",i);
		insertionimg3.setAttribute("numberinlist",i);
		insertionimg3.style.display='none';
		
		insertinput = document.createElement("input");
		insertinput.type="text";
		insertinput.value=t[i].name.replace(/<\/?[^>]+(>|$)/g, "");
		insertinput.style.display='none';
		insertinput.style.width = "33%";
		insertinput.addEventListener("keydown", approvetrack);
		
		insertionimg.addEventListener('click', remtrack);	
		insertionimg2.addEventListener('click', edittrack);	
		insertionimg3.addEventListener('click', approvetrack);	
		
		insertdiv = document.createElement("span");		
		insertdiv.innerHTML = t[i].name;
		insertdiv.addEventListener('click', edittrack);			

		
		insertspan.insertBefore(insertionimg,insertspan.childNodes[0]);
		insertspan.appendChild(insertinput);	
		insertspan.appendChild(insertdiv);	
		
		insertspan.appendChild(insertionimg2);	
		insertspan.appendChild(insertionimg3);	
		insertspan.appendChild(document.createElement("br"));
			
		list.appendChild(insertspan);
	}
}

// window.addEventListener('scroll', function(e) {
//    //console.log(window.scrollY);
//    if(UserIsSearching)return;
//    if(window.scrollY + document.body.clientHeight > document.body.offsetHeight) {
//        //console.log("near bottom!");
// 	   list=document.querySelector('#listcontainer');
// 	   start=parseInt(list.childNodes[list.childElementCount-1].getAttribute('numberinlist'))+1;
// 	   end=start+100;
// 	   console.log("Showing till:"+end);
// 	   printItems(tracks,start,end,false); // dont clear list
//    }
// });

function getPlaylistPosFromListID(playlists){//listID
	var listpos=[];
	for(i=0;i<playlists.length;i++){
		if(playlists[i].id==listID){
			listpos=i;
			break;
		}		
	}
	return listpos;	
}

function restore_options(blacklist=false){
  chrome.storage.local.get({
    playlists: [],	
	blacklist:[]
  }, function(items){
		if(blacklist){
			handleBanned=true;			
			tracks=items.blacklist;
			listName='Blacklist';
		}else{
			for(i=0;i<items.playlists.length;i++){
				if(items.playlists[i].id==listID){
					playlist = items.playlists[i];
					tracks=items.playlists[i].tracks;
					break;
				}
			}
		
			//listpos = getPlaylistPosFromListID(items.playlists,items.playlistIDs);
			//listName=items.playlistNames[listpos];
												
		}
		printItems(tracks,0,100,false);	
  });  
}

function GetGetParameter(val) {
    var result = "Not found",tmp = [];
    location.search.substr(1).split("&").forEach(function (item) {tmp = item.split("=");if (tmp[0] === val) result = decodeURIComponent(tmp[1]);});
    return result;
}

UserIsSearching=false;
function searchInTracks(){
	var results = 0;
	let query = document.getElementById("searchfield").value.toLowerCase().trim();
	if(query.length==0){UserIsSearching=false;printItems(tracks,0,100,true);}
	if(query.length<=2){return;}
	searchResult=[];
	UserIsSearching=true;
	for (var i = 0; i < tracks.length; i++) {
		var t = tracks[i].toLowerCase();
	    t = t.replace(/ +(?= )/g, '');
	    query = query.replace(/ +(?= )/g, '');
	    if (t.indexOf(query) != -1) {
	      //addEntry(tracks[i]);
		 // console.log(tracks[i]);
	      results += 1;
			//		  searchResult[searchResult.length]=tracks[i];		  
			var qindex = t.indexOf(query);						
			searchResult[searchResult.length]=tracks[i].substr(0,qindex)+'<b>'+tracks[i].substr(qindex,query.length)+'</b>'+tracks[i].substr(qindex+query.length,tracks[i].length);			
	    }
	}
	searchResult = searchResult.sort();
	printItems(searchResult,0,searchResult.length,true);					  	
	console.log("finished searching "+searchResult.length+" results!");
}


class ListViewer{
	constructor(){
		this.GetLists().then((d) => {
			//printItems(d,0,d.length,true);
			
			this.tracks = d;
			this.lowerCaseTracks = this.tracks.map((v)=>{return unescape(v.listname).toLowerCase()});
			this.filteredTracks=this.tracks;
			
			this.query="";
			this.showTracks();		
			console.log(`Loaded playlist with ${this.tracks.length} track(s).`);
		});

		this.searchbar = document.getElementById("searchbar");
		this.searchbar.addEventListener("keyup",()=>{
			this.query = document.getElementById("searchbar").value.toLowerCase().trim();
			console.log(this.query);
			
			let temp = [];
			for (let i=0;i<this.tracks.length;i++){
				if(this.lowerCaseTracks[i].indexOf(this.query)>-1){
					temp.push(this.tracks[i]);
				}
			}
			this.filteredTracks=temp;
			
			
			this.showTracks();
		});

	}

	responseJson(response) {
		if (!response.ok)
		  throw new Error(response.status + " " + response.statusText);
		return response.json();
	 }
	
	async GetLists() {
	return new Promise((resolve, rejects) => {
		fetch(chrome.runtime.getURL("./playlists/jsonlist_youtubeid.json")).then(
		(resp) => {			
			this.responseJson(resp).then((d) => {			
			resolve(d);
			});
		}
	);
	});
	}

	showTracks(){
		
	let list = document.getElementsByTagName("tbody")[0];
	list.innerHTML="";

	for(let i= 0; i<this.filteredTracks.length; i++){
		var row = list.insertRow(-1);
		row.setAttribute("scope","row");	
		let track = unescape(this.filteredTracks[i].listname).split("-")
		
		var cell1 = row.insertCell(0);
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		// var cell5 = row.insertCell(4);


		// let img1 = document.createElement("img");
		// let img2 = document.createElement("img");
		// img1.src = "./figs/pencil.png";
		// img2.src = "./figs/cross.png";
		// img2.style.height="24px"; img1.style.height="24px";

		cell1.innerHTML = i+1;
		cell2.innerHTML = track[0];
		cell3.innerHTML = track[1];
		cell4.innerHTML = `<a target='_blank' href="https://www.youtube.com/watch?v=${this.filteredTracks[i].id}">${this.filteredTracks[i].id}</a>`;
		
		// cell5.appendChild(img1);
		// cell5.appendChild(img2);				
		
	}
	}	

	filterTracks(){
		
		var results = 0;
		let UserIsSearching=true;
		// if(query.length==0){UserIsSearching=false;printItems(tracks,0,100,true);}
		if(query.length==0){this.showTracks(this.tracks);return;}
		if(query.length<=2){return;}
		
		let searchResult=[];
		// query = query.replace(/ +(?= )/g, '');
		query = escape(query);
		console.log(query);
		for (let i = 0; i < this.tracks.length; i++) {
			let t = this.tracks[i].listname.toLowerCase();
			t = t.replace(/ +(?= )/g, '');
			
			if (t.indexOf(query) != -1) {
			  //addEntry(tracks[i]);
			 // console.log(tracks[i]);
			  	results += 1;
				//		  searchResult[searchResult.length]=tracks[i];		  
				// var qindex = t.indexOf(query);						
				// searchResult[searchResult.length]=tracks[i].substr(0,qindex)+'<b>'+tracks[i].substr(qindex,query.length)+'</b>'+tracks[i].substr(qindex+query.length,tracks[i].length);			
				searchResult.push(this.tracks[i]);
			}
			if(this.tracks[i].id.toLowerCase()==query){
				searchResult.push(this.tracks[i]);
			}
		}
		searchResult = searchResult.sort();
		this.showTracks(searchResult,0,searchResult.length,true);					  	
		console.log("finished searching "+searchResult.length+" results!");
	}
	
}

		
document.addEventListener('DOMContentLoaded', function() {	


	L = new ListViewer();

	
});

