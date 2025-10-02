/**
 * MouseSelect - A modern JavaScript library for mouse-based selection
 * @class MouseSelect
 */
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
        // Validate and set options
        this.options = this._validateOptions(options);
        
        // State management
        this.enabled = false;
        this.isSelecting = false;
        this.selectedItems = new Set();
        this.startPosition = { x: 0, y: 0 };
        this.selectionBox = { top: 0, left: 0, width: 0, height: 0 };
        
        // DOM elements
        this.container = this._getContainer();
        this.selectableElements = [];
        this.selectionBoxElement = null;
        
        // Event handlers
        this.eventHandlers = {
            onStart: this.options.onStart,
            onSelect: this.options.onSelect,
            onEnd: this.options.onEnd,
            onClear: this.options.onClear
        };
        
        // Initialize the library
        this._initialize();
        
        // Auto-start if enabled
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
            container: '#mselect',
            selectable: '*',
            styles: {
                position: 'absolute',
                opacity: '0.25',
                display: 'block',
                border: '1px solid #00bfff',
                background: 'rgba(135, 206, 250, 0.3)',
                zIndex: '9999',
                pointerEvents: 'none'
            },
            multiSelect: true,
            autoStart: false,
            onStart: null,
            onSelect: null,
            onEnd: null,
            onClear: null
        };
        
        return { ...defaults, ...options };
    }
    
    /**
     * Gets the container element
     * @private
     */
    _getContainer() {
        const container = typeof this.options.container === 'string' 
            ? document.querySelector(this.options.container)
            : this.options.container;
            
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
        this.selectionBoxElement = document.createElement('div');
        this.selectionBoxElement.className = 'mouse-select-box';
        
        // Apply custom styles
        Object.assign(this.selectionBoxElement.style, this.options.styles);
        
        // Hide initially
        this.selectionBoxElement.style.display = 'none';
        
        // Ensure container is positioned relatively
        const containerStyle = window.getComputedStyle(this.container);
        if (containerStyle.position === 'static') {
            this.container.style.position = 'relative';
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
        
        this.container.addEventListener('mousedown', this._boundMouseDown);
        document.addEventListener('mousemove', this._boundMouseMove);
        document.addEventListener('mouseup', this._boundMouseUp);
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
        
        // Prevent default to avoid text selection
        e.preventDefault();
        
        // Clear previous selection if not multi-select
        if (!this.options.multiSelect) {
            this.clearSelection();
        }
        
        // Get starting position relative to container
        const rect = this.container.getBoundingClientRect();
        this.startPosition = {
            x: e.clientX - rect.left + this.container.scrollLeft,
            y: e.clientY - rect.top + this.container.scrollTop
        };
        
        this.isSelecting = true;
        this.selectionBoxElement.style.display = 'block';
        
        // Call onStart callback
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
        
        // Get current position relative to container
        const rect = this.container.getBoundingClientRect();
        const currentPosition = {
            x: e.clientX - rect.left + this.container.scrollLeft,
            y: e.clientY - rect.top + this.container.scrollTop
        };
        
        // Calculate selection box dimensions
        this.selectionBox = {
            left: Math.min(this.startPosition.x, currentPosition.x),
            top: Math.min(this.startPosition.y, currentPosition.y),
            width: Math.abs(currentPosition.x - this.startPosition.x),
            height: Math.abs(currentPosition.y - this.startPosition.y)
        };
        
        // Update selection box visual
        this._updateSelectionBox();
        
        // Check for intersections with selectable elements
        this._checkIntersections();
    }
    
    /**
     * Handles mouse up events
     * @private
     */
    _handleMouseUp(e) {
        if (!this.enabled || !this.isSelecting) return;
        
        this.isSelecting = false;
        this.selectionBoxElement.style.display = 'none';
        
        // Call onEnd callback
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
            
            // Convert element position to container-relative coordinates
            const elementPos = {
                left: elementRect.left - containerRect.left + this.container.scrollLeft,
                top: elementRect.top - containerRect.top + this.container.scrollTop,
                right: elementRect.right - containerRect.left + this.container.scrollLeft,
                bottom: elementRect.bottom - containerRect.top + this.container.scrollTop
            };
            
            // Check if element intersects with selection box
            const intersects = !(
                elementPos.right < this.selectionBox.left ||
                elementPos.left > this.selectionBox.left + this.selectionBox.width ||
                elementPos.bottom < this.selectionBox.top ||
                elementPos.top > this.selectionBox.top + this.selectionBox.height
            );
            
            if (intersects) {
                if (!this.selectedItems.has(element)) {
                    this.selectedItems.add(element);
                    
                    // Call onSelect callback
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
        this.selectionBoxElement.style.display = 'none';
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
        
        // Call onClear callback
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
        
        // Remove event listeners
        this.container.removeEventListener('mousedown', this._boundMouseDown);
        document.removeEventListener('mousemove', this._boundMouseMove);
        document.removeEventListener('mouseup', this._boundMouseUp);
        
        // Remove selection box element
        if (this.selectionBoxElement && this.selectionBoxElement.parentNode) {
            this.selectionBoxElement.parentNode.removeChild(this.selectionBoxElement);
        }
        
        // Clear references
        this.selectedItems.clear();
        this.selectableElements = [];
    }
}

// Export the new MouseSelect class as default
export default MouseSelect;

// Export as mselect for backward compatibility
export { MouseSelect as mselect };

// Also export as named export
export { MouseSelect };