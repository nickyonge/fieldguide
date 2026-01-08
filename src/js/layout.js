import { AddClassToDOMs, CreateElement } from "./ui";
import * as cmp from './components';
import { OpenURL } from "./lilutils";

let header;
let main;
let footer;

export function InitializeLayout() {

    CreateHeader();
    CreateMain();
    CreateFooter();
}

function CreateHeader() {
    header = CreateElement('header');

    let btn = new cmp.Button('CMS');
    AddClassToDOMs('marginLeftAuto', btn.div);
    header.appendChild(btn);

    btn.onClickCallback = () => { OpenURL('cms'); };

    document.body.appendChild(header);
}
function CreateMain() {
    main = CreateElement('main');
    document.body.appendChild(main);
}
function CreateFooter() {
    footer = CreateElement('footer');
    document.body.appendChild(footer);
}