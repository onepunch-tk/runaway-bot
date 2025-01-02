import { Events, GatewayIntentBits } from 'discord.js';

export enum DiscordRole {
  CLAN_MASTER = '1241333243672789034',
  CLAN_SERVER_ADMIN = '1241331823653552228',
  CLAN_ADMIN = '1320986215453036606',
  CLAN = '1241337173127598120',
}

export const DISCORD_CONSTANTS = {
  INTENTS: {
    GUILDS: GatewayIntentBits.Guilds,
    GUILD_MEMBERS: GatewayIntentBits.GuildMembers,
    GUILD_MESSAGES: GatewayIntentBits.GuildMessages,
    MESSAGE_CONTENT: GatewayIntentBits.MessageContent,
    GUILD_VOICE_STATES: GatewayIntentBits.GuildVoiceStates,
    GUILD_INTEGRATIONS: GatewayIntentBits.GuildIntegrations,
    GUILD_PRESENCES: GatewayIntentBits.GuildPresences, // 멤버 상태 확인
    GUILD_MESSAGE_REACTIONS: GatewayIntentBits.GuildMessageReactions, // 메시지 반응
    GUILD_EMOJIS_AND_STICKERS: GatewayIntentBits.GuildEmojisAndStickers, // 이모티콘 및 스티커
  },
  EVENTS: {
    MESSAGE_CREATE: Events.MessageCreate,
    INTERACTION_CREATE: Events.InteractionCreate,
    GUILD_MEMBER_ADD: Events.GuildMemberAdd,
  },
  METADATA: {
    COMMAND_KEY: 'discord:command',
    ROLES_KEY: 'discord:role',
  },
  PROVIDERS: {
    DISCORD_REST: 'DISCORD_REST',
  },
  ROLE_GROUPS: {
    ALL: [
      DiscordRole.CLAN,
      DiscordRole.CLAN_ADMIN,
      DiscordRole.CLAN_SERVER_ADMIN,
      DiscordRole.CLAN_MASTER,
    ],
    ADMIN: [
      DiscordRole.CLAN_MASTER,
      DiscordRole.CLAN_SERVER_ADMIN,
      DiscordRole.CLAN_ADMIN,
    ],
    SERVER_ADMIN: [DiscordRole.CLAN_MASTER, DiscordRole.CLAN_SERVER_ADMIN],
    MASTER: [DiscordRole.CLAN_MASTER],
  },
} as const;
