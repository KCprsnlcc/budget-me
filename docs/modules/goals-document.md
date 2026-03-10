# Goals Page Documentation

## Overview
The goals page (`src/app/(dashboard)/goals/page.tsx`) provides comprehensive financial goal management with creation, tracking, contribution, and collaboration features. It includes advanced filtering, progress visualization, and family goal support with role-based permissions.

## Main Page Components

### 1. Page Header
**Component**: Header Section with Controls
**Function**:
- Displays page title "Financial Goals" with descriptive subtitle
- View mode toggle (Table/Grid view)
- Export dropdown with PDF and CSV options
- Create Goal button for adding new goals
- Responsive design with mobile/desktop layouts

### 2. Summary Statistics Cards
**Component**: Summary Cards Grid (3 Cards)
**Function**:
- **Active Goals**: Shows count of active goals with trend indicators
- **Total Saved**: Displays total amount saved across all goals
- **Monthly Contributions**: Shows monthly contribution amounts
- **Completed Goals**: Count of completed goals (4th card in data)
- Hover effects and visual indicators
- Empty state handling with "No data yet" messaging

### 3. Charts Section
**Component**: Dual Chart Layout with Mobile Tabs
**Function**:
- **Mobile Tab System**: Overview and Health tabs for mobile navigation
- **Savings Progress Chart**: 6-month target vs saved visualization with interactive bars
- **Goal Health Chart**: Donut chart showing completion status distribution
- **Interactive Tooltips**: Hover effects showing detailed amounts
- **Responsive Design**: Adaptive charts for different screen sizes
- **Empty States**: Helpful messaging and call-to-action buttons

### 4. Overall Goal Progress
**Component**: Global Progress Indicator
**Function**:
- Shows aggregate progress across all goals
- Visual progress bar with percentage completion
- Status indicators (On Track, Good Progress, Needs Attention)
- Remaining amount calculations

### 5. Advanced Filtering System
**Component**: Multi-Filter Interface
**Function**:
- **Search Bar**: Real-time goal search by name
- **Month Filter**: Filter by specific months
- **Year Filter**: Filter by year (last 5 years)
- **Priority Filter**: Filter by priority level (High, Medium, Low)
- **Status Filter**: Filter by completion status
- **Reset Options**: Current month and all-time reset buttons
- **Responsive Layout**: Mobile-optimized filter arrangement

### 6. Goal Display Views
**Component**: Dual View System
**Function**:

#### Table View:
- Sortable columns (Name, Category, Target, Current, Progress, Status, Deadline, Actions)
- Progress bars with visual indicators
- Action buttons (View, Edit, Delete) with permission controls
- Responsive table with mobile adaptations

#### Grid View:
- **Desktop Grid**: 2-3 column responsive layout
- **Mobile Grid**: Single column stacked layout
- **Goal Cards**: Comprehensive goal information cards
- **Contributor Avatars**: Display of goal contributors with counts
- **Interactive Elements**: Hover effects and action buttons

### 7. Goal Cards
**Component**: Interactive Goal Cards
**Function**:
- **Goal Information**: Name, priority, category, and family status
- **Progress Visualization**: Progress bars with percentage completion
- **Status Indicators**: Color-coded status (Completed, In Progress, Behind, Overdue)
- **Contributor Display**: Avatar display for goal contributors
- **Action Buttons**: View, Edit, Delete, and Contribute actions
- **Permission Controls**: Role-based button visibility
- **Deadline Display**: Due date with completion status

### 8. Pagination System
**Component**: Advanced Pagination Controls
**Function**:
- Page navigation with numbered buttons
- Items per page selector (10, 25, 50, 100, All)
- Total count and range display
- Previous/Next navigation
- Responsive design with mobile adaptations

## Modal Components

### 1. Add Goal Modal
**File**: `add-goal-modal.tsx`
**Function**:
- Multi-step goal creation process
- Category selection with visual icons
- Target amount and deadline configuration
- Priority level selection
- Family goal toggle with eligibility checking
- Monthly contribution settings

### 2. View Goal Modal
**File**: `view-goal-modal.tsx`
**Function**:
- Complete goal information display
- Progress visualization with detailed metrics
- Contributor information and history
- Action buttons for Edit, Contribute, and Delete
- Responsive design with mobile optimization

### 3. Edit Goal Modal
**File**: `edit-goal-modal.tsx`
**Function**:
- Pre-populated form with existing goal data
- Same multi-step process as creation
- Change detection and validation
- Permission-based editing controls

