define(["../list/list","appHeader","globalize","listView","listViewStyle","emby-linkbutton","flexStyles","emby-toggle"],function(ListPage,appHeader,globalize,listView){"use strict";function ServerActivityPage(view,params){params.serverId=ApiClient.serverId(),this.supportsPlayback=!1,this.supportsViewSettings=!1,this.enableTotalRecordCountDisplay=!1,ListPage.call(this,view,params)}return Object.assign(ServerActivityPage.prototype,ListPage.prototype),ServerActivityPage.prototype.getApiClientQueryMethodName=function(){return"true"===this.params.useractivity?"getUserActivityLog":"getActivityLog"},ServerActivityPage.prototype.getListViewOptions=function(items,settings){var options=ListPage.prototype.getListViewOptions.apply(this,arguments);return options.showDate=!0,options.moreButton=!1,options.action="none",options.showShortOverview=!0,options.enableDefaultIcon=!0,options.overviewButton=!0,options.roundImage=!0,options.multiSelect=!1,listView.setListOptions(items,options),options},ServerActivityPage.prototype.getSettingsKey=function(){return"logs"},ServerActivityPage.prototype.setTitle=function(){var title="true"===this.params.useractivity?globalize.translate("Activity"):globalize.translate("Alerts");appHeader.setTitle(title||"")},ServerActivityPage.prototype.getSortMenuOptions=function(){return[]},ServerActivityPage.prototype.getVisibleFilters=function(){return[]},ServerActivityPage.prototype.getViewSettings=function(){var viewSettings=ListPage.prototype.getViewSettings.apply(this,arguments);return viewSettings.imageType="list",viewSettings},ServerActivityPage});