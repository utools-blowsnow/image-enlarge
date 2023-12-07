export const getSingleImageArguments = (
    inputFile,
    outFile,
    modelsPath,
    model,
    scale = "4",
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
        threads ? "-j" : "",
        threads ? threads : "",
    ];
};

export const getBatchArguments = (
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
