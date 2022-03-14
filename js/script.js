// да, это можно организовать лучше, сделать наследование и всё такое, но по ТЗ класс должен быть один))
document.querySelector('html').classList.remove('no-js');

class VideoPopup {
    constructor(props) {
        const defaultConfig = {
            linkAttrName: 'data-popup',
        };

        this.config = Object.assign(defaultConfig, props); // вдруг когда-то кому-то захочется ещё пропсов накидать

        this.init();
    }

    // да, я в курсе про # но не везде пока норм работает))
    static _shadow = false;

    init() {
        this.isOpened = false;
        this.openedWindow = false;
        this.starterElement = false;
        this._nextWindows = false;
        this.hrefLink = false;
        this.popupClass = false;
        this._focusElements = [
            'a[href]',
            'button:not([disabled]):not([aria-hidden])',
            'iframe',
            'object',
            'embed',
            '[tabindex]',
        ];

        this._EventClick = function (e) {
            const clickedLink = e.target.closest('[' + this.config.linkAttrName + ']');

            if (clickedLink) {
                e.preventDefault();

                this.starterElement = clickedLink;

                const targetPopup = this.starterElement.getAttribute(this.config.linkAttrName);
                this.popupClass = targetPopup.slice(1);
                this.hrefLink = this.starterElement.href;
                this._nextWindows = document.querySelector(targetPopup);

                this.open();
                return;
            }

            if (e.target.closest('[data-close]') || e.target.closest('.window-shadow')) {
                this.close();
                return;
            }
        };

        this._EventKeydown = function (e) {
            if (e.which === 27 && this.isOpened) {
                e.preventDefault();
                this.close();
                return;
            }

            if (e.which === 9 && this.isOpened) {
                this.focusCatcher(e);
                return;
            }
        };

        this._bindEventClick = this._EventClick.bind(this);
        this._bindEventKeydown = this._EventKeydown.bind(this);

        if (!VideoPopup._shadow) {
            VideoPopup._shadow = document.createElement('div');
            VideoPopup._shadow.classList.add('window-shadow');
            document.body.appendChild(VideoPopup._shadow);
        }

        this.generateEvents();
    }

    generateEvents() {
        document.addEventListener('click', this._bindEventClick);

        window.addEventListener('keydown', this._bindEventKeydown);
    }

    open() {
        this.openedWindow = this._nextWindows;

        if (!this.openedWindow) {
            throw new Error('No target window');
            return;
        }

        if (!this.hrefLink) {
            throw new Error('No reference to video');
            return;
        }

        const video = this.hrefLink.split('?v=');

        if(!video[1]) {
            throw new Error('Invalid video link');
            return;
        }

        const popup = this.openedWindow.content.cloneNode(true);
        popup.querySelector('.popup').classList.add(this.popupClass);

        const frame = popup.querySelector('iframe');
        frame.src = `https://www.youtube.com/embed/${video[1]}`;

        this._popup = popup;
        this.isOpened = true;

        VideoPopup._shadow.classList.add('widow-shadow--showed');
        document.body.appendChild(this._popup);
        document.querySelector(`.${this.popupClass} [data-close]`).focus();
    }

    close() {
        if (!this.isOpened) {
            return;
        }

        VideoPopup._shadow.classList.remove('widow-shadow--showed');
        document.querySelector(`.${this.popupClass}`).remove();

        this.starterElement.focus();
        this.isOpened = false;
    }

    focusCatcher(e) {
        const popup = document.querySelector(`.${this.popupClass}`);
        const nodes = popup.querySelectorAll(this._focusElements);
        const nodesArray = Array.prototype.slice.call(nodes);

        if (!popup.contains(document.activeElement)) {
            nodesArray[0].focus();
            e.preventDefault();
        } else {
            const focusedItemIndex = nodesArray.indexOf(document.activeElement);

            if (e.shiftKey && focusedItemIndex === 0) {
                nodesArray[nodesArray.length - 1].focus();
                e.preventDefault();
            }

            if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
                nodesArray[0].focus();
                e.preventDefault();
            }
        }
    }


    destroy() {
        document.removeEventListener('click', this._bindEventClick);
        window.removeEventListener('keydown', this._bindEventKeydown);
    }
};

const myModal = new VideoPopup({
    linkAttrName: 'data-video-popup',
});
