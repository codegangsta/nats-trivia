import type { Employee, QuestionTemplate } from "../schema";

const jeremy: Employee = {
  name: "Jeremy Saenz",
  title: "Director of Developer Experience",
  image: "/people/jeremy.jpeg",
};

const questions: QuestionTemplate[] = [
  {
    id: "1",
    employee: jeremy,
    question: "What is my favorite programming language?",
    choices: ["JavaScript", "TypeScript", "Python", "Java"],
    answer: "TypeScript",
  },
  {
    id: "2",
    employee: jeremy,
    question: "What is my favorite food?",
    choices: ["Pizza", "Sushi", "Tacos", "Burgers"],
    answer: "Tacos",
  },
  {
    id: "3",
    employee: jeremy,
    question: "What is my favorite color?",
    choices: ["Red", "Blue", "Green", "Yellow"],
    answer: "Green",
  },
  {
    id: "4",
    employee: jeremy,
    question: "What is my favorite animal?",
    choices: ["Dog", "Cat", "Bird", "Fish"],
    answer: "Dog",
  },
  // {
  //   id: "5",
  //   employee: jeremy,
  //   question: "What is my favorite movie?",
  //   choices: ["The Matrix", "The Dark Knight", "Inception", "Interstellar"],
  //   answer: "The Matrix",
  // },
  // {
  //   id: "6",
  //   employee: jeremy,
  //   question: "What is my favorite TV show?",
  //   choices: ["Breaking Bad", "Game of Thrones", "The Office", "Friends"],
  //   answer: "Breaking Bad",
  // },
  // {
  //   id: "7",
  //   employee: jeremy,
  //   question: "What is my favorite book?",
  //   choices: [
  //     "The Alchemist",
  //     "The Great Gatsby",
  //     "To Kill a Mockingbird",
  //     "1984",
  //   ],
  //   answer: "The Alchemist",
  // },
  // {
  //   id: "8",
  //   employee: jeremy,
  //   question: "What is my favorite band?",
  //   choices: ["The Beatles", "Led Zeppelin", "Pink Floyd", "Queen"],
  //   answer: "The Beatles",
  // },
  // {
  //   id: "9",
  //   employee: jeremy,
  //   question: "What is my favorite song?",
  //   choices: [
  //     "Bohemian Rhapsody",
  //     "Stairway to Heaven",
  //     "Hotel California",
  //     "Imagine",
  //   ],
  //   answer: "Bohemian Rhapsody",
  // },
  // {
  //   id: "10",
  //   employee: jeremy,
  //   question: "What is my favorite video game?",
  //   choices: [
  //     "The Legend of Zelda",
  //     "Super Mario Bros.",
  //     "Minecraft",
  //     "Fortnite",
  //   ],
  //   answer: "The Legend of Zelda",
  // },
  // {
  //   id: "11",
  //   employee: jeremy,
  //   question: "What is my favorite sport?",
  //   choices: ["Soccer", "Basketball", "Football", "Baseball"],
  //   answer: "Soccer",
  // },
  // {
  //   id: "12",
  //   employee: jeremy,
  //   question: "What is my favorite hobby?",
  //   choices: ["Reading", "Writing", "Drawing", "Cooking"],
  //   answer: "Reading",
  // },
  // {
  //   id: "13",
  //   employee: jeremy,
  //   question: "What is my favorite place?",
  //   choices: ["Paris", "New York", "Tokyo", "London"],
  //   answer: "Paris",
  // },
  // {
  //   id: "14",
  //   employee: jeremy,
  //   question: "What is my favorite season?",
  //   choices: ["Spring", "Summer", "Fall", "Winter"],
  //   answer: "Spring",
  // },
  // {
  //   id: "15",
  //   employee: jeremy,
  //   question: "What is my favorite holiday?",
  //   choices: ["Christmas", "Halloween", "Thanksgiving", "Easter"],
  //   answer: "Christmas",
  // },
  // {
  //   id: "16",
  //   employee: jeremy,
  //   question: "What is my favorite superhero?",
  //   choices: ["Batman", "Superman", "Spiderman", "Ironman"],
  //   answer: "Batman",
  // },
];

export const questionTemplates = questions.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as Record<string, QuestionTemplate>,
);
