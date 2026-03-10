# Chatbot Page Documentation

## Overview
The chatbot page (`src/app/(dashboard)/chatbot/page.tsx`) provides an AI-powered financial assistant interface with advanced conversational capabilities, multiple AI model support, and comprehensive chat management features. It integrates with the user's financial data to provide personalized financial advice and insights.

## Main Page Components

### 1. Chat Interface
**Component**: Main Chat Container
**Function**:
- **Message Display**: Chronological conversation history with user and AI messages
- **Real-time Messaging**: Live chat interface with typing indicators
- **Message Formatting**: Rich markdown support for AI responses
- **Infinite Scroll**: Load older messages on scroll with pagination
- **Auto-scroll**: Automatic scrolling to new messages with manual override

### 2. Message Input System
**Component**: Chat Input Interface
**Function**:
- **Text Input**: Multi-line textarea with auto-resize functionality
- **File Attachment**: Support for document and image uploads (future feature)
- **Send Controls**: Send button with keyboard shortcuts (Enter to send)
- **Input Validation**: Message length and content validation
- **Rate Limiting**: AI usage controls with visual feedback

### 3. AI Model Selection
**Component**: Model Selector Dropdown (`model-selector-dropdown.tsx`)
**Function**:
- **Multiple Models**: Support for different AI models (GPT-4, Claude, etc.)
- **Model Information**: Display model capabilities and descriptions
- **Dynamic Selection**: Switch models mid-conversation
- **Default Model**: Automatic selection of optimal model
- **Visual Indicators**: Clear indication of selected model

### 4. Message Management
**Component**: Message Actions and Controls
**Function**:
- **Copy Messages**: Copy AI responses to clipboard
- **Share Messages**: Native sharing API support with fallback
- **Message History**: Persistent conversation storage
- **Export Options**: PDF and CSV export of chat history
- **Clear Chat**: Option to clear conversation history

### 5. Dynamic Suggestions
**Component**: Contextual Suggestion System
**Function**:
- **Smart Suggestions**: AI-generated conversation starters
- **Context-Aware**: Suggestions based on user's financial data
- **Personalized**: Tailored to user's financial situation and goals
- **Interactive**: Clickable suggestions for quick input
- **Adaptive**: Updates based on conversation context

## Component Details

### 1. Model Selector Dropdown
**File**: `model-selector-dropdown.tsx`

**Features**:
- **Model List**: Display available AI models with descriptions
- **Selection Interface**: Dropdown with visual model selection
- **Model Details**: Show model capabilities and use cases
- **Current Model**: Clear indication of active model
- **Responsive Design**: Adaptive dropdown for different screen sizes

**Key Functions**:
- **Model Switching**: Seamless switching between AI models
- **Visual Feedback**: Check marks and highlighting for selected model
- **Click Outside**: Automatic dropdown closure on outside clicks
- **Keyboard Navigation**: Support for keyboard model selection

### 2. Clear Chat Modal
**File**: `clear-chat-modal.tsx`

**Features**:
- **Confirmation Dialog**: Secure confirmation before clearing chat
- **Warning Messages**: Clear indication of irreversible action
- **Loading States**: Visual feedback during chat clearing process
- **Error Handling**: Graceful handling of clearing failures

**Key Functions**:
- **Data Protection**: Prevents accidental chat deletion
- **User Confirmation**: Multi-step confirmation process
- **Loading Feedback**: Visual indication of clearing progress
- **Modal Controls**: Proper modal behavior with escape handling

## Advanced Features

### AI Integration
- **Multiple AI Models**: Support for various AI providers and models
- **Context Awareness**: AI understands user's financial context
- **Personalized Responses**: Tailored advice based on user data
- **Financial Expertise**: Specialized financial knowledge and advice
- **Rate Limiting**: Intelligent usage controls to manage costs

