export interface ProcessVersions {
    node: () => string;
    chrome: () => string;
    electron: () => string;
}


export interface Mutils {
    modelPath: () => string;
    binPath: () => string;

    initModelData: (callback: Function) => Promise<string[]>;
    initBinData: (callback: Function) => Promise<void>;

    spawnImageHandle: (args: string[], options?: object) => Promise<void>;

    tempOutputPath: () => string;

    getFileName: (path: string) => string;

    getFilePath: (path: string, fileName: string) => string;

    getFileBase64: (path: string) => string;

    getDirFiles(dirPath: string): string[];

    saveImages(files: any[], dirPath: string): Promise<void>;
}


declare global {
    interface Window {
        versions: ProcessVersions;
        mutils: Mutils;
    }
}
