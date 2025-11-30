import * as ui from "../ui";
// import iconHelp from '../../assets/svg/icons-white/icon-help.svg';
import * as txt from "../text";
import { ToggleOverlay } from "../uiOverlay";

export class HelpIcon {

    #helpDiv;
    #helpExpansionDiv;
    // #iconImg;
    #helpQIconDiv;

    helpTextTitle;
    helpTextBody;

    constructor(parentDiv, helpTextTitle, togglePos = false, rightJustify = true) {

        // TODO: help text should load text from txt dictionary, maybe based on component title?
        // Issue URL: https://github.com/nickyonge/evto-web/issues/36
        this.setText(helpTextTitle);

        if (rightJustify) {
            this.#helpExpansionDiv = ui.CreateDivWithClass('helpExpansionDiv');
            parentDiv.appendChild(this.#helpExpansionDiv);
            // this.#titleElement.appendChild(ui.CreateDivWithClass('expansionDiv'));
        }

        this.#helpDiv = togglePos ?
            ui.CreateDivWithClass('helpDiv', 'selectable', 'togglePos') :
            ui.CreateDivWithClass('helpDiv', 'selectable');

        //create icon
        // this.#iconImg = ui.CreateImage(iconHelp, txt.HELPICON_ALT);
        // ui.AddClassToDOMs('helpIcon', this.#iconImg);
        // this.#helpDiv.appendChild(this.#iconImg);

        this.#helpQIconDiv = ui.CreateDivWithClass('helpQIcon');
        this.#helpQIconDiv.innerHTML = '?';
        this.#helpDiv.appendChild(this.#helpQIconDiv);
        ui.DisableContentSelection(this.#helpQIconDiv);

        // prevent event propogation
        this.#helpDiv.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            // selected help icon 
            this.displayHelpText();
        });

        parentDiv.appendChild(this.#helpDiv);

        ui.MakeTabbableWithInputTo(this.#helpDiv, this.#helpDiv);

    }

    setText(title, body) {
        if (title == null) { title = txt.HELPICON_ALT; }
        if (body == null) { body = txt.LIPSUM_FULL; }
        this.titleText = title;
        this.bodyText = body;
        // oops i wrote getters and setters before i remembered
        // that the overlay updates the html, not this element. oh well!
    }

    set titleText(text) {
        this.helpTextTitle = text;
    }
    set bodyText(text) {
        this.helpTextBody = text;
    }
    get titleText() {
        return this.helpTextTitle;
    }
    get bodyText() {
        return this.helpTextBody;
    }

    displayHelpText() {
        ToggleOverlay(this.helpTextBody, this.helpTextTitle, this.#helpDiv);
    }
}