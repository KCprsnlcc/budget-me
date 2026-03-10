# Transactions Page Documentation

## Overview
The transactions page (`src/app/(dashboard)/transactions/page.tsx`) provides comprehensive transaction management functionality with filtering, visualization, and CRUD operations. It includes multiple modal components for different transaction operations.

## Main Page Components

### 1. Page Header
**Component**: Header Section
**Function**:
- Displays page title "Transactions" with subtitle
- Shows total transaction count
- Provides "Add Transaction" button for quick access

### 2. Summary Statistics Cards
**Component**: Summary Grid (4 cards)
**Function**:
- **Monthly Income**: Shows current month income with percentage change
- **Monthly Expenses**: Displays current month expenses with trend indicator
- **Net Balance**: Calculates income minus expenses for the period
- **Savings Rate**: Shows percentage of income saved with visual indicators

### 3. Charts Section
**Component**: Dual Chart Layout
**Function**:
- **Income vs Expenses Chart**: 6-month bar chart comparison with hover tooltips
- **Category Breakdown**: Donut chart showing expense distribution by category
- Mobile-responsive with tab switching for smaller screens
- Interactive hover states and data visualization

### 4. Filters and Search
**Component**: Filter Bar
**Function**:
- **Date Filters**: Month and year selection dropdowns
- **Type Filter**: Income, Expense, or All transactions
- **Category Filter**: Filter by specific expense/income categories
- **Search Bar**: Text search across transaction descriptions
- **Reset Filters**: Clear all applied filters
- **View Toggle**: Switch between table and grid view modes

### 5. Export Functionality
**Component**: Export Dropdown
**Function**:
- **CSV Export**: Download transactions as CSV file
- **PDF Export**: Generate PDF report of transactions
- **Print**: Direct print functionality
- Includes filtered data export capabilities

### 6. Transaction Display
**Component**: Table/Grid View
**Function**:
- **Table View**: Sortable columns with transaction details
- **Grid View**: Card-based layout for mobile-friendly browsing
- **Pagination**: Page size selection and navigation controls
- **Action Buttons**: View, Edit, Delete for each transaction
- **Responsive Design**: Adapts to different screen sizes

### 7. Pagination Controls
**Component**: Pagination Bar
**Function**:
- Page size selection (10, 25, 50, 100 items)
- Previous/Next navigation
- Direct page number input
- Total count and current page indicators

## Modal Components

### 1. Add Transaction Modal
**File**: `src/app/(dashboard)/transactions/_components/add-transaction-modal.tsx`

**Components and Functions**:

#### Form Steps
- **Step 1 - Transaction Type**: Select Income or Expense
- **Step 2 - Basic Details**: Amount, description, date input
- **Step 3 - Category Selection**: Choose from available categories
- **Step 4 - Account Selection**: Pick source/destination account
- **Step 5 - Budget/Goal Assignment**: Optional budget or goal linking
- **Step 6 - Review**: Final confirmation before submission

#### Key Features
- **Multi-step Form**: Guided transaction creation process
- **Real-time Validation**: Form validation with error messages
- **Category Icons**: Visual category selection with Lucide icons
- **Account Balance Display**: Shows current account balances
- **Budget Impact Preview**: Shows how transaction affects budgets
- **Goal Progress Update**: Displays goal contribution impact

#### Helper Functions
- `getLucideIcon()`: Maps emoji to Lucide React icons
- `getAccountIcon()`: Returns appropriate account type icon
- `getBudgetIcon()`: Gets category-specific budget icons
- `ReviewRow()`: Renders review step detail rows

### 2. Edit Transaction Modal
**File**: `src/app/(dashboard)/transactions/_components/edit-transaction-modal.tsx`

**Components and Functions**:

#### Form Features
- **Pre-populated Form**: Loads existing transaction data
- **Same Step Process**: Identical to add modal but with existing values
- **Change Detection**: Highlights modified fields
- **Validation**: Ensures data integrity during updates

#### Key Functions
- `txToFormState()`: Converts transaction to editable form state
- **Form State Management**: Handles complex form state updates
- **Account Balance Recalculation**: Updates balances based on changes
- **Budget/Goal Adjustments**: Handles reassignment of transactions

### 3. View Transaction Modal
**File**: `src/app/(dashboard)/transactions/_components/view-transaction-modal.tsx`

**Components and Functions**:

#### Display Features
- **Read-only Transaction Details**: Complete transaction information
- **Account Information**: Shows account name and masked numbers
- **Category Display**: Visual category with icon and name
- **Budget/Goal Links**: Shows associated budget or goal progress
- **Transaction History**: Related transaction information

#### Key Functions
- `DetailRow()`: Renders formatted detail rows
- **Action Buttons**: Edit and Delete quick actions
- **Responsive Layout**: Adapts to different screen sizes

### 4. Delete Transaction Modal
**File**: `src/app/(dashboard)/transactions/_components/delete-transaction-modal.tsx`

**Components and Functions**:

#### Confirmation Features
- **Transaction Summary**: Shows key transaction details
- **Impact Preview**: Displays account balance after deletion
- **Budget Restoration Notice**: Shows budget amount to be restored
- **Goal Progress Update**: Indicates goal progress changes
- **Irreversible Warning**: Clear warning about permanent deletion

#### Key Functions
- **Balance Calculation**: Shows current and post-deletion balance
- **Budget Impact**: Calculates budget restoration amounts
- **Goal Impact**: Shows goal progress adjustments
- **Error Handling**: Displays deletion errors with retry options

## Data Integration

### Hooks and Services
- `useTransactions()`: Main data management hook
- `transaction-service.ts`: API calls for CRUD operations
- Real-time data updates across all components
- Optimistic UI updates for better user experience

### State Management
- **Modal State**: Controls which modal is open
- **Selected Transaction**: Tracks currently selected transaction
- **Filter State**: Manages all filter and search parameters
- **Pagination State**: Handles page navigation and sizing
- **Loading States**: Individual loading states for different operations

## Key Features

### Responsive Design
- Mobile-first approach with adaptive layouts
- Touch-friendly interfaces for mobile devices
- Collapsible sections for smaller screens
- Optimized chart viewing on mobile

### Performance Optimizations
- Memoized components to prevent unnecessary re-renders
- Lazy loading for large transaction lists
- Efficient pagination to handle large datasets
- Skeleton loading states for better perceived performance

### User Experience
- **Guided Workflows**: Step-by-step transaction creation
- **Visual Feedback**: Loading states, success messages, error handling
- **Keyboard Navigation**: Full keyboard accessibility
- **Contextual Actions**: Quick access to relevant operations

### Data Validation
- **Form Validation**: Real-time validation with helpful error messages
- **Business Logic**: Prevents invalid transactions (negative balances, etc.)
- **Data Integrity**: Ensures consistent data across budget and goal systems

## Navigation Integration
The page integrates with:
- `/dashboard` - Return to main dashboard
- `/budgets` - Budget management for transaction categorization
- `/goals` - Goal tracking for savings transactions
- `/accounts` - Account management for transaction sources