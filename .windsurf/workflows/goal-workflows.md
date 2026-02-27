---
description: Complete goal system workflows for all user roles and actions
---

# Goal System Workflows - All Roles & Actions

## 🎯 Overview
This document outlines the complete workflows for the goal system across all user roles (Owner, Admin, Member, Viewer) and all actions (Add, View, Edit, Contribute, Delete).

## 👥 Role-Based Permissions Matrix

| Role | Add Goals | Edit Goals | Delete Goals | Contribute | View Goals | Create Family Goals |
|------|-----------|------------|--------------|------------|------------|-------------------|
| **Owner** | ✅ Personal + Family | ✅ Own + All Family | ✅ Own + All Family | ✅ All Goals | ✅ All Goals | ✅ |
| **Admin** | ✅ Personal + Family | ✅ Own + All Family | ✅ Own + All Family | ✅ All Goals | ✅ All Goals | ✅ |
| **Member** | ✅ Personal Only | ✅ Personal Only | ✅ Personal Only | ✅ All Goals | ✅ All Goals | ❌ |
| **Viewer** | ✅ Personal Only | ✅ Personal Only | ✅ Personal Only | ❌ | ✅ All Goals | ❌ |

---

## 📝 ADD GOAL WORKFLOWS

### 🟢 Owner - Add Goal
**Access:** Full access to both personal and family goals

#### Personal Goal Workflow:
1. **Open Add Modal** → Click "Add Goal" button
2. **Step 1 - Category**: Select any category (emergency, vacation, etc.)
3. **Step 2 - Details**: 
   - Enter goal name, target amount, deadline, monthly contribution
   - Set priority (low/medium/high)
4. **Step 3 - Family Settings**:
   - Leave "This is a family goal" unchecked
   - See info: "Goal Planning - Set realistic targets..."
5. **Submit**: Goal created as personal goal

#### Family Goal Workflow:
1. **Open Add Modal** → Click "Add Goal" button
2. **Step 1 - Category**: Select any category
3. **Step 2 - Details**: Enter goal information
4. **Step 3 - Family Settings**:
   - ✅ Check "This is a family goal"
   - 📋 See: "Family Goal Permissions" with badges:
     - 🟢 Can Edit | 🔴 Can Delete | 🔵 Can Contribute
   - 📋 See: "This goal will be shared with your family: [Family Name]"
5. **Submit**: Goal created as family goal

---

### 🟢 Admin - Add Goal
**Access:** Same as Owner - full access to both personal and family goals

#### Workflow: Identical to Owner
- Same steps and permissions as Owner
- Sees same permission badges when creating family goals
- Can create both personal and family goals

---

### 🟡 Member - Add Goal
**Access:** Personal goals only

#### Personal Goal Workflow:
1. **Open Add Modal** → Click "Add Goal" button
2. **Step 1 - Category**: Select any category
3. **Step 2 - Details**: Enter goal information
4. **Step 3 - Family Settings**:
   - ❌ "This is a family goal" checkbox is **disabled**
   - 📋 See: "Insufficient Permissions"
   - 📋 See: "Your role as member does not allow creating family goals. Only Owners and Admins can create family goals."
5. **Submit**: Goal created as personal goal only

#### Family Goal Attempt:
- Checkbox disabled and grayed out
- Clear error message explaining permissions
- Cannot proceed with family goal creation

---

### 🔴 Viewer - Add Goal
**Access:** Personal goals only

#### Personal Goal Workflow:
1. **Open Add Modal** → Click "Add Goal" button
2. **Step 1 - Category**: Select any category
3. **Step 2 - Details**: Enter goal information
4. **Step 3 - Family Settings**:
   - ❌ "This is a family goal" checkbox is **disabled**
   - 📋 See: "Insufficient Permissions"
   - 📋 See: "Your role as viewer does not allow creating family goals. Only Owners and Admins can create family goals."
5. **Submit**: Goal created as personal goal only

