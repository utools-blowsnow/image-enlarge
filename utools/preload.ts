// 您可以在进行窗口交互
// utools文档

// https://www.u.tools/docs/developer/api.html#%E7%AA%97%E5%8F%A3%E4%BA%A4%E4%BA%92
import child_process from "child_process";
import axios from "axios";

const compressing = require('compressing');
const os = require("os");
const fs = require("fs");

window.versions = {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron
}
const getPlatform = () => {
    switch (os.platform()) {
        case "aix":
        case "freebsd":
        case "linux":
        case "openbsd":
        case "android":
            return "linux";
        case "darwin":
        case "sunos":
            return "mac";
        case "win32":
            return "win";
    }
};
const slash = getPlatform() === "win" ? "\\" : "/";

async function downloadByGithub(githubUrl) {
    return await Promise.race([
        axios.get("https://ghps.cc/" + githubUrl),
        axios.get("https://hub.gitmirror.com/" + githubUrl)
    ]);
}

window.mutils = {
    // 获取模型路径
    modelPath: () => {
        let appDataPath = utools.getPath("appData");
        return appDataPath + "\\image-handle\\models";
    },
    binPath: () => {
        let binPath = utools.getPath("appData") + "\\image-handle\\bin";
        return binPath;
    },
    // 初始化模型数据
    initModelData: async (callback) => {
        let modelPath = window.mutils.modelPath();
        if (!fs.existsSync(modelPath)) {
            fs.mkdirSync(modelPath, {
                recursive: true
            });
        }
        let modelList = fs.readdirSync(modelPath);
        callback && callback("检查模型列表");
        if (modelList.length === 0) {
            // 无模型数据，初始化
            callback && callback("无模型数据，下载模型数据中");
            let modelUrl = "";
            let modelData = downloadByGithub(modelUrl);

            callback && callback("模型数据下载成功");

            let modelZipPath = modelPath + slash + "model.zip";
            // 保存到本地
            fs.writeFileSync(modelZipPath, modelData);

            callback && callback("解压模型数据：" + modelPath);

            await compressing.zip.uncompress(modelZipPath, modelPath);

            // 删除zip
            fs.rmSync(modelZipPath)

            // 重新读取模型列表
            modelList = fs.readdirSync(modelPath);
        }
        console.log("modelList", modelPath, modelList);

        return modelList;
    },

    // 初始化bin数据
    initBinData: (callback) => {
        let binPath = window.mutils.binPath();
        if (!fs.existsSync(binPath)) {
            fs.mkdirSync(binPath);
        }
        let binList = fs.readdirSync(binPath);
        if (binList.length === 0) {
            // 无bin数据，初始化
        }

        return Promise.resolve();
    },

    // 开始执行
    spawnImageHandle: (args, options: object = {}) => {
        const binPath = "";
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
    },

    // 获取模型列表
    getModelList: () => {
        return Promise.resolve()
    },

}


window.mutils.initModelData(null);
console.log("preload.ts loaded", window.mutils.modelPath());
