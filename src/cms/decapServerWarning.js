// Decap Connection Warning Detector

/** 
 * Installation 
 * Drop/load this into the same directory as your Decap index.html, and add 
   <script src="decapServerWarning.js"></script>
   to index.html's body.
 */

// Config 
/** Will the warning only trigger if the current browser URL includes `localhost`? */
const ONLY_TRIGGER_ON_LOCALHOST = true;
/** Text to display for the terminal output suggestion */
const TERMINAL_INPUT = 'npx decap-server';

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
                if (logText.startsWith('Decap CMS Proxy Server not detected')) {
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
                    disable(false);
                } else if (logText.startsWith('Detected Decap CMS Proxy Server')) {
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