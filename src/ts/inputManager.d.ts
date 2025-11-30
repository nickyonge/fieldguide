/* System for detecting and tracking cursor-based user input */

/** API determining the user's current cursor-based {@linkcode InputMode} */
interface InputModeAPI {

    /** 
     * Gets the currently-active {@linkcode InputMode}
     * - **Note:** Read-only, can't be directly assigned. 
     * If you need to do that, use {@linkcode forceMode}. 
     */
    readonly mode: inputMode;

    /** Is {@linkcode mode} currently {@linkcode InputMode.MOUSE}? */
    readonly isMouse: boolean;

    /** 
     * Is {@linkcode mode} currently {@linkcode InputMode.TOUCH}? 
     * - **Note:** If {@linkcode penAndTouchProtocol} is 
     * {@linkcode PenAndTouchProtocol.PenIsTouchOnly} or
     * {@linkcode PenAndTouchProtocol.Equivalent}, this also returns 
     * `true` if {@linkcode mode} is {@linkcode InputMode.PEN}
     */
    readonly isTouch: boolean;

    /** 
     * Is {@linkcode mode} currently {@linkcode InputMode.PEN}? 
     * - **Note:** If {@linkcode penAndTouchProtocol} is 
     * {@linkcode PenAndTouchProtocol.TouchIsPenOnly} or
     * {@linkcode PenAndTouchProtocol.Equivalent}, this also returns 
     * `true` if {@linkcode mode} is {@linkcode InputMode.TOUCH}
     */
    readonly isPen: boolean;

    /** 
     * Should {@link InputMode.PEN pen} input be considered a touch when 
     * checking {@linkcode InputModeAPI.isTouch()}, and/or vise-versa? Default `true`
     * 
     * This will cause {@linkcode isTouch()} and {@linkcode isPen()} to 
     * return `true` if {@linkcode mode} is either {@linkcode InputMode.PEN pen} 
     * or {@linkcode InputMode.TOUCH touch}.
     * - **Note:** The value of {@linkcode mode} itself will not be affected. 
     * Therefore when checking whether the current {@linkcode mode} is 
     * {@link InputMode.TOUCH touch} or not, you should always use 
     * {@linkcode isTouch()} instead of `mode === InputMode.TOUCH`
     */
    penAndTouchProtocol: PenAndTouchProtocol;

    /** 
     * Optional, generally used for testing. If non-null, forces 
     * {@linkcode mode} to return this value. 
     * @type {inputMode} 
     */
    forceMode?: inputMode;

    /** 
     * Event fired when {@linkcode InputModeAPI.mode} 
     * changes to a different {@linkcode InputMode} 
     * - **Note:** Even if the {@linkcode penAndTouchProtocol} 
     * treats pen / touch inputs similarly, this event will 
     * still fire when {@linkcode mode} changes between 
     * {@linkcode InputMode.TOUCH} and {@linkcode InputMode.PEN}.
    */
    readonly inputModeChange: 'inputModeChange';

    /** 
     * The default {@linkcode mode} used, based on the user's device capabilities. 
     * 
     * If {@linkcode hasTouchscreen} is `true`, this will be 
     * {@linkcode InputMode.TOUCH}. If `false`, it will be {@linkcode InputMode.MOUSE} 
     * - **Note:** The default mode will never be {@linkcode InputMode.PEN}
     */
    readonly defaultMode: inputMode;

    /**
     * Returns whether or not a touchscreen is available on the 
     * user's device, returning `true` if so, or 'false' if not. 
     * 
     * @author Elvis Sedic  
     * {@link https://www.github.com/esedic github.com/esedic} 
     * 
     * Wrote the {@link https://gist.github.com/esedic/39a16a7521d42ae205203e3d40dc19f5 detect_touch.js} 
     * GitHub gist. This function uses that script's "Method 4" 
     * @returns {boolean}
     */
    readonly hasTouchscreen: boolean;

}

