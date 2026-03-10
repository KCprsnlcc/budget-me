# BudgetMe System Architecture

## User Layer
**Users:**
- BudgetMe System Administration
- Family Finance Administrators  
- Individual Financial Users

## Presentation Layer

### Frontend Framework:
- **React 19.2.3** (TypeScript)
- **Next.js 16.1.5** (App Router)

### UI and Styling:
- **Tailwind CSS v4** (Custom design system)
- **Lucide React** (Icon system)
- **Class Variance Authority** (Component variants)
- **Tailwind Merge** (Class merging utility)
- **Next Themes** (Theme management)
- **Lenis** (Smooth scrolling)

### UI Components:
- **Radix UI** (Progress components)
- **React Loading Skeleton** (Loading states)
- **Iconify React** (Additional icons)

### Data Visualization:
- **Custom Charts** (Built with SVG and Canvas)

### State Management:
- **React Context API** (Global state)
- **Custom Hooks** (Feature-specific state)

### Additional Frontend Libraries:
- **React Markdown** (Markdown rendering for AI responses)
- **Rehype Highlight** (Code syntax highlighting)
- **Remark GFM** (GitHub Flavored Markdown)
- **jsPDF** (PDF generation)
- **PapaParse** (CSV parsing and generation)
- **Date-fns** (Date manipulation)
- **Date-fns-tz** (Timezone handling)
- **Sonner** (Toast notifications)
- **Vercel Analytics** (Analytics integration)

## Application Logic Layer

### Dashboard Module:
- **Financial Overview**: Real-time financial summary and KPIs
- **Monthly Tracking**: Income/expense tracking with trend analysis
- **Spending Visualizations**: Interactive charts using Recharts/Highcharts
- **Transaction Feed**: Recent transactions with quick access
- **Financial Health**: Health indicators and goal progress overview
- **Family Invitations**: Pending family invitation management
- **AI Insights**: Financial insights and recommendations display
- **Onboarding System**: Multi-step account setup for new users

### Transactions Module:
- **CRUD Operations**: Create, read, update, delete transactions
- **Advanced Filtering**: Multi-dimensional filtering, sorting, and searching
- **Expense Distribution**: Category-based expense management
- **Trend Analysis**: Income vs expense trends and ratios
- **Financial Alerts**: Spending pattern and status recommendations
- **Multi-step Creation**: Guided transaction creation process (6 steps)
- **Account Integration**: Multi-account transaction management
- **Budget/Goal Linking**: Transaction assignment to budgets and goals
- **Export Generation**: PDF/Word/CSV export capabilities
- **Dual View System**: Table and grid view modes

### Budget Management Module:
- **Budget Creation**: Multi-step budget creation process (3 steps)
- **Category Integration**: Budget-to-category linking and tracking
- **Advanced Filtering**: Comprehensive filtering, sorting, and searching
- **Progress Tracking**: Real-time budget vs spending analysis
- **Health Monitoring**: Budget status alerts and recommendations
- **Period Management**: Weekly, Monthly, Quarterly, Yearly budgets
- **Spending Integration**: Real-time transaction-to-budget linking
- **Visual Progress**: Progress bars and health indicators
- **Export Generation**: PDF/Word/CSV export capabilities
- **Dual View System**: Table and grid view modes

### Goal Setting Module:
- **Goal Creation**: Financial goals with target amounts and deadlines
- **Progress Tracking**: Real-time goal progress monitoring
- **Contribution System**: Goal contribution with selection interface
- **Advanced Filtering**: Multi-dimensional filtering and searching
- **Health Alerts**: Goal progress recommendations and alerts
- **Family Goals**: Shared family goal support and collaboration
- **Contribution History**: Detailed contribution tracking
- **Savings Recommendations**: AI-powered goal saving suggestions
- **Export Generation**: PDF/CSV export capabilities
- **Visual Progress**: Progress bars and achievement indicators
- **Dual View System**: Table and grid view modes
- **Permission System**: Role-based goal management (view, edit, delete, contribute)

### AI-Powered Chatbot Module:
- **Multi-Model Support**: OpenRouter API integration for multiple AI models (GPT-4, Claude, etc.)
- **Content Filtering**: Finance-focused query filtering and validation
- **Authentication Required**: Full authentication required for access
- **Session Management**: Conversation history and persistence
- **Rich Interface**: Message bubbles with markdown rendering and code/table viewers
- **Finance Intelligence**: Comprehensive finance keyword detection
- **Model Selection**: Dynamic AI model switching mid-conversation
- **Export Options**: Chat history export (PDF/CSV)
- **Rate Limiting**: AI usage controls and monitoring
- **Admin Oversight**: Complete conversation monitoring and management

