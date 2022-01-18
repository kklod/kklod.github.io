define(["itemsTab"],function(ItemsTab){"use strict";function RecordingsTab(view,params){ItemsTab.call(this,view,params)}return Object.assign(RecordingsTab.prototype,ItemsTab.prototype),RecordingsTab.prototype.getApiClientQueryMethodName=function(){return"getLiveTvRecordings"},RecordingsTab.prototype.getCardOptions=function(items){var options=ItemsTab.prototype.getCardOptions.apply(this,arguments);return options.showParentTitle=!0,options.preferThumb="auto",options.lines=2,options},RecordingsTab.prototype.getViewSettings=function(){var options=ItemsTab.prototype.getViewSettings.apply(this,arguments);return options.fields.push("ProductionYear"),options},RecordingsTab.prototype.getVisibleViewSettings=function(){return{settings:[],fields:[]}},RecordingsTab.prototype.getDefaultSortBy=function(){return"DateCreated,SortName"},RecordingsTab.prototype.getSettingsKey=function(){return"livetvrecordings"},RecordingsTab.prototype.getVisibleFilters=function(){return["IsFavorite"]},RecordingsTab});