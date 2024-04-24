import { z } from "astro:content";

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Player = z.infer<typeof PlayerSchema>;

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
  expiryTime: z.date(),
});
export type Question = z.infer<typeof QuestionSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  questionTemplates: z.record(z.string(), QuestionTemplateSchema),
  questions: z.record(z.string(), QuestionSchema),
  current: QuestionSchema.optional(),
});
export type Session = z.infer<typeof SessionSchema>;
