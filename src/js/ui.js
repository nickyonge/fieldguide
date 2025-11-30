/* Basic UI element generation */

import { isBlank } from "./lilutils";

// ------------------------------------------------------------------
// -----------------------------------  BASIC ELEMENT CREATION  -----
// ------------------------------------------------------------------
// #region Basic Elements 

/**
 * Create a DIV HTMLElement
 * @returns {HTMLElement} newly made HTML <div> element
 */
export function CreateDiv() {
    return CreateElement('div');
}
/**
 * Create a DIV HTMLElement with the given ID
 * @param {string} id ID value
 * @returns {HTMLElement} newly made HTML <div> element
 */
export function CreateDivWithID(id) {
    let div = CreateDiv();
    div.id = id;
    return div;
}

/**
 * Create a DIV HTMLElement with the given CSS class(es)
 * @param {spreadString} cssClasses one or more CSS classes to add
 * @returns {HTMLElement} newly made HTML <div> element
 */
export function CreateDivWithClass(...cssClasses) {
    let div = CreateDiv();
    AddClassesToDOM(div, ...cssClasses);
    return div;
}

/**
 * Create a new HTMLElement of the given type
 * @param {string} newElement type of HTMLElement
 * @returns {HTMLElement} newly created HTMLElement
 */
export function CreateElement(newElement) {
    return document.createElement(newElement);
}
/**
 * Create a new HTMLElement of the given type, with one or more CSS classes
 * @param {string} newElement type of new HTMLElement
 * @param  {...string} cssClasses one or more classes to add to the new element
 * @returns {HTMLElement} returns HTMLElement with the given CSS class name(s)
 */
export function CreateElementWithClass(newElement, ...cssClasses) {
    let element = CreateElement(newElement);
    AddClassesToDOM(element, ...cssClasses);
    return element;
}
/**
 * Create a DIV HTMLElement with the given ID and CSS class(es)
 * @param {string} id ID value
 * @param {...string} cssClasses one or more CSS classes to add
 * @returns {HTMLElement} newly made HTML <div> element
 */
export function CreateDivWithIDAndClasses(id, ...cssClasses) {
    let div = CreateDiv();
    div.id = id;
    AddClassesToDOM(div, ...cssClasses);
    return div;
}
/**
 * Create an input `HTMLElement`, optionally with the given CSS class(es)
 * @param {string} type type of input, eg 'checkbox'
 * @param  {...string} cssClasses optional CSS class or classes to assign
 * @returns {HTMLElement} newly made HTML `<input>` element
 */
export function CreateInput(type, ...cssClasses) {
    let input = CreateElement('input');
    AddElementAttribute(input, 'type', type);
    AddClassesToDOM(input, ...cssClasses);
    return input;
}
/**
 * Create an input `HTMLElement` and the given ID, optionally with the given CSS class(es)
 * @param {string} type type of input, eg 'checkbox'
 * @param {string} id id for the input element
 * @param  {...string} cssClasses optional CSS class or classes to assign
 * @returns {HTMLElement} newly made HTML `<input>` element
 */
export function CreateInputWithID(type, id, ...cssClasses) {
    let input = CreateInput(type, ...cssClasses);
    AddElementAttribute(input, 'id', id);
    return input;
}
/**
 * Creates a new HTMLElement of the given type (newElement) 
 * and appends it as a child to the given pre-existing element (domElement)
 * @param {Element} domElement existing HTMLElement which will be newElement's parent
 * @param {string} newElement HTMLElement type to create and append as a child to domElement
 * @returns {HTMLElement} returns the newly created HTMLElement
 */
export function AddElementTo(domElement, newElement) {
    let element = CreateElement(newElement);
    domElement.appendChild(element);
    return element;
}

// #endregion Basic Elements

// ------------------------------------------------------------------
// ------------------------------------------  CLASSES AND IDs  -----
// ------------------------------------------------------------------
// #region Classes/IDs 

/**
 * Creates a new HTMLElement of the given type (newElement) with the given CSS class(es)
 * and appends it as a child to the given pre-existing element (domElement)
 * @param {Element} domElement existing HTMLElement which will be newElement's parent
 * @param {string} newElement HTMLElement type to create and append as a child to domElement
 * @param  {...string} cssClasses one or more classes to add to the new element. 
 * If none is specified, uses `newElement` as class name
 * @returns {HTMLElement} returns the newly created HTMLElement
 */
