import { Listener } from '#/structures/Listener';
import { Events } from '#/utilities/Events';

export class OnClientReady extends Listener<typeof Events.ClientReady> {
    public constructor() {
        super({ event: Events.ClientReady });
    }

    public override run() {
        this.container.logger.info(`Logged in as ${this.container.client.user.tag}!`);
    }
}
