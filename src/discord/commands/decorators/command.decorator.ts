import { DISCORD_CONSTANTS } from '../../constants/discord.constant';
import { DiscordCommandOptions } from '../types/discord.types';

export const Command = (options: DiscordCommandOptions): MethodDecorator => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      DISCORD_CONSTANTS.METADATA.COMMAND_KEY,
      options,
      descriptor.value,
    );
    return descriptor;
  };
};
