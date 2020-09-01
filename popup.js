function renderStatus(statusText, showtime = 750, permanent = false) {
  var status = document.getElementById("status");
  status.textContent = statusText;
  if (!permanent) {
    setTimeout(function () {
      status.textContent = "";
    }, showtime);
  }
}

function toggleSongToChat(toggleChat, tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { greeting: "toggleToChat", toggleToChat: toggleChat },
    function (response) {}
  );
}

function toggleChatCommands(allowChatCommands, tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { greeting: "toggleChatCommands", allowChatCommands: allowChatCommands },
    function (response) {}
  );
}
function toggleDiscoveryMode(discoveryMode, tabId) {
  chrome.tabs.sendMessage(
    tabId,
    { greeting: "toggleDiscoveryMode", discoveryMode: discoveryMode },
    function (response) {}
  );
}

//chrome.tabs.executeScript(tabId, {file: "jquery.js"}); //insert file into tab
function PopulatePlaylistSelector() {


  
  // chrome.storage.local.get(
  //   {
  //     playlists: [],
  //   },
  //   function (items) {
  //     var playlistdropdown = document.querySelector("#playlistselect");
  //     while (playlistdropdown.firstChild) {
  //       playlistdropdown.removeChild(playlistdropdown.firstChild);
  //     } // remove all nodes
  //     moveToIndex = 0;
  //     for (var i = 0; i < items.playlists.length; i++) {
  //       // repopulate list
  //       var optionElement = document.createElement("option");
  //       optionElement.setAttribute("playlistid", items.playlists[i].id);

  //       //if(items.activeList==items.playlists[i]){moveToIndex=i;}

  //       optionElement.innerHTML = items.playlists[i].name;
  //       playlistdropdown.appendChild(optionElement);
  //     }
  //     playlistdropdown.selectedIndex = moveToIndex;
  //     //alert('moved to index: '+items.activeList);
  //     var optionElement = document.createElement("option"); //create last option 'new playlist'
  //     optionElement.setAttribute("playlistid", -1);
  //     optionElement.innerHTML = "Add New";
  //     playlistdropdown.appendChild(optionElement);
  //     if (GoToNew) {
  //       SetTrackLength(items.playlists[items.playlists.length - 1]);
  //       playlistdropdown.selectedIndex = items.playlists.length - 1;
  //       showNewPlaylistScreen(false);
  //     } else {
  //       SetTrackLength(items.playlists[moveToIndex]);
  //     }
  //   }
  // );
}

function SetTrackLength() {
  chrome.storage.local.get(
    {
      playlists: [],
    },
    function (items) {
      document.querySelector("#tracktextinfo").innerText =
        "Playlist length: " +
        items.playlists[document.querySelector("#playlistselect").selectedIndex]
          .tracks.length;
      document.querySelector("#playlisteditingsdiv").style.display = "inherit";
    }
  );
}

function handleOptions(items) {
  if (items == 0) {
    //no updated items?
    chrome.storage.sync.get(
      {
        nightMode: false,
        showVideo: true,
        wideChat: false,
        colorize: false,
        timestamps: false,
        shuffle: false,
        hideThumbs: false,
        minListLength: 10,
        ontheair: false,
        MaxSongLength: 30,
        RunAtStartup: false,
        tToTop: false,
        tToChat: false,
        radioMode: false,
        scrobbling: false,
        pauseWhenAlone: false,
        discoveryMode: false,
        allowChatCommands: false,
        tabId: -1,
      },
      function (items) {
        handleOptions(items);
      }
    );
    return;
  }

  document.querySelector("#cbshuffle").checked = items.shuffle;
  document.querySelector("#txtMinPlaylistLength").value = items.minListLength;
  document.querySelector("#cbTogglePlaysInChat").checked = items.tToChat;

  document.getElementById("cbToggleRunAtStartup").checked = items.RunAtStartup;
  document.getElementById("cbradio").checked = items.radioMode;

  document.getElementById("cbDiscovery").checked = items.discoveryMode;
  document.getElementById("cbChatCommands").checked = items.allowChatCommands;

  if (items.radioMode) {
    document.querySelector("#radiofieldset").style.display = "inherit";
  } else {
    document.querySelector("#radiofieldset").style.display = "none";
  }

  tablist = document.querySelector("#tabselect_list");
  pushToTabId = parseInt(
    tablist.children[tablist.selectedIndex].getAttribute("tabid")
  );
  chrome.tabs.sendMessage(pushToTabId, { greeting: "whatchaplayin" }, function (
    response
  ) {
    if (typeof response.currentlyPlaying != "undefined") {
      //key not entered?
      document.querySelector("#onAirSign").childNodes[0].src =
        "figs/ontheair.png";
    }
  }); //checks playlist id of the tab

  //if(items.ontheair){document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair.png';}
  //else{document.querySelector('#onAirSign').childNodes[0].src = 'figs/ontheair_disabled.png';}

  LastFmImg = document.getElementById("Togglelastfm").children[0];
  if (items.scrobbling) {
    LastFmImg.src = "figs/last-fm-logo.png"; //enable it
  } else {
    LastFmImg.src = "figs/last-fm-logo_disabled.png"; //or disable it
  }

  if (items.tabId != -1) {
    toggleSongToChat(items.tToChat, items.tabId);
    toggleChatCommands(items.allowChatCommands, items.tabId);
    toggleDiscoveryMode(items.discoveryMode, items.tabId);
  }
  //toggleThumbNails(items.hideThumbs,items.tabId);
}

