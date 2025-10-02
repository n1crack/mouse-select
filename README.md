# MouseSelect

A modern, elegant JavaScript library for mouse-based selection with customizable styling and comprehensive API.

[![npm version](https://badge.fury.io/js/mouse-select.svg)](https://badge.fury.io/js/mouse-select)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Precise Selection**: Accurate mouse-based selection with customizable selection box
- 🎨 **Customizable Styling**: Full control over selection box appearance
- 🔄 **Multi-Selection Support**: Choose between single or multi-selection modes
- 📱 **Responsive**: Works seamlessly across different screen sizes
- 🚀 **Modern API**: Clean, intuitive API with method chaining
- 🔧 **Event System**: Comprehensive event callbacks for all selection states
- 🧹 **Memory Management**: Proper cleanup and event listener management
- 📦 **Zero Dependencies**: Lightweight with no external dependencies
- 🔄 **Backward Compatible**: Maintains compatibility with v1.x API

## Installation

```bash
npm install mouse-select
```

## Quick Start

```javascript
import MouseSelect from 'mouse-select';

// Basic usage
const selector = new MouseSelect({
    container: '#my-container',
    selectable: '.selectable-item'
});

selector.enable();

// With event handlers
selector
    .on('onSelect', (element, index, selectedItems) => {
        element.classList.add('selected');
        console.log(`Selected ${selectedItems.length} items`);
    })
    .on('onClear', () => {
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
    });
```

## API Reference

### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | `string\|HTMLElement` | `'#mselect'` | Container element selector or DOM element |
| `selectable` | `string` | `'*'` | CSS selector for selectable elements |
| `styles` | `Object` | See below | Custom styles for selection box |
| `multiSelect` | `boolean` | `true` | Allow multiple selections |
| `autoStart` | `boolean` | `false` | Start selection immediately |
| `onStart` | `Function` | `null` | Callback when selection starts |
| `onSelect` | `Function` | `null` | Callback when items are selected |
| `onEnd` | `Function` | `null` | Callback when selection ends |
| `onClear` | `Function` | `null` | Callback when selection is cleared |

### Default Selection Box Styles

```javascript
{
    position: 'absolute',
    opacity: '0.25',
    display: 'block',
    border: '1px solid #00bfff',
    background: 'rgba(135, 206, 250, 0.3)',
    zIndex: '9999',
    pointerEvents: 'none'
}
```

### Methods

#### `enable()`
Enables mouse selection.
```javascript
selector.enable();
```

#### `disable()`
Disables mouse selection.
```javascript
selector.disable();
```

#### `getSelected()`
Returns array of currently selected elements.
```javascript
const selected = selector.getSelected();
console.log(`Selected ${selected.length} items`);
```

#### `clearSelection()`
Clears the current selection.
```javascript
selector.clearSelection();
```

#### `refresh()`
Refreshes the list of selectable elements (useful after DOM changes).
```javascript
selector.refresh();
```

#### `on(event, handler)`
Sets event handlers with method chaining.
```javascript
selector
    .on('onSelect', (element, index, selectedItems) => {
        // Handle selection
    })
    .on('onClear', () => {
        // Handle clear
    });
```

#### `destroy()`
Destroys the instance and cleans up event listeners.
```javascript
selector.destroy();
```

### Events

#### `onStart(event)`
Triggered when selection starts.
- `event`: Mouse event object

#### `onSelect(element, index, selectedItems)`
Triggered when an element is selected.
- `element`: Selected DOM element
- `index`: Index of the element
- `selectedItems`: Array of all currently selected items

#### `onEnd(event, selectedItems)`
Triggered when selection ends.
- `event`: Mouse event object
- `selectedItems`: Array of all selected items

#### `onClear()`
Triggered when selection is cleared.

## Examples

### Basic Selection

```html
<div id="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
</div>

<script>
import MouseSelect from 'mouse-select';

const selector = new MouseSelect({
    container: '#container',
    selectable: '.item'
});

selector.enable();
</script>
```

### Custom Styling

```javascript
const selector = new MouseSelect({
    container: '#container',
    selectable: '.item',
    styles: {
        border: '2px dashed #ff6b6b',
        background: 'rgba(255, 107, 107, 0.2)',
        borderRadius: '4px'
    }
});
```

### Single Selection Mode

```javascript
const selector = new MouseSelect({
    container: '#container',
    selectable: '.item',
    multiSelect: false
});
```

### Advanced Usage with Events

```javascript
const selector = new MouseSelect({
    container: '#container',
    selectable: '.item',
    onStart: (e) => {
        console.log('Selection started');
        // Clear previous selections
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
    },
    onSelect: (element, index, selectedItems) => {
        element.classList.add('selected');
        console.log(`Selected: ${element.textContent}`);
    },
    onEnd: (e, selectedItems) => {
        console.log(`Selection complete: ${selectedItems.length} items`);
    }
});

selector.enable();
```

### Dynamic Content

```javascript
const selector = new MouseSelect({
    container: '#container',
    selectable: '.dynamic-item'
});

// After adding new items to DOM
selector.refresh();

// Get selected items
const selected = selector.getSelected();
selected.forEach(item => {
    console.log(item.textContent);
});
```

## Migration from v1.x

The new version maintains backward compatibility with the old API:

```javascript
// Old API (still works)
import mselect from 'mouse-select';
const selector = new mselect({
    el: '#container',
    nodes: '.item',
    mousedown: () => console.log('start'),
    mousemove: (item) => item.classList.add('selected'),
    mouseup: () => console.log('end')
});

// New API (recommended)
import MouseSelect from 'mouse-select';
const selector = new MouseSelect({
    container: '#container',
    selectable: '.item',
    onStart: () => console.log('start'),
    onSelect: (item) => item.classList.add('selected'),
    onEnd: () => console.log('end')
});
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT © [Yusuf Özdemir](https://github.com/n1crack)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
