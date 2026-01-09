/**
 * User Validation Schemas
 *
 * Zod schemas for user profile and address operations
 */

import { z } from 'zod'
import { nameSchema, phoneNumberSchema, pincodeSchema } from './common'

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  full_name: nameSchema.optional(),
  date_of_birth: z.string().date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  avatar_url: z.string().url().optional(),
  brand_preference: z.enum(['beautify', 'alouora']).optional(),
  newsletter_subscribed: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
})

/**
 * Address Schema
 */
export const addressSchema = z.object({
  full_name: nameSchema,
  phone: phoneNumberSchema,
  address_line1: z.string().min(5, 'Address line 1 is required').max(200),
  address_line2: z.string().max(200).optional(),
  landmark: z.string().max(100).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pincode: pincodeSchema,
  country: z.string().default('India'),
  address_type: z.enum(['home', 'office', 'other']).default('home'),
  is_default: z.boolean().default(false),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

/**
 * Update Address Schema
 */
export const updateAddressSchema = addressSchema.partial()