function ToggleLastFmButton() {
  if (
    document
      .getElementById("Togglelastfm")
      .children[0].src.indexOf("last-fm-logo_disabled.png") > -1
  ) {
    //index is >-1 so element shows disabled
    chrome.storage.sync.get({ lastFmKey: [] }, function (items) {
      console.log(typeof items.lastFmKey.key == "undefined");
      if (typeof items.lastFmKey.key == "undefined") {
        //key not entered?
        console.log(typeof items.lastFmKey.key == "undefined");

        renderStatus("Enter last fm details on settings page.", 3000);
        return;
      } else {
        document.getElementById("Togglelastfm").children[0].src =
          "figs/last-fm-logo.png"; //enable it
        save_options();
      }
    });
  } else {
    document.getElementById("Togglelastfm").children[0].src =
      "figs/last-fm-logo_disabled.png"; //or disable it
    save_options();
  }
}

function save_options() {
  var shuffle = document.getElementById("cbshuffle").checked;
  var mListLength = document.getElementById("txtMinPlaylistLength").value;
  var titleToChat = document.getElementById("cbTogglePlaysInChat").checked;

  var startup = document.getElementById("cbToggleRunAtStartup").checked;
  var radioMode = document.getElementById("cbradio").checked;

  var discoveryMode = document.getElementById("cbDiscovery").checked;
  var allowChatCommands = document.getElementById("cbChatCommands").checked;

  if (
    document
      .getElementById("Togglelastfm")
      .children[0].src.indexOf("last-fm-logo_disabled.png") > -1
  ) {
    //index is >-1 so element shows disabled
    //document.getElementById('Togglelastfm').children[0].src = "figs/last-fm-logo.png"; 				//enable it
    scrobble = false;
  } else {
    //document.getElementById('Togglelastfm').children[0].src = "figs/last-fm-logo_disabled.png";		//or disable it
    scrobble = true;
  }
  //console.log('scrobbling (scrobble) is: '+scrobble+' in save_options in popup.js');

  chrome.storage.sync.set(
    {
      tToChat: titleToChat,
      shuffle: shuffle,
      RunAtStartup: startup,
      minListLength: mListLength,
      radioMode: radioMode,
      discoveryMode: discoveryMode,
      scrobbling: scrobble,
      allowChatCommands: allowChatCommands,
    },
    function () {
      //console.log('Scrobbling (scrobble) is: '+scrobble+' is saved in storage');
      renderStatus("Options saved.");
    }
  );
  handleOptions(0); //handle with current settings, to make it realtime
}

function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get(
    {
      shuffle: false,
      minListLength: 10,
      RunAtStartup: false,
      tToChat: false,
      ontheair: false,
      tabId: -1,
      radioMode: false,
      discoveryMode: false,
      scrobbling: false,
      allowChatCommands: false,
    },
    function (items) {
      handleOptions(items);
    }
  );
}

function StartGeth() {
  save_options();
  var selID = document
    .querySelector("#playlistselect")
    .options[playlistselect.selectedIndex].getAttribute("playlistid");
  tablist = document.querySelector("#tabselect_list");
  pushToTabId = parseInt(
    tablist.children[tablist.selectedIndex].getAttribute("tabid")
  );
  //chrome.browserAction.setIcon({path : {"19": "icon.png"}},function(){});
  chrome.storage.sync.get(
    {
      tabId: -1,
    },
    function (items) {
      console.log("pushing to tab: " + pushToTabId);
      //chrome.tabs.sendMessage(pushToTabId, {greeting: "startgeth",playlistid:selID}, function(response){});			//for multitab

      //chrome.storage.local.get({activeList: -1}, function(localitems) {
      //console.log("current List ID: "+ localitems.activeList+"; selID: "+selID);
      /*if(localitems.activeList!=-1 && localitems.activeList!=selID){ //changed to other playlist?
				chrome.tabs.sendMessage(pushToTabId, {greeting: "whatchaplayin"}, function(response){ //checks playlist id of the tab
				console.log("Tab "+pushToTabId+" is playing list with id "+response.currentlyPlaying);
				chrome.tabs.sendMessage(pushToTabId, {greeting: "reset"}, function(response){}); //reset it				
				});
			}
			});*/
      chrome.tabs.sendMessage(
        pushToTabId,
        { greeting: "startgeth", playlistid: selID },
        function (response) {}
      );
      //chrome.storage.local.set({activeList: selID}, function() {});
    }
  );
}

