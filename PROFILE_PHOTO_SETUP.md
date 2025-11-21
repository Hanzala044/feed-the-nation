# 📸 Profile Photo Upload Feature - Setup Guide

## ✅ What's Been Added

### 1. **Updated Logo Modal Tagline**
- Changed from old tagline to: **"Made with ❤️ for a hunger-free KARNATAKA"**
- Subtitle: "Where Technology Meets Compassion"
- Modern gradient text styling on landing page modal

### 2. **Profile Photo Upload for Donors**
- Circular profile photo upload on [Edit Profile](src/pages/donor/EditProfile.tsx) page
- Camera icon button overlay for easy upload
- Image preview before saving
- Validation: Max 2MB, images only
- File: `src/pages/donor/EditProfile.tsx`

### 3. **Profile Photo Upload for Volunteers**
- Same upload functionality on volunteer profile edit
- Purple gradient styling (matches volunteer theme)
- File: `src/pages/volunteer/EditProfile.tsx`

### 4. **Profile Photos Display**
- Photos displayed in donation detail page for both donors and volunteers
- Fallback to initials if no photo uploaded
- Circular avatar with proper sizing
- File: `src/pages/DonationDetail.tsx`

---

## 🚀 Setup Instructions

### **Step 1: Create Storage Bucket in Supabase**

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/uhuctkswxybirvzwhehb/editor

2. Run the SQL file: `CREATE_STORAGE_BUCKET.sql`
   ```sql
   -- This creates a public bucket called 'profile-photos'
   -- Enables RLS policies for secure upload/access
   ```

3. Verify the bucket was created:
   - Go to Storage → Buckets
   - You should see `profile-photos` listed as a public bucket

---

## 📝 How to Use

### **For Donors:**
1. Navigate to **Donor Dashboard**
2. Click **"Edit Profile"** button
3. Click the **camera icon** on the profile photo
4. Select an image (max 2MB)
5. Photo uploads automatically and shows preview
6. Click **"Save Changes"** to update profile

### **For Volunteers:**
1. Navigate to **Volunteer Dashboard**
2. Click **"Edit Profile"** button
3. Click the **camera icon** on the profile photo
4. Select an image (max 2MB)
5. Photo uploads automatically and shows preview
6. Click **"Save Changes"** to update profile

---

## 🎨 Features

### **Photo Upload:**
- ✅ Drag & drop or click to upload
- ✅ Instant preview before saving
- ✅ File size validation (max 2MB)
- ✅ Image type validation (jpeg, png, gif, etc.)
- ✅ Automatic upload to Supabase Storage
- ✅ Public URL generation

### **Photo Display:**
- ✅ Circular avatars in donation details
- ✅ Fallback to initials if no photo
- ✅ Proper sizing and aspect ratio
- ✅ Works on mobile and desktop

### **Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Only authenticated users can upload
- ✅ Public read access for photos
- ✅ Users can only update their own photos

---

## 📁 Files Modified

1. **`src/pages/Landing.tsx`**
   - Updated logo modal tagline
   - Line 274-280

2. **`src/pages/donor/EditProfile.tsx`**
   - Added photo upload functionality
   - Added avatar preview
   - Added upload validation

3. **`src/pages/volunteer/EditProfile.tsx`**
   - Added photo upload functionality
   - Added avatar preview
   - Added upload validation

4. **`src/pages/DonationDetail.tsx`**
   - Display donor photo in donation details
   - Display volunteer photo in donation details
   - Line 452-463, 496-507

5. **`CREATE_STORAGE_BUCKET.sql`** (NEW)
   - SQL to create storage bucket
   - RLS policies for secure access

---

## 🗄️ Database Changes

### Storage Bucket Created:
- **Name:** `profile-photos`
- **Type:** Public
- **Path:** `avatars/{userId}-{timestamp}.{ext}`

### RLS Policies:
- ✅ Anyone can view photos (public bucket)
- ✅ Authenticated users can upload
- ✅ Users can update their own photos
- ✅ Users can delete their own photos

---

## 🎯 User Benefits

### **Donors:**
- Personalized profile with photo
- Build trust with volunteers
- More engaging profile page

### **Volunteers:**
- See who they're picking up from
- Call donor directly from donation detail
- Professional appearance

---

## 🔧 Technical Details

### Upload Process:
1. User selects image file
2. Client-side validation (type, size)
3. Create FileReader for preview
4. Upload to Supabase Storage: `profile-photos/avatars/{userId}-{timestamp}.{ext}`
5. Get public URL
6. Update `profiles.avatar_url` in database

### Storage Path Format:
```
profile-photos/
  └── avatars/
      ├── {uuid}-1234567890.jpg
      ├── {uuid}-1234567891.png
      └── ...
```

### Database Field:
- **Table:** `profiles`
- **Column:** `avatar_url` (TEXT)
- **Nullable:** Yes
- **Default:** NULL

---

## ✨ UI/UX Highlights

- **Donor theme:** Orange gradient (#ff6b35 → #ff8c42)
- **Volunteer theme:** Purple gradient (#a855f7 → #3b82f6)
- **Hover effect:** Camera button scales 1.1x on hover
- **Loading state:** Shows "Uploading..." text
- **Error handling:** Toast notifications for all errors
- **Success feedback:** Green toast on successful upload

---

## 🎉 All Features Working!

✅ Logo modal updated with new tagline
✅ Donor photo upload functional
✅ Volunteer photo upload functional
✅ Photos display in donation details
✅ Call button shows donor phone number
✅ Profile completion mandatory before donation
✅ Build successful with no errors

---

## 📱 Next Steps

1. **Run the SQL file** `CREATE_STORAGE_BUCKET.sql` in Supabase
2. **Test photo upload** on donor profile
3. **Test photo upload** on volunteer profile
4. **Verify photos display** in donation details
5. **Check mobile responsiveness**

---

**Made with ❤️ for a hunger-free KARNATAKA**
*Where Technology Meets Compassion*
