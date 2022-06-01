import type { InteractionReplyOptions, Interaction } from 'discord.js';
import { container } from '../../container';
import type { Command } from '../../structures/Command';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';
import { ReplyError } from '../../errors/ReplyError';

export default class OnInteractionCreate extends Event {
    public constructor() {
        super({
            name: Events.InteractionCreate,
            emitter: container.client,
            once: false,
        });
    }

    public override async handle(interaction: Interaction): Promise<void> {
        if (interaction.isCommand()) {
            // If the interaction is a command, handle it as so
            if (interaction.isChatInputCommand()) {
                return this.handleChatInput(interaction);
            } else if (interaction.isUserContextMenuCommand()) {
                return this.handleUserContextMenu(interaction);
            } else if (interaction.isMessageContextMenuCommand()) {
                return this.handleMessageContextMenu(interaction);
            }
        } else if (interaction.isMessageComponent()) {
            // If the interaction is a message component, handle it as so
            const { client } = this.container;
            const [name] = this.parseCustomId(interaction.customId);
            const action = client.components.cache.get(name);

            if (action === undefined)
                return void setTimeout(async () => {
                    if (interaction.deferred || interaction.replied) return;
                    await interaction.reply({
                        content: `Action ${name} has not been implemented yet.`,
                        ephemeral: true,
                    });
                    client.emit(Events.UnknownInteraction, interaction);
                }, 2500);

            if (interaction.isButton()) {
                return void action.onButton(interaction);
            } else if (interaction.isSelectMenu()) {
                return void action.onSelectMenu(interaction);
            } else if (interaction.isModalSubmit()) {
                return void action.onModalSubmit(interaction);
            }
        }
    }

    /**
     * Parse the customId of the interaction into its name and id.
     * @param customId The custom ID of the component
     */
    private parseCustomId(customId: string): [string, string] {
        const splits = customId.split(',');
        return [splits.shift() as string, splits.join(',')];
    }

    /**
     * Handle a command interaction.
     * @param interaction The interaction to handle
     * @param preconditionsRun The name of the preconditions run method
     * @param commandRun The name of the command run method
     */
    private async handleCommand(
        interaction: Command.ChatInput | Command.UserContextMenu | Command.MessageContextMenu,
        preconditionsRun: 'chatInputRun' | 'contextMenuRun',
        commandRun: 'onChatInput' | 'onUserContextMenu' | 'onMessageContextMenu',
    ): Promise<void> {
        try {
            const { client } = this.container;
            const name = interaction.commandName;
            const command = client.commands.cache.get(name);

            if (command === undefined) {
                await interaction.reply({
                    content: `Command ${name} has not been implemented yet.`,
                    ephemeral: true,
                });
                return void client.emit(Events.UnknownInteraction, interaction);
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
