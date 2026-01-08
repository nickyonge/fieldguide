import { CreateElement } from "./ui";
import * as cmp from './components';

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


    let btn = new cmp.Button('hi!');
    header.appendChild(btn);
    header.appendChild(new cmp.Button('hi2!'));
    header.appendChild(new cmp.Button('hi3!'));
    header.appendChild(new cmp.Button('hi4!'));
    header.appendChild(new cmp.Button('hi5!'));

}