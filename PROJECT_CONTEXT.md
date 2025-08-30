# My Home Recipe - Project Context & Rules

## 📋 Project Overview
**My Home Recipe** is a Next.js 15 recipe management application with Google OAuth authentication, MongoDB database, and a modern UI built with shadcn/ui components.

## 🤖 AI Assistant Quick Rules
> **READ THIS FIRST**: Essential rules for AI assistants working on this project

### **🔧 Package Management - CRITICAL**
- **ALWAYS use `pnpm`** - never `npm install` (will break dependencies)
- Commands: `pnpm add`, `pnpm install`, `pnpm run dev`, `pnpm run build`
- Lock file: `pnpm-lock.yaml` (never create package-lock.json)

### **🏗️ Tech Stack Essentials**
- Next.js 15 with **App Router** (NOT Pages Router)
- NextAuth.js v4 with **MongoDB adapter** (handles all auth data)
- **Custom UserProfile** model ONLY for app preferences (NOT auth data)
- Always use Next.js `<Image>` component, never `<img>`
- shadcn/ui components, not raw HTML elements

### **🚫 Never Do**
- Mix npm and pnpm commands
- Duplicate authentication fields in custom models  
- Use console.log in production code
- Ignore TypeScript errors
- Use `<img>` tags or raw HTML elements

### **✅ Always Do**  
- Use `await dbConnect()` before database operations
- Check user session before protected operations
- Use `@/` imports for absolute paths
- Test with `pnpm run build` before completion

## 🏗️ Architecture & Tech Stack

### **Core Technologies**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js v4 with Google OAuth provider
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **Package Manager**: pnpm (NEVER use npm install, always use pnpm)

### **Key Dependencies**
```json
{
  "next": "15.5.2",
  "react": "19.1.0",
  "next-auth": "4.24.11",
  "@auth/mongodb-adapter": "3.10.0",
  "mongoose": "8.18.0",
  "mongodb": "6.19.0",
  "tailwindcss": "4.1.12",
  "typescript": "5.9.2"
}
```

## 📁 Project Structure

```
next-my-home-recipe/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/   # NextAuth.js API routes
│   ├── auth/signin/              # Custom sign-in page
│   ├── dashboard/                # Main dashboard (protected)
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Landing page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── navigation.tsx            # App navigation with user menu
│   └── providers.tsx             # NextAuth SessionProvider
├── lib/
│   ├── mongodb.ts                # Mongoose connection utility
│   └── utils.ts                  # shadcn/ui utility functions
├── models/                       # Mongoose schemas
│   ├── UserProfile.ts            # User preferences (NOT auth data)
│   ├── Recipe.ts                 # Recipe schema
│   ├── Ingredient.ts             # Ingredient schema
│   └── ShoppingCart.ts           # Shopping cart schema
├── types/                        # TypeScript type definitions
├── .env.local                    # Environment variables
└── pnpm-lock.yaml                # ALWAYS use pnpm, never npm
```

## 🔐 Authentication Architecture

### **NextAuth.js with MongoDB Adapter**
- **Provider**: Google OAuth only
- **Database**: MongoDB Atlas with automatic user/account/session collections
- **User Management**: NextAuth handles all authentication data
- **Custom Data**: UserProfile model stores app-specific preferences only

### **Clean Separation of Concerns**
```typescript
// NextAuth handles (automatic):
- users collection (OAuth user data)
- accounts collection (OAuth account linking)
- sessions collection (session management)

// Custom UserProfile handles (manual):
- App preferences (measurement system, dietary restrictions)
- UI preferences (default view: cards vs table)
- Links to NextAuth user via userId field
```

## 🗃️ Database Schema

### **MongoDB Collections**
1. **users** (NextAuth managed) - OAuth user data
2. **accounts** (NextAuth managed) - OAuth account connections  
3. **sessions** (NextAuth managed) - User sessions
4. **userprofiles** (Custom) - App-specific user preferences
5. **recipes** (Custom) - Recipe data
6. **ingredients** (Custom) - Ingredient library
7. **shoppingcarts** (Custom) - Shopping cart items

