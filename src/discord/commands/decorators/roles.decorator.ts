import { DISCORD_CONSTANTS } from '../../constants/discord.constant';

export const Roles = (roleIds: string[]): MethodDecorator => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      DISCORD_CONSTANTS.METADATA.ROLES_KEY,
      roleIds,
      descriptor.value,
    );
    return descriptor;
  };
};
