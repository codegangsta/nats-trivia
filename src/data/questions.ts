import type { Employee, QuestionTemplate } from "../schema";

const jeremy: Employee = {
  name: "Jeremy Saenz",
  title: "Director of Developer Experience",
  image: "/people/jeremy.jpeg",
};

export const questions: QuestionTemplate[] = [
  {
    id: "1",
    employee: jeremy,
    question: "What is my favorite programming language?",
    choices: ["JavaScript", "TypeScript", "Python", "Java"],
    answer: "TypeScript",
  },
];
