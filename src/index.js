class mselect {

    constructor(options) {
        this.enabled = false;
        this.selection = false;

        this.el = options.el || "#mselect";
        this.nodes = options.nodes || '*';
        this.container = document.querySelector(this.el);

        this.x1 = 0;
        this.y1 = 0;
        this.box = {};

        this.mousedown =options.mousedown || false;
        this.mouseup =options.mouseup || false;
        this.mousemove =options.mousemove || false;


        this.selectbox = document.createElement('div');
        this.selectbox.setAttribute('style', 'position:absolute;opacity: 0.25;' +
            'display:block;border: 1px solid deepskyblue;background: lightblue;z-index: 9999');
        this.container.appendChild(this.selectbox);
        this.container.setAttribute('style', 'position:relative');

        window.addEventListener("mousemove", (this.calcSelection).bind(this));
        window.addEventListener("mouseup", this.stopSelection.bind(this));
        this.container.addEventListener("mousedown", this.startSelection.bind(this));
    }

    enable() {
        this.enabled = true;
        return this;
    }

    disable() {
        this.enabled = false;
        return this;
    }

    startSelection(e) {
        if (this.enabled && e.which === 1) {
            this.x1 = e.pageX - this.container.getBoundingClientRect().left - window.scrollX + this.container.scrollLeft;
            this.y1 = e.pageY - this.container.getBoundingClientRect().top - window.scrollY + this.container.scrollTop;
            this.selection = true;
        }
    }

    stopSelection(e) {
        if (this.enabled && e.which === 1) {
            this.selection = false;
            Object.assign(this.selectbox.style, {top: 0, left: 0, width: 0, height: 0});
            if (typeof this.mouseup === "function") {
                this.mouseup();
            }
        }
    }

    calcSelection(e) {
        if (this.enabled && this.selection) {

            let x = e.pageX - this.container.getBoundingClientRect().left - window.scrollX + this.container.scrollLeft;
            let y = e.pageY - this.container.getBoundingClientRect().top - window.scrollY + this.container.scrollTop;

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

            if (typeof this.mousedown === "function") {
                this.mousedown();
            }

            this.container.querySelectorAll(this.nodes)
                .forEach(function (item, index) {
                    if ((this.box.top < (item.offsetTop + item.offsetHeight))
                        && ((this.box.top + this.box.height) > (item.offsetTop))
                        && ((this.box.left) < (item.offsetLeft + item.offsetWidth))
                        && ((this.box.left + this.box.width) > (item.offsetLeft))
                    ) {
                        if (typeof this.mousemove === "function") {
                            this.mousemove(item, index);
                        }
                    }
                }.bind(this))

        }
    }

    getPositionsInPixels() {
        return Object.assign(...Object.entries(this.box).map(([k, v]) => ({[k]: v + 'px'})));
    }
}

export default mselect;