#### Family Goal Attempt:
- Checkbox disabled and grayed out
- Clear error message explaining permissions
- Cannot proceed with family goal creation

---

## 👁️ VIEW GOAL WORKFLOWS

### 🟢 Owner - View Goal
**Access:** Can view all goals (personal + family + public)

#### Personal Goal View:
1. **Open Modal**: Click on any personal goal
2. **Goal Information**:
   - Name, target, current progress, deadline, priority
   - Progress bar with percentage
   - Monthly contribution amount
   - Projected completion date
3. **Actions Available**:
   - ✅ Edit button
   - ✅ Contribute button
   - ✅ Delete button (if own goal)

#### Family Goal View:
1. **Open Modal**: Click on any family goal
2. **Goal Information**: Same as personal goal
3. **Family Context Section**:
   - 📋 Family Name: "[Family Name]"
   - 📋 Your Role: "Owner"
   - 📋 "Shared with family members for collaborative tracking and contributions"
4. **Actions Available**:
   - ✅ Edit button
   - ✅ Contribute button
   - ✅ Delete button

#### Public Goal View:
1. **Open Modal**: Click on any public goal
2. **Goal Information**: Same details
3. **Public Context Section**:
   - 📋 "Public Goal" with Globe icon
   - 📋 "Visible to the public community for inspiration"
4. **Actions Available**:
   - ❌ No edit/delete (not owned)
   - ✅ Contribute button

---

### 🟢 Admin - View Goal
**Access:** Same as Owner - can view all goals

#### Workflow: Identical to Owner
- Same information displayed
- Same action buttons available
- Same family context shown
- Role displays as "Admin" instead of "Owner"

---

### 🟡 Member - View Goal
**Access:** Can view all goals but limited actions

#### Personal Goal View:
1. **Open Modal**: Click on own personal goal
2. **Goal Information**: Full details
3. **Actions Available**:
   - ✅ Edit button (own goal only)
   - ✅ Contribute button
   - ✅ Delete button (own goal only)

#### Family Goal View:
1. **Open Modal**: Click on any family goal
2. **Goal Information**: Full details
3. **Family Context Section**:
   - 📋 Family Name: "[Family Name]"
   - 📋 Your Role: "Member"
   - 📋 "Shared with family members for collaborative tracking and contributions"
4. **Actions Available**:
   - ❌ Edit button (disabled/hidden)
   - ✅ Contribute button
   - ❌ Delete button (disabled/hidden)

#### Public Goal View:
1. **Open Modal**: Click on any public goal
2. **Goal Information**: Full details
3. **Public Context Section**: Same as other roles
4. **Actions Available**:
   - ❌ No edit/delete
   - ✅ Contribute button

---

### 🔴 Viewer - View Goal
**Access:** Can view all goals, limited actions on personal goals only

#### Personal Goal View:
1. **Open Modal**: Click on own personal goal
2. **Goal Information**: Full details
3. **Actions Available**:
   - ✅ Edit button (own goal only)
   - ❌ Contribute button (disabled)
   - ✅ Delete button (own goal only)

#### Family Goal View:
1. **Open Modal**: Click on any family goal
2. **Goal Information**: Full details
3. **Family Context Section**:
   - 📋 Family Name: "[Family Name]"
   - 📋 Your Role: "Viewer"
   - 📋 "Shared with family members for collaborative tracking and contributions"
4. **Actions Available**:
   - ❌ Edit button (disabled/hidden)
   - ❌ Contribute button (disabled/hidden)
   - ❌ Delete button (disabled/hidden)

#### Public Goal View:
1. **Open Modal**: Click on any public goal
2. **Goal Information**: Full details
3. **Public Context Section**: Same as other roles
4. **Actions Available**:
   - ❌ No edit/delete (not owned)
   - ❌ Contribute button (disabled/hidden)

---

## ✏️ EDIT GOAL WORKFLOWS

