# mouse-select
Mouse selection plugin for native javascript.

## basic usage

````javascript
import mselect from '../src/index';

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
