var config = {
        apiKey: "AIzaSyBPw5M8xysbk6oJo-9VNh_LpXd_Xhf1Ts0",
        authDomain: "myfirstproject-8ceb7.firebaseapp.com",
        databaseURL: "https://myfirstproject-8ceb7.firebaseio.com",
        storageBucket: "gs://myfirstproject-8ceb7.appspot.com",
        messagingSenderId: "1091552206789"
};
firebase.initializeApp(config);    

function PushVoteToFB(username,direction){
	var voterefstr = 'tt/cursong/votesup/';
	if(direction==-1){
			voterefstr = 'tt/cursong/votesdown/';			
		}	
		var voteref = firebase.database().ref(voterefstr);				
		voteref.once("value").then(function(snapshot) {
			votes = snapshot.val();			
			console.log(votes);
			
			if(votes.indexOf(username)==-1){ //not my vote?
				votes += username+",";			
			}
			else{
				votes = votes.replace(username+',','');			
			}
			console.log(votes);
		updates={};			
		updates[voterefstr] = votes;
		firebase.database().ref().update(updates);
	});
	
}


var cursongref = firebase.database().ref('tt');        
cursongref.on('child_changed', function (snapshot) {          
var post = snapshot.val();
console.log(post);
}); 


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.greeting == "vote"){
		console.log('direction: ',request.direction);		
		PushVoteToFB(request.username,request.direction);
	}
});