chrome.tabs.query({ url: "*://cytu.be/*" }, function (a) {
  console.log(a);
});

function gettabinfo() {
  chrome.tabs.query(
    {
      url: "*://cytu.be/*",
    },
    function (array_of_Tabs) {
      if (array_of_Tabs.length > 0) {
        var url = array_of_Tabs[0].url;
        var id = array_of_Tabs[0].id;
        chrome.storage.sync.set({ tabId: id }, function () {});
        if (array_of_Tabs.length >= 1) {
          for (i = 0; i < array_of_Tabs.length; i++) {
            tablist = document.querySelector("#tabselect_list");
            var optionElement = document.createElement("option");
            optionElement.setAttribute("tabid", array_of_Tabs[i].id);
            taburl = array_of_Tabs[i].url.split("/");
            roomname = taburl[taburl.length - 1];
            if (roomname.indexOf("?") > -1) {
              roomname = roomname.substr(0, roomname.indexOf("?"));
            }
            optionElement.innerHTML = roomname;
            tablist.appendChild(optionElement);
          }
          //for(i=0;i<array_of_Tabs.length;i++){alert("Found: "+array_of_Tabs.length+" tab(s). url: "+ array_of_Tabs[i].url+"id: "+array_of_Tabs[i].id);}
        }
      } else {
        renderStatus("!No valid tab detected!", 1000, true);
      }
    }
  );
}

function clearLogArray(e) {
  chrome.storage.sync.get(
    {
      tabId: -1,
    },
    function (items) {
      chrome.tabs.sendMessage(items.tabId, { greeting: "reset" }, function (
        response
      ) {}); //reset it
      renderStatus("Cleared logarray!");
    }
  );
}

function controlPlaylist(e) {
  var btnid = e.currentTarget.id;
  chrome.storage.local.get({ playlists: [] }, function (items) {
    var selID = document
      .querySelector("#playlistselect")
      .options[playlistselect.selectedIndex].getAttribute("playlistid");

    switch (btnid) {
      case "editplaylist":
        chrome.tabs.create({ url: "listviewer.html?list=normal&id=" + selID });
        break;
      case "clearplaylist":
        chrome.storage.local.get(
          {
            playlists: [],
          },
          function (items) {
            var newplaylists = items.playlists;
            spliton = -1;
            //console.log("selID: "+selID);
            for (i = 0; i < items.playlists.length; i++) {
              //console.log("checking pl id: "+items.playlistIDs[i]);
              if (selID == items.playlists[i].id) {
                spliton = i;
                removedplaylist = items.playlists[i];
                break;
              }
            }
            //console.log("spliton: "+spliton);
            if (spliton != -1) {
              console.log("Removing playlist: " + removedplaylist.name);
              newplaylists.splice(spliton, 1);
            }
            chrome.storage.local.set({ playlists: newplaylists }, function (
              items
            ) {
              renderStatus('Removed playlist "' + removedplaylist + '".', 1000);
              PopulatePlaylistSelector();
            });
          }
        );
        break;
      case "btnEditBanned":
        chrome.tabs.create({ url: "listviewer.html?list=banned" });
        break;
      default:
        break;
    }
  });
}

