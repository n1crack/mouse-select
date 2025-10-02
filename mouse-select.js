(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.MouseSelect = {}));
})(this, function(exports2) {
  "use strict";var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

  class MouseSelect {
    /**
     * Creates a new MouseSelect instance
     * @param {Object} options - Configuration options
     * @param {string|HTMLElement} options.container - Container element selector or element
     * @param {string} options.selectable - CSS selector for selectable elements
     * @param {Object} options.styles - Custom styles for selection box
     * @param {boolean} options.multiSelect - Allow multiple selections
     * @param {boolean} options.autoStart - Start selection immediately
     * @param {Function} options.onStart - Callback when selection starts
     * @param {Function} options.onSelect - Callback when items are selected
     * @param {Function} options.onEnd - Callback when selection ends
     * @param {Function} options.onClear - Callback when selection is cleared
     */
    constructor(options = {}) {
      this.options = this._validateOptions(options);
      this.enabled = false;
      this.isSelecting = false;
      this.selectedItems = /* @__PURE__ */ new Set();
      this.startPosition = { x: 0, y: 0 };
      this.selectionBox = { top: 0, left: 0, width: 0, height: 0 };
      this.container = this._getContainer();
      this.selectableElements = [];
      this.selectionBoxElement = null;
      this.eventHandlers = {
        onStart: this.options.onStart,
        onSelect: this.options.onSelect,
        onEnd: this.options.onEnd,
        onClear: this.options.onClear
      };
      this._initialize();
      if (this.options.autoStart) {
        this.enable();
      }
    }
    /**
     * Validates and sets default options
     * @private
     */
    _validateOptions(options) {
      const defaults = {
        container: "#mselect",
        selectable: "*",
        styles: {
          position: "absolute",
          opacity: "0.25",
          display: "block",
          border: "1px solid #00bfff",
          background: "rgba(135, 206, 250, 0.3)",
          zIndex: "9999",
          pointerEvents: "none"
        },
        multiSelect: true,
        autoStart: false,
        onStart: null,
        onSelect: null,
        onEnd: null,
        onClear: null
      };
      return __spreadValues(__spreadValues({}, defaults), options);
    }
    /**
     * Gets the container element
     * @private
     */
    _getContainer() {
      const container = typeof this.options.container === "string" ? document.querySelector(this.options.container) : this.options.container;
      if (!container) {
        throw new Error(`Container element not found: ${this.options.container}`);
      }
      return container;
    }
    /**
     * Initializes the library
     * @private
     */
    _initialize() {
      this._createSelectionBox();
      this._setupEventListeners();
      this._updateSelectableElements();
    }
    /**
     * Creates the selection box element
     * @private
     */
    _createSelectionBox() {
      this.selectionBoxElement = document.createElement("div");
      this.selectionBoxElement.className = "mouse-select-box";
      Object.assign(this.selectionBoxElement.style, this.options.styles);
      this.selectionBoxElement.style.display = "none";
      const containerStyle = window.getComputedStyle(this.container);
      if (containerStyle.position === "static") {
        this.container.style.position = "relative";
      }
      this.container.appendChild(this.selectionBoxElement);
    }
    /**
     * Sets up event listeners
     * @private
     */
    _setupEventListeners() {
      this._boundMouseDown = this._handleMouseDown.bind(this);
      this._boundMouseMove = this._handleMouseMove.bind(this);
      this._boundMouseUp = this._handleMouseUp.bind(this);
      this.container.addEventListener("mousedown", this._boundMouseDown);
      document.addEventListener("mousemove", this._boundMouseMove);
      document.addEventListener("mouseup", this._boundMouseUp);
    }
    /**
     * Updates the list of selectable elements
     * @private
     */
    _updateSelectableElements() {
      this.selectableElements = Array.from(
        this.container.querySelectorAll(this.options.selectable)
      );
    }
    /**
     * Handles mouse down events
     * @private
     */
    _handleMouseDown(e) {
      if (!this.enabled || e.button !== 0) return;
      e.preventDefault();
      if (!this.options.multiSelect) {
        this.clearSelection();
      }
      const rect = this.container.getBoundingClientRect();
      this.startPosition = {
        x: e.clientX - rect.left + this.container.scrollLeft,
        y: e.clientY - rect.top + this.container.scrollTop
      };
      this.isSelecting = true;
      this.selectionBoxElement.style.display = "block";
      if (this.eventHandlers.onStart) {
        this.eventHandlers.onStart(e);
      }
    }
    /**
     * Handles mouse move events
     * @private
     */
    _handleMouseMove(e) {
      if (!this.enabled || !this.isSelecting) return;
      e.preventDefault();
      const rect = this.container.getBoundingClientRect();
      const currentPosition = {
        x: e.clientX - rect.left + this.container.scrollLeft,
        y: e.clientY - rect.top + this.container.scrollTop
      };
      this.selectionBox = {
        left: Math.min(this.startPosition.x, currentPosition.x),
        top: Math.min(this.startPosition.y, currentPosition.y),
        width: Math.abs(currentPosition.x - this.startPosition.x),
        height: Math.abs(currentPosition.y - this.startPosition.y)
      };
      this._updateSelectionBox();
      this._checkIntersections();
    }
    /**
     * Handles mouse up events
     * @private
     */
    _handleMouseUp(e) {
      if (!this.enabled || !this.isSelecting) return;
      this.isSelecting = false;
      this.selectionBoxElement.style.display = "none";
      if (this.eventHandlers.onEnd) {
        this.eventHandlers.onEnd(e, Array.from(this.selectedItems));
      }
    }
    /**
     * Updates the selection box visual
     * @private
     */
    _updateSelectionBox() {
      Object.assign(this.selectionBoxElement.style, {
        left: `${this.selectionBox.left}px`,
        top: `${this.selectionBox.top}px`,
        width: `${this.selectionBox.width}px`,
        height: `${this.selectionBox.height}px`
      });
    }
    /**
     * Checks for intersections between selection box and selectable elements
     * @private
     */
    _checkIntersections() {
      this.selectableElements.forEach((element, index) => {
        const elementRect = element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const elementPos = {
          left: elementRect.left - containerRect.left + this.container.scrollLeft,
          top: elementRect.top - containerRect.top + this.container.scrollTop,
          right: elementRect.right - containerRect.left + this.container.scrollLeft,
          bottom: elementRect.bottom - containerRect.top + this.container.scrollTop
        };
        const intersects = !(elementPos.right < this.selectionBox.left || elementPos.left > this.selectionBox.left + this.selectionBox.width || elementPos.bottom < this.selectionBox.top || elementPos.top > this.selectionBox.top + this.selectionBox.height);
        if (intersects) {
          if (!this.selectedItems.has(element)) {
            this.selectedItems.add(element);
            if (this.eventHandlers.onSelect) {
              this.eventHandlers.onSelect(element, index, Array.from(this.selectedItems));
            }
          }
        } else {
          if (this.selectedItems.has(element)) {
            this.selectedItems.delete(element);
          }
        }
      });
    }
    /**
     * Enables mouse selection
     * @returns {MouseSelect} Returns this instance for chaining
     */
    enable() {
      this.enabled = true;
      return this;
    }
    /**
     * Disables mouse selection
     * @returns {MouseSelect} Returns this instance for chaining
     */
    disable() {
      this.enabled = false;
      this.isSelecting = false;
      this.selectionBoxElement.style.display = "none";
      return this;
    }
    /**
     * Gets all currently selected items
     * @returns {Array} Array of selected DOM elements
     */
    getSelected() {
      return Array.from(this.selectedItems);
    }
    /**
     * Clears the current selection
     * @returns {MouseSelect} Returns this instance for chaining
     */
    clearSelection() {
      this.selectedItems.clear();
      if (this.eventHandlers.onClear) {
        this.eventHandlers.onClear();
      }
      return this;
    }
    /**
     * Refreshes the list of selectable elements
     * @returns {MouseSelect} Returns this instance for chaining
     */
    refresh() {
      this._updateSelectableElements();
      return this;
    }
    /**
     * Sets event handlers
     * @param {string} event - Event name (onStart, onSelect, onEnd, onClear)
     * @param {Function} handler - Event handler function
     * @returns {MouseSelect} Returns this instance for chaining
     */
    on(event, handler) {
      if (this.eventHandlers.hasOwnProperty(event)) {
        this.eventHandlers[event] = handler;
      }
      return this;
    }
    /**
     * Destroys the instance and cleans up event listeners
     */
    destroy() {
      this.disable();
      this.container.removeEventListener("mousedown", this._boundMouseDown);
      document.removeEventListener("mousemove", this._boundMouseMove);
      document.removeEventListener("mouseup", this._boundMouseUp);
      if (this.selectionBoxElement && this.selectionBoxElement.parentNode) {
        this.selectionBoxElement.parentNode.removeChild(this.selectionBoxElement);
      }
      this.selectedItems.clear();
      this.selectableElements = [];
    }
  }
  exports2.MouseSelect = MouseSelect;
  exports2.default = MouseSelect;
  exports2.mselect = MouseSelect;
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
//# sourceMappingURL=mouse-select.umd.js.map
