define(["exports","../utils/exception.js"],function(_exports,_exception){Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.BaseLoader=_exports.LoaderErrors=_exports.LoaderStatus=void 0;var LoaderStatus={kIdle:0,kConnecting:1,kBuffering:2,kError:3,kComplete:4};_exports.LoaderStatus=LoaderStatus;_exports.LoaderErrors={OK:"OK",EXCEPTION:"Exception",HTTP_STATUS_CODE_INVALID:"HttpStatusCodeInvalid",CONNECTING_TIMEOUT:"ConnectingTimeout",EARLY_EOF:"EarlyEof",UNRECOVERABLE_EARLY_EOF:"UnrecoverableEarlyEof"};var BaseLoader=function(){function BaseLoader(typeName){babelHelpers.classCallCheck(this,BaseLoader),this._type=typeName||"undefined",this._status=LoaderStatus.kIdle,this._needStash=!1,this._onContentLengthKnown=null,this._onURLRedirect=null,this._onDataArrival=null,this._onError=null,this._onComplete=null}return babelHelpers.createClass(BaseLoader,[{key:"destroy",value:function(){this._status=LoaderStatus.kIdle,this._onContentLengthKnown=null,this._onURLRedirect=null,this._onDataArrival=null,this._onError=null,this._onComplete=null}},{key:"isWorking",value:function(){return this._status===LoaderStatus.kConnecting||this._status===LoaderStatus.kBuffering}},{key:"open",value:function(){throw new _exception.NotImplementedException("Unimplemented abstract function!")}},{key:"abort",value:function(){throw new _exception.NotImplementedException("Unimplemented abstract function!")}},{key:"type",get:function(){return this._type}},{key:"status",get:function(){return this._status}},{key:"needStashBuffer",get:function(){return this._needStash}},{key:"onContentLengthKnown",get:function(){return this._onContentLengthKnown},set:function(callback){this._onContentLengthKnown=callback}},{key:"onURLRedirect",get:function(){return this._onURLRedirect},set:function(callback){this._onURLRedirect=callback}},{key:"onDataArrival",get:function(){return this._onDataArrival},set:function(callback){this._onDataArrival=callback}},{key:"onError",get:function(){return this._onError},set:function(callback){this._onError=callback}},{key:"onComplete",get:function(){return this._onComplete},set:function(callback){this._onComplete=callback}}]),BaseLoader}();_exports.BaseLoader=BaseLoader});