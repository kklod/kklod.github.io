define(["loading","apphost","dialogHelper","layoutManager","globalize","require","material-icons","emby-button","paper-icon-button-light","emby-input","formDialogStyle","flexStyles","emby-scroller"],function(loading,appHost,dialogHelper,layoutManager,globalize,require){"use strict";var currentApiClient,currentDlg,currentInstance;function reloadPageWhenServerAvailable(retryCount){currentApiClient&&currentApiClient.getJSON(currentApiClient.getUrl("System/Info")).then(function(info){info.IsShuttingDown?retryReload(retryCount):(currentInstance.restarted=!0,dialogHelper.close(currentDlg))},function(){retryReload(retryCount)})}function retryReload(retryCount){setTimeout(function(){retryCount=retryCount||0,++retryCount<150&&reloadPageWhenServerAvailable(retryCount)},500)}function showDialog(instance,options,template){var dialogOptions={removeOnClose:!0,scrollY:!1},enableTvLayout=layoutManager.tv;enableTvLayout&&(dialogOptions.size="fullscreen");var dlg=dialogHelper.createDialog(dialogOptions),configuredButtons=[];dlg.classList.add("formDialog"),dlg.innerHTML=globalize.translateHtml(template,"sharedcomponents"),dlg.classList.add("align-items-center"),dlg.classList.add("justify-items-center");var formDialogContent=dlg.querySelector(".formDialogContent");formDialogContent.style["flex-grow"]="initial",enableTvLayout?(formDialogContent.style["max-width"]="50%",formDialogContent.style["max-height"]="60%"):(dlg.style.maxWidth="25em",dlg.classList.add("dialog-fullscreen-lowres")),dlg.querySelector(".formDialogHeaderTitle").innerHTML=globalize.translate("HeaderRestartingEmbyServer"),dlg.querySelector(".dialogContentInner").innerHTML=globalize.translate("RestartPleaseWaitMessage");for(var html="",i=0,length=configuredButtons.length;i<length;i++){var item=configuredButtons[i],buttonClass="btnOption raised formDialogFooterItem formDialogFooterItem-autosize";item.type&&(buttonClass+=" button-"+item.type),html+='<button is="emby-button" type="button" class="'+buttonClass+'" data-id="'+item.id+'">'+item.name+"</button>"}function onButtonClick(){dialogHelper.close(dlg)}dlg.querySelector(".formDialogFooter").innerHTML=html;var buttons=dlg.querySelectorAll(".btnOption");for(i=0,length=buttons.length;i<length;i++)buttons[i].addEventListener("click",onButtonClick);var dlgPromise=dialogHelper.open(dlg);return function(instance,apiClient,dlg){currentDlg=dlg,currentInstance=instance,(currentApiClient=apiClient).restartServer().then(function(){setTimeout(reloadPageWhenServerAvailable,250)})}(instance,options.apiClient,dlg),dlgPromise.then(function(){instance.destroy(),loading.hide(),instance.restarted&&(appHost.supports("multiserver")?options.apiClient.ensureWebSocket():window.location.reload(!0))})}function ServerRestartDialog(options){this.options=options}return ServerRestartDialog.prototype.show=function(){var instance=this;return loading.show(),new Promise(function(resolve,reject){require(["dialogTemplateHtml"],function(template){showDialog(instance,instance.options,template).then(resolve,reject)})})},ServerRestartDialog.prototype.destroy=function(){currentInstance=currentDlg=currentApiClient=null,this.options=null},ServerRestartDialog});