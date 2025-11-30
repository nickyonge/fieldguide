import * as ui from "../ui";
import { TitledComponent } from "./base";
import * as cost from '../costs';

export class Toggle extends TitledComponent {

    #input;
    #label;
    #cost;
    #costP;
    #switch;

    #costArray;
    #currentCost;

    /**
     * Create a new Toggle component, toggle switch that can be clicked on/off 
     * @param {string} [componentTitle = undefined] 
     * @param {(checked?:boolean, targetID?:string, target?:Element) => void} [onChangeCallback = undefined]
     * @param {number[]|null} [cost = undefined] 
     * @param {boolean} [initialState = false] 
     */
    constructor(componentTitle, onChangeCallback, cost, initialState = false) {
        super(componentTitle, false);

        this.#costArray = cost;
        this.#currentCost = 0;

        ui.AddClassesToDOM(this.div, 'toggle');
        this.#input = ui.CreateInputWithID('checkbox', String(this.uniqueComponentID), 'toggle');
        this.#label = ui.CreateElementWithClass('label', 'toggleLabel', 'selectable');
        ui.AddElementAttribute(this.#label, 'for', this.uniqueComponentID);
        this._titleElement = ui.CreateElement('span');
        this.#switch = ui.CreateElementWithClass('span', 'toggleSwitch');

        ui.MakeTabbableWithInputTo(this.#switch, this.#input);

        this.#input.checked = initialState;

        // add costs field 
        this.#cost = ui.CreateDivWithClass('cost', 'inline', 'darkBG');
        this.#costP = ui.CreateElement('p');
        this.#cost.appendChild(this.#costP);
        this._titleElement.appendChild(this.#cost);
        this.#cost.hidden = true;

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

        this.UpdateCosts();
    }

    UpdateCosts() {
        if (this.#costArray == null || !Array.isArray(this.#costArray)) {
            return;
        }
        let costArray = cost.GetCostArray(this.#costArray);

        if (costArray == null) {
            this.#cost.hidden = true;
            this.#currentCost = 0;
        } else {
            this.#cost.hidden = false;
            let _cost = costArray[0];
            if (_cost < -99) { _cost = -99; } else if (_cost > 999) { _cost = 999; }
            if (_cost < -9 || _cost > 99) {
                ui.AddClassToDOMs('tinyText', this.#cost);
            } else if (_cost < 0 || _cost > 9) {
                ui.AddClassToDOMs('smallText', this.#cost);
            } else {
                ui.RemoveClassesFromDOM(this.#cost, 'smallText', 'tinyText');
            }
            this.#costP.innerText = String(_cost);
            this.#currentCost = _cost;
        }
    }

    /** current token cost for this component 
     * @returns {number} */
    get cost() {
        return this.#currentCost;
    }

    get checked() {
        if (!this.#input) {
            return false;
        }
        return this.#input.checked;
    }

}
