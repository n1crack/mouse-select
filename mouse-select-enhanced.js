// Enhanced MouseSelect with advanced features
(function() {
    'use strict';
    
    class MouseSelect {
        constructor(options = {}) {
            // Validate and set options
            this.options = this._validateOptions(options);
            
            // State management
            this.enabled = false;
            this.isSelecting = false;
            this.selectedItems = new Set();
            this.startPosition = { x: 0, y: 0 };
            this.selectionBox = { top: 0, left: 0, width: 0, height: 0 };
            
            // Keyboard selection state
            this.lastSelectedIndex = -1;
            this.keyboardEnabled = true;
            
            // Touch support state
            this.touchStartPosition = null;
            this.isTouchSelecting = false;
            
            // Drag and drop state
            this.dragEnabled = false;
            this.draggedItems = new Set();
            
            // Virtual scrolling state
            this.virtualScrolling = false;
            this.visibleRange = { start: 0, end: 0 };
            
            // DOM elements
            this.container = this._getContainer();
            this.selectableElements = [];
            this.selectionBoxElement = null;
            
            // Event handlers
            this.eventHandlers = {
                onStart: this.options.onStart,
                onSelect: this.options.onSelect,
                onEnd: this.options.onEnd,
                onClear: this.options.onClear,
                onKeyboardSelect: this.options.onKeyboardSelect,
                onTouchStart: this.options.onTouchStart,
                onTouchEnd: this.options.onTouchEnd,
                onDragStart: this.options.onDragStart,
                onDragEnd: this.options.onDragEnd
            };
            
            // Initialize the library
            this._initialize();
            
            // Auto-start if enabled
            if (this.options.autoStart) {
                this.enable();
            }
        }

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
                keyboardEnabled: true,
                touchEnabled: true,
                dragEnabled: false,
                virtualScrolling: false,
                virtualItemHeight: 50,
                validation: null, // Custom validation function
                onStart: null,
                onSelect: null,
                onEnd: null,
                onClear: null,
                onKeyboardSelect: null,
                onTouchStart: null,
                onTouchEnd: null,
                onDragStart: null,
                onDragEnd: null
            };
            
            return { ...defaults, ...options };
        }
        
        _getContainer() {
            const container = typeof this.options.container === 'string' 
                ? document.querySelector(this.options.container)
                : this.options.container;
                
            if (!container) {
                throw new Error(`Container element not found: ${this.options.container}`);
            }
            
            return container;
        }
        
        _initialize() {
            this._createSelectionBox();
            this._setupEventListeners();
            this._updateSelectableElements();
            
            // Initialize virtual scrolling if enabled
            if (this.options.virtualScrolling) {
                this._initializeVirtualScrolling();
            }
        }
        
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
        
        _setupEventListeners() {
            // Mouse events
            this._boundMouseDown = this._handleMouseDown.bind(this);
            this._boundMouseMove = this._handleMouseMove.bind(this);
            this._boundMouseUp = this._handleMouseUp.bind(this);
            
            // Keyboard events
            this._boundKeyDown = this._handleKeyDown.bind(this);
            this._boundKeyUp = this._handleKeyUp.bind(this);
            
            // Touch events
            this._boundTouchStart = this._handleTouchStart.bind(this);
            this._boundTouchMove = this._handleTouchMove.bind(this);
            this._boundTouchEnd = this._handleTouchEnd.bind(this);
            
            // Drag events
            this._boundDragStart = this._handleDragStart.bind(this);
            this._boundDragEnd = this._handleDragEnd.bind(this);
            
            // Add event listeners
            this.container.addEventListener('mousedown', this._boundMouseDown);
            document.addEventListener('mousemove', this._boundMouseMove);
            document.addEventListener('mouseup', this._boundMouseUp);
            
            if (this.options.keyboardEnabled) {
                this.container.addEventListener('keydown', this._boundKeyDown);
                this.container.addEventListener('keyup', this._boundKeyUp);
                // Make container focusable for keyboard events
                if (!this.container.hasAttribute('tabindex')) {
                    this.container.setAttribute('tabindex', '0');
                }
            }
            
            if (this.options.touchEnabled) {
                this.container.addEventListener('touchstart', this._boundTouchStart, { passive: false });
                this.container.addEventListener('touchmove', this._boundTouchMove, { passive: false });
                this.container.addEventListener('touchend', this._boundTouchEnd, { passive: false });
            }
            
            if (this.options.dragEnabled) {
                this.container.addEventListener('dragstart', this._boundDragStart);
                this.container.addEventListener('dragend', this._boundDragEnd);
            }
        }
        
        _updateSelectableElements() {
            this.selectableElements = Array.from(
                this.container.querySelectorAll(this.options.selectable)
            );
            
            // Update virtual scrolling if enabled
            if (this.options.virtualScrolling) {
                this._updateVirtualElements();
            }
        }
        
        // Keyboard Selection Methods
        _handleKeyDown(e) {
            if (!this.enabled || !this.options.keyboardEnabled) return;
            
            // Ctrl+A for select all
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.selectAll();
                return;
            }
            
            // Escape to clear selection
            if (e.key === 'Escape') {
                e.preventDefault();
                this.clearSelection();
                return;
            }
            
            // Arrow keys for navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this._handleArrowKey(e);
                return;
            }
            
            // Space for toggle selection
            if (e.key === ' ') {
                e.preventDefault();
                this._handleSpaceKey(e);
                return;
            }
        }
        
        _handleKeyUp(e) {
            // Handle any key up events if needed
        }
        
        _handleArrowKey(e) {
            if (this.selectableElements.length === 0) return;
            
            let newIndex = this.lastSelectedIndex;
            
            switch (e.key) {
                case 'ArrowUp':
                    newIndex = Math.max(0, this.lastSelectedIndex - 1);
                    break;
                case 'ArrowDown':
                    newIndex = Math.min(this.selectableElements.length - 1, this.lastSelectedIndex + 1);
                    break;
                case 'ArrowLeft':
                    // For horizontal layouts, you might want different behavior
                    newIndex = Math.max(0, this.lastSelectedIndex - 1);
                    break;
                case 'ArrowRight':
                    newIndex = Math.min(this.selectableElements.length - 1, this.lastSelectedIndex + 1);
                    break;
            }
            
            if (newIndex !== this.lastSelectedIndex) {
                if (e.shiftKey && this.lastSelectedIndex >= 0) {
                    // Range selection
                    this._selectRange(this.lastSelectedIndex, newIndex);
                } else {
                    // Single selection
                    this._selectByIndex(newIndex, !e.ctrlKey);
                }
                this.lastSelectedIndex = newIndex;
            }
        }
        
        _handleSpaceKey(e) {
            if (this.lastSelectedIndex >= 0 && this.lastSelectedIndex < this.selectableElements.length) {
                const element = this.selectableElements[this.lastSelectedIndex];
                this._toggleSelection(element);
            }
        }
        
        _selectRange(startIndex, endIndex) {
            const minIndex = Math.min(startIndex, endIndex);
            const maxIndex = Math.max(startIndex, endIndex);
            
            for (let i = minIndex; i <= maxIndex; i++) {
                const element = this.selectableElements[i];
                if (element && this._isElementSelectable(element)) {
                    this._addToSelection(element, i);
                }
            }
        }
        
        // Touch Support Methods
        _handleTouchStart(e) {
            if (!this.enabled || !this.options.touchEnabled) return;
            
            const touch = e.touches[0];
            this.touchStartPosition = {
                x: touch.clientX,
                y: touch.clientY,
                time: Date.now()
            };
            
            this.isTouchSelecting = false;
            
            // Call touch start callback
            if (this.eventHandlers.onTouchStart) {
                this.eventHandlers.onTouchStart(e);
            }
        }
        
        _handleTouchMove(e) {
            if (!this.enabled || !this.options.touchEnabled || !this.touchStartPosition) return;
            
            const touch = e.touches[0];
            const deltaX = Math.abs(touch.clientX - this.touchStartPosition.x);
            const deltaY = Math.abs(touch.clientY - this.touchStartPosition.y);
            
            // Start selection if moved enough
            if ((deltaX > 10 || deltaY > 10) && !this.isTouchSelecting) {
                this.isTouchSelecting = true;
                e.preventDefault();
                
                // Convert touch to mouse-like event
                const mouseEvent = new MouseEvent('mousedown', {
                    clientX: this.touchStartPosition.x,
                    clientY: this.touchStartPosition.y,
                    button: 0
                });
                this._handleMouseDown(mouseEvent);
            }
            
            if (this.isTouchSelecting) {
                e.preventDefault();
                
                // Convert touch to mouse-like event
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                this._handleMouseMove(mouseEvent);
            }
        }
        
        _handleTouchEnd(e) {
            if (!this.enabled || !this.options.touchEnabled) return;
            
            if (this.isTouchSelecting) {
                e.preventDefault();
                
                // Convert touch to mouse-like event
                const mouseEvent = new MouseEvent('mouseup', {
                    clientX: e.changedTouches[0].clientX,
                    clientY: e.changedTouches[0].clientY
                });
                this._handleMouseUp(mouseEvent);
            } else if (this.touchStartPosition) {
                // Single tap - toggle selection
                const touch = e.changedTouches[0];
                const deltaX = Math.abs(touch.clientX - this.touchStartPosition.x);
                const deltaY = Math.abs(touch.clientY - this.touchStartPosition.y);
                const deltaTime = Date.now() - this.touchStartPosition.time;
                
                if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                    // Single tap
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element && this.selectableElements.includes(element)) {
                        this._toggleSelection(element);
                    }
                }
            }
            
            this.isTouchSelecting = false;
            this.touchStartPosition = null;
            
            // Call touch end callback
            if (this.eventHandlers.onTouchEnd) {
                this.eventHandlers.onTouchEnd(e);
            }
        }
        
        // Drag and Drop Methods
        _handleDragStart(e) {
            if (!this.enabled || !this.options.dragEnabled) return;
            
            const element = e.target;
            if (this.selectableElements.includes(element)) {
                this.draggedItems.add(element);
                element.setAttribute('draggable', 'true');
                
                // Call drag start callback
                if (this.eventHandlers.onDragStart) {
                    this.eventHandlers.onDragStart(e, element);
                }
            }
        }
        
        _handleDragEnd(e) {
            if (!this.enabled || !this.options.dragEnabled) return;
            
            const element = e.target;
            if (this.draggedItems.has(element)) {
                this.draggedItems.delete(element);
                
                // Call drag end callback
                if (this.eventHandlers.onDragEnd) {
                    this.eventHandlers.onDragEnd(e, element);
                }
            }
        }
        
        // Virtual Scrolling Methods
        _initializeVirtualScrolling() {
            this.virtualScrolling = true;
            this.container.style.overflow = 'auto';
            this.container.addEventListener('scroll', this._handleScroll.bind(this));
        }
        
        _handleScroll() {
            if (!this.virtualScrolling) return;
            
            const scrollTop = this.container.scrollTop;
            const containerHeight = this.container.clientHeight;
            const itemHeight = this.options.virtualItemHeight;
            
            const startIndex = Math.floor(scrollTop / itemHeight);
            const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
            
            this.visibleRange = { start: startIndex, end: endIndex };
            this._updateVirtualElements();
        }
        
        _updateVirtualElements() {
            if (!this.virtualScrolling) return;
            
            // Hide elements outside visible range
            this.selectableElements.forEach((element, index) => {
                if (index < this.visibleRange.start || index > this.visibleRange.end) {
                    element.style.display = 'none';
                } else {
                    element.style.display = '';
                }
            });
        }
        
        // Selection Validation
        _isElementSelectable(element) {
            if (this.options.validation && typeof this.options.validation === 'function') {
                return this.options.validation(element);
            }
            return true;
        }
        
        // Mouse Event Handlers (Enhanced)
        _handleMouseDown(e) {
            if (!this.enabled || e.button !== 0) return;
            
            // Prevent default to avoid text selection
            e.preventDefault();
            
            // Handle Shift+click for range selection
            if (e.shiftKey && this.lastSelectedIndex >= 0) {
                const clickedElement = e.target;
                const clickedIndex = this.selectableElements.indexOf(clickedElement);
                
                if (clickedIndex >= 0) {
                    this._selectRange(this.lastSelectedIndex, clickedIndex);
                    return;
                }
            }
            
            // Handle Ctrl+click for toggle selection
            if (e.ctrlKey || e.metaKey) {
                const clickedElement = e.target;
                if (this.selectableElements.includes(clickedElement)) {
                    this._toggleSelection(clickedElement);
                    return;
                }
            }
            
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
        
        _handleMouseUp(e) {
            if (!this.enabled || !this.isSelecting) return;
            
            this.isSelecting = false;
            this.selectionBoxElement.style.display = 'none';
            
            // Call onEnd callback
            if (this.eventHandlers.onEnd) {
                this.eventHandlers.onEnd(e, Array.from(this.selectedItems));
            }
        }
        
        _updateSelectionBox() {
            Object.assign(this.selectionBoxElement.style, {
                left: `${this.selectionBox.left}px`,
                top: `${this.selectionBox.top}px`,
                width: `${this.selectionBox.width}px`,
                height: `${this.selectionBox.height}px`
            });
        }
        
        _checkIntersections() {
            this.selectableElements.forEach((element, index) => {
                if (element.style.display === 'none') return; // Skip hidden elements in virtual scrolling
                
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
                    if (!this.selectedItems.has(element) && this._isElementSelectable(element)) {
                        this._addToSelection(element, index);
                    }
                } else {
                    if (this.selectedItems.has(element)) {
                        this._removeFromSelection(element);
                    }
                }
            });
        }
        
        // Enhanced Selection Methods
        _addToSelection(element, index) {
            this.selectedItems.add(element);
            
            // Call onSelect callback
            if (this.eventHandlers.onSelect) {
                this.eventHandlers.onSelect(element, index, Array.from(this.selectedItems));
            }
            
            // Call keyboard select callback if triggered by keyboard
            if (this.eventHandlers.onKeyboardSelect) {
                this.eventHandlers.onKeyboardSelect(element, index, Array.from(this.selectedItems));
            }
        }
        
        _removeFromSelection(element) {
            this.selectedItems.delete(element);
        }
        
        _toggleSelection(element) {
            if (this.selectedItems.has(element)) {
                this._removeFromSelection(element);
            } else if (this._isElementSelectable(element)) {
                const index = this.selectableElements.indexOf(element);
                this._addToSelection(element, index);
            }
        }
        
        _selectByIndex(index, clearPrevious = true) {
            if (index < 0 || index >= this.selectableElements.length) return;
            
            const element = this.selectableElements[index];
            if (!element || !this._isElementSelectable(element)) return;
            
            if (clearPrevious) {
                this.clearSelection();
            }
            
            this._addToSelection(element, index);
            this.lastSelectedIndex = index;
        }
        
        // Public API Methods
        enable() {
            this.enabled = true;
            return this;
        }
        
        disable() {
            this.enabled = false;
            this.isSelecting = false;
            this.isTouchSelecting = false;
            this.selectionBoxElement.style.display = 'none';
            return this;
        }
        
        getSelected() {
            return Array.from(this.selectedItems);
        }
        
        clearSelection() {
            this.selectedItems.clear();
            this.lastSelectedIndex = -1;
            
            // Call onClear callback
            if (this.eventHandlers.onClear) {
                this.eventHandlers.onClear();
            }
            
            return this;
        }
        
        refresh() {
            this._updateSelectableElements();
            return this;
        }
        
        on(event, handler) {
            if (this.eventHandlers.hasOwnProperty(event)) {
                this.eventHandlers[event] = handler;
            }
            return this;
        }
        
        // New Public Methods
        selectAll() {
            this.clearSelection();
            this.selectableElements.forEach((element, index) => {
                if (this._isElementSelectable(element)) {
                    this._addToSelection(element, index);
                }
            });
            return this;
        }
        
        selectByIndex(index) {
            this._selectByIndex(index, true);
            return this;
        }
        
        selectByIndices(indices) {
            this.clearSelection();
            indices.forEach(index => {
                this._selectByIndex(index, false);
            });
            return this;
        }
        
        selectByDataAttribute(attribute, value) {
            this.clearSelection();
            this.selectableElements.forEach((element, index) => {
                if (element.getAttribute(attribute) === value && this._isElementSelectable(element)) {
                    this._addToSelection(element, index);
                }
            });
            return this;
        }
        
        selectByClass(className) {
            this.clearSelection();
            this.selectableElements.forEach((element, index) => {
                if (element.classList.contains(className) && this._isElementSelectable(element)) {
                    this._addToSelection(element, index);
                }
            });
            return this;
        }
        
        invertSelection() {
            const newSelection = new Set();
            this.selectableElements.forEach((element, index) => {
                if (!this.selectedItems.has(element) && this._isElementSelectable(element)) {
                    newSelection.add(element);
                }
            });
            this.selectedItems = newSelection;
            return this;
        }
        
        getSelectedIndices() {
            return Array.from(this.selectedItems).map(element => 
                this.selectableElements.indexOf(element)
            ).filter(index => index >= 0);
        }
        
        getSelectedData(attribute) {
            return Array.from(this.selectedItems).map(element => 
                element.getAttribute(attribute)
            );
        }
        
        enableKeyboard() {
            this.keyboardEnabled = true;
            return this;
        }
        
        disableKeyboard() {
            this.keyboardEnabled = false;
            return this;
        }
        
        enableTouch() {
            this.options.touchEnabled = true;
            return this;
        }
        
        disableTouch() {
            this.options.touchEnabled = false;
            return this;
        }
        
        enableDrag() {
            this.options.dragEnabled = true;
            this.selectableElements.forEach(element => {
                element.setAttribute('draggable', 'true');
            });
            return this;
        }
        
        disableDrag() {
            this.options.dragEnabled = false;
            this.selectableElements.forEach(element => {
                element.removeAttribute('draggable');
            });
            return this;
        }
        
        enableVirtualScrolling(itemHeight = 50) {
            this.options.virtualScrolling = true;
            this.options.virtualItemHeight = itemHeight;
            this._initializeVirtualScrolling();
            return this;
        }
        
        disableVirtualScrolling() {
            this.options.virtualScrolling = false;
            this.virtualScrolling = false;
            this.selectableElements.forEach(element => {
                element.style.display = '';
            });
            return this;
        }
        
        setValidation(validationFunction) {
            this.options.validation = validationFunction;
            return this;
        }
        
        destroy() {
            this.disable();
            
            // Remove event listeners
            this.container.removeEventListener('mousedown', this._boundMouseDown);
            document.removeEventListener('mousemove', this._boundMouseMove);
            document.removeEventListener('mouseup', this._boundMouseUp);
            
            if (this.options.keyboardEnabled) {
                this.container.removeEventListener('keydown', this._boundKeyDown);
                this.container.removeEventListener('keyup', this._boundKeyUp);
            }
            
            if (this.options.touchEnabled) {
                this.container.removeEventListener('touchstart', this._boundTouchStart);
                this.container.removeEventListener('touchmove', this._boundTouchMove);
                this.container.removeEventListener('touchend', this._boundTouchEnd);
            }
            
            if (this.options.dragEnabled) {
                this.container.removeEventListener('dragstart', this._boundDragStart);
                this.container.removeEventListener('dragend', this._boundDragEnd);
            }
            
            // Remove selection box element
            if (this.selectionBoxElement && this.selectionBoxElement.parentNode) {
                this.selectionBoxElement.parentNode.removeChild(this.selectionBoxElement);
            }
            
            // Clear references
            this.selectedItems.clear();
            this.selectableElements = [];
            this.draggedItems.clear();
        }
    }
    
    // Make MouseSelect available globally
    window.MouseSelect = MouseSelect;
})();
