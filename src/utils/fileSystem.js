import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir } from "@tauri-apps/api/path";

export const AppDataDir = await appDataDir();

await createDir(`${AppDataDir}/data`, { recursive: true }).catch(console.error);

export function writeFile(path, data) {
    return writeTextFile(`data/${path}`, data, { dir: BaseDirectory.AppData });
}

export function readFile(path) {
    return readTextFile(`data/${path}`, { dir: BaseDirectory.AppData });
}