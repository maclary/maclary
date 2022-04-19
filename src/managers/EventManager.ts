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

        const builtInEvents = join(__dirname, '..', 'builtin', 'events');
        this.directories.add(builtInEvents);
        const baseEvents = join(this.container.client.baseDirectory, 'events');
        if (existsSync(baseEvents)) this.directories.add(baseEvents);
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

    private async loadFile(filePath: string): Promise<void> {
        const data = getModuleInformation(filePath);
        if (!data) return void 0;
        const EventClass = await loadModule(data);

        if (EventClass.prototype instanceof Event) {
            this.cache.add(new EventClass());
        } else {
            const msg = `Tried to load ${filePath} as an event, but it was not an instance of 'Event'.`;
            this.container.client.emit(Events.MaclaryDebug, msg);
        }
    }
}