### 🟢 Owner - Edit Goal
**Access:** Can edit personal goals and all family goals

#### Personal Goal Edit:
1. **Open Edit Modal**: Click Edit on personal goal
2. **Pre-filled Data**: All current goal data loaded
3. **Step 1 - Category**: Can change category
4. **Step 2 - Details**: Can modify all fields
5. **Step 3 - Family Settings**:
   - ✅ Can toggle between personal/family
   - 📋 If family: Shows permission badges
   - 📋 If switching to family: "Family Goal Permissions" displayed
6. **Save**: Changes applied immediately

#### Family Goal Edit:
1. **Open Edit Modal**: Click Edit on family goal
2. **Pre-filled Data**: All current data loaded
3. **All Steps**: Can modify everything
4. **Family Settings**:
   - ✅ Can convert to personal goal
   - ✅ Can keep as family goal
   - 📋 Permission badges always visible for family goals
5. **Save**: Changes applied to all family members

---

### 🟢 Admin - Edit Goal
**Access:** Same as Owner - can edit personal goals and all family goals

#### Workflow: Identical to Owner
- Same edit capabilities
- Same permission displays
- Can convert between personal/family goals

---

### 🟡 Member - Edit Goal
**Access:** Can edit own personal goals only

#### Personal Goal Edit:
1. **Open Edit Modal**: Click Edit on own personal goal
2. **Pre-filled Data**: Current data loaded
3. **All Steps**: Can modify all fields
4. **Family Settings**:
   - ❌ "This is a family goal" checkbox disabled
   - 📋 "Insufficient Permissions" message
5. **Save**: Changes applied to personal goal only

#### Family Goal Edit Attempt:
- Edit button disabled/hidden on family goals
- If modal somehow opens: Save blocked with permission error
- Clear messaging about insufficient permissions

---

### 🔴 Viewer - Edit Goal
**Access:** Can edit own personal goals only

#### Personal Goal Edit:
1. **Open Edit Modal**: Click Edit on own personal goal
2. **Pre-filled Data**: Current data loaded
3. **All Steps**: Can modify all fields
4. **Family Settings**:
   - ❌ "This is a family goal" checkbox disabled
   - 📋 "Insufficient Permissions" message
5. **Save**: Changes applied to personal goal only

#### Family Goal Edit Attempt:
- Edit button disabled/hidden on family goals
- If modal somehow opens: Save blocked with permission error
- Clear messaging about insufficient permissions

---

## 💰 CONTRIBUTE TO GOAL WORKFLOWS

### 🟢 Owner - Contribute
**Access:** Can contribute to all goals

#### Contribution Workflow:
1. **Open Modal**: Click Contribute on any goal
2. **Amount Entry**: Enter contribution amount
3. **Confirmation**: See contribution impact on progress
4. **Submit**: Contribution recorded immediately
5. **Progress Update**: Goal progress bar updates

---

### 🟢 Admin - Contribute
**Access:** Same as Owner - can contribute to all goals

#### Workflow: Identical to Owner
- Same contribution interface
- Same immediate progress updates

---

### 🟡 Member - Contribute
**Access:** Can contribute to all goals (personal, family, public)

#### Contribution Workflow:
1. **Open Modal**: Click Contribute on any goal
2. **Amount Entry**: Enter contribution amount
3. **Confirmation**: See contribution impact
4. **Submit**: Contribution recorded
5. **Progress Update**: Goal progress updates for all

---

### 🔴 Viewer - Contribute
**Access:** No contribution permissions

#### Contribution Attempt:
- Contribute button disabled/hidden
- If modal opens: Amount field disabled
- Submit blocked with permission error
- "Read-only access" message

---

## 🗑️ DELETE GOAL WORKFLOWS

### 🟢 Owner - Delete Goal
**Access:** Can delete personal goals and all family goals

