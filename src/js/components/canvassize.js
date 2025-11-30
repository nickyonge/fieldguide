import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";
import * as txt from '../text';
import { currentSizeNumber, SelectSize } from "../contentData";


import canvasBase from '../../assets/png/canvases/evto_paintings_plain_faded.png';
// import canvasBase from '../../assets/png/canvases/evto_paintings_plain.png';
import canvasLgP from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_6lgp.png';
import canvasLg from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_5lg.png';
import canvasMdP from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_4mdp.png';
import canvasMd from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_3md.png';
import canvasSmP from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_2smp.png';
import canvasSm from '../../assets/png/canvases/alpha_assets/cutouts_colour_frames/evto_canvas_frame_1sm.png';

export const canvasDisplayAspectRatio = 1.7;

let canvasFramesArray = [canvasBase, canvasLgP, canvasLg, canvasMdP, canvasMd, canvasSmP, canvasSm];
// let canvasFramesArray = [canvasBase, canvasSm, canvasSmP, canvasMd, canvasMdP, canvasLg, canvasLgP];
const framesArrayInverted = true;
// inverting array makes tab indexing proceed correctly along canvas sizes 
// TODO: tab highlight does not appear around highlighted canvas frame images properly. issue with clip-path
// Issue URL: https://github.com/nickyonge/evto-web/issues/39

// export class CanvasSize extends TitledComponent {
export class CanvasSize extends BasicComponent {

    /** container div for all the images @type {HTMLElement} */
    #imageContainer;
    /** base image of the canvas, underneath the individual frames @type {HTMLElement} */
    #imgBase;
    /** array of all frame images of the canvas @type {HTMLElement[]} */
    #images;

    #parentGrid;

    constructor(componentTitle) {
        // super(componentTitle); // if titledcomponent
        super();

        ui.AddClassToDOMs('canvasSize', this.div);
        this.#imageContainer = ui.CreateDivWithClass('canvasSize', 'imageContainer');
        this.div.appendChild(this.#imageContainer);

        this.#images = [];
        for (let i = 0; i < canvasFramesArray.length; i++) {
            let img = ui.CreateImage(canvasFramesArray[i]);
            let canvasName;
            if (i == 0 || !framesArrayInverted) {
                canvasName = CanvasSize.canvasNumToName(i);
            } else {
                canvasName = CanvasSize.canvasNumToName(canvasFramesArray.length - i);
            }
            ui.AddClassesToDOM(img, 'canvasSize', 'image', 'selectable', canvasName);
            img.draggable = false;
            if (i == 0) {
                // base image
                this.#imgBase = img;
            } else {
                // canvas frame images
                ui.AddClassToDOMs('frame', img);
                this.#images.push(img);
                // add event callback
                img.addEventListener('click', function () {
                    // selected size i - 1
                    SelectSize(framesArrayInverted ? canvasFramesArray.length - i - 1 : i - 1);
                }.bind(this));
                ui.MakeTabbableWithInputTo(img, img);
            }
            // add to image container
            this.#imageContainer.appendChild(img);
        }

        // add resize event 
        window.addEventListener('resize', function () {
            // re-fire size assignment events on page resize
            // update appearance after one-tick delay
            window.setTimeout(() => {
                // one tick delay
                this.UpdateVisibility();
            }, 0);
        }.bind(this));

        // this._addHelpIcon(`${componentTitle}`);
    }

    DocumentLoaded() {
        this.UpdateVisibility();
        this.UpdateCosts();
    }

    UpdateVisibility() {
        if (!this.#parentGrid) {
            // ensure we have reference to the parent grid 
            this.#parentGrid = this.div.parentElement;
        }
        let singleColumn = ui.HasAttributeWithValue(this.#parentGrid, 'singleColumn', true);

        // hide if area is less than 30000, or single column and height is less than 250

        let rect = this.parentPage.getBoundingClientRect();
        let width = rect.width;
        let height = rect.height;
        let area = width * height;

        let showCanvases = true;
        if ((singleColumn && area < 30000) ||
            (singleColumn && height < 250) ||
            (!singleColumn && area < 50000)) {
            showCanvases = false;
        }

        this.div.hidden = !showCanvases;
        if (showCanvases) {
            ui.RemoveElementAttribute(this.#parentGrid, "forceSingleColumn");
        } else {
            ui.AddElementAttribute(this.#parentGrid, "forceSingleColumn", true);
        }
    }

    UpdateCosts() {
        // size has been updated 
        for (let i = 0; i < this.#images.length; i++) {
            let img = framesArrayInverted ? this.#images[this.#images.length - i - 1] : this.#images[i];
            // let img = this.#images[i];
            if (i == currentSizeNumber) {
                // currently selected frame 
                ui.AddElementAttribute(img, 'selected');
            } else {
                // not current frame
                ui.RemoveElementAttribute(img, 'selected');
            }
        }
    }

    /**
     * 
     * @param {string} name 
     */
    static canvasNameToNum(name) {
        if (!name) { return null; }
        switch (name.toLowerCase().replaceAll(' ', '')) {
            case 'all':
                return 0;
            case 'sm':
            case 'small':
                return 1;
            case 'smp':
            case 'smallplus':
                return 2;
            case 'md':
            case 'med':
            case 'medium':
                return 3;
            case 'mdp':
            case 'medp':
            case 'medplus':
            case 'mediumplus':
                return 4;
            case 'lg':
            case 'large':
                return 5;
            case 'lgp':
            case 'largeplus':
                return 6;
        }
        return null;
    }
    static canvasNumToName(num, fullName = false) {
        switch (num) {
            case 0:
                return 'all';
            case 1:
                return fullName ? 'small' : 'sm';
            case 2:
                return fullName ? 'small plus' : 'smp';
            case 3:
                return fullName ? 'medium' : 'md';
            case 4:
                return fullName ? 'medium plus' : 'mdp';
            case 5:
                return fullName ? 'large' : 'lg';
            case 6:
                return fullName ? 'large plus' : 'lgp';
        }
    }
}