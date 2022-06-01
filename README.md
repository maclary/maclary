<div align="center">
    <img alt="hairy maclary" src=".github/assets/maclary.png" width="30%"/>
    <h1>Maclary</h1><br/>
    <h3>The prefect Discord bot framework</h3><br/>
    <code>npm install maclary discord.js@dev</code><br/>
    <code>yarn add maclary discord.js@dev</code><br/>
    <code>pnpm add maclary discord.js@dev</code><br/>
</div>

<div align="center">
    <!-- row 1 -->
    <a href="https://github.com/maclary">
        <img alt="maclary version" src="https://img.shields.io/npm/v/maclary?color=red&label=maclary"/>
    </a>
    <a href="https://npmjs.com/package/maclary">
        <img alt="total downloads" src="https://img.shields.io/npm/dt/maclary"/>
    </a><br/>
    <!-- row 2 -->
    <a href="https://github.com/maclary/maclary/">
        <img alt="top language" src="https://img.shields.io/github/languages/top/maclary/maclary">
    </a>
    <a href="https://bundlephobia.com/package/maclary">
        <img alt="maclary code size" src="https://img.shields.io/bundlephobia/minzip/maclary?label=code%20size">
    </a><br/>
    <!-- row 3 -->
    <a href="https://github.com/maclary/maclary/blob/main/LICENSE">
        <img alt="license" src="https://img.shields.io/npm/l/maclary">
    </a>
    <a href="https://github.com/maclary/maclary/">
        <img alt="github commit activity" src="https://img.shields.io/github/commit-activity/m/maclary/maclary">
    </a><br/>
</div>

# Description

Maclary is a Discord bot framework intended to make developing bots a lot faster and easier, with built in command, event and component handling.

It is named after Hairy Maclary, a character from the New Zealand childrens book series of the same name.

Maclary is still in its early stages, please report any bugs you may find.

<div align="center">
    <a href="https://maclary.github.io/maclary">Documentation</a>
    <p>Better documentation and guides coming soon!</p>
</div>

# Features

-   Built in command, event and component handling
-   Use of arguments and preconditions
-   Advanced subcommand creation system
-   Ability to use plugins
-   Written in TypeScript

# Getting Started

Maclary requires Discord.js v14 to work, which is currently in development (`npm install discord.js@dev`).

It is very important that you include the `main` field within your package.json.

src/index.js

```ts
process.env.NODE_ENV = 'development';
const { MaclaryClient } = require('maclary');
const { Partials } = require('discord.js');

const client = new MaclaryClient({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
    partials: [Partials.Channel],
    defaultPrefix: '!',
    developmentPrefix: 'dev!',
    developmentGuildId: '123456789012345678',
});

const token =
    process.env.NODE_ENV === 'development' ? 'development_bot_token' : 'production_bot_token';
client.login(token);
module.exports = client;
```

src/commands/echo.js

```ts
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Command, Preconditions } = require('maclary');

const actionRow = new ActionRowBuilder().addComponents([
    new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Ping Me!'),
]);

module.exports = class Echo extends Command {
    constructor() {
        super({
            type: Command.Type.ChatInput,
            kinds: [Command.Kind.Prefix, Command.Kind.Interaction],
            preconditions: [Preconditions.GuildOnly],
            name: 'echo',
            description: 'Echos the input.',
            aliases: ['say'],
            options: [
                {
                    type: Command.OptionType.String,
                    name: 'input',
                    description: 'The text to echo.',
                },
            ],
        });
    }

    async onMessage(message, args) {
        const content = args.rest();
        actionRow.components[0].setCustomId(`pingUser,${message.author.id}`);
        await message.reply({ content, components: [actionRow] });
    }

    async onChatInput(interaction) {
        const content = interaction.options.getString('input');
        actionRow.components[0].setCustomId(`pingUser,${interaction.user.id}`);
        await interaction.reply({ content, components: [actionRow] });
    }
};
```

src/components/pingUser.js

```ts
const { Component } = require('maclary');

module.exports = class PingUser extends Component {
    constructor() {
        super({ id: 'pingUser' });
    }

    async onButton(button) {
        const [, userId] = button.customId.split(',');
        const user = await this.container.client.users.fetch(userId);
        await button.reply(user.toString());
    }
};
```

And that is it! Maclary will handle the rest.

# Command Categories

You can set the categories for commands by placing them in a folder that starts with `@`.

For example, `commands/@moderator/kick.js`.

# Subcommands

Maclary allows you to create subcommands using folders that start with `!`.

For example, `commands/!sub/command.js`, `commands/!sub/command/group.js`, `commands/@category/!sub/command.js`.

# Patching Commands

Whenever you restart your bot, Maclary will compare your local application commands with the ones on Discord. If there are any differences, Maclary will automatically update your commands, otherwise skip.

This will help in preventing you from reaching Discords global rate limit of 200 application command creates per day, per guild.

# Plugins

The already made plugins will become available soon, when documentation is created for them.
