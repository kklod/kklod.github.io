define(["require","dom","focusManager","dialogHelper","inputManager","layoutManager","connectionManager","globalize","userSettings","emby-checkbox","emby-input","emby-select","paper-icon-button-light","emby-select","material-icons","formDialogStyle","emby-button","emby-linkbutton","flexStyles"],function(require,dom,focusManager,dialogHelper,inputManager,layoutManager,connectionManager,globalize,userSettings){"use strict";function onSubmit(e){return e.preventDefault(),!1}function renderList(container,items,options,property,delimeter,enableId){var allText,prefix,multiSettingsSection,select=container.querySelector("select"),anySelected=!1,values=(values=options.settings[property])?values.split(delimeter):[],multiple=select.hasAttribute("multiple"),html=items.map(function(i){var itemId=!1!==enableId&&i.Id||i.Name,selected=values.includes(itemId.toString()),selectedHtml=selected&&!anySelected?" selected":"";return selected&&!multiple&&(anySelected=!0),'<option value="'+itemId+'"'+selectedHtml+">"+i.Name+"</option>"}).join("");prefix=multiple?"":(allText=globalize.translate("Any"),anySelected?'<option value="">'+allText+"</option>":'<option value="" selected>'+allText+"</option>"),select.innerHTML=prefix+html,items.length?(container.classList.remove("hide"),(multiSettingsSection=container.closest(".multiSettingsSection"))&&multiSettingsSection.classList.remove("hide")):container.classList.add("hide")}function handleQueryError(){}function saveValues(context,settings,settingsKey){for(var elems=context.querySelectorAll(".simpleFilter"),i=0,length=elems.length;i<length;i++)"INPUT"===elems[i].tagName?setBasicFilter(0,settingsKey+"-filter-"+elems[i].getAttribute("data-settingname"),elems[i]):elems[i].classList.contains("selectContainer")?setBasicFilter(0,settingsKey+"-filter-"+elems[i].getAttribute("data-settingname"),elems[i].querySelector("select")):setBasicFilter(0,settingsKey+"-filter-"+elems[i].getAttribute("data-settingname"),elems[i].querySelector("input"));var seriesStatuses=[],elem=context.querySelector(".selectSeriesStatus");elem.value&&seriesStatuses.push(elem.value),userSettings.setFilter(settingsKey+"-filter-SeriesStatus",seriesStatuses.join(",")),userSettings.setFilter(settingsKey+"-filter-GenreIds",context.querySelector(".selectGenre").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-StudioIds",context.querySelector(".selectStudio").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-TagIds",context.querySelector(".selectTags").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-Containers",context.querySelector(".selectContainers").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-AudioCodecs",context.querySelector(".selectAudioCodecs").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-AudioLanguages",context.querySelector(".selectAudioLanguages").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-SubtitleLanguages",context.querySelector(".selectSubtitleLanguages").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-VideoCodecs",context.querySelector(".selectVideoCodecs").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-SubtitleCodecs",context.querySelector(".selectSubtitleCodecs").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-Years",context.querySelector(".selectYears").getValues().join(",")),userSettings.setFilter(settingsKey+"-filter-OfficialRatings",context.querySelector(".selectOfficialRating").getValues().join("|")),function(context,settingsKey){for(var selectPlaystate=context.querySelector(".selectPlaystate"),options=selectPlaystate.options,value=selectPlaystate.value,i=0,length=options.length;i<length;i++){var optionValue=options[i].value;optionValue===value?optionValue&&userSettings.setFilter(settingsKey+"-filter-"+optionValue,!0):optionValue&&userSettings.setFilter(settingsKey+"-filter-"+optionValue,null)}}(context,settingsKey)}function setBasicFilter(context,key,elem){var value="SELECT"===elem.tagName?elem.value||null:"true"===elem.getAttribute("data-invert")?!elem.checked&&null:(value=elem.checked)||null;userSettings.setFilter(key,value)}function FilterMenu(){}return FilterMenu.prototype.show=function(options){return require(["text!./filtermenu.template.html"]).then(function(responses){var template=responses[0],dialogOptions={removeOnClose:!0,scrollY:!1};layoutManager.tv?dialogOptions.size="fullscreen":dialogOptions.size="small";var dlg=dialogHelper.createDialog(dialogOptions);dlg.classList.add("formDialog");var html="";html+='<div class="formDialogHeader">',html+='<button is="paper-icon-button-light" class="btnCancel hide-mouse-idle-tv" tabindex="-1"><i class="md-icon">&#xE5C4;</i></button>',html+='<h3 class="formDialogHeaderTitle">${Filters}</h3>',html+="</div>",html+=template,dlg.innerHTML=globalize.translateDocument(html,"sharedcomponents");for(var submitted,settingElements=dlg.querySelectorAll(".viewSetting"),i=0,length=settingElements.length;i<length;i++)-1===options.visibleSettings.indexOf(settingElements[i].getAttribute("data-settingname"))?settingElements[i].classList.add("hide"):settingElements[i].classList.remove("hide");return function(context,settings){context.querySelector("form").addEventListener("submit",onSubmit);for(var elems=context.querySelectorAll(".simpleFilter"),i=0,length=elems.length;i<length;i++){var val=settings[elems[i].getAttribute("data-settingname")];"INPUT"===elems[i].tagName?"true"===elems[i].getAttribute("data-invert")?elems[i].checked="false"===val:elems[i].checked=val||!1:elems[i].classList.contains("selectContainer")?elems[i].querySelector("select").value=null==val?"":val.toString():elems[i].querySelector("input").checked=val||!1}for(context.querySelector(".selectSeriesStatus").value=settings.SeriesStatus||"",i=0,length=(elems=context.querySelectorAll(".multiSettingsSection")).length;i<length;i++)elems[i].querySelector(".viewSetting:not(.hide)")||elems[i].querySelector(".selectContainer:not(.hide)")?elems[i].classList.remove("hide"):elems[i].classList.add("hide")}(dlg,options.settings),function(context,options){var anySelected=!1,menuItems=[];-1!==options.visibleSettings.indexOf("IsPlayed")&&menuItems.push({name:globalize.translate("Played"),value:"IsPlayed"}),-1!==options.visibleSettings.indexOf("IsUnplayed")&&menuItems.push({name:globalize.translate("Unplayed"),value:"IsUnplayed"}),-1!==options.visibleSettings.indexOf("IsResumable")&&menuItems.push({name:globalize.translate("ContinuePlaying"),value:"IsResumable"});var html=menuItems.map(function(m){var selectedHtml="";return!anySelected&&(options.settings[m.value]||!1)&&(anySelected=!0,selectedHtml=" selected"),'<option value="'+m.value+'" '+selectedHtml+">"+m.name+"</option>"}).join(""),allText=globalize.translate("Any"),prefix=anySelected?'<option value="">'+allText+"</option>":'<option value="" selected>'+allText+"</option>";context.querySelector(".selectPlaystate").innerHTML=prefix+html,menuItems.length?context.querySelector(".playstateFilters").classList.remove("hide"):context.querySelector(".playstateFilters").classList.add("hide")}(dlg,options),-1!==options.visibleSettings.indexOf("Genres")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getGenres(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".genreFilters"),result.Items,options,"GenreIds",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("Studios")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getStudios(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".studioFilters"),result.Items,options,"StudioIds",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("Tags")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getTags(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".tagFilters"),result.Items,options,"TagIds",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("OfficialRatings")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getOfficialRatings(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".officialRatingFilters"),result.Items,options,"OfficialRatings","|")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("Containers")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getContainers(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".containerFilters"),result.Items,options,"Containers",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("Years")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getYears(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".yearFilters"),result.Items,options,"Years",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("AudioCodecs")&&(function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getAudioCodecs(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".audioCodecFilters"),result.Items,options,"AudioCodecs",",")},handleQueryError)}(dlg,options),function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(","),StreamType:"Audio"});apiClient.getStreamLanguages(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".audioLanguageFilters"),result.Items,options,"AudioLanguages",",")},handleQueryError)}(dlg,options)),-1!==options.visibleSettings.indexOf("VideoCodecs")&&function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getVideoCodecs(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".videoCodecFilters"),result.Items,options,"VideoCodecs",",")},handleQueryError)}(dlg,options),-1!==options.visibleSettings.indexOf("SubtitleCodecs")&&(function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(",")});apiClient.getSubtitleCodecs(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".subtitleCodecFilters"),result.Items,options,"SubtitleCodecs",",",null)},handleQueryError)}(dlg,options),function(context,options){var apiClient=connectionManager.getApiClient(options.serverId),query=Object.assign(options.filterMenuOptions,{SortBy:"SortName",SortOrder:"Ascending",Recursive:null==options.Recursive||options.Recursive,EnableTotalRecordCount:!1,EnableImages:!1,EnableUserData:!1,GenreIds:options.GenreIds,PersonIds:options.PersonIds,StudioIds:options.StudioIds,ParentId:options.parentId,IncludeItemTypes:options.itemTypes.join(","),StreamType:"Subtitle"});apiClient.getStreamLanguages(apiClient.getCurrentUserId(),query).then(function(result){renderList(context.querySelector(".subtitleLanguageFilters"),result.Items,options,"SubtitleLanguages",",")},handleQueryError)}(dlg,options)),dlg.querySelector(".btnCancel").addEventListener("click",function(){dialogHelper.close(dlg)}),dlg.querySelector("form").addEventListener("change",function(){submitted=!0},!0),dialogHelper.open(dlg).then(function(){return submitted?(saveValues(dlg,options.settings,options.settingsKey,connectionManager.getApiClient(options.serverId)),Promise.resolve()):Promise.reject()})})},FilterMenu});