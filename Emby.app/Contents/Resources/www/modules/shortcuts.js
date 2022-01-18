define(["exports","./commandprocessor.js","./common/inputmanager.js","./emby-apiclient/connectionmanager.js"],function(_exports,_commandprocessor,_inputmanager,_connectionmanager){function getItemElementFromChildNode(child,isMainElement){return isMainElement?child.closest(".card,.listItem,.epgRow"):child.closest("[data-type],.card,.listItem,.epgRow")}function getItemFromElement(element){var item,itemsContainer=element.closest(".itemsContainer");if(itemsContainer&&(item=itemsContainer.getItemFromElement(element)))return item;item={Type:element.getAttribute("data-type"),Id:element.getAttribute("data-id"),ServerId:element.getAttribute("data-serverid"),IsFolder:"true"===element.getAttribute("data-isfolder"),Status:element.getAttribute("data-status")||null,MediaType:element.getAttribute("data-mediatype")||null};var timerId=element.getAttribute("data-timerid");timerId&&(item.TimerId=timerId);var seriesTimerId=element.getAttribute("data-seriestimerid");return seriesTimerId&&(item.SeriesTimerId=seriesTimerId),item}function notifyRefreshNeeded(childElement,itemsContainer){(itemsContainer=itemsContainer||childElement.closest("[is=emby-itemscontainer]"))&&itemsContainer.notifyRefreshNeeded(!0)}function showContextMenu(itemElement,options){return function(button){var itemFromElement=getItemFromElement(button=getItemElementFromChildNode(button)),type=itemFromElement.Type;if("Plugin"===type||"Device"===type||"Server"===type||"Log"===type||"ApiKey"===type||"ActivityLogEntry"===type||"MediaStream"===type||"ItemImage"===type||"LiveTVTunerDevice"===type||"LiveTVGuideSource"===type||"ChannelManagementInfo"===type)return Promise.resolve(itemFromElement);var id=itemFromElement.Id;if(!id)return Promise.resolve(itemFromElement);var apiClient=_connectionmanager.default.getApiClient(itemFromElement);return"VirtualFolder"===type?function(apiClient,id){return apiClient.getVirtualFolders().then(function(result){return result.Items.filter(function(u){return u.ItemId===id})[0]})}(apiClient,id):"User"===type?apiClient.getUser(id):"Timer"===type?apiClient.getLiveTvTimer(id):"SeriesTimer"===type?apiClient.getLiveTvSeriesTimer(id):apiClient.getItem(apiClient.getCurrentUserId(),id).then(function(fullItem){return fullItem.PlaylistItemId=itemFromElement.PlaylistItemId,fullItem.CollectionId=itemFromElement.CollectionId,fullItem.PlaylistId=itemFromElement.PlaylistId,fullItem})}(itemElement).then(function(item){return require(["itemContextMenu"]).then(function(responses){return function(item){var serverId=item.ServerId;if(!serverId)return Promise.resolve(null);var apiClient=_connectionmanager.default.getApiClient(serverId);return apiClient.getCurrentUserId()?apiClient.getCurrentUser():Promise.resolve(null)}(item).then(function(user){var itemsContainer=options.itemsContainer||itemElement.closest(".itemsContainer");options.positionTo&&!options.itemElement&&(options.itemElement=itemElement);var contextMenuExcludes=(itemsContainer.getAttribute("data-excludecontextcommands")||"").split(",");return responses[0].show(Object.assign({item:item,play:!0,queue:!0,playAllFromHere:!item.IsFolder,queueAllFromHere:!item.IsFolder,user:user,multiSelect:!!itemElement.querySelector(".chkItemSelectContainer"),removeFromNextUp:"removefromnextup"===itemsContainer.getAttribute("data-commands"),removeFromResume:"removefromresume"===itemsContainer.getAttribute("data-commands"),openAlbum:!contextMenuExcludes.includes("viewalbum"),openArtist:!contextMenuExcludes.includes("viewartist")},options)).then(function(result){return"playallfromhere"===(result=result||{}).command||"queueallfromhere"===result.command?executeAction(null,itemElement,options.positionTo,result.command):void((result.updated||result.deleted)&&notifyRefreshNeeded(itemElement,itemsContainer))},onRejected)})})})}function onRejected(){}function executeAction(originalEvent,itemElement,target,action){target=target||itemElement;var item=getItemFromElement(itemElement=getItemElementFromChildNode(itemElement)),serverId=item.ServerId,type=item.Type;if("programdialog"===action)!function(item){require(["recordingCreator"],function(recordingCreator){recordingCreator.show(item)})}(item);else if("record"===action)!function(serverId,id,type,timerId,timerStatus,seriesTimerId){if("Program"===type||timerId||seriesTimerId)require(["recordingHelper"]).then(function(responses){var recordingHelper=responses[0],programId="Program"===type?id:null;recordingHelper.toggleRecording(serverId,programId,timerId,timerStatus,seriesTimerId)})}(serverId,item.Id,type,item.TimerId,item.Status,item.SeriesTimerId);else{if("custom"!==action){var options={};return options.positionTo=target,options.itemElement=itemElement,options.eventType=originalEvent.type,options.eventTarget=originalEvent.target,"menu"===action||"info"===action?(originalEvent&&"click"===originalEvent.type&&(options.positionY="bottom",options.positionX="right"),showContextMenu(itemElement,options),Promise.resolve()):_commandprocessor.default.executeCommand(action,item,options).then(function(id,itemElement){return function(){switch(id){case"canceltimer":case"cancelseriestimer":case"delete":notifyRefreshNeeded(itemElement)}return Promise.resolve()}}(action,itemElement),returnResolvedPromise)}var customAction=target.getAttribute("data-customaction");itemElement.dispatchEvent(new CustomEvent("action-"+customAction,{detail:{playlistItemId:item.PlaylistItemId,item:item},cancelable:!1,bubbles:!0}))}}function returnResolvedPromise(){return Promise.resolve()}function onClick(e){var itemElement=e.target.closest(".itemAction");if(itemElement){var actionElement=itemElement,action=actionElement.getAttribute("data-action");if(action||(actionElement=actionElement.closest("[data-action]"))&&(action=actionElement.getAttribute("data-action")),action&&(executeAction(e,itemElement,actionElement,action),"multiselect"!==action&&"openlink"!==action&&"togglechanneldisabled"!==action))return"default"!==action&&e.preventDefault(),e.stopPropagation(),!1}}function onCommand(e){var target,itemsContainer,scroller,itemElement,cmd=e.detail.command;"play"===cmd||"playpause"===cmd?(itemElement=getItemElementFromChildNode(target=e.target))&&((itemsContainer=target.closest(".itemsContainer"))&&"true"===itemsContainer.getAttribute("data-skipplaycommands")||(e.preventDefault(),e.stopPropagation(),executeAction(e,itemElement,itemElement,cmd))):"resume"===cmd||"record"===cmd||"menu"===cmd||"info"===cmd?(itemElement=getItemElementFromChildNode(target=e.target))&&(e.preventDefault(),e.stopPropagation(),executeAction(e,itemElement,itemElement,cmd)):"pageup"===cmd?(itemsContainer=(target=e.target).closest(".itemsContainer"))&&(scroller=itemsContainer.closest("[is=emby-scroller]"))&&"false"===scroller.getAttribute("data-horizontal")&&(itemsContainer.pageUp(target),e.preventDefault(),e.stopPropagation()):"pagedown"===cmd?(itemsContainer=(target=e.target).closest(".itemsContainer"))&&(scroller=itemsContainer.closest("[is=emby-scroller]"))&&"false"===scroller.getAttribute("data-horizontal")&&(itemsContainer.pageDown(target),e.preventDefault(),e.stopPropagation()):"end"===cmd&&(itemsContainer=(target=e.target).closest(".itemsContainer"))&&(scroller=itemsContainer.closest("[is=emby-scroller]"))&&"false"===scroller.getAttribute("data-horizontal")&&(itemsContainer.focusLast(),e.preventDefault(),e.stopPropagation())}Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_commandprocessor=babelHelpers.interopRequireDefault(_commandprocessor),_inputmanager=babelHelpers.interopRequireDefault(_inputmanager),_connectionmanager=babelHelpers.interopRequireDefault(_connectionmanager);var _default={on:function(context,options){!1!==(options=options||{}).click&&context.addEventListener("click",onClick),!1!==options.command&&_inputmanager.default.on(context,onCommand)},off:function(context,options){options=options||{},context.removeEventListener("click",onClick),!1!==options.command&&_inputmanager.default.off(context,onCommand)},onClick:onClick,getShortcutAttributesHtml:function(item,options){var type,serverId,mediaType,itemId,dataAttributes="";return options.isListItem||((type=item.Type)&&(dataAttributes+=' data-type="'+type+'"'),(serverId=item.ServerId||options.serverId)&&(dataAttributes+=' data-serverid="'+serverId+'"'),(mediaType=item.MediaType)&&(dataAttributes+=' data-mediatype="'+mediaType+'"')),options.isVirtualList||(itemId=item.Id||item.ItemId)&&(dataAttributes+=' data-id="'+itemId+'"'),dataAttributes},getShortcutAttributes:function(item,options){var type,serverId,mediaType,itemId,dataAttributes=[];return options.isListItem||((type=item.Type)&&dataAttributes.push({name:"data-type",value:type}),(serverId=item.ServerId||options.serverId)&&dataAttributes.push({name:"data-serverid",value:serverId}),(mediaType=item.MediaType)&&dataAttributes.push({name:"data-mediatype",value:mediaType})),options.isVirtualList||(itemId=item.Id||item.ItemId)&&dataAttributes.push({name:"data-id",value:itemId}),dataAttributes},getItemElementFromChildNode:getItemElementFromChildNode,getItemFromChildNode:function(child,isMainElement){return getItemFromElement(getItemElementFromChildNode(child,isMainElement))}};_exports.default=_default});