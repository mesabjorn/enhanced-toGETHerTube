function GetGetParameter(val) {
    var result = "Not found",tmp = [];
    location.search.substr(1).split("&")
	.forEach(function (item) {tmp = item.split("=");if (tmp[0] === val) result = decodeURIComponent(tmp[1]);});
    return result;
}

function WriteMessage(message,success){
	errorbar = document.getElementById("errorbar");
	errorbar.children[0].innerText=message;
	errorbar.style.display="inherit";
	if(success){errorbar.style.backgroundColor="green";}
	else{errorbar.style.backgroundColor="red";}
	setTimeout(function(){errorbar = document.getElementById("errorbar");errorbar.style.display="none";},3000);	
}

function GetJSONExportString(playlists,listnames){
	jsonstring='{"playlists":[{'
	for(i=0;i<playlists.length;i++){
		curpl = playlists[i];
		jsonstring+='"'+listnames[i]+'":[';
		for(j=0;j<curpl.length;j++){
			if(j<curpl.length-1){
				jsonstring+='"'+curpl[j]+'",';
			}
			else{
				jsonstring+='"'+curpl[j]+'"';
			}		
		}
		jsonstring+=']';
		if(i<playlists.length-1){
			jsonstring+=',';
		}
	}
	jsonstring+='}]}';
return jsonstring;
}

