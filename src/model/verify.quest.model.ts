export interface VerifyDiscordQuest {
  targetDiscordChannelId: string;
}

export interface VerifyTwitterFollowQuest {
  username: string;
}

export interface VerifySocialQuest {
  verifyTwitterFollowQuest: VerifyTwitterFollowQuest;
}

export interface VerifyQuestInput {
  verifiedUrl: string;
}
