import type { CacheType, Interaction } from 'discord.js';
import type { Action } from '#/structures/Action';
import type { Command } from '#/structures/Command';
import { Listener } from '#/structures/Listener';
import { Events } from '#/utilities/Events';

export class OnInteractionCreate extends Listener<typeof Events.InteractionCreate> {
    public constructor() {
        super({ event: Events.InteractionCreate });
    }

    public override async run(interaction: Interaction<CacheType>) {
        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            return this._handleAction(interaction);
        }

        if (interaction.isCommand()) {
            return this._handleCommand(interaction);
        }

        if (interaction.isAutocomplete()) {
            const name = interaction.commandName;
            const command = this.container.maclary.commands.resolve(name);
            if (!command) throw new Error(`Command "${name}" not found.`);
            await command._handleAutocomplete(interaction);
        }
    }

    private async _handleAction(interaction: Action.AnyInteraction) {
        // IDEA: Add option to change the action custom ID separator

        const [id] = interaction.customId.split(',');
        // Any action with an ID that starts with _ will be ignored
        if (id.startsWith('_')) return;
        const action = this.container.maclary.actions.resolve(id);
        if (!action) throw new Error(`Action "${id}" not found.`);

        try {
            if (interaction.isButton()) await action._handleButton(interaction);
            // NOTE: For discord.js@<=14.7.0
            if (interaction.isSelectMenu()) await action._handleSelectMenu(interaction);
            // NOTE: For discord.js@>=14.7.0
            // if (interaction.isAnySelectMenu()) await action._handleSelectMenu(interaction);
            if (interaction.isModalSubmit()) await action._handleModalSubmit(interaction);
        } catch (error) {
            const payload = { from: interaction, action };
            let typedError = error as Error;
            if (!(error instanceof Error)) typedError = new Error(String(error));
            this.container.client.emit(Events.ActionError, payload, typedError);
        }
    }

    private async _handleCommand(interaction: Command.AnyInteraction) {
        const name = interaction.commandName;
        const command = this.container.maclary.commands.resolve(name);
        if (!command) throw new Error(`Command "${name}" not found.`);

        try {
            if (interaction.isChatInputCommand()) await command._handleSlash(interaction);
            if (interaction.isUserContextMenuCommand()) await command._handleUserMenu(interaction);
            if (interaction.isMessageContextMenuCommand())
                await command._handleMessageMenu(interaction);
        } catch (error) {
            const payload = { from: interaction, command };
            let typedError = error as Error;
            if (!(error instanceof Error)) typedError = new Error(String(error));
            this.container.client.emit(Events.CommandError, payload, typedError);
        }
    }
}
