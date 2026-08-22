export const SHARED_DATA_STORAGE_KEY = "slms-shared-app-data";

export const STORAGE_KEYS = {
  profile: "slms-admin-profile",
  admin: "slms-admin-directory",
  academic: "slms-admin-academic",
  expense: "slms-admin-expense",
  hostel: "slms-admin-hostel",
  complaints: "slms-admin-complaints",
  notifications: "slms-admin-notifications",
  copilot: "slms-admin-copilot",
  settings: "slms-admin-settings",
  activity: "slms-admin-activity",
  academicCourses: "slms-admin-academic-courses",
  academicAssignments: "slms-admin-academic-assignments",
  academicExams: "slms-admin-academic-exams",
  academicAttendance: "slms-admin-academic-attendance",
  academicResults: "slms-admin-academic-results",
  hostelApplications: "slms-admin-hostel-applications",
  hostelRooms: "slms-admin-hostel-rooms",
  hostelAllocations: "slms-admin-hostel-allocations",
  hostelFees: "slms-admin-hostel-fees",
  expenseRecords: "slms-admin-expense-records",
  expenseCategories: "slms-admin-expense-categories",
  budget: "slms-admin-budget",
  complaintList: "slms-admin-complaint-list",
  copilotSettings: "slms-admin-copilot-settings",
};

const defaultExpenses = [
  {
    id: "EXP-2401",
    title: "Cafeteria Lunch Combo",
    category: "Food",
    amount: 12.5,
    date: "2026-07-30",
    paymentMethod: "Card",
    description: "Lunch between lab sessions",
    status: "Approved",
    studentId: "STU-2401",
    createdAt: "2026-07-30T09:30:00.000Z",
  },
  {
    id: "EXP-2402",
    title: "Project Printing",
    category: "Printing",
    amount: 8.25,
    date: "2026-07-29",
    paymentMethod: "Cash",
    description: "Capstone draft print",
    status: "Logged",
    studentId: "STU-2402",
    createdAt: "2026-07-29T08:20:00.000Z",
  },
];

const defaultAdminData = () => ({
  students: [
    {
      id: "STU-2401",
      name: "Ayesha Khan",
      email: "ayesha.khan@slms.edu.pk",
      program: "BS Computer Science",
      semester: "6th",
      status: "Active",
      cgpa: 3.68,
      joinedAt: "2024-09-02",
    },
    {
      id: "STU-2402",
      name: "Hamza Ahmed",
      email: "hamza.ahmed@slms.edu.pk",
      program: "BS Software Engineering",
      semester: "5th",
      status: "Active",
      cgpa: 3.42,
      joinedAt: "2024-09-02",
    },
    {
      id: "STU-2403",
      name: "Fatima Noor",
      email: "fatima.noor@slms.edu.pk",
      program: "BBA",
      semester: "4th",
      status: "On hold",
      cgpa: 3.51,
      joinedAt: "2025-01-13",
    },
  ],
  rooms: [
    { id: "A-101", block: "A", capacity: 3, occupied: 2, status: "Available" },
    { id: "A-102", block: "A", capacity: 3, occupied: 3, status: "Full" },
    { id: "B-204", block: "B", capacity: 2, occupied: 1, status: "Available" },
  ],
  allocations: [],
  categories: [
    "Food",
    "Transport",
    "Books",
    "Stationery",
    "Hostel",
    "Medical",
    "Projects",
    "Printing",
    "Miscellaneous",
  ],
  users: [
    {
      id: "USR-001",
      name: "SLMS Administrator",
      email: "admin@slms.edu.pk",
      role: "System Administrator",
      status: "Active",
    },
    {
      id: "USR-002",
      name: "Dr. Sarah Malik",
      email: "sarah.malik@slms.edu.pk",
      role: "Academic Officer",
      status: "Active",
    },
  ],
  roles: [
    {
      id: "role-admin",
      name: "System Administrator",
      members: 1,
      description: "Full SLMS administration access.",
    },
    {
      id: "role-academic",
      name: "Academic Officer",
      members: 3,
      description: "Courses, assessments, and attendance.",
    },
  ],
  permissions: [
    "Manage students",
    "Manage academics",
    "Manage hostel",
    "Approve finance",
    "Resolve complaints",
    "View analytics",
  ],
  auditLog: [],
  preferences: {
    compactTables: false,
    weeklyDigest: true,
    autoAssignComplaints: true,
  },
});

