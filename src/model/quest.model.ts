export interface QuizQuestion {
  isAnswer: boolean;
  questionnaire: string;
}

export interface QuizQuest {
  subject: string;
  questions: QuizQuestion[];
}

export interface QuizQuestInput {
  quizQuests: QuizQuest[];
}
