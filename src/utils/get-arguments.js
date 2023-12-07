// const os = require("os");
// const getPlatform = () => {
//     switch (os.platform()) {
//         case "aix":
//         case "freebsd":
//         case "linux":
//         case "openbsd":
//         case "android":
//             return "linux";
//         case "darwin":
//         case "sunos":
//             return "mac";
//         case "win32":
//             return "win";
//     }
// };
/**
 * https://github.com/xinntao/Real-ESRGAN-ncnn-vulkan
 *   -h                   show this help"
 *   -i input-path        input image path (jpg/png/webp) or directory"
 *   -o output-path       output image path (jpg/png/webp) or directory"
 *   -s scale             upscale ratio (can be 2, 3, 4. default=4)"
 *   -t tile-size         tile size (>=32/0=auto, default=0) can be 0,0,0 for multi-gpu"
 *   -m model-path        folder path to the pre-trained models. default=models"
 *   -n model-name        model name (default=realesr-animevideov3, can be realesr-animevideov3 | realesrgan-x4plus | realesrgan-x4plus-anime | realesrnet-x4plus)"
 *   -g gpu-id            gpu device to use (default=auto) can be 0,1,2 for multi-gpu"
 *   -j load:proc:save    thread count for load/proc/save (default=1:2:2) can be 1:2,2,2:2 for multi-gpu"
 *   -x                   enable tta mode"
 *   -f format            output image format (jpg/png/webp, default=ext/png)"
 *   -v                   verbose output"
 */
module.exports.getSingleImageArguments = (
    inputFile,
    outFile,
    modelsPath,
    model,
    scale = 4,
    gpuId = "",
    saveImageAs = 'png',
    threads = "1:2:2"
) => {
    return [
        "-i",
        inputFile,
        "-o",
        outFile,
        "-s",
        scale,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? "-g" : "",
        gpuId ? gpuId : "",
        "-f",
        saveImageAs,
        "-j",
        threads,
    ];
};

module.exports.getBatchArguments = (
    inputDir,
    outputDir,
    modelsPath,
    model,
    scale = 4,
    gpuId = "",
    saveImageAs = 'png',
    threads = "1:2:2"
) => {
    return [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        scale,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? "-g" : "",
        gpuId ? gpuId : "",
        "-f",
        saveImageAs,
        "-j",
        threads,
    ];
};


//https://github.com/upscayl/custom-models/tree/main