export function AddElementWithClassTo(domElement, newElement, ...cssClasses) {
    if (cssClasses.length == 0) {
        cssClasses.push(newElement);
    }
    let element = CreateElementWithClass(newElement, ...cssClasses);
    domElement.appendChild(element);
    return element;
}

/**
 * Adds the given class(es) to the given HTMLElement (one element, multiple classes)
 * @param {Element} domElement HTMLElement to add the given classes to
 * @param  {spreadString} cssClasses one or more classes to add to the domElement
 * @returns 
 */
export function AddClassesToDOM(domElement, ...cssClasses) {
    if (cssClasses.length == 0) {
        return;
    }
    cssClasses = cssClasses.flattenSpread();
    if (domElement.classList.length == 0) {
        domElement.classList.add(...cssClasses);
        return;
    }
    for (let i = 0; i < cssClasses.length; i++) {
        if (!HasClass(domElement, cssClasses[i])) {
            domElement.classList.add(cssClasses[i]);
        }
    }
}
/**
 * Adds the given class to the given HTMLElement(s) (one class, multiple elements)
 * @param {string} cssClass Class to add
 * @param  {...Element} domElements HTMLElement(s) to add the class to
 */
export function AddClassToDOMs(cssClass, ...domElements) {
    domElements = domElements.flattenSpread();
    for (let i = 0; i < domElements.length; i++) {
        if (!HasClass(domElements[i], cssClass)) {
            domElements[i].classList.add(cssClass);
        }
    }
}

/**
 * Removes the given class(es) from the given HTMLElement (one element, multiple classes)
 * @param {Element} domElement HTMLElement to remove the given classes from
 * @param  {...string} cssClasses one or more classes to remove from the domElement
 * @returns 
 */
export function RemoveClassesFromDOM(domElement, ...cssClasses) {
    if (domElement.classList.length == 0) {
        return;
    }
    cssClasses = cssClasses.flattenSpread();
    for (let i = 0; i < cssClasses.length; i++) {
        if (HasClass(domElement, cssClasses[i])) {
            domElement.classList.remove(cssClasses[i]);
        }
    }
}
/**
 * Removes the given class from the given HTMLElement(s) (one class, multiple elements)
 * @param {string} cssClass Class to remove
 * @param  {...Element} domElements HTMLElement(s) to remove the class from
 */
export function RemoveClassFromDOMs(cssClass, ...domElements) {
    domElements = domElements.flattenSpread();
    for (let i = 0; i < domElements.length; i++) {
        if (HasClass(domElements[i], cssClass)) {
            domElements[i].classList.remove(cssClass);
        }
    }
}

/**
 * Does the given element have the given CSS class?
 * @param {Element} element Element to check. If `null`, returns `false`  
 * @param {string} cssClass CSS class. If `null`/empty, returns `false`
 * @returns {boolean}
 */
export function HasClass(element, cssClass) {
    if (element == null || isBlank(cssClass)) { return false; }
    return element.classList.contains(cssClass);
}
/**
 * Does the given element have any or all (default all) 
 * of the given CSS classes? 
 * @param {Element} element Element to check. If `null`, returns `false` 
 * @param {string[]} cssClasses Array of classes to check 
 * @param {boolean} [all=true] If `true`, returns `true` only if the given 
 * element has every given class. If `false`, returns `true` if the given 
 * element has any one of the given classes. Default `true`. 
 * - **Note:** If `cssClasses` is null, returns `false`. If `cssClasses`
 * is `[]`, returns the value of `all`.
 * @returns {boolean}
 */
export function HasClasses(element, cssClasses, all = true) {
    if (element == null || cssClasses == null) { return false; }
    for (let i = 0; i < cssClasses.length; i++) {
        if (all) {
            if (!HasClass(element, cssClasses[i])) {
                return false;
            }
        } else {
            if (HasClass(element, cssClasses[i])) {
                return true;
            }
        }
    }
    return all ? true : false;
}

// #endregion Classes / IDs

// ------------------------------------------------------------------ 
// -----------------------------------------------  ATTRIBUTES  ----- 
// ------------------------------------------------------------------ 
// #region Attributes 

/**
 * Sets the given attributes on the given HTMLElement (attTypes and attValues lengths must match)
 * @param {Element} element HTMLElement to add attributes to
 * @param {string[]} attTypes Array of attribute types (qualifiedNames)
 * @param {string[]} attValues Array of values of attributes
 */
