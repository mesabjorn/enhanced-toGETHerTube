function responseJson(response) {
  if (!response.ok)
    throw new Error(response.status + " " + response.statusText);
  return response.json();
}

async function GetLists() {
  return new Promise((resolve, rejects) => {
    fetch(chrome.runtime.getURL("./playlists/jsonlist_youtubeid.json")).then(
      (resp) => {
        console.log("Parsing json");
        responseJson(resp).then((d) => {
          //   console.log(d);
          resolve(d);
        });
      }
    );
  });
}

class CytubePlayer {
  constructor() {
    this.tracks = [];
    GetLists().then((d) => {
      this.tracks = d;
      console.log(`Loaded playlist with ${this.tracks.length} track(s).`);
    });

    this.PLAYMODES = {
      SHUFFLE:0,
      REPEAT_ONE:1,
      REPEAT_ALL:2
    }
	
	  this.rng = new RNG(new Date().getMilliseconds()); // set up rng

    this.isPlaying=true;

    this.trackind = 0;
    this.playmode = this.PLAYMODES.REPEAT_ALL;
    this.vid = document.getElementById("videowrap");

    //mode = yt search
    this.searchbar = document.getElementById("library_query"); 		//get the search bar for yt
    this.searchbutton = document.getElementById("youtube_search");

    //mode = direct url search
    this.urlsearch = document.getElementById("mediaurl");
    this.urlsearchbutton = document.getElementById("queue_end");

    this.prevPlaylistLength = parseInt(document.getElementById("plcount").innerText.replace(" items", ""));
    this.AddPlaylistObserver();

    this.AddButtons();
    this.DecentLayout();
    this.AddChatObserver();
    this.AddQueueFail();

    this.options = { allowChatCommands: true, minimumListLength:10 };
    this.LastCommandDate = new Date();
    this.LastCommandDate.setSeconds(this.LastCommandDate.getSeconds() - 10);

    this.versionString = "v2.0";
  }

  DecentLayout() {
    document.getElementById("main").childNodes[0].className =
      "col-lg-9 col-md-5";
    document.getElementById("playlistrow").childNodes[0].className =
      "col-lg-9 col-md-5";

    // start side-by-side setup
    let pllist = document.getElementById("playlistrow");
    let main = document.getElementById("main");
    let chat = document.getElementById("chatwrap");

    pllist.className = "col-lg-6";
    chat.className = "col-lg-6";
    $("#rightpane").attr("class", "col");
    $("#leftpane").attr("class", "col");

    main.insertBefore(pllist, main.childNodes[0]);

    document.getElementById("messagebuffer").style.height = "500px";
    document.getElementById("userlist").style.height = "500px";
    document
      .getElementById("mainpage")
      .insertBefore(
        document.getElementById("controlsrow"),
        document.getElementById("mainpage").childNodes[0]
      );
    // end side-by-side setup

    $("#controlsrow").insertAfter($(".container-fluid"));
    $("#currenttitle").insertBefore($(".container-fluid"));
    $("#videowrap").insertBefore($("#resizewrap"));
  }

