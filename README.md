# Enhanced-toGETHerTube

## Getting Started
Chrome extension to change visuals and broadcast on cytu.be.com

Current version:  2.00
## Changes:
* 01-09-2020 V2.00
	* Complete overhaul of the radio app and class
	* Now suggesting fixed youtube id's instead of searching for tracks on youtube.
	* Bug fixes
* 22-03-2019 V1.52.3
	* New Reply Functionality added to the chat (Requires Timestamp to be enabled)
	* You can now click on the timestamp to reply to that message
	* Bug fixes
	
* 22-03-2019 V1.52.2
	* Bug fixes and text changes
	* Toggleable night mode
	* Auto-restart for disconnected players (broadcasters only)
	* Pause when you're the only listener (broadcasters only)

* 12-07-2017 V1.52.2
  * Event log now shows what got suggested from what playlist entry
* 08-05-2017 V1.52.1		
  * Fixed colorizer nodes to correct for page changes.


* 28-04-2017 V1.52
  * Chat messages exceeding 250 characters are automatically trimmed and can be expanded by the user by clicking
		on 'more'.
  * Changed colorizer and timestamp code to adapt to the chat changes.
  

* 19-10-2016 V1.51
  * Geth's chat messages no longer wipe text when the user was typing something.
  * Youtube icon of geth suggested songs are red to indicate it was suggested by geth.
  * Added lastfm scrobbling (beta)
  * Updated playlist editor 
    * No longer loads full list in one go, but adds when user scrolls to the bottom
    * Added a search option
  * New commands:
    * /inplaylist: 	checks if current playing track is in playlist.
    * /shuffle: 		pseudo-shuffles queue.
    * /nuke:			removes non-geth suggested tracks then closes suggestions.
			


## Features:

Visual:
 - Show/Hide video (toggleable)
 - Add Colored usernames to chat (toggleable)
 - Add timestamps to messages to chat (toggleable)
 - Add now playing messages to chat (toggleable)
 - Add now playing to top of video (toggleable)
 - Have a compact layout
 - Widen the chat (autohides video) - not compatible with the compact layout!
 - Chat commands. (/?, /last, /nuke, /progress,/nuke,/new',/shuffle',/testnuke,/inplaylist
 - If someone suggests an item on blacklist, suggestions are automatically close for some time (requires permission to change suggestions options).
 - Last fm song discovery (requires last fm api key)
 - Last fm song scrobbling (requires last fm api key/secret)
 - New event page accesible through gear icon 
   - Eventlog showing what the extension did
   - Import/exporting of playlists and blacklist in JSON format
 - Long usernames (trolls) automatically trimmed to 25 characters.
 
Radio:
 - Save and manage playlists and let the radio feature add them automatically.
 - Add a blacklist for videos to be automatically removed (and manage it)
 - Remove songs longer than certain duration automatically
 - Shuffle playlists
 - Start all of these features when joining a togethertube room

To Do:
  - Adding new playlists selection to radio feature :WIP
  - Multi-tab support WIP
 
 
---Enhanced TogetherTube---
Copyright (C) 2015 Mesa

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

"This code contains (modified) code from http://jsfiddle.net/eltorre/h0d4aqcj/"
 //  Colorizer adds some color to togethertube
 //  Copyright (C) 2015 eltorre
 //  This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 3 of the License, or (at your option) any later version.
// This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA

