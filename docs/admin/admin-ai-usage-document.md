# Admin AI Usage Management Documentation

## Overview
The admin AI usage module (`src/app/admin/ai-usage/page.tsx`) provides comprehensive AI feature usage monitoring and management capabilities for administrators. It allows viewing, tracking, resetting, and managing user AI credit consumption across the entire platform with advanced analytics, usage controls, and quota management functionality.

## UI Components and Functions

### 1. Header Section
**Component**: AI Usage Management Header
**Function**:
- Displays "AI Usage Management" title with description
- View mode toggle (Table/Grid view)
- Export dropdown with PDF and CSV options
- Real-time usage monitoring indicators
- Responsive design with mobile/desktop layouts

### 2. Summary Statistics Cards
**Component**: Summary Cards Grid (4 Cards)
**Function**:
- **Total Users**: Shows users with AI usage records and MoM growth
- **Daily Credits Used**: Combined credit consumption across all users with average per user
- **At Limit Users**: Count of users who have reached daily AI limits with percentage
- **Feature Usage**: Breakdown of AI feature utilization (Predictions, Insights, Chatbot)
- Hover effects and trend indicators (up/down arrows)
- Color-coded icons for visual distinction

### 3. AI Usage Trends Chart
**Component**: Interactive Bar Chart
**Function**:
- 7-day AI usage volume visualization with credit consumption
- Interactive hover tooltips showing exact usage counts
- Responsive bar heights based on data
- Grid lines for better readability
- Empty state handling with helpful messaging
- Mobile/desktop responsive design

### 4. Feature Usage Distribution Chart
**Component**: Donut Chart with Legend
**Function**:
- Visual breakdown of AI feature usage (Predictions, Insights, Chatbot)
- Color-coded segments with percentage display
- Interactive legend with feature names and usage percentages
- Center display showing total AI interactions
- Responsive design for mobile/desktop

### 5. High Usage Users Section
**Component**: User Usage Ranking List
**Function**:
- Displays users with highest AI credit consumption
- User avatars with usage statistics
- Credit count and feature breakdown per user
- Hover effects and responsive card layout
- UserAvatar component integration

### 6. Advanced Filtering System
**Component**: Multi-Filter Interface
**Function**:
- **Search Bar**: Real-time user and usage search
- **Date Range Filter**: Filter by usage dates
- **Usage Level Filter**: Filter by usage intensity (High, Normal, At Limit)
- **Feature Filter**: Filter by specific AI features used
- **Status Filter**: Filter by usage status and limits
- **Reset Options**: Current period and all-time reset buttons
- Responsive grid layout for mobile/desktop

### 7. AI Usage Display Views
**Component**: Dual View System
**Function**:

#### Table View:
- Sortable columns (User, Date, Total Used, Predictions, Insights, Chatbot, Status, Actions)
- User avatars and email display
- Usage progress bars with limit indicators
- Action buttons (View Details, Reset Usage, Delete Record)
- Responsive table with mobile adaptations

#### Grid View:
- Card-based layout for usage records
- User information with avatars
- Usage statistics and feature breakdown
- Status indicators and limit warnings
- Action buttons on each card
- Responsive grid (1/2/3 columns)

### 8. Usage Status Indicators
**Component**: Usage Visualization System
**Function**:
- **At Limit**: Red indicators for users who have reached 25/25 credits
- **High Usage**: Amber indicators for users with 16-24 credits used
- **Normal Usage**: Green indicators for users with 0-15 credits used
- **Progress Bars**: Visual representation of credit consumption
- **Feature Breakdown**: Individual counters for each AI feature

### 9. Pagination System
**Component**: Advanced Pagination Controls
**Function**:
- Page navigation with numbered buttons
- Items per page selector (10, 25, 50, 100, All)
- Total count and range display
- Previous/Next navigation
- Responsive design with mobile adaptations

### 10. Export Functionality
**Component**: Export Dropdown
**Function**:
- **PDF Export**: Formatted PDF with usage summaries and analytics
- **CSV Export**: Spreadsheet-compatible data export with detailed usage metrics
- Data formatting for export compatibility
- Error handling for empty datasets

## Modal Components

### 1. View AI Usage Modal
**Component**: ViewAdminAIUsageModal
**Function**:
- **2-Step Wizard**: Overview and Analysis views
- **Usage Overview**:
  - User profile display with avatar and contact information
  - AI credit consumption display (X/25 credits) with large visual indicator
  - Usage status classification (At Limit, High Usage, Normal Usage)
  - Usage date and period information
- **AI Features Breakdown**:
  - **Predictions Used**: Count of AI prediction generations
  - **Insights Used**: Count of AI insight generations
  - **Chatbot Used**: Count of chatbot interactions
  - **Total Usage**: Combined credit consumption with limit display
- **Analysis Section**:
  - **User Information**: Complete user details and identification
  - **Usage Metadata**: Creation timestamps, last updated, usage status
  - **Record ID**: Unique identifier for tracking and auditing
- Progress stepper with step navigation
- Responsive design with mobile adaptations

### 2. Reset AI Usage Modal
**Component**: ResetAdminAIUsageModal
**Function**:
- AI usage reset confirmation interface
- **Current Usage Display**:
  - Current total credits used (X/25)
  - Individual feature usage breakdown
  - Post-reset preview (all counters to 0/25)
- **Reset Impact Summary**:
  - Before and after usage comparison
  - Feature-specific reset confirmation
  - User re-enablement notification
