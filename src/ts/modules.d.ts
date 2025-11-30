import type { BasicComponent } from '../js/components/base';
import type {
    svgElement,
    svgHTMLAsset,
    svgDefinition,
    svgConfig
} from '../js/svg/';

declare module '../js/components/base' {

    interface BasicComponent {

        /**
         * Optionally-defined method to call `UpdateCosts` on components that have it defined. 
         * 
         * Called whenever cost values of maps are updated, eg, when map size is changed. 
         * 
         * Invoke with `component.UpdateCosts?.();`
         * @returns {void}
         */
        UpdateCosts?(): void;

        /**
         * Optionally-defined method to call `DocumentLoaded` on components that have it defined. 
         * 
         * Called in `index.js` one tick after the document has fully completed loading.
         * 
         * Invoke with `component.DocumentLoaded?.();`
         * @returns {void}
         */
        DocumentLoaded?(): void;

        /**
         * Optionally defined method to call `PositionUpdate` on components that have it defined. 
         * 
         * Called typically when a complex component's div is added to a page, 
         * or when the document's layout or a page's layout changes.
         * 
         * Invoke with `component.PositionUpdate?.();`
         * @param {HTMLElement} [div = undefined]
         * @returns {void}
         */
        PositionUpdate?(div?: HTMLElement): void;

        /**
         * Optionally-defined method to call `OnScroll` on components that have it defined. 
         * 
         * Called when a Page is vertically scrolled.
         * 
         * Invoke with `component.OnScroll?.();`
         * @returns {void}
         */
        OnScroll?(): void;
    }

}

declare module '../js/svg/svgElement' {

    interface svgElement {

        /**
         * Optional parent svgElement to this svgElement 
         * (eg, an `svgGradientStop` will have an `svgGradient` as a parent)
         * @type {svgElement} */
        parent?: svgElement;

    }

    interface Array {

        /**
         * Optionally-assigned {@link svgHTMLAsset} related to this array object.
         * @type {svgHTMLAsset} */
        htmlAsset?: svgHTMLAsset;

    }

}

declare module '../js/svg/definitions/svgDefinition' {
    
    interface svgDefinition {

        /**
         * Does a subclass handle {@linkcode svgDefinition.html html}
         * generation for this definition? If `true`, the `.html` getter
         * on this definition will return `null` (but `.html` getters on
         * subclasses will still be functional).
         * 
         * **Note:** you should still call `super.html` in the subclass's
         * `html` getter, because {@linkcode svgDefinition.html} has some
         * checks for warnings defined in {@linkcode svgConfig}. This flag
         * exists to access those warnings without wasting time in `html`.
         * @example
           mySubclass extends svgDefinition {
               constructor() {
                   super();
                   this.subclassHandlesHTML = true;
               }
               get html() {
                   super.html; // using the return value is optional 
                   let h = '<myDefinition>';
                   // compile subclass html here 
                   return h;
               }
           }
         * @type {boolean} */
        subclassHandlesHTML?: boolean;

    }

}

export { }