export function AddElementAttributes(element, attTypes, attValues) {
    if (attTypes.length != attValues.length) {
        console.error("ERROR: attribute types and values array lengths must match");
        return;
    }
    for (let i = 0; i < attTypes.length; i++) {
        AddElementAttribute(element, attTypes[i], attValues[i]);
    }
}

/**
 * Sets the given attribute on the given HTMLElement
 * @param {Element} element HTMLElement to add attribute to
 * @param {string} attType Type (qualifiedName) of attribute
 * @param {string|number|boolean|null|undefined} [attValue = undefined] Value of attributue
 */
export function AddElementAttribute(element, attType, attValue) {
    element.setAttribute(attType, String(attValue));
}

/**
 * Removes the given attribute from the given HTMLElement
 * @param {Element} element 
 * @param {string} attType 
 */
export function RemoveElementAttribute(element, attType) {
    element.removeAttribute(attType);
}
/**
 * Removes all the given attribute from the given HTMLElement
 * @param {Element} element 
 * @param {string[]} attTypes 
 */
export function RemoveElementAttributes(element, attTypes) {
    for (let i = 0; i < attTypes.length; i++) {
        element.removeAttribute(attTypes[i]);
    }
}

/**
 * Get the given attribute's value on the given element. 
 * If attribute isn't found, returns `null`.
 * @param {Element} element 
 * @param {string} attType 
 * @returns 
 */
export function GetAttribute(element, attType) {
    if (!HasAttribute(element, attType)) {
        return null;
    }
    return element.getAttribute(attType);
}

/**
 * Checks if the given attribute is present on the given HTMLElement
 * @param {Element} element 
 * @param {string} attType Type (qualifiedName) of attribute to check 
 * @returns {boolean}
 */
export function HasAttribute(element, attType) {
    return element.hasAttribute(attType);
}
/**
 * Checks if the given element has the given attribute, and if its
 * value matches the given attribute value
 * @param {Element} element 
 * @param {string} attType Type (qualifiedName) of attribute to check 
 * @param {any} attValue Value of the attribute, typically a `string`,
 * `number`, or `boolean`. 
 * @param {boolean} [countNullAsEmpty=true] If true, if `attValue` is `null` or `undefined`, sets it to ''. 
 * False casts to string, literally "null" or "undefined"
 * @returns {boolean}
 */
export function HasAttributeWithValue(element, attType, attValue, countNullAsEmpty = true) {
    if (!HasAttribute(element, attType)) { return false; }
    if (countNullAsEmpty && (attValue == null || attValue == undefined)) { attValue = ''; }
    return element.getAttribute(attType) == String(attValue);
}
/**
 * Check if the given HTMLElement has any or all of the given attributes
 * @param {Element} element Element to check. If `null`, returns `false` 
 * @param {string[]} attTypes List of attribute names to check 
 * @param {boolean} [all=true] If `true`, returns `true` only if the given 
 * element has every given attribute. If `false`, returns `true` if the given 
 * element has any one of the given attributes. Default `true`. 
 * - **Note:** If `attTypes` is null, returns `false`. If `attTypes`
 * is `[]`, returns the value of `all`.
 * @returns {boolean}
 */
export function HasAttributes(element, attTypes, all = true) {
    if (element == null || attTypes == null) { return false; }
    for (let i = 0; i < attTypes.length; i++) {
        if (all) {
            if (!element.hasAttribute(attTypes[i])) {
                return false;
            }
        } else {
            if (element.hasAttribute(attTypes[i])) {
                return true;
            }
        }
    }
    return all ? true : false;
}

// #endregion Attributes

// -------------------------------------------------------------------
// --------------------------------------  OTHER BASIC ELEMENTS  -----
// -------------------------------------------------------------------
// #region Other Elements 

/**
 * Creates a new `<img>` element, and assigns the given src attribute (and optional alt text value)
 * @param {string} imgSrc Value to add to the "src" attribute to the new img
 * @param {string} [alt=undefined] Alt text to provide to the new img (optional)
 * @returns 
 */
export function CreateImage(imgSrc, alt = undefined) {
    let img = CreateElement('img');
    img.setAttribute('src', imgSrc);
    if (!isBlank(alt)) {
        img.setAttribute('alt', alt);
    }
    return img;
}
/**
 * Creates a new `<img>` element, and assigns the given src attribute (and optional alt text value),
 * and then assigns the given CSS class(es) to it.
 * @param {string} imgSrc Value to add to the "src" attribute to the new img
 * @param {string} [alt=undefined] Alt text to provide to the new img (optional)
 * @param  {...string} cssClasses optional CSS class(es) to apply to the new img
 * @returns {HTMLElement} newly-made <img> HTMLElement
 */
