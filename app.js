const canvas = document.querySelector("#canvas");
const radius = 4;
const triangulation = {
    vertices: [],
    edges:    [],
};

const resizeCanvas = () => {
    canvas.width  = canvas.parentNode.clientWidth * 0.9;
    canvas.height = canvas.parentNode.clientHeight * 0.9;
    drawScene(triangulation);
}

const getCanvasPosition = (event) => {
    const rect = canvas.getBoundingClientRect();
    const styl = window.getComputedStyle(canvas);
    const border = parseInt(styl.getPropertyValue("border-top-width"), 10);

    const x = event.clientX - (rect.left + border);
    const y = event.clientY - (rect.top + border);
    return [x, y];
}

const drawVertex = (x, y) => {
    const ctx  = canvas.getContext("2d");

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
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

const updateVertex = (i, p) => {
    triangulation.vertices[i][0] = p[0];
    triangulation.vertices[i][1] = p[1];
}

const handleMouseDown = (event) => {
    const p = getCanvasPosition(event);

    const iCollision = checkCollision(p, triangulation.vertices);
    if (iCollision > -1) {
        const updater = e => {
            const p = getCanvasPosition(e);
            updateVertex(iCollision, p);
            drawScene(triangulation);
        };
        canvas.addEventListener("mousemove", updater);
        canvas.addEventListener("mouseup", event => {
            canvas.removeEventListener("mousemove", updater);
        },
        { once: true }
        );
    } else {
        triangulation.vertices.push(p);
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
