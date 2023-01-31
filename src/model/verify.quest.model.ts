export interface VerifyDiscordQuest {
  targetDiscordChannelId: string;
}

export interface VerifyTwitterRetweetQuest {
  tweetId: string;
}

export interface VerifyTwitterFollowQuest {
  username: string;
}

export interface VerifyQuestInput {
  verifiedUrl: string;
}
