import type { Employee, QuestionTemplate } from "../schema";

const jeremy: Employee = {
  name: "Jeremy Saenz",
  title: "Director of Developer Experience",
  image: "/people/jeremy.jpeg",
};

const nats: Employee = {
  name: "NATS",
  title: "nats.io",
  image: "/people/nats.png",
};

const synadia: Employee = {
  name: "Synadia",
  title: "synadia.com",
  image: "/people/synadia.png",
};

const derek: Employee = {
  name: "Derek Collison",
  title: "CEO",
  image: "/people/derek.png",
};

const randomize = <T>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const questions: QuestionTemplate[] = [
  {
    id: "1",
    employee: nats,
    question: "When was the first NATS commit?",
    choices: randomize([
      "March 2013",
      "February 2013",
      "May 2013",
      "June 2013",
    ]),
    answer: "March 2013",
  },
  {
    id: "2",
    employee: derek,
    question: "What was Derek's first computer?",
    choices: randomize(["Commodore 64", "Apple II", "TRS-80", "Atari 2600"]),
    answer: "Commodore 64",
  },
  {
    id: "3",
    employee: synadia,
    question: "When was Synadia founded?",
    choices: randomize(["2017", "2018", "2019", "2016"]),
    answer: "2017",
  },
  {
    id: "4",
    employee: nats,
    question: "What does NATS stand for?",
    choices: randomize([
      "Not Another Tibco Server",
      "NATS Ain't That Special",
      "NATS Asynchronous Transport System",
      "Neural Autonomic Transport System",
    ]),
    answer: "Not Another Tibco Server",
  },
  {
    id: "5",
    employee: nats,
    question: "Who did Synadia have to fight for the NATS trademark?",
    choices: randomize([
      "National Air Traffic Services",
      "Major League Baseball",
      "NATS-USA.com",
      "North America Travel Service",
    ]),
    answer: "Major League Baseball",
  },
  {
    id: "6",
    employee: nats,
    question: "What messaging service was NATS created to replace?",
    choices: randomize(["ActiveMQ", "RabbitMQ", "ZeroMQ", "Tibco Rendezvous"]),
    answer: "RabbitMQ",
  },
  {
    id: "7",
    employee: nats,
    question: "What was NATS original tagline?",
    choices: randomize([
      "Connect Everything",
      "Messaging Made simple",
      "Open Source. Performant. Simple. Scalable.",
      "Open Source. Performant. Secure. Simple.",
    ]),
    answer: "Open Source. Performant. Simple. Scalable.",
  },
  {
    id: "8",
    employee: nats,
    question: "What was the former name of nats-server?",
    choices: randomize(["gnatsd", "natty", "natsd", "nats-serverd"]),
    answer: "gnatsd",
  },
  {
    id: "9",
    employee: derek,
    question: "What did I want to be before becoming a software engineer?",
    choices: randomize([
      "Doctor",
      "Race Car Driver",
      "Firefighter",
      "Rock Star",
    ]),
    answer: "Doctor",
  },
  {
    id: "10",
    employee: derek,
    question: "What was my first car?",
    choices: randomize(["Chevy Nova", "Ford Pinto", "Mazda Miata", "DeLorean"]),
    answer: "Chevy Nova",
  },
  {
    id: "11",
    employee: synadia,
    question: "Who was Synadia's first commercial customer?",
    choices: randomize([
      "Mastercard",
      "Starbucks",
      "Fineco Bank",
      "Team Systems",
    ]),
    answer: "Mastercard",
  },
  {
    id: "11",
    employee: {
      name: "Byron",
      title: "VP of Product/Eng",
      image: "/people/byron.jpg",
    },
    mystery: true,
    question: "My original career aspiration was to be a chef.",
    choices: randomize(["Byron", "Claire", "Alberto", "Ethan"]),
    answer: "Byron",
  },
  {
    id: "12",
    employee: {
      name: "Reuben Ninan",
      title: "Engineer: Performance & Reliability",
      image: "/people/reuben.png",
    },
    mystery: true,
    question: "My favorite food is chopped liver.",
    choices: randomize(["Reuben", "Alberto", "Steve", "Ina"]),
    answer: "Reuben",
  },
  {
    id: "13",
    employee: {
      name: "Neil Twigg",
      title: "Engineer: NATS Server",
      image: "/people/neil.jpg",
    },
    mystery: true,
    question: "I secretly watch Grey's Anatomy.",
    choices: randomize(["Neil", "Ginger", "Scott", "Seth"]),
    answer: "Neil",
  },
  {
    id: "14",
    employee: {
      name: "Erik Hansen",
      title: "Operations Engineer",
      image: "/people/erik.jpg",
    },
    mystery: true,
    question:
      "My favorite guilty pleasure is eating fake nacho cheese dip & chips.",
    choices: randomize(["Erik", "Jeremy", "Phil", "Piotr"]),
    answer: "Erik",
  },
  {
    id: "15",
    employee: {
      name: "Brian Flannery",
      title: "VP Global Sales",
      image: "/people/brian.jpg",
    },
    question: "I went to elementary school in Saudi Arabia.",
    mystery: true,
    choices: randomize([
      "Brian Flannery",
      "Brian Goodman-Jones",
      "Sam A.",
      "Sam C.",
    ]),
    answer: "Brian Flannery",
  },
];

export const questionTemplates = questions.reduce(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {} as Record<string, QuestionTemplate>,
);
