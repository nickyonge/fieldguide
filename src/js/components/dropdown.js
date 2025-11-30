import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";
import { ObserverCallbackOnAdded } from "../mutationObserver";
import { GetChildWithClass, GetCSSVariable, GetParentWithClass, isBlank } from "../lilutils";
import * as cost from '../costs';

const _smootherScroll = true;

/** Should vertical dragging be a valid method of scrolling a dropdown list? */
const _dragScroll = true;

export class DropdownList extends TitledComponent {

    #dropdown;
    #selected;
    #selectedCost;
    #svg;
    #optionsContainer;
    #optionsDivs;
    #optionsInputs;
    #optionsLabels;
    #optionsCosts;
    #optionsCostsP;

    #costArray;
    #currentCost;

    #initialValue;

    static _dropdownMaxHeight = -1;

    #initialChange = false;

    constructor(componentTitle, onSelectCallback, options, costs, icons, initialValue = 0) {
        super(componentTitle);

        if (DropdownList._dropdownMaxHeight < 0) {
            DropdownList._dropdownMaxHeight = parseInt(GetCSSVariable('--ui-component-dropdown-max-height'), 10);
        }

        this.#initialValue = initialValue;

        this.#costArray = costs;
        this.#currentCost = 0;

        if (options == null) { options = []; }

        ui.AddClassesToDOM(this.div, 'dropdownContainer');
        this.#dropdown = ui.CreateDivWithClass('dropdown', 'selectable');
        ObserverCallbackOnAdded(this.#dropdown, this.DropdownAddedToPage);
        ObserverCallbackOnAdded(this.div, this.DivAddedToPage);
        this.#selected = ui.CreateDivWithClass('ddSelected', 'selectable');
        this.#selectedCost = ui.CreateDivWithClass('cost', 'inline', 'floating', 'forceSelected');
        this.#selectedCost.style.opacity = '0';
        this.#selected.appendChild(this.#selectedCost);
        ui.MakeTabbable(this.#dropdown);
        if (options.length >= initialValue + 1) {
            ui.AddElementAttribute(this.#selected, 'data-label', options[initialValue]);
        } else {
            ui.AddElementAttribute(this.#selected, 'data-label', '');
        }
        // create dropdown arrow SVG
        // TODO: dropdown arrow SVG path is not appearing
        // Issue URL: https://github.com/nickyonge/evto-web/issues/5
        this.#svg = ui.CreateSVG(
            [[arrowSVGPath, '#ffffff']],
            [
                // ['height', '1em'], 
                ['viewBox', '0 0 512 512']
            ],
            'ddArrow');
        // create menu options 
        this.#optionsDivs = [];
        this.#optionsInputs = [];
        this.#optionsLabels = [];
        this.#optionsCosts = [];
        this.#optionsCostsP = [];
        this.#optionsContainer = ui.CreateDivWithClass('ddOptions', 'selectable');
        ObserverCallbackOnAdded(this.#optionsContainer, this.OptionsAddedToPage);
        // iterate thru options 
        for (let i = 0; i < options.length; i++) {
            // create elements
            let isChecked = i == initialValue;
            let oDiv = ui.CreateDiv();
            let uniqueName = `${this.uniqueComponentName}_o${i}`;
            let oInput = ui.CreateInputWithID('radio', uniqueName);
            ui.AddElementAttributes(oInput, ['name', 'labelValue'], ['ddOption', options[i]]);
            oInput.defaultChecked = isChecked;
            oInput.checked = isChecked;
            let oLabel = ui.CreateElementWithClass('label', 'ddOption', 'selectable', 'noText');
            ui.AddElementAttributes(oLabel, ['for', 'data-txt', 'data-cost'], [uniqueName, options[i], '']);
            // ensure correct checked background
            if (isChecked) {
                oLabel.style.backgroundColor = GetCSSVariable('--ui-component-color-enabled-dark');
            }
            // push to arrays
            this.#optionsDivs.push(oDiv);
            this.#optionsInputs.push(oInput);
            this.#optionsLabels.push(oLabel);
            ui.MakeTabbableWithInputTo(oLabel, oInput);
            // add children to parents 
            oDiv.appendChild(oInput);
            oDiv.appendChild(oLabel);
            // add costs field 
            let oCost = ui.CreateDivWithClass('cost', 'floating');
            let oCostP = ui.CreateElement('p');
            oCost.appendChild(oCostP);
            this.#optionsCosts.push(oCost);
            this.#optionsCostsP.push(oCostP);
            oLabel.appendChild(oCost);
            if (isChecked) {
                oCost.style.backgroundColor = GetCSSVariable('--color-ui-costToken-selected-bg-inner');
                oCost.style.borderColor = GetCSSVariable('--color-ui-costToken-selected');
                oCost.style.boxShadow = `0px 0px 0.69px 1.5px ${GetCSSVariable('--color-ui-costToken-selected-bg-outer')}`;
                oCostP.style.color = GetCSSVariable('--color-ui-costToken-selected');
            }
            oCost.hidden = true;

            // add option div to options container
            this.#optionsContainer.appendChild(oDiv);

            // add animation complete callback
            this.#optionsContainer.addEventListener('transitionend', () => {
                this.PositionUpdate?.(this.div);
            });

            // create change callback
            oInput.addEventListener('change', (event) => {
                this.#updateSelectedCost();
                if (onSelectCallback) {
                    // callback has three params: option index, fully unique id of the option label, and event target 
                    let target = /** @type {Element} */ (event.target);
                    onSelectCallback(i, target == null ? null : target.id, target);
                    // TODO: standardize all component callbacks to supply the selected option, and target only (not ID, that can be retrieved later)
                    // Issue URL: https://github.com/nickyonge/evto-web/issues/79
                }
                if (!this.#initialChange) {
                    // initial option wasn't appearing as selected, manually set and un-set appearance 
                    this.#optionsLabels[initialValue].style.backgroundColor = null;
                    this.#initialChange = true;
                    if (this.#optionsCosts != null && this.#optionsCosts.length > initialValue && this.#optionsCosts[initialValue] != null) {
                        this.#optionsCosts[initialValue].style.backgroundColor = null;
                        this.#optionsCosts[initialValue].style.borderColor = null;
                        this.#optionsCosts[initialValue].style.boxShadow = null;
                        this.#optionsCostsP[initialValue].style.color = null;
                    }
                }
            });
        }
        // add elements 
        this.div.appendChild(this.#dropdown);
        this.#dropdown.appendChild(this.#selected);
        this.#selected.appendChild(this.#svg);
        this.#dropdown.appendChild(this.#optionsContainer);

        // add resize event 
        window.addEventListener('resize', function () {
            // re-fire size assignment events on page resize
            // update appearance after one-tick delay
            window.setTimeout(() => {
                // one tick delay
                this.PositionUpdate?.(this.div);
                // this.DivAddedToPage(this.div);
                this.DropdownAddedToPage(this.#dropdown);
                this.OptionsAddedToPage(this.#optionsContainer);
            }, 0);
            // this.DropdownAddedToPage(this.#dropdown);
        }.bind(this));

        // add help component
        this.addHelpIcon(`help me! ${componentTitle}`);

        this.OnScroll = () => { this.PositionUpdate?.(this.div); };

        // update costs 
        this.UpdateCosts();
    }

    #updateSelectedCost() {
        ui.AddElementAttribute(this.#selected, 'data-label', this.selection);
        let _cost = this.costByDiv;
        if (_cost === 'null' ||
            (typeof _cost === 'string' && isBlank(_cost))) {
            this.#selected.style.marginRight = '-20px';
            this.#selectedCost.style.opacity = '0';
        } else {
            this.#selectedCost.innerHTML = `<p>${_cost}</p>`;
            this.#selectedCost.style.opacity = '1';
            this.#selected.style.marginRight = '0px';
        }
    }

    DocumentLoaded() {
        this.DivAddedToPage(this.div);
        this.PositionUpdate?.(this.div);
        this.DropdownAddedToPage(this.#dropdown);
        this.OptionsAddedToPage(this.#optionsContainer);
    }

    UpdateCosts() {
        if (this.#costArray == null || !Array.isArray(this.#costArray)) {
            return;
        }

        let costArray = cost.GetCostArray(this.#costArray);
        let len = this.#optionsCostsP.length;
        if (costArray.length != this.#optionsCostsP.length) {
            console.warn(`WARNING: array size mismatch between costsArray (${costArray.length}) and cost paragraphs (${this.#optionsCostsP.length}), can only update SOME tokens`);
            len = Math.min(this.#optionsCostsP.length, costArray.length);
        }

        for (let i = 0; i < len; i++) {
            if (costArray[i] == null) {
                // hidden, don't display 
                this.#optionsCosts[i].hidden = true;
                ui.RemoveClassFromDOMs('withCost', this.#optionsLabels[i]);
                ui.AddElementAttribute(this.#optionsLabels[i], 'data-cost', '');
                this.#currentCost = 0;
            } else {
                // visible, display 
                this.#optionsCosts[i].hidden = false;
                ui.AddClassToDOMs('withCost', this.#optionsLabels[i]);
                let _cost = costArray[i];
                if (_cost < -99) { _cost = -99; } else if (_cost > 999) { _cost = 999; }
                if (_cost < -9 || _cost > 99) {
                    ui.AddClassToDOMs('tinyText', this.#optionsCosts[i]);
                } else if (_cost < 0 || _cost > 9) {
                    ui.AddClassToDOMs('smallText', this.#optionsCosts[i]);
                } else {
                    ui.RemoveClassesFromDOM(this.#optionsCosts[i], 'smallText', 'tinyText');
                }
                this.#optionsCostsP[i].innerText = _cost.toString();
                ui.AddElementAttribute(this.#optionsLabels[i], 'data-cost', _cost);
                this.#currentCost = _cost;
            }
        }

        this.#updateSelectedCost();
    }

    /** @param {HTMLElement} div */
    PositionUpdate(div) { // this.div
        const title = GetChildWithClass(div, 'componentTitle');
        const dropdown = GetChildWithClass(div, 'dropdown');
        const titleRect = title.getBoundingClientRect();
        dropdown.style.top = `${titleRect.bottom}px`;

        const ddSelected = GetChildWithClass(dropdown, 'ddSelected');
        // parent page 
        let page = GetParentWithClass(div, 'page');
        let ddSelRect = ddSelected.getBoundingClientRect();
        let pageRect = page.getBoundingClientRect();

        let clipBtm = ddSelRect.bottom - pageRect.bottom;
        let clipTop = ddSelRect.top - pageRect.top;

        let dropdownPointerEvents = 'auto';
        let ddSelPointerEvents = 'auto';

        if (clipTop > 0) {
            // fully displayed
            clipTop = 0;
        } else if (clipTop < -ddSelRect.height) {
            // fully hidden
            clipTop = ddSelRect.height;
            dropdownPointerEvents = 'none';
            ddSelPointerEvents = 'none';
        } else {
            // middle of transition
            clipTop = -clipTop;
            // TODO: make dropdown CSS not clip out of page, on scroll dropdown out of page top, if ddSelPointerEvents is 'auto'
            // Issue URL: https://github.com/nickyonge/evto-web/issues/37
            dropdownPointerEvents = 'none';
            ddSelPointerEvents = 'auto';
        }

        if (clipBtm < 0) {
            // fully displayed
            clipBtm = 0;
        } else if (clipBtm > ddSelRect.height) {
            // fully hidden 
            clipBtm = ddSelRect.height;
            dropdownPointerEvents = 'none';
            ddSelPointerEvents = 'none';
        } else {
            // middle of transition 
            dropdownPointerEvents = 'none';
        }

        dropdown.style.pointerEvents = dropdownPointerEvents;
        ddSelected.style.pointerEvents = ddSelPointerEvents;
        ddSelected.style.clipPath = `inset(${clipTop}px 0px ${clipBtm}px 0px)`;
    }
    /** @param {HTMLElement} target  */
    DivAddedToPage(target) { // this.div
        // add scroll event
        if (_smootherScroll) {
            target.parentElement.addEventListener('scroll', () => {
                requestAnimationFrame(() => {
                    let component = BasicComponent.GetComponentByDiv(target);
                    component.PositionUpdate?.(target);
                    const title = GetChildWithClass(target, 'componentTitle');
                    const dropdown = GetChildWithClass(target, 'dropdown');
                    const titleRect = title.getBoundingClientRect();
                    dropdown.style.top = `${titleRect.bottom}px`;
                });
            });
        } else {
            target.parentElement.addEventListener('scroll', function () {
                // ui.GetAttribute(target, 'uniqueComponentID')
                let title = GetChildWithClass(target, 'componentTitle');
                let dropdown = GetChildWithClass(target, 'dropdown');
                let titleRect = title.getBoundingClientRect();
                dropdown.style.top = `${titleRect.bottom}px`;
                // dropdown.style.top = `0px`;
                // dropdown.style.transform = `translateY(${titleRect.bottom}px)`;
            });
        }
    }
    /** @param {HTMLElement} target  */
    DropdownAddedToPage(target) { // this.#dropdown
        // ensure dropdown width fits page 
        target.style.width = `${target.parentElement.offsetWidth - 4.5}px`;
    }

    /** 
     * `this.#optionsContainer` added to page. 
     * Determine if window height exceeds max, 
     * and if so, assign scrollable class. 
     * @param {HTMLElement} target  */
    OptionsAddedToPage(target) { // this.#optionsContainer
        // remove scrollable to prevent messing with results 
        ui.RemoveClassesFromDOM(target, 'scrollable');
        // get component reference to allow dragging 
        let component = this instanceof DropdownList ? this :
            BasicComponent.GetParentComponent(target);
        if (component != null && component instanceof DropdownList) {
            component.removeDrag(target);
        }
        // determine if scrollable
        let targetHeight = target.offsetHeight;
        let scrollable = targetHeight > DropdownList._dropdownMaxHeight;
        if (scrollable) {
            // scrollable - set class, add dragging 
            ui.AddClassesToDOM(target, 'scrollable');
            if (component != null && component instanceof DropdownList) {
                component.addDrag(target);
            }
        }
    }

    // --------------------------------- dragging

    // TODO: dropdown dragging is very choppy and does not respect smooth scroll, clean up 
    // Issue URL: https://github.com/nickyonge/evto-web/issues/78

    /** @type {boolean} @private */
    _isDragging;
    /** @type {number} @private */
    _startY;
    /** @type {number} @private */
    _initialScrollTop;
    /** @param {Element} target  */
    addDrag(target) {
        target.addEventListener('mousedown', this.dragDown);
        target.addEventListener('mouseleave', this.dragLeave);
        target.addEventListener('mouseup', this.dragUp);
        target.addEventListener('mousemove', this.dragMove);
    }
    /** @param {Element} target  */
    removeDrag(target) {
        if (target == null) { return; }
        target.removeEventListener('mousedown', this.dragDown);
        target.removeEventListener('mouseleave', this.dragLeave);
        target.removeEventListener('mouseup', this.dragUp);
        target.removeEventListener('mousemove', this.dragMove);
    }
    /** @param {MouseEvent} event */
    dragDown(event) {
        this._isDragging = true;
        let target = /** @type {HTMLElement} */ (event.target);
        target.classList.add('active-drag'); // Optional: Add a class for styling during drag
        this._startY = event.pageY;
        this._initialScrollTop = target.scrollTop;
    }
    /** @param {MouseEvent} event */
    dragLeave(event) {
        this._isDragging = false;
        let target = /** @type {HTMLElement} */ (event.target);
        target.classList.remove('active-drag');
    }
    /** @param {MouseEvent} event */
    dragUp(event) {
        this._isDragging = false;
        let target = /** @type {HTMLElement} */ (event.target);
        target.classList.remove('active-drag');
    }
    /** @param {MouseEvent} event */
    dragMove(event) {
        if (!this._isDragging) return;
        let target = /** @type {HTMLElement} */ (event.target);
        event.preventDefault(); // Prevent default browser drag behavior
        const deltaY = event.pageY - this._startY;
        target.scrollTop = this._initialScrollTop - deltaY;
    }

    set selection(sel) { // this.optionsInputs[i]
        if (sel == this.selection) { return; }
        if (!this.#isValidSelection(sel)) {
            console.warn(`WARNING: can't assign invalid selection ${sel}`);
            return;
        }
        // first, check labels
        for (let i = 0; i < this.#optionsLabels.length; i++) {
            this.#optionsLabels[i].checked = ui.GetAttribute(this.#optionsLabels[i], 'data-txt') == sel;
        }
        // if not found, check input IDs, just in case we're using technical name
        for (let i = 0; i < this.#optionsInputs.length; i++) {
            this.#optionsInputs[i].checked = this.#optionsInputs[i].id == sel;
        }
        this.#updateSelectedCost();
    }
    set selectionIndex(index) {
        if (index == this.selectionIndex) {
            return;
        }
        if (!this.#isValidSelectionIndex(index)) {
            console.warn(`WARNING: can't assign invalid selection index ${index}`);
            return;
        }
        for (let i = 0; i < this.#optionsInputs.length; i++) {
            this.#optionsInputs[i].checked = i == index;
        }
        this.selectionIndex = index;
        this.#updateSelectedCost();
    }

    /** returns the text of the current selection 
     * @returns {string} text value of the current selection, or `null` if none/invalid */
    get selection() {
        let i = this.selectionIndex;
        if (i == -1) { return null; }
        // return this.#optionsInputs[i].id;
        return ui.GetAttribute(this.#optionsLabels[i], 'data-txt');
    }

    /** current token cost for this component 
     * @returns {number} */
    get cost() {
        return this.#currentCost;
    }
    /** current token cost for this component, returned via div attribute as a string 
     * @returns {string} */
    get costByDiv() {
        let i = this.selectionIndex;
        if (i == -1) { return null; }
        return ui.GetAttribute(this.#optionsLabels[i], 'data-cost');
    }

    /** returns the index of the current selection 
     * @returns {number} integer index of the current selection, or `-1` if none/invalid */
    get selectionIndex() {
        if (!this.#optionsInputs) {
            return -1;
        }
        for (let i = 0; i < this.#optionsInputs.length; i++) {
            if (this.#optionsInputs[i].checked) {
                return i;
            }
        }
        // TODO: dropdown initial checked/defaultchecked state broken when multiple dropdowns present
        // Issue URL: https://github.com/nickyonge/evto-web/issues/40
        // failsafe: if no value selected, initial value is NOT -1, and initial change is false, return initial valeu
        if (this.#initialValue != -1 && !this.#initialChange) {
            return this.#initialValue;// could also find this by comparing ddSelected data-txt attribute 
        }
        return -1;
    }

    #isValidSelection(s) {
        for (let i = 0; i < this.#optionsInputs.length; i++) {
            if (this.#optionsInputs[i].id == s) {
                return true;
            }
        }
        return false;
    }
    #isValidSelectionIndex(i) {
        return (i >= 0 && i < this.#optionsInputs.length);
    }
}

/** path `d` attribute for SVG arrow */
const arrowSVGPath = 'M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z';
