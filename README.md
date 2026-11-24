# Yomna Mohamed — Premium Full Stack Developer Portfolio

A modern, responsive, creative developer portfolio website built for **Yomna Mohamed**, Full Stack Developer specializing in **Node.js**, **Express.js**, **Angular**, and scalable backend architectures.

---

## 🎨 Design Identity: Forest & Blush

- **Dark Mode (Forest)**:
  - Main background: `#181C14`
  - Secondary background: `#3C3D37`
  - Primary accent: `#697565`
  - Text highlight: `#ECDFCC`
- **Light Mode (Blush)**:
  - Main background: `#FFF5E4`
  - Secondary background: `#FFE3E1`
  - Primary accent: `#FFD1D1`
  - Secondary accent: `#FF9494`
  - Text highlight: `#C23348`

Theme preferences automatically persist in `localStorage` and smoothly synchronize across all cards, navigation, and background elements.

---

## 📁 Project Structure

```
protfprim/
├── index.html                 # Semantic HTML5 single-page portfolio
├── 404.html                   # Custom 404 error page
├── css/
│   ├── style.css              # Core typography, bento grid layout & theme variables
│   ├── animations.css         # Keyframes, ambient orbs, 3D tilt & scroll reveals
│   └── responsive.css         # Mobile-first breakpoints (320px, 375px, 640px, 860px, 1200px)
├── js/
│   ├── main.js                # Navbar, contact validation, email copy & modal logic
│   ├── animations.js          # Canvas particle background, custom cursor, tilt & scroll progress
│   ├── github-projects.js     # Live public GitHub API repository fetcher with caching
│   └── theme.js               # Dark/Light theme toggle & persistence engine
├── assets/
│   ├── images/                # Store profile.jpg here
│   ├── icons/                 # Custom SVG icons
│   └── cv/                    # Store Yomna-Mohamed-CV.pdf here
└── README.md                  # Comprehensive instructions & deployment guide
```

---

## 🚀 How to Customize

### 1. Adding Your Personal Photo
Place your portrait photo inside:
```
assets/images/profile.jpg
```
* **Supported formats**: `.jpg`, `.jpeg`, or `.png`.
* **Automatic Detection**: When `profile.jpg` is present in `assets/images/`, the website displays it inside the organic frame. Until then, an initial placeholder with your monogram `YM` is shown.

---

### 2. Adding Your CV / Resume (PDF)
Place your resume PDF inside:
```
assets/cv/Yomna-Mohamed-CV.pdf
```
* The **"Download CV"** button in the hero section and navigation will download this exact PDF.
* If clicked before adding the file, a CV preview modal opens with a **Print / Save as PDF** option.

---

### 3. Configuring GitHub Repositories & Live Demos
The projects section connects to your GitHub account (`@Yomnaaa1`) via the public REST API:
```
https://api.github.com/users/Yomnaaa1/repos
```

Open `js/github-projects.js` to configure:
1. **Exclusion List**: Exclude test, experimental, or empty repositories:
   ```javascript
   const exclusionList = ['test', 'practice', 'sandbox', 'temp'];
   ```
2. **Featured Projects**: Repositories marked with a prominent `★ Featured` badge:
   ```javascript
   const featuredList = [
     'e-commerce-api',
     'task-management-system',
     'angular-dashboard'
   ];
   ```
3. **Live Demo URLs**: Map repository names to their live web deployments:
   ```javascript
   const liveDemoMap = {
     'e-commerce-api': 'https://ecommerce.yomna.dev',
     'angular-dashboard': 'https://dashboard.yomna.dev'
   };
   ```
* **Smart Caching**: Fetched repositories are cached in `localStorage` for 1 hour to prevent hitting GitHub's 60 requests/hour unauthenticated rate limit. Visitors can also click the **"Sync Repos"** button to force an instant refresh.

---

### 4. Contact Information & Email Form
Your confirmed real contact information is integrated across the website:
- **Email**: `Yomna.mohamed.dev@gmail.com`
- **WhatsApp**: `+20 102 269 3040` (`https://wa.me/201022693040`)
- **LinkedIn**: `https://www.linkedin.com/in/yomnamohammed-dev/`
- **GitHub**: `https://github.com/Yomnaaa1`

The contact form performs client-side validation. Upon submission, it provides:
1. A direct pre-filled **"Open in Email App"** link (`mailto:Yomna.mohamed.dev@gmail.com?subject=...&body=...`).
2. A direct **"WhatsApp Direct"** link.
3. *Optional*: You can easily connect the form to [Formspree](https://formspree.io) or [EmailJS](https://www.emailjs.com/) by replacing the form action in `index.html`.

---

## 🌐 How to Publish Online (Free Hosting)

### Option A: Netlify Drop (Fastest — 30 Seconds)
1. Open [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `protfprim` folder into your browser.
3. Netlify will publish your portfolio immediately and generate a live URL.

### Option B: GitHub Pages (Recommended for Developers)
1. Create a new repository on your GitHub account (`Yomnaaa1`), named e.g. `portfolio`.
2. Push or upload the folder contents directly into the repository.
3. Go to **Settings** > **Pages**.
4. Under **Branch**, select `main` (or `master`) and `/root`, then click **Save**.
5. Your portfolio will be live at:
   ```
   https://Yomnaaa1.github.io/portfolio/
   ```

### Option C: Vercel
1. Install the Vercel CLI (`npm i -g vercel`) or sign in at [vercel.com](https://vercel.com).
2. Import your GitHub repository or run `vercel` in this folder.
3. Your portfolio deploys automatically on every push.

---

## 📱 Mobile & Responsive Testing
The layout is tested and optimized for:
- 320px & 375px (Small mobile screens)
- 425px & 640px (Standard mobile screens)
- 768px & 860px (Tablets & mobile drawer menu)
- 1024px & 1200px (Laptops & desktop split hero)
- 1440px+ (High-resolution monitors)
