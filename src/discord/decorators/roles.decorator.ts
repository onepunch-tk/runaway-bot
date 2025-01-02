import { DISCORD_CONSTANTS, DiscordRole } from '../constants/discord.constant';

export const Roles = (roleIds: DiscordRole[]): MethodDecorator => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      DISCORD_CONSTANTS.METADATA.ROLES_KEY,
      roleIds,
      descriptor.value,
    );
    return descriptor;
  };
};
