import { BasicComponent, TitledComponent } from "./base";
import * as ui from '../ui';

export class Button extends TitledComponent {

    /** 
     * Get/set the text on this {@linkcode Button}. 
     * Null text is automatically set to `""` blank.
     * @returns {string}
    */
    get text() {
        if (this.#text == null) {
            this.#text = '';
        }
        return this.#text;
    }
    /** @param {string} text Text value to set */
    set text(text) {
        if (text == null) { text = ''; }
        if (this.#text == text) {
            return;
        }
        this.#text = text;
        this.#updateText();
    }
    /** Local definition for {@linkcode text} @type {string} */
    #text = '';

    /** Gets this button's `<button>` HTML div @type {HTMLElement} */
    get button() { return this.#button; }
    /** `<button>` div @type {HTMLElement} */
    #button;
    /** Drop shadow div @type {HTMLElement} */
    #shadow;
    /** Edge of the button div @type {HTMLElement} */
    #edge;
    /** Face of the button div, where text goes @type {HTMLElement} */
    #front;
    /** Extended area for easier cursor selection @type {HTMLElement} */
    #hoverArea;

    /** 
     * Function called whenever the button is clicked 
     * @type {(component?:Button) => void} 
     */
    onClickCallback;

    /**
     * Interactive button component 
     * @param {string} text Text to appear on the button's face 
     * @param {(component?:Button) => void} [onClickCallback = undefined]
     */
    constructor(text, onClickCallback) {

        super(text, false);

        if (onClickCallback) {
            this.onClickCallback = onClickCallback;
        }

        this.#button = ui.CreateElementWithClass('button', 'pushable');
        this.#shadow = ui.CreateElementWithClass('span', 'shadow');
        this.#edge = ui.CreateElementWithClass('span', 'edge');
        this.#front = ui.CreateElementWithClass('span', 'front');
        this.#hoverArea = ui.CreateElementWithClass('span', 'hoverArea');

        this.#button.appendChild(this.#hoverArea);
        this.#button.appendChild(this.#shadow);
        this.#button.appendChild(this.#edge);
        this.#button.appendChild(this.#front);
        this.div.appendChild(this.#button);

        this.#button.addEventListener('click', this.#onClick);
        this.text = text;
    }

    /**
     * on click event 
     * @param {PointerEvent} event 
     */
    #onClick(event) {
        event.stopPropagation();
        event.preventDefault();
        if (this.onClickCallback) {
            this.onClickCallback(this);
        } else {
            console.warn("Button was clicked, but no onClickCallback is defined", this);
        }
    }

    #updateText() {
        this.#front.innerText = this.text;
    }

}