### AI Predictions & Analytics Module:
- **Exponential Smoothing**: Simple exponential smoothing for time series forecasting
- **Financial Forecasting**: Income, expense, and savings growth predictions
- **Confidence Intervals**: Prediction uncertainty quantification with visual representation
- **Category Analysis**: Individual predictions for each expense category
- **Expense Type Analysis**: Recurring vs Variable expense pattern recognition
- **Behavioral Insights**: Transaction pattern analysis and spending behavior
- **AI Financial Intelligence**: Deep AI analysis with risk assessment and growth potential
- **Anomaly Detection**: Unusual spending pattern identification and alerts
- **Savings Opportunities**: AI-identified cost reduction and optimization suggestions
- **Export Generation**: CSV and PDF export capabilities
- **User-Initiated**: Predictions generated only on user request
- **Rate Limiting**: AI usage controls to manage costs
- **History Tracking**: Complete prediction history with accuracy metrics
- **Interactive Charts**: Historical vs predicted data visualization with tooltips

### Family Finance Management Module:
- **Family Creation**: Multi-step family group creation and setup
- **Member Management**: Invitation system with role-based permissions (Owner, Admin, Member, Viewer)
- **Join System**: Browse and request to join existing families
- **Collaborative Budgeting**: Family budget monitoring and coordination
- **Shared Goals**: Family goal creation, tracking, and contribution system
- **Activity Feed**: Real-time family activity logging and timeline
- **Role Management**: Permission-based access control system
- **Privacy Controls**: Public/Private family visibility settings
- **Ownership Transfer**: Secure family ownership transfer system
- **Member Analytics**: Family member composition and activity tracking

### Financial Reports Module:
- **Dynamic Reports**: Real-time report generation with multiple chart types
- **Advanced Analytics**: Comprehensive financial analysis and insights
- **Anomaly Detection**: Automated unusual pattern identification
- **AI Insights**: AI-powered financial analysis and recommendations
- **Custom Timeframes**: Flexible date range and period selection
- **Multi-Chart Support**: Pie, Donut, Column, Bar, Line, Area charts
- **Category Analysis**: Detailed spending breakdown by category
- **Trend Analysis**: Long-term financial pattern visualization
- **Goal Progress**: Visual goal achievement tracking
- **Export Generation**: PDF/CSV export with charts and analysis

### User Settings Module:
- **Profile Management**: Personal information and preferences
- **Currency Preferences**: Multi-currency support and formatting
- **Account Management**: Financial account setup and management
- **Notification Settings**: Alert and notification preferences
- **Privacy Controls**: Data sharing and visibility settings

### Admin Portal Module:
- **Role-based Authentication**: Multi-level admin access control
- **User Management**: Comprehensive user administration system
- **System Analytics**: Platform-wide monitoring and statistics
- **Transaction Oversight**: Cross-user transaction management and creation
- **Budget Administration**: System-wide budget monitoring and creation
- **Goal Management**: Goal creation and administration across users
- **Family Supervision**: Family group management and oversight
- **AI Usage Management**: AI credit tracking and quota management (25 credits/day limit)
- **AI Predictions Management**: AI prediction generation and oversight
- **Chatbot Management**: Chat session monitoring and conversation oversight
- **Analytics Management**: User analytics and report oversight
- **System Settings**: Backup management and system health monitoring
- **Activity Logging**: Comprehensive admin activity tracking

## Database Layer

### Backend Infrastructure:
- **Supabase** (PostgreSQL-based Backend-as-a-Service)
- **Supabase SSR** (Server-side rendering support)
- **Supabase JS Client** (Database and auth client)

### Authentication System:
- **Supabase Auth** (User authentication and authorization)
- **JWT Tokens** (Secure session management)
- **Role-based Access** (User permission system)

### File Storage:
- **Supabase Storage** (File and document storage)
- **Secure Upload** (Protected file handling)

### Security Framework:
- **Row Level Security (RLS)** (Data access control)
- **Comprehensive Audit Logging** (Activity tracking)
- **Admin Activity Tracking** (Administrative oversight)
- **Data Encryption** (Secure data transmission and storage)
- **Secure Connections** (HTTPS/TLS encryption)

## External Integrations

### AI Services:
- **OpenRouter API** (Multi-model AI access)
- **Facebook Prophet** (Time series forecasting)
- **Python FastAPI** (ML model serving)
- **GPT Integration** (Financial intelligence analysis)

### Export Services:
- **jsPDF** (PDF generation)
- **PapaParse** (CSV parsing and export)
- **Native JavaScript** (Data processing)

## Architecture Patterns

### Component Architecture:
- **Modal-based Workflows** (Consistent user interactions)
- **Multi-step Processes** (Guided user experiences)
- **Dual View Systems** (Table/Grid display options)
- **Progressive Disclosure** (Mobile-optimized interfaces)

### Data Flow:
- **Real-time Updates** (Live data synchronization)
- **Optimistic UI** (Immediate user feedback)
- **Lazy Loading** (Performance optimization)
- **Skeleton Loading** (Enhanced perceived performance)

### Security Patterns:
- **Permission Validation** (Server-side authorization)
- **Data Isolation** (User-specific data access)
- **Audit Trails** (Comprehensive activity logging)
- **Rate Limiting** (AI usage controls)

### Performance Optimization:
- **Memoized Components** (Optimized re-rendering)
- **Efficient Pagination** (Large dataset handling)
- **Debounced Search** (Optimized search performance)
- **Background Processing** (Non-blocking operations)