### 4. Delete Goal Modal
**File**: `delete-goal-modal.tsx`
**Function**:
- Goal details confirmation display
- Impact assessment and warnings
- Irreversible action confirmation
- Permission validation before deletion

### 5. Contribute Goal Modal
**File**: `contribute-goal-modal.tsx`
**Function**:
- Contribution amount input
- Goal progress preview after contribution
- Account selection for contribution source
- Contribution history display

## Key Features

### Goal Management
- **Creation**: Multi-step goal creation with category selection
- **Progress Tracking**: Real-time progress monitoring with visual indicators
- **Contribution System**: Individual and family member contributions
- **Status Management**: Automatic status calculation (In Progress, Behind, Overdue, Completed)
- **Priority Levels**: High, Medium, Low priority classification

### Family Integration
- **Family Goals**: Shared goals with family member collaboration
- **Role-based Permissions**: Owner, Admin, Member, Viewer access controls
- **Contributor Tracking**: Display of all goal contributors with avatars
- **Permission System**: View, edit, delete, and contribute permissions

### Data Visualization
- **Progress Charts**: 6-month savings progress visualization
- **Health Monitoring**: Goal completion status distribution
- **Interactive Elements**: Hover tooltips and clickable chart elements
- **Responsive Charts**: Mobile-optimized chart display

### Export and Reporting
- **PDF Export**: Formatted goal reports with progress charts
- **CSV Export**: Raw data export for external analysis
- **Filtering Integration**: Export filtered datasets
- **Summary Statistics**: Comprehensive goal analytics

## Data Integration

### Hooks and Services
- `useGoals()`: Main goal data management hook
- `useFamily()`: Family context for permissions and collaboration
- `useAuth()`: User authentication and identification
- `goal-service.ts`: Core goal CRUD operations
- `fetchGoalContributors()`: Contributor data retrieval

### State Management
- **Goal State**: Goal data with filtering and pagination
- **Modal State**: Controls for various modal dialogs
- **Permission State**: Role-based permission calculations
- **Contributor State**: Goal contributor information
- **Filter State**: Advanced filtering parameters

## Permission System

### Role-based Access
- **View**: All users can view goals they have access to
- **Edit**: Goal owners and family admins can edit goals
- **Delete**: Goal owners and family owners can delete goals
- **Contribute**: Family members can contribute to family goals

### Permission Functions
- `canEditGoal()`: Determines edit permissions
- `canDeleteGoal()`: Determines delete permissions
- `getGoalPermissions()`: Comprehensive permission calculation

## Performance Features

### Optimization
- **Memoized Components**: Optimized re-rendering with React.memo
- **Lazy Loading**: Efficient data loading with pagination
- **Skeleton States**: Smooth loading experience
- **Debounced Search**: Optimized search performance
- **Contributor Caching**: Efficient contributor data management

### Responsive Design
- **Mobile-first Approach**: Optimized for mobile goal management
- **Adaptive Layouts**: Responsive grid and chart layouts
- **Touch Interactions**: Mobile-friendly interface elements
- **Progressive Enhancement**: Enhanced features when available

## Security Features

### Data Protection
- **Permission Validation**: Server-side permission checking
- **User Authentication**: Secure user identification
- **Family Verification**: Family membership validation
- **Data Isolation**: User-specific goal access

### Input Validation
- **Form Validation**: Real-time form validation
- **Amount Validation**: Positive number validation for targets and contributions
- **Date Validation**: Deadline validation and constraints
- **Permission Checks**: Action permission validation

## Navigation Integration
The page integrates with:
- `/dashboard` - Return to main dashboard with goal overview
- `/family` - Family management for shared goals
- `/transactions` - Transaction data for goal contributions
- Account management for contribution sources

## Goal Lifecycle Management
- **Creation**: Multi-step guided goal creation
- **Tracking**: Real-time progress monitoring
- **Contribution**: Individual and collaborative contributions
- **Completion**: Automatic completion detection
- **Management**: Ongoing goal maintenance and updates

## Visual Design Features
- **Goal Icons**: Category-specific icons (Flag, Home, GraduationCap, Plane, Car, etc.)
- **Color Coding**: Status-based color schemes
- **Progress Indicators**: Visual progress bars and percentages
- **Interactive Elements**: Hover effects and smooth transitions
- **Responsive Typography**: Adaptive text sizing for different devices