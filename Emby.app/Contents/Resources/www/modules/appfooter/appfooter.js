define(["css!./appfooter"],function(){"use strict";function AppFooter(){var elem;this.element=((elem=document.createElement("div")).classList.add("appfooter"),elem.classList.add("appfooter-withbackdropfilter"),document.body.appendChild(elem),elem)}return AppFooter.prototype.add=function(elem){"string"==typeof elem?this.element.insertAdjacentHTML("beforeend",elem):this.element.appendChild(elem)},AppFooter.prototype.insert=function(elem){var thisElement=this.element;"string"==typeof elem?thisElement.insertAdjacentHTML("afterbegin",elem):thisElement.insertBefore(elem,thisElement.firstChild)},AppFooter.prototype.destroy=function(){this.element=null},AppFooter});