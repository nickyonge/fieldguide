import * as ui from "../ui";
import { TitledComponent } from "./base";
import * as cost from '../costs';

export class MutliOptionList extends TitledComponent {

    #listSelect;
    #inputs;
    #labels;
    #costs;
    #costsP;

    #costArray;
    #currentCost;

    constructor(componentTitle, onSelectCallback, options, costs, icons, initialValue = 0, horizontal = false) {
        super(componentTitle);

        ui.AddClassesToDOM(this.div, 'multichoicelist');
        this.#listSelect = ui.CreateDivWithClass('listselect');

        this.#inputs = [];
        this.#labels = [];
        this.#costs = [];
        this.#costsP = [];

        this.#costArray = costs;
        this.#currentCost = 0;

        if (!options) {
            console.warn("WARNING: creating a multi-option list without any options array");
            options = [];
        }

        // create options
        for (let i = 0; i < options.length; i++) {
            // create input 
            let uniqueName = `${this.uniqueComponentName}_o${i}`;
            let input = ui.CreateInputWithID('radio', uniqueName);
            ui.AddElementAttribute(input, 'name', this.uniqueComponentName);
            input.defaultChecked = i == initialValue;
            this.#inputs.push(input);
            // create label
            let label = ui.CreateElementWithClass('label', 'listValue', 'selectable');
            ui.AddElementAttribute(label, 'for', uniqueName);
            this.#labels.push(label);
            // create svg
            if (icons && icons.length >= i + 1 && icons[i]) {
                // found valid icon
                // TODO: add SVG functionality to label (if needed)
                // Issue URL: https://github.com/nickyonge/evto-web/issues/7
            }
            // create text 
            let text = ui.CreateElement('p');
            text.innerHTML = options[i];
            label.appendChild(text);

            // add costs tokens
            let oCost = ui.CreateDivWithClass('cost');
            let oCostP = ui.CreateElement('p');
            oCost.appendChild(oCostP);
            this.#costs.push(oCost);
            this.#costsP.push(oCostP);
            label.appendChild(oCost);
            oCost.hidden = true;

            ui.DisableContentSelection(text);
            ui.MakeTabbableWithInputTo(label, input);

            if (onSelectCallback) {
                input.addEventListener('change', (event) => {
                    // callback has three params: option index, fully unique id of the option label, and event target 
                    let target = /** @type {Element} */ (event.target);
                    onSelectCallback(i, target == null ? null : target.id, target);
                });
            }
        }

        // check horizontal class
        if (horizontal) {
            ui.AddClassToDOMs('horizontal', this.div, this.#listSelect);
            //TODO: check horizontal with cost tokens (currently untested)
            //Issue URL: https://github.com/nickyonge/evto-web/issues/42
        }

        // add to document 
        this.div.appendChild(this.#listSelect);

        for (let i = 0; i < options.length; i++) {
            // append inputs and labels
            this.#listSelect.appendChild(this.#inputs[i]);
            this.#listSelect.appendChild(this.#labels[i]);
        }

        // add help component
        this.addHelpIcon(`help me! ${componentTitle}`);

        // load initial costs 
        this.UpdateCosts();
    }

    /**
     * Load or reload cost values based on the current size 
     */
    UpdateCosts() {
        if (this.#costArray == null || !Array.isArray(this.#costArray)) {
            return;
        }
        let costArray = cost.GetCostArray(this.#costArray);
        let len = this.#costsP.length;
        if (costArray.length != this.#costsP.length) {
            console.warn(`WARNING: array size mismatch between costsArray (${costArray.length}) and cost paragraphs (${this.#costsP.length}), can only update SOME tokens`);
            len = Math.min(this.#costsP.length, costArray.length);
        }

        for (let i = 0; i < len; i++) {
            if (costArray[i] == null) {
                this.#costs[i].hidden = true;
                this.#currentCost = 0;
            } else {
                this.#costs[i].hidden = false;
                let _cost = costArray[i];
                if (_cost < -99) { _cost = -99; } else if (_cost > 999) { _cost = 999; }
                if (_cost < -9 || _cost > 99) {
                    ui.AddClassToDOMs('tinyText', this.#costs[i]);
                } else if (_cost < 0 || _cost > 9) {
                    ui.AddClassToDOMs('smallText', this.#costs[i]);
                } else {
                    ui.RemoveClassesFromDOM(this.#costs[i], 'smallText', 'tinyText');
                }
                this.#costsP[i].innerText = _cost.toString();
                this.#currentCost = _cost;
            }
        }
    }

    /** current token cost for this component 
     * @returns {number} */
    get cost() {
        return this.#currentCost;
    }

    set selection(sel) {
        if (sel == this.selection) { return; }
        if (!this.#isValidSelection(sel)) {
            console.warn(`WARNING: can't assign invalid selection ${sel}`);
            return;
        }
        for (let i = 0; i < this.#inputs.length; i++) {
            this.#inputs[i].checked = this.#inputs[i].id == sel;
        }
    }
    set selectionIndex(index) {
        if (index == this.selectionIndex) { return; }
        if (!this.#isValidSelectionIndex(index)) {
            console.warn(`WARNING: can't assign invalid selection index ${index}`);
            return;
        }
        for (let i = 0; i < this.#inputs.length; i++) {
            this.#inputs[i].checked = i == index;
        }
    }

    /** returns the text of the current selection 
     * @returns {string} text value of the current selection, or `null` if none/invalid */
    get selection() {
        let i = this.selectionIndex;
        if (i == -1) { return null; }
        return this.#inputs[i].id;
    }

    /** returns the index of the current selection 
     * @returns {number} integer index of the current selection, or `-1` if none/invalid */
    get selectionIndex() {
        if (!this.#inputs) {
            return -1;
        }
        for (let i = 0; i < this.#inputs.length; i++) {
            if (this.#inputs[i].checked) {
                return i;
            }
        }
        return -1;
    }

    #isValidSelection(s) {
        for (let i = 0; i < this.#inputs.length; i++) {
            if (this.#inputs[i].id == s) {
                return true;
            }
        }
        return false;
    }
    #isValidSelectionIndex(i) {
        return (i >= 0 && i < this.#inputs.length);
    }

}
