define(["itemsTab"],function(ItemsTab){"use strict";function GenresTab(view,params,options){this.options=options,ItemsTab.call(this,view,params)}return Object.assign(GenresTab.prototype,ItemsTab.prototype),GenresTab.prototype.getQueryIncludeItemTypes=function(){return this.options.queryIncludeItemTypes},GenresTab.prototype.getSettingsKey=function(){return ItemsTab.prototype.getSettingsKey.call(this)+"-genres"},GenresTab.prototype.getApiClientQueryMethodName=function(){return"getGenres"},GenresTab.prototype.getVisibleViewSettings=function(){return{}},GenresTab});