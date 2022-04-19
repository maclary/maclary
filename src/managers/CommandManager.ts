import { MapManager } from './MapManager';
import { Command } from '../structures/Command';
import { Error } from '../errors';
import { Events } from '../types/Events';
import { getModuleInformation, loadModule } from '../internal/ModuleLoader';
import { compareCommands } from '../internal/CompareCommands';

import { join } from 'path';
import { readdirSync, lstatSync, existsSync } from 'fs';
import type { ClientApplication, Guild } from 'discord.js';

/**
 * The command manager. You should never have to create an instance of this class.
 */
export class CommandManager extends MapManager<string, Command> {
    /**
     * The application this manager will use to set interaction commands.
     */
    public application: ClientApplication | Guild | null = null;

    /**
     * The directories this manager will load commands from.
     */
    public directories = new Set<string>();

    public constructor() {
        super();

        const builtInCommands = join(__dirname, '..', 'builtin', 'commands');
        this.directories.add(builtInCommands);
        const commandDirectory = join(this.container.client.baseDirectory, 'commands');
        this.directories.add(commandDirectory);
    }

    /**
     * Load the commands from the directories and store them in cache.
     */
    public async load(): Promise<CommandManager> {
        this.container.logger.info('Loading commands...');
        for (const folderPath of this.directories) await this.loadFolderAsCategory(folderPath, '');
        this.container.logger.info(`Loaded ${this.cache.size} commands`);
        return this;
    }

    /**
     * Patch all interaction commands to this managers application.
     */
    public async patch(): Promise<CommandManager> {
        const { client } = this.container;
        this.container.logger.info('Patching commands...');

        // Get application if it hasnt been manually set
        if (this.application === null) this.application = client.application;
        if (!this.application?.commands) throw new Error('FAILED_APPLICATION');

        // Fetch existing commands
        await this.application.commands.fetch({});
        const externalCommands = this.application.commands.cache;

        // Filter local commands by kind
        const localCommands = Array.from(this.cache.values())
            .filter((c) => c.kinds.includes(Command.Kind.Interaction))
            .map((c) => c);

        // Compare the groups of commands and determine if should patch
        let shouldPatch = externalCommands.size !== localCommands.length;
        for (const local of localCommands) {
            const external = externalCommands.find((e) => e.name === local.name);
            if (!external) shouldPatch = true;
            if (shouldPatch) break;
            const differences = compareCommands(external, local);
            if (differences.length > 0) shouldPatch = true;
        }

        // Update if needed
        if (shouldPatch) {
            const commands = Array.from(localCommands);
            // @ts-ignore Bypass Discord.js typings
            await this.application.commands.set(commands);
            this.container.logger.info(`Patched ${commands.length} commands`);
        } else {
            this.container.logger.info('Commands already up to date');
        }

        return this;
    }

    private async loadFolderAsCategory(folderPath: string, categoryName: string): Promise<void> {
        const folderExists = existsSync(folderPath);
        if (!folderExists) return void 0;

        const folderContents = readdirSync(folderPath).map((f) => getModuleInformation(f, true));
        if (categoryName.startsWith('@')) categoryName = categoryName.slice(1);

        for (const item of folderContents) {
            if (!item) continue;
            const itemName = item.name;
            const itemPath = join(folderPath, itemName + item.extension);
            const isFile = lstatSync(itemPath).isFile();

            if (isFile) {
                // If item is file, load as a normal command
                await this.loadFile(itemPath, categoryName);
            } else if (itemName.startsWith('@')) {
                // If item is a folder and starts with @, load as a category
                await this.loadFolderAsCategory(itemPath, itemName);
            } else if (itemName.startsWith('!')) {
                // If item is a folder and starts with !, load as a subcommand group
                class SubcommandGroup extends Command {
                    public constructor() {
                        super({
                            name: itemName.slice(1),
                            category: categoryName,
                        });
                    }
                }

                const command = new SubcommandGroup();
                command.internalType = Command.InternalType.Group;
                command.options = await this.loadFolderAsSubcommandGroup(itemPath, categoryName);
                this.cache.set(command.name, command);
            } else {
                // If item is a normal folder, load it normally
                await this.loadFolderAsCategory(itemPath, '');
            }
        }
    }

    private async loadFolderAsSubcommandGroup(
        folderPath: string,
        categoryName: string,
    ): Promise<Command[]> {
        const options = await Promise.all(
            readdirSync(folderPath).map(async (fileName) => {
                const item = getModuleInformation(join(folderPath, fileName), true);
                if (!item) return null;

                const itemName = item.name;
                const itemPath = join(folderPath, itemName + item.extension);
                const isFile = lstatSync(itemPath).isFile();

                // If item is a file, end the chain and load the command
                if (isFile) {
                    const CommandClass = await loadModule(item);

                    if (CommandClass.prototype instanceof Command) {
                        const command = new CommandClass();
                        command.type = Command.OptionType.Subcommand;
                        command.category = categoryName;
                        return command;
                    }
                    const msg = `Tried to load ${itemPath} as an subcommand, but it was not an instance of 'Command'.`;
                    this.container.client.emit(Events.MaclaryDebug, msg);
                    return void 0;
                }

                // If item is a folder, load it as another subcommand group
                class SubcommandGroup extends Command {
                    public constructor() {
                        super({
                            name: itemName,
                            category: categoryName,
                        });
                    }
                }

                const command = new SubcommandGroup();
                command.options = await this.loadFolderAsSubcommandGroup(itemPath, categoryName);
                command.type = Command.OptionType.SubcommandGroup;
                command.internalType = Command.InternalType.Group;
                return command;
            }),
        );

        return options.filter(Boolean);
    }

    private async loadFile(itemPath: string, categoryName: string): Promise<void> {
        const data = getModuleInformation(itemPath);
        if (!data) return;
        const CommandClass = await loadModule(data);

        const command = new CommandClass();
        command.category = categoryName;
        this.cache.set(command.name, command);
    }
}
