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
 * The {@link Command} manager. You should never have to create an instance of this class.
 * @extends {MapManager}
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

        // Add the default directories
        const builtInCommands = join(__dirname, '..', 'builtin', 'commands');
        this.directories.add(builtInCommands);
        const commandDirectory = join(this.container.client.baseDirectory, 'commands');
        this.directories.add(commandDirectory);
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

        // Filter local commands by interaction kind
        const localCommands: Command[] = this.filterByKind(Command.Kind.Interaction, [
            ...Array.from(this.cache.values()),
        ]);

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
            const commands = Array.from(
                localCommands.map((c) =>
                    Object.assign({
                        ...c,
                        description: c.type === Command.Type.ChatInput ? c.description : '',
                    }),
                ),
            );

            // @ts-ignore Bypass Discord.js typings
            await this.application.commands.set(commands);
            this.container.logger.info(`Patched ${commands.length} commands`);
        } else {
            this.container.logger.info('Commands already up to date');
        }

        return this;
    }

    /**
     * Load the commands from the directories and store them in cache.
     */
    public async load(): Promise<CommandManager> {
        this.container.logger.info('Loading commands...');
        for (const directory of this.directories) {
            await this.loadFolderAsCategory(directory);
        }
        this.container.logger.info(`Loaded ${this.cache.size} commands`);
        return this;
    }

    /**
     * Loads a folder as a category.
     * @param folderPath The path to the folder to load commands from.
     * @param categoryName Set each command to this category.
     */
    private async loadFolderAsCategory(folderPath: string, categoryName?: string): Promise<void> {
        const folderExists = existsSync(folderPath);
        const message = `Cannot load commands from ${folderPath} because it does not exist.`;
        if (!folderExists) return void this.container.client.emit(Events.MaclaryDebug, message);

        const contents = readdirSync(folderPath);
        const contentInfo = contents.map((f) => getModuleInformation(f, true));

        for (const item of contentInfo) {
            if (!item) continue;

            const itemName = item.name;
            const itemPath = join(folderPath, itemName + item.extension);
            const isFile = lstatSync(itemPath).isFile();

            if (isFile) {
                // If item is a file, load it as a command
                await this.loadFileAsCommand(itemPath, categoryName);
            } else if (itemName.startsWith('@')) {
                // If item is a folder that starts with @, load it as a category
                await this.loadFolderAsCategory(itemPath, itemName.slice(1));
            } else if (itemName.startsWith('!')) {
                // If item is a folder that starts with !, load it as a command
                await this.loadFolderAsCommandGroup(
                    itemName.slice(1),
                    itemPath,
                    categoryName,
                    true,
                );
            } else {
                // Load folder as normal
                await this.loadFolderAsCategory(itemPath, '');
            }
        }
    }

    /**
     * Load the command(s) from a file.
     * @param filePath The path to the file to load.
     * @param categoryName Set the category of the command to this.
     */
    private async loadFileAsCommand(filePath: string, categoryName?: string): Promise<void> {
        const commands = await this.loadCommandsFromFile(filePath);
        if (commands.length === 0) return;

        for (const command of commands) {
            if (this.cache.has(command.name)) {
                const message = `Command with name ${command.name} already exists, skipping.`;
                this.container.client.emit(Events.MaclaryDebug, message);
                continue;
            }

            command.category ||= categoryName;
            this.cache.set(command.name, command);
        }
    }

    /**
     * Load a folder as a subcommand group, and its contents as subcommands.
     * @param itemName The name of the subcommand group.
     * @param folderPath The path to the folder to load commands from.
     * @param categoryName Set the category of the command to this.
     * @param cache Whether to set the command to the cache.
     */
    private async loadFolderAsCommandGroup(
        itemName: string,
        folderPath: string,
        categoryName: string | undefined,
        cache = false,
    ): Promise<Command> {
        class SubcommandGroup extends Command {
            public constructor() {
                super({
                    type: Command.Type.ChatInput,
                    kinds: [Command.Kind.Interaction, Command.Kind.Prefix],
                    name: itemName,
                    category: categoryName,
                    description: 'This is a subcommand group.',
                });
            }
        }

        const command = new SubcommandGroup();
        command.internalType = Command.InternalType.Group;
        command.category ||= categoryName;
        command.options = await this.loadFolderAsCommandOptions(folderPath, categoryName);
        if (cache) this.cache.set(command.name, command);
        return command;
    }

    /**
     * Load a folder as an array of commands.
     * @param folderPath The path to the folder to load commands from.
     * @param categoryName Set the category of the command(s) to this.
     */
    private async loadFolderAsCommandOptions(
        folderPath: string,
        categoryName?: string,
    ): Promise<Command[]> {
        const options = [];

        const contents = readdirSync(folderPath);
        for (const fileName of contents) {
            const filePath = join(folderPath, fileName);
            const data = getModuleInformation(filePath);
            if (!data) continue;

            const itemName = data.name;
            const isFile = lstatSync(filePath).isFile();

            let promise = null;
            if (isFile) promise = this.loadCommandsFromFile(filePath);
            else promise = this.loadFolderAsCommandGroup(itemName, filePath, categoryName);
            options.push(...[await promise].flat());
            options.forEach((o) => (o.category ||= categoryName));
        }

        return options;
    }

    /**
     * Load a file and retrieve the commands from it.
     * @param filePath The path to the file to load commands from.
     */
    private async loadCommandsFromFile(filePath: string): Promise<Command[]> {
        const data = getModuleInformation(filePath);
        if (!data) {
            this.container.client.emit(
                Events.MaclaryDebug,
                `Failed to load commands from ${filePath}`,
            );
            return [];
        }

        const isCommandClass = (c: any) => c.prototype instanceof Command;

        const commands: any[] = [];

        // Load all possible commands from file
        const contents = await loadModule(data, false);
        if (isCommandClass(contents)) commands.push(contents);
        const values = Object.values(contents);
        values.forEach((v) => isCommandClass(v) && commands.push(v));

        return commands.filter((c) => isCommandClass(c)).map((cc) => new cc());
    }

    /**
     * Filter a collection of commands by a command kind.
     * @param kind The command kind to filter by.
     * @param options The list of commands/options.
     */
    private filterByKind(kind: Command.Kind, options: any): any[] {
        return (options ?? []).filter((option: any) => {
            if (option.internalType === Command.InternalType.Group) {
                const opts = this.filterByKind(kind, option.options);
                return opts.length > 0;
            } else if (option.internalType === Command.InternalType.Command) {
                return option.kinds.includes(kind);
            }
            return true;
        });
    }
}
