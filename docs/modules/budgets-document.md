# Budgets Page Documentation

## Overview
The budgets page (`src/app/(dashboard)/budgets/page.tsx`) provides comprehensive budget management functionality with tracking, visualization, and CRUD operations. It includes multiple modal components for different budget operations and real-time spending analysis.

## Main Page Components

### 1. Page Header
**Component**: Header Section
**Function**:
- Displays page title "Budgets" with descriptive subtitle
- Shows total budget count and management context
- Provides "Create Budget" button for quick access
- View mode toggle (Table/Grid) for different display preferences
- Export dropdown with PDF and CSV options

### 2. Summary Statistics Cards
**Component**: Summary Grid (3 cards)
**Function**:
- **Total Budgets**: Shows count of active budgets with status breakdown
- **Total Allocated**: Displays sum of all budget amounts with trend indicators
- **Total Spent**: Shows current spending across all budgets with percentage of allocation
- **Overall Progress**: Visual progress indicator for budget utilization

### 3. Charts Section
**Component**: Dual Chart Layout
**Function**:
- **Budget vs Spent Chart**: 6-month comparison showing budget limits vs actual spending
- **Category Allocation**: Donut chart displaying budget distribution by expense category
- Interactive hover tooltips with detailed spending information
- Mobile-responsive with tab switching for smaller screens
- Real-time data updates reflecting current spending

### 4. Overall Progress Indicator
**Component**: Global Budget Progress Bar
**Function**:
- Shows aggregate spending across all active budgets
- Visual progress bar with percentage completion
- Color-coded status (green: on track, yellow: caution, red: over budget)
- Remaining budget amount display

### 5. Filters and Search
**Component**: Filter Bar
**Function**:
- **Date Filters**: Month and year selection for budget periods
- **Status Filter**: Active, Completed, Over Budget, or All budgets
- **Period Filter**: Weekly, Monthly, Quarterly, or Yearly budgets
- **Category Filter**: Filter by specific expense categories
- **Search Bar**: Text search across budget names and descriptions
- **Reset Filters**: Clear all applied filters with one click

### 6. Budget Display
**Component**: Table/Grid View
**Function**:
- **Table View**: Sortable columns with detailed budget information
- **Grid View**: Card-based layout showing budget progress visually
- **Progress Bars**: Visual spending progress for each budget
- **Status Indicators**: Color-coded budget health (On Track, Caution, At Risk)
- **Action Buttons**: View, Edit, Delete for each budget
- **Responsive Design**: Adapts to different screen sizes

### 7. Pagination Controls
**Component**: Pagination Bar
**Function**:
- Page size selection (10, 25, 50, 100 items)
- Previous/Next navigation with keyboard support
- Direct page number input
- Total count and current page indicators
- Efficient loading for large budget lists

## Modal Components

### 1. Add Budget Modal
**File**: `src/app/(dashboard)/budgets/_components/add-budget-modal.tsx`

**Components and Functions**:

#### Form Steps (3-Step Process)
- **Step 1 - Period Selection**: Choose budget frequency (Weekly, Monthly, Quarterly, Yearly)
- **Step 2 - Budget Details**: Name, amount, start/end dates, category selection
- **Step 3 - Review**: Final confirmation with all details displayed

#### Key Features
- **Multi-step Form**: Guided budget creation with progress indicator
- **Period Templates**: Pre-configured period options with automatic date calculation
- **Category Integration**: Links budgets to expense categories for tracking
- **Date Validation**: Ensures logical start and end date relationships
- **Amount Validation**: Prevents negative or invalid budget amounts
- **Real-time Preview**: Shows budget impact and allocation

#### Helper Functions
- `getLucideIcon()`: Maps category emoji to Lucide React icons
- `ReviewRow()`: Renders formatted review step detail rows
- **Form State Management**: Handles complex multi-step form state
- **Date Calculations**: Automatic end date calculation based on period

### 2. Edit Budget Modal
**File**: `src/app/(dashboard)/budgets/_components/edit-budget-modal.tsx`

**Components and Functions**:

#### Form Features
- **Pre-populated Form**: Loads existing budget data into editable form
- **Same Step Process**: Identical 3-step process with existing values
- **Change Detection**: Highlights modified fields during editing
- **Validation**: Ensures data integrity during updates
- **Spending Preservation**: Maintains spending history during edits