const defaultSettings = {
  theme: "Light",
  notifications: {
    assignment: true,
    exam: true,
    attendance: true,
    expense: true,
    complaints: true,
    hostel: true,
    reminder: true,
    ai: true,
  },
  reminders: [],
  readNotificationIds: [],
  aiSettings: {
    studyPlanner: true,
    budgetWarnings: true,
    complaintDrafting: false,
  },
};

const asArray = (value, fallback = []) =>
  Array.isArray(value) ? value : fallback;
const asObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value
    : fallback;
const readJSON = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* in-memory fallback */
  }
};

const normalizeAdminData = (value) => {
  const defaults = defaultAdminData();
  const admin = asObject(value);
  return {
    students: asArray(admin.students, defaults.students),
    rooms: asArray(admin.rooms, defaults.rooms),
    allocations: asArray(admin.allocations),
    categories: asArray(admin.categories, defaults.categories),
    users: asArray(admin.users, defaults.users),
    roles: asArray(admin.roles, defaults.roles),
    permissions: asArray(admin.permissions, defaults.permissions),
    auditLog: asArray(admin.auditLog),
    preferences: { ...defaults.preferences, ...asObject(admin.preferences) },
  };
};

export const normalizeSharedData = (value) => {
  const data = asObject(value);
  const legacyAdmin = data.settings?.aiSettings?.admin;
  const academic = asObject(data.academic);
  const hostel = asObject(data.hostel);
  const expense = asObject(data.expense);
  const settings = asObject(data.settings);
  return {
    profile: {
      personalData: asObject(data.profile?.personalData),
      profileData: asObject(data.profile?.profileData),
      contactData: asObject(data.profile?.contactData),
    },
    admin: normalizeAdminData(data.admin || legacyAdmin),
    academic: {
      profile: asObject(academic.profile),
      courses: asArray(academic.courses),
      assignments: asArray(academic.assignments),
      exams: asArray(academic.exams),
      attendance: asArray(academic.attendance),
      results: asArray(academic.results),
    },
    expenses: asArray(
      data.expenses || expense.records,
      defaultExpenses.map((row) => ({ ...row })),
    ),
    monthlyBudget: Number.isFinite(
      Number(data.monthlyBudget ?? expense.monthlyBudget),
    )
      ? Number(data.monthlyBudget ?? expense.monthlyBudget)
      : 0,
    budgetHistory: asArray(data.budgetHistory || expense.budgetHistory).map(
      (item) => Number(item) || 0,
    ),
    hostelApplications: asArray(data.hostelApplications || hostel.applications),
    hostelFees: asArray(data.hostelFees || hostel.fees),
    complaints: asArray(data.complaints),
    notifications: asArray(data.notifications),
    copilotMessages: asArray(data.copilotMessages),
    activity: asArray(data.activity).slice(0, 100),
    settings: {
      theme:
        typeof settings.theme === "string"
          ? settings.theme
          : defaultSettings.theme,
      notifications: {
        ...defaultSettings.notifications,
        ...asObject(settings.notifications),
      },
      reminders: asArray(settings.reminders),
      readNotificationIds: asArray(settings.readNotificationIds).filter(
        (id) => typeof id === "string",
      ),
      aiSettings: {
        ...defaultSettings.aiSettings,
        ...asObject(settings.aiSettings),
      },
    },
  };
};

export const createDefaultSharedData = () => normalizeSharedData({});

