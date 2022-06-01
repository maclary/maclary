import { join } from 'node:path';
import { readdirSync, lstatSync, existsSync } from 'node:fs';
import { Component } from '../structures/Component';
import { MapManager } from './MapManager';
import { getModuleInformation, loadModule } from '../internal/ModuleLoader';
import { Events } from '../types/Events';

export class ComponentManager extends MapManager<string, Component> {
    /**
     * The directories this manager will load components from.
     */
    public directories = new Set<string>();

    public constructor() {
        super();

        const baseComponents = join(this.container.client.baseDirectory, 'components');
        if (existsSync(baseComponents)) this.directories.add(baseComponents);
    }

    /**
     * Load all components from the directories and store them in the cache.
     */
    public async load(): Promise<ComponentManager> {
        for (const directory of this.directories) {
            await this.loadFolder(directory);
        }
        return this;
    }

    /**
     * Loads all files as components in the given directory.
     * @param folderPath The path to the folder to load components from
     * @returns
     */
    private async loadFolder(folderPath: string): Promise<void> {
        const folderExists = existsSync(folderPath);
        if (!folderExists) return void 0;
        const folderContents = readdirSync(folderPath);

        for (const item of folderContents) {
            const itemPath = join(folderPath, item);
            const isFile = lstatSync(itemPath).isFile();

            if (isFile) await this.loadFile(itemPath);
            else await this.loadFolder(itemPath);
        }
    }

    /**
     * Load the component(s) from a file.
     * @param filePath The path to the file to load
     */
    private async loadFile(filePath: string): Promise<void> {
        const data = getModuleInformation(filePath);
        if (!data) return void 0;
        const components = await this.loadComponentsFromFile(filePath);
        components.forEach((c) => this.cache.set(c.id, c));
    }

    /**
     * Load a file and retrieve all the components it contains.
     * @param filePath The path to the file to load components from
     */
    private async loadComponentsFromFile(filePath: string): Promise<Component[]> {
        const data = getModuleInformation(filePath);
        if (!data) {
            this.container.client.emit(
                Events.MaclaryDebug,
                `Failed to load components from ${filePath}`,
            );
            return [];
        }

        const isComponentClass = (c: any) => c.prototype instanceof Component;

        const components: any[] = [];

        // Load all possible components from the file
        const contents = await loadModule(data, false);
        if (isComponentClass(contents)) components.push(contents);
        const values = Object.values(contents);
        values.forEach((v) => isComponentClass(v) && components.push(v));

        return components.filter((c) => isComponentClass(c)).map((cc) => new cc());
    }
}
