// Decap Connection Warning Detector 

// Config 
/** Will the warning only trigger if the current browser URL includes `localhost`? */
const ONLY_TRIGGER_ON_LOCALHOST = true;

/** Listener for Decap server connection failure */
function DecapWarning() {
    // create css 
    const css = ':root {--start-opacity: 0.1;}.devNote {background-color: rgba(0, 0, 0, 0.8); width: 40vw;min-width: 250px;height: auto;position: absolute;top: 0;left: 0;user-select: none;opacity: 0;animation-name: show;animation-duration: 1000ms; animation-fill-mode: forwards; animation-delay: 250ms; animation-timing-function: ease-out; }@keyframes show {from {opacity: var(--start-opacity); }to {opacity: 1;}}.devNote.window {margin: 5px;padding: 6px 25px 10px 10px; /* padding-bottom: 12px; */ }.devNote .title {color: rgb(242, 169, 169); padding-bottom: 5px;}.devNote .message {font-size: small;color: rgb(169, 169, 169); }.devNote .code {user-select: all;/* font-size: small; */ font-family: monospace; color: rgb(169, 213, 195); background-color: rgba(0, 0, 0, 0.27); width: fit-content;padding: 4px 12px 6px 6px; margin-top: 5px;}';
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // replace window.log with temp listener until decap is either found or not 
    const consoleLog = window.console.log;
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
                if (logText.includes('Decap CMS Proxy Server not detected')) {
                    // connection error detected, trigger error 
                    console.error("Decap Connection Error Detected! Did you forget to run `npx decap-server`?");
                    // on-screen error message 
                    // create elements 
                    let note = document.createElement('div');
                    let title = document.createElement('div');
                    let msg = document.createElement('div');
                    let code = document.createElement('div');
                    // add relevant css classes 
                    note.classList.add('devNote', 'window');
                    title.classList.add('title');
                    msg.classList.add('message');
                    code.classList.add('code');
                    // warning messages 
                    title.innerText = "Decap Proxy Server Connection Error";
                    msg.innerText = 'If using a local dev environment, remember to start the Decap local server via terminal:';
                    code.innerText = 'npx decap-server';
                    // add to DOM 
                    note.appendChild(title);
                    note.appendChild(msg);
                    note.appendChild(code);
                    document.body.appendChild(note);
                    disable();
                } else if (logText.includes('Detected Decap CMS Proxy Server')) {
                    // hooray! successful connection 
                    disable();
                }
            }
        }
        /** when done, return `window.console.log` to its original method */
        function disable() { window.console.log = consoleLog; }
    }
}
// check only trigger on localhost
if (!ONLY_TRIGGER_ON_LOCALHOST || (document.URL && document.URL.toLowerCase().includes('localhost'))) {
    DecapWarning();
}