const scene = {
    vertices: [],
    edges:    [],
}

const canvas = document.querySelector("#canvas");
const radius = 4;
const state = {
    vertices: [],
}
const triGridDim = 3000;

const resizeCanvas = () => {
    const minDimension = Math.min(canvas.parentNode.clientWidth, canvas.parentNode.clientHeight);
    canvas.style.width = minDimension + "px";
    canvas.style.height = minDimension + "px";

    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawScene(scene.vertices, scene.edges);
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

const drawScene = (vertices, edges) => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "100px Arial";
    ctx.fillText(edges.length, 0, 100);
    for (vertex of vertices) {
        drawVertex(gridToCanvas(vertex));
    }

    ctx.beginPath();
    for (edge of edges) {
        ctx.moveTo(...gridToCanvas(vertices[edge[0]]));
        ctx.lineTo(...gridToCanvas(vertices[edge[1]]));
    }
    ctx.stroke();

}

let unprocessed = false;
const pointsPOST = vertices => {
    if (vertices.length < 3) {
        scene.vertices = [...vertices];
        scene.edges    = [];
        drawScene(scene.vertices, scene.edges);
        return;
    } else {
        if (unprocessed) return;

        unprocessed = true;
        const xhr = new XMLHttpRequest();
        const url = "upload"
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                data = JSON.parse(xhr.responseText)
                scene.vertices = data.V;
                scene.edges    = data.E;
                drawScene(scene.vertices, scene.edges);
                unprocessed = false;
            }
        };
        xhr.send(JSON.stringify({"V": vertices, "E": []}));
    }
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

const updateVertex = (vertices, i, p) => {
    vertices[i][0] = p[0];
    vertices[i][1] = p[1];
}

const handleMouseDown = (event) => {
    const p = getCanvasPosition(event);

    const iCollision = checkCollision(p, state.vertices.map(gridToCanvas));
    if (iCollision > -1) {
        const updater = e => {
            const p = getCanvasPosition(e);
            updateVertex(state.vertices, iCollision, canvasToGrid(p));
            //drawScene(state.vertices, scene.edges);
            pointsPOST(state.vertices);
        };
        canvas.addEventListener("mousemove", updater);
        canvas.addEventListener("mouseup", event => {
            pointsPOST(state.vertices);
            canvas.removeEventListener("mousemove", updater);
        },
        { once: true }
        );
    } else {
        state.vertices.push(canvasToGrid(p));
        pointsPOST(state.vertices);
    }
}

const setup = () => {
    resizeCanvas();

    // setup listeners
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    canvas.addEventListener("mousedown", handleMouseDown);
}

setup();
