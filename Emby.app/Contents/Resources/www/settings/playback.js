define(["focusManager","appSettings","qualityOptions","apphost","connectionManager","userSettingsBuilder","userSettings","globalize","loading","listViewStyle","emby-scroller","emby-select","emby-checkbox"],function(focusManager,appSettings,qualityOptions,appHost,connectionManager,userSettingsBuilder,currentUserSettings,globalize,loading){"use strict";function fillSkipLengths(select){select.innerHTML=[5,10,15,20,25,30].map(function(option){return{name:globalize.translate("ValueSeconds",option),value:1e3*option}}).map(function(o){return'<option value="'+o.value+'">'+o.name+"</option>"}).join("")}function setMaxBitrateIntoField(select,isInNetwork,mediatype){var options="Audio"===mediatype?qualityOptions.getAudioQualityOptions({currentMaxBitrate:appSettings.maxStreamingBitrate(isInNetwork,mediatype),isAutomaticBitrateEnabled:appSettings.enableAutomaticBitrateDetection(isInNetwork,mediatype),enableAuto:!0}):qualityOptions.getVideoQualityOptions({currentMaxBitrate:appSettings.maxStreamingBitrate(isInNetwork,mediatype),isAutomaticBitrateEnabled:appSettings.enableAutomaticBitrateDetection(isInNetwork,mediatype),enableAuto:!0});select.innerHTML=options.map(function(i){return'<option value="'+(i.bitrate||"")+'">'+i.name+"</option>"}).join(""),appSettings.enableAutomaticBitrateDetection(isInNetwork,mediatype)?select.value="":select.value=appSettings.maxStreamingBitrate(isInNetwork,mediatype)}function setMaxBitrateFromField(select,isInNetwork,mediatype){select.value?(appSettings.maxStreamingBitrate(isInNetwork,mediatype,select.value),appSettings.enableAutomaticBitrateDetection(isInNetwork,mediatype,!1)):appSettings.enableAutomaticBitrateDetection(isInNetwork,mediatype,!0)}function loadForm(context,user,userSettings,apiClient){var select,options,loggedInUserId=apiClient.getCurrentUserId(),userId=user.Id;!function(context,user,apiClient){if(appHost.supports("multiserver"))return context.querySelector(".fldVideoInNetworkQuality").classList.remove("hide"),context.querySelector(".fldVideoInternetQuality").classList.remove("hide"),user.Policy.EnableAudioPlaybackTranscoding?context.querySelector(".musicQualitySection").classList.remove("hide"):context.querySelector(".musicQualitySection").classList.add("hide");apiClient.getEndpointInfo().then(function(endpointInfo){endpointInfo.IsInNetwork?(context.querySelector(".fldVideoInNetworkQuality").classList.remove("hide"),context.querySelector(".fldVideoInternetQuality").classList.add("hide"),context.querySelector(".musicQualitySection").classList.add("hide")):(context.querySelector(".fldVideoInNetworkQuality").classList.add("hide"),context.querySelector(".fldVideoInternetQuality").classList.remove("hide"),user.Policy.EnableAudioPlaybackTranscoding?context.querySelector(".musicQualitySection").classList.remove("hide"):context.querySelector(".musicQualitySection").classList.add("hide"))})}(context,user,apiClient),apiClient.getCultures().then(function(allCultures){!function(select,languages,value){var html="";html+="<option"+(value?"":" selected")+" value=''>"+globalize.translate("AnyLanguage")+"</option>";for(var i=0,length=languages.length;i<length;i++){var culture=languages[i];html+="<option"+(value===culture.TwoLetterISOLanguageName||value===culture.ThreeLetterISOLanguageName?" selected":"")+" value='"+culture.TwoLetterISOLanguageName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html}(context.querySelector(".selectAudioLanguage"),allCultures,user.Configuration.AudioLanguagePreference),context.querySelector(".chkEpisodeAutoPlay").checked=user.Configuration.EnableNextEpisodeAutoPlay||!1}),appHost.supports("backgroundvideo")?context.querySelector(".fldBackgroundVideo").classList.remove("hide"):context.querySelector(".fldBackgroundVideo").classList.add("hide"),appHost.supports("externalplayerintent")&&userId===loggedInUserId?context.querySelector(".fldExternalPlayer").classList.remove("hide"):context.querySelector(".fldExternalPlayer").classList.add("hide"),userId===loggedInUserId?(context.querySelector(".qualitySections").classList.remove("hide"),appHost.supports("chromecast")?context.querySelector(".fldChromecastQuality").classList.remove("hide"):context.querySelector(".fldChromecastQuality").classList.add("hide")):(context.querySelector(".qualitySections").classList.add("hide"),context.querySelector(".fldChromecastQuality").classList.add("hide")),appHost.supports("changerefreshrate")?context.querySelector(".fldEnableRefreshRate").classList.remove("hide"):context.querySelector(".fldEnableRefreshRate").classList.add("hide"),"6da60dd6edfc4508bca2c434d4400816"===apiClient.serverId()?context.querySelector(".fldEnableNextVideoOverlay").classList.add("hide"):context.querySelector(".fldEnableNextVideoOverlay").classList.remove("hide"),context.querySelector(".chkRememberAudioTracks").checked=user.Configuration.RememberAudioSelections||!1,context.querySelector(".chkPlayDefaultAudioTrack").checked=user.Configuration.PlayDefaultAudioTrack||!1,context.querySelector(".chkEnableCinemaMode").checked=userSettings.enableCinemaMode(),context.querySelector(".chkEnableNextVideoOverlay").checked=userSettings.enableNextVideoInfoOverlay(),context.querySelector(".chkExternalVideoPlayer").checked=appSettings.enableSystemExternalPlayers(),context.querySelector(".selectBackgroundVideo").value=appSettings.backgroundVideo()||"",context.querySelector(".chkEnableRefreshRate").checked=appSettings.enableRefreshRateSwitching(),context.querySelector(".chkStillWatching").checked=userSettings.enableStillWatching(),setMaxBitrateIntoField(context.querySelector(".selectVideoInNetworkQuality"),!0,"Video"),setMaxBitrateIntoField(context.querySelector(".selectVideoInternetQuality"),!1,"Video"),setMaxBitrateIntoField(context.querySelector(".selectMusicInternetQuality"),!1,"Audio"),select=context.querySelector(".selectChromecastVideoQuality"),options=qualityOptions.getVideoQualityOptions({currentMaxBitrate:appSettings.maxChromecastBitrate(),isAutomaticBitrateEnabled:!appSettings.maxChromecastBitrate(),enableAuto:!0}),select.innerHTML=options.map(function(i){return'<option value="'+(i.bitrate||"")+'">'+i.name+"</option>"}).join(""),select.value=appSettings.maxChromecastBitrate()||"";var selectSkipForwardLength=context.querySelector(".selectSkipForwardLength");fillSkipLengths(selectSkipForwardLength),selectSkipForwardLength.value=userSettings.skipForwardLength();var selectSkipBackLength=context.querySelector(".selectSkipBackLength");fillSkipLengths(selectSkipBackLength),selectSkipBackLength.value=userSettings.skipBackLength(),function(context,apiClient){"6da60dd6edfc4508bca2c434d4400816"!==apiClient.serverId()?context.querySelector(".fldEpisodeAutoPlay").classList.remove("hide"):context.querySelector(".fldEpisodeAutoPlay").classList.add("hide")}(context,apiClient),loading.hide()}function save(context,userId,userSettings,apiClient,enableSaveConfirmation){loading.show(),apiClient.getUser(userId).then(function(user){(function(context,user,userSettingsInstance,apiClient){return appSettings.enableRefreshRateSwitching(context.querySelector(".chkEnableRefreshRate").checked),appSettings.backgroundVideo(context.querySelector(".selectBackgroundVideo").value),appSettings.enableSystemExternalPlayers(context.querySelector(".chkExternalVideoPlayer").checked),appSettings.maxChromecastBitrate(context.querySelector(".selectChromecastVideoQuality").value),setMaxBitrateFromField(context.querySelector(".selectVideoInNetworkQuality"),!0,"Video"),setMaxBitrateFromField(context.querySelector(".selectVideoInternetQuality"),!1,"Video"),setMaxBitrateFromField(context.querySelector(".selectMusicInternetQuality"),!1,"Audio"),user.Configuration.AudioLanguagePreference=context.querySelector(".selectAudioLanguage").value,user.Configuration.PlayDefaultAudioTrack=context.querySelector(".chkPlayDefaultAudioTrack").checked,user.Configuration.EnableNextEpisodeAutoPlay=context.querySelector(".chkEpisodeAutoPlay").checked,user.Configuration.RememberAudioSelections=context.querySelector(".chkRememberAudioTracks").checked,userSettingsInstance.enableCinemaMode(context.querySelector(".chkEnableCinemaMode").checked),userSettingsInstance.enableNextVideoInfoOverlay(context.querySelector(".chkEnableNextVideoOverlay").checked),userSettingsInstance.skipForwardLength(context.querySelector(".selectSkipForwardLength").value),userSettingsInstance.skipBackLength(context.querySelector(".selectSkipBackLength").value),userSettingsInstance.enableStillWatching(context.querySelector(".chkStillWatching").checked),apiClient.updateUserConfiguration(user.Id,user.Configuration)})(context,user,userSettings,apiClient).then(function(){loading.hide(),enableSaveConfirmation&&require(["toast"],function(toast){toast(globalize.translate("SettingsSaved"))})},function(){loading.hide()})})}function onSubmit(e){var options=this,apiClient=connectionManager.getApiClient(options.serverId),userId=options.userId,userSettings=options.userSettings;return userSettings.setUserInfo(userId,apiClient).then(function(){var enableSaveConfirmation=options.enableSaveConfirmation;save(options.element,userId,userSettings,apiClient,enableSaveConfirmation)}),e&&e.preventDefault(),!1}function onTrackSelectionsCleared(){loading.hide()}return function(view,params){var apiClient=connectionManager.getApiClient(params.serverId),userId=params.userId||apiClient.getCurrentUserId(),userSettings=userId===apiClient.getCurrentUserId()?currentUserSettings:new userSettingsBuilder,options={serverId:apiClient.serverId(),userId:userId,element:view.querySelector(".settingsContainer"),userSettings:userSettings,enableSaveButton:!1,enableSaveConfirmation:!1,autoFocus:!0};apiClient.isMinServerVersion("4.6.0.16")?options.element.querySelector(".fldClearTrackSelections").classList.remove("hide"):options.element.querySelector(".fldClearTrackSelections").classList.add("hide"),options.element.querySelector("form").addEventListener("submit",onSubmit.bind(options)),options.element.querySelector(".btnClearTrackSelections").addEventListener("click",function(e){var options=this,mode=e.target.closest("button").getAttribute("data-mode");require(["confirm"]).then(function(responses){return responses[0]({title:globalize.translate("HeaderClearTrackSelections"),text:globalize.translate("QuestionClearSavedTracks"),confirmText:globalize.translate("HeaderClearTrackSelections"),primary:"cancel"}).then(function(){return loading.show(),connectionManager.getApiClient(options.serverId).clearUserTrackSelections(options.userId,mode).then(onTrackSelectionsCleared,onTrackSelectionsCleared)})})}.bind(options)),options.enableSaveButton&&options.element.querySelector(".btnSave").classList.remove("hide");for(var featurePremiereInfo=options.element.querySelectorAll(".featurePremiereInfo"),i=0,length=featurePremiereInfo.length;i<length;i++)featurePremiereInfo[i].innerHTML=globalize.translate("FeatureRequiresEmbyPremiere","","");view.addEventListener("viewshow",function(e){e.detail.isRestored||function(options){var context=options.element;loading.show();var userId=options.userId,apiClient=connectionManager.getApiClient(options.serverId),userSettings=options.userSettings;apiClient.getUser(userId).then(function(user){(userId===apiClient.getCurrentUserId()?Promise.resolve():userSettings.setUserInfo(userId,apiClient)).then(function(){loadForm(context,user,userSettings,apiClient),focusManager.autoFocus(context)})})}(options)}),view.addEventListener("viewbeforehide",function(){onSubmit.call(options)}),view.addEventListener("viewdestroy",function(){options=null})}});