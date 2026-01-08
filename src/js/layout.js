import { CreateElement } from "./ui";
import * as cmp from './components';

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

    let btn = new cmp.Button('hi!');
    header.appendChild(btn);
    header.appendChild(new cmp.Button('hi2!'));
    header.appendChild(new cmp.Button('hi3!'));
    header.appendChild(new cmp.Button('hi4!'));
    header.appendChild(new cmp.Button('CMS'));

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