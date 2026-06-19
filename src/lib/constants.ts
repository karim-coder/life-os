// Life OS — shared constants

export type DomainKey =
  | "mind_soul"
  | "time_action"
  | "health"
  | "wealth"
  | "network"
  | "growth"
  | "creativity"
  | "admin";

export interface DomainMeta {
  key: DomainKey;
  name: string;
  short: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // hex
  order: number;
}

export const DOMAINS: DomainMeta[] = [
  {
    key: "mind_soul",
    name: "Mind & Soul",
    short: "Mind",
    description: "Core values, visions, fears, affirmations, therapy notes, meditation.",
    icon: "Compass",
    color: "#a78bfa",
    order: 0,
  },
  {
    key: "time_action",
    name: "Time & Action",
    short: "Action",
    description: "Tasks, habits, routines, deep work blocks, bucket lists.",
    icon: "Hourglass",
    color: "#f59e0b",
    order: 1,
  },
  {
    key: "health",
    name: "Health & Body",
    short: "Health",
    description: "Sleep, fitness, nutrition, symptoms, medications, appointments.",
    icon: "HeartPulse",
    color: "#f43f5e",
    order: 2,
  },
  {
    key: "wealth",
    name: "Wealth & Career",
    short: "Wealth",
    description: "Income, expenses, subscriptions, bills, savings goals, career.",
    icon: "TrendingUp",
    color: "#10b981",
    order: 3,
  },
  {
    key: "network",
    name: "Network",
    short: "Network",
    description: "Contacts, important dates, interaction logs, follow-ups, gifts, pets.",
    icon: "Users",
    color: "#06b6d4",
    order: 4,
  },
  {
    key: "growth",
    name: "Growth",
    short: "Growth",
    description: "Reading list, courses, skill building, saved articles, takeaways.",
    icon: "BookOpen",
    color: "#3b82f6",
    order: 5,
  },
  {
    key: "creativity",
    name: "Creativity & Joy",
    short: "Joy",
    description: "Idea vault, side projects, media log, hobbies, travel, events.",
    icon: "Palette",
    color: "#ec4899",
    order: 6,
  },
  {
    key: "admin",
    name: "Admin",
    short: "Admin",
    description: "Document vault, home maintenance, inventory, grocery lists, recipes.",
    icon: "Home",
    color: "#71717a",
    order: 7,
  },
];

export const DOMAIN_MAP: Record<string, DomainMeta> = Object.fromEntries(
  DOMAINS.map((d) => [d.key, d]),
);

export type ItemType =
  | "task"
  | "note"
  | "journal"
  | "habit"
  | "event"
  | "finance"
  | "contact"
  | "idea"
  | "goal"
  | "document"
  | "bookmark"
  | "milestone"
  | "routine"
  | "symptom"
  | "medication"
  | "affirmation"
  | "vision";

export interface ItemTypeMeta {
  type: ItemType;
  name: string;
  icon: string;
  color: string;
  hasDate?: boolean;
  completable?: boolean;
}

export const ITEM_TYPES: ItemTypeMeta[] = [
  { type: "task", name: "Task", icon: "CheckSquare", color: "#f59e0b", hasDate: true, completable: true },
  { type: "note", name: "Note", icon: "StickyNote", color: "#eab308" },
  { type: "journal", name: "Journal", icon: "BookHeart", color: "#a78bfa", hasDate: true },
  { type: "habit", name: "Habit", icon: "Repeat", color: "#10b981" },
  { type: "event", name: "Event", icon: "Calendar", color: "#06b6d4", hasDate: true },
  { type: "finance", name: "Finance", icon: "Wallet", color: "#10b981", hasDate: true },
  { type: "contact", name: "Contact", icon: "User", color: "#06b6d4" },
  { type: "idea", name: "Idea", icon: "Lightbulb", color: "#ec4899" },
  { type: "goal", name: "Goal", icon: "Target", color: "#f43f5e", hasDate: true },
  { type: "document", name: "Document", icon: "FileText", color: "#71717a" },
  { type: "bookmark", name: "Bookmark", icon: "Bookmark", color: "#3b82f6" },
  { type: "milestone", name: "Milestone", icon: "Flag", color: "#f59e0b", hasDate: true, completable: true },
  { type: "routine", name: "Routine", icon: "ListChecks", color: "#eab308" },
  { type: "symptom", name: "Symptom", icon: "Thermometer", color: "#f43f5e", hasDate: true },
  { type: "medication", name: "Medication", icon: "Pill", color: "#f43f5e", hasDate: true },
  { type: "affirmation", name: "Affirmation", icon: "Heart", color: "#a78bfa" },
  { type: "vision", name: "Vision", icon: "Eye", color: "#a78bfa" },
];

export const ITEM_TYPE_MAP: Record<string, ItemTypeMeta> = Object.fromEntries(
  ITEM_TYPES.map((t) => [t.type, t]),
);

export type ItemStatus = "inbox" | "active" | "done" | "archived" | "snoozed";

export const STATUS_META: Record<ItemStatus, { name: string; color: string }> = {
  inbox: { name: "Inbox", color: "#71717a" },
  active: { name: "Active", color: "#10b981" },
  done: { name: "Done", color: "#3b82f6" },
  archived: { name: "Archived", color: "#71717a" },
  snoozed: { name: "Snoozed", color: "#f59e0b" },
};

export const PRIORITY_META = [
  { value: 0, name: "None", color: "#71717a" },
  { value: 1, name: "Low", color: "#3b82f6" },
  { value: 2, name: "Medium", color: "#eab308" },
  { value: 3, name: "High", color: "#f59e0b" },
  { value: 4, name: "Urgent", color: "#f43f5e" },
];

export const ENERGY_META = [
  { value: 0, name: "—", color: "#71717a" },
  { value: 1, name: "Low", color: "#3b82f6" },
  { value: 2, name: "Medium", color: "#eab308" },
  { value: 3, name: "High", color: "#f43f5e" },
];

export const REVIEW_PROMPTS = {
  daily: {
    wins: "What went well today?",
    challenges: "What didn't go as planned?",
    learnings: "What did you learn?",
    gratitude: "What are you grateful for?",
    priorities: "What's your top focus for tomorrow?",
  },
  weekly: {
    wins: "What were this week's wins?",
    challenges: "What drained you or blocked progress?",
    learnings: "What did you learn about yourself?",
    gratitude: "Who or what are you grateful for this week?",
    priorities: "What 3 things matter most next week?",
  },
};
