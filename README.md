# The Golden Fork - Restaurant Management Platform

A full-stack restaurant platform: customer ordering site, admin dashboard, waiter/kitchen displays, inventory tracking, analytics, loyalty program, and AI-powered insights.

Stack: Next.js (App Router, JavaScript), Tailwind CSS v4, shadcn-style components, MongoDB/Mongoose, custom JWT auth, Anthropic/Gemini for AI insights.

## Getting started

1. Install dependencies (already done if you got this from the build):
   npm install

2. Set up environment variables. Copy .env.example to .env.local and fill in at least:
   cp .env.example .env.local
   - MONGODB_URI - required.
   - JWT_SECRET - required.
   - ANTHROPIC_API_KEY or GEMINI_API_KEY - optional, for AI-written insight narratives.
   - SMTP / Twilio vars - optional, otherwise logged to console.

3. Seed sample data:
   npm run seed
   Creates 50 menu items across 9 categories, 54 ingredients, 7 suppliers, 13 tables, 5 coupons, and these staff accounts (all password123):
   - admin@goldenfork.com (admin)
   - manager@goldenfork.com (manager)
   - waiter@goldenfork.com, waiter2@goldenfork.com (waiter)
   - kitchen@goldenfork.com, kitchen2@goldenfork.com (kitchen)

4. Run the dev server:
   npm run dev

## Feature map

Customer: /menu, /cart, /checkout, /order-confirmation, /account, /account/orders, /reservations
Admin (manager/admin role): /admin/orders, /admin/menu, /admin/staff, /admin/inventory, /admin/analytics, /admin/loyalty, /admin/ai-insights, /admin/messages
Staff: /waiter, /kitchen

## Architecture notes

- Auth: custom JWT in httpOnly cookie. Roles: customer, waiter, kitchen, manager, admin.
- Inventory deduction: MenuItem.recipe deducts Ingredient.currentStock on order placement, logs to InventoryLog, alerts admins on low stock.
- Loyalty: 10 points per dollar spent, 100 points = 1 dollar redeemable.
- AI Insights: rule-based stats computed via MongoDB aggregation, optionally narrated by Claude/Gemini if an API key is set.
- Chatbot: floating widget on every customer-facing page (src/components/site/chat-widget.jsx), backed by /api/chat. Always uses Claude directly (ANTHROPIC_API_KEY required) with tool use to look up real order status and search the live menu - it never invents menu items or order info. Returns a 503 with a clear message if no key is set.
- Contact form: public submissions go to ContactMessage + notify admins; manage and reply from /admin/messages.
- Image uploads: local disk under public/uploads - swap for Cloudinary/S3 before deploying serverless.

## Known gaps

- No real payment gateway integration.
- No automated tests.
- Kitchen/waiter screens poll every 10-15s instead of using WebSockets.