### **Business Rules**
- One UserProfile per NextAuth user (1:1 relationship)
- UserProfile created automatically on first dashboard visit
- Recipes belong to users (user can only see their own recipes)
- Ingredients are shared across all users (global library)
- Shopping carts are user-specific

## 🎨 UI/UX Standards

### **Design System**
- **Color Scheme**: Slate (shadcn/ui default)
- **Components**: Always use shadcn/ui components, never raw HTML
- **Icons**: Lucide React icons only
- **Images**: Always use Next.js `<Image>` component, never `<img>`
- **Forms**: React Hook Form with Zod validation

### **Layout Patterns**
- **Navigation**: Top navigation with user avatar dropdown
- **Cards**: Recipe cards with hover effects
- **Tables**: Data tables with sorting/filtering
- **Responsive**: Mobile-first design approach

## 🔧 Development Rules

### **Package Management**
```bash
# ✅ ALWAYS USE PNPM
pnpm install           # Install dependencies
pnpm add <package>     # Add new package
pnpm run dev          # Start development
pnpm run build        # Build for production

# ❌ NEVER USE NPM FOR PACKAGE MANAGEMENT
# npm install will create conflicts with pnpm-lock.yaml
```

### **Code Quality Standards**
- **TypeScript**: Strict mode enabled, no `any` types
- **ESLint**: All rules must pass before deployment
- **File Naming**: kebab-case for files, PascalCase for components
- **Imports**: Absolute imports using `@/` alias
- **Error Handling**: Always handle errors gracefully, no console.log in production

### **Database Connection**
```typescript
// ALWAYS use the centralized connection utility
import dbConnect from '@/lib/mongodb';

// Connect before any database operations
await dbConnect();
```

### **Authentication Checks**
```typescript
// Server Components
import { getServerSession } from 'next-auth';

// Client Components  
import { useSession } from 'next-auth/react';
```

## � Current Development Status

### **Completed Features (Phase 1 & 2)**
- ✅ **Authentication System**: Google OAuth with NextAuth.js and MongoDB adapter
- ✅ **Recipe CRUD**: Full create, read, update, delete functionality
- ✅ **Unified Recipe Form**: Single component handles both add and edit modes (568 lines)
- ✅ **Advanced Recipe Features**: Flexible insertion, reordering, auto-numbering
- ✅ **Search & Filtering**: Advanced dashboard with multiple filter options
- ✅ **Recipe Duplication**: Copy recipes with smart naming
- ✅ **Tag System**: Preset + custom tags with color-coded badges
- ✅ **Image Integration**: Next.js Image component with external URL support
- ✅ **Shopping Cart**: Basic add-to-cart, completion tracking, bulk operations
- ✅ **Database Models**: Recipe, User, UserProfile, ShoppingCart schemas
- ✅ **API Routes**: Complete REST API for all operations
- ✅ **TypeScript**: 100% strict mode compliance across entire codebase

### **Current Challenge (Phase 3)**
- 🔄 **Shopping Cart Consolidation**: Eliminate duplicate ingredient line items
- 🔄 **Ingredient Standardization**: Handle spelling variations and unit differences
- 🔄 **Smart Grouping**: Consolidate "1 cup flour" + "2 cups flour" = "3 cups flour"

### **Technical Debt & Known Issues**
- ⚠️ **Ingredient Duplicates**: Same ingredients appear as separate cart items
- ⚠️ **Free-text Input**: No ingredient validation leads to inconsistencies
- ⚠️ **Unit Conversion**: No conversion between different measurement systems
- ⚠️ **Performance**: All recipes loaded at once (needs pagination for scale)

### **Code Quality Metrics**
- **Lines of Code Reduction**: 48% reduction through form consolidation
- **Component Reusability**: Unified form eliminates code duplication
- **Type Safety**: Zero TypeScript errors in strict mode
- **Performance**: Next.js 15 optimizations with App Router

