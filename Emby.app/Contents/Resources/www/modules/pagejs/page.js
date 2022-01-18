define(["exports","./../dom.js"],function(_exports,_dom){Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,_dom=babelHelpers.interopRequireDefault(_dom);var prevContext,prevPageContext,base="",allRoutes=[];function page(path,routeInfo,fn){"function"==typeof fn?(page.callbacks[path.toUpperCase()]={routeInfo:routeInfo,fn:fn},allRoutes.push(routeInfo)):page.start(path)}page.getRoutes=function(){return allRoutes},page.callbacks={},page.current="",page.base=function(path){if(0===arguments.length)return base;base=path};var loaded="complete"===document.readyState;function onpopstate(e){var state,path;loaded&&(state=e.state||{},(!1!==previousPopState.navigate?(previousPopState=state,1):(previousPopState=state,0))&&(e.state?(path=e.state.path,page.replace(path,e.state,null,null,!0)):page.show(location.pathname+location.hash,void 0,void 0,!1,!0)))}function decodeURLEncodedURIComponent(val){return"string"!=typeof val?val:decodeURIComponent(val.replace(/\+/g," "))}function Context(path,state){"/"===path[0]&&0!==path.indexOf(base)&&(path=base+"#!"+path);var i=path.indexOf("?");this.canonicalPath=path,this.path=path.replace(base,"")||"/",this.path=this.path.replace("#!","")||"/",this.title=document.title,this.state=state||{},this.state.path=path,this.querystring=~i?decodeURLEncodedURIComponent(path.slice(i+1)):"",this.pathname=decodeURLEncodedURIComponent(~i?path.slice(0,i):path),this.hash=""}_dom.default.addEventListener(window,"load",function(){setTimeout(function(){loaded=!0},0)},{once:!0}),page.start=function(options){var url,href;!1!==(options=options||{}).popstate&&window.addEventListener("popstate",onpopstate,!1),~location.hash.indexOf("#!")?(url=location.hash.substr(2),(href=location.href.toString()).indexOf("?")>=href.indexOf("#!")&&(url+=location.search)):url=location.pathname+location.search+location.hash,page.replace(url,null,!0,!0)},page.show=function(path,state,dispatch,push,isBack){var ctx=new Context(path,state);return ctx.isBack=isBack,page.current=ctx.path,!1!==dispatch&&page.dispatch(ctx),!1!==ctx.handled&&!1!==push&&ctx.pushState(),ctx},page.restorePreviousState=function(){prevContext=prevPageContext,page.show(prevContext.pathname,prevContext.state,!1,!0,!1)},page.back=function(path,state){history.back()},page.canGoBack=function(){return 1<history.length},page.replace=function(path,state,init,dispatch,isBack){var ctx=new Context(path,state);return ctx.isBack=isBack,page.current=ctx.path,ctx.init=init,ctx.save(),!1!==dispatch&&page.dispatch(ctx),ctx},page.getRoute=function(path){var callbacks=page.callbacks,qsIndex=path.indexOf("?"),route=callbacks[(~qsIndex?path.slice(0,qsIndex):path).toUpperCase()];return route?route.routeInfo:null},page.dispatch=function(ctx){prevPageContext=prevContext,prevContext=ctx;var callbacks=page.callbacks,path=ctx.path;if(path===page.current){var qsIndex=path.indexOf("?"),route=callbacks[(~qsIndex?path.slice(0,qsIndex):path).toUpperCase()];return route?route.fn(ctx,route.routeInfo):void 0}ctx.handled=!1},Context.prototype.pushState=function(){history.pushState(this.state,this.title,"/"!==this.path?"#!"+this.path:this.canonicalPath)},Context.prototype.save=function(){history.replaceState(this.state,this.title,"/"!==this.path?"#!"+this.path:this.canonicalPath)};var previousPopState={};page.pushState=function(state,title,url){url="#!"+url,history.pushState(state,title,url),previousPopState=state},page.handleAnchorClick=function(e){var path,orig,el;1===function(e){return null===(e=e||window.event).which?e.button:e.which}(e)&&(e.metaKey||e.ctrlKey||e.shiftKey||e.defaultPrevented||(el=(el=e.target)?el.closest("A"):el)&&"A"===el.nodeName&&(el.hasAttribute("download")||"external"===el.getAttribute("rel")||("#"!==el.getAttribute("href")?el.target||!function(href){var origin=location.protocol+"//"+location.hostname;location.port&&(origin+=":"+location.port);return href&&0===href.indexOf(origin)}(el.href)||(0===(orig=path=el.pathname+el.search+(el.hash||"")).indexOf(base)&&(path=path.substr(base.length)),path=path.replace("#!",""),e.preventDefault(),page.show(orig)):e.preventDefault())))},_exports.default=page});