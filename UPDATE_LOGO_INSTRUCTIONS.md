# 🎨 Logo Update Instructions

## Current Logo Location
The logo is located at: `src/assets/logo.svg`

## Files Using the Logo
The following files import and use the logo:
1. `src/pages/Landing.tsx` - Main landing page (top-left navbar + modal)
2. `src/pages/Auth.tsx` - Authentication page
3. `src/pages/donor/DonorDashboard.tsx` - Donor dashboard header
4. `src/pages/volunteer/VolunteerDashboard.tsx` - Volunteer dashboard header

---

## ✅ How to Replace the Logo

### Method 1: Replace the SVG file directly (RECOMMENDED)
1. Save your new logo image as `logo.svg` or `logo.png`
2. Navigate to `src/assets/`
3. Replace the existing `logo.svg` with your new file
4. **Important:** Keep the same filename (`logo.svg`) so imports don't break
5. If using PNG instead of SVG:
   - Save as `logo.png` in `src/assets/`
   - Update all imports from `logo.svg` to `logo.png`

### Method 2: Add new logo and update imports
1. Save your new logo as `logo-new.png` in `src/assets/`
2. Update the import in these 4 files:
   ```typescript
   // Change this:
   import logo from "@/assets/logo.svg";

   // To this:
   import logo from "@/assets/logo-new.png";
   ```

---

## 📐 Recommended Logo Specifications

Based on your new logo design with tagline:

### **For Best Results:**
- **Format:** PNG with transparent background (or SVG)
- **Dimensions:**
  - Square ratio: 400x400px to 800x800px
  - OR Rectangle: 800x600px (if including tagline)
- **File size:** Under 200KB for fast loading
- **Resolution:** 72-96 DPI for web

### **Logo Elements (from your image):**
- Heart-shaped design with fork and spoon
- Apple/heart icon in center
- "FOOD 4 U" text
- Tagline: "Made with ❤ for a hunger-free world"
- Color scheme: Teal/Dark green border with gold/orange accents

---

## 🎯 Usage in Different Contexts

### 1. **Landing Page (Navbar)**
- **Current size:** `w-10 h-10` (40x40px)
- **Recommended:** Use just the icon (without tagline text) for navbar
- **Location:** `src/pages/Landing.tsx:61`

### 2. **Landing Page (Modal)**
- **Current size:** `w-32 h-32` (128x128px)
- **Recommended:** Use full logo with tagline
- **Location:** `src/pages/Landing.tsx:265`

### 3. **Auth Page**
- **Current size:** `w-24 h-24` (96x96px)
- **Recommended:** Use icon only or medium-sized logo
- **Location:** `src/pages/Auth.tsx`

### 4. **Dashboard Headers**
- **Current size:** `w-10 h-10` (40x40px)
- **Recommended:** Use icon only for compact header
- **Locations:**
  - `src/pages/donor/DonorDashboard.tsx`
  - `src/pages/volunteer/VolunteerDashboard.tsx`

---

## 🛠️ Two Logo Versions Recommended

For optimal display, create TWO versions:

### **Version 1: Icon Only** (`logo-icon.png`)
- Just the heart/fork/spoon design
- Square format (400x400px)
- Use in: Navbar, Dashboards, Small spaces
- No tagline text

### **Version 2: Full Logo** (`logo-full.png`)
- Icon + "FOOD 4 U" + tagline
- Rectangle format (800x600px)
- Use in: Modal, Auth page, Large displays
- Includes all text

---

## 📝 Quick Replace Steps

### Option A: Replace SVG (Easiest)
```bash
# 1. Navigate to assets folder
cd src/assets/

# 2. Backup old logo (optional)
mv logo.svg logo-old.svg

# 3. Add your new logo as logo.svg
# (Copy your new logo file here and rename to logo.svg)

# 4. Done! No code changes needed
```

### Option B: Use PNG instead
1. Save new logo as `logo.png` in `src/assets/`
2. Replace in 4 files:
   - `src/pages/Landing.tsx:4`
   - `src/pages/Auth.tsx:12`
   - `src/pages/donor/DonorDashboard.tsx:38`
   - `src/pages/volunteer/VolunteerDashboard.tsx:28`
3. Change: `import logo from "@/assets/logo.svg"` to `import logo from "@/assets/logo.png"`

---

## ✨ Your New Logo Design

Based on the image you showed:
- ✅ Circular design with teal border
- ✅ Heart shape with fork & spoon
- ✅ Red apple/heart icon in center
- ✅ "FOOD 4 U" in bold dark text
- ✅ Tagline: "Made with ❤ for a hunger-free world"
- ✅ Professional, clean, and compassionate design

---

## 🎨 Color Codes (from your logo)

- **Teal Border:** `#4A7C7E` or similar
- **Gold/Orange Accents:** `#D4A574`
- **Text:** `#2C3E50` (dark)
- **Red Heart:** `#E74C3C`
- **Green Leaf:** `#27AE60`

---

## 🚀 After Replacing

1. **Clear cache:** `npm run build`
2. **Test all pages:**
   - ✅ Landing page
   - ✅ Auth page
   - ✅ Donor dashboard
   - ✅ Volunteer dashboard
   - ✅ Logo modal
3. **Check sizing:** Logo should be clear and not pixelated
4. **Mobile test:** Verify logo displays well on mobile

---

**Made with ❤️ for a hunger-free KARNATAKA**
*Where Technology Meets Compassion*
