import { format, subDays } from "date-fns";

export interface HabitLog {
  date: string;
  completed: boolean;
  amount?: number;
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  type: "counter" | "checkbox";
  frequency: "daily" | "weekly";
  goalAmount: number;
  unit: string;
  currentAmount?: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: string;
  logs: HabitLog[];
}

// Generate dates for the last 14 days
const generateDates = (days: number) => {
  return Array.from({ length: days }).map((_, index) => {
    return format(subDays(new Date(), days - 1 - index), "yyyy-MM-dd");
  });
};

const last14Days = generateDates(14);

// Mock habits with realistic data
export const mockHabits: Habit[] = [
  {
    id: "habit-1",
    name: "Drink Water",
    category: "water",
    type: "counter",
    frequency: "daily",
    goalAmount: 8,
    unit: "glasses",
    currentAmount: 6,
    currentStreak: 5,
    bestStreak: 14,
    createdAt: subDays(new Date(), 30).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index < 10 || (index % 3 !== 0),
      amount: index < 10 ? 8 : index % 3 === 0 ? 6 : 8,
    })),
  },
  {
    id: "habit-2",
    name: "Sleep 8 Hours",
    category: "sleep",
    type: "counter",
    frequency: "daily",
    goalAmount: 8,
    unit: "hours",
    currentAmount: 7,
    currentStreak: 3,
    bestStreak: 8,
    createdAt: subDays(new Date(), 28).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index % 4 !== 0,
      amount: index % 4 === 0 ? 6 : index % 2 === 0 ? 7.5 : 8,
    })),
  },
  {
    id: "habit-3",
    name: "Limit Screen Time",
    category: "screen",
    type: "counter",
    frequency: "daily",
    goalAmount: 2,
    unit: "hours",
    currentAmount: 3,
    currentStreak: 0,
    bestStreak: 5,
    createdAt: subDays(new Date(), 21).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index % 3 !== 1,
      amount: index % 3 === 1 ? 3 : 1.5,
    })),
  },
  {
    id: "habit-4",
    name: "Exercise",
    category: "exercise",
    type: "counter",
    frequency: "daily",
    goalAmount: 30,
    unit: "minutes",
    currentAmount: 15,
    currentStreak: 2,
    bestStreak: 7,
    createdAt: subDays(new Date(), 25).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index % 2 === 0 || index > 11,
      amount: index % 2 === 0 || index > 11 ? 30 : 15,
    })),
  },
  {
    id: "habit-5",
    name: "Read Books",
    category: "reading",
    type: "counter",
    frequency: "daily",
    goalAmount: 20,
    unit: "pages",
    currentAmount: 25,
    currentStreak: 7,
    bestStreak: 10,
    createdAt: subDays(new Date(), 18).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index > 6 || index % 5 === 0,
      amount: index > 6 || index % 5 === 0 ? 25 : 15,
    })),
  },
  {
    id: "habit-6",
    name: "Meditate",
    category: "other",
    type: "counter",
    frequency: "daily",
    goalAmount: 10,
    unit: "minutes",
    currentAmount: 10,
    currentStreak: 4,
    bestStreak: 12,
    createdAt: subDays(new Date(), 15).toISOString(),
    logs: last14Days.map((date, index) => ({
      date,
      completed: index < 4 || index % 2 !== 0,
      amount: 10,
    })),
  },
];