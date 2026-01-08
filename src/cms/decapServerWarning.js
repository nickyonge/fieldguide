/**  DECAP SERVER CONNECTION WARNING DETECTOR
 * 
 * Autodetects when Decap CMS fails to connect, 
 * and reminds you to run npx decap-server, 
 * because we could all use a little reminder sometimes 
 * 
 *   INSTALLATION  
 * Drop/load this script the directory with Decap's index.html, and add 
<script src="decapServerWarning.js"></script>
 * to index.html's body, and you're good to go! 
 * This script auto-deletes upon successful connection.
*/

/**  CONFIG  */

/** Will the warning only trigger if the current browser URL includes `localhost`? */
const ONLY_TRIGGER_ON_LOCALHOST = true;
/** Text to display for the terminal output suggestion */
const TERMINAL_INPUT = 'npx decap-server';
/** Console message to listen for, signifying a *failed* connection :( */
const FAILURE_MESSAGE = 'Decap CMS Proxy Server not detected';
/** Console message to listen for, signifying a *successful* connection :) */
const SUCCESS_MESSAGE = 'Detected Decap CMS Proxy Server';

/** Listener for Decap server connection failure */
function DecapWarning() {
    // prep vars
    let style;
    let warning;
    // replace window.log with temp listener until decap is either found or not 
    let consoleLog = window.console.log;
    /** temporary interruption for console.log @param  {...object} data */
    window.console.log = (...data) => {
        // log message intercepted! 
        // output original message 
        consoleLog(...data);
        if (data) {
            // parse data to string 
            let logText;
            if (Array.isArray(data) && data.length > 0) {
                logText = data[0];
            } else if (typeof data == 'string') {
                logText = data;
            }
            if (logText && typeof logText === 'string') {
                // found logged output 
                if (logText.startsWith(FAILURE_MESSAGE)) {
                    // connection error detected, trigger error 
                    console.error(`Decap Connection Error Detected! Did you forget to run ${TERMINAL_INPUT}?`);
                    // on-screen error message
                    // create CSS
                    const css = ':root {--start-opacity: 0.1;}.decapWarning {background-color: rgba(0, 0, 0, 0.8); width: 40vw;min-width: 250px;height: auto;position: absolute;top: 0;left: 0;user-select: none;opacity: 0;animation-name: show;animation-duration: 1000ms; animation-fill-mode: forwards; animation-delay: 250ms; animation-timing-function: ease-out; }@keyframes show {from {opacity: var(--start-opacity); }to {opacity: 1;}}.decapWarning.window {margin: 5px;padding: 6px 25px 10px 10px; /* padding-bottom: 12px; */ }.decapWarning .title {color: rgb(242, 169, 169); padding-bottom: 5px;}.decapWarning .message {font-size: small;color: rgb(169, 169, 169); }.decapWarning .code {user-select: all;/* font-size: small; */ font-family: monospace; color: rgb(169, 213, 195); background-color: rgba(0, 0, 0, 0.27); width: fit-content;padding: 4px 12px 6px 6px; margin-top: 5px;}';
                    style = document.createElement('style');
                    style.textContent = css;
                    document.head.appendChild(style);
                    // create elements 
                    warning = document.createElement('div');
                    let title = document.createElement('div');
                    let msg = document.createElement('div');
                    let code = document.createElement('div');
                    // add relevant css classes 
                    warning.classList.add('decapWarning', 'window');
                    title.classList.add('title');
                    msg.classList.add('message');
                    code.classList.add('code');
                    // warning messages 
                    title.innerText = "Decap Proxy Server Connection Error";
                    msg.innerText = 'If using a local dev environment, remember to start the local server via terminal command:';
                    code.innerText = TERMINAL_INPUT;
                    // add to DOM 
                    warning.appendChild(title);
                    warning.appendChild(msg);
                    warning.appendChild(code);
                    document.body.appendChild(warning);
                    // disable, but don't destroy the warning 
                    disable(false);
                } else if (logText.startsWith(SUCCESS_MESSAGE)) {
                    // hooray! successful connection 
                    disable();
                }
            }
        }
        /** when done, return `window.console.log` to its original method */
    }
    /** 
     * return `console.log` to its original state, optionally remove the div and css styles 
     * @param {boolean} [remove=true] also remove elements and CSS?
    */
    function disable(remove = true) {
        if (consoleLog) {
            window.console.log = consoleLog;
            consoleLog = null;
        }
        if (remove) {
            if (style) {
                style.remove();
                style = null;
            }
            if (warning) {
                warning.remove();
                warning = null;
            }
        }
    }
}
// check only trigger on localhost
if (!ONLY_TRIGGER_ON_LOCALHOST || (document.URL && document.URL.toLowerCase().includes('localhost'))) {
    DecapWarning();
}

/** 
 * LICENSE INFO 
 *
 *   This script was written by Nick Yonge, 2026, and is released 
 *   under the terms of The Unlicense:
 * 
 * This is free and unencumbered software released into the public domain.
 * 
 * Anyone is free to copy, modify, publish, use, compile, sell, or
 * distribute this software, either in source code form or as a compiled
 * binary, for any purpose, commercial or non-commercial, and by any
 * means.
 * 
 * In jurisdictions that recognize copyright laws, the author or authors
 * of this software dedicate any and all copyright interest in the
 * software to the public domain. We make this dedication for the benefit
 * of the public at large and to the detriment of our heirs and
 * successors. We intend this dedication to be an overt act of
 * relinquishment in perpetuity of all present and future rights to this
 * software under copyright law.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 * For more information, please refer to <https://unlicense.org/>
 */