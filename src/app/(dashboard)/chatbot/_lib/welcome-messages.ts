// User Profile Interface for Welcome Messages
export interface UserProfile {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  currencyPreference: string;
  timezone: string;
  language: string;
  createdAt: string;
}

// Define 20 welcome questions covering all modules with 3 suggestions each
export const WELCOME_QUESTIONS = [
  // Budgets Module (4 questions)
  { id: 1, category: "budgets", question: "I'm your personal financial assistant. I've been reviewing your budget allocations and noticed you have some active budgets set up for this month.\n\nWant to optimize your monthly budget allocation?", suggestions: ["Show my current budgets", "Analyze my spending vs budget", "Suggest budget adjustments"] },
  { id: 2, category: "budgets", question: "I'm your personal financial assistant. I've been tracking your budget performance and see how you're managing your monthly limits.\n\nNeed help tracking your budget performance?", suggestions: ["View budget progress", "Compare budget to actual spending", "Alert me on budget overruns"] },
  { id: 3, category: "budgets", question: "I'm your personal financial assistant. I've analyzed your spending categories and can see opportunities to refine your budget structure.\n\nLooking to create or adjust budget categories?", suggestions: ["Suggest budget categories", "Review my category breakdown", "Help me set realistic budgets"] },
  { id: 4, category: "budgets", question: "I'm your personal financial assistant. I've been monitoring your budget utilization across all your spending categories.\n\nWant insights on your budget utilization?", suggestions: ["Show underutilized budgets", "Identify overspending areas", "Optimize budget allocation"] },
  // Dashboard Module (4 questions)
  { id: 5, category: "dashboard", question: "I'm your personal financial assistant. I've compiled a comprehensive view of your finances including income, expenses, and savings.\n\nCurious about your overall financial health?", suggestions: ["Show financial summary", "View income vs expenses", "Analyze my savings rate"] },
  { id: 6, category: "dashboard", question: "I'm your personal financial assistant. I've pulled together your latest financial activity and account status.\n\nWant a quick overview of your finances?", suggestions: ["Show dashboard summary", "View recent activity", "Check account balance trends"] },
  { id: 7, category: "dashboard", question: "I'm your personal financial assistant. I've analyzed your financial dashboard data to identify patterns and trends.\n\nNeed insights from your financial dashboard?", suggestions: ["Analyze spending patterns", "Show category breakdown", "View monthly trends"] },
  { id: 8, category: "dashboard", question: "I'm your personal financial assistant. I've compared your current month's performance to previous periods.\n\nWant to review your financial progress?", suggestions: ["Show progress overview", "Compare to last month", "Highlight achievements"] },
  // Goals Module (4 questions)
  { id: 9, category: "goals", question: "I'm your personal financial assistant. I've checked on your savings goals and can see how close you are to reaching your targets.\n\nHow are your savings goals progressing?", suggestions: ["Check goal progress", "Show completed goals", "Suggest goal contributions"] },
  { id: 10, category: "goals", question: "I'm your personal financial assistant. I've analyzed your goal timelines and contribution patterns to see if you're on track.\n\nWant to accelerate your financial goals?", suggestions: ["Analyze goal feasibility", "Suggest contribution amounts", "Show goal timeline"] },
  { id: 11, category: "goals", question: "I'm your personal financial assistant. I've reviewed your current savings strategy and identified potential improvements.\n\nNeed help planning your savings strategy?", suggestions: ["Review my goals", "Prioritize goal funding", "Create new goal plan"] },
  { id: 12, category: "goals", question: "I'm your personal financial assistant. I've compiled statistics on your goal achievements and upcoming milestones.\n\nCurious about your goal achievement status?", suggestions: ["Show goal statistics", "Track goal milestones", "View projected completion"] },
  // Transactions Module (4 questions)
  { id: 13, category: "transactions", question: "I'm your personal financial assistant. I've reviewed your recent transaction history and identified your spending patterns.\n\nWant to review your recent spending?", suggestions: ["Show recent transactions", "Analyze spending patterns", "Identify unusual expenses"] },
  { id: 14, category: "transactions", question: "I'm your personal financial assistant. I've analyzed your transaction history across all categories and time periods.\n\nNeed insights on your transaction history?", suggestions: ["View transaction summary", "Categorize recent expenses", "Show spending by category"] },
  { id: 15, category: "transactions", question: "I'm your personal financial assistant. I've looked at your recurring expenses and identified areas where you could optimize.\n\nLooking to optimize your spending habits?", suggestions: ["Analyze top expenses", "Find recurring charges", "Suggest cost savings"] },
  { id: 16, category: "transactions", question: "I'm your personal financial assistant. I've tracked your daily spending patterns and compared them to your monthly averages.\n\nWant to track your daily spending patterns?", suggestions: ["Show daily spending", "Compare to monthly average", "Alert on high spending days"] },
  // Family Module (4 questions)
  { id: 17, category: "family", question: "I'm your personal financial assistant. I've reviewed your family's shared financial activities and collaborative goals.\n\nHow is your family's financial collaboration going?", suggestions: ["Show family transactions", "View shared goals progress", "Check family budget status"] },
  { id: 18, category: "family", question: "I'm your personal financial assistant. I've analyzed your family's combined spending and goal contributions.\n\nWant to coordinate finances with your family?", suggestions: ["Show family members activity", "Review shared expenses", "Suggest family savings plan"] },
  { id: 19, category: "family", question: "I'm your personal financial assistant. I've checked on your family's shared goals and individual contributions toward them.\n\nNeed insights on family financial goals?", suggestions: ["Show family goals progress", "Analyze family spending", "Track contributions by member"] },
  { id: 20, category: "family", question: "I'm your personal financial assistant. I've reviewed your family's budget performance and shared spending habits.\n\nCurious about your family budget performance?", suggestions: ["Review family budgets", "Show shared budget usage", "Suggest family optimizations"] }
];

