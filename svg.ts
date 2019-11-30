
const svg_url = "http://www.w3.org/2000/svg";

function create_circle(x, y, r) {
    const cir = document. createElementNS(svg_url, "circle");
    cir.setAttribute("cx", x);
    cir.setAttribute("cy", y);
    cir.setAttribute("r", r);
    cir.setAttribute("fill", "yellow");

    return cir
}

// create the svg element
const svg1 = document. createElementNS(svg_url, "svg");

// set width and height
svg1.setAttribute("width", "100");
svg1.setAttribute("height", "100");

const cir1 = create_circle("80", "80", "30")
svg1.appendChild(cir1);

const cir2 = create_circle("30", "40", "20")
svg1.appendChild(cir2);


// attach container to document
document. getElementById("svg54583").appendChild(svg1);



