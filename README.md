<div align="center">
<br />

<a href="https://budgetme.vercel.app/" target="_blank">
<img src="https://raw.githubusercontent.com/KCprsnlcc/budget-me/refs/heads/master/public/dashboard-preview.png" alt="BudgetMe Dashboard Preview">
</a>

<br />

<div>
<img src="https://img.shields.io/badge/-Next.js-black?style=for-the-badge&logo=next.js&logoColor=white&color=000000" alt="Next.js" />
<img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logo=react&logoColor=white&color=61DAFB" alt="React" />
<img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logo=typescript&logoColor=white&color=3178C6" alt="TypeScript" />
<img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logo=tailwindcss&logoColor=white&color=06B6D4" alt="Tailwind CSS" />
<img src="https://img.shields.io/badge/-Supabase-black?style=for-the-badge&logo=supabase&logoColor=white&color=3ECF8E" alt="Supabase" />
</div>

<h3 align="center">
<img src="https://raw.githubusercontent.com/KCprsnlcc/budget-me/refs/heads/master/public/logos/dark-no-bg-logo-2.svg" width="200">
</h3>

<div align="center">
BudgetMe is a professional financial management platform that brings clarity and control to your finances. Built for individuals and families, it combines intuitive expense tracking, smart budgeting, and AI-powered insights to help you build wealth and achieve your financial goals. With a clean, modern interface and powerful analytics, BudgetMe transforms complex financial data into actionable insights that drive better financial decisions.
</div>

<br/>

``` Currently in Active Development! ```

<br/>

</div>

## Tech Stack

| Development | UI & Styling | AI & Analytics | Backend & Auth |
|----------------|------------------|-------------------|-------------------|
| Next.js 16     | Tailwind CSS v4  | OpenAI GPT        | Supabase          |
| React 19       | Radix UI         | Custom AI Models  | PostgreSQL        |
| TypeScript     | Lucide Icons     | Predictive Analytics | Row Level Security |
| Vercel         | Framer Motion    | Pattern Recognition | Real-time Subscriptions |

## Key Features

### **Smart Financial Management**
- **Expense Tracking**: Automatic categorization with receipt scanning
- **Budget Planning**: Flexible budgets with smart alerts and rollover
- **Goal Setting**: Visual progress tracking with timeline projections
- **Family Finance**: Collaborative budgeting with privacy controls

### **AI-Powered Insights**
- **BudgetSense AI**: Natural language financial assistant
- **Predictive Analytics**: Spending forecasts and anomaly detection
- **Pattern Recognition**: Automatic subscription detection
- **Smart Recommendations**: Personalized savings opportunities

### **Advanced Analytics**
- **Real-time Dashboard**: Comprehensive financial overview
- **Interactive Reports**: Exportable charts and summaries
- **Trend Analysis**: Historical spending patterns
- **Performance Metrics**: Goal achievement tracking

### **Enterprise Security**
- **Bank-Level Encryption**: 256-bit end-to-end security
- **Privacy Controls**: Granular data sharing permissions
- **Secure Authentication**: Multi-factor authentication support
- **Data Protection**: GDPR compliant with data export options

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/kcprsnlcc/budget-me.git
cd budget-me
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

4. **Configure your environment:**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key

# Timezone Configuration
NEXT_PUBLIC_TIMEZONE=Asia/Manila
TZ=Asia/Manila
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to `http://localhost:3000`

## Platform Modules

### Core Modules
- **Dashboard Hub**: Unified financial command center
- **Transaction Manager**: Advanced transaction ledger with smart categorization
- **Budget Planner**: Visual budget creation with progress tracking
- **Goal Tracker**: Milestone-based savings goal management

### Intelligence Modules  
- **AI Predictions**: Machine learning-powered financial forecasting
- **BudgetSense AI**: Conversational AI financial assistant
- **Analytics Engine**: Advanced reporting and trend analysis

### Collaboration Modules
- **Family Finance**: Multi-user household budget management
- **Shared Goals**: Collaborative savings targets
- **Privacy Controls**: Granular permission management

## Design System

BudgetMe uses a refined design system built on:
- **Color Palette**: Emerald-focused with professional grays
- **Typography**: Inter font family for optimal readability  
- **Components**: Radix UI primitives with custom styling
- **Animations**: Smooth micro-interactions with Framer Motion
- **Responsive**: Mobile-first design with desktop optimization

## Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:generate  # Generate Supabase types
npm run db:push      # Push schema changes
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentication routes
│   ├── admin/          # Admin dashboard
│   ├── dashboard/      # User dashboard
│   └── api/            # API routes
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── shared/        # Shared components
│   └── modules/       # Feature-specific components
├── lib/               # Utilities and configurations
│   ├── supabase/      # Database client
│   ├── ai/            # AI service integrations
│   └── utils/         # Helper functions
└── types/             # TypeScript definitions
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- Powered by [Supabase](https://supabase.com/) for backend services
- AI capabilities provided by [OpenAI](https://openai.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**Designed and Developed with care for Financial Clarity**

[Live Demo](https://budgetme.site/) • [Documentation](https://docs.budgetme.app/) • [Support](mailto:support@budgetme.site@gmail.com)

</div>