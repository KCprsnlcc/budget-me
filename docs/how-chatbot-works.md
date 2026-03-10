# HOW BUDGETME CHATBOT WORKS
## A Simple Guide for Users

**Project:** BudgetMe – A Web Based Financial Management System  
**Purpose:** Help users understand how the AI chatbot operates and what it can do  
**Date:** March 2026

---

## OVERVIEW

This document explains in simple terms how BudgetMe's AI chatbot works, what it can and cannot do, and how to get the most value from your conversations. Think of it as having a smart financial assistant that knows everything about your money but can only give advice, not take action.

---

## 1. WHAT IS THE BUDGETME CHATBOT?

### Simple Definition
**The BudgetMe chatbot is an AI-powered financial assistant that can view all your financial data and provide personalized advice, but cannot modify anything.**

### What Makes It Special
Unlike generic chatbots, BudgetMe's AI assistant:
- **Knows your complete financial situation** (accounts, transactions, budgets, goals)
- **Provides personalized advice** based on your actual data
- **Analyzes images** like receipts and bills (with vision-enabled models)
- **Speaks your language** about Philippine finances (₱, local context)
- **Maintains conversation history** so you can continue discussions
- **Offers multiple AI models** for different needs and capabilities

### Key Limitation
**IMPORTANT:** The chatbot can only READ and analyze your data - it cannot create, edit, or delete anything. You must make all changes through the regular BudgetMe interface.

---

## 2. WHAT THE CHATBOT CAN ACCESS

### Your Complete Financial Profile
The chatbot has read-only access to:

#### Personal Information
- Your full name, email, phone number
- Date of birth and profile picture
- Account preferences and settings

#### All Financial Accounts
- Bank accounts (BDO, BPI, Metrobank, etc.)
- Credit cards and their balances
- Cash wallets and digital wallets (GCash, PayMaya)
- Investment accounts and their current values
- Which account is set as your default

#### Transaction History
- All your income and expense transactions
- Transaction dates, amounts, and descriptions
- Categories you've assigned to each transaction
- Which account each transaction came from

#### Budgets and Goals
- All your active budgets and their progress
- Budget categories and spending limits
- Financial goals and contribution history
- Goal deadlines and target amounts

