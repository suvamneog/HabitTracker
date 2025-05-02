"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import {
  Plus,
  Calendar,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Droplets,
  CloudMoon,
  Monitor,
  Dumbbell,
  Book,
  Coffee,
  Sun,
  Moon,
  Menu,
  X,
  Home,
  BarChart2,
  Settings,
  Bell,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash,
  ArrowRight
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Types
interface HabitLog {
  date: string;
  completed: boolean;
  amount?: number;
}

interface Habit {
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

// Mock Data
const generateDates = (days: number) => {
  return Array.from({ length: days }).map((_, index) => {
    return format(subDays(new Date(), days - 1 - index), "yyyy-MM-dd");
  });
};

const last14Days = generateDates(14);

const mockHabits: Habit[] = [
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

// Theme Context
type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = React.createContext<ThemeProviderState>({
  theme: "system",
  setTheme: () => null,
});

const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Components
const ThemeProvider: React.FC<{
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
  enableSystem?: boolean;
}> = ({
  children,
  defaultTheme = "system",
  attribute = "data-theme",
  enableSystem = false,
}) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, enableSystem]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem("theme", theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};

// Progress Chart Component
const ProgressChart: React.FC<{
  habits: Habit[];
  showAllData?: boolean;
}> = ({ habits, showAllData = false }) => {
  const dates = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(new Date(), 6 - index);
    return format(date, "yyyy-MM-dd");
  });

  const data = dates.map((date) => {
    const dayData: any = {
      date,
      displayDate: format(new Date(date), "EEE"),
    };

    if (showAllData) {
      habits.forEach((habit) => {
        const log = habit.logs.find((log) => log.date === date);
        dayData[habit.name] = log?.completed ? 1 : 0;
      });
    } else {
      const totalHabits = habits.length;
      const completedHabits = habits.filter((habit) => {
        const log = habit.logs.find((log) => log.date === date);
        return log?.completed;
      }).length;

      dayData.completionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
    }

    return dayData;
  });

  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="displayDate" />
        <YAxis
          domain={[0, showAllData ? 1 : 100]}
          tickFormatter={(value) => (showAllData ? value.toString() : `${value}%`)}
        />
        <Tooltip
          formatter={(value: number, name: string) =>
            showAllData
              ? [value === 1 ? "Completed" : "Not completed", name]
              : [`${Math.round(value)}%`, "Completion Rate"]
          }
        />
        {showAllData && <Legend />}

        {showAllData ? (
          habits.map((habit, index) => (
            <Bar
              key={habit.id}
              dataKey={habit.name}
              fill={colors[index % colors.length]}
              stackId={showAllData ? undefined : "a"}
            />
          ))
        ) : (
          <Bar dataKey="completionRate" fill="#3B82F6" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Streak Calendar Component
const StreakCalendar: React.FC<{
  habits: Habit[];
  showFullCalendar?: boolean;
}> = ({ habits, showFullCalendar = false }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="rounded-full p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-full p-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="mb-2 grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "yyyy-MM-dd");
        const cloneDay = day;
        
        const totalHabits = habits.length;
        const completedHabits = habits.filter((habit) => {
          const log = habit.logs.find((log) => log.date === formattedDate);
          return log?.completed;
        }).length;
        
        const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;
        
        let cellColorClass = "bg-gray-100 dark:bg-gray-700";
        if (completionRate > 0) {
          if (completionRate === 1) {
            cellColorClass = "bg-green-500 dark:bg-green-600";
          } else if (completionRate >= 0.75) {
            cellColorClass = "bg-green-400 dark:bg-green-500";
          } else if (completionRate >= 0.5) {
            cellColorClass = "bg-green-300 dark:bg-green-400";
          } else if (completionRate >= 0.25) {
            cellColorClass = "bg-green-200 dark:bg-green-300";
          } else {
            cellColorClass = "bg-green-100 dark:bg-green-200";
          }
        }
        
        days.push(
          <motion.div
            key={day.toString()}
            whileHover={{ scale: 1.05 }}
            className={`relative h-9 border border-gray-200 p-1 text-center dark:border-gray-700 ${
              !isSameMonth(day, monthStart)
                ? "text-gray-400 dark:text-gray-600"
                : isToday(day)
                ? "font-bold text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            } ${
              isSameMonth(day, monthStart) ? cellColorClass : ""
            }`}
          >
            <span className="text-xs">{format(day, "d")}</span>
            {isSameMonth(day, monthStart) && completionRate > 0 && showFullCalendar && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center">
                <span className="text-xs">
                  {Math.round(completionRate * 100)}%
                </span>
              </div>
            )}
          </motion.div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  if (!showFullCalendar) {
    return (
      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 flex items-center">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
          <Calendar className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Habit Calendar
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your daily progress over time
          </p>
        </div>
      </div>
      <div>
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-gray-100 dark:bg-gray-700"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">None</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-green-200 dark:bg-green-300"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">25%</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-green-300 dark:bg-green-400"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">50%</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-green-400 dark:bg-green-500"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">75%</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 rounded bg-green-500 dark:bg-green-600"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Habit Card Component
const HabitCard: React.FC<{
  habit: Habit;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  icon: React.ReactNode;
}> = ({ habit, updateHabit, deleteHabit, icon }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [amount, setAmount] = useState(habit.currentAmount || 0);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = habit.logs.find((log) => log.date === today);
  const isCompleted = todayLog?.completed || false;

  const handleComplete = () => {
    const updatedHabit = { ...habit };
    const todayIndex = updatedHabit.logs.findIndex((log) => log.date === today);
    
    if (todayIndex >= 0) {
      updatedHabit.logs[todayIndex].completed = !updatedHabit.logs[todayIndex].completed;
      updatedHabit.logs[todayIndex].amount = amount;
    } else {
      updatedHabit.logs.push({
        date: today,
        completed: true,
        amount: amount,
      });
    }

    if (!isCompleted) {
      updatedHabit.currentStreak += 1;
      if (updatedHabit.currentStreak > updatedHabit.bestStreak) {
        updatedHabit.bestStreak = updatedHabit.currentStreak;
      }
    } else {
      updatedHabit.currentStreak = Math.max(0, updatedHabit.currentStreak - 1);
    }

    updateHabit(updatedHabit);
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    
    const updatedHabit = { ...habit };
    updatedHabit.currentAmount = newAmount;
    
    const isGoalMet = newAmount >= habit.goalAmount;
    const todayIndex = updatedHabit.logs.findIndex((log) => log.date === today);
    
    if (todayIndex >= 0) {
      updatedHabit.logs[todayIndex].amount = newAmount;
      updatedHabit.logs[todayIndex].completed = isGoalMet;
    } else {
      updatedHabit.logs.push({
        date: today,
        completed: isGoalMet,
        amount: newAmount,
      });
    }

    updateHabit(updatedHabit);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habit.id);
    }
  };

  const handleDuplicate = () => {
    const newHabit = {
      ...habit,
      id: `${habit.id}-copy-${Date.now()}`,
      name: `${habit.name} (Copy)`,
    };
    updateHabit(newHabit);
  };

  const getProgressColor = () => {
    const percentage = Math.min(100, (amount / habit.goalAmount) * 100);
    if (percentage >= 100) return "bg-green-500 dark:bg-green-600";
    if (percentage >= 75) return "bg-blue-500 dark:bg-blue-600";
    if (percentage >= 50) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-gray-300 dark:bg-gray-600";
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700">
        <div className="flex items-center">
          <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {habit.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {habit.frequency === "daily" ? "Daily" : "Weekly"} goal:{" "}
              {habit.goalAmount} {habit.unit}
            </p>
          </div>
        </div>
        <div className="relative flex items-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mr-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            {showDetails ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-6 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
              <button
                onClick={handleDuplicate}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </button>
              <button
                onClick={handleDelete}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {amount} / {habit.goalAmount} {habit.unit}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Streak: {habit.currentStreak} days
          </div>
        </div>

        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-2 transition-all ${getProgressColor()}`}
            style={{
              width: `${Math.min(
                100,
                (amount / habit.goalAmount) * 100
              )}%`,
            }}
          ></div>
        </div>

        {habit.type === "counter" && (
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => handleAmountChange(Math.max(0, amount - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <span className="text-lg font-bold">-</span>
            </button>
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(e) => handleAmountChange(parseInt(e.target.value) || 0)}
              className="w-16 rounded-md border border-gray-300 px-3 py-1 text-center text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={() => handleAmountChange(amount + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <span className="text-lg font-bold">+</span>
            </button>
          </div>
        )}

        {showDetails && (
          <div className="mb-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
            <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Details
            </h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <p>Category: {habit.category}</p>
              <p>Best streak: {habit.bestStreak} days</p>
              <p>
                Started:{" "}
                {format(new Date(habit.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleComplete}
          className={`flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
            isCompleted
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          }`}
        >
          {isCompleted ? (
            <>
              <X className="mr-1.5 h-4 w-4" />
              Mark Incomplete
            </>
          ) : (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              Mark Complete
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// New Habit Modal Component
const NewHabitModal: React.FC<{
  onClose: () => void;
  onAddHabit: (habit: Habit) => void;
}> = ({ onClose, onAddHabit }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("water");
  const [frequency, setFrequency] = useState("daily");
  const [type, setType] = useState("counter");
  const [goalAmount, setGoalAmount] = useState(8);
  const [unit, setUnit] = useState("glasses");

  const categories = [
    { id: "water", name: "Water", icon: <Droplets className="h-6 w-6" /> },
    { id: "sleep", name: "Sleep", icon: <CloudMoon className="h-6 w-6" /> },
    { id: "screen", name: "Screen Time", icon: <Monitor className="h-6 w-6" /> },
    { id: "exercise", name: "Exercise", icon: <Dumbbell className="h-6 w-6" /> },
    { id: "reading", name: "Reading", icon: <Book className="h-6 w-6" /> },
    { id: "other", name: "Other", icon: <Coffee className="h-6 w-6" /> },
  ];

  const getCategorySpecificUnits = () => {
    switch (category) {
      case "water":
        return ["glasses", "ounces", "ml", "liters"];
      case "sleep":
        return ["hours", "minutes"];
      case "screen":
        return ["hours", "minutes"];
      case "exercise":
        return ["minutes", "hours", "reps", "sets", "miles", "km"];
      case "reading":
        return ["pages", "minutes", "books"];
      default:
        return ["times", "minutes", "hours", "units"];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name,
      category,
      type,
      frequency,
      goalAmount,
      unit,
      currentAmount: 0,
      currentStreak: 0,
      bestStreak: 0,
      createdAt: new Date().toISOString(),
      logs: [],
    };
    
    onAddHabit(newHabit);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Add New Habit
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Habit Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="e.g., Drink Water"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center rounded-md p-3 text-sm transition-colors ${
                      category === cat.id
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    }`}
                  >
                    {cat.icon}
                    <span className="mt-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <div className="mt-1 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setType("counter")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                    type === "counter"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Counter
                </button>
                <button
                  type="button"
                  onClick={() => setType("checkbox")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                    type === "checkbox"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Checkbox
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Frequency
              </label>
              <div className="mt-1 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setFrequency("daily")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                    frequency === "daily"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("weekly")}
                  className={`flex-1 rounded-md px-3 py-2 text-sm transition-colors ${
                    frequency === "weekly"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="goalAmount"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Goal Amount
                </label>
                <input
                  type="number"
                  id="goalAmount"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(parseInt(e.target.value) || 0)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="unit"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Unit
                </label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {getCategorySpecificUnits().map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Add Habit
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Landing Page Component
const LandingPage: React.FC<{
  onLogin: () => void;
}> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin();
    }, 1500);
  };

  const features = [
    {
      title: "Track Multiple Habits",
      description: "Monitor sleep, water intake, exercise, and more in one place",
    },
    {
      title: "Visual Progress",
      description: "See your improvements with beautiful charts and statistics",
    },
    {
      title: "Smart Reminders",
      description: "Get notified when you're falling behind on your goals",
    },
    {
      title: "Streak Tracking",
      description: "Build momentum with daily streak counters",
    },
  ];

  const testimonials = [
    {
      quote: "HabitTrack helped me drink enough water every day for the first time in my life!",
      author: "Sarah J.",
    },
    {
      quote: "The visual charts make it easy to see my progress and stay motivated.",
      author: "Michael T.",
    },
    {
      quote: "I've built a consistent meditation practice thanks to the streak counter.",
      author: "Amelia R.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-between px-4 py-16 md:flex-row md:py-24 lg:px-8">
        <motion.div 
          className="mb-12 max-w-lg md:mb-0 md:w-1/2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">Track your habits.</span>
            <span className="block text-blue-600 dark:text-blue-500">
              Transform your life.
            </span>
          </h1>
          <p className="mb-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300">
            Build better habits with our powerful analytics and tracking tools.
            See your progress, stay motivated, and achieve your goals.
          </p>
          <div className="space-y-4 sm:flex sm:space-x-4 sm:space-y-0">
            <a
              href="#features"
              className="flex items-center justify-center rounded-md bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:py-4 md:text-lg"
            >
              Learn More
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsSignUp(true);
              }}
              className="flex items-center justify-center rounded-md border border-blue-600 bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 dark:border-blue-500 dark:bg-transparent dark:text-blue-500 dark:hover:bg-gray-900 md:py-4 md:text-lg"
            >
              Get Started
            </a>
          </div>
        </motion.div>

        <motion.div 
          className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800 md:w-2/5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
            {!isSignUp && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500"
                >
                  Forgot your password?
                </a>
              </div>
            )}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : isSignUp ? (
                  "Sign up"
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignUp(!isSignUp);
                }}
                className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </a>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-16 dark:bg-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to build better habits
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
              Tools that help you track, analyze, and improve your daily routines
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex flex-col rounded-lg bg-white p-6 shadow-md dark:bg-gray-900"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="mb-4 rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="flex-1 text-base text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            What our users are saying
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <p className="mb-4 text-lg font-medium italic text-gray-600 dark:text-gray-300">
                  "{testimonial.quote}"
                </p>
                <p className="text-right font-semibold text-gray-900 dark:text-white">
                  — {testimonial.author}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 dark:bg-blue-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to transform your habits?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-xl text-blue-100">
              Join thousands of users who are building better lives, one habit at
              a time.
            </p>
            <div className="mt-8 flex justify-center">
              <motion.button
                onClick={onLogin}
                className="flex items-center rounded-md bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 md:py-4 md:text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// Layout Component
const Layout: React.FC<{
  children: React.ReactNode;
  isLoggedIn: boolean;
  onLogout: () => void;
}> = ({ children, isLoggedIn, onLogout }) => {
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Navbar */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary">
                <span className="text-2xl font-extrabold">Habit</span>
                <span className="text-blue-500">Track</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isLoggedIn && (
            <nav className="hidden space-x-8 md:flex">
              <a
                href="#dashboard"
                className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </a>
              <a
                href="#analytics"
                className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Analytics
              </a>
              <a
                href="#calendar"
                className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </a>
              <a
                href="#settings"
                className="flex items-center text-sm font-medium text-gray-700 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </a>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {isLoggedIn && (
              <>
                <button
                  className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
                </button>
                <button
                  className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 ring-2 ring-white dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-800"
                  onClick={onLogout}
                >
                  <span className="sr-only">Open user menu</span>
                  <User className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50 md:hidden"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isLoggedIn && isMobileMenuOpen && (
          <nav className="space-y-1 px-2 pb-3 pt-2 md:hidden">
            <a
              href="#dashboard"
              className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              <Home className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Dashboard
            </a>
            <a
              href="#analytics"
              className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              <BarChart2 className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Analytics
            </a>
            <a
              href="#calendar"
              className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              <Calendar className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Calendar
            </a>
            <a
              href="#settings"
              className="flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-500 dark:text-gray-400" />
              Settings
            
            </a>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center space-x-6 md:order-2">
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">GitHub</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:order-1 md:mt-0">
              <p className="text-center text-base text-gray-500 dark:text-gray-400">
                &copy; 2025 HabitTrack. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showNewHabitModal, setShowNewHabitModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data from an API
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const savedHabits = localStorage.getItem("habits");
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      } else {
        setHabits(mockHabits);
        localStorage.setItem("habits", JSON.stringify(mockHabits));
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  const updateHabit = (updatedHabit: Habit) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === updatedHabit.id ? updatedHabit : habit
    );
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
  };

  const addHabit = (newHabit: Habit) => {
    const updatedHabits = [...habits, newHabit];
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter((habit) => habit.id !== id);
    setHabits(updatedHabits);
    localStorage.setItem("habits", JSON.stringify(updatedHabits));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const getHabitIcon = (category: string) => {
    switch (category) {
      case "water":
        return <Droplets className="h-5 w-5" />;
      case "sleep":
        return <CloudMoon className="h-5 w-5" />;
      case "screen":
        return <Monitor className="h-5 w-5" />;
      case "exercise":
        return <Dumbbell className="h-5 w-5" />;
      case "reading":
        return <Book className="h-5 w-5" />;
      default:
        return <Coffee className="h-5 w-5" />;
    }
  };

  const completedToday = habits.filter((habit) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return habit.logs.some((log) => log.date === today && log.completed);
  }).length;

  const longestStreak = Math.max(
    ...habits.map((habit) => habit.currentStreak),
    0
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {activeTab === "dashboard"
            ? "Your Dashboard"
            : activeTab === "analytics"
            ? "Analytics"
            : activeTab === "calendar"
            ? "Calendar"
            : "Settings"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === "dashboard"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            }`}
            id="dashboard"
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange("analytics")}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === "analytics"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            }`}
            id="analytics"
          >
            Analytics
          </button>
          <button
            onClick={() => handleTabChange("calendar")}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === "calendar"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            }`}
            id="calendar"
          >
            Calendar
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`inline-flex items-center border-b-2 py-4 text-sm font-medium ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
            }`}
            id="settings"
          >
            Settings
          </button>
        </nav>
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* Stats Overview */}
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Habits
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {habits.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400">
                  <Check className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Completed Today
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {completedToday} / {habits.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {longestStreak} days
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Weekly Progress
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    72%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Habits List */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Today's Habits
              </h2>
              <button
                onClick={() => setShowNewHabitModal(true)}
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Habit
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <HabitCard
                    habit={habit}
                    updateHabit={updateHabit}
                    deleteHabit={deleteHabit}
                    icon={getHabitIcon(habit.category)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Weekly Progress
                </h3>
                <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <ProgressChart habits={habits} />
            </motion.div>

            <motion.div
              className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Monthly Overview
                </h3>
                <button className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>
              <div className="h-64">
                <StreakCalendar habits={habits} />
              </div>
            </motion.div>
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Habit Completion Rate
            </h2>
            <div className="h-80">
              <ProgressChart habits={habits} showAllData />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Category Breakdown
              </h2>
              <div className="h-64">
                {/* Category breakdown chart would go here */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Category breakdown visualization
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
                Consistency Score
              </h2>
              <div className="h-64">
                {/* Consistency score visualization would go here */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Consistency score visualization
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Detailed Habit Analysis
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Habit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Completion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Current Streak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Best Streak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Last 7 Days
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {habits.map((habit) => {
                    const completionRate = Math.round(
                      (habit.logs.filter((log) => log.completed).length /
                        Math.max(habit.logs.length, 1)) *
                        100
                    );
                    
                    return (
                      <tr key={habit.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="mr-2">{getHabitIcon(habit.category)}</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {habit.name}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-2 bg-green-500 dark:bg-green-600"
                                style={{ width: `${completionRate}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                              {completionRate}%
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {habit.currentStreak} days
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {habit.bestStreak} days
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex space-x-1">
                            {Array.from({ length: 7 }).map((_, i) => {
                              const date = new Date();
                              date.setDate(date.getDate() - (6 - i));
                              const dateStr = format(date, "yyyy-MM-dd");
                              const log = habit.logs.find(
                                (log) => log.date === dateStr
                              );
                              const completed = log?.completed || false;

                              return (
                                <div
                                  key={i}
                                  className={`h-4 w-4 rounded-sm ${
                                    completed
                                      ? "bg-green-500 dark:bg-green-600"
                                      : "bg-gray-200 dark:bg-gray-700"
                                  }`}
                                ></div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "calendar" && (
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Monthly Overview
            </h2>
            <div className="h-96">
              <StreakCalendar habits={habits} showFullCalendar />
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Upcoming Goals
            </h2>
            <div className="space-y-4">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-500">
                      {getHabitIcon(habit.category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {habit.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {habit.goalAmount} {habit.unit}
                        {habit.frequency === "daily" ? " daily" : " weekly"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        habit.currentStreak > 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {habit.currentStreak > 0
                        ? `${habit.currentStreak} day streak`
                        : "Start streak"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  defaultValue="John Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  defaultValue="john@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                  defaultValue="America/New_York"
                >
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Anchorage">Alaska Time (AKT)</option>
                  <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600">
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive email reminders for missed habits
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    value=""
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive browser notifications for habit reminders
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    value=""
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Daily Summary
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive a daily summary of your habits
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" value="" className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Weekly Report
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive a weekly report of your progress
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    value=""
                    className="peer sr-only"
                    defaultChecked
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:border-gray-600 dark:bg-gray-700"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
            <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
              Data Management
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Export Data
                </h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Download all your habit data as a CSV or JSON file.
                </p>
                <div className="flex space-x-4">
                  <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Export as CSV
                  </button>
                  <button className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                    Export as JSON
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-500">
                  Danger Zone
                </h3>
                <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  Permanently delete all your data from our servers.
                </p>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-600">
                  Delete All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewHabitModal && (
        <NewHabitModal
          onClose={() => setShowNewHabitModal(false)}
          onAddHabit={addHabit}
        />
      )}
    </div>
  );
};

// Main App Component
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously logged in
    const savedLoginState = localStorage.getItem("isLoggedIn");
    if (savedLoginState === "true") {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Layout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
        {isLoggedIn ? (
          <Dashboard />
        ) : (
          <LandingPage onLogin={handleLogin} />
        )}
      </Layout>
    </ThemeProvider>
  );
}