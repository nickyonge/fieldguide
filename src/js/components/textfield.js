import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";

/**
 * Creates a new {@linkcode TextField} component, 
 * which displays the given text in its {@linkcode div}.
 */
export class TextField extends TitledComponent {

    /** 
     * Get/set the text in this {@linkcode TextField}. 
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
    #text = '';

    /**
     * @param {string?} text Text to display. Can be set later via 
     * {@linkcode text myTextField.text}, blank by default. 
     * @param {string?} title Title to display for this component. 
     * Optional, generally unncessary, `null` by default. 
     */
    constructor(text = '', title = null) {
        super(title);
        ui.AddClassesToDOM(this.div, 'textField');
        this.text = text;
    }

    /** Updates the {@linkcode TextField} text div. @returns {void} */
    #updateText() {
        this.div.innerText = this.text;
    }

}
