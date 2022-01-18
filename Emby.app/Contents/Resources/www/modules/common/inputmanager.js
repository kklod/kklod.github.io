define(["exports","./../dom.js","./../approuter.js","./playback/playbackmanager.js","./../focusmanager.js"],function(_exports,_dom,_approuter,_playbackmanager,_focusmanager){Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_dom=babelHelpers.interopRequireDefault(_dom),_approuter=babelHelpers.interopRequireDefault(_approuter),_playbackmanager=babelHelpers.interopRequireDefault(_playbackmanager),_focusmanager=babelHelpers.interopRequireDefault(_focusmanager);var lastInputTime=Date.now();function notify(){lastInputTime=Date.now(),handleCommand("unknown")}var commandTimes={};function handleCommand(name,options){lastInputTime=Date.now();var tagName,sourceElement=options?options.sourceElement:null;(sourceElement=sourceElement||document.activeElement)&&"BODY"!==(tagName=sourceElement.tagName)&&"HTML"!==tagName||(sourceElement=_focusmanager.default.getCurrentScope());var command,last,now,customEvent=new CustomEvent("command",{detail:{command:name},bubbles:!0,cancelable:!0});if(!sourceElement.dispatchEvent(customEvent))return!0;switch(name){case"up":return _focusmanager.default.moveUp(sourceElement),!0;case"down":return _focusmanager.default.moveDown(sourceElement),!0;case"left":return _focusmanager.default.moveLeft(sourceElement),!0;case"right":return _focusmanager.default.moveRight(sourceElement),!0;case"home":return _approuter.default.goHome(),!0;case"settings":return _approuter.default.showSettings(),!0;case"back":return _approuter.default.back(),!0;case"forward":return!0;case"select":return sourceElement.click(),!0;case"menu":case"info":return!0;case"nextchapter":return _playbackmanager.default.nextChapter(),!0;case"next":case"nexttrack":return _playbackmanager.default.nextTrack(),!0;case"previous":case"previoustrack":return _playbackmanager.default.previousTrack(),!0;case"previouschapter":return _playbackmanager.default.previousChapter(),!0;case"guide":return _approuter.default.showGuide(),!0;case"recordedtv":return _approuter.default.showRecordedTV(),!0;case"record":return!0;case"livetv":return _approuter.default.showLiveTV(),!0;case"mute":return _playbackmanager.default.setMute(!0),!0;case"unmute":return _playbackmanager.default.setMute(!1),!0;case"togglemute":return _playbackmanager.default.toggleMute(),!0;case"channelup":return _playbackmanager.default.channelUp(),!0;case"channeldown":return _playbackmanager.default.channelDown(),!0;case"volumedown":return _playbackmanager.default.volumeDown(),!0;case"volumeup":return _playbackmanager.default.volumeUp(),!0;case"play":return _playbackmanager.default.unpause(),!0;case"pause":return _playbackmanager.default.pause(),!0;case"playpause":return _playbackmanager.default.playPause(),!0;case"stop":return last=commandTimes[command="stop"]||0,(now=Date.now())-last<1e3||(commandTimes[command]=now,!1)||_playbackmanager.default.stop(),!0;case"changezoom":return _playbackmanager.default.toggleAspectRatio(),!0;case"changeaudiotrack":return _playbackmanager.default.changeAudioStream(),!0;case"changesubtitletrack":return _playbackmanager.default.changeSubtitleStream(),!0;case"search":return _approuter.default.showSearch(),!0;case"favorites":return _approuter.default.showFavorites(),!0;case"fastforward":return _playbackmanager.default.fastForward(),!0;case"rewind":return _playbackmanager.default.rewind(),!0;case"togglefullscreen":return _playbackmanager.default.toggleFullscreen(),!0;case"disabledisplaymirror":return _playbackmanager.default.enableDisplayMirroring(!1),!0;case"enabledisplaymirror":return _playbackmanager.default.enableDisplayMirroring(!0),!0;case"toggledisplaymirror":return _playbackmanager.default.toggleDisplayMirroring(),!0;case"togglestats":return!0;case"movies":case"music":case"tv":return _approuter.default.goHome(),!0;case"nowplaying":return _approuter.default.showNowPlaying(),!0;case"save":case"screensaver":case"refresh":case"changebrightness":case"red":case"green":case"yellow":case"blue":case"grey":case"brown":return!0;case"repeatnone":return _playbackmanager.default.setRepeatMode("RepeatNone"),!0;case"repeatall":return _playbackmanager.default.setRepeatMode("RepeatAll"),!0;case"repeatone":return _playbackmanager.default.setRepeatMode("RepeatOne"),!0;default:return!1}}_dom.default.addEventListener(document,"click",notify,{passive:!0});var _default={trigger:handleCommand,handle:handleCommand,notify:notify,notifyMouseMove:function(){lastInputTime=Date.now()},idleTime:function(){return Date.now()-lastInputTime},on:function(scope,fn){_dom.default.addEventListener(scope,"command",fn,{})},off:function(scope,fn){_dom.default.removeEventListener(scope,"command",fn,{})}};_exports.default=_default});