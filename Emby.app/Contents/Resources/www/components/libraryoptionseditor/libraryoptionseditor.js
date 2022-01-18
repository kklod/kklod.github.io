define(["globalize","dom","require","itemHelper","emby-checkbox","emby-select","emby-input"],function(globalize,dom,require,itemHelper){"use strict";function populateLanguages(parent){return ApiClient.getCultures().then(function(languages){populateLanguagesIntoSelect(parent.querySelector("#selectLanguage"),languages),populateLanguagesIntoSelect(parent.querySelector("#selectImageLanguage"),languages),function(element,languages){for(var html="",i=0,length=languages.length;i<length;i++){var culture=languages[i],dataValue=culture.TwoLetterISOLanguageName;html+='<label><input type="checkbox" is="emby-checkbox" class="chkSubtitleLanguage" data-lang="'+dataValue+'" data-altlang="'+culture.ThreeLetterISOLanguageName+'" /><span>'+culture.DisplayName+"</span></label>"}element.innerHTML=html}((ApiClient,parent.querySelector(".subtitleDownloadLanguages")),languages)})}function populateLanguagesIntoSelect(select,languages){var html="";html+="<option value=''></option>";for(var i=0,length=languages.length;i<length;i++){var culture=languages[i];html+="<option value='"+culture.TwoLetterISOLanguageName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html}function renderMetadataReaders(page,plugins,libraryOptions){var html="",elem=page.querySelector(".metadataReaders");if(plugins.length<1)return elem.innerHTML="",void elem.classList.add("hide");html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderMetadataReaders")+"</h3>",html+='<div class="checkboxList">';for(var i=0,length=plugins.length;i<length;i++){var plugin=plugins[i];html+='<div class="listItem listItem-border localReaderOption sortableOption" data-pluginname="'+plugin.Name+'">';var checkedHtml=!libraryOptions.DisabledLocalMetadataReaders||-1===libraryOptions.DisabledLocalMetadataReaders.indexOf(plugin.Name)?' checked="checked"':"";html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkMetadataReader" data-features="'+(plugin.Features||[]).join(",")+'" data-pluginname="'+plugin.Name+'" '+checkedHtml+"><span>&nbsp;</span></label>",html+='<div class="listItemBody">',html+='<div class="listItemBodyText">',html+=plugin.Name,html+="</div>",html+="</div>",0<i?html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonUp")+'" aria-label="'+globalize.translate("ButtonUp")+'" class="btnSortableMoveUp btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_up</i></button>':1<plugins.length&&(html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonDown")+'" aria-label="'+globalize.translate("ButtonDown")+'" class="btnSortableMoveDown btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_down</i></button>'),html+="</div>"}return html+="</div>",html+='<div class="fieldDescription">'+globalize.translate("LabelMetadataReadersHelp")+"</div>",elem.classList.remove("hide"),elem.innerHTML=html,1}function getTypeOptions(allOptions,type){for(var allTypeOptions=allOptions.TypeOptions||[],i=0,length=allTypeOptions.length;i<length;i++){var typeOptions=allTypeOptions[i];if(typeOptions.Type===type)return typeOptions}return null}function renderMetadataFetchers(page,availableOptions,libraryOptions){for(var html="",elem=page.querySelector(".metadataFetchers"),i=0,length=availableOptions.TypeOptions.length;i<length;i++){var availableTypeOptions=availableOptions.TypeOptions[i];html+=function(availableTypeOptions,libraryOptionsForType){var html="",plugins=availableTypeOptions.MetadataFetchers;if(!(plugins=getOrderedPlugins(plugins,libraryOptionsForType.MetadataFetcherOrder||[])).length)return html;html+='<div class="metadataFetcher" style="margin-bottom:2em;" data-type="'+availableTypeOptions.Type+'">',html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderTypeMetadataDownloaders",itemHelper.getItemTypeName(availableTypeOptions.Type))+"</h3>",html+='<div class="checkboxList">';for(var i=0,length=plugins.length;i<length;i++){var plugin=plugins[i];html+='<div class="listItem listItem-border metadataFetcherItem sortableOption" data-pluginname="'+plugin.Name+'">';var checkedHtml=(libraryOptionsForType.MetadataFetchers?-1!==libraryOptionsForType.MetadataFetchers.indexOf(plugin.Name):plugin.DefaultEnabled)?' checked="checked"':"";html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkMetadataFetcher" data-features="'+(plugin.Features||[]).join(",")+'" data-pluginname="'+plugin.Name+'" '+checkedHtml+"><span>&nbsp;</span></label>",html+='<div class="listItemBody">',html+='<div class="listItemBodyText">',html+=plugin.Name,html+="</div>",html+="</div>",0<i?html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonUp")+'" aria-label="'+globalize.translate("ButtonUp")+'" class="btnSortableMoveUp btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_up</i></button>':1<plugins.length&&(html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonDown")+'" aria-label="'+globalize.translate("ButtonDown")+'" class="btnSortableMoveDown btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_down</i></button>'),html+="</div>"}return html+="</div>",html+='<div class="fieldDescription">'+globalize.translate("LabelMetadataDownloadersHelp")+"</div>",html+="</div>"}(availableTypeOptions,getTypeOptions(libraryOptions,availableTypeOptions.Type)||{})}return(elem.innerHTML=html)?(elem.classList.remove("hide"),page.querySelector(".fldAutoRefreshInterval").classList.remove("hide"),page.querySelector(".fldMetadataLanguage").classList.remove("hide"),page.querySelector(".fldMetadataCountry").classList.remove("hide")):(elem.classList.add("hide"),page.querySelector(".fldAutoRefreshInterval").classList.add("hide"),page.querySelector(".fldMetadataLanguage").classList.add("hide"),page.querySelector(".fldMetadataCountry").classList.add("hide")),html?page.querySelector(".fldImageLanguage").classList.remove("hide"):page.querySelector(".fldImageLanguage").classList.add("hide"),1}function renderSubtitleFetchers(page,availableOptions,libraryOptions){var html="",elem=page.querySelector(".subtitleFetchers"),plugins=availableOptions.SubtitleFetchers;if(!(plugins=getOrderedPlugins(plugins,libraryOptions.SubtitleFetcherOrder||[])).length)return html;html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderSubtitleDownloaders")+"</h3>",html+='<div class="checkboxList">';for(var i=0,length=plugins.length;i<length;i++){var plugin=plugins[i];html+='<div class="listItem listItem-border subtitleFetcherItem sortableOption" data-pluginname="'+plugin.Name+'">';var checkedHtml=(libraryOptions.DisabledSubtitleFetchers?-1===libraryOptions.DisabledSubtitleFetchers.indexOf(plugin.Name):plugin.DefaultEnabled)?' checked="checked"':"";html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkSubtitleFetcher" data-pluginname="'+plugin.Name+'" '+checkedHtml+"><span>&nbsp;</span></label>",html+='<div class="listItemBody">',html+='<div class="listItemBodyText">',html+=plugin.Name,html+="</div>","Open Subtitles"===plugin.Name&&(html+='<div class="listItemBodyText listItemBodyText-secondary">',html+=globalize.translate("OpenSubtitleInstructions"),html+="</div>"),html+="</div>",0<i?html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonUp")+'" aria-label="'+globalize.translate("ButtonUp")+'" class="btnSortableMoveUp btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_up</i></button>':1<plugins.length&&(html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonDown")+'" aria-label="'+globalize.translate("ButtonDown")+'" class="btnSortableMoveDown btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_down</i></button>'),html+="</div>"}html+="</div>",html+='<div class="fieldDescription">'+globalize.translate("SubtitleDownloadersHelp")+"</div>",elem.innerHTML=html}function renderImageFetchers(page,availableOptions,libraryOptions){for(var html="",elem=page.querySelector(".imageFetchers"),i=0,length=availableOptions.TypeOptions.length;i<length;i++){var availableTypeOptions=availableOptions.TypeOptions[i];html+=function(availableTypeOptions,libraryOptionsForType){var html="",plugins=availableTypeOptions.ImageFetchers;if(!(plugins=getOrderedPlugins(plugins,libraryOptionsForType.ImageFetcherOrder||[])).length)return html;html+='<div class="imageFetcher" style="margin-bottom:2em;" data-type="'+availableTypeOptions.Type+'">',html+='<div class="flex align-items-center" style="margin:1.5em 0 .5em;">',html+='<h3 class="checkboxListLabel" style="margin:0;">'+globalize.translate("HeaderTypeImageFetchers",itemHelper.getItemTypeName(availableTypeOptions.Type))+"</h3>";var supportedImageTypes=availableTypeOptions.SupportedImageTypes||[];(1<supportedImageTypes.length||1===supportedImageTypes.length&&"Primary"!==supportedImageTypes[0])&&(html+='<button is="emby-button" class="raised btnImageOptionsForType" type="button" style="margin-left:1.5em;font-size:90%;"><span>'+globalize.translate("HeaderFetcherSettings")+"</span></button>"),html+="</div>",html+='<div class="checkboxList">';for(var i=0,length=plugins.length;i<length;i++){var plugin=plugins[i];html+='<div class="listItem listItem-border imageFetcherItem sortableOption" data-pluginname="'+plugin.Name+'">';var checkedHtml=(libraryOptionsForType.ImageFetchers?-1!==libraryOptionsForType.ImageFetchers.indexOf(plugin.Name):plugin.DefaultEnabled)?' checked="checked"':"";html+='<label class="listItemCheckboxContainer"><input type="checkbox" is="emby-checkbox" class="chkImageFetcher" data-pluginname="'+plugin.Name+'" '+checkedHtml+"><span>&nbsp;</span></label>",html+='<div class="listItemBody">',html+='<div class="listItemBodyText">',html+=plugin.Name,html+="</div>",html+="</div>",0<i?html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonUp")+'" aria-label="'+globalize.translate("ButtonUp")+'" class="btnSortableMoveUp btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_up</i></button>':1<plugins.length&&(html+='<button type="button" is="paper-icon-button-light" title="'+globalize.translate("ButtonDown")+'" aria-label="'+globalize.translate("ButtonDown")+'" class="btnSortableMoveDown btnSortable" data-pluginindex="'+i+'"><i class="md-icon">keyboard_arrow_down</i></button>'),html+="</div>"}return html+="</div>",html+='<div class="fieldDescription">'+globalize.translate("LabelImageFetchersHelp")+"</div>",html+="</div>"}(availableTypeOptions,getTypeOptions(libraryOptions,availableTypeOptions.Type)||{})}return(elem.innerHTML=html)?(elem.classList.remove("hide"),page.querySelector(".chkDownloadImagesInAdvanceContainer").classList.remove("hide"),page.querySelector(".chkSaveLocalContainer").classList.remove("hide")):(elem.classList.add("hide"),page.querySelector(".chkDownloadImagesInAdvanceContainer").classList.add("hide"),page.querySelector(".chkSaveLocalContainer").classList.add("hide")),1}var currentLibraryOptions,currentAvailableOptions;function populateMetadataSettings(parent,contentType){var isNewLibrary=parent.classList.contains("newlibrary");return ApiClient.getJSON(ApiClient.getUrl("Libraries/AvailableOptions",{LibraryContentType:contentType,IsNewLibrary:isNewLibrary})).then(function(availableOptions){currentAvailableOptions=availableOptions,parent.availableOptions=availableOptions,function(page,metadataSavers){var html="",elem=page.querySelector(".metadataSavers");if(!metadataSavers.length)return elem.innerHTML="",elem.classList.add("hide");html+='<h3 class="checkboxListLabel">'+globalize.translate("HeaderMetadataSavers")+"</h3>",html+='<div class="checkboxList">';for(var i=0,length=metadataSavers.length;i<length;i++){var plugin=metadataSavers[i];html+='<label><input type="checkbox" data-defaultenabled="'+plugin.DefaultEnabled+'" is="emby-checkbox" class="chkMetadataSaver" data-pluginname="'+plugin.Name+'" '+!1+"><span>"+plugin.Name+"</span></label>"}html+="</div>",html+='<div class="fieldDescription" style="margin-top:.25em;">'+globalize.translate("LabelMetadataSaversHelp")+"</div>",elem.innerHTML=html,elem.classList.remove("hide")}(parent,availableOptions.MetadataSavers),renderMetadataReaders(parent,availableOptions.MetadataReaders,{}),renderMetadataFetchers(parent,availableOptions,{}),renderSubtitleFetchers(parent,availableOptions,{}),renderImageFetchers(parent,availableOptions,{}),availableOptions.SubtitleFetchers.length?parent.querySelector(".subtitleDownloadSettings").classList.remove("hide"):parent.querySelector(".subtitleDownloadSettings").classList.add("hide"),onMetadataFetchersOrReadersChange.call(parent.querySelector(".metadataFetchers"))}).catch(function(){return Promise.resolve()})}function adjustSortableListElement(elem){var btnSortable=elem.querySelector(".btnSortable");elem.previousSibling?(btnSortable.classList.add("btnSortableMoveUp"),btnSortable.classList.remove("btnSortableMoveDown"),btnSortable.querySelector("i").innerHTML="keyboard_arrow_up"):(btnSortable.classList.remove("btnSortableMoveUp"),btnSortable.classList.add("btnSortableMoveDown"),btnSortable.querySelector("i").innerHTML="keyboard_arrow_down")}function onImageFetchersContainerClick(e){var btnImageOptionsForType=e.target.closest(".btnImageOptionsForType");btnImageOptionsForType?function(type){require(["imageoptionseditor"],function(ImageOptionsEditor){var typeOptions=getTypeOptions(currentLibraryOptions,type);typeOptions||(typeOptions={Type:type},currentLibraryOptions.TypeOptions.push(typeOptions));var availableOptions=getTypeOptions(currentAvailableOptions||{},type);(new ImageOptionsEditor).show(type,typeOptions,availableOptions)})}(btnImageOptionsForType.closest(".imageFetcher").getAttribute("data-type")):onSortableContainerClick.call(this,e)}function onSortableContainerClick(e){var li,list,next,prev,btnSortable=e.target.closest(".btnSortable");btnSortable&&(list=(li=btnSortable.closest(".sortableOption")).closest(".checkboxList"),btnSortable.classList.contains("btnSortableMoveDown")?(next=li.nextSibling)&&(li.parentNode.removeChild(li),next.parentNode.insertBefore(li,next.nextSibling)):(prev=li.previousSibling)&&(li.parentNode.removeChild(li),prev.parentNode.insertBefore(li,prev)),Array.prototype.forEach.call(list.querySelectorAll(".sortableOption"),adjustSortableListElement))}function onMetadataFetchersOrReadersChange(e){for(var parent=this.closest(".libraryOptions"),checkedFeatures=Array.prototype.map.call(parent.querySelectorAll(".chkMetadataFetcher:checked"),function(elem){var features=elem.getAttribute("data-features");return features?features.split(","):[]}),allFeatures=[],i=0,length=checkedFeatures.length;i<length;i++)allFeatures=allFeatures.concat(checkedFeatures[i]);allFeatures.includes("Collections")?parent.querySelector(".fldImportCollections").classList.remove("hide"):parent.querySelector(".fldImportCollections").classList.add("hide"),allFeatures.includes("Adult")?parent.querySelector(".fldAdult").classList.remove("hide"):parent.querySelector(".fldAdult").classList.add("hide"),onImportCollectionsChange.call(parent.querySelector(".chkImportCollections"))}function onImportCollectionsChange(e){for(var parent=this.closest(".libraryOptions"),fldMinCollectionSize=parent.querySelector(".fldMinCollectionSize"),metadataReaders=Array.prototype.map.call(parent.querySelectorAll(".chkMetadataReader:checked"),function(elem){var features=elem.getAttribute("data-features");return features?features.split(","):[]}),metadataReaderFeatures=[],i=0,length=metadataReaders.length;i<length;i++)metadataReaderFeatures=metadataReaderFeatures.concat(metadataReaders[i]);metadataReaderFeatures.includes("Collections")||this.checked&&parent.querySelector(".fldImportCollections:not(.hide)")?fldMinCollectionSize.classList.remove("hide"):fldMinCollectionSize.classList.add("hide")}function onThumbnailScheduleChange(e){var parent=e.target.closest(".thumbnailSettingsSection"),fldThumbnailInterval=parent.querySelector(".fldThumbnailInterval");this.value?fldThumbnailInterval.classList.remove("hide"):fldThumbnailInterval.classList.add("hide");var selectThumbnailInterval=parent.querySelector(".selectThumbnailInterval");onThumbnailIntervalChange.call(selectThumbnailInterval,{target:selectThumbnailInterval})}function onThumbnailIntervalChange(e){var parent=e.target.closest(".thumbnailSettingsSection"),fldSaveThumbnailSetsLocally=parent.querySelector(".fldSaveThumbnailSetsLocally"),selectThumbnailImages=parent.querySelector(".selectThumbnailImages");"-1"!==this.value&&selectThumbnailImages.value?fldSaveThumbnailSetsLocally.classList.remove("hide"):fldSaveThumbnailSetsLocally.classList.add("hide")}function triggerElementEvents(parent){var selectThumbnailImages=parent.querySelector(".selectThumbnailImages");onThumbnailScheduleChange.call(selectThumbnailImages,{target:selectThumbnailImages});var selectThumbnailInterval=parent.querySelector(".selectThumbnailInterval");onThumbnailIntervalChange.call(selectThumbnailInterval,{target:selectThumbnailInterval});var chkImportCollections=parent.querySelector(".chkImportCollections");onImportCollectionsChange.call(chkImportCollections,{target:chkImportCollections})}function setContentType(parent,contentType){return"homevideos"===contentType?parent.querySelector(".chkEnablePhotosContainer").classList.remove("hide"):parent.querySelector(".chkEnablePhotosContainer").classList.add("hide"),"tvshows"!==contentType&&"movies"!==contentType&&"homevideos"!==contentType&&"musicvideos"!==contentType&&"mixed"!==contentType&&contentType?parent.querySelector(".thumbnailSettingsSection").classList.add("hide"):parent.querySelector(".thumbnailSettingsSection").classList.remove("hide"),"tvshows"!==contentType&&"movies"!==contentType&&"homevideos"!==contentType&&"musicvideos"!==contentType&&"mixed"!==contentType&&"audiobooks"!==contentType&&contentType?(parent.querySelector(".playbackSettings").classList.add("hide"),parent.querySelector("#txtMinResumePct").removeAttribute("required"),parent.querySelector("#txtMaxResumePct").removeAttribute("required"),parent.querySelector("#txtMinResumeDuration").removeAttribute("required")):(parent.querySelector(".playbackSettings").classList.remove("hide"),parent.querySelector("#txtMinResumePct").setAttribute("required","required"),parent.querySelector("#txtMaxResumePct").setAttribute("required","required"),parent.querySelector("#txtMinResumeDuration").setAttribute("required","required")),"music"!==contentType&&"audiobooks"!==contentType||!ApiClient.isMinServerVersion("4.6.0.7")?parent.querySelector(".musicFolderStructureSection").classList.add("hide"):parent.querySelector(".musicFolderStructureSection").classList.remove("hide"),"tvshows"===contentType?(parent.querySelector(".chkImportMissingEpisodesContainer").classList.remove("hide"),parent.querySelector(".chkAutomaticallyGroupSeriesContainer").classList.remove("hide"),parent.querySelector(".fldSeasonZeroDisplayName").classList.remove("hide"),parent.querySelector("#txtSeasonZeroName").setAttribute("required","required")):(parent.querySelector(".chkImportMissingEpisodesContainer").classList.add("hide"),parent.querySelector(".chkAutomaticallyGroupSeriesContainer").classList.add("hide"),parent.querySelector(".fldSeasonZeroDisplayName").classList.add("hide"),parent.querySelector("#txtSeasonZeroName").removeAttribute("required")),"games"===contentType||"books"===contentType||"boxsets"===contentType||"playlists"===contentType||"music"===contentType?parent.querySelector(".chkEnableEmbeddedTitlesContainer").classList.add("hide"):parent.querySelector(".chkEnableEmbeddedTitlesContainer").classList.remove("hide"),ApiClient.getSystemInfo().then(function(info){"Windows"===info.OperatingSystem&&ApiClient.isMinServerVersion("4.6.0.11")?parent.querySelector(".fldSaveMetadataHidden").classList.remove("hide"):parent.querySelector(".fldSaveMetadataHidden").classList.add("hide")}),parent.querySelector(".chkEnableAudioResume").checked="audiobooks"===contentType,populateMetadataSettings(parent,contentType)}function getOrderedPlugins(plugins,configuredOrder){return(plugins=plugins.slice(0)).sort(function(a,b){return(a=configuredOrder.indexOf(a.Name))<(b=configuredOrder.indexOf(b.Name))?-1:b<a?1:0}),plugins}function setLibraryOptions(parent,options){currentLibraryOptions=options,currentAvailableOptions=parent.availableOptions,parent.querySelector("#selectLanguage").value=options.PreferredMetadataLanguage||"",parent.querySelector("#selectImageLanguage").value=options.PreferredImageLanguage||"",parent.querySelector("#selectCountry").value=options.MetadataCountryCode||"",parent.querySelector("#selectAutoRefreshInterval").value=options.AutomaticRefreshIntervalDays||"0",parent.querySelector("#txtSeasonZeroName").value=options.SeasonZeroDisplayName||"Specials",parent.querySelector(".chkEnablePhotos").checked=options.EnablePhotos,parent.querySelector(".chkEnableRealtimeMonitor").checked=options.EnableRealtimeMonitor,parent.querySelector(".selectMusicFolderStructure").value=options.MusicFolderStructure||"",parent.querySelector(".selectMinCollectionSize").value=options.MinCollectionItems||2,parent.querySelector(".chkImportCollections").checked=options.ImportCollections||!1,parent.querySelector(".chkAdult").checked=options.EnableAdultMetadata||!1,parent.querySelector(".selectThumbnailImages").value=options.EnableChapterImageExtraction&&options.ExtractChapterImagesDuringLibraryScan?"scanandtask":options.EnableChapterImageExtraction?"task":"",parent.querySelector(".chkLocalThumbnailSets").checked=options.SaveLocalThumbnailSets,parent.querySelector(".selectThumbnailInterval").value=options.ThumbnailImagesIntervalSeconds||"10",parent.querySelector("#chkDownloadImagesInAdvance").checked=options.DownloadImagesInAdvance,parent.querySelector("#chkSaveLocal").checked=options.SaveLocalMetadata,parent.querySelector("#chkImportMissingEpisodes").checked=options.ImportMissingEpisodes,parent.querySelector(".chkAutomaticallyGroupSeries").checked=options.EnableAutomaticSeriesGrouping,parent.querySelector("#chkEnableEmbeddedTitles").checked=options.EnableEmbeddedTitles,parent.querySelector("#chkSkipIfGraphicalSubsPresent").checked=options.SkipSubtitlesIfEmbeddedSubtitlesPresent,parent.querySelector("#chkSaveSubtitlesLocally").checked=options.SaveSubtitlesWithMedia,parent.querySelector("#chkSkipIfAudioTrackPresent").checked=options.SkipSubtitlesIfAudioTrackMatches,parent.querySelector("#chkRequireHashMatch").checked=options.RequirePerfectSubtitleMatch,parent.querySelector("#txtMinResumePct").value=null==options.MinResumePct?"5":options.MinResumePct,parent.querySelector("#txtMaxResumePct").value=null==options.MaxResumePct?"90":options.MaxResumePct,parent.querySelector("#txtMinResumeDuration").value=null==options.MinResumeDurationSeconds?"120":options.MinResumeDurationSeconds,parent.querySelector(".chkSaveMetadataHidden").checked=options.SaveMetadataHidden||!1,Array.prototype.forEach.call(parent.querySelectorAll(".chkMetadataSaver"),function(elem){elem.checked=options.MetadataSavers?-1!==options.MetadataSavers.indexOf(elem.getAttribute("data-pluginname")):"true"===elem.getAttribute("data-defaultenabled")}),Array.prototype.forEach.call(parent.querySelectorAll(".chkSubtitleLanguage"),function(elem){elem.checked=!!options.SubtitleDownloadLanguages&&(-1!==options.SubtitleDownloadLanguages.indexOf(elem.getAttribute("data-lang"))||-1!==options.SubtitleDownloadLanguages.indexOf(elem.getAttribute("data-altlang")))}),renderMetadataReaders(parent,getOrderedPlugins(parent.availableOptions.MetadataReaders,options.LocalMetadataReaderOrder||[]),options),renderMetadataFetchers(parent,parent.availableOptions,options),renderImageFetchers(parent,parent.availableOptions,options),renderSubtitleFetchers(parent,parent.availableOptions,options),triggerElementEvents(parent)}return{embed:function(parent,contentType,libraryOptions){currentLibraryOptions={TypeOptions:[]};var isNewLibrary=(currentAvailableOptions=null)==libraryOptions;return isNewLibrary&&parent.classList.add("newlibrary"),require(["text!./libraryoptionseditor.template.html"]).then(function(responses){var select,html;parent.innerHTML=globalize.translateDocument(responses[0]),select=parent.querySelector("#selectAutoRefreshInterval"),html="",html+="<option value='0'>"+globalize.translate("Never")+"</option>",html+=[30,60,90].map(function(val){return"<option value='"+val+"'>"+globalize.translate("EveryNDays",val)+"</option>"}).join(""),select.innerHTML=html;var promises=[populateLanguages(parent),function(select){return ApiClient.getCountries().then(function(allCountries){var html="";html+="<option value=''></option>";for(var i=0,length=allCountries.length;i<length;i++){var culture=allCountries[i];html+="<option value='"+culture.TwoLetterISORegionName+"'>"+culture.DisplayName+"</option>"}select.innerHTML=html})}(parent.querySelector("#selectCountry"))];return function(parent){var options=[{name:globalize.translate("ValueSeconds",10),value:10,selected:' selected="selected"'},{name:globalize.translate("ChapterMarkers"),value:-1}];parent.querySelector(".selectThumbnailInterval").innerHTML=options.map(function(o){return"<option"+(o.selected||"")+' value="'+o.value+'">'+o.name+"</option>"}).join("")}(parent),Promise.all(promises).then(function(){return setContentType(parent,contentType).then(function(){libraryOptions&&setLibraryOptions(parent,libraryOptions),triggerElementEvents(parent),onMetadataFetchersOrReadersChange.call(parent.querySelector(".metadataFetchers")),function(parent){parent.querySelector(".metadataReaders").addEventListener("click",onSortableContainerClick),parent.querySelector(".subtitleFetchers").addEventListener("click",onSortableContainerClick),parent.querySelector(".metadataFetchers").addEventListener("click",onSortableContainerClick),parent.querySelector(".imageFetchers").addEventListener("click",onImageFetchersContainerClick),parent.querySelector(".selectThumbnailImages").addEventListener("change",onThumbnailScheduleChange),parent.querySelector(".selectThumbnailInterval").addEventListener("change",onThumbnailIntervalChange),parent.querySelector(".chkImportCollections").addEventListener("change",onImportCollectionsChange),parent.querySelector(".metadataReaders").addEventListener("change",onMetadataFetchersOrReadersChange),parent.querySelector(".metadataFetchers").addEventListener("change",onMetadataFetchersOrReadersChange)}(parent)})})})},setContentType:setContentType,getLibraryOptions:function(parent){var options={EnableArchiveMediaFiles:!1,EnablePhotos:parent.querySelector(".chkEnablePhotos").checked,EnableRealtimeMonitor:parent.querySelector(".chkEnableRealtimeMonitor").checked,ExtractChapterImagesDuringLibraryScan:"scanandtask"===parent.querySelector(".selectThumbnailImages").value,EnableChapterImageExtraction:!!parent.querySelector(".selectThumbnailImages").value,SaveLocalThumbnailSets:parent.querySelector(".chkLocalThumbnailSets").checked,ThumbnailImagesIntervalSeconds:parent.querySelector(".selectThumbnailInterval").value,DownloadImagesInAdvance:parent.querySelector("#chkDownloadImagesInAdvance").checked,EnableInternetProviders:!0,ImportMissingEpisodes:parent.querySelector("#chkImportMissingEpisodes").checked,SaveLocalMetadata:parent.querySelector("#chkSaveLocal").checked,EnableAutomaticSeriesGrouping:parent.querySelector(".chkAutomaticallyGroupSeries").checked,PreferredMetadataLanguage:parent.querySelector("#selectLanguage").value,PreferredImageLanguage:parent.querySelector("#selectImageLanguage").value,MetadataCountryCode:parent.querySelector("#selectCountry").value,SeasonZeroDisplayName:parent.querySelector("#txtSeasonZeroName").value,AutomaticRefreshIntervalDays:parseInt(parent.querySelector("#selectAutoRefreshInterval").value),EnableEmbeddedTitles:parent.querySelector("#chkEnableEmbeddedTitles").checked,SkipSubtitlesIfEmbeddedSubtitlesPresent:parent.querySelector("#chkSkipIfGraphicalSubsPresent").checked,SkipSubtitlesIfAudioTrackMatches:parent.querySelector("#chkSkipIfAudioTrackPresent").checked,SaveSubtitlesWithMedia:parent.querySelector("#chkSaveSubtitlesLocally").checked,RequirePerfectSubtitleMatch:parent.querySelector("#chkRequireHashMatch").checked,EnableAudioResume:parent.querySelector(".chkEnableAudioResume").checked,MinResumePct:parent.querySelector("#txtMinResumePct").value,MaxResumePct:parent.querySelector("#txtMaxResumePct").value,MinResumeDurationSeconds:parent.querySelector("#txtMinResumeDuration").value,MusicFolderStructure:parent.querySelector(".selectMusicFolderStructure").value||null,ImportCollections:parent.querySelector(".chkImportCollections").checked,SaveMetadataHidden:parent.querySelector(".chkSaveMetadataHidden").checked,EnableAdultMetadata:parent.querySelector(".chkAdult").checked,MinCollectionItems:parseInt(parent.querySelector(".selectMinCollectionSize").value),MetadataSavers:Array.prototype.map.call(Array.prototype.filter.call(parent.querySelectorAll(".chkMetadataSaver"),function(elem){return elem.checked}),function(elem){return elem.getAttribute("data-pluginname")}),TypeOptions:[]};return options.LocalMetadataReaderOrder=Array.prototype.map.call(parent.querySelectorAll(".localReaderOption"),function(elem){return elem.getAttribute("data-pluginname")}),options.SubtitleDownloadLanguages=Array.prototype.map.call(Array.prototype.filter.call(parent.querySelectorAll(".chkSubtitleLanguage"),function(elem){return elem.checked}),function(elem){return elem.getAttribute("data-lang")}),function(parent,options){options.DisabledLocalMetadataReaders=Array.prototype.map.call(Array.prototype.filter.call(parent.querySelectorAll(".chkMetadataReader"),function(elem){return!elem.checked}),function(elem){return elem.getAttribute("data-pluginname")})}(parent,options),function(parent,options){options.DisabledSubtitleFetchers=Array.prototype.map.call(Array.prototype.filter.call(parent.querySelectorAll(".chkSubtitleFetcher"),function(elem){return!elem.checked}),function(elem){return elem.getAttribute("data-pluginname")}),options.SubtitleFetcherOrder=Array.prototype.map.call(parent.querySelectorAll(".subtitleFetcherItem"),function(elem){return elem.getAttribute("data-pluginname")})}(parent,options),function(parent,options){for(var sections=parent.querySelectorAll(".metadataFetcher"),i=0,length=sections.length;i<length;i++){var section=sections[i],type=section.getAttribute("data-type"),typeOptions=getTypeOptions(options,type);typeOptions||(typeOptions={Type:type},options.TypeOptions.push(typeOptions)),typeOptions.MetadataFetchers=Array.prototype.map.call(Array.prototype.filter.call(section.querySelectorAll(".chkMetadataFetcher"),function(elem){return elem.checked}),function(elem){return elem.getAttribute("data-pluginname")}),typeOptions.MetadataFetcherOrder=Array.prototype.map.call(section.querySelectorAll(".metadataFetcherItem"),function(elem){return elem.getAttribute("data-pluginname")})}}(parent,options),function(parent,options){for(var sections=parent.querySelectorAll(".imageFetcher"),i=0,length=sections.length;i<length;i++){var section=sections[i],type=section.getAttribute("data-type"),typeOptions=getTypeOptions(options,type);typeOptions||(typeOptions={Type:type},options.TypeOptions.push(typeOptions)),typeOptions.ImageFetchers=Array.prototype.map.call(Array.prototype.filter.call(section.querySelectorAll(".chkImageFetcher"),function(elem){return elem.checked}),function(elem){return elem.getAttribute("data-pluginname")}),typeOptions.ImageFetcherOrder=Array.prototype.map.call(section.querySelectorAll(".imageFetcherItem"),function(elem){return elem.getAttribute("data-pluginname")})}}(parent,options),function(options){for(var originalTypeOptions=(currentLibraryOptions||{}).TypeOptions||[],i=0,length=originalTypeOptions.length;i<length;i++){var originalTypeOption=originalTypeOptions[i],typeOptions=getTypeOptions(options,originalTypeOption.Type);typeOptions||(typeOptions={Type:originalTypeOption.Type},options.TypeOptions.push(typeOptions)),originalTypeOption.ImageOptions&&(typeOptions.ImageOptions=originalTypeOption.ImageOptions)}}(options),options},setLibraryOptions:setLibraryOptions,setAdvancedVisible:function(parent,visible){for(var elems=parent.querySelectorAll(".advanced"),i=0,length=elems.length;i<length;i++)visible?elems[i].classList.remove("advancedHide"):elems[i].classList.add("advancedHide")}}});