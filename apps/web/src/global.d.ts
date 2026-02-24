export interface IElectronAPI {
    startAi: () => Promise<boolean>;
    getEnv: () => Promise<any>;
}

declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}