export function CreateImageWithClasses(imgSrc, alt = undefined, ...cssClasses) {
    let img = CreateImage(imgSrc, alt);
    AddClassesToDOM(img, ...cssClasses);
    return img;
}

/**
 * Creates a new `<svg>` element, with the given `path` child element attributes
 * @param {string|string[]} path Path value, either a single string for the `d` path attribute, 
 * or a two-value string array with [d,fill] attributes
 * @param  {...string} cssClasses optional CSS class(es) to apply to the SVG
 * @returns {HTMLElement} newly-made SVG HTMLElement
 */
export function CreateSVGFromPath(path, ...cssClasses) {
    if (path) {
        return CreateSVG([Array.isArray(path) ? path : [path, '#ffffff']], null, ...cssClasses);
    }
    return CreateSVG(null, null, ...cssClasses);
}
/**
 * Creates a new `<svg>` element, with the given `path` child element attributes
 * @param {string} path Path `d` attribute value
 * @param {string} fill Path `fill` attribute value
 * @param  {...string} cssClasses optional CSS class(es) to apply to the SVG
 * @returns {HTMLElement} newly-made SVG HTMLElement
 */
export function CreateSVGFromPathWithFill(path, fill, ...cssClasses) {
    if (path) {
        return CreateSVG([[path, fill]], null, ...cssClasses);
    }
    return CreateSVG(null, null, ...cssClasses);
}
/**
 * Creates a new `<svg>` element, wth the given `path` child elements, 
 * and the given attributes. Automatically assigns `xmlns`, 
 * `xmlns:xlink`, and `version` attributes if they aren't present.
 * @param {string[][]} paths 2D array for paths. Each element is a new path, 
 * and each path is 2 string values for its attributes: `[d,fill]`. If `fill`
 * is omitted, defaults to `#ffffff`.
 * @param {string[][]} attributes 2D array of attributes. Each element is a
 * separate attribute, and each attribute is an array of two strings,
 * [attribute,value]. If no value is present, assigns `''`.
 * @param  {...string} cssClasses optional CSS class(es) to apply to the SVG
 * @returns {HTMLElement} newly-made SVG HTMLElement
 */
export function CreateSVG(paths, attributes, ...cssClasses) {
    let svg = CreateElement('svg');
    // add given attributes
    if (attributes) {
        // [['attr','value'],['attr','value']]
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i]) {
                if (attributes[i].length >= 2) {
                    AddElementAttribute(svg, attributes[i][0], attributes[i][1])
                } else {
                    AddElementAttribute(svg, attributes[i][0], '');
                }
            }
        }
    }
    // ensure basic attributes present (if these are already added, they'll be ignored)
    AddElementAttributes(svg, ['xmlns', 'version', 'xmlns:xlink'], ['http://www.w3.org/2000/svg', '1.1', 'http://www.w3.org/1999/xlink']);
    // add paths
    if (paths) {
        // type check
        if (typeof paths === 'string') {
            // just a string, assume it's a path D value and add
            let pathElement = CreateElement('path');
            AddElementAttributes(pathElement, ['fill', 'd'], ['#ffffff', ParseSVGPathD(paths)]);
            svg.appendChild(pathElement);
        } else {
            // should be an array, [['d','fill'],['d','fill']] 
            for (let i = 0; i < paths.length; i++) {
                if (paths[i]) {
                    let path = CreateElement('path');
                    if (paths[i].length >= 2) {
                        // assume [d,fill]
                        // DPJS_TO_DO: accommodate more svg path attributes than just d and fill
                        // Issue URL: https://github.com/nickyonge/evto-web/issues/16
                        AddElementAttributes(path, ['d', 'fill'], [paths[i][0],
                        paths[i][1] ? paths[i][1] : '#ffffff']);
                    } else if (paths[i].length == 1) {
                        // only one attribute, assume 'd'
                        AddElementAttributes(path, ['d', 'fill'], [paths[i][0], '#ffffff']);
                    } else {
                        // no elements
                        AddElementAttributes(path, ['d', 'fill'], ['', '#ffffff']);
                    }
                    svg.appendChild(path);
                }
            }
        }
    }
    // add classes
    AddClassesToDOM(svg, ...cssClasses);
    return svg;
}
/** Returns the SVG path WITHOUT `d="`...`"` or `d='`...`'` at the beginning/end
 * @param {string} path SVG path value 
 * @returns {string} */
