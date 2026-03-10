# Settings Page Documentation

## Overview
The settings page (`src/app/(dashboard)/settings/page.tsx`) provides comprehensive user account management with profile customization, financial account management, and system preferences. It features a tabbed interface with real-time updates and secure data handling.

## Main Page Components

### 1. Page Header
**Component**: Settings Page Header
**Function**:
- Displays page title "Settings" with descriptive subtitle
- Provides context about available configuration options
- Responsive design with consistent styling

### 2. Tab Navigation System
**Component**: Horizontal Tab Interface
**Function**:
- **Profile Tab**: User profile and personal information management
- **Financial Accounts Tab**: Bank account and financial source management
- **Preferences Tab**: System preferences and application settings
- **Active State Indicators**: Visual feedback for current tab
- **Responsive Navigation**: Mobile-optimized tab switching

### 3. Loading States
**Component**: Skeleton Loading System
**Function**:
- **Initial Page Load**: Comprehensive skeleton for entire page
- **Tab-specific Loading**: Individual loading states for each tab
- **Smooth Transitions**: Consistent loading experience
- **Progressive Enhancement**: Content appears as it loads

## Tab Components

### 1. Profile Tab
**File**: `profile-tab.tsx`

**Components and Functions**:

#### Profile Picture Management
- **Avatar Upload**: Secure image upload with validation
- **File Type Validation**: Image format verification
- **Size Limits**: 5MB maximum file size enforcement
- **Preview System**: Real-time avatar preview
- **Upload Progress**: Visual feedback during upload

#### Personal Information Form
- **First Name**: Editable first name field
- **Last Name**: Editable last name field
- **Phone Number**: Contact information management
- **Date of Birth**: Date selector for birth date
- **Email Address**: Display-only email (authentication-linked)

#### Form Management
- **Change Detection**: Automatic detection of form modifications
- **Validation**: Real-time form validation
- **Save/Cancel Actions**: Commit or revert changes
- **Auto-save Prevention**: Prevents accidental data loss
- **Success Feedback**: Confirmation of successful updates

### 2. Accounts Tab
**File**: `accounts-tab.tsx`

**Components and Functions**:

#### Account Display System
- **Account Grid**: Visual grid layout of financial accounts
- **Account Cards**: Individual account information cards
- **Balance Display**: Current account balance with formatting
- **Account Types**: Visual indicators for different account types
- **Default Account**: Special marking for primary account

#### Account Management
- **Add Account**: Create new financial accounts
- **Edit Account**: Modify existing account details
- **Delete Account**: Secure account removal with warnings
- **Set Default**: Designate primary account for transactions
- **Balance Adjustments**: Manual balance corrections with transaction logging

#### Account Types Support
- **Checking Accounts**: Standard checking account management
- **Savings Accounts**: Savings account tracking
- **Credit Cards**: Credit card balance management
- **Investment Accounts**: Investment portfolio tracking
- **Cash Accounts**: Physical cash tracking

### 3. Preferences Tab
**File**: `preferences-tab.tsx`

**Components and Functions**:

#### Currency Settings
- **Fixed Currency**: Philippine Peso (PHP) standardization
- **Currency Display**: Consistent currency formatting
- **Regional Settings**: Localized number formatting
- **Currency Information**: Educational content about currency choice

#### System Information
- **Version Display**: Current application version
- **Privacy Information**: Data privacy and security information
- **Auto-save Notice**: Information about automatic settings saving
- **System Status**: Application status and health indicators

## Modal Components

### 1. Add Account Modal
**File**: `add-account-modal.tsx`

**Features**:
- **Multi-step Form**: Guided account creation process
- **Account Type Selection**: Choose from available account types
- **Institution Information**: Bank or financial institution details
- **Initial Balance**: Set starting account balance
- **Color Customization**: Visual account identification
- **Validation**: Comprehensive form validation

### 2. Edit Account Modal
**File**: `edit-account-modal.tsx`

**Features**:
- **Pre-populated Form**: Load existing account data
- **Balance Adjustment**: Modify account balance with transaction logging
- **Account Details**: Update name, institution, and description
- **Color Changes**: Modify account visual identification
- **Default Status**: Change default account designation
- **Change Tracking**: Monitor and validate modifications

