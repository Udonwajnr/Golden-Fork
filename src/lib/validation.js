import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const menuItemSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().or(z.literal("")),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  calories: z.coerce.number().optional(),
  prepTimeMinutes: z.coerce.number().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().or(z.literal("")),
  sortOrder: z.coerce.number().optional(),
});

export const checkoutSchema = z.object({
  type: z.enum(["delivery", "pickup", "dine-in"]),
  items: z
    .array(
      z.object({
        menuItem: z.string(),
        quantity: z.number().min(1),
        notes: z.string().optional(),
      })
    )
    .min(1, "Your cart is empty"),
  guestInfo: z
    .object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().min(7),
    })
    .optional(),
  deliveryAddress: z
    .object({
      line1: z.string().min(2),
      line2: z.string().optional().or(z.literal("")),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(3),
    })
    .optional(),
  table: z.string().optional(),
  couponCode: z.string().optional().or(z.literal("")),
  tip: z.number().optional(),
  paymentMethod: z.enum(["card", "cash", "wallet"]).default("card"),
  redeemPoints: z.number().optional(),
});

export const reservationSchema = z.object({
  guestInfo: z.object({
    name: z.string().min(2),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(7),
  }),
  partySize: z.coerce.number().min(1).max(30),
  date: z.string().min(1, "Pick a date and time"),
  specialRequests: z.string().optional().or(z.literal("")),
  occasion: z
    .enum(["none", "birthday", "anniversary", "business", "date", "other"])
    .optional(),
});

export const ingredientSchema = z.object({
  name: z.string().min(2),
  unit: z.enum(["g", "kg", "ml", "l", "pcs", "oz", "lb"]),
  currentStock: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  costPerUnit: z.coerce.number().min(0).optional(),
  supplier: z.string().optional().or(z.literal("")),
});

export const supplierSchema = z.object({
  name: z.string().min(2),
  contactName: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const staffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6),
  role: z.enum(["waiter", "kitchen", "manager", "admin"]),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  description: z.string().optional().or(z.literal("")),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().min(0).optional(),
  maxUses: z.coerce.number().optional().nullable(),
  maxUsesPerUser: z.coerce.number().optional(),
  expiresAt: z.string().optional().or(z.literal("")),
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  conversation: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(30)
    .optional()
    .default([]),
});