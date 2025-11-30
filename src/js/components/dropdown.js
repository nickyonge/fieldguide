import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";
import { ObserverCallbackOnAdded } from "../mutationObserver";
import { GetChildWithClass, GetCSSVariable, GetParentWithClass, isBlank } from "../lilutils";

const _smootherScroll = true;

/** Should vertical dragging be a valid method of scrolling a dropdown list? */
const _dragScroll = true;

export class DropdownList extends TitledComponent {

    #dropdown;
    #selected;
    #svg;
    #optionsContainer;
    #optionsDivs;
    #optionsInputs;
    #optionsLabels;

    #initialValue;

    static _dropdownMaxHeight = -1;

    #initialChange = false;

    constructor(componentTitle, onSelectCallback, options, icons, initialValue = 0) {
        super(componentTitle);

        if (DropdownList._dropdownMaxHeight < 0) {
            DropdownList._dropdownMaxHeight = parseInt(GetCSSVariable('--ui-component-dropdown-max-height'), 10);
        }

        this.#initialValue = initialValue;

        if (options == null) { options = []; }

        ui.AddClassesToDOM(this.div, 'dropdownContainer');
        this.#dropdown = ui.CreateDivWithClass('dropdown', 'selectable');
        ObserverCallbackOnAdded(this.#dropdown, this.DropdownAddedToPage);
        ObserverCallbackOnAdded(this.div, this.DivAddedToPage);
        this.#selected = ui.CreateDivWithClass('ddSelected', 'selectable');
        ui.MakeTabbable(this.#dropdown);
        if (options.length >= initialValue + 1) {
            ui.AddElementAttribute(this.#selected, 'data-label', options[initialValue]);
        } else {
            ui.AddElementAttribute(this.#selected, 'data-label', '');
        }
        // create dropdown arrow SVG
        // DPJS_TO_DO: dropdown arrow SVG path is not appearing
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
            ui.AddElementAttributes(oLabel, ['for', 'data-txt'], [uniqueName, options[i], '']);
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

            // add option div to options container
            this.#optionsContainer.appendChild(oDiv);

            // add animation complete callback
            this.#optionsContainer.addEventListener('transitionend', () => {
                this.PositionUpdate?.(this.div);
            });

            // create change callback
            oInput.addEventListener('change', (event) => {
                if (onSelectCallback) {
                    // callback has three params: option index, fully unique id of the option label, and event target 
                    let target = /** @type {Element} */ (event.target);
                    onSelectCallback(i, target == null ? null : target.id, target);
                    // DPJS_TO_DO: standardize all component callbacks to supply the selected option, and target only (not ID, that can be retrieved later)
                    // Issue URL: https://github.com/nickyonge/evto-web/issues/79
                }
                if (!this.#initialChange) {
                    // initial option wasn't appearing as selected, manually set and un-set appearance 
                    this.#optionsLabels[initialValue].style.backgroundColor = null;
                    this.#initialChange = true;
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

    }

    DocumentLoaded() {
        this.DivAddedToPage(this.div);
        this.PositionUpdate?.(this.div);
        this.DropdownAddedToPage(this.#dropdown);
        this.OptionsAddedToPage(this.#optionsContainer);
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
            // DPJS_TO_DO: make dropdown CSS not clip out of page, on scroll dropdown out of page top, if ddSelPointerEvents is 'auto'
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

    // DPJS_TO_DO: dropdown dragging is very choppy and does not respect smooth scroll, clean up 
    // Issue URL: https://github.com/nickyonge/evto-web/issues/78

    /** @type {boolean} @private */
    _isDragging;
    /** @type {number} @private */
    _startY;
    /** @type {number} @private */
    _initialScrollTop;
    /** @param {HTMLElement} target  */
    addDrag(target) {
        target.addEventListener('mousedown', this.dragDown);
        target.addEventListener('mouseleave', this.dragLeave);
        target.addEventListener('mouseup', this.dragUp);
        target.addEventListener('mousemove', this.dragMove);
    }
    /** @param {HTMLElement} target  */
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
    }

    /** returns the text of the current selection 
     * @returns {string} text value of the current selection, or `null` if none/invalid */
    get selection() {
        let i = this.selectionIndex;
        if (i == -1) { return null; }
        // return this.#optionsInputs[i].id;
        return ui.GetAttribute(this.#optionsLabels[i], 'data-txt');
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
        // DPJS_TO_DO: dropdown initial checked/defaultchecked state broken when multiple dropdowns present
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
