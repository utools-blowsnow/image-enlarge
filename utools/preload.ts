// 您可以在进行窗口交互
// utools文档

// https://www.u.tools/docs/developer/api.html#%E7%AA%97%E5%8F%A3%E4%BA%A4%E4%BA%92
const axios = require('axios');
const child_process = require('child_process');
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

async function downloadByGithub(githubUrl, options = {}) {
    return await Promise.race([
        axios.get("https://ghps.cc/" + githubUrl, options),
        axios.get("https://hub.gitmirror.com/" + githubUrl, options)
    ]);
}

async function downloadAndSaveFiles(prefixPath, files = [], savePath) {
    let promises = [];
    for (const fileName of files) {
        promises.push(downloadByGithub(prefixPath + "/" + fileName, {
            responseType: "arraybuffer"
        }).then((response) => {
            let data = response.data;
            let buffer = Buffer.from(data);
            console.log("downloaded", savePath + slash + fileName, buffer.length);
            // 保存到本地
            fs.writeFileSync(savePath + slash + fileName, buffer);
        }))
    }
    return Promise.all(promises);
}

const baseGithubPath = "https://github.com/utools-blowsnow/image-enlarge"
window.mutils = {
    // 获取模型路径
    modelPath: () => {
        // os 获取appdata路径
        let appDataPath = os.homedir()
        return appDataPath + "\\image-handle\\models";
    },
    binPath: () => {
        let binPath = os.homedir() + "\\image-handle\\bin";
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

            await downloadAndSaveFiles(baseGithubPath + "/raw/master/other/models", [
                "RealESRGAN_General_x4_v3.bin",
                "RealESRGAN_General_x4_v3.param",
                "realesrgan-x4plus.bin",
                "realesrgan-x4plus.param",
            ], modelPath);

            // 重新读取模型列表
            modelList = fs.readdirSync(modelPath);
        }

        let modelList2 = {};
        for (const model of modelList) {
            // 获取name
            let name = model.replace(".bin", "").replace(".param", "");
            if (modelList2[name]) {
                modelList2[name] = modelList2[name] + 1;
            } else {
                modelList2[name] = 1;
            }
        }

        let names = [];
        for (const name of Object.keys(modelList2)) {
            if (modelList2[name] === 2) {
                names.push(name);
            }
        }
        console.log("modelList", modelPath, names);

        return names;
    },

    // 初始化bin数据
    initBinData: async (callback) => {
        let binPath = window.mutils.binPath();
        if (!fs.existsSync(binPath)) {
            fs.mkdirSync(binPath);
        }
        let binList = fs.readdirSync(binPath);
        if (!binList.includes("upscayl-bin.zip")) {

            await downloadAndSaveFiles(baseGithubPath + `/raw/master/other/${getPlatform()}/bin`, [
                "upscayl-bin.zip"
            ], binPath);

            compressing.zip.uncompress(binPath + slash + "upscayl-bin.zip", binPath).then(() => {
                console.log("uncompress done");
            })

            binList = fs.readdirSync(binPath);
        } else {
            let flag = false;
            for (const name of binList) {
                if (name.indexOf("upscayl") !== -1) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                compressing.zip.uncompress(binPath + slash + "upscayl-bin.zip", binPath).then(() => {
                    console.log("uncompress done");
                })

                binList = fs.readdirSync(binPath);
            }
        }

        console.log("binList", binPath, binList);

        return Promise.resolve();
    },

    // 开始执行
    spawnImageHandle: (args, options: object = {}) => {
        let binPath = window.mutils.binPath();
        let exeName = getPlatform() == "win" ? "upscayl-bin.exe" : "upscayl-bin";
        return new Promise((resolve, reject) => {
            let p;
            try {
                console.log(binPath + slash + exeName, args);
                p = child_process.spawn(binPath + slash + exeName, args, {
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
                if (data.includes("invalid")) {
                    p.kill();
                    reject(new Error(data.toString()));
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

    // 临时输出路径
    tempOutputPath: () => {
        let tempPath = os.tmpdir();
        let path = tempPath + "\\image-handle\\output";
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, {
                recursive: true
            });
        }
        return path;
    },


    // 获取文件名
    getFileName: (path) => {
        let index = path.lastIndexOf(slash);
        if (index !== -1) {
            return path.substring(index + 1);
        }
        return path;
    },

    // 获取文件路径
    getFilePath: (path, fileName) => {
        return path + slash + fileName;
    },

    // 获取文件base64
    getFileBase64: (path) => {
        let buffer = fs.readFileSync(path);
        return buffer.toString("base64");
    },

    // 获取文件夹下的所有文件
    getDirFiles: (dirPath) => {
        return fs.readdirSync(dirPath);
    },

    // 保存图片
    saveImages: async (files, dirPath) => {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
        let promises = [];
        for (const file of files) {
            promises.push(new Promise((resolve, reject) => {
                fs.cpSync(file.outFilePath, dirPath + slash + file.fileName);
                fs.rmSync(file.outFilePath);
                resolve();
            }))
        }
        await Promise.all(promises);

        return Promise.resolve();
    }
}

console.log("preload.ts loaded", window.mutils.modelPath());
