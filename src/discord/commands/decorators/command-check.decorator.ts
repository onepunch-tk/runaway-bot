// src/discord/commands/decorators/command-check.decorator.ts
import { CommandContext } from '../types/discord.types';

export function RequireUser() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context: CommandContext = args[0];

      if (!context.interaction) {
        console.log('No interaction found'); // interaction 없음
        throw new Error('잘못된 명령어 실행입니다.');
      }

      if (context.interaction.isChatInputCommand()) {
        const targetUser = context.interaction.options.getUser('user');

        //Bot 일 경우
        if (targetUser.bot) {
          await context.interaction.reply({
            content: "대상 유저가 '봇' 일 수 없습니다.",
            ephemeral: true,
          });
          return;
        }

        if (!targetUser) {
          await context.interaction.reply({
            content: '대상 유저를 멘션해주세요.',
            ephemeral: true,
          });
          return;
        }
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
