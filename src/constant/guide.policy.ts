import { registerEnumType } from '@nestjs/graphql';

export enum QuestGuideType {
  INTRO = 'INTRO',
  CONTENT = 'CONTENT',
}

registerEnumType(QuestGuideType, { name: 'QuestGuideType' });
