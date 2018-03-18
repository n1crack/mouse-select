# mouse-select
Mouse selection plugin for ES2015.

## Demo
Try it: [Live demo](https://n1crack.github.io/mouse-select/demo.html)

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