String.prototype.hashCode = function () {
  //hashcode for unique playlist indexing
  var hash = 0,
    i,
    chr,
    len;
  if (this.length === 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

function setPlaylist() {
  var tracklist = document.querySelector("#texttracklist").value.trim();
  var playlistname = document.querySelector("#texttracklistname").value.trim();
  if (tracklist == "") {
    renderStatus("List cannot be empty!", 1000);
    return;
  }
  if (playlistname == "") {
    renderStatus("Title cannot be empty!", 1000);
    return;
  }
  var t = [];
  var parts = tracklist.split(",");
  for (i = 0; i < parts.length; i++) {
    if (parts[i].length > 0) {
      if (parts[i].indexOf(",") > -1) {
        alert(parts[i]);
      }
      t[i] = parts[i].replace(/"/g, "").trim(); //remove quotes
    }
  }
  var newplaylist = {
    name: playlistname,
    tracks: t,
    id: playlistname.hashCode(),
    logarray: [],
  };
  console.log(JSON.stringify(newplaylist));
  console.log(newplaylist);
  chrome.storage.local.get(
    {
      playlists: [],
    },
    function (items) {
      //if(chrome.runtime.lastError){alert(chrome.runtime.lastError.message);return;}
      playlists = items.playlists;
      playlists[playlists.length] = newplaylist;

      chrome.storage.local.set({ playlists: playlists }, function () {
        console.log("Added new playlist!");
      });

      renderStatus("Added Playlist with " + t.length + " songs", 1000);
      PopulatePlaylistSelector(true);
      document.querySelector("#texttracklist").value = "";
      document.querySelector("#texttracklistname").value = "";
    }
  );

  /*chrome.storage.local.set({
	tracks: t
	}, function() {
		if(chrome.runtime.lastError){alert(chrome.runtime.lastError.message);return;}	
		renderStatus('Created Playlist of '+t.length+' songs',1000);
		document.querySelector('#tracktextinfo').innerText = 'Playlist length: '+t.length;		
	})*/
}

function UpdatePlaylistSelector(e) {
  var selIndex = e.target.selectedIndex;
  var target = e.target.options[selIndex];
  var selValue = target.innerHTML;
  var plid = target.getAttribute("playlistid");
  showNewPlaylistScreen(plid == -1);
  if (plid != -1) {
    SetTrackLength(plid);
  }
}

function ClickPlaylistSelector(e) {
  var selIndex = e.target.selectedIndex;
  var target = e.target.options[selIndex];
  var selValue = target.innerHTML;
  var plid = target.getAttribute("playlistid");
  showNewPlaylistScreen(plid == -1);
  if (plid != -1) {
    SetTrackLength(plid);
  }
}

function showNewPlaylistScreen(show) {
  if (show) {
    document.querySelector("#playlistaddscreen").style.display = "inherit";
    document.querySelector("#playlisteditingsdiv").style.display = "none";
  } else {
    document.querySelector("#playlistaddscreen").style.display = "none";
    document.querySelector("#playlisteditingsdiv").style.display = "inherit";
  }
}

function OpenSettings() {
  chrome.tabs.create({ url: "settings.html" });
}

document.addEventListener("DOMContentLoaded", function () {
  document
  .querySelector("#settingsIcon")
  .addEventListener("click", OpenSettings);

  return;
  
  document.querySelector("#cbshuffle").addEventListener("change", save_options);

  document
    .querySelector("#cbTogglePlaysInChat")
    .addEventListener("change", save_options);

  document.querySelector("#btnconfirm").addEventListener("click", setPlaylist);
  document.querySelector("#btnStart").addEventListener("click", StartGeth);
  document.querySelector("#tracktextinfo").innerText = "";
  document
    .querySelector("#cbToggleRunAtStartup")
    .addEventListener("change", save_options);
  document.querySelector("#cbradio").addEventListener("change", save_options);

  document
    .querySelector("#cbDiscovery")
    .addEventListener("change", save_options);
  document
    .querySelector("#cbChatCommands")
    .addEventListener("change", save_options);

  document
    .querySelector("#playlistselect")
    .addEventListener("change", UpdatePlaylistSelector);
  document
    .querySelector("#playlistselect")
    .addEventListener("click", ClickPlaylistSelector);
  document
    .querySelector("#editplaylist")
    .addEventListener("click", controlPlaylist);
  document
    .querySelector("#clearplaylist")
    .addEventListener("click", controlPlaylist);

  document
    .querySelector("#btnEditBanned")
    .addEventListener("click", controlPlaylist);
  document
    .querySelector("#btnClearLog")
    .addEventListener("click", clearLogArray);

  document
    .querySelector("#settingsIcon")
    .addEventListener("click", OpenSettings);

  document
    .querySelector("#Togglelastfm")
    .addEventListener("click", ToggleLastFmButton);

  t = document.getElementById("title");
  t.style.float = "left";
  t.style.width = "96%";
  onair = document.getElementById("onAirSign");
  onair.style.float = "left";
  onair.style.width = "80%";

  gettabinfo();
  restore_options();
  PopulatePlaylistSelector();

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    var changedItems = Object.keys(changes);
    for (item of changedItems) {
      restore_options();
      //alert(item + " has changed. Old value: "+changes[item].oldValue+",new value: "+changes[item].newValue);
    }
  });

  var manifestData = chrome.runtime.getManifest();
  document.querySelector("#title").innerText =
    "Cytube Geth v" + manifestData.version;
});
