import { z } from "astro:content";

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

export const PlayerAnswerSchema = z.object({
  player: PlayerSchema,
  questionId: z.string(),
  answer: z.string(),
});
export type PlayerAnswer = z.infer<typeof PlayerAnswerSchema>;

export const EmployeeSchema = z.object({
  name: z.string(),
  title: z.string(),
  image: z.string(),
});
export type Employee = z.infer<typeof EmployeeSchema>;

export const QuestionTemplateSchema = z.object({
  id: z.string(),
  employee: EmployeeSchema,
  question: z.string(),
  choices: z.array(z.string()),
  answer: z.string(),
});
export type QuestionTemplate = z.infer<typeof QuestionTemplateSchema>;

export const QuestionSchema = z.object({
  id: z.string(),
  template: QuestionTemplateSchema,
  answers: z.record(z.string(), PlayerAnswerSchema),
});
export type Question = z.infer<typeof QuestionSchema>;

export const LeaderboardSchema = z.object({
  players: z.array(
    z.intersection(PlayerSchema, z.object({ score: z.number() })),
  ),
});
export type Leaderboard = z.infer<typeof LeaderboardSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  questionTemplates: z.record(z.string(), QuestionTemplateSchema),
  questions: z.record(z.string(), QuestionSchema),
  current: QuestionSchema.optional(),
  state: z.enum(["connecting", "question", "answer", "leaderboard"]),
  leaderboard: LeaderboardSchema.optional(),
});
export type Session = z.infer<typeof SessionSchema>;
