<div align="center">
    <img alt="hairy maclary" src=".github/assets/maclary.png" width="30%"/>
    <h1>Maclary</h1><br/>
    <i>The prefect Discord bot framework</i><br/>
    <code>npm install maclary discord.js@dev</code><br/>
    <code>yarn add maclary discord.js@dev</code/><br/>
    <code>pnpm add maclary discord.js@dev</code>
</div>

<div align="center">
    <!-- row 1 -->
    <a href="https://github.com/maclary">
        <img alt="maclary version" src="https://img.shields.io/badge/version-0.1.0-red"/>
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
    </a>
</div>

# What is Maclary?

Maclary is a Discord bot framework intended to make developing bots a lot faster and easier, with built in command and event handling.

It is named after Hairy Maclary, a character from the New Zealand childrens book series of the same name.

Maclary is still in its early stages, please report any bugs you may find.

<div align="center">
    <a href="https://maclary.github.io/maclary">Documentation</a>
    <p>Better documentation and guides coming soon!</p>
</div>

# Features

-   Built in command and event handling
-   Use of arguments and preconditions
-   Advanced subcommand creation system
-   Ability to use plugins
-   Written in TypeScript

# Getting Started

Maclary requires Discord.js version 14 to work, which is currently in development (`npm install discord.js@dev`).

It is very important that you include the `main` field within your package.json file!

src/index.ts

```ts
import { MaclaryClient } from 'maclary';
import { Partials } from 'discord.js';

const client = new MaclaryClient({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
    partials: [Partials.Channel],
    defaultPrefix: '!',
});

client.login('token');
```

src/commands/echo.ts

```ts
import { Command, Preconditions } from 'maclary';

export default class Echo extends Command {
    public constructor() {
        super({
            name: 'echo',
            aliases: ['say'],
            description: 'Echo!',
            options: [
                {
                    type: Command.OptionType.String,
                    name: 'input',
                    description: 'The input to echo.',
                },
            ],
            kinds: [Command.Kind.Prefix, Command.Kind.Interaction],
            preconditions: [Preconditions.GuildOnly],
        });
    }

    public override async onMessage(
        message: Command.Message,
        args: Command.Arguments,
    ): Promise<void> {
        const input = args.rest();
        await message.reply(input);
    }

    public override async onChatInput(interaction: Command.ChatInput): Promise<void> {
        const input = interaction.options.getString('input');
        await interaction.reply(input);
    }
}
```

And thats it! Maclary will handle the rest!

# Command Categories

You can set the categories for commands by placing them in a folder that starts with `@`.

For example, `commands/@moderator/kick.ts`.

# Subcommands

Maclary allows you to create subcommands using folders that start with `!`.

For example, `commands/!sub/command.ts`, `commands/!sub/command/group.ts`.

Theses subcommands work both with interaction and prefix commands.

# Patching Commands

Whenever you restart your bot, Maclary will compare your local application commands with the ones on Discord. If there are any differences, Maclary will automatically update your commands, otherwise skip.

This will help in preventing you from reaching Discords global rate limit of 200 application command creates per day, per guild.

# Plugins

The already made plugins will become available soon, when documentation is created for them.