#### Family Information
- Family group membership (if you're in one)
- Family members and their roles
- Shared family goals and budgets

### Real Example of What It Knows
```
User: "What's my total balance across all accounts?"

Chatbot Response:
"Based on your current accounts:
- BDO Savings (Default): ₱25,000.00
- Cash Wallet: ₱3,500.00
- GCash: ₱1,200.00
- BPI Credit Card: -₱8,500.00 (outstanding balance)

Your total liquid assets are ₱29,700.00, but considering your 
credit card debt, your net worth is ₱21,200.00. Your BDO Savings 
account holds the majority of your liquid funds at 84%."
```

---

## 3. WHAT THE CHATBOT CAN DO

### Financial Analysis and Advice

#### Account Information
- Tell you balances across all accounts
- Explain which accounts you have and their types
- Show you which is your default account
- Calculate your total net worth

#### Spending Analysis
- Analyze your spending patterns by category
- Identify your biggest expense categories
- Compare current month vs previous months
- Point out unusual or large transactions

#### Budget Guidance
- Review your budget progress
- Suggest budget adjustments based on spending
- Explain why you're over or under budget
- Recommend budget categories for new expenses

#### Goal Tracking
- Show progress toward your financial goals
- Calculate how long it will take to reach goals
- Suggest contribution amounts to meet deadlines
- Explain goal performance and trends

### Image Analysis (Vision Models Only)

#### Receipt Analysis
- Extract amounts, dates, and merchant names
- Suggest appropriate budget categories
- Calculate totals and tax amounts
- Identify recurring expenses

#### Bill Analysis
- Read utility bills, credit card statements
- Extract due dates and amounts
- Suggest payment scheduling
- Identify unusual charges

#### Financial Document Review
- Analyze bank statements
- Review investment summaries
- Explain financial reports
- Extract key financial information

### Conversation and Learning

#### Personalized Responses
- Reference your specific financial data
- Use your actual account names and balances
- Provide advice tailored to your situation
- Remember context from earlier in conversation

#### Financial Education
- Explain budgeting concepts and strategies
- Teach about saving and investment principles
- Provide tips for expense reduction
- Share financial planning best practices

---

## 4. WHAT THE CHATBOT CANNOT DO

### Data Modification

#### Cannot Create
- Add new transactions for you
- Create budgets automatically
- Set up new financial goals
- Add new accounts or categories

#### Cannot Edit
- Modify existing transactions
- Change budget amounts or categories
- Update goal targets or deadlines
- Edit account information or balances

#### Cannot Delete
- Remove transactions from your history
- Delete budgets or goals
- Close accounts or remove data
- Clear your financial records

### Real Example of Limitations
```
User: "Add a ₱500 grocery expense for today"

Chatbot Response:
"I can see your transaction history and accounts, but I cannot 
add transactions directly. To add this ₱500 grocery expense:

1. Go to the Transactions page
2. Click 'Add Transaction'
3. Select 'Expense' type
4. Enter ₱500 as the amount
5. Choose 'Food & Dining' or 'Groceries' category
6. Select your payment account

Would you like me to guide you through any specific part of 
this process?"
```

### Why These Limitations Exist
- **Security:** Prevents accidental data changes or deletion
- **Control:** You maintain full control over your financial data
- **Accuracy:** Ensures all data entry is intentional and verified
- **Audit Trail:** All changes come from you, not automated systems

---

## 5. AVAILABLE AI MODELS

### Free Model (Default)

#### GPT-OSS 20B
- **Cost:** Free to use
- **Capabilities:** Text conversations, financial analysis
- **Best for:** General financial questions and advice
- **Limitations:** No image analysis, basic reasoning

### Premium Models (Paid)

#### GPT-4o and GPT-4o Mini
- **Cost:** Uses your daily AI credits (25 per day)
- **Capabilities:** Advanced reasoning, image analysis, better responses
- **Best for:** Complex financial analysis, receipt/bill analysis
- **Special Feature:** Can analyze uploaded images

#### Advanced Models
- **GPT-5 Series:** Latest and most capable models
- **O3/O4 Series:** Specialized reasoning models
- **GPT-4.1 Series:** Enhanced versions with better accuracy

### How to Choose Models

#### Use Free Model When:
- Asking simple questions about your accounts
- Getting basic financial advice
- Checking balances or transaction history
- Learning about budgeting concepts

#### Use Premium Models When:
- Analyzing receipts or bills (requires vision)
- Complex financial planning questions
- Detailed spending pattern analysis
- Advanced investment or debt advice

---

## 6. HOW CONVERSATIONS WORK

### Starting a Conversation

#### Welcome Message
When you first visit the chatbot, you'll see a personalized welcome message:
```
"Hello [Your Name]! I'm BudgetSense AI, your personal financial 
assistant. I can see you have ₱XX,XXX across your accounts and 
X active budgets. How can I help you manage your finances today?"
```

#### Conversation Suggestions
The chatbot provides suggested questions to get started:
- "What's my spending pattern this month?"
- "How am I doing with my budgets?"
- "Show me my account balances"
- "Help me analyze my biggest expenses"

### During Conversations

#### Context Awareness
The chatbot remembers:
- What you've discussed earlier in the conversation
- Your financial data and preferences
- Previous questions and answers
- Your specific account names and categories

#### Personalized Responses
Every response includes:
- Your actual financial data (amounts, account names)
- Specific references to your situation
- Actionable advice based on your patterns
- Philippine peso (₱) currency formatting

### Conversation History
- **Automatic Saving:** All conversations are saved automatically
- **Cross-Session Memory:** Continue conversations across different visits
- **Search Capability:** Find previous conversations and advice
- **Export Options:** Download conversation history as PDF or CSV

---

## 7. IMAGE ANALYSIS CAPABILITIES

### What Images You Can Upload

#### Receipts
- **Grocery receipts:** Extract items, amounts, totals
- **Restaurant bills:** Identify dining expenses, tips
- **Shopping receipts:** Categorize purchases, track spending
- **Service receipts:** Utilities, repairs, professional services

#### Bills and Statements
- **Utility bills:** Electric, water, internet, phone
- **Credit card statements:** Balances, payments, charges
- **Bank statements:** Transaction summaries, balances
- **Insurance bills:** Premiums, coverage details

#### Financial Documents
- **Investment statements:** Portfolio values, gains/losses
- **Loan documents:** Balances, payment schedules
- **Tax documents:** Income summaries, deductions
- **Financial reports:** Business or personal summaries

### What the AI Extracts

#### From Receipts
```
Example Analysis:
"I can see this is a Jollibee receipt for ₱245.00 dated March 5, 2026.
The items include:
- 1pc Chickenjoy with Rice: ₱89
- Regular Fries: ₱45
- Pineapple Juice: ₱35
- Service Charge: ₱8.45
- Total: ₱245.00

I suggest categorizing this as 'Food & Dining' expense from your 
Cash Wallet account."
```

#### From Bills
```
Example Analysis:
"This appears to be your Meralco electric bill for February 2026:
- Previous Reading: 1,245 kWh
- Current Reading: 1,367 kWh
- Consumption: 122 kWh
- Amount Due: ₱2,847.50
- Due Date: March 15, 2026

This should be categorized as 'Utilities' expense. Your consumption 
is 15% higher than typical household usage."
```

### Image Analysis Limitations
- **Vision models only:** Free model cannot analyze images
- **Quality dependent:** Clear, well-lit images work best
- **Language support:** Works best with English text
- **File size limits:** Large images may be compressed

---

## 8. DAILY USAGE LIMITS

### AI Credit System
- **Daily Limit:** 25 AI requests per day
- **Reset Time:** Midnight (Philippines timezone - Asia/Manila)
- **Shared Across Features:** Chatbot, predictions, and AI insights share the same limit

### What Counts as One Credit
Each of these uses 1 AI credit:
1. **Sending a message** to the chatbot (any model)
2. **Generating predictions** on the Predictions page
3. **Creating AI insights** on the Predictions page

### Credit Usage Examples
```
Daily Activity Example:
- 15 chatbot messages = 15 credits
- 2 prediction generations = 2 credits  
- 1 AI insight generation = 1 credit
- Total: 18/25 credits used

Remaining: 7 credits until midnight
```

### Managing Your Credits
- **Check usage:** Look for the credit counter in the interface
- **Plan conversations:** Ask multiple questions in one message
- **Use free model:** Default model doesn't count against limits
- **Wait for reset:** Credits reset at midnight Philippines time

---

## 9. CONVERSATION BEST PRACTICES

### Getting Better Responses

#### Be Specific
**Vague:** "How are my finances?"
**Specific:** "How much did I spend on food this month compared to last month?"

**General:** "Help me save money"
**Detailed:** "Which of my expense categories has increased the most, and how can I reduce it?"

#### Ask Follow-up Questions
```
Good Conversation Flow:
You: "What's my biggest expense category this month?"
AI: "Your biggest expense is Food & Dining at ₱8,500..."
You: "Show me the specific transactions in that category"
AI: "Here are your Food & Dining transactions..."
You: "Which restaurants am I spending the most at?"
```

#### Use Your Data Context
Since the AI knows your data, you can ask:
- "Why did my electricity bill increase this month?"
- "Am I on track to meet my vacation savings goal?"
- "Which account should I use for my next big purchase?"
- "How does my spending compare to my budget limits?"

### Making Conversations Productive

#### Prepare Your Questions
Before starting, think about:
- What specific financial information you need
- Which accounts or categories you're concerned about
- What financial goals you're working toward
- Any recent changes in your spending patterns

#### Use Image Analysis Effectively
- **Take clear photos** of receipts and bills
- **Upload immediately** after purchases for better tracking
- **Ask for categorization help** when unsure
- **Request spending analysis** of uploaded receipts

#### Learn from Responses
- **Ask for explanations** of financial concepts you don't understand
- **Request specific action steps** for implementing advice
- **Follow up on previous advice** to track progress
- **Ask for alternatives** if suggested actions don't fit your situation

---

## 10. PRIVACY AND SECURITY

### Data Protection
- **Read-only access:** Chatbot cannot modify your financial data
- **Encrypted communication:** All messages are encrypted in transit
- **No external sharing:** Your data is not shared with third parties
- **Secure storage:** Conversation history stored securely in your account

### What Gets Stored
- **Your messages:** Questions and requests you send
- **AI responses:** Advice and information provided
- **Conversation metadata:** Timestamps, model used, message IDs
- **Image analysis results:** Extracted information from uploaded images

### What Doesn't Get Stored
- **Original images:** Uploaded images are processed but not permanently stored
- **API keys or passwords:** No sensitive authentication data
- **External account details:** No bank login credentials or PINs
- **Third-party data:** No information from outside BudgetMe

### Privacy Controls
- **Clear history:** Delete conversation history anytime
- **Export data:** Download your conversation history
- **Account control:** Conversations tied to your account only
- **Secure deletion:** Permanently remove data when requested

---

## 11. TROUBLESHOOTING COMMON ISSUES

### Issue 1: "Chatbot says it can't see my data"
**Possible Causes:**
- You haven't added any transactions yet
- Your account is new with no financial data
- Database connection issues

**Solutions:**
- Add some transactions, accounts, or budgets first
- Wait a few minutes after adding data for it to sync
- Refresh the page and try again
- Check that you're logged into the correct account

### Issue 2: "Image analysis not working"
**Possible Causes:**
- Using free model (no vision capability)
- Image quality too poor to read
- File size too large
- Unsupported image format

**Solutions:**
- Switch to GPT-4o or GPT-4o Mini (vision models)
- Take clearer, well-lit photos
- Reduce image file size if very large
- Use JPG or PNG format images

### Issue 3: "Hit daily AI limit"
**Possible Causes:**
- Used 25 AI credits already today
- Shared limit across chatbot, predictions, AI insights

**Solutions:**
- Wait until midnight (Philippines time) for reset
- Use the free GPT-OSS model (doesn't count against limit)
- Plan your AI usage throughout the day
- Ask multiple questions in single messages

### Issue 4: "Responses seem generic or unhelpful"
**Possible Causes:**
- Limited financial data in your account
- Vague or unclear questions
- Using basic model for complex questions

**Solutions:**
- Add more transaction history and financial data
- Ask more specific, detailed questions
- Switch to premium models for better responses
- Provide more context in your questions

### Issue 5: "Conversation history disappeared"
**Possible Causes:**
- Accidentally cleared chat history
- Browser data cleared
- Account sync issues

**Solutions:**
- Check if you cleared history intentionally
- Try refreshing the page
- Log out and log back in
- Contact support if data should be there

---

## 12. EXPORT AND SHARING OPTIONS

### Conversation Export Formats

#### PDF Export
**What you get:**
- Formatted conversation with message bubbles
- Timestamps and model information
- Print-ready layout with BudgetMe branding
- Complete conversation history

**Best for:**
- Sharing with financial advisors
- Keeping records of financial advice
- Printing for offline reference
- Professional documentation

#### CSV Export
**What you get:**
- Spreadsheet format with columns: Role, Timestamp, Content, Model
- Raw conversation data for analysis
- Compatible with Excel, Google Sheets
- Easy to search and filter

**Best for:**
- Data analysis of your conversations
- Importing into other tools
- Tracking advice over time
- Creating your own financial logs

### How to Export
1. **Open chatbot page** with conversation history
2. **Click export button** (usually in top-right corner)
3. **Choose format** (PDF or CSV)
4. **Download starts automatically**
5. **File saved** to your device's download folder

### Sharing Considerations
- **Remove sensitive data** before sharing with others
- **Check privacy settings** if sharing with advisors
- **Consider data sensitivity** of financial information
- **Use secure methods** for sharing financial documents

---

## 13. ADVANCED FEATURES

### Multi-Model Conversations
- **Switch models mid-conversation** for different capabilities
- **Compare responses** from different AI models
- **Use appropriate model** for each type of question
- **Track which model** provided which advice

### Conversation Context
- **Long-term memory:** AI remembers your financial situation across sessions
- **Progressive learning:** Builds understanding of your preferences over time
- **Contextual responses:** References previous parts of conversation
- **Personalized advice:** Adapts to your specific financial patterns

### Integration with BudgetMe Features
- **Reference other pages:** AI can guide you to specific BudgetMe features
- **Explain interface:** Help understanding how to use different parts of the app
- **Data interpretation:** Explain what your financial data means
- **Feature recommendations:** Suggest which BudgetMe tools to use for specific goals

---

## 14. GETTING MAXIMUM VALUE

### Strategic Use of AI Credits

#### High-Value Questions (Worth Using Credits)
- Complex financial analysis requiring premium models
- Image analysis of receipts and bills
- Detailed spending pattern analysis
- Investment and debt strategy advice

#### Low-Value Questions (Use Free Model)
- Simple balance inquiries
- Basic account information
- General financial education
- Navigation help within BudgetMe

### Building Effective Conversations

#### Start Broad, Get Specific
```
Conversation Strategy:
1. "Give me an overview of my financial health"
2. "Which expense category needs the most attention?"
3. "Show me specific transactions in that category"
4. "What strategies can I use to reduce those expenses?"
5. "Help me create an action plan for next month"
```

#### Use Follow-up Questions
- Build on previous responses
- Dig deeper into concerning areas
- Ask for clarification when needed
- Request specific action steps

#### Combine with Other Features
- **Use predictions first:** Generate forecasts, then ask chatbot to explain them
- **Review insights:** Get AI insights, then discuss implementation with chatbot
- **Plan budgets:** Create budgets, then ask chatbot for optimization advice

---

## SUMMARY

### What the BudgetMe Chatbot Is
- **Smart financial assistant** with complete access to your financial data
- **Personalized advisor** that provides advice based on your actual situation
- **Multi-model AI system** with different capabilities for different needs
- **Secure, read-only system** that cannot modify your data

### Key Capabilities
1. **Complete financial analysis** of your accounts, transactions, budgets, and goals
2. **Image analysis** of receipts, bills, and financial documents (vision models)
3. **Personalized advice** based on your specific financial patterns
4. **Educational support** for financial concepts and BudgetMe features
5. **Conversation history** with context awareness across sessions

### Important Limitations
1. **Cannot modify data** - Read-only access, cannot create/edit/delete anything
2. **Daily usage limits** - 25 AI credits per day shared across all AI features
3. **Model restrictions** - Free model cannot analyze images
4. **Context limitations** - Doesn't know external factors or future plans

### Best Practices for Success
1. **Provide quality data** - Add transactions and categorize properly
2. **Ask specific questions** - Detailed queries get better responses
3. **Use appropriate models** - Vision models for images, free model for basic questions
4. **Manage AI credits** - Plan usage throughout the day
5. **Follow up on advice** - Build conversations progressively
6. **Export important conversations** - Keep records of valuable advice

### Remember
**The BudgetMe chatbot is a powerful tool for understanding and improving your finances, but it works best when you provide good data and ask thoughtful questions. Think of it as having a knowledgeable financial advisor who knows everything about your money but needs you to take action on their recommendations.**

---

## GETTING HELP

### If Chatbot Responses Seem Wrong
1. **Check your financial data** - Ensure transactions and accounts are accurate
2. **Provide more context** - Give specific details about your situation
3. **Try different models** - Premium models often provide better analysis
4. **Ask follow-up questions** - Clarify confusing or unclear responses

### For Technical Issues
- Ensure you have internet connection for AI processing
- Check if you've reached daily AI credit limit (25 requests)
- Try refreshing the page if chatbot won't respond
- Verify you're using a supported browser

### Maximizing Chatbot Value
- **Use regularly** - Build conversation history for better context
- **Ask diverse questions** - Explore different aspects of your finances
- **Implement advice** - Act on recommendations and report back results
- **Learn progressively** - Build financial knowledge through conversations

---

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Prepared for:** BudgetMe Users  
**Purpose:** User Education and Understanding