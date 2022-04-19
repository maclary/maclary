import { container } from '../../container';
import { Event } from '../../structures/Event';
import { Events } from '../../types/Events';

export default class OnReady extends Event {
    public constructor() {
        super({
            name: Events.ClientReady,
            emitter: container.client,
            once: true,
        });
    }

    public override handle() {
        container.logger.info(`Logged in as ${container.client.user?.tag || 'unknown'}`);
    }
}