function runExport(){
	chrome.storage.local.get({playlists:[],playlistNames:[],blacklist:[]}, function(items){
		
		if(typeof(items.blacklist)!=="undefined"){ //blacklist = empty?
			items.playlists[items.playlists.length]=items.blacklist;		
			items.playlistNames[items.playlistNames.length]="blacklist";
		}		
		document.getElementById('resultText').value = GetJSONExportString(items.playlists,items.playlistNames);
		console.log("Exporting..");
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

function CopyToClipboard(){
	document.getElementById('resultText').select();
	try {
    var successful = document.execCommand('copy');
	if(successful){WriteMessage("Copied export to clipboard.");}
	else{WriteMessage('Unable to copy',false);}
	} catch (err) {
		WriteMessage('Unable to copy',false);
	}
}


newplaylists=[];
newplaylistIDs=[];
newplaylistNames=[];

function ImportSelected(){ //checks for conflicting names 
	target=document.getElementById('importHandler');importlists = target.children;
	newplaylists = [];
	doubleNames=[];arrnames=[];
	chrome.storage.local.get({playlists:[],playlistIDs:[],blacklist:[],playlistNames:[]},function(items){
		newplaylists=items.playlists;
		newplaylistIDs=items.playlistIDs;
		newplaylistNames=items.playlistNames;
		newblacklist=[];
		console.log(newplaylistNames);
		for(i=0;i<importlists.length-1;i++){ //skip approve button
			if(importlists[i].children[0].checked==true){			
				arrnames[i]=importlists[i].children[2].value;
				console.log(importlists[i].children[2].value);
				if(newplaylistNames.indexOf(importlists[i].children[2].value)>-1){ 				//double list name
					importlists[i].children[1].style.display="none";
					importlists[i].children[2].style.display="inherit";					
					importlists[i].style.backgroundColor="red";					
					WriteMessage("Found conflicting playlistnames, please enter unique and new names for playlists.",false);
					doubleNames[doubleNames.length]=i;
					console.log("Found double name in pos: "+i);
				}				
				else{
					listlength = importlists[i].children[1].getAttribute("listlength");					
					importlists[i].children[1].innerText=importlists[i].children[2].value+": "+listlength+" items.";
					importlists[i].children[2].style.display="none";					
					importlists[i].style.backgroundColor="white";					
					importlists[i].children[1].style.display="inherit";
					importlists[i].style.display="inline";
				}
			}
		}
		console.log(doubleNames);
		if(doubleNames.length==0){		
					 //updates names of arrays
			hasblacklist=false;
			for(i=0;i<arr.length;i++){
				if(arrnames[i].toLocaleLowerCase()=="blacklist"){
					newblacklist = arr[i];
					hasblacklist=true;
				}
				else{
					newplaylists[newplaylists.length]=arr[i];
					//newplaylistIDs=newplaylistIDs.concat(arrnames[i].hashCode());
					//newplaylistNames=newplaylistNames.concat(arrnames[i]);		
					newplaylistNames[newplaylistNames.length] = arrnames[i];
					newplaylistIDs[newplaylistIDs.length] = arrnames[i].hashCode();
					console.log('Added: '+newplaylistNames[newplaylistNames.length-1]+'; length: '+newplaylists[newplaylists.length-1].length+'; hash: '+newplaylistIDs[newplaylistIDs.length-1]);
				}
			}
			chrome.storage.local.set({playlists:newplaylists,playlistIDs:newplaylistIDs,playlistNames:newplaylistNames},function(){});
			
			if(hasblacklist){chrome.storage.local.set({blacklist:newblacklist},function(){});}
			WriteMessage("Playlists imported",true);
		}
	});
	
	//merge playlists to new and sigh..handle blacklist 
	
	return doubleNames;
}

/*function ImportSelected(){	
	console.log("ImportSelected(): "+GetDuplPlaylistNames().length);
	if(GetDuplPlaylistNames().length==0){	
	for(i=0;i<arr.length;i++){
		newplaylists[newplaylists.length]=arr[i];
		newplaylistIDs=newplaylistIDs.concat(arrnames[i].hashCode());
		newplaylistNames=newplaylistNames.concat(arrnames[i]);		
		console.log('Added: '+newplaylistNames[newplaylistNames.length-1]+'; length: '+newplaylists[newplaylists.length-1].length+'; hash: '+newplaylistIDs[newplaylistIDs.length-1]);					
	}
	}
}*/

function FillSideList(arrnames,arr){
	target=document.getElementById('importHandler');
	while (target.firstChild) {target.removeChild(target.firstChild);}	
	for(i=0;i<arrnames.length;i++){
		newRow = document.createElement('span');newRow.style.display="inline";
		txtdiv = document.createElement('div');
		textboxeditname = document.createElement('input');textboxeditname.setAttribute("style","display:none");
		textboxeditname.value=arrnames[i];

		cb=document.createElement('input');	cb.setAttribute('type','checkbox');
		cb.checked=true;
		txtdiv.innerText=arrnames[i] + ": "+arr[i].length+" items.";		
		txtdiv.setAttribute("listlength",arr[i].length);
		txtdiv.style.display="inline";
		newRow.appendChild(cb);newRow.appendChild(txtdiv);newRow.appendChild(textboxeditname);
		newRow.appendChild(document.createElement("br"));			
		
		if(i%2==1){newRow.style.backgroundColor='e5e5e5';}
		target.appendChild(newRow);		
	}	
	b=document.createElement('input');	b.setAttribute('type','button');
	b.setAttribute('value','Approve');
	b.addEventListener('click',ImportSelected);
	target.appendChild(b);	
}	

function runImport(){	
	try{
		if(document.getElementById('resultText').value!=""){
		obj=JSON.parse(document.getElementById('resultText').value);		
		obj2=obj.playlists[0];
		arrnames=Object.keys(obj2);arr=[];
		for(i=0;i<arrnames.length;i++){arr[i]=Object.keys(obj2).map(function(k){return obj2[k]})[i];}
		FillSideList(arrnames,arr);	
		console.log("Detected "+arrnames.length+" playlists.");
		console.log("Name: "+arrnames[0]);
		}
		else{
			target=document.getElementById('importHandler');while (target.firstChild) {target.removeChild(target.firstChild);}	
		}
	}
	catch(e){
		console.log("Couldnt parse. Invalid JSON?");
		target=document.getElementById('importHandler');while (target.firstChild) {target.removeChild(target.firstChild);}	
	}
}

function RunModus(){	
	if(document.getElementById('rImport').checked===true){
		//document.getElementById('resultText').style.width='400px';
		//runImport();		
		document.getElementById('resultText').style.float='left';
		document.getElementById('resultText').cols=72;
		document.getElementById('resultText').style.marginRight='40px';
		document.getElementById('importHandler').style.display='block';
		document.getElementById('importHandler').style.height="400px";			
		runImport();
	}
	else{
		///document.getElementById('resultText').style.width='800px';
		//runExport();		
		document.getElementById('resultText').style.float='none';
		document.getElementById('resultText').style.marginRight='0px';
		document.getElementById('resultText').cols=150;
		document.getElementById('importHandler').style.display='none';
		runExport();
	}
}

function getDateString(d){
	datestr = ("0"+d.getDate()).slice(-2) +"-"+ ("0"+(d.getMonth()+1)).slice(-2)+" "+ 
	("0"+d.getHours()).slice(-2) + ":"+ ("0"+d.getMinutes()).slice(-2) + ":"+ ("0"+d.getSeconds()).slice(-2);	
	//datestr="1:";
	return datestr;
}

showSuggested=1;showDiscoveries=1;showTechnical=1;eventLog=[];
function eventLogBuilder(){
	log = document.getElementById("eventlog");
	while (log.firstChild) {log.removeChild(log.firstChild);}
	for (i=0;i<eventLog.length;i++){
		s=document.createElement("span")
		datestr = getDateString(new Date(eventLog[i][0]));		
		
		content = eventLog[i][1];
		isSuggestion = content.indexOf('Suggested:')==0;
		isTech = content.indexOf('System:')==0;
		isDisc = content.indexOf('*')>0;
		
		if((isSuggestion && showSuggested==1)||(isTech && showTechnical==1)||(isDisc && showDiscoveries==1)){
			s.innerHTML=datestr+" "+eventLog[i][1]+"</br>";
			log.appendChild(s);			
		}
	}
}

function ToggleFilter(){
	el=event.target;	
	clickedbutton = el.innerHTML;
	if(el.getAttribute('ischecked')==0){
		el.setAttribute('ischecked',1);
		el.style.backgroundColor="5c5c5c";
		el.style.color="white";
	}else{
		el.setAttribute('ischecked',0);
		el.style.backgroundColor="white";
		el.style.color="black";
	}	
	if(clickedbutton=='Suggestions'){
		showSuggested=el.getAttribute('ischecked');	
	}
	if(clickedbutton=='Discoveries'){
		showDiscoveries=el.getAttribute('ischecked');			
	}
	if(clickedbutton=='Technical'){
		showTechnical=el.getAttribute('ischecked');		
	}		
	eventLogBuilder();
}

document.addEventListener('DOMContentLoaded', function() {	
	document.getElementById('rExport').checked=true;
	//document.getElementById('btnStart').addEventListener('click', RunModus);
	
	
	document.getElementById('rExport').addEventListener('click', RunModus);
	document.getElementById('rImport').addEventListener('click', RunModus);
	
	document.getElementById('resultText').addEventListener('keyup', RunModus);	

	document.getElementById('resultText').style.float='none';
	document.getElementById('resultText').style.marginRight='0px';
	document.getElementById('importHandler').style.display='none';
	
	fItems = document.getElementsByClassName('filterItem');
	fItems[0].addEventListener('click',ToggleFilter);
	fItems[1].addEventListener('click',ToggleFilter);
	fItems[2].addEventListener('click',ToggleFilter);	
		
	document.getElementById('btnCopy').addEventListener('click',CopyToClipboard);	
		
	runExport();
	chrome.storage.local.get({eventLog:[]}, function(items){
		eventLog = typeof items.eventLog !== 'undefined' ? items.eventLog : [];			
		
		eventLog.reverse();
		eventLogBuilder();
		/*for (i=0;i<eventLog.length;i++){
			console.log("eventlog "+ i +": "+ eventLog[i][0]);
		}*/

		
	});
	fItems[0].click();
	fItems[1].click();
	fItems[2].click();
});