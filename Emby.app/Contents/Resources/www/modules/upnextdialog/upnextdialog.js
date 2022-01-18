define(["dom","playbackManager","connectionManager","events","mediaInfo","layoutManager","focusManager","globalize","itemHelper","css!./upnextdialog","emby-button","flexStyles"],function(dom,playbackManager,connectionManager,events,mediaInfo,layoutManager,focusManager,globalize,itemHelper){"use strict";var transitionEndEventName=dom.whichTransitionEvent();function seriesImageUrl(item,options){return"Episode"!==item.Type?null:((options=options||{}).type=options.type||"Primary","Primary"===options.type&&item.SeriesPrimaryImageTag?(options.tag=item.SeriesPrimaryImageTag,connectionManager.getApiClient(item).getImageUrl(item.SeriesId,options)):"Thumb"===options.type&&item.ParentThumbImageTag?(options.tag=item.ParentThumbImageTag,connectionManager.getApiClient(item).getImageUrl(item.ParentThumbItemId,options)):null)}function imageUrl(item,options){return(options=options||{}).type=options.type||"Primary",item.ImageTags&&item.ImageTags[options.type]?(options.tag=item.ImageTags[options.type],connectionManager.getApiClient(item).getImageUrl(item.PrimaryImageItemId||item.Id,options)):"Primary"===options.type&&item.AlbumId&&item.AlbumPrimaryImageTag?(options.tag=item.AlbumPrimaryImageTag,connectionManager.getApiClient(item).getImageUrl(item.AlbumId,options)):null}function setNextVideoText(){var elem=this.options.parent,secondsRemaining=Math.max(Math.round(getTimeRemainingMs(this)/1e3),0);console.log("up next seconds remaining: "+secondsRemaining);var timeText='<span class="upNextDialog-countdownText">'+globalize.translate("HeaderSecondsValue",secondsRemaining)+"</span>",nextVideoText="Episode"===this.itemType?globalize.translate("HeaderNextEpisodePlayingInValue",timeText):globalize.translate("HeaderNextVideoPlayingInValue",timeText);elem.querySelector(".upNextDialog-nextVideoText").innerHTML=nextVideoText}function fillItem(item){var elem=this.options.parent;!function(osdPoster,item,secondaryItem){if(item){var imgUrl=seriesImageUrl(item,{type:"Primary"})||seriesImageUrl(item,{type:"Thumb"})||imageUrl(item,{type:"Primary"});if(!imgUrl&&secondaryItem&&(imgUrl=seriesImageUrl(secondaryItem,{type:"Primary"})||seriesImageUrl(secondaryItem,{type:"Thumb"})||imageUrl(secondaryItem,{type:"Primary"})),imgUrl)return osdPoster.innerHTML='<img class="upNextDialog-poster-img" src="'+imgUrl+'" />'}osdPoster.innerHTML=""}(elem.querySelector(".upNextDialog-poster"),item),elem.querySelector(".upNextDialog-overview").innerHTML=item.Overview||"",elem.querySelector(".upNextDialog-mediainfo").innerHTML=mediaInfo.getPrimaryMediaInfoHtml(item,{});var title=itemHelper.getDisplayName(item);item.SeriesName&&(title=item.SeriesName+" - "+title),elem.querySelector(".upNextDialog-title").innerHTML=title||"",this.itemType=item.Type,this.show()}function clearCountdownTextTimeout(instance){instance._countdownTextTimeout&&(clearInterval(instance._countdownTextTimeout),instance._countdownTextTimeout=null)}function init(instance,options){var html;options.parent.innerHTML=(html="",html+='<div class="upNextDialog-poster">',html+="</div>",html+='<div class="flex flex-direction-column flex-grow">',html+='<h2 class="upNextDialog-nextVideoText" style="margin:.25em 0;">&nbsp;</h2>',html+='<h3 class="upNextDialog-title" style="margin:.25em 0 .5em;"></h3>',html+='<div class="flex flex-direction-row upNextDialog-mediainfo">',html+="</div>",html+='<div class="upNextDialog-overview" style="margin-top:1em;"></div>',html+='<div class="flex flex-direction-row upNextDialog-buttons" style="margin-top:1em;">',html+='<button type="button" is="emby-button" class="raised raised-mini btnStartNow upNextDialog-button">',html+=globalize.translate("HeaderStartNow"),html+="</button>",html+='<button type="button" is="emby-button" class="raised raised-mini btnHide upNextDialog-button">',html+=globalize.translate("Hide"),html+="</button>",html+="</div>",html+="</div>"),options.parent.classList.add("hide"),options.parent.classList.add("upNextDialog"),options.parent.classList.add("upNextDialog-hidden"),fillItem.call(instance,options.nextItem),options.parent.querySelector(".btnHide").addEventListener("click",instance.hide.bind(instance)),options.parent.querySelector(".btnStartNow").addEventListener("click",function(){var player,options=this.options;options&&(player=options.player,this.hide(),playbackManager.nextTrack(player))}.bind(instance))}function clearHideAnimationEventListeners(instance,elem){var fn=instance._onHideAnimationComplete;fn&&dom.removeEventListener(elem,transitionEndEventName,fn,{once:!0})}function hideComingUpNext(){var elem,fn;clearCountdownTextTimeout(this),!this.options||(elem=this.options.parent)&&(clearHideAnimationEventListeners(this,elem),elem.classList.contains("upNextDialog-hidden")||(elem.offsetWidth,elem.classList.add("upNextDialog-hidden"),fn=function(e){var elem=e.currentTarget;elem.classList.add("hide"),clearHideAnimationEventListeners(this,elem),events.trigger(this,"hide")}.bind(this),this._onHideAnimationComplete=fn,dom.addEventListener(elem,transitionEndEventName,fn,{once:!0})))}function getTimeRemainingMs(instance){var options=instance.options;if(options){var runtimeTicks=playbackManager.duration(options.player);if(runtimeTicks){var timeRemainingTicks=runtimeTicks-playbackManager.currentTime(options.player);return Math.round(timeRemainingTicks/1e4)}}return 0}function UpNextDialog(options){this.options=options,init(this,options)}return UpNextDialog.prototype.show=function(){var instance,elem=this.options.parent;clearHideAnimationEventListeners(this,elem),elem.classList.remove("hide"),elem.offsetWidth,elem.classList.remove("upNextDialog-hidden"),setTimeout(function(){focusManager.focus(elem.querySelector(".btnStartNow"))},50),getTimeRemainingMs(instance=this)<=0||(setNextVideoText.call(instance),clearCountdownTextTimeout(instance),instance._countdownTextTimeout=setInterval(setNextVideoText.bind(instance),400))},UpNextDialog.prototype.hide=function(){hideComingUpNext.call(this)},UpNextDialog.prototype.destroy=function(){hideComingUpNext.call(this),this.options=null,this.itemType=null},UpNextDialog});