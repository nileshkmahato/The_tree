const data = {
    name: "Parent",
    children: [
        { name: "Child 1" },
        {
            name: "Child 2",
            children: [
                { name: "Grandchild 1" },
                { name: "Grandchild 2" }
            ]
        }
    ]
};

const margin = { top: 20, right: 120, bottom: 20, left: 120 };
const width = 960 - margin.right - margin.left;
const height = 500 - margin.top - margin.bottom;

let isHorizontal = true;

const svg = d3.select("#tree-container").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("marker")
    .attr("id", "arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 10)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("class", "arrowHead");

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const root = d3.hierarchy(data);

let tree = d3.tree().size([height, width]);

function update() {
    tree(root);

    const nodes = root.descendants();
    const links = root.links();

    g.selectAll(".link").remove();
    g.selectAll(".node").remove();

    const link = g.selectAll(".link")
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d => diagonal(d))
        .attr("marker-end", "url(#arrow)");

    const node = g.selectAll(".node")
        .data(nodes)
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => isHorizontal ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`)
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    node.append("circle")
        .attr("r", 10);

    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}

function diagonal(d) {
    return isHorizontal ?
        `M${d.source.y},${d.source.x}
         C${(d.source.y + d.target.y) / 2},${d.source.x}
         ${(d.source.y + d.target.y) / 2},${d.target.x}
         ${d.target.y},${d.target.x}` :
        `M${d.source.x},${d.source.y}
         C${d.source.x},${(d.source.y + d.target.y) / 2}
         ${d.target.x},${(d.source.y + d.target.y) / 2}
         ${d.target.x},${d.target.y}`;
}

function dragStarted(event, d) {
    d3.select(this).raise().attr("stroke", "black");
}

function dragged(event, d) {
    if (isHorizontal) {
        d.x = event.y;
        d.y = event.x;
    } else {
        d.x = event.x;
        d.y = event.y;
    }
    d3.select(this).attr("transform", isHorizontal ? `translate(${d.y},${d.x})` : `translate(${d.x},${d.y})`);
    g.selectAll(".link").attr("d", d => diagonal(d));
}

function dragEnded(event, d) {
    d3.select(this).attr("stroke", null);
}

document.getElementById('toggleButton').addEventListener('change', (event) => {
    isHorizontal = !event.target.checked;
    tree = d3.tree().size(isHorizontal ? [height, width] : [width, height]);
    update();
});

update();
