import { GuildMemberRoleManager } from 'discord.js';
import {
  CommandHandler,
  CommandInfo,
  DiscordCommandOptions,
} from '../types/discord.types';
import {
  DISCORD_CONSTANTS,
  DiscordRole,
} from '../../constants/discord.constant';

/**
 * 디스코드 명령어 처리를 위한 기본 핸들러 클래스
 * 모든 명령어 핸들러는 이 클래스를 상속받아 구현
 */
export abstract class BaseCommandHandler {
  protected readonly commands = new Map<string, CommandInfo>();

  /**
   * 새로운 명령어를 등록
   * @param meta - 명령어 메타데이터 (이름, 설명 등)
   * @param handler - 명령어 실행 함수
   * @param roleIds - 명령어 사용 가능한 역할 ID 배열 (선택)
   */
  registerCommand(
    meta: DiscordCommandOptions,
    handler: CommandHandler,
    roleIds?: DiscordRole[],
  ) {
    this.commands.set(meta.name, {
      handler,
      meta,
      roleIds,
    });
  }

  /**
   * 명령어 이름으로 등록된 명령어 정보 조회
   * @param name - 찾을 명령어 이름
   * @returns 명령어 정보 또는 undefined
   */
  getCommand(name: string): CommandInfo | undefined {
    return this.commands.get(name);
  }

  /**
   * 사용자가 명령어를 실행할 권한이 있는지 확인
   * @param memberRoles - 사용자의 역할 정보 (디스코드 매니저 객체 또는 역할 ID 배열)
   * @param command - 실행하려는 명령어 정보
   * @returns 권한 있으면 true, 없으면 false
   */ protected async checkRolePermissions(
    memberRoles: GuildMemberRoleManager,
    command: CommandInfo,
  ): Promise<boolean> {
    if (!memberRoles) return false;

    // 1. 특정 역할이 지정된 경우 해당 역할만 체크
    const requiredRoles = command.roleIds || DISCORD_CONSTANTS.ROLE_GROUPS.ALL;
    return requiredRoles.some((roleId) => memberRoles.cache.has(roleId));
  }
}
