const chokidar = require("chokidar");
const { exec } = require("child_process");

console.log("Watching src/ for changes...");

const watcher = chokidar.watch("src", {
    ignoreInitial: true
});

let building = false;

function build() {
    if (building) return;

    building = true;

    console.log("\nChanges detected. Building...\n");

    exec("npm run build", (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        building = false;
    });
}

watcher.on("add", build);
watcher.on("change", build);
watcher.on("unlink", build);