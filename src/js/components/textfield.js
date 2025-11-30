import * as ui from "../ui";
import { BasicComponent, TitledComponent } from "./base";

export class TextField extends BasicComponent {

    // #text;

    constructor(text) {
        super();

        ui.AddClassesToDOM(this.div, 'textField');
        this.div.innerText = text;
        
        // this.div.appendChild(this.#text);
        
    }
    
}