## �🚀 Deployment & Environment

### **Environment Variables Required**
```env
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000 (dev) / https://yourdomain.com (prod)
```

### **Build Process**
```bash
pnpm run build        # Must pass with 0 errors, 0 warnings
pnpm run start        # Production server
```

## 🎯 Business Logic & Current Implementation

### **Recipe Management (✅ Fully Implemented)**
- **CRUD Operations**: Create, read, update, delete recipes with unified form component
- **Advanced Features**: Dynamic ingredient/instruction arrays with flexible insertion anywhere
- **Recipe Duplication**: Copy existing recipes with automatic "(Copy)" suffix
- **Search & Filtering**: Advanced search by title, description, tags, and difficulty level
- **Tag System**: Preset tags (breakfast, lunch, dinner, etc.) + custom tag creation
- **Difficulty Levels**: Easy/Medium/Hard with color-coded badges
- **Image Support**: URL-based recipe images with Next.js Image optimization
- **Reordering Interface**: Up/down arrows for ingredients/instructions with auto-numbering

### **User Management (✅ Implemented)**
- **Authentication**: Google OAuth with NextAuth.js
- **Profile System**: Automatic UserProfile creation on first dashboard visit
- **Data Isolation**: Users can only view/edit their own recipes (complete privacy)

### **Shopping Cart System (✅ Basic Implementation Complete)**
- **Add to Cart**: Generate shopping lists from recipe ingredients
- **Item Management**: Mark items as completed, remove individual items
- **Bulk Operations**: Clear all completed items, clear entire cart
- **Recipe Association**: Each cart item shows which recipe it came from
- **Current Limitation**: Duplicate ingredients appear as separate line items (Phase 3 focus)

## 🔄 Development Workflow

### **Phase 1: ✅ COMPLETED**
- Project setup with Next.js 15 + TypeScript
- shadcn/ui component library setup
- Google OAuth authentication with NextAuth.js
- MongoDB Atlas database connection
- Basic navigation and dashboard structure

### **Phase 2: ✅ COMPLETED**
- **Recipe Management System**: Full CRUD operations with unified form component
- **Advanced Recipe Features**: Dynamic ingredients/instructions, flexible insertion, reordering
- **Recipe Display & Search**: Dashboard with advanced filtering, search by title/tags/difficulty
- **Recipe Duplication**: Copy recipes with automatic naming
- **Image Support**: URL-based recipe images with Next.js Image optimization
- **Tag System**: Preset tags + custom tag creation with color-coded badges
- **Difficulty Levels**: Easy/Medium/Hard classification
- **Shopping Cart Integration**: Add recipe ingredients to cart, completion tracking

### **Phase 3: � IN PROGRESS - Shopping Cart Enhancement**
- **Current Focus**: Ingredient consolidation (grouping duplicate ingredients)
- **Unit Conversion System**: Handle different measurement units intelligently
- **Ingredient Standardization**: Reduce duplicates from spelling variations
- **Smart Matching**: Fuzzy string matching for ingredient names

### **Phase 4: 📋 PLANNED**
- Recipe import/export functionality
- Meal planning with automated shopping lists
- User profile management and preferences
- Recipe sharing between users

## ⚠️ Critical Reminders

1. **ALWAYS use pnpm** - never mix with npm install
2. **NextAuth manages users** - don't duplicate auth data in custom models
3. **Use Next.js Image component** - never use `<img>` tags
4. **TypeScript strict mode** - handle all type errors
5. **Environment variables** - never commit secrets to git
6. **Database connection** - always use the centralized utility
7. **Error handling** - no console.log in production code
8. **Authentication** - check user session before protected operations

## 📝 Notes for AI Assistants

When working on this project:
- Read this file first to understand the context
- Follow the established patterns and conventions
- Use the specified tech stack and tools
- Respect the clean architecture separation
- Always test build process before completing work
- Update this file when making architectural changes
