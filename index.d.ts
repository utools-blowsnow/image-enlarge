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
    getModelList: () => Promise<object>;
}


declare global {
    interface Window {
        versions: ProcessVersions;
        mutils: Mutils;
    }
}
