define(["exports","./../globalize.js","./../../dialog/dialog.js","./../usersettings/usersettings.js","./playbackmanager.js"],function(_exports,_globalize,_dialog,_usersettings,_playbackmanager){function PlayQueueConfirmation(){this.name="Play Queue Confirmation",this.type="preplayintercept",this.id="playqueueconfirmation"}function showConfirmation(playOptions){var player=_playbackmanager.default.getCurrentPlayer(),options={text:_globalize.default.translate("AfterThisPlaysConfirmation")},items=[];return items.push({name:_globalize.default.translate("Keep"),id:"keep",type:"submit"}),items.push({name:_globalize.default.translate("Clear"),id:"clear"}),items.push({name:_globalize.default.translate("Cancel"),id:"cancel",type:"cancel"}),options.buttons=items,(0,_dialog.default)(options).then(function(result){return"cancel"===result?Promise.reject():"keep"===result?function(options,player){var currentPlaylistIndex=_playbackmanager.default.getCurrentPlaylistIndex(player);return-1===currentPlaylistIndex?Promise.resolve():_playbackmanager.default.getPlaylist({StartIndex:currentPlaylistIndex},player).then(function(result){var items=options.items,previousItems=result.Items;if(!previousItems.length)return Promise.resolve();for(var i=0,length=previousItems.length;i<length;i++)items.push(previousItems[i])})}(playOptions,player):Promise.resolve()})}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_globalize=babelHelpers.interopRequireDefault(_globalize),_dialog=babelHelpers.interopRequireDefault(_dialog),_usersettings=babelHelpers.interopRequireDefault(_usersettings),_playbackmanager=babelHelpers.interopRequireDefault(_playbackmanager),PlayQueueConfirmation.prototype.intercept=function(options){if(!options.item)return Promise.resolve();if("play"===options.command&&"Audio"===options.mediaType&&_playbackmanager.default.isPlayingAudio()&&options.fullscreen){var currentPlaylistLength=_playbackmanager.default.getCurrentPlaylistLength();if(1<currentPlaylistLength)return showConfirmation(options)}return Promise.resolve()},_exports.default=PlayQueueConfirmation});