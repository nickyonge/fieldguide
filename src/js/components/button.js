import { TitledComponent } from "./base";
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

    #button;
    #shadow;
    #edge;
    #front;
    #hoverArea;

    constructor(text, title) {

        super(title, false);

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
        
        this.text = text;

    }

    #updateText() {
        this.#front.innerText = this.text;
    }

}