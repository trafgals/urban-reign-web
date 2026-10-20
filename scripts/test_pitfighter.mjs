import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import WebSocket from "ws";

async function main() {
    const tempDir = path.join(os.tmpdir(), "chrome-test-pit-" + Date.now());
    fs.mkdirSync(tempDir, { recursive: true });

    console.log("Starting Headless Chrome...");
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const chromeProc = spawn(chromePath, [
        "--headless=new",
        "--remote-debugging-port=9445",
        "--no-sandbox",
        "--enable-unsafe-webgpu",
        "--use-angle=d3d11",
        "--autoplay-policy=no-user-gesture-required",
        `--user-data-dir=${tempDir}`,
        "about:blank"
    ]);

    const cleanup = () => {
        try { chromeProc.kill(); } catch (_) {}
        try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
    };

    process.on("SIGINT", cleanup);
    process.on("exit", cleanup);

    await new Promise(r => setTimeout(r, 1500));

    const listRes = await fetch("http://127.0.0.1:9445/json/list");
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === "page") || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let nextId = 1;
    const send = (method, params = {}) => {
        const id = nextId++;
        ws.send(JSON.stringify({ id, method, params }));
    };

    ws.on("open", () => {
        send("Console.enable");
        send("Runtime.enable");
        send("Page.enable");
        console.log("Navigating to https://trafgals.github.io/urban-reign-pitfighter/ ...");
        send("Page.navigate", { url: "https://trafgals.github.io/urban-reign-pitfighter/" });
    });

    ws.on("message", (raw) => {
        const msg = JSON.parse(raw);
        if (msg.method === "Runtime.consoleAPICalled") {
            const text = msg.params.args.map(a => a.value ?? a.description ?? "").join(" ");
            console.log(`[CONSOLE ${msg.params.type}]`, text);
        }
        if (msg.method === "Runtime.exceptionThrown") {
            const exp = msg.params.exceptionDetails;
            console.error(`[EXCEPTION]`, exp.text, exp.exception?.description || "");
        }
        if (msg.method === "Page.loadEventFired") {
            console.log("Page loaded! Waiting 3s for WASM / runtime initialization...");
            setTimeout(() => {
                // Click the Start button
                send("Runtime.evaluate", {
                    expression: `
                    (() => {
                        const btn = document.getElementById("start");
                        if (btn) {
                            btn.click();
                            return "Clicked start button";
                        }
                        return "Start button not found";
                    })()
                    `
                });
            }, 3000);
        }
    });

    await new Promise(r => setTimeout(r, 8000));
    console.log("Test finished.");
    cleanup();
    process.exit(0);
}

main().catch(console.error);
