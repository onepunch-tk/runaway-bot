# NestJS Discord Bot Boilerplate

Discord 봇을 NestJS 프레임워크를 사용하여 개발하기 위한 보일러플레이트 프로젝트입니다.

## 주요 기능
- 환경 변수 관리 및 유효성 검사
- Discord Intents와 Events 상수 관리
- 명령어 처리 (슬래시 커맨드, 메시지 커맨드)
- 역할 기반 권한 관리
- 이벤트 핸들링 (버튼, 메뉴 등)

## 시작하기

### 1. 환경 변수 설정
`.env` 파일을 생성하고 필요한 환경 변수를 추가합니다:

```
DISCORD_APP_ID=your_app_id
DISCORD_PUBLIC_KEY=your_public_key
DISCORD_BOT_TOKEN=your_bot_token
```

### 2. 환경 변수 유효성 검사
`app.module.ts`에서 ConfigModule을 통해 환경 변수 유효성 검사를 설정합니다:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DISCORD_APP_ID: Joi.string().required(),
        DISCORD_BOT_TOKEN: Joi.string().required(),
        DISCORD_PUBLIC_KEY: Joi.string().required(),
      }),
    }),
    DiscordModule,
  ],
})
export class AppModule {}
```

### 3. Discord 상수 정의
`discord.constant.ts`에서 필요한 상수들을 정의합니다:

```typescript
export const DISCORD_CONSTANTS = {
  INTENTS: {
    GUILDS: GatewayIntentBits.Guilds,
    GUILD_MEMBERS: GatewayIntentBits.GuildMembers,
    GUILD_MESSAGES: GatewayIntentBits.GuildMessages,
    MESSAGE_CONTENT: GatewayIntentBits.MessageContent,
    GUILD_VOICE_STATES: GatewayIntentBits.GuildVoiceStates,
  },
  EVENTS: {
    MESSAGE_CREATE: Events.MessageCreate,
    INTERACTION_CREATE: Events.InteractionCreate,
  },
  METADATA: {
    COMMAND_KEY: 'discord:command',
    ROLES_KEY: 'discord:roles',
  },
} as const;
```

### 4. 명령어 생성 예제

```typescript
@Controller('clan')
export class ClanController {
  // 전체 사용 가능한 명령어
  @Command({
    prefix: '/',
    name: 'ping',
    description: '핑퐁 테스트',
    isGlobal: true,
  })
  async ping(interaction: CommandInteraction) {
    await interaction.reply('Pong!');
  }

  // 특정 역할만 사용 가능한 명령어
  @Roles(['123456789', '987654321'])
  @Command({
    prefix: '/',
    name: 'admin',
    description: '관리자 전용 명령어',
  })
  async adminCommand(interaction: CommandInteraction) {
    await interaction.reply('관리자 명령어 실행됨');
  }
}
```

### 5. 이벤트 핸들링 예제

```typescript
private setupEventHandlers() {
  const client = this.discordClient.getClient();

  client.on(DISCORD_CONSTANTS.EVENTS.INTERACTION_CREATE, async (interaction) => {
    // 슬래시 커맨드 처리
    if (interaction.isChatInputCommand()) {
      await this.slashHandler.handleInteraction(interaction);
    }
    
    // 버튼 클릭 처리
    if (interaction.isButton()) {
      await this.handleButtonInteraction(interaction);
    }
    
    // 선택 메뉴 처리
    if (interaction.isSelectMenu()) {
      await this.handleSelectMenuInteraction(interaction);
    }
  });
}
```

## 프로젝트 구조

```
src/
├── discord/
│   ├── commands/              # 명령어 관련 파일들
│   │   ├── decorators/       # 커맨드, 역할 데코레이터
│   │   ├── handlers/         # 명령어 핸들러
│   │   └── interfaces/       # 타입 정의
│   ├── constants/            # Discord 관련 상수
│   ├── services/             # Discord 관련 서비스
│   ├── discord.module.ts
│   └── discord.service.ts
└── common/                   # 공통 모듈
    └── constants/
```

## 주의사항
- Discord 개발자 포털에서 필요한 Intents를 활성화해야 합니다
- 역할 ID는 Discord 서버내에서 역할 ID 복사로 확인할 수 있습니다
- 환경 변수는 반드시 안전하게 관리해야 합니다

## 기여하기
이슈와 풀 리퀘스트를 환영합니다. 주요 변경사항의 경우 먼저 이슈를 열어 논의해주세요.

## 라이선스
MIT
