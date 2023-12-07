const child_process = require('child_process');

const binPath = "E:\\other\\test\\utools_image\\statics\\win\\bin\\upscayl-bin.exe";

module.exports = function (args, options = {}) {
    return new Promise((resolve, reject) => {
        let p;
        try {
            p = child_process.spawn(binPath, args, {
                cwd: undefined,
                detached: false,
            })
        } catch (e) {
            console.log("❌ spawn failed", e);
            reject(new Error("spawn failed"));
        }
        p.stderr.on('data', (data) => {
            if (data.includes("invalid gpu")) {
                console.log("❌ INVALID GPU", data.toString());
                p.kill();
                reject(new Error("INVALID GPU"));
                return;
            }
            if (data.includes("failed")) {
                console.log("❌ FAILED", data.toString());
                p.kill();
                reject(new Error("FAILED"));
                return;
            }
            if (data.includes("has alpha channel")) {
                console.log("📢 INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
            }
            options.onProgress && options.onProgress(data.toString());
        })
        p.on('error', (err) => {
            console.error(`子进程开启失败`, err);
            reject(err);
        })
        p.on('close', (code) => {
            console.log(`子进程退出码：${code}`);
            resolve();
        })

        options.process = p;
    });
}
