import {
    InteractionReplyOptions,
    Interaction,
    CommandInteraction,
    InteractionType,
    MessageComponentInteraction,
} from 'discord.js';
import { container } from '../../container';
import type { Command } from '../../structures/Command';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';
import { ReplyError } from '../../errors/ReplyError';
import { Error } from '../../errors';

export default class OnInteractionCreate extends Event {
    public constructor() {
        super({
            name: Events.InteractionCreate,
            emitter: container.client,
            once: false,
        });
    }

    public override async handle(interaction: Interaction): Promise<void> {
        if (interaction.type === InteractionType.ApplicationCommand) {
            if (interaction.isChatInputCommand()) {
                return this.handleChatInput(interaction);
            } else if (interaction.isUserContextMenuCommand()) {
                return this.handleUserContextMenu(interaction);
            } else if (interaction.isMessageContextMenuCommand()) {
                return this.handleMessageContextMenu(interaction);
            }
        } else if (interaction.type === InteractionType.MessageComponent) {
            const { client } = this.container;
            const name = (interaction as MessageComponentInteraction).customId.split(',')[0];
            const action = client.components.cache.get(name);

            if (action !== undefined) {
                if (interaction.isButton()) {
                    return void action.onButton(interaction);
                } else if (interaction.isSelectMenu()) {
                    return void action.onSelectMenu(interaction);
                } else if (interaction.isModalSubmit()) {
                    return void action.onModalSubmit(interaction);
                }
            }
        }
    }

    /**
     * Handle a command interaction.
     * @param interaction The interaction to handle
     * @param preconditionsRun The name of the preconditions run method
     * @param commandRun The name of the command run method
     */
    private async handleCommand(
        interaction: CommandInteraction,
        preconditionsRun: 'chatInputRun' | 'contextMenuRun',
        commandRun: 'onChatInput' | 'onUserContextMenu' | 'onMessageContextMenu',
    ): Promise<void> {
        const { client } = this.container;
        const name = interaction.commandName;
        const command = client.commands.cache.get(name);

        try {
            if (command === undefined) {
                await interaction.reply({
                    content: `Command ${name} has not been implemented yet.`,
                    ephemeral: true,
                });
                throw new Error('COMMAND_NOT_IMPLEMENTED', name);
            }

            const result = await command.preconditions[preconditionsRun](
                interaction as any,
                command,
            );
            if (result.error === undefined) await command[commandRun](interaction as any);
        } catch (error) {
            const action = interaction.deferred || interaction.replied ? 'editReply' : 'reply';

            if (error instanceof ReplyError)
                return void interaction[action](error.options as InteractionReplyOptions | string);

            await interaction[action]({
                content: 'An unknown error has occurred.',
                ephemeral: true,
            });
            throw error;
        }
    }

    private async handleChatInput(interaction: Command.ChatInput): Promise<void> {
        return this.handleCommand(interaction, 'chatInputRun', 'onChatInput');
    }

    private async handleUserContextMenu(interaction: Command.UserContextMenu): Promise<void> {
        return this.handleCommand(interaction, 'contextMenuRun', 'onUserContextMenu');
    }

    private async handleMessageContextMenu(interaction: Command.MessageContextMenu): Promise<void> {
        return this.handleCommand(interaction, 'contextMenuRun', 'onMessageContextMenu');
    }
}
