// @ts-check
import { z } from "zod";

/**
 * Zod schema for User Roles
 */
export const UserRoleSchema = z.enum([
  "production_planner",
  "plant_manager",
  "supply_chain_planner",
  "industrial_engineer",
]);

/**
 * Zod schema for User Profile
 */
export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  avatar: z.string().optional(),
  plantId: z.string(),
});

/**
 * Zod schema for Plant Profile / Onboarding Configuration
 */
export const PlantProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  pressCount: z.number().int().min(1).max(100),
  moldCount: z.number().int().min(1).max(500),
  activePartNumbers: z.number().int().min(1),
  shiftsPerDay: z.number().int().min(1).max(4),
  hoursPerShift: z.number().min(6).max(12),
  targetOtdPercent: z.number().min(50).max(100),
  dataSource: z.enum(["synthetic", "csv_upload", "erp_adapter"]),
  createdAt: z.string(),
});

/**
 * Zod schema for Disruption Request
 */
export const DisruptionRequestSchema = z.object({
  type: z.enum(["machine_down", "rush_order", "mold_maintenance", "material_shortage"]),
  targetId: z.string(),
  durationHours: z.number().positive(),
  startOffsetHours: z.number().nonnegative(),
  priorityBoost: z.boolean().optional(),
  notes: z.string().optional(),
});
