const canvas = document.querySelector("#canvas");
const triangulation = {
    vertices: [],
    edges:    [],
};

const resizeCanvas = () => {
    canvas.width  = canvas.parentNode.clientWidth * 0.9;
    canvas.height = canvas.parentNode.clientHeight * 0.9;
    drawScene(triangulation);
}

const setup = () => {
    resizeCanvas();

    // setup listeners
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mouseup", handleClick);
}

const drawVertex = (x, y) => {
    const size = 3;
    const ctx  = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(x, y, size, size);
    ctx.stroke();
    ctx.fill();
}

const drawScene = (triangulation) => {
    canvas.height = canvas.height;
    for (vertex of triangulation.vertices) {
        drawVertex(...vertex);
    }

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    for (let i = 1; i < triangulation.vertices.length; ++i) {
        ctx.moveTo(...triangulation.vertices[i-1]);
        ctx.lineTo(...triangulation.vertices[i]);
    }
    ctx.stroke();
}

const handleClick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const styl = window.getComputedStyle(canvas);
    const border = parseInt(styl.getPropertyValue("border-top-width"), 10);

    const x = event.clientX - (rect.left + border);
    const y = event.clientY - (rect.top + border);
    triangulation.vertices.push([x, y]);
    //drawVertex(x, y);
    drawScene(triangulation);
}

setup();