declare global {

    /** Possible cursor-based input modes for user interaction 
     * - **Note:** this is the data type.  
     * For the enum with string literals, see {@linkcode InputMode} (uppercase `I`). 
     */
    type inputMode = (typeof InputMode)[keyof typeof InputMode];

    /**
     * Possible cursor-based input modes for user interaction 
     * - **Note:** this is the enum for string literals.  
     * For the type, see {@linkcode inputMode} (lowercase `i`). 
     */
    const InputMode: Readonly<{
        /** 
         * Mouse, typically laptop or desktop PC, 
         * sometimes tablet */
        MOUSE: 'mouse';
        /** 
         * Touch, typically mobile or tablet 
         * @see {@linkcode InputModeAPI.penAndTouchProtocol} 
         * to consider {@linkcode InputMode.PEN} and {@linkcode InputMode.TOUCH TOUCH} 
         * inputs as equivalently valid during 
         * {@linkcode InputModeAPI.isTouch()} and 
         * {@linkcode InputModeAPI.isPen() isPen()} checks. */
        TOUCH: 'touch';
        /** Pen, uncommon but typically tablet or laptop. 
         * @see {@linkcode InputModeAPI.penAndTouchProtocol} 
         * to consider {@linkcode InputMode.TOUCH} and {@linkcode InputMode.PEN PEN} 
         * inputs as equivalently valid during 
         * {@linkcode InputModeAPI.isPen()} and 
         * {@linkcode InputModeAPI.isTouch() isTouch()} checks. */
        PEN: 'pen';
    }>;
    
    /** 
     * Protocol for handling {@linkcode InputMode.TOUCH} and {@linkcode InputMode.PEN} inputs 
     * between the {@linkcode InputModeAPI.isTouch()} and {@linkcode InputModeAPI.isPen()} checks. 
     * - **Note:** this is the data type.  
     * For the enum with string literals, see {@linkcode penAndTouchProtocol} (uppercase `P`). 
     */
    type penAndTouchProtocol = (typeof InputMode)[keyof typeof InputMode];

    /** 
     * Protocol for handling {@linkcode InputMode.TOUCH} and {@linkcode InputMode.PEN} inputs 
     * between the {@linkcode InputModeAPI.isTouch()} and {@linkcode InputModeAPI.isPen()} checks. 
     * - **Note:** this is the enum for string literals.  
     * For the type, see {@linkcode penAndTouchProtocol} (lowercase `p`). 
     */
    declare const PenAndTouchProtocol: {
        /** 
         * None, {@linkcode InputModeAPI.isTouch()} will only return `true`
         * if {@linkcode InputModeAPI.mode} is {@linkcode InputMode.TOUCH},
         * and {@linkcode InputModeAPI.isPen()} will only return `true`
         * if {@linkcode InputModeAPI.mode} is {@linkcode InputMode.PEN}. 
         * 
         * Useful for projects that have explicitly separate stylus 
         * and touchscreen features. 
         */
        None: 'none',
        /**
         * {@linkcode InputModeAPI.isPen()} will return `true` if {@linkcode InputModeAPI.mode} 
         * is {@linkcode InputMode.TOUCH}, but {@linkcode InputModeAPI.isTouch()} 
         * will return `false` if {@linkcode InputModeAPI.mode} is {@linkcode InputMode.PEN}. 
         * 
         * Uncommon, only for projects that require a stylus to use. 
         */
        TouchIsPenOnly: 'touchIsPenOnly',
        /** 
         * {@linkcode InputModeAPI.isTouch()} will return `true` if {@linkcode InputModeAPI.mode} 
         * is {@linkcode InputMode.PEN}, but {@linkcode InputModeAPI.isPen()} 
         * will return `false` if {@linkcode InputModeAPI.mode} is {@linkcode InputMode.TOUCH}. 
         * 
         * Useful for touchscreen devices with styluses when your 
         * project does not have any pen-specific features. 
         * 
         * Default value. 
         */
        PenIsTouchOnly: 'penIsTouchOnly', // omg this name tho lol 
        /** 
         * Both {@linkcode InputModeAPI.isTouch()} and {@linkcode InputModeAPI.isPen()}
         * will return `true` if {@linkcode InputModeAPI.mode} is either 
         * {@linkcode InputMode.TOUCH} or {@linkcode InputMode.PEN}. 
         * 
         * Uncommon, but useful for touchscreen devices with styluses 
         * when your project has lots of touch-and-pen based features 
         * that can be used interchangeably - or when you want to use 
         * {@linkcode InputModeAPI.isTouch()} and {@linkcode InputModeAPI.isPen()} 
         * all willy-nilly, you heathen. 
         */
        Equivalent: 'equivalent'
    }

    interface Window {
        /** API determining the user's current cursor-based {@linkcode InputMode} */
        InputMode: InputModeAPI;
    }
}

export { };