function ParseSVGPathD(path) {
    if (!path) return null;
    if (path.indexOf('d=') == 0) {
        return path.substring(3, path.length - 4);
    }
    return path;
}

// #endregion Other Elements 

// ------------------------------------------------------------------
// ---------------------------------  NAVIGATION AND SELECTION  -----
// ------------------------------------------------------------------
// #region Nav/Select 

/**
 * Make the given HTMLElement appear in the tab index for the page
 * **NOTE:** giving the `tabIndex` value `-1` will make an element untabbable, even if it's tabbable by default.
 * @param {Element} element HTMLElement to add to the tab index 
 * @param {number} [tabIndex=0] Optional value to specify tab index. `-1` = not tabbable
 * @param {boolean} [preserve=true] Optionally add a `preservedTabIndex` attribute with the given `tabIndex` value
 */
export function MakeTabbable(element, tabIndex = 0, preserve = true) {
    element.setAttribute('tabIndex', tabIndex.toString());
    if (preserve) {
        element.setAttribute('preservedTabIndex', tabIndex.toString());
    }
}

/**
 * Makes the given HTMLElement appear in the tab index for the page, 
 * and sends any received keyboard enter/spacebar inputs to `inputToElement`.
 * Eg, if you add a <label> to the tab index, but want to send its input to a different <input> tag.
 * @param {Element} tabElement HTMLElement to add to the tab index
 * @param {Element} inputToElement HTMLElement that receives Enter/Spacebar keyboard input from `tabElement` as a `click()`
 * @param {number} [tabIndex=0] Default 0, optional value to specify tab index. `-1` = not tabbable (and no input events are added)
 */
export function MakeTabbableWithInputTo(tabElement, inputToElement, tabIndex = 0) {
    MakeTabbable(tabElement, tabIndex);
    if (tabIndex != -1) {
        PassKeyboardSelection(tabElement, inputToElement);
    }
}

/**
 * Adds a `keydown` event listener for Enter/Spacebar to `fromElement`, which sends a `click()` event to the `toElement`
 * @param {Element} fromElement Element that receives the user keyboard input
 * @param {Element} toElement Element that the `click()` event gets sent to
 */
export function PassKeyboardSelection(fromElement, toElement) {
    fromElement.addEventListener('keydown', e => {
        // much older devices check for "Spacebar", might as well support it 
        let key = /** @type {KeyboardEvent} */ (e).key;
        if (key === ' ' || key === 'Spacebar' || key === 'Enter') {
            e.preventDefault(); // don't scroll the page down or anything
            toElement.click(); // pass click to new element
        }
    });
}

/** Disable text/content selection overall
 * @param  {...HTMLElement} domElements Elements to assign these selection parameters to */
export function DisableContentSelection(...domElements) {
    RemoveClassFromDOMs('allowSelectDefaultCursor', ...domElements); // prevent conflicts
    AddClassToDOMs('preventSelect', ...domElements); // prevent selection 
}
/** Allow text/content selection but keep the default, non-text cursor
 * @param  {...HTMLElement} domElements Elements to assign these selection parameters to */
export function AllowContentSelectionWithDefaultCursor(...domElements) {
    RemoveClassFromDOMs('preventSelect', ...domElements); // prevent conflicts
    AddClassToDOMs('allowSelectDefaultCursor', ...domElements); // allow selection, default cursor
}
/** Allow text/content selection, keep regular cursor properties (text selection carat)
 * @param  {...HTMLElement} domElements Elements to assign these selection parameters to */
export function AllowContentSelectionWithTextIndicator(...domElements) {
    RemoveClassFromDOMs('allowSelectDefaultCursor', ...domElements);
    RemoveClassFromDOMs('preventSelect', ...domElements); // default selection type
}

// #endregion Nav/Select

// DPJS_TO_DO: add Enter input to elements that only function on spacebar (eg, rn the "Subscribe" btn works for Spacebar but not Enter)
// Issue URL: https://github.com/nickyonge/evto-web/issues/15
// DPJS_TO_DO: add keyboard input to social media buttons (they don't respond in CSS to keyboard)
// Issue URL: https://github.com/nickyonge/evto-web/issues/14
