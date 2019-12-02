
const svg_url = "http://www.w3.org/2000/svg";

function create_circle(x, y, r) {
    const cir = document. createElementNS(svg_url, "circle");
    cir.setAttribute("cx", x);
    cir.setAttribute("cy", y);
    cir.setAttribute("r", r);
    cir.setAttribute("fill", "yellow");

    return cir
}

function create_rectangle(reg: number, fom : number, tom: number, color: string) {
    const L_y : number = 1000
    const r = document. createElementNS(svg_url, "rect");

    const nThichkness : number = 25;

    fom = L_y - fom;
    tom = L_y - tom;

    const length : number = fom - tom;

    fom = fom - length;

    const x_min : number = Math.round(reg - 1.0 * nThichkness/2.0);

    r.setAttribute("x", String(x_min));
    r.setAttribute("y", String(fom));
    r.setAttribute("width", String(nThichkness));

    r.setAttribute("height", String(length));
    r.setAttribute("fill", color);
    return r;
}


// create the svg element
//const svg1 = document. createElementNS(svg_url, "svg");

// set width and height
//svg1.setAttribute("width", "1000");
//svg1.setAttribute("height", "1000");
var svg1 : HTMLElement = document. getElementById("a");

svg1.appendChild(create_circle("80", "80", "30"));

svg1.appendChild(create_circle("130", "140", "20"));

svg1.appendChild(create_rectangle(240, 240, 330, "red"));
svg1.appendChild(create_rectangle(340, 340, 360, "red"));
svg1.appendChild(create_rectangle(330, 540, 560, "blue"));
svg1.appendChild(create_rectangle(430, 840, 870, "green"));



// attach container to document
// document. getElementById("aaa").appendChild(svg1);



