# My Home Recipe## � Current Status: Phase 3 Complete, Phase 4 PlanningApp

A modern, ful### ✅ **Phase 3: Advanced Features (Complete)**
- **Shopping Cart Consolidation** - Smart ingredient grouping and quantity aggregation ✅
- **Unit Conversion System** - Handle different measurement units ✅
- **Ingredient Standardization** - Reduce duplicates from spelling variations ✅
- **Mixed Completion States** - Handle partially completed consolidated groups ✅
- **Parent Checkbox Control** - Toggle all items in consolidated groups ✅
- **Recipe Tag Transparency** - Show which recipes contributed to consolidated items ✅

### 🔮 **Phase 4: Next Steps (Future)**
- **Recipe Import/Export** - JSON/CSV import/export functionality
- **Meal Planning** - Weekly meal planning with automatic shopping lists
- **User Profile Management** - Settings, preferences, dietary restrictions
- **Recipe Sharing** - Share recipes between usersack recipe management application built with Next.js 15, TypeScript, and MongoDB. Manage your recipes, create shopping lists, and organize your cooking with a beautiful, responsive interface.

## � Current Status: Phase 2 Complete, Phase 3 In Progress

### ✅ **Phase 1: Authentication & Foundation (Complete)**
- **Google OAuth Authentication** - Secure login with Google accounts
- **Next.js 15 App Router** - Modern React framework with TypeScript
- **shadcn/ui Components** - Beautiful, accessible UI components
- **MongoDB Atlas Integration** - Cloud database with Mongoose ODM
- **Protected Routes** - Authentication-required pages
- **Responsive Design** - Works on desktop, tablet, and mobile

### ✅ **Phase 2: Recipe Management System (Complete)**
- **Unified Recipe Form** - Single component for adding and editing recipes
- **Advanced Recipe Features**:
  - Dynamic ingredient and instruction lists
  - Flexible insertion (add items anywhere, not just at end)
  - Reordering with up/down arrows
  - Auto-updating step numbers
  - Recipe images via URL
  - Difficulty levels (Easy, Medium, Hard)
  - Tag system with preset and custom tags
- **Recipe Display & Management**:
  - Dashboard with card and table views
  - Advanced search and filtering (by title, tags, difficulty)
  - Recipe duplication with automatic "(Copy)" suffix
  - Full CRUD operations (Create, Read, Update, Delete)
  - Individual recipe view pages
- **Shopping Cart Integration**:
  - Add recipe ingredients to shopping cart
  - Shopping list management with completion tracking
  - Clear completed items and full cart clearing

### � **Phase 3: Advanced Features (In Progress)**
- **Shopping Cart Consolidation** - Smart ingredient grouping and quantity aggregation
- **Unit Conversion System** - Handle different measurement units
- **Ingredient Standardization** - Reduce duplicates from spelling variations

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB Atlas with Mongoose ODM
- **Form Management**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with CSS variables for theming
- **Icons**: Lucide React
- **Package Manager**: pnpm (NEVER use npm install)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next-my-home-recipe
   ```

2. **Install dependencies (ALWAYS use pnpm)**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

4. **Run the development server**
   ```bash
   pnpm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── add-recipe/        # Add new recipe page