- **Reset Information Panel**:
  - Usage reset explanation and benefits
  - User access restoration details
  - Administrative action logging
- Simple confirm/cancel interface with loading states

### 3. Delete AI Usage Record Modal
**Component**: DeleteAdminAIUsageModal
**Function**:
- AI usage record deletion confirmation display
- **Record Information Summary**:
  - User identification and usage date
  - Total credits used and feature breakdown
  - Record creation and tracking details
- **Deletion Impact Assessment**:
  - Permanent deletion warning for usage history
  - Data loss notification (analytics and tracking)
  - Administrative audit trail implications
- **Irreversible Action Warning**: Clear messaging about permanent deletion
- Simple confirm/cancel interface with loading states

## Key Features

### Data Management
- **Real-time Updates**: Automatic data refresh for current usage
- **Advanced Filtering**: Multiple filter combinations for usage analysis
- **Search Functionality**: Real-time user and usage record search
- **Pagination**: Efficient data loading with page controls
- **Export Options**: PDF and CSV export capabilities with detailed metrics

### AI Usage Monitoring
- **Credit Tracking**: Monitor daily AI credit consumption (25 credit limit)
- **Feature Analytics**: Track usage across Predictions, Insights, and Chatbot
- **Limit Management**: Identify and manage users at usage limits
- **Usage Patterns**: Analyze user behavior and feature preferences
- **Quota Enforcement**: Monitor and enforce daily usage quotas

### User Experience
- **Responsive Design**: Mobile-first with desktop enhancements
- **Loading States**: Comprehensive skeleton animations and progress indicators
- **Error Handling**: Graceful error states with retry options
- **Interactive Elements**: Hover effects, tooltips, and smooth animations
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Administrative Controls
- **Usage Oversight**: View detailed AI feature consumption
- **Quota Management**: Reset user limits and manage access
- **Bulk Operations**: Export and analyze large usage datasets
- **Data Validation**: Comprehensive usage data validation
- **Access Control**: Manage user AI feature access and limits

### Visual Design
- **Color Coding**: Consistent color schemes for usage levels and status
- **Icons**: Lucide React icons throughout interface (Brain, BarChart3, MessageSquare)
- **Charts**: Interactive data visualizations with detailed tooltips
- **Cards**: Modern card-based layouts with usage metrics
- **Typography**: Responsive text sizing and hierarchy

## Data Integration
The module integrates with multiple AI usage services:
- `fetchAIUsageRecords()` - Usage data retrieval with filtering
- `resetUserAIUsage()` - User quota reset functionality
- `deleteAdminAIUsage()` - Usage record deletion service
- `getAIUsageAnalytics()` - Usage analytics and statistics
- `getUserAILimits()` - User limit and quota management

## Navigation Integration
- Direct links to usage-specific management views
- Integration with admin dashboard module cards
- Export functionality for usage analysis
- Modal-based workflows for usage management

## Performance Features
- **Skeleton Loading**: Improved perceived performance during data loading
- **Memoized Components**: Optimized re-renders for usage data
- **Efficient Pagination**: Smart data loading for large usage datasets
- **Debounced Search**: Optimized search performance
- **Lazy Loading**: On-demand usage data loading

## Security Features
- **Admin-only Access**: Restricted to administrative users
- **Data Validation**: Server-side and client-side validation
- **Audit Trail**: Usage monitoring and administrative action tracking
- **User Verification**: Confirmation dialogs for quota modifications
- **Privacy Protection**: Secure handling of user usage data

## AI Usage System Features
The module includes comprehensive AI feature usage monitoring:

### Usage Categories:
- **Predictions**: AI-powered financial forecasting and analysis
- **Insights**: Deep financial intelligence and recommendations
- **Chatbot**: AI assistant conversations and interactions

### Quota Management:
- **Daily Limits**: 25 AI credits per user per day
- **Feature Tracking**: Individual counters for each AI feature
- **Limit Enforcement**: Automatic blocking when limits reached
- **Reset Capabilities**: Administrative quota reset functionality

### Analytics Integration:
- **Usage Patterns**: Track user behavior and feature preferences
- **Consumption Trends**: Monitor AI feature adoption and usage
- **Limit Analysis**: Identify users frequently hitting limits
- **Feature Performance**: Analyze which AI features are most popular

### Administrative Controls:
- **Quota Resets**: Reset user daily limits for continued access
- **Usage Monitoring**: Real-time tracking of AI feature consumption
- **Limit Management**: Adjust and enforce usage quotas
- **Access Control**: Manage user AI feature permissions

## AI Credit System
The module includes sophisticated AI credit tracking and management:

### Credit Allocation:
- **Daily Quota**: 25 AI credits per user per day
- **Feature Costs**: Each AI interaction consumes 1 credit
- **Reset Schedule**: Daily automatic reset at midnight
- **Limit Enforcement**: Block access when quota exceeded

### Usage Tracking:
- **Real-time Monitoring**: Live tracking of credit consumption
- **Feature Attribution**: Track which features consume credits
- **Historical Data**: Maintain usage history for analysis
- **Trend Analysis**: Identify usage patterns and peak times

### Administrative Management:
- **Manual Resets**: Administrative override for quota resets
- **Usage Analysis**: Detailed breakdown of credit consumption
- **Limit Adjustments**: Modify quotas for specific users or periods
- **Access Restoration**: Restore user access after limit reached