  AddPlaylistObserver() {
    let parent = this;
    let target = document.getElementById("plcount");
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        //console.log(m);
        if (m.removedNodes.length > 0) {
          this.prevPlaylistLength = parseInt(
            m.removedNodes[0].nodeValue.replace(" items", "")
          );
        }
        if (m.addedNodes.length > 0) {
          let currentPlaylistLength = parseInt(
            m.addedNodes[0].nodeValue.replace(" items", "")
          );
          //console.log({currentPlaylistLength:currentPlaylistLength,prevListLength:parent.prevPlaylistLength})

          if (
            currentPlaylistLength < parent.prevPlaylistLength ||
            currentPlaylistLength == 0
          ) {
            console.log("Observed playlist reduction!");
            setTimeout(() => {
              //AddDummyChatMessage("Now Playing: "+GetCurrentPlayingTrack());
              //if(options.EnableScrobbling){ScrobbleTrack(GetCurrentPlayingTrack());}
              this.AddSong();
            }, 2000);
          }
        }
      });
    });
    let observerConfig = { childList: true };
    observer.observe(target, observerConfig);
  }
  
  AddQueueFail(){
    let queuefail = document.getElementById("queuefail");
    let parent = this;
	  let observer = new MutationObserver((mutations) => {
		mutations.forEach((m) => {
			if(m.addedNodes.length > 0) {
        console.log({mnodetype:m.addedNodes[0].nodeType});
        
        if(m.addedNodes[0].nodeType==3){//text node
          console.log({nodeinnertext:m.addedNodes[0].innerText});
          parent.AddSong();
        }
        else if(m.addedNodes[0].nodeType==1){          
          if(m.addedNodes[0].className.indexOf("qf-alert-danger")>-1||m.addedNodes[0].className.indexOf("label-danger")>-1){
            console.log("Song adding errored!"+m.addedNodes[0].className);
            parent.AddSong();
          }
        }
			}
		});
	  });
	  let observerConfig = { childList: true,subtree:true};
      observer.observe(queuefail, observerConfig);
  }
  
  getRandomTrack() {
    if (this.tracks.length == 0) return;
    //return Math.floor(Math.random() * this.tracks.length);
	  return this.rng.choice(this.tracks);	
  }

  setIsPlaying(isplaying){
    this.isPlaying = isplaying;
  } 

  AddSong() {	
    if(parseInt(document.getElementById("plcount").innerText.replace(" items", ""))>=this.options.minimumListLength){return;}
    
    if(this.isPlaying){
      let randTrack = this.tracks[this.getRandomTrack()];
      if(this.playmode==this.PLAYMODES.REPEAT_ALL){
        randTrack = this.tracks[this.trackind];
        this.trackind +=1;
        if(this.trackind==this.tracks.length){
          this.trackind=0;
        }
      }
      this.urlsearch.value = `https://www.youtube.com/watch?v=${randTrack.id}`;
      this.urlsearchbutton.click();
      console.log(`Added: "${randTrack.name}"`);      
    }
  }

  handleCommand(commandIndex) {
    if (this.options.allowChatCommands) {
      switch (commandIndex) {
        case 0: // /?
          this.SubmitAChatMessage(
            "[Geth]: Monitored by " + this.versionString + "."
          );
          //console.log("switched on commandind: "+ commandIndex);
          break;
        case 1: // /help
          this.SubmitAChatMessage(
            "[Geth]: Monitored by " +
              this.versionString +
              ". Allowed commands: /?, /help, and /new"
          );
          break;
        case 2: // /progress
          //SubmitAChatMessage('[Geth]: Playing playlist "'+playlist.name+'" of which '+playlist.logarray.length+ ' of '+tracks.length+ ' tracks have been suggested.');
          break;
        case 3: // /nuke
          //HandleNuke();
          //ToggleUserSuggest(false);
          break;
        case 4: // /new
          let offset = Math.round(Math.random() * 10);
          this.SubmitAChatMessage(
            `[Geth]: Recently added to playlist: ${unescape(
              this.tracks[this.tracks.length - 1 - offset].listname
            )}.`
          );
          break;
        case 5: // /shuffle, shuffles songs without broadcaster's vote
          //SubmitAChatMessage("[Geth]: Shuffling playlist.");
          //document.getElementById('shuffleplaylist').click();
          //ShufflePlaylist();
          break;
        case 6: // /testnuke, beta
          //HandleNuke();
          //SubmitAChatMessage('[Geth]: Nuking suggestions.');
          break;
        case 7: // /inplaylist
          //TestIfCurrentTrackIsInPlaylist();
          break;
        case 8: // /top500
          //GetTop500Track();
          //if(Math.abs(lastClapDate.getTime() - new Date().getTime())/1000>3600){
          //AddSong("The Dubliners Whiskey in the Jar");
          //		SubmitAChatMessage('[Geth]: Suggesting whiskey in the jar \\o/');
          //	lastClapDate = new Date();
          //}
          break;
        default:
          console.log("unknown command");
      }
      this.LastCommandDate = new Date();
    } else {
      console.log("Chat commands disabled.");
    }
  }

  checkGethCommands(command) {
    let commands = [
      "?",
      "help",
      "progress",
      "nuke",
      "new",
      "shuffle",
      "testnuke",
      "inplaylist",
      "clap",
    ];
    let longestCommand = 10;
    console.log("Checking if '" + command + "'  is a command.");
    if (command.indexOf("/") == 0) {
      command = command.toLowerCase();
      command = command.slice(1, longestCommand + 1); //trim string to prevent injection
      for (let i = 0; i < commands.length; i++) {
        //go through command list
        if (
          commands[i] === command &&
          new Date() - this.LastCommandDate > 3000
        ) {
          //allow commands every 3s
          this.handleCommand(i);
          return;
        }
      }
    }
  }

  replyTo(message) {
    var chatbox = document.getElementById("chatline");
    chatbox.value = message;
    chatbox.focus();
  }

  AddChatObserver() {
    let regexText = /\[(.*?)\] >>/;

    var target = document.getElementById("messagebuffer");
    var parent = this;
    var observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.addedNodes.length > 0) {
          if (m.addedNodes[0].className.indexOf("server") > -1) return;
          var msgText = m.addedNodes[0].children[
            m.addedNodes[0].childElementCount - 1
          ].innerText.trim();

          var name = m.addedNodes[0].className.replace("chat-msg-", "");
          name = name.replace(/\$.*\$/, "");
          m.addedNodes[0].style.cursor = "pointer";
          m.addedNodes[0].setAttribute(
            "data-reply",
            `[${name}: ${msgText.replace(regexText, "")}]>>`
          );
          m.addedNodes[0].onclick = (e) => {
            let q = e.target.parentNode;
            if (e.target.className == "username") {
              q = q.parentNode;
            }
            let t = q.getAttribute("data-reply");
            parent.replyTo(t);
          };
          this.checkGethCommands(msgText);
        }
      });
    });
    var observerConfig = { childList: true };
    observer.observe(target, observerConfig);
  }

  SubmitAChatMessage(message) {
    let chatbox = document.getElementById("chatline");
    chatbox.value = message;

    if (!document.getElementById("us-sendbtn").checked) {
      document
        .querySelector("#nav-collapsible > ul > li:nth-child(3) > a")
        .click();
      document
        .querySelector(
          "#useroptions > div.modal-dialog > div > div.modal-header > ul > li.active > a"
        )
        .click();
      document.getElementById("us-sendbtn").checked = true;
      document
        .querySelector(
          "#useroptions > div.modal-dialog > div > div.modal-footer > button.btn.btn-primary"
        )
        .click();
      console.log("added chat btn");
    }
    document.getElementById("chatbtn").click();
  }

  AddDummyChatMessage(message) {
    var d = document.createElement("div");
    d.className = "chat-msg-$voteskip$";

    var s = document.createElement("span");
    s.className = "timestamp server-whisper";
    s.innerText = getHour();

    var s2 = document.createElement("span");
    s2.className = "server-whisper";
    s2.innerText = " " + message;

    d.appendChild(s);
    d.appendChild(s2);

    var m = document.getElementById("messagebuffer");
    m.appendChild(d);

    m.scroll({
      top: m.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }

  AddButtons() {
    var b = document.getElementsByClassName("nav navbar-nav")[0];
    var n = document.createElement("li");
    var a = document.createElement("a");

    a.innerText = "Toggle Video!";
    a.style.cursor = "pointer";
    n.appendChild(a);
    b.appendChild(n);
    n.addEventListener("click", () => {
      let vidstate = this.vid.style.display;
      if (vidstate == "none") {
        this.vid.style.display = "";
      } else if (vidstate == "") {
        this.vid.style.display = "none";
      }
    });

    n = document.createElement("li");
    a = document.createElement("a");
    a.innerText = "Add Song!";
    a.style.cursor = "pointer";

    n.appendChild(a);
    b.appendChild(n);
    n.addEventListener("click", () => {
      this.AddSong();
    });

    n = document.createElement("li");
    a = document.createElement("a");
    a.innerText = "Remove player!";
    a.style.cursor = "pointer";

    n.appendChild(a);
    b.appendChild(n);
    n.addEventListener("click", () => {
      document
        .getElementsByClassName("embed-responsive embed-responsive-16by9")[0]
        .remove();
    });
  }

  GetTrackById(id) {
    return this.tracks.filter((t) => {
      return t.id.indexOf(id) > -1;
    });
  }
}

C = new CytubePlayer();
