/** Project Begins Here */

import './css';
import { InitializeLayout } from './layout';

// initial window load callback 
window.addEventListener('load', function () {
    // window is initially loaded

    /** --- Initialization code goes here --- */

    InitializeLayout();

    // DemoDiv();

    // post-load timeout 
    this.setTimeout(() => {
        // one tick after loading 

        /** --- Post-loading code goes here --- */

    }, 0);

});

/** Creates a simple div with a friendly message! */
function DemoDiv() {
    
    // create elememts
    let container = document.createElement('span');
    let inner = document.createElement('div');
    
    // apply classes
    container.classList.add('simpleContainer');
    inner.classList.add('inner');
    
    // add content
    inner.innerHTML = 'Hello, waddle! 🦆💖';
    
    // add to body
    document.body.appendChild(container);
    container.appendChild(inner);

}
