/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__src_index__ = __webpack_require__(2);


window.select = new __WEBPACK_IMPORTED_MODULE_0__src_index__["a" /* default */]({
    el: 'ul'
});

select.onSelect(function (item, index) {
    // add active class to selected items.
    item.classList.add('active');
}).onClear(function () {
    // when starting new selection, remove existing selection
    document.querySelectorAll('li.active').forEach(function (el) {
        el.classList.remove("active");
    });
});

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mselect = function () {
    function mselect(options) {
        _classCallCheck(this, mselect);

        this.enabled = false;
        this.selection = false;

        this.el = options.el || "#mselect";
        this.nodes = options.nodes || '*';
        this.container = document.querySelector(this.el);

        this.x1 = 0;
        this.y1 = 0;
        this.box = {};

        this.selectbox = document.createElement('div');
        this.selectbox.setAttribute('style', 'position:absolute;opacity: 0.25;' + 'display:block;border: 1px solid deepskyblue;background: lightblue;z-index: 9999');
        this.container.appendChild(this.selectbox);
        this.container.setAttribute('style', 'position:relative');

        window.addEventListener("mousemove", this.calcSelection.bind(this));
        window.addEventListener("mouseup", this.stopSelection.bind(this));
        this.container.addEventListener("mousedown", this.startSelection.bind(this));
    }

    _createClass(mselect, [{
        key: 'enable',
        value: function enable() {
            this.enabled = true;
            return this;
        }
    }, {
        key: 'disable',
        value: function disable() {
            this.enabled = false;
            return this;
        }
    }, {
        key: 'onClear',
        value: function onClear(func) {
            this.clear = func;
            return this;
        }
    }, {
        key: 'onSelect',
        value: function onSelect(func) {
            this.select = func;
            return this;
        }
    }, {
        key: 'startSelection',
        value: function startSelection(e) {
            if (this.enabled && e.which === 1) {
                this.x1 = e.pageX - this.container.getBoundingClientRect().left - window.scrollX + this.container.scrollLeft;
                this.y1 = e.pageY - this.container.getBoundingClientRect().top - window.scrollY + this.container.scrollTop;
                this.selection = true;
            }
        }
    }, {
        key: 'stopSelection',
        value: function stopSelection(e) {
            if (this.enabled && e.which === 1) {
                this.selection = false;
                Object.assign(this.selectbox.style, { top: 0, left: 0, width: 0, height: 0 });
            }
        }
    }, {
        key: 'calcSelection',
        value: function calcSelection(e) {
            if (this.enabled && this.selection) {

                var x = e.pageX - this.container.getBoundingClientRect().left - window.scrollX + this.container.scrollLeft;
                var y = e.pageY - this.container.getBoundingClientRect().top - window.scrollY + this.container.scrollTop;

                this.box.top = Math.max(0, Math.min(y, this.y1));
                this.box.left = Math.max(0, Math.min(x, this.x1));

                if (this.y1 < y) {
                    this.box.height = Math.min(this.container.offsetHeight - this.y1 + this.container.scrollTop, y - this.y1);
                } else {
                    this.box.height = Math.min(this.y1 + this.container.scrollTop, this.y1 - y);
                }

                if (this.x1 < x) {
                    this.box.width = Math.min(this.container.offsetWidth - this.x1 + this.container.scrollLeft, x - this.x1);
                } else {
                    this.box.width = Math.min(this.x1 + this.container.scrollLeft, this.x1 - x);
                }

                Object.assign(this.selectbox.style, this.getPositionsInPixels());

                if (typeof this.clear === "function") {
                    this.clear();
                }

                this.container.querySelectorAll(this.nodes).forEach(function (item, index) {
                    if (this.box.top < item.offsetTop + item.offsetHeight && this.box.top + this.box.height > item.offsetTop && this.box.left < item.offsetLeft + item.offsetWidth && this.box.left + this.box.width > item.offsetLeft) {
                        if (typeof this.select === "function") {
                            this.select(item, index);
                        }
                    }
                }.bind(this));
            }
        }
    }, {
        key: 'getPositionsInPixels',
        value: function getPositionsInPixels() {
            return Object.assign.apply(Object, _toConsumableArray(Object.entries(this.box).map(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    k = _ref2[0],
                    v = _ref2[1];

                return _defineProperty({}, k, v + 'px');
            })));
        }
    }]);

    return mselect;
}();

/* harmony default export */ __webpack_exports__["a"] = (mselect);

/***/ })
/******/ ]);