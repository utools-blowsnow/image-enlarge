const {getSingleImageArguments, getBatchArguments} = require('./src/utils/get-arguments');

const spawnImageHandle = require('./src/utils/spawn-image-handle');

// spawnImageHandle(getSingleImageArguments(
//     "E:\\other\\test\\utools_image\\test\\in\\input.jpg",
//     "E:\\other\\test\\utools_image\\test\\out\\input.jpg",
//     "E:\\other\\test\\utools_image\\statics\\models",
//     "RealESRGAN_General_x4_v3",
//     "4",
//     "",
//     "jpg",
//     "1:2:2"
// ), {
//     onProgress: (data) => {
//         console.log("onProgress",data.toString());
//     }
// }).then(() => {
//     console.log("done");
// })
spawnImageHandle(getBatchArguments(
    "E:\\other\\test\\utools_image\\test\\in",
    "E:\\other\\test\\utools_image\\test\\out",
    "E:\\other\\test\\utools_image\\statics\\models",
    "RealESRGAN_General_x4_v3",
    "4",
    "",
    "jpg",
    "1:2:2"
), {
    onProgress: (data) => {
        console.log("onProgress", data.toString());
    }
}).then(() => {
    console.log("done");
})
