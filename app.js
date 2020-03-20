const canvas = document.querySelector("#canvas");
const radius = 4;
const triangulation = {
    vertices: [],
    edges:    [],
};
const triGridDim = 3000;

const resizeCanvas = () => {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawScene(triangulation);
}

const canvasToGrid = p => {
    const minDimension = Math.min(canvas.clientWidth, canvas.clientHeight);
    const x = Math.round(p[0] * triGridDim / minDimension);
    const y = Math.round(p[1] * triGridDim / minDimension);
    return [x, y];
}

const gridToCanvas = p => {
    const minDimension = Math.min(canvas.clientWidth, canvas.clientHeight);
    const x = Math.round(p[0] * minDimension / triGridDim);
    const y = Math.round(p[1] * minDimension / triGridDim);
    return [x, y];
}

const getCanvasPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const styl = window.getComputedStyle(canvas);
    const border = parseInt(styl.getPropertyValue("border-top-width"), 10);

    const x = Math.round(event.clientX - (rect.left + border));
    const y = Math.round(event.clientY - (rect.top + border));
    return [x, y];
}

const drawVertex = p => {
    const ctx  = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(p[0], p[1], radius, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.fill();
}

const drawScene = triangulation => {
    canvas.height = canvas.height;
    for (vertex of triangulation.vertices) {
        drawVertex(gridToCanvas(vertex));
    }

    if (triangulation.vertices.length > 2) {
        pointsPOST(triangulation);
    }

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    for (let i = 1; i < triangulation.vertices.length; ++i) {
        ctx.moveTo(...gridToCanvas(triangulation.vertices[i-1]));
        ctx.lineTo(...gridToCanvas(triangulation.vertices[i]));
    }
    ctx.stroke();

}

const pointsPOST = triangulation => {
    const xhr = new XMLHttpRequest();
    const url = "upload"
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("text was:");
            console.log(xhr.responseText);
        }
    };
    xhr.send(JSON.stringify({"vertices": triangulation.vertices}));
}

const tempGet = () => {
    console.log("sending");
    const xhr = new XMLHttpRequest();
    const url = "hello"
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        console.log("recing");
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log("text was:");
            console.log(xhr.responseText);
        }
    };
    xhr.send();
}

const checkCollision = (p, ps) => {
    const collision = (p, p_, r) => {
        return (p[0]-p_[0])*(p[0]-p_[0]) + (p[1]-p_[1])*(p[1]-p_[1]) <= r*r;
    }

    for (let i = 0; i < ps.length; ++i) {
        if (collision(p, ps[i], radius)) {
            return i;
        }
    }
    return -1;
}

const updateVertex = (triangulation, i, p) => {
    triangulation.vertices[i][0] = p[0];
    triangulation.vertices[i][1] = p[1];
}

const handleMouseDown = (event) => {
    const p = getCanvasPosition(event);

    const iCollision = checkCollision(p, triangulation.vertices.map(gridToCanvas));
    if (iCollision > -1) {
        const updater = e => {
            const p = getCanvasPosition(e);
            updateVertex(triangulation, iCollision, canvasToGrid(p));
            drawScene(triangulation);
        };
        canvas.addEventListener("mousemove", updater);
        canvas.addEventListener("mouseup", event => {
            canvas.removeEventListener("mousemove", updater);
        },
        { once: true }
        );
    } else {
        triangulation.vertices.push(canvasToGrid(p));
    }
    drawScene(triangulation);
}

const setup = () => {
    resizeCanvas();

    // setup listeners
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
}

setup();