### 3. Delete Account Modal
**File**: `delete-account-modal.tsx`

**Features**:
- **Confirmation Dialog**: Secure deletion confirmation
- **Account Summary**: Display account details before deletion
- **Impact Warning**: Clear warning about data loss
- **Transaction Impact**: Information about affected transactions
- **Irreversible Action**: Clear messaging about permanent deletion
- **Safety Measures**: Multiple confirmation steps

## Key Features

### Data Security and Privacy
- **Secure Updates**: Encrypted data transmission for all updates
- **Validation**: Server-side and client-side data validation
- **Privacy Protection**: Secure handling of personal information
- **Audit Trail**: Logging of all account and profile changes
- **Data Integrity**: Consistent data validation and error handling

### User Experience
- **Real-time Updates**: Immediate reflection of changes
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: Full keyboard navigation and screen reader support
- **Progressive Enhancement**: Enhanced features when available
- **Error Handling**: Graceful error recovery and user feedback

### Account Management
- **Multiple Account Types**: Support for various financial account types
- **Balance Tracking**: Accurate balance management with transaction integration
- **Default Account System**: Primary account designation for transactions
- **Visual Customization**: Color-coded account identification
- **Institution Tracking**: Bank and financial institution information

### Profile Management
- **Avatar System**: Profile picture upload and management
- **Personal Information**: Comprehensive personal data management
- **Change Detection**: Automatic detection of profile modifications
- **Validation**: Real-time validation of profile information
- **Update Confirmation**: Clear feedback on successful updates

## Data Integration

### Hooks and Services
- `useAuth()`: Authentication context for user management
- `settings-service.ts`: Core settings and profile management
- `getUserProfile()`: Profile data retrieval
- `updateUserProfile()`: Profile information updates
- `getUserAccounts()`: Account data management
- `createAccount()`: New account creation
- `updateAccount()`: Account modification
- `deleteAccount()`: Secure account deletion

### State Management
- **Profile State**: User profile information and modifications
- **Account State**: Financial account data and operations
- **Modal State**: Controls for various modal dialogs
- **Loading States**: Individual loading states for different operations
- **Form State**: Form data and validation status

## Security Considerations

### Data Protection
- **Input Validation**: Comprehensive validation of all user inputs
- **File Upload Security**: Secure image upload with type and size validation
- **Data Encryption**: Encrypted storage and transmission of sensitive data
- **Access Controls**: User-specific data access and modification rights
- **Audit Logging**: Complete logging of all settings changes

### Account Security
- **Balance Verification**: Validation of account balance modifications
- **Transaction Logging**: Automatic transaction creation for balance adjustments
- **Deletion Protection**: Multiple confirmation steps for account deletion
- **Default Account Management**: Secure handling of primary account designation
- **Data Consistency**: Ensuring data integrity across all operations

## Performance Optimizations

### Efficient Loading
- **Lazy Loading**: Load tab content on demand
- **Skeleton States**: Smooth loading experience with skeleton screens
- **Memoized Components**: Optimized re-rendering for better performance
- **Debounced Updates**: Optimized form input handling
- **Caching**: Intelligent caching of user data and settings

### Responsive Interface
- **Mobile Optimization**: Touch-friendly interface for mobile devices
- **Adaptive Layouts**: Responsive grid and form layouts
- **Progressive Enhancement**: Enhanced features when available
- **Smooth Transitions**: Animated transitions between states
- **Keyboard Navigation**: Full keyboard accessibility support

## Navigation Integration
The page integrates with:
- `/dashboard` - Return to main dashboard with updated settings
- Authentication system - Profile updates sync with auth context
- Transaction system - Account changes affect transaction management
- All financial modules - Settings changes propagate throughout application

## Future Enhancements
- **Two-Factor Authentication**: Enhanced security options
- **Data Export**: Export personal data and settings
- **Theme Customization**: Dark mode and theme options
- **Notification Preferences**: Customizable notification settings
- **Advanced Privacy Controls**: Granular privacy and data sharing options
- **Integration Settings**: Third-party service integrations