#### Personal Goal Delete:
1. **Confirmation**: Click Delete → Confirmation dialog
2. **Warning**: "Are you sure you want to delete this goal?"
3. **Delete**: Goal permanently removed
4. **Impact**: All contributions lost

#### Family Goal Delete:
1. **Confirmation**: Click Delete → Confirmation dialog
2. **Enhanced Warning**: "This will delete the goal for ALL family members"
3. **Delete**: Goal removed from family
4. **Impact**: Affects all family members

---

### 🟢 Admin - Delete Goal
**Access:** Same as Owner - can delete personal goals and all family goals

#### Workflow: Identical to Owner
- Same confirmation dialogs
- Same family-wide impact warnings

---

### 🟡 Member - Delete Goal
**Access:** Can delete own personal goals only

#### Personal Goal Delete:
1. **Confirmation**: Click Delete → Standard confirmation
2. **Delete**: Personal goal removed
3. **Impact**: Only affects member

#### Family Goal Delete Attempt:
- Delete button disabled/hidden on family goals
- If attempted: "Insufficient permissions" error
- Cannot delete family goals

---

### 🔴 Viewer - Delete Goal
**Access:** Can delete own personal goals only

#### Personal Goal Delete:
1. **Confirmation**: Click Delete → Standard confirmation
2. **Delete**: Personal goal removed
3. **Impact**: Only affects viewer

#### Family Goal Delete Attempt:
- Delete button disabled/hidden on family goals
- If attempted: "Insufficient permissions" error
- Cannot delete family goals

---

## 🔄 Cross-Role Interactions

### Goal Visibility Matrix
| Goal Type | Owner | Admin | Member | Viewer |
|-----------|-------|-------|--------|--------|
| **Owner's Personal** | ✅ Full Access | ✅ View Only | ✅ View Only | ✅ View Only |
| **Admin's Personal** | ✅ View Only | ✅ Full Access | ✅ View Only | ✅ View Only |
| **Member's Personal** | ✅ View Only | ✅ View Only | ✅ Full Access | ✅ View Only |
| **Viewer's Personal** | ✅ View Only | ✅ View Only | ✅ View Only | ✅ Full Access |
| **Family Goals** | ✅ Full Access | ✅ Full Access | ✅ Contribute Only | ✅ View Only |
| **Public Goals** | ✅ Contribute | ✅ Contribute | ✅ Contribute | ✅ View Only |

### Permission Inheritance
- **Family Creator**: Automatically gets Owner permissions regardless of database role
- **Database Role**: Determines permissions for non-creators (Admin, Member, Viewer)
- **Personal Goals**: Always editable by goal creator regardless of family role

---

## 🚫 Error Handling & Edge Cases

### Common Error States:
1. **No Family**: "You need to join or create a family to create family goals"
2. **Insufficient Permissions**: "Your role as [role] does not allow this action"
3. **Family Not Found**: "Family details not available"
4. **Network Errors**: Retry mechanisms with user feedback

### Permission Checks:
- **UI Level**: Buttons disabled based on permissions
- **Component Level**: Permission validation before actions
- **Server Level**: Backend validates all requests
- **Real-time Updates**: Permissions update when family role changes

---

## 📊 User Experience Flow

### New User Journey:
1. **Join Family** → Gets Member role
2. **View Goals** → Sees all family goals
3. **Contribute** → Can contribute to goals
4. **Request Upgrade** → Ask Owner/Admin for role change
5. **Get Admin Role** → Can create/edit family goals
6. **Create Family** → Becomes Owner with full permissions

### Role Progression:
```
Viewer → Member → Admin → Owner
  ❌        ✅       ✅       ✅  (Contribute)
  ❌        ❌       ✅       ✅  (Create Family Goals)
  ❌        ❌       ✅       ✅  (Edit Family Goals)
  ❌        ❌       ❌       ✅  (Delete Family Goals)
```

This comprehensive workflow ensures clear role-based access control while maintaining an intuitive user experience across all goal-related actions.
