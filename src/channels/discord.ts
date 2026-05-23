import { ChannelType, Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';

export class DiscordChannel {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
  }

  async start(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) throw new Error('DISCORD_BOT_TOKEN is required');
    await this.client.login(token);
    await new Promise<void>((resolve) => this.client.once('clientReady', () => resolve()));
  }

  async stop(): Promise<void> {
    await this.client.destroy();
  }

  async send(channelId: string, text: string): Promise<void> {
    const channel = await this.getTextChannel(channelId);
    await channel.send(text.slice(0, 1900));
  }

  async history(channelId: string, limit: number): Promise<string[]> {
    const channel = await this.getTextChannel(channelId);
    const messages = await channel.messages.fetch({ limit });
    return [...messages.values()]
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .map((message) => `${message.createdAt.toISOString()} ${message.author.username}: ${message.content}`)
      .filter((line) => line.trim().length > 0);
  }

  onMessage(handler: (message: Message) => void | Promise<void>): void {
    this.client.on('messageCreate', (message) => {
      void handler(message);
    });
  }

  private async getTextChannel(channelId: string): Promise<TextChannel> {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      throw new Error(`Discord channel ${channelId} is not a guild text channel`);
    }
    return channel;
  }
}
