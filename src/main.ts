import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Cameron's Paint Game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.prepend(header);

// const canvas = document.createElement("canvas");
// canvas.id = "myCanvas";
// canvas.width = 256;
// canvas.height = 256;
