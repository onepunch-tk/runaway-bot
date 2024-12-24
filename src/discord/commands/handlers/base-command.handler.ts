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
   */
  protected async checkRolePermissions(
    memberRoles: GuildMemberRoleManager | string[],
    command: CommandInfo,
  ): Promise<boolean> {
    // 명령어에 설정된 최소 역할 또는 기본 역할 그룹 가져오기
    const requiredRoles = command.meta.minRole
      ? this.getRolesFromMinRole(command.meta.minRole)
      : DISCORD_CONSTANTS.ROLE_GROUPS.ALL;

    // 명령어에 직접 지정된 역할이 있으면 그 역할 사용, 없으면 필수 역할 사용
    const allowedRoles = command.roleIds || requiredRoles;

    if (!memberRoles) return false;

    // memberRoles 타입에 따라 다른 방식으로 역할 확인
    if (Array.isArray(memberRoles)) {
      // string[] 타입일 때 - 역할 ID 직접 비교
      return allowedRoles.some((roleId) => memberRoles.includes(roleId));
    } else {
      // GuildMemberRoleManager 타입일 때 - cache에서 역할 확인
      return allowedRoles.some((roleId) => memberRoles.cache.has(roleId));
    }
  }

  /**
   * 지정된 최소 역할부터 상위 역할까지의 배열 반환
   * @param minRole - 최소 필요 역할
   * @returns 최소 역할부터 최상위 역할까지의 배열
   */
  private getRolesFromMinRole(minRole: DiscordRole): DiscordRole[] {
    const allRoles = DISCORD_CONSTANTS.ROLE_GROUPS.ALL;
    const minRoleIndex = allRoles.indexOf(minRole);

    // 최소 역할부터 배열 끝까지 잘라서 반환 (상위 역할들 포함)
    return allRoles.slice(0, minRoleIndex + 1);
  }
}
