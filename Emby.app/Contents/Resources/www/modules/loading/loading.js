define(["exports"],function(_exports){var loadingElem;Object.defineProperty(_exports,"__esModule",{value:!0}),_exports.default=void 0,require(["css!./modules/loading/loading.css"]);var _default={show:function(){var elem=loadingElem;elem||(elem=document.createElement("div"),(loadingElem=elem).classList.add("mdl-spinner"),elem.innerHTML='<div class="mdl-spinner__layer mdl-spinner__layer-1"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle mdl-spinner__circleLeft"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle mdl-spinner__circleRight"></div></div></div>',document.body.appendChild(elem)),elem.classList.remove("hide")},hide:function(){loadingElem&&loadingElem.classList.add("hide")}};_exports.default=_default});