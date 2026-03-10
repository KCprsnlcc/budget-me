# Dashboard Page Documentation

## Overview
The dashboard page (`src/app/(dashboard)/dashboard/page.tsx`) serves as the main financial overview interface for users. It provides a comprehensive view of financial data, insights, and key metrics in an organized, user-friendly layout.

## UI Components and Functions

### 1. Greeting Section
**Component**: Welcome Header
**Function**: 
- Displays personalized greeting based on time of day
- Shows user's name with welcoming message
- Provides contextual subtitle about financial status

### 2. Join Family Invitation
**Component**: Pending Invitations Card
**Function**:
- Shows latest family dashboard invitation
- Displays inviter's name, family name, and optional message
- Provides Accept/Decline action buttons
- Shows "No Pending Invitations" state when none exist

### 3. Financial Insights
**Component**: InsightCard Grid
**Function**:
- Displays AI-generated financial insights and recommendations
- Shows different insight types: success, warning, danger, info
- Expandable cards with detailed context messages
- Refresh functionality for real-time updates
- Color-coded visual indicators for insight severity

### 4. Total Balance
**Component**: StatCard (Wallet Icon)
**Function**:
- Shows current total balance across all accounts
- Displays percentage change from previous period
- Visual trend indicator (up/down arrow)
- Formatted currency display in PHP

### 5. Monthly Income
**Component**: StatCard (TrendingUp Icon)
**Function**:
- Displays total income for current month
- Shows percentage change from previous month
- Trend visualization with color coding
- Formatted currency display

### 6. Monthly Expenses
**Component**: StatCard (CreditCard Icon)
**Function**:
- Shows total expenses for current month
- Percentage change indicator from previous month
- Visual trend representation
- Currency formatting in Philippine Peso

### 7. Savings Rate
**Component**: StatCard (PiggyBank Icon)
**Function**:
- Calculates and displays savings rate percentage
- Shows change in savings rate over time
- Visual trend indicators
- Percentage-based display format

### 8. Income vs Expenses Chart
**Component**: Bar Chart with Hover Tooltips
**Function**:
- 6-month comparison visualization
- Interactive hover tooltips showing exact amounts
- Dual-bar representation (income vs expenses)
- Responsive design with mobile/desktop layouts
- Grid lines for better readability

### 9. Categories (Expense Breakdown)
**Component**: Donut Chart with Legend
**Function**:
- Visual breakdown of expenses by category
- Interactive donut chart with percentage display
- Color-coded category legend
- Total expense amount in center
- Scrollable category list for overflow

### 10. Spending Trends
**Component**: Trend Cards Grid
**Function**:
- Category-wise spending comparison
- Month-over-month change indicators
- Visual trend arrows (up/down/neutral)
- Color-coded change percentages
- Refresh functionality for updates

### 11. Budget Progress
**Component**: Progress Bars with Status
**Function**:
- Shows budget vs actual spending
- Progress bars with percentage completion
- Status indicators (On Track, Warning, Over Budget)
- Category icons for visual identification
- Color-coded progress visualization

### 12. Recent Transactions
**Component**: Transaction List
**Function**:
- Displays latest financial transactions
- Shows transaction details (amount, category, date)
- Account information display
- Scrollable list for multiple transactions
- Color-coded amounts (income vs expenses)

## Key Features

### Responsive Design
- Mobile-first approach with responsive breakpoints
- Tab-based navigation for mobile chart viewing
- Adaptive grid layouts for different screen sizes

### Loading States
- Skeleton loading animations for all components
- Individual component refresh capabilities
- Smooth transitions and animations

### Error Handling
- Graceful error states with retry functionality
- Empty state messaging with actionable buttons
- User-friendly error messages

### Interactive Elements
- Hover effects on charts and cards
- Expandable insight cards
- Clickable navigation to detailed pages
- Real-time data refresh capabilities

## Data Integration
The dashboard integrates with the `useDashboard` hook which provides:
- Real-time financial data
- Loading states management
- Error handling
- Refresh functionality
- Family invitation management

## Onboarding Modal Component

### 13. Account Setup Onboarding
**Component**: OnboardingModal (`src/app/(dashboard)/_components/onboarding-modal.tsx`)
**Function**:
- Multi-step guided account setup process
- 4-step wizard for new user onboarding
- Responsive design with mobile/desktop layouts

#### Step 1: Welcome & Introduction
- Welcome message with app overview
- Feature highlights and benefits
- Continue/Skip options

#### Step 2: Personal Information
- Full name input with validation
- Email address field (pre-filled from auth)
- Form validation and error handling
- Real-time input validation

#### Step 3: Account Creation
- Account name input
- Account type selection (Savings, Checking, Credit Card, etc.)
- Color picker for account identification
- Initial balance input with currency formatting
- Default account toggle option
- Optional description field

#### Step 4: Review & Confirmation
- Summary of entered information
- Account details preview
- Final confirmation before creation
- Loading states during account creation

#### Key Features:
- **Progress Stepper**: Visual step indicator with completion status
- **Form Validation**: Real-time validation with error messages
- **Skip Functionality**: Option to postpone setup for 25 minutes
- **Responsive Design**: Mobile-first with desktop enhancements
- **Help Section**: Contact support integration
- **Skip Confirmation**: Modal dialog for skip confirmation
- **Loading States**: Spinner animations during submission
- **Error Handling**: Graceful error management with retry options

#### Modal Behavior:
- Appears for new users without accounts
- Reappears after 25 minutes if skipped
- Dismissible with confirmation dialog
- Prevents interaction with dashboard until completed or skipped
- Automatic redirect to dashboard after successful setup

## Navigation Integration
Components include navigation links to:
- `/transactions` - Transaction management
- `/budgets` - Budget creation and management
- Category-specific views and filters