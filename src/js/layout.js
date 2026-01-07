import { CreateElement } from "./ui";

let header;
let main;
let footer;

export function InitializeLayout() {

    header = CreateElement('header');
    main = CreateElement('main');
    footer = CreateElement('footer');

    document.body.appendChild(header);
    document.body.appendChild(main);
    document.body.appendChild(footer);

}