export interface VerifyTwitterLikingQuest {
  tweetId: string;
  twitterUrl: string;
  username: string;
}

export interface VerifyTwitterRetweetQuest {
  tweetId: string;
  twitterUrl: string;
  username: string;
}

export interface VerifyTwitterFollowQuest {
  username: string;
  twitterUrl: string;
}

export interface VerifyQuestInput {
  verifiedUrl: string;
}

export interface VerifyAptosExistTxQuest {
  txCount: number;
}