// Generate random welcome message with suggestions using full user profile
export const generateWelcomeMessage = (userProfile?: UserProfile): { category: string; question: string; suggestions: string[]; userProfile?: UserProfile } => {
  const firstName = userProfile?.fullName?.split(' ')[0] || 'there';
  const randomIndex = Math.floor(Math.random() * WELCOME_QUESTIONS.length);
  const selected = WELCOME_QUESTIONS[randomIndex];
  
  return {
    category: selected.category,
    question: `Hello ${firstName}! 👋\n\n${selected.question}`,
    suggestions: selected.suggestions,
    userProfile
  };
};

// Get user display name from profile
export const getUserDisplayName = (userProfile?: UserProfile): string => {
  return userProfile?.fullName?.split(' ')[0] || 'there';
};

// Get user avatar URL from profile
export const getUserAvatarUrl = (userProfile?: UserProfile): string | null => {
  return userProfile?.avatarUrl || null;
};

// Format welcome message with user context
export const formatWelcomeWithContext = (
  userProfile?: UserProfile,
  financialContext?: { summary?: { totalBalance?: number; monthlyIncome?: number; monthlyExpenses?: number } }
): string => {
  const firstName = getUserDisplayName(userProfile);
  const currency = userProfile?.currencyPreference || 'PHP';
  
  let greeting = `Hello ${firstName}! 👋\n\n`;
  greeting += `I'm your personal financial assistant.`;
  
  if (financialContext?.summary) {
    const { totalBalance, monthlyIncome, monthlyExpenses } = financialContext.summary;
    if (totalBalance !== undefined) {
      greeting += ` I can see you have a total balance of ${currency === 'PHP' ? '₱' : '$'}${totalBalance.toLocaleString()}.`;
    }
    if (monthlyExpenses !== undefined && monthlyIncome !== undefined) {
      const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : '0';
      greeting += ` Your current savings rate is ${savingsRate}%.`;
    }
  }
  
  greeting += `\n\nHow can I help you manage your finances today?`;
  
  return greeting;
};
