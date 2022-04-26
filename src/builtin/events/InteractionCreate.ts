import { container } from '../../container';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';
import { CustomId } from '../../utils/CustomId';
import { ReplyError } from '../../errors/ReplyError';
import type { Command } from '../../structures/Command';

import type { Interaction, InteractionReplyOptions } from 'discord.js';

export default class OnInteractionCreate extends Event {
    public constructor() {
        super({
            name: Events.InteractionCreate,
            emitter: container.client,
            once: false,
        });
    }

    public override async handle(interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            return this.handleChatInput(interaction);
        } else if (interaction.isUserContextMenuCommand()) {
            return this.handleUserContextMenu(interaction);
        } else if (interaction.isMessageContextMenuCommand()) {
            return this.handleMessageContextMenu(interaction);
        } else if (interaction.isButton()) {
            return this.handleButton(interaction);
        } else if (interaction.isSelectMenu()) {
            return this.handleSelectMenu(interaction);
        } else if (interaction.isModalSubmit()) {
            return this.handleModalSubmit(interaction);
        }
    }

    private async handleChatInput(interaction: Command.ChatInput): Promise<void> {
        try {
            const { client } = container;
            const command = client.commands.cache.get(interaction.commandName);
            if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
            else {
                const result = await command.preconditions.chatInputRun(interaction, command);
                if (result.error === undefined) await command.onChatInput(interaction);
                else await interaction.reply(result.error.options as InteractionReplyOptions);
            }
        } catch (error) {
            const action = interaction.deferred ? 'editReply' : 'reply';
            if (error instanceof ReplyError) {
                void interaction[action](error.options as InteractionReplyOptions | string);
            } else {
                void interaction[action](`An unknown error occurred while running this command.`);
            }
        }
    }

    private async handleUserContextMenu(interaction: Command.UserContextMenu): Promise<void> {
        const { client } = container;
        const command = client.commands.cache.get(interaction.commandName);
        if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
        else {
            const result = await command.preconditions.contextMenuRun(interaction, command);
            if (result.error === undefined) await command.onUserContextMenu(interaction);
            else await interaction.reply(result.error.options as InteractionReplyOptions);
        }
    }

    private async handleMessageContextMenu(interaction: Command.MessageContextMenu): Promise<void> {
        const { client } = container;
        const command = client.commands.cache.get(interaction.commandName);
        if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
        else {
            const result = await command.preconditions.contextMenuRun(interaction, command);
            if (result.error === undefined) await command.onMessageContextMenu(interaction);
            else await interaction.reply(result.error.options as InteractionReplyOptions);
        }
    }

    private async handleButton(interaction: Command.Button): Promise<void> {
        const { client } = container;
        const customId = CustomId.parse(interaction.customId);
        const command = client.commands.cache.get(customId[0][0]);
        if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
        else await command.onButton(interaction);
    }

    private async handleSelectMenu(interaction: Command.SelectMenu): Promise<void> {
        const { client } = container;
        const customId = CustomId.parse(interaction.customId);
        const command = client.commands.cache.get(customId[0][0]);
        if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
        else await command.onSelectMenu(interaction);
    }

    private async handleModalSubmit(interaction: Command.ModalSubmit): Promise<void> {
        const { client } = container;
        const customId = CustomId.parse(interaction.customId);
        const command = client.commands.cache.get(customId[0][0]);
        if (command === undefined) client.emit(Events.UnknownInteraction, interaction);
        else await command.onModalSubmit(interaction);
    }
}
