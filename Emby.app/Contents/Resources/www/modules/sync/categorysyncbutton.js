define(["itemHelper","apphost"],function(itemHelper,appHost){"use strict";function onCategorySyncButtonClick(e){var button=this,category=button.getAttribute("data-category"),parentId=button.getAttribute("data-parentid");require(["syncDialog"],function(syncDialog){syncDialog.showMenu({ParentId:parentId,Category:category,serverId:button.getAttribute("data-serverid"),mode:appHost.supports("sync")?"download":"sync"})})}return{init:function(btn,user,serverId,parentId){btn.setAttribute("data-parentid",parentId),btn.setAttribute("data-serverid",serverId);itemHelper.canSync(user,{SupportsSync:!0})?btn.classList.remove("hide"):btn.classList.add("hide"),btn.addEventListener("click",onCategorySyncButtonClick)}}});