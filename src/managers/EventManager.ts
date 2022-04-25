import { SetManager } from './SetManager';
import { getModuleInformation, loadModule } from '../internal/ModuleLoader';
import { Event } from '../structures/Event';
import { Events } from '../types/Events';

import { join } from 'node:path';
import { readdirSync, lstatSync, existsSync } from 'node:fs';
import type { EventEmitter } from 'node:events';

/**
 * The event manager. You should never have to create an instance of this class.
 */
export class EventManager extends SetManager<Event> {
    /**
     * The directories this manager will load events from.
     */
    public directories = new Set<string>();

    public constructor() {
        super();

        // Append the default directories to the list
        const builtInEvents = join(__dirname, '..', 'builtin', 'events');
        this.directories.add(builtInEvents);
        const baseEvents = join(this.container.client.baseDirectory, 'events');
        if (existsSync(baseEvents)) this.directories.add(baseEvents);
    }

    /**
     * Add all the listeners in the cache to their emitters.
     */
    public async patch(): Promise<EventManager> {
        const emitters: EventEmitter[] = [];
        this.cache.forEach((e) => emitters.push(e.emitter));
        emitters.forEach((e) => e.removeAllListeners());

        for (const event of this.cache.values()) {
            const action = event.once ? 'once' : 'on';
            event.emitter[action](event.name, event.handle.bind(event));
        }

        return Promise.resolve(this);
    }

    /**
     * Load all events from the directories and store them in the cache.
     */
    public async load(): Promise<EventManager> {
        for (const directory of this.directories) {
            await this.loadFolder(directory);
        }
        return this;
    }

    /**
     * Loads all files as events in the given directory.
     * @param folderPath The path to the folder to load events from.
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
     * Load the event(s) from a file.
     * @param filePath The path to the file to load.
     */
    private async loadFile(filePath: string): Promise<void> {
        const data = getModuleInformation(filePath);
        if (!data) return void 0;
        const events = await this.loadEventsFromFile(filePath);
        events.forEach((e) => this.cache.add(e));
    }

    /**
     * Load a file and retrieve all the events it contains.
     * @param filePath The path to the file to load events from.
     */
    private async loadEventsFromFile(filePath: string): Promise<Event[]> {
        const data = getModuleInformation(filePath);
        if (!data) {
            this.container.client.emit(
                Events.MaclaryDebug,
                `Failed to load events from ${filePath}`,
            );
            return [];
        }

        const isEventClass = (e: any) => e.prototype instanceof Event;

        const events: any[] = [];

        // Load all possible events from file
        const contents = await loadModule(data, false);
        if (isEventClass(contents)) events.push(contents);
        const values = Object.values(contents);
        values.forEach((v) => isEventClass(v) && events.push(v));

        return events.filter((c) => isEventClass(c)).map((ec) => new ec());
    }
}
