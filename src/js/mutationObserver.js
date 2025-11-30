// MutationObserver to track changes to the DOM list

/** @type {MutationObserver} */
let observer;

let addNodeCallbacks = [];
let removeNodeCallbacks = [];

export function StartObservation() {
    if (IsObserving()) { return; }
    observer = new MutationObserver(function (mutationsList, observer) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        for (let i = 0; i < addNodeCallbacks.length; i++) {
                            if (addNodeCallbacks[i] &&
                                (addNodeCallbacks[i][0] == node ||
                                    node.contains(addNodeCallbacks[i][0])) &&
                                addNodeCallbacks[i][1]) {
                                addNodeCallbacks[i][1](addNodeCallbacks[i][0]);
                            }
                        }
                    }
                });
                mutation.removedNodes.forEach(node => {
                });
                // a child node has been added or removed 
            } else if (mutation.type === 'attributes') {
                // the ${mutation.attributeName} attribute was modified 
            }
        }
    });
    observer.observe(document.body, { childList: true });
}

export function DisconnectObserver() {
    if (!IsObserving()) { return; }
    observer.disconnect();
    observer = null;
}

export function IsObserving() {
    return observer != null;
}

export function ObserverCallbackOnAdded(targetNode, callback) {
    if (!IsObserving()) {
        console.warn(`WARNING: Observing for added callback on ${targetNode}, but observation is not running. Starting now, but remember to stop when done!`);
        StartObservation();
    }
    for (let i = 0; i < addNodeCallbacks.length; i++) {
        // ensure callback isn't already added
        if (addNodeCallbacks[i][0] == targetNode &&
            addNodeCallbacks[i][1] == callback) {
            // callback already added
            return;
        }
    }
    addNodeCallbacks.push([targetNode, callback]);
}
export function ObserverCallbackOnRemoved(targetNode, callback) {
    if (!IsObserving()) {
        console.warn(`WARNING: Observing for removed callback on ${targetNode}, but observation is not running. Starting now, but remember to stop when done!`);
        StartObservation();
    }
    for (let i = 0; i < removeNodeCallbacks.length; i++) {
        // ensure callback isn't already added
        if (removeNodeCallbacks[i][0] == targetNode &&
            removeNodeCallbacks[i][1] == callback) {
            // callback already added
            return;
        }
    }
    removeNodeCallbacks.push([targetNode, callback]);
}