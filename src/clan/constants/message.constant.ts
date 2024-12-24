export const MESSAGE_CONSTANTS = {
  CLAN: {
    REGISTER: {
      title: '⚠️ 등록 불가',
      successTitle: '✅ 클랜 가입 성공',
      successColor: '#00FF00',
      failTitle: '❌ 등록 실패',
      actionName: '가입',
    },
    DELETE: {
      title: '⚠️ 탈퇴 불가',
      successTitle: '🚫 클랜 탈퇴 처리 완료',
      successColor: '#FF6B6B',
      failTitle: '❌ 탈퇴 처리 실패',
      actionName: '탈퇴',
    },
  },
};

export enum MESSAGE_ACTiON {
  REGISTER = 'register',
  DELETE = 'delete',
}