### Message Processing
- **Markdown Rendering**: Rich text formatting for AI responses
- **Typing Effects**: Realistic typing animation for AI responses
- **Message Persistence**: Automatic saving of conversation history
- **Content Validation**: Input sanitization and validation
- **Error Recovery**: Graceful handling of message failures

### User Experience
- **Responsive Design**: Optimized for mobile and desktop
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Efficient message loading and rendering
- **Offline Support**: Graceful degradation when offline
- **Progressive Enhancement**: Enhanced features when available

### Data Integration
- **Financial Context**: Integration with user's financial data
- **Real-time Updates**: Live updates from financial systems
- **Personalization**: Customized experience based on user profile
- **Privacy Protection**: Secure handling of sensitive financial data
- **Data Synchronization**: Consistent data across all features

## Chat Features

### Message Types
- **User Messages**: Text input from user with formatting
- **AI Responses**: Rich markdown responses with formatting
- **System Messages**: Welcome messages and system notifications
- **Error Messages**: Clear error communication and recovery options
- **Typing Indicators**: Real-time typing status for AI responses

### Conversation Management
- **History Persistence**: Automatic conversation saving
- **Message Threading**: Contextual conversation flow
- **Session Management**: Proper session handling and recovery
- **Conversation Export**: Full conversation export capabilities
- **Search Functionality**: Find specific messages in history (future feature)

### Interactive Elements
- **Clickable Suggestions**: Quick-start conversation topics
- **Action Buttons**: Copy, share, and export message actions
- **File Attachments**: Support for document and image uploads
- **Quick Replies**: Predefined response options
- **Contextual Menus**: Right-click actions for messages

## Security and Privacy

### Data Protection
- **Message Encryption**: Secure storage of conversation data
- **Privacy Controls**: User control over data retention
- **Secure Transmission**: Encrypted communication with AI services
- **Data Minimization**: Only necessary data collection
- **Audit Trail**: Logging of AI interactions for security

### Rate Limiting
- **Usage Tracking**: Monitor AI API usage and costs
- **Daily Limits**: Prevent excessive AI usage
- **Fair Usage**: Balanced access across users
- **Cost Management**: Intelligent cost control mechanisms
- **Status Display**: Clear indication of usage limits

## Performance Optimizations

### Efficient Loading
- **Lazy Loading**: Load messages on demand
- **Pagination**: Efficient handling of large conversation histories
- **Caching**: Intelligent caching of AI responses
- **Debouncing**: Optimized input handling and API calls
- **Memory Management**: Efficient memory usage for long conversations

### Responsive Interface
- **Smooth Scrolling**: Optimized scrolling performance
- **Auto-resize**: Dynamic textarea sizing
- **Touch Support**: Mobile-optimized touch interactions
- **Keyboard Shortcuts**: Efficient keyboard navigation
- **Loading States**: Clear feedback during operations

## Export and Sharing

### Export Options
- **PDF Export**: Formatted conversation export with styling
- **CSV Export**: Structured data export for analysis
- **Message Copy**: Individual message copying
- **Conversation Sharing**: Native sharing API integration
- **Selective Export**: Export specific parts of conversation

### Data Formats
- **Structured Data**: Organized export with metadata
- **Formatted Output**: Styled PDF with proper formatting
- **Raw Data**: CSV format for data analysis
- **Shareable Links**: Secure sharing of conversation excerpts
- **Print Support**: Print-friendly conversation formatting

## Navigation Integration
The page integrates with:
- `/dashboard` - Return to main dashboard with chat summary
- `/predictions` - AI predictions and forecasting
- `/transactions` - Transaction data for context
- `/budgets` - Budget information for advice
- `/goals` - Goal tracking for recommendations

## Future Enhancements
- **Voice Input**: Speech-to-text input capabilities
- **File Analysis**: AI analysis of uploaded financial documents
- **Multi-language**: Support for multiple languages
- **Advanced Search**: Search through conversation history
- **Conversation Templates**: Predefined conversation starters
- **Integration Webhooks**: Connect with external financial services