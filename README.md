# mouse-select
An elegant javascript class for mouse selection.

## Demo
Try it: [Live demo](https://codepen.io/anon/pen/vrWXxX)

## installation
````
npm install mouse-select
````

## basic usage
````javascript
import mselect from 'mouse-select';

window.select = new mselect({
    el: 'ul'
});

select.onSelect(function (item, index) {
    // add active class to selected items.
    item.classList.add('active');

}).onClear(function () {
    // when starting new selection, remove existing selection
    document.querySelectorAll('li.active')
        .forEach(function (el) {
            el.classList.remove("active")
        });
});

````
