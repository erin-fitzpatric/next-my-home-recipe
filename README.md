# My Home Recipe App

A modern recipe management application built with Next.js 15, TypeScript, and MongoDB. Manage your recipes, create smart shopping lists, and organize your cooking with a beautiful, responsive interface.

🌐 **Live Demo**: [https://recipe.erinfitzpatric.com](https://recipe.erinfitzpatric.com)

## ✨ Features

### Recipe Management
- 📝 Add, edit, and organize recipes with ingredients and instructions
- 🏷️ Tag system with difficulty levels (Easy, Medium, Hard)
- 🖼️ Recipe images via URL
- 🔍 Search and filter by title, tags, or difficulty
- 📱 Responsive design for all devices

### Smart Shopping Cart
- 🛒 Add individual items or entire recipe ingredients
- 🧮 **Smart consolidation** - automatically groups and combines quantities
- ✅ Track completion with checkboxes
- 🏷️ Visual distinction between recipe and manual items
- 🔄 Unit conversion system (cups, teaspoons, pounds, etc.)

### User Experience
- 🔐 Secure Google OAuth authentication
- 🎨 Beautiful UI with shadcn/ui components
- ⚡ Fast performance with Next.js 15 App Router
- 📊 Clean dashboard with card and table views

## 🚀 Quick Start

### 🌐 Try the Live App
Visit [https://recipe.erinfitzpatric.com](https://recipe.erinfitzpatric.com) to use the app immediately!

### 💻 Local Development

#### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google OAuth credentials

#### Installation

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd next-my-home-recipe
   pnpm install
   ```

2. **Environment setup**
   Create `.env.local`:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

3. **Run development server**
   ```bash
   pnpm dev
   ```

4. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB Atlas with Mongoose
- **UI**: shadcn/ui components with Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: pnpm

## 📁 Project Structure

```
app/
├── api/                 # API routes
├── dashboard/           # Main dashboard
├── recipe/[id]/        # Recipe pages
├── shopping-cart/      # Shopping cart
└── auth/               # Authentication

components/
├── ui/                 # shadcn/ui components
├── add-item-modal.tsx  # Shopping cart modal
├── navigation.tsx      # Main navigation
└── recipe-form.tsx     # Unified recipe form

models/
├── Recipe.ts           # Recipe schema
├── ShoppingCart.ts     # Shopping cart schema
└── UserProfile.ts      # User preferences

lib/
├── mongodb.ts          # Database connection
└── ingredient-consolidation.ts  # Smart grouping logic
```

## 🎯 Development Status

### ✅ Production Ready
- **Live Application**: Deployed at [recipe.erinfitzpatric.com](https://recipe.erinfitzpatric.com)
- **Custom Domain**: Configured with Namecheap DNS
- **Production Database**: MongoDB Atlas with proper network access
- **OAuth Authentication**: Google OAuth published and verified
- **SSL Certificate**: Automatic HTTPS via Vercel

### ✅ Current Features
- Complete recipe CRUD operations
- Smart shopping cart with consolidation
- Individual item addition to cart
- Unit conversion and quantity aggregation
- Google OAuth authentication
- Responsive design
- Production deployment on Vercel

### 🚧 Future Enhancements
- Recipe import/export functionality
- Meal planning with calendar integration
- Recipe sharing between users
- Advanced search filters
- PWA capabilities for mobile app experience
- Recipe analytics and favorites tracking

## 🔧 Development

**Important**: Always use `pnpm` - never mix with npm install

```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # Code quality check
```

## 🚀 Deployment

This app is deployed on **Vercel** with:
- **Custom domain**: recipe.erinfitzpatric.com
- **Automatic deployments**: Every push to main branch
- **Environment variables**: Securely configured in Vercel dashboard
- **MongoDB Atlas**: Production database with network access configured
- **Google OAuth**: Published app with production credentials

### Deploy Your Own Instance
1. Fork this repository
2. Connect to Vercel via GitHub
3. Configure environment variables
4. Set up custom domain (optional)
5. Configure MongoDB Atlas network access
6. Publish Google OAuth consent screen

## 📝 License

MIT License

## 🙏 Acknowledgments

Built with [Next.js](https://nextjs.org), [shadcn/ui](https://ui.shadcn.com), and [MongoDB](https://mongodb.com)