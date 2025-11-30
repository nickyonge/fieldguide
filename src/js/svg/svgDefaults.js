import * as svg from './index';

export const PRESERVEASPECTRATIO = null;
/** @type {([string, any?])[]} */
export const METADATA = [
    ['xmlns', 'http://www.w3.org/2000/svg'],
    ['xmlns:xlink', 'http://www.w3.org/1999/xlink'],
];

export const BUBBLE_ONCHANGE = true;
export const UPDATE_DEFINITIONS_ON_ID_CHANGE = true;

export const X = 0;
export const Y = 0;
export const WIDTH = 200;
export const HEIGHT = 100;
export const FILL = '#beeeef';
export const STROKE = null;
export const OPACITY = 1;

export const RECT_RX = null;
export const RECT_RY = null;

export const R = HEIGHT;
export const CX = X;
export const CY = Y;

export const ELLIPSE_RX = 100;
export const ELLIPSE_RY = R;

export const X1 = X;
export const Y1 = Y;
export const X2 = WIDTH;
export const Y2 = HEIGHT;

export const POINTS = [[X1, Y1], [X1, Y2], [X2, Y2], [X2, Y1]];

export const D = 'M0,0 L20,0 L20,10 L0,10 Z';
export const PATHLENGTH = null;

export const GRADIENT_ISRADIAL = false;
export const GRADIENT_SHARPNESS = 0;
export const GRADIENT_MIRROR = false;
export const GRADIENT_SCALE = 1;
export const GRADIENT_SCALEPIVOT = 50;
export const GRADIENT_ANGLE = 0;
export const GRADIENT_ANGLEPIVOTPOINT = { x: 50, y: 50 };
export const GRADIENT_OFFSET = 0;
export const GRADIENT_OPACITY = null;
export const GRADIENT_X1 = '0%';
export const GRADIENT_Y1 = '50%';
export const GRADIENT_X2 = '100%';
export const GRADIENT_Y2 = '50%';
export const GRADIENT_X1_SCALEDEFAULT = '0%';// default value of an undefined linearGradiant x1, used for scaling 
export const GRADIENT_Y1_SCALEDEFAULT = '50%';// default value of an undefined linearGradiant y1, used for scaling 
export const GRADIENT_X2_SCALEDEFAULT = '100%';// default value of an undefined linearGradiant x2, used for scaling 
export const GRADIENT_Y2_SCALEDEFAULT = '50%';// default value of an undefined linearGradiant y2, used for scaling 
export const GRADIENT_FX = null;
export const GRADIENT_FY = null;
export const GRADIENT_CX = '50%';
export const GRADIENT_CY = '50%';
export const GRADIENT_FX_SCALEDEFAULT = null;// default value of an undefined radialGradiant fx, used for scaling 
export const GRADIENT_FY_SCALEDEFAULT = null;// default value of an undefined radialGradiant fy, used for scaling 
export const GRADIENT_CX_SCALEDEFAULT = '50%';// default value of an undefined radialGradiant cx, used for scaling 
export const GRADIENT_CY_SCALEDEFAULT = '50%';// default value of an undefined radialGradiant cy, used for scaling 
export const GRADIENT_FR = null;
export const GRADIENT_R = null;
export const GRADIENT_FR_SCALEDEFAULT = '0%';// default value of an undefined radialGradiant fr, used for scaling 
export const GRADIENT_R_SCALEDEFAULT = '50%';// default value of an undefined radialGradiant r, used for scaling 
export const GRADIENT_UNITS = null;
export const GRADIENT_TRANSFORM = null;
export const GRADIENT_SPREADMETHOD = null;
export const GRADIENT_HREF = null;

export const GRADIENT_COLOR1 = 'black';
export const GRADIENT_COLOR2 = 'white';
export const GRADIENT_COLORARRAY = [GRADIENT_COLOR1, GRADIENT_COLOR2];

export const GRADIENT_STOP_OFFSET = 'auto';
export const GRADIENT_STOP_COLOR = null;
export const GRADIENT_STOP_OPACITY = null;

export const XYWHDEF_MATCHVIEWBOX = true;
export const XYWHDEF_INCLUDEXYWHNDATA = true;

export const IMAGE_HREF = null;
export const IMAGE_PRESERVEASPECTRATIO = null;
export const IMAGE_CROSSORIGIN = null;
export const IMAGE_DECODING = null;

export const MASK_MASKTYPE = null;
export const MASK_MASKCONTENTUNITS = null;
export const MASK_MASKUNITS = null;
export const MASK_AUTOGENERATERECT = true;

export const FILTER_COLORINTERPOLATIONFILTERS = null;
export const FILTER_FILTERUNITS = null;
export const FILTER_PRIMITIVEUNITS = null;
export const FILTER_PRIMITIVE_IN = null;
export const FILTER_PRIMITIVE_IN2 = null;
export const FILTER_PRIMITIVE_RESULT = null;
export const FILTER_PRIMITIVE_BLEND_MODE = null;

/**
 * Ensures that the given values either have content
 * @param  {spreadString} colors 
 * @returns 
 */
export function EnsureGradientDefaultColors(...colors) {
    colors = colors.flattenSpread();
    if (colors == null) { colors = []; }
    colors = colors.flat();
    switch (colors.length) {
        case 0: return GRADIENT_COLORARRAY;
        case 1: return svg.config.GRADIENT_DEFAULT_COLORARRAY_FORCE_TWO_VALUES ?
            [colors[0], GRADIENT_COLOR2] : colors;
        default: return colors;
    }
}