export const loadSharedData = () => {
  const has = Object.values(STORAGE_KEYS).some((key) => {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  });
  if (has) {
    const academic = readJSON(STORAGE_KEYS.academic, {});
    const hostel = readJSON(STORAGE_KEYS.hostel, {});
    const expense = readJSON(STORAGE_KEYS.expense, {});
    const settings = readJSON(STORAGE_KEYS.settings, {});
    const admin = readJSON(STORAGE_KEYS.admin, {});
    return normalizeSharedData({
      profile: readJSON(STORAGE_KEYS.profile, {}),
      admin: {
        ...admin,
        categories: readJSON(
          STORAGE_KEYS.expenseCategories,
          admin.categories || [],
        ),
        rooms: readJSON(STORAGE_KEYS.hostelRooms, admin.rooms || []),
        allocations: readJSON(
          STORAGE_KEYS.hostelAllocations,
          admin.allocations || [],
        ),
      },
      academic: {
        ...academic,
        courses: readJSON(STORAGE_KEYS.academicCourses, academic.courses || []),
        assignments: readJSON(
          STORAGE_KEYS.academicAssignments,
          academic.assignments || [],
        ),
        exams: readJSON(STORAGE_KEYS.academicExams, academic.exams || []),
        attendance: readJSON(
          STORAGE_KEYS.academicAttendance,
          academic.attendance || [],
        ),
        results: readJSON(STORAGE_KEYS.academicResults, academic.results || []),
      },
      expenses: readJSON(STORAGE_KEYS.expenseRecords, expense.records || []),
      monthlyBudget: readJSON(STORAGE_KEYS.budget, expense.monthlyBudget),
      budgetHistory: expense.budgetHistory,
      hostelApplications: readJSON(
        STORAGE_KEYS.hostelApplications,
        hostel.applications || [],
      ),
      hostelFees: readJSON(STORAGE_KEYS.hostelFees, hostel.fees || []),
      complaints: readJSON(
        STORAGE_KEYS.complaintList,
        readJSON(STORAGE_KEYS.complaints, []),
      ),
      notifications: readJSON(STORAGE_KEYS.notifications, []),
      copilotMessages: readJSON(STORAGE_KEYS.copilot, []),
      activity: readJSON(STORAGE_KEYS.activity, []),
      settings: {
        ...settings,
        aiSettings: {
          ...readJSON(STORAGE_KEYS.copilotSettings, {}),
          ...(settings.aiSettings || {}),
        },
      },
    });
  }
  const legacy = readJSON(SHARED_DATA_STORAGE_KEY, null);
  if (legacy) return normalizeSharedData(legacy);
  return normalizeSharedData({
    profile: {
      personalData: readJSON("personalData", {}),
      profileData: readJSON("profileData", {}),
      contactData: readJSON("contactData", {}),
    },
    academic: readJSON("slms-academic-workspace", {}),
    expenses: readJSON("slms-expenses", defaultExpenses),
    budgetHistory: readJSON("slms-monthly-budgets", []),
    hostelApplications: readJSON("slms-hostel-applications", []),
    complaints: readJSON("slms-complaints", []),
    notifications: readJSON("slms-notifications", []),
    copilotMessages: readJSON("slms-copilot-messages", []),
    settings: {
      theme: window.localStorage.getItem("theme") || "Light",
      reminders: readJSON("reminders", []),
    },
  });
};

export const persistSharedData = (value) => {
  const data = normalizeSharedData(value);
  writeJSON(STORAGE_KEYS.profile, data.profile);
  writeJSON(STORAGE_KEYS.admin, data.admin);
  writeJSON(STORAGE_KEYS.academic, data.academic);
  writeJSON(STORAGE_KEYS.academicCourses, data.academic.courses);
  writeJSON(STORAGE_KEYS.academicAssignments, data.academic.assignments);
  writeJSON(STORAGE_KEYS.academicExams, data.academic.exams);
  writeJSON(STORAGE_KEYS.academicAttendance, data.academic.attendance);
  writeJSON(STORAGE_KEYS.academicResults, data.academic.results);
  writeJSON(STORAGE_KEYS.expense, {
    records: data.expenses,
    monthlyBudget: data.monthlyBudget,
    budgetHistory: data.budgetHistory,
  });
  writeJSON(STORAGE_KEYS.expenseRecords, data.expenses);
  writeJSON(STORAGE_KEYS.expenseCategories, data.admin.categories);
  writeJSON(STORAGE_KEYS.budget, data.monthlyBudget);
  writeJSON(STORAGE_KEYS.hostel, {
    applications: data.hostelApplications,
    fees: data.hostelFees,
    rooms: data.admin.rooms,
    allocations: data.admin.allocations,
  });
  writeJSON(STORAGE_KEYS.hostelApplications, data.hostelApplications);
  writeJSON(STORAGE_KEYS.hostelFees, data.hostelFees);
  writeJSON(STORAGE_KEYS.hostelRooms, data.admin.rooms);
  writeJSON(STORAGE_KEYS.hostelAllocations, data.admin.allocations);
  writeJSON(STORAGE_KEYS.complaints, data.complaints);
  writeJSON(STORAGE_KEYS.complaintList, data.complaints);
  writeJSON(STORAGE_KEYS.notifications, data.notifications);
  writeJSON(STORAGE_KEYS.copilot, data.copilotMessages);
  writeJSON(STORAGE_KEYS.settings, data.settings);
  writeJSON(STORAGE_KEYS.copilotSettings, data.settings.aiSettings);
  writeJSON(STORAGE_KEYS.activity, data.activity);
  return data;
};
export const getAdminData = (data) => normalizeAdminData(data?.admin);
export const updateAdminData = (data, update) => {
  const current = getAdminData(data);
  const admin = typeof update === "function" ? update(current) : update;
  return { ...data, admin: normalizeAdminData(admin) };
};