│   ├── dashboard/         # Main dashboard
│   ├── recipe/[id]/       # Individual recipe pages
│   │   ├── edit/         # Edit recipe page
│   │   └── page.tsx      # View recipe page
│   ├── shopping-cart/     # Shopping cart page
│   └── auth/             # Authentication pages
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── navigation.tsx    # Main navigation component
│   ├── recipe-form.tsx   # Unified add/edit recipe form
│   └── recipe-display.tsx # Dashboard recipe display
├── lib/                  # Utility functions and configurations
│   ├── recipe-constants.ts # Shared recipe types and schemas
│   ├── mongodb.ts        # Database connection
│   └── auth.ts          # NextAuth configuration
├── models/               # MongoDB/Mongoose schemas
│   ├── Recipe.ts         # Recipe data model
│   ├── User.ts          # User data model
│   └── ShoppingCart.ts   # Shopping cart items model
└── types/               # TypeScript type definitions
```

## 📊 Current Development Status

### **Code Quality Metrics**
- **Form Consolidation**: Reduced code by 48% (1,213 → 629 lines)
- **TypeScript Coverage**: 100% strict mode compliance
- **Component Reusability**: Unified recipe form handles both add/edit modes
- **Performance**: Next.js 15 App Router with automatic optimizations

### **Database Schema**
- **Recipe Model**: Complete with ingredients, instructions, tags, difficulty, images
- **User Model**: NextAuth integration with Google OAuth
### **API Routes**
- `GET/POST /api/recipes` - Recipe CRUD operations
- `GET/PUT/DELETE /api/recipes/[id]` - Individual recipe management
- `GET/POST/DELETE /api/shopping-cart` - Shopping cart operations
- `PATCH/DELETE /api/shopping-cart/[id]` - Individual item operations

### **Key Features Implemented**
- **Smart Consolidation**: Automatically groups ingredients by normalized names
- **Unit Conversion**: Supports volume (teaspoons to gallons), weight (mg to tons), and seasoning units
- **Mixed States**: Handles partial completion in consolidated groups
- **Recipe Transparency**: Shows which recipes contributed to each consolidated ingredient
- **Bulk Operations**: Efficient parent checkbox controls for group completion
- **Performance**: Real-time consolidation with memoized calculations

## 🎯 Next Steps (Phase 4)

### **Immediate Priority: Recipe Enhancement**
1. **Recipe Import/Export** - JSON/CSV import/export functionality
2. **Meal Planning** - Weekly meal planning with automatic shopping lists
3. **User Profile Management** - Settings, preferences, dietary restrictions

### **Medium Term Goals**
1. **Recipe Sharing** - Share recipes between users
2. **Advanced Search** - Full-text search with filters
3. **Recipe Collections** - Organize recipes into custom collections
4. **Nutritional Information** - Add calorie and nutrition tracking

### **Long Term Vision**
1. **Mobile App** - React Native version
2. **Offline Support** - PWA capabilities
3. **Recipe Analytics** - Cooking frequency, favorite recipes
4. **AI Suggestions** - Recipe recommendations based on preferences

## 🔧 Development Guidelines

### **Critical Rules**
- **ALWAYS use pnpm** - never mix with npm install
- **NextAuth manages users** - don't duplicate auth data in custom models
- **Use Next.js Image component** - never use `<img>` tags
- **TypeScript strict mode** - handle all type errors
- **Environment variables** - never commit secrets to git

### **Testing & Validation**
```bash
pnpm run build        # Must pass with 0 errors
pnpm run dev          # Development server
pnpm run lint         # Code quality check
```

## 🤝 Contributing

This is a personal project, but contributions and suggestions are welcome! Feel free to:
- Report bugs or suggest features
- Submit pull requests
- Share feedback on the user experience

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Next.js team** for the amazing framework
- **Vercel** for hosting and deployment platform
- **MongoDB** for the flexible database solution
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string and add to `.env.local`

### 4. Install Dependencies & Run

```bash
pnpm install
pnpm dev
```

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose ODM
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: Lucide React
- **Form Handling**: React Hook Form with Zod validation
- **Package Manager**: pnpm

## Project Structure

```
app/
├── api/auth/[...nextauth]/    # NextAuth configuration
├── auth/signin/               # Sign-in page
├── dashboard/                 # Main dashboard
└── page.tsx                   # Home page

components/
├── ui/                        # shadcn/ui components
├── navigation.tsx             # Main navigation
└── providers.tsx              # Session provider

models/
├── User.ts                    # User model
├── Recipe.ts                  # Recipe model
├── Ingredient.ts              # Ingredient model
└── ShoppingCart.ts            # Shopping cart model

lib/
├── mongodb.ts                 # Database connection
└── utils.ts                   # Utility functions
```

## Development Status

### ✅ Phase 1 Complete - Authentication & Basic Structure
- [x] Project setup with dependencies
- [x] Database models created
- [x] Google OAuth authentication
- [x] Basic navigation and layout
- [x] Protected dashboard route

### 🚧 Phase 2 - Recipe Management (Next)
- [ ] Dashboard with card/table toggle view
- [ ] Add Recipe page with tag system
- [ ] Recipe detail pages
- [ ] CRUD operations for recipes

### 🔮 Phase 3 - Ingredient System (Future)
- [ ] Seed ingredients database
- [ ] Unit conversion system
- [ ] Base measurement storage

### 🔮 Phase 4 - Shopping Cart (Future)
- [ ] Multi-recipe selection
- [ ] Ingredient consolidation logic
- [ ] Shopping list with checkboxes
- [ ] Print functionality

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!
