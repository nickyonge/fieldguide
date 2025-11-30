import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";
// import Coloris from "@melloware/coloris";

/** if true, inserts an intermediary container between coloris and div */
const useColorisContainer = true;

export class ColorPicker extends TitledComponent {

    #coloris;
    #button;
    #input;

    #enableAlpha

    // default color
    // enable alpha
    // swatches


    get color() {
        return this.#input.value;
    }
    set color(c) {
        if (c == this.color) { return; }
        this.#input.value = c;
        this.UpdateColor();
    }

    constructor(componentTitle, onChangeCallback, defaultColor = '#beeeef', enableAlpha = false) {
        super(componentTitle);

        this.#enableAlpha = enableAlpha;

        this.#button = ui.CreateElement('button');
        ui.AddElementAttributes(this.#button, ['type', 'aria-labelledby'], ['button', 'clr-open-label']);
        this.#input = ui.CreateInputWithID('text', `${this.uniqueComponentName}_tx`);
        ui.AddElementAttribute(this.#input, 'data-coloris', '');

        if (useColorisContainer) {
            ui.AddClassesToDOM(this.div, 'colorPicker', 'clr-container');
            this.#coloris = ui.CreateDivWithClass('colorPicker', 'clr-field');
            this.#coloris.appendChild(this.#button);
            this.#coloris.appendChild(this.#input);
            this.div.appendChild(this.#coloris);
        } else {
            ui.AddClassesToDOM(this.div, 'colorPicker', 'clr-field');
            this.div.appendChild(this.#button);
            this.div.appendChild(this.#input);
        }

        // on change callback returns 2 params, the color changed to, and a reference to this ColorPicker component 
        this.#input.addEventListener('click', function () {
            // @ts-ignore - just ignoring TS errors on external libraries 
            // Coloris({
            //     alpha: this.#enableAlpha,
            //     onChange: onChangeCallback ? (color) => { onChangeCallback(color, this); } : undefined,
            // });
            this.UpdateColor();
        }.bind(this));

        // see https://github.com/mdbassit/Coloris?tab=readme-ov-file#events
        // this.#input.addEventListener('open', event => { }); // colorPicker opened
        // this.#input.addEventListener('close', event => { }); // colorPicker closed
        // this.#input.addEventListener('input', event => { }); // new color value is selected
        // this.#input.addEventListener('change', event => { }); // colorPicker closed AND changed

        this.addHelpIcon(`help me! ${componentTitle}`);

        if (defaultColor) {
            this.color = defaultColor;
        }
    }

    DocumentLoaded() {
        this.UpdateColor();
    }

    /** manually update the color, ensure the thumbnail icon matches the color input */
    UpdateColor() {
        this.#input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}
