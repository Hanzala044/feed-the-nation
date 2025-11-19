# Admin Dashboard Documentation

## Feed The Nation - Admin Dashboard

Complete documentation for the Admin Dashboard system.

---

## Table of Contents

1. [Admin Authentication](#admin-authentication)
2. [Dashboard Overview](#dashboard-overview)
3. [Accounts Management](#accounts-management)
4. [Donation Management](#donation-management)
5. [Statistics & Analytics](#statistics--analytics)
6. [Points & Badge System](#points--badge-system)
7. [API & Database](#api--database)
8. [Deployment](#deployment)

---

## Admin Authentication

### Static Credentials

The admin dashboard uses hardcoded credentials for security:

```
Email: admin@food4u.com
Password: admin123
```

### How It Works

1. **Login Flow**:
   - Admin navigates to `/admin`
   - Enters static credentials
   - On success, session is stored in `sessionStorage`
   - Admin is redirected to dashboard

2. **Session Management**:
   - Uses `sessionStorage.setItem("adminAuth", "true")`
   - Session persists until browser tab is closed
   - Logout clears session and redirects to home

3. **Security Features**:
   - No database authentication (hardcoded)
   - Session-based access control
   - Error messages for invalid credentials
   - Automatic redirect on unauthorized access

### Code Reference

```typescript
// Static Admin Credentials
const ADMIN_EMAIL = "admin@food4u.com";
const ADMIN_PASSWORD = "admin123";

const handleLogin = (e: React.FormEvent) => {
  if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
    setIsAuthenticated(true);
    sessionStorage.setItem("adminAuth", "true");
    fetchAllData();
  }
};
```

---

## Dashboard Overview

### Main Sections

The admin dashboard has 4 main tabs:

1. **Overview** - Statistics and analytics
2. **Volunteers** - Manage volunteer accounts
3. **Donors** - Manage donor accounts
4. **Donations** - Manage all donations

### Features

- Real-time data refresh
- Responsive design for mobile/desktop
- Modern UI with premium aesthetics
- Search and filter capabilities

---

## Accounts Management

### Volunteer Management

**View All Volunteers**:
- List of all registered volunteers
- Display name, email, join date
- Show points and badge level

**Actions Available**:
- **Assign Badge**: Manually set volunteer badge
- **Delete Account**: Remove volunteer and their data

**Volunteer Data Shown**:
- Full name
- Email address
- Points earned
- Current badge
- Join date

### Donor Management

**View All Donors**:
- List of all registered donors
- Display name, email, join date
- Show points and badge level

**Actions Available**:
- **Delete Account**: Remove donor and their donations

**Donor Data Shown**:
- Full name
- Email address
- Points earned
- Current badge
- Join date
- Donation history (via filtering)

---

## Donation Management

### Features

**View All Donations**:
- Complete list of all donations
- Display title, location, food type
- Show status and urgency

**Filter Options**:
- **By Status**: All, Pending, Accepted, In Transit, Delivered
- **By Date**: All Time, Today, This Week, This Month

**Actions Available**:
- **View Details**: Navigate to donation detail page
- **Delete Donation**: Remove donation entry

### Donation Data Shown

- Title
- Description
- Food type
- Quantity
- Pickup location/city
- Status (pending/accepted/in_transit/delivered)
- Urgency level
- Created date
- Delivered date (if applicable)

---

## Statistics & Analytics

### Daily Statistics

Shows data for the current day:
- **Donations**: Number of donations created today
- **Active Volunteers**: Unique volunteers who accepted donations
- **Active Donors**: Unique donors who created donations

### Monthly Statistics

Shows data for the current month:
- **Monthly Donations**: Total donations this month
- **Active Volunteers**: Unique active volunteers
- **New Accounts**: New user registrations

### Overall Statistics

Shows all-time data:
- **Total Donations**: All donations ever created
- **Total Volunteers**: All registered volunteers
- **Total Donors**: All registered donors
- **Completed**: Total delivered donations

### Top Performers

- **Top Volunteer**: Highest points among volunteers
- **Top Donor**: Highest points among donors

### Status Distribution

Visual progress bars showing:
- Pending donations percentage
- In Transit donations percentage
- Completed donations percentage

---

## Points & Badge System

### How Points Are Calculated

Points are based on completed (delivered) donations:
- Each delivered donation = **10 points**

```typescript
const points = (donationCount || 0) * 10;
```

### Badge Levels

Automatically assigned based on points:

| Badge | Points Required |
|-------|----------------|
| Newcomer | 0-19 points |
| Bronze | 20-49 points |
| Silver | 50-99 points |
| Gold | 100+ points |

### Manual Badge Assignment

Admin can override automatic badges:
- Select volunteer from list
- Click badge icon
- Choose from: Newcomer, Bronze, Silver, Gold, Platinum, Diamond

---

## API & Database

### Database Tables Used

1. **profiles**
   - User information
   - Role (donor/volunteer)
   - Created date

2. **donations**
   - Donation details
   - Status tracking
   - Donor/Volunteer IDs

### Supabase Queries

**Fetch Users**:
```typescript
const { data: usersData } = await supabase
  .from("profiles")
  .select("*")
  .order("created_at", { ascending: false });
```

**Fetch Donations**:
```typescript
const { data: donationsData } = await supabase
  .from("donations")
  .select("*")
  .order("created_at", { ascending: false });
```

**Calculate Points**:
```typescript
const { count: donationCount } = await supabase
  .from("donations")
  .select("*", { count: "exact", head: true })
  .or(`donor_id.eq.${user.id},volunteer_id.eq.${user.id}`)
  .eq("status", "delivered");
```

**Delete User**:
```typescript
// Delete user's donations first
await supabase.from("donations").delete().eq("donor_id", userId);
// Then delete profile
await supabase.from("profiles").delete().eq("id", userId);
```

**Delete Donation**:
```typescript
await supabase.from("donations").delete().eq("id", donationId);
```

---

## Project Structure

### Admin Dashboard Files

```
src/
├── pages/
│   └── admin/
│       └── AdminDashboard.tsx    # Main admin dashboard
├── integrations/
│   └── supabase/
│       ├── client.ts             # Supabase client
│       └── types.ts              # Database types
└── components/
    └── ui/                       # Shared UI components
```

### Key Components Used

- `Card` - Container cards
- `Badge` - Status/role badges
- `Button` - Action buttons
- `Input` - Search inputs
- `Tabs` - Tab navigation
- `Dialog` - Modal dialogs
- `Select` - Dropdown selects
- `Progress` - Progress bars

---

## Role-Based Access Control

### Access Rules

| User Type | Access Level |
|-----------|-------------|
| Admin | Full access to admin dashboard |
| Donor | No access to admin |
| Volunteer | No access to admin |

### Implementation

```typescript
// Only admin@food4u.com with password admin123 can access
if (loginEmail === ADMIN_EMAIL && loginPassword === ADMIN_PASSWORD) {
  setIsAuthenticated(true);
}
```

No other signup or login allows access to the admin dashboard.

---

## Deployment

### Prerequisites

1. Node.js 18+
2. npm or yarn
3. Supabase project with:
   - `profiles` table
   - `donations` table

### Environment Variables

Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build & Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to hosting (Vercel, Netlify, etc.)
```

### Access Admin Dashboard

1. Navigate to `/admin`
2. Enter credentials:
   - Email: `admin@food4u.com`
   - Password: `admin123`

---

## Security Considerations

1. **Static Credentials**: Currently hardcoded. For production, consider:
   - Environment variables
   - Secure authentication service
   - Two-factor authentication

2. **Session Storage**: Uses `sessionStorage` which clears on tab close. For persistent sessions, use `localStorage` or cookies.

3. **Database Permissions**: Ensure Supabase RLS (Row Level Security) policies are configured properly.

---

## Future Enhancements

- [ ] Dynamic admin credentials from database
- [ ] Multiple admin roles (super admin, moderator)
- [ ] Export data to CSV/PDF
- [ ] Email notifications for critical events
- [ ] Advanced analytics with charts
- [ ] Audit log for admin actions
- [ ] Bulk actions (delete multiple, assign badges)

---

## Support

For issues or questions:
1. Check console for errors
2. Verify Supabase connection
3. Ensure credentials are correct
4. Clear browser storage and retry

---

**Documentation Version**: 1.0
**Last Updated**: November 2024
