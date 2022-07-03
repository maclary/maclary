import {
    InteractionReplyOptions,
    Interaction,
    CommandInteraction,
    InteractionType,
} from 'discord.js';
import { container } from '../../container';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';
import { ReplyError } from '../../errors/ReplyError';
import { Error } from '../../errors';
import type { Command } from '../../structures/Command';

export default class OnInteractionCreate extends Event {
    public constructor() {
        super({
            name: Events.InteractionCreate,
            emitter: container.client,
            once: false,
        });
    }

    public override async handle(interaction: Interaction): Promise<void> {
        if (
            InteractionType.ApplicationCommand === interaction.type ||
            InteractionType.ApplicationCommandAutocomplete === interaction.type
        ) {
            if (interaction.isChatInputCommand()) {
                return this.handleChatInput(interaction);
            } else if (interaction.isUserContextMenuCommand()) {
                return this.handleUserContextMenu(interaction);
            } else if (interaction.isMessageContextMenuCommand()) {
                return this.handleMessageContextMenu(interaction);
            } else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
                return this.handleAutocomplete(interaction as any);
            }
        }

        if (
            InteractionType.MessageComponent === interaction.type ||
            InteractionType.ModalSubmit === interaction.type
        ) {
            const { client } = this.container;
            const name = (interaction as any).customId.split(',')[0];
            const component = client.components.cache.get(name);

            if (component !== undefined) {
                if (interaction.isButton()) {
                    return void component.onButton(interaction);
                } else if (interaction.isSelectMenu()) {
                    return void component.onSelectMenu(interaction);
                } else if (interaction.type === InteractionType.ModalSubmit) {
                    return void component.onModalSubmit(interaction as any);
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
        interaction: CommandInteraction | Command.Autocomplete,
        commandRun: 'onChatInput' | 'onUserContextMenu' | 'onMessageContextMenu' | 'onAutocomplete',
        preconditionsRun?: 'chatInputRun' | 'contextMenuRun',
    ): Promise<void> {
        const { client } = this.container;
        const name = interaction.commandName;
        const command = client.commands.cache.get(name);

        if (command === undefined) {
            if (interaction instanceof CommandInteraction)
                await interaction.reply({
                    content: `Command ${name} has not been implemented yet.`,
                    ephemeral: true,
                });
            throw new Error('COMMAND_NOT_IMPLEMENTED', name);
        }

        try {
            if (interaction instanceof CommandInteraction) {
                if (!preconditionsRun) return;
                const result = await command.preconditions[preconditionsRun](
                    interaction as any,
                    command,
                );
                if (result.error === undefined) await command[commandRun](interaction as any);
            } else {
                await command.onAutocomplete(interaction);
            }
        } catch (error) {
            if (interaction instanceof CommandInteraction) {
                const action = interaction.deferred || interaction.replied ? 'editReply' : 'reply';

                if (error instanceof ReplyError) {
                    const content =
                        typeof error.options === 'object'
                            ? error.options
                            : { content: error.options };
                    const options = { content: '', embeds: [], components: [], ...content };
                    return void interaction[action](options as InteractionReplyOptions);
                }

                await interaction[action]({
                    content: 'An unknown error has occurred.',
                    embeds: [],
                    components: [],
                    ephemeral: true,
                });
                throw error;
            }
        }
    }

    private async handleChatInput(interaction: Command.ChatInput): Promise<void> {
        return this.handleCommand(interaction, 'onChatInput', 'chatInputRun');
    }

    private async handleUserContextMenu(interaction: Command.UserContextMenu): Promise<void> {
        return this.handleCommand(interaction, 'onUserContextMenu', 'contextMenuRun');
    }

    private async handleMessageContextMenu(interaction: Command.MessageContextMenu): Promise<void> {
        return this.handleCommand(interaction, 'onMessageContextMenu', 'contextMenuRun');
    }

    private async handleAutocomplete(interaction: Command.Autocomplete): Promise<void> {
        return this.handleCommand(interaction, 'onAutocomplete');
    }
}
