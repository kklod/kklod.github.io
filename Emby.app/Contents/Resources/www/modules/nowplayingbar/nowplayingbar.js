define(["cardBuilder","require","globalize","datetime","itemHelper","events","layoutManager","playbackManager","apphost","dom","connectionManager","itemShortcuts","emby-ratingbutton","paper-icon-button-light"],function(cardBuilder,require,globalize,datetime,itemHelper,events,layoutManager,playbackManager,appHost,dom,connectionManager,itemShortcuts,EmbyRatingButton){"use strict";var currentPlayer,currentTimeElement,nowPlayingImageElement,nowPlayingTextElement,nowPlayingBarFavoriteButton,muteButton,volumeSlider,volumeSliderContainer,playPauseButtons,positionSlider,toggleRepeatButton,toggleRepeatButtonIcon,isEnabled,currentPlayerSupportedCommands=[],lastUpdateTime=0,lastPlayerState={},currentRuntimeTicks=0,isVisibilityAllowed=!0;function onSlideDownComplete(e){e.target===e.currentTarget&&this.classList.contains("nowPlayingBar-hidden")&&this.classList.add("hide")}function slideUp(elem){elem.classList.remove("hide"),elem.offsetWidth,elem.classList.remove("nowPlayingBar-hidden")}function onPlayPauseClick(){playbackManager.playPause(currentPlayer)}var nowPlayingBarElement,currentImgUrl,currentItemId,dragCounter=0;function onDragEnter(e){e.dataTransfer.dropEffect="copy";var data=window.CurrentDragInfo,item=data?data.item:null;item&&playbackManager.canQueue(item)&&(this.classList.add("nowPlayingBar-dragging-over"),dragCounter++)}function onDragOver(e){e.dataTransfer.dropEffect="copy";var data=window.CurrentDragInfo,item=data?data.item:null;item&&playbackManager.canQueue(item)&&e.preventDefault()}function onDragLeave(e){var data=window.CurrentDragInfo,item=data?data.item:null;item&&playbackManager.canQueue(item)&&0===--dragCounter&&this.classList.remove("nowPlayingBar-dragging-over")}function onDragEnd(e){this.classList.remove("nowPlayingBar-dragging-over")}function onItemFetchedForQueue(item){var text;playbackManager.canQueue(item)&&(playbackManager.queue({items:[item]}),text={text:globalize.translate("HeaderAddedToPlayQueue"),icon:"playlist_add"},require(["toast"],function(toast){toast(text)}))}function onDrop(e){dragCounter=0,e.preventDefault(),this.classList.remove("nowPlayingBar-dragging-over");var apiClient,data=window.CurrentDragInfo,item=data?data.item:null;item.ServerId&&item.Id&&(apiClient=connectionManager.getApiClient(item)).getItem(apiClient.getCurrentUserId(),item.Id).then(onItemFetchedForQueue)}function showRemoteControl(){require(["appRouter"],function(appRouter){appRouter.showNowPlaying()})}function getNowPlayingBar(){return nowPlayingBarElement?Promise.resolve(nowPlayingBarElement):require(["appFooter-shared","css!./nowplayingbar.css","emby-slider"]).then(function(responses){var html,parentContainer=responses[0].element;return(nowPlayingBarElement=parentContainer.querySelector(".nowPlayingBar"))||(parentContainer.insertAdjacentHTML("afterbegin",(html="",html+='<div class="nowPlayingBar hide nowPlayingBar-hidden">',html+='<div class="nowPlayingBarTop">',html+='<div class="nowPlayingBarPositionContainer sliderContainer">',html+='<input type="range" is="emby-slider" pin step=".01" min="0" max="100" value="0" class="slider-medium-thumb nowPlayingBarPositionSlider" tabindex="-1" />',html+="</div>",html+='<div class="nowPlayingBarInfoContainer">',html+='<div class="nowPlayingBarImage" loading="lazy"></div>',html+='<div class="nowPlayingBarText"></div>',html+="</div>",html+='<div class="nowPlayingBarCenter">',html+='<button is="paper-icon-button-light" class="previousTrackButton mediaButton"><i class="md-icon">&#xE045;</i></button>',html+='<button is="paper-icon-button-light" class="playPauseButton mediaButton"><i class="md-icon">&#xE034;</i></button>',html+='<button is="paper-icon-button-light" class="stopButton mediaButton"><i class="md-icon">stop</i></button>',html+='<button is="paper-icon-button-light" class="nextTrackButton mediaButton"><i class="md-icon">&#xE044;</i></button>',html+='<div class="nowPlayingBarCurrentTime"></div>',html+="</div>",html+='<div class="nowPlayingBarRight">',html+='<button is="paper-icon-button-light" class="muteButton mediaButton hide"><i class="md-icon">&#xE050;</i></button>',html+='<div class="sliderContainer nowPlayingBarVolumeSliderContainer hide" style="width:100px;vertical-align:middle;display:inline-flex;">',html+='<input type="range" is="emby-slider" pin step="1" min="0" max="100" value="0" class="slider-medium-thumb nowPlayingBarVolumeSlider" tabindex="-1" />',html+="</div>",html+='<button is="paper-icon-button-light" class="toggleRepeatButton mediaButton"><i class="md-icon">&#xE040;</i></button>',html+='<button is="emby-ratingbutton" type="button" class="nowPlayingBarFavoriteButton listItemButton paper-icon-button-light"><i class="md-icon">&#xE87D;</i></button>',html+='<button is="paper-icon-button-light" class="playPauseButton playPauseButton-right mediaButton"><i class="md-icon">&#xE034;</i></button>',html+='<button is="paper-icon-button-light" class="remoteControlButton mediaButton"><i class="md-icon">&#xE05F;</i></button>',html+="</div>",html+="</div>",html+='<div class="nowPlayingBarDropOverlay">',html+='<h3 style="margin:0;"><i class="md-icon" style="margin-right:.5em;font-size:150%;">playlist_add</i>'+globalize.translate("HeaderAddToPlayQueue")+"</h3>",html+="</div>",html+="</div>")),nowPlayingBarElement=parentContainer.querySelector(".nowPlayingBar"),itemShortcuts.on(nowPlayingBarElement),function(elem){var i,length;for(dom.addEventListener(elem,dom.whichTransitionEvent(),onSlideDownComplete,{passive:!0}),currentTimeElement=elem.querySelector(".nowPlayingBarCurrentTime"),nowPlayingImageElement=elem.querySelector(".nowPlayingBarImage"),nowPlayingTextElement=elem.querySelector(".nowPlayingBarText"),nowPlayingBarFavoriteButton=elem.querySelector(".nowPlayingBarFavoriteButton"),(muteButton=elem.querySelector(".muteButton")).addEventListener("click",function(){currentPlayer&&playbackManager.toggleMute(currentPlayer)}),elem.querySelector(".stopButton").addEventListener("click",function(){currentPlayer&&playbackManager.stop(currentPlayer)}),i=0,length=(playPauseButtons=elem.querySelectorAll(".playPauseButton")).length;i<length;i++)playPauseButtons[i].addEventListener("click",onPlayPauseClick);elem.querySelector(".nextTrackButton").addEventListener("click",function(){currentPlayer&&playbackManager.nextTrack(currentPlayer)}),elem.querySelector(".previousTrackButton").addEventListener("click",function(){currentPlayer&&playbackManager.previousTrack(currentPlayer)}),elem.querySelector(".remoteControlButton").addEventListener("click",showRemoteControl),(toggleRepeatButton=elem.querySelector(".toggleRepeatButton")).addEventListener("click",function(){if(currentPlayer)switch(playbackManager.getRepeatMode(currentPlayer)){case"RepeatAll":playbackManager.setRepeatMode("RepeatOne",currentPlayer);break;case"RepeatOne":playbackManager.setRepeatMode("RepeatNone",currentPlayer);break;default:playbackManager.setRepeatMode("RepeatAll",currentPlayer)}}),toggleRepeatButtonIcon=toggleRepeatButton.querySelector("i"),volumeSlider=elem.querySelector(".nowPlayingBarVolumeSlider"),volumeSliderContainer=elem.querySelector(".nowPlayingBarVolumeSliderContainer"),volumeSlider.addEventListener("change",function(){currentPlayer&&currentPlayer.setVolume(this.value)}),(positionSlider=elem.querySelector(".nowPlayingBarPositionSlider")).addEventListener("change",function(){var newPercent;currentPlayer&&(newPercent=parseFloat(this.value),playbackManager.seekPercent(newPercent,currentPlayer))}),positionSlider.getBubbleText=function(value){if(!lastPlayerState||!lastPlayerState.NowPlayingItem||!currentRuntimeTicks)return"--:--";var ticks=currentRuntimeTicks;return ticks/=100,ticks*=value,datetime.getDisplayRunningTime(ticks)},elem.addEventListener("click",function(e){e.target.closest("BUTTON,INPUT,A")||showRemoteControl()}),elem.addEventListener("dragover",onDragOver),elem.addEventListener("dragend",onDragEnd),elem.addEventListener("dragenter",onDragEnter),elem.addEventListener("dragleave",onDragLeave),elem.addEventListener("drop",onDrop)}(nowPlayingBarElement)),Promise.resolve(nowPlayingBarElement)})}function updatePlayPauseState(isPaused){var i,length;if(playPauseButtons)if(isPaused)for(i=0,length=playPauseButtons.length;i<length;i++)playPauseButtons[i].querySelector("i").innerHTML="play_arrow";else for(i=0,length=playPauseButtons.length;i<length;i++)playPauseButtons[i].querySelector("i").innerHTML="pause"}function updatePlayerStateInternal(event,state,player){!function(){if(!isVisibilityAllowed)return hideNowPlayingBar();getNowPlayingBar().then(slideUp)}(),lastPlayerState=state;var playerInfo=playbackManager.getPlayerInfo(player),playState=state.PlayState||{};updatePlayPauseState(playState.IsPaused);var isProgressClear,supportedCommands=playerInfo.supportedCommands||[];(currentPlayerSupportedCommands=supportedCommands).includes("SetRepeatMode")?toggleRepeatButton.classList.add("hide"):toggleRepeatButton.classList.remove("hide"),updateRepeatModeDisplay(playState.RepeatMode),updatePlayerVolumeState(playState.IsMuted,playState.VolumeLevel),positionSlider&&!positionSlider.dragging&&(positionSlider.disabled=!playState.CanSeek,isProgressClear=state.MediaSource&&null==state.MediaSource.RunTimeTicks,positionSlider.setIsClear(isProgressClear));var nowPlayingItem=state.NowPlayingItem||{};updateTimeDisplay(playState.PositionTicks,nowPlayingItem.RunTimeTicks,playbackManager.getBufferedRanges(player)),function(state){var nowPlayingItem=state.NowPlayingItem,textLines=nowPlayingItem?function(nowPlayingItem,includeNonNameInfo){var topItem=nowPlayingItem,bottomItem=null,topText=nowPlayingItem.Name;nowPlayingItem.AlbumId&&"Audio"===nowPlayingItem.MediaType&&(topItem={Id:nowPlayingItem.AlbumId,Name:nowPlayingItem.Album,Type:"MusicAlbum",IsFolder:!0});"Video"===nowPlayingItem.MediaType&&(null!=nowPlayingItem.IndexNumber&&(topText=nowPlayingItem.IndexNumber+" - "+topText),null!=nowPlayingItem.ParentIndexNumber&&(topText=nowPlayingItem.ParentIndexNumber+"."+topText));var bottomText="";nowPlayingItem.ArtistItems&&nowPlayingItem.ArtistItems.length?(bottomItem={Id:nowPlayingItem.ArtistItems[0].Id,Name:nowPlayingItem.ArtistItems[0].Name,Type:"MusicArtist",IsFolder:!0},bottomText=nowPlayingItem.ArtistItems.map(function(a){return a.Name}).join(", ")):nowPlayingItem.SeriesName||nowPlayingItem.Album?(bottomText=topText,topText=nowPlayingItem.SeriesName||nowPlayingItem.Album,bottomItem=topItem,topItem=nowPlayingItem.SeriesId?{Id:nowPlayingItem.SeriesId,Name:nowPlayingItem.SeriesName,Type:"Series",IsFolder:!0}:null):nowPlayingItem.ProductionYear&&!1!==includeNonNameInfo&&(bottomText=nowPlayingItem.ProductionYear);var list=[];list.push({text:topText,item:topItem}),bottomText&&list.push({text:bottomText,item:bottomItem});return list}(nowPlayingItem):[];1<textLines.length&&(textLines[1].secondary=!0);var serverId=nowPlayingItem?nowPlayingItem.ServerId:null;nowPlayingTextElement.innerHTML=textLines.map(function(nowPlayingName){var cssClass=nowPlayingName.secondary?' class="secondaryText"':"";return nowPlayingName.item?"<div"+cssClass+">"+function(item,text,serverId){text=text||itemHelper.getDisplayName(item);var html="<button "+itemShortcuts.getShortcutAttributesHtml(item,{serverId:serverId})+' type="button" class="itemAction button-link button-inherit-color" data-action="link" is="emby-button">';return html+=text,html+="</button>"}(nowPlayingName.item,nowPlayingName.text,serverId)+"</div>":"<div"+cssClass+">"+nowPlayingName.text+"</div>"}).join("");var urlInfo=nowPlayingItem?function(item,options){if(!item)throw new Error("item cannot be null!");if("Episode"!==item.Type)return null;if((options=options||{}).type=options.type||"Primary","Primary"===options.type&&item.SeriesPrimaryImageTag)return options.tag=item.SeriesPrimaryImageTag,{url:connectionManager.getApiClient(item).getImageUrl(item.SeriesId,options),aspect:"2/3"};if("Thumb"===options.type&&item.ParentThumbImageTag)return options.tag=item.ParentThumbImageTag,{url:connectionManager.getApiClient(item).getImageUrl(item.ParentThumbItemId,options),aspect:"16/9"};return null}(nowPlayingItem,{height:70})||function(item,options){if(!item)throw new Error("item cannot be null!");if((options=options||{}).type=options.type||"Primary",item.ImageTags&&item.ImageTags[options.type])return options.tag=item.ImageTags[options.type],{url:connectionManager.getApiClient(item).getImageUrl(item.PrimaryImageItemId||item.Id,options),aspect:item.PrimaryImageAspectRatio?item.PrimaryImageAspectRatio.toString():"1"};if(item.AlbumId&&item.AlbumPrimaryImageTag)return options.tag=item.AlbumPrimaryImageTag,{url:connectionManager.getApiClient(item).getImageUrl(item.AlbumId,options),aspect:"1"};return null}(nowPlayingItem,{height:70}):null,url=urlInfo?urlInfo.url:null;url!==currentImgUrl&&((currentImgUrl=url)?(nowPlayingImageElement.style["aspect-ratio"]=urlInfo.aspect,nowPlayingImageElement.style.backgroundImage="url('"+url+"')",nowPlayingImageElement.classList.remove("defaultCardBackground","defaultCardBackground0"),nowPlayingImageElement.innerHTML=""):(nowPlayingImageElement.style.backgroundImage="",nowPlayingImageElement.style["aspect-ratio"]="1",nowPlayingImageElement.classList.add("defaultCardBackground","defaultCardBackground0"),nowPlayingImageElement.innerHTML='<i class="md-icon nowPlayingBarDefaultItemIcon">'+cardBuilder.getDefaultIcon(nowPlayingItem)+"</i>"));{var apiClient;nowPlayingItem.Id?currentItemId!==nowPlayingItem.Id&&(currentItemId=nowPlayingItem.Id,(apiClient=connectionManager.getApiClient(nowPlayingItem.ServerId)).getItem(apiClient.getCurrentUserId(),nowPlayingItem.Id).then(function(item){nowPlayingBarFavoriteButton.setItem(item),nowPlayingBarFavoriteButton.classList.remove("hide")})):(currentItemId=null,nowPlayingBarFavoriteButton.classList.add("hide"),nowPlayingBarFavoriteButton.setItem(null))}}(state)}function updateRepeatModeDisplay(repeatMode){"RepeatAll"===repeatMode?(toggleRepeatButtonIcon.innerHTML="repeat",toggleRepeatButton.classList.add("repeatButton-active")):"RepeatOne"===repeatMode?(toggleRepeatButtonIcon.innerHTML="repeat_one",toggleRepeatButton.classList.add("repeatButton-active")):(toggleRepeatButtonIcon.innerHTML="repeat",toggleRepeatButton.classList.remove("repeatButton-active"))}function updateTimeDisplay(positionTicks,runtimeTicks,bufferedRanges){var pct,timeText;positionSlider&&!positionSlider.dragging&&(runtimeTicks?(pct=positionTicks/runtimeTicks,pct*=100,positionSlider.value=pct):positionSlider.value=0),positionSlider&&!runtimeTicks&&positionSlider.setBufferedRanges(bufferedRanges,runtimeTicks,positionTicks),currentTimeElement&&(timeText=null==positionTicks?"--:--":datetime.getDisplayRunningTime(positionTicks),runtimeTicks&&(timeText+=" / "+datetime.getDisplayRunningTime(runtimeTicks)),currentTimeElement.innerHTML=timeText)}function updatePlayerVolumeState(isMuted,volumeLevel){var supportedCommands=currentPlayerSupportedCommands,showMuteButton=!0,showVolumeSlider=!0;-1===supportedCommands.indexOf("ToggleMute")&&(showMuteButton=!1),muteButton.querySelector("i").innerHTML=isMuted?"&#xE04F;":"&#xE050;",-1===supportedCommands.indexOf("SetVolume")&&(showVolumeSlider=!1),showMuteButton?muteButton.classList.remove("hide"):muteButton.classList.add("hide"),volumeSlider&&(showVolumeSlider?volumeSliderContainer.classList.remove("hide"):volumeSliderContainer.classList.add("hide"),volumeSlider.dragging||(volumeSlider.value=volumeLevel||0))}function onPlaybackStart(e,state){onStateChanged.call(this,e,state)}function onRepeatModeChange(e){isEnabled&&updateRepeatModeDisplay(playbackManager.getRepeatMode(this))}function hideNowPlayingBar(){isEnabled=!1;nowPlayingBarElement&&function(elem){elem.offsetWidth,elem.classList.add("nowPlayingBar-hidden")}(nowPlayingBarElement)}function onPlaybackStopped(e,state){this.isLocalPlayer?"Audio"!==state.NextMediaType&&hideNowPlayingBar():state.NextMediaType||hideNowPlayingBar()}function onPlayPauseStateChanged(e){isEnabled&&updatePlayPauseState(this.paused())}function onStateChanged(event,state){var player=this;state.IsBackgroundPlayback||!state.NowPlayingItem||layoutManager.tv||player.isLocalPlayer&&state.NowPlayingItem&&"Audio"!==state.NowPlayingItem.MediaType?hideNowPlayingBar():(isEnabled=!0,nowPlayingBarElement?updatePlayerStateInternal(0,state,player):getNowPlayingBar().then(function(){updatePlayerStateInternal(0,state,player)}))}function onTimeUpdate(e){var now;isEnabled&&((now=Date.now())-lastUpdateTime<700||(lastUpdateTime=now,currentRuntimeTicks=playbackManager.duration(this),updateTimeDisplay(playbackManager.currentTime(this),currentRuntimeTicks,playbackManager.getBufferedRanges(this))))}function onVolumeChanged(e){isEnabled&&updatePlayerVolumeState(this.isMuted(),this.getVolume())}function refreshFromPlayer(player){var state=playbackManager.getPlayerState(player);onStateChanged.call(player,{type:"init"},state)}function bindToPlayer(player){player!==currentPlayer&&(function(){var player=currentPlayer;player&&(events.off(player,"playbackstart",onPlaybackStart),events.off(player,"statechange",onPlaybackStart),events.off(player,"repeatmodechange",onRepeatModeChange),events.off(player,"playbackstop",onPlaybackStopped),events.off(player,"volumechange",onVolumeChanged),events.off(player,"pause",onPlayPauseStateChanged),events.off(player,"unpause",onPlayPauseStateChanged),events.off(player,"timeupdate",onTimeUpdate),currentPlayer=null,hideNowPlayingBar())}(),(currentPlayer=player)&&(refreshFromPlayer(player),events.on(player,"playbackstart",onPlaybackStart),events.on(player,"statechange",onPlaybackStart),events.on(player,"repeatmodechange",onRepeatModeChange),events.on(player,"playbackstop",onPlaybackStopped),events.on(player,"volumechange",onVolumeChanged),events.on(player,"pause",onPlayPauseStateChanged),events.on(player,"unpause",onPlayPauseStateChanged),events.on(player,"timeupdate",onTimeUpdate)))}events.on(playbackManager,"playerchange",function(e,player){bindToPlayer(player)}),bindToPlayer(playbackManager.getCurrentPlayer()),document.addEventListener("viewbeforeshow",function(e){!1===e.detail.enableMediaControl?isVisibilityAllowed&&(isVisibilityAllowed=!1,hideNowPlayingBar()):isVisibilityAllowed||(isVisibilityAllowed=!0,currentPlayer?refreshFromPlayer(currentPlayer):hideNowPlayingBar())})});