#### Key Functions
- `budgetToFormState()`: Converts budget object to editable form state
- **Impact Analysis**: Shows how changes affect current spending tracking
- **Period Adjustment**: Handles period changes with date recalculation
- **Category Reassignment**: Allows changing budget categories with validation

### 3. View Budget Modal
**File**: `src/app/(dashboard)/budgets/_components/view-budget-modal.tsx`

**Components and Functions**:

#### Display Features
- **Complete Budget Information**: All budget details in read-only format
- **Spending Breakdown**: Detailed spending analysis and transaction history
- **Progress Visualization**: Visual progress bars and percentage indicators
- **Category Details**: Shows linked expense category with icon
- **Period Information**: Displays budget period with start/end dates
- **Health Status**: Color-coded budget health indicators

#### Key Functions
- `DetailRow()`: Renders formatted detail display rows
- **Action Buttons**: Quick Edit and Delete actions
- **Spending History**: Shows recent transactions affecting the budget
- **Responsive Layout**: Adapts to different screen sizes

### 4. Delete Budget Modal
**File**: `src/app/(dashboard)/budgets/_components/delete-budget-modal.tsx`

**Components and Functions**:

#### Confirmation Features
- **Budget Summary**: Shows key budget details before deletion
- **Impact Warning**: Explains consequences of budget deletion
- **Spending Data Loss**: Warns about permanent loss of tracking data
- **Irreversible Action Warning**: Clear messaging about permanent deletion
- **Error Handling**: Displays deletion errors with retry options

#### Key Functions
- **Data Validation**: Confirms budget exists before deletion
- **Cascade Effects**: Explains impact on related transactions and reports
- **Error Recovery**: Handles deletion failures gracefully
- **Confirmation Process**: Two-step confirmation to prevent accidental deletion

## Data Integration

### Hooks and Services
- `useBudgets()`: Main data management hook for budget operations
- `budget-service.ts`: API calls for CRUD operations and analytics
- Real-time spending updates from transaction system
- Automatic budget period calculations and renewals

### State Management
- **Modal State**: Controls which modal is open and selected budget
- **Filter State**: Manages all filter and search parameters
- **Pagination State**: Handles page navigation and sizing
- **Chart State**: Manages chart interactions and hover states
- **Loading States**: Individual loading states for different operations

## Key Features

### Budget Health Tracking
- **Automatic Status Calculation**: Real-time budget health assessment
- **Threshold Warnings**: Configurable warning levels (75%, 90%, 100%)
- **Color-coded Indicators**: Visual health status across all interfaces
- **Trend Analysis**: Month-over-month budget performance tracking

### Spending Integration
- **Transaction Linking**: Automatic expense categorization to budgets
- **Real-time Updates**: Immediate budget updates when transactions are added
- **Historical Tracking**: Maintains spending history across budget periods
- **Rollover Handling**: Manages budget renewals and period transitions

### Responsive Design
- **Mobile-first Approach**: Optimized for mobile budget management
- **Touch-friendly Interfaces**: Large touch targets and swipe gestures
- **Adaptive Charts**: Charts that work well on small screens
- **Collapsible Sections**: Efficient use of screen real estate

### Performance Optimizations
- **Memoized Components**: Prevents unnecessary re-renders
- **Lazy Loading**: Efficient loading of large budget lists
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Skeleton Loading**: Smooth loading states for all components

### Export and Reporting
- **CSV Export**: Detailed budget data export for external analysis
- **PDF Reports**: Formatted budget reports with charts and summaries
- **Print Functionality**: Direct printing of budget information
- **Filtered Exports**: Export only filtered/searched budget data

## Navigation Integration
The page integrates with:
- `/dashboard` - Return to main dashboard with budget overview
- `/transactions` - Transaction management for budget tracking
- `/categories` - Category management for budget organization
- `/reports` - Detailed budget analysis and reporting

## Budget Lifecycle Management
- **Creation**: Guided multi-step budget creation process
- **Tracking**: Real-time spending monitoring and alerts
- **Renewal**: Automatic budget period renewals
- **Archival**: Historical budget data preservation
- **Analysis**: Performance tracking and trend analysis