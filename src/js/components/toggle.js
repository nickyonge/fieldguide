import * as ui from "../ui";
import { TitledComponent } from "./base";

export class Toggle extends TitledComponent {

    #input;
    #label;
    #switch;

    /**
     * Create a new Toggle component, toggle switch that can be clicked on/off 
     * @param {string} [componentTitle = undefined] 
     * @param {(checked?:boolean, targetID?:string, target?:Element) => void} [onChangeCallback = undefined]
     * @param {boolean} [initialState = false] 
     */
    constructor(componentTitle, onChangeCallback, initialState = false) {
        super(componentTitle, false);

        ui.AddClassesToDOM(this.div, 'toggle');
        this.#input = ui.CreateInputWithID('checkbox', String(this.uniqueComponentID), 'toggle');
        this.#label = ui.CreateElementWithClass('label', 'toggleLabel', 'selectable');
        ui.AddElementAttribute(this.#label, 'for', this.uniqueComponentID);
        this._titleElement = ui.CreateElement('span');
        this.#switch = ui.CreateElementWithClass('span', 'toggleSwitch');

        ui.MakeTabbableWithInputTo(this.#switch, this.#input);

        this.#input.checked = initialState;

        this.div.appendChild(this.#input);
        this.div.appendChild(this.#label);
        this.#label.appendChild(this._titleElement);
        this.#label.appendChild(this.#switch);

        if (onChangeCallback) {
            this.#input.addEventListener('change', (event) => {
                let target = /** @type {Element} */ (event.target);
                // callback has three params: current state, fully unique id of the option label, and event target 
                onChangeCallback(target.checked, target == null ? null : target.id, target);
            });
        }
        this.addHelpIcon(`help me! ${1}`, true, false);
    }

    get checked() {
        if (!this.#input) {
            return false;
        }
        return this.#input.checked;
    }

}
