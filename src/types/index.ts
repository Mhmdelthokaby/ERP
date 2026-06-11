import type { userRoleEnum } from "@/db/schema"

export type UserRole = (typeof userRoleEnum.enumValues)[number]

export interface SessionUser {
  id: string
  name: string
  email: string
  role: UserRole
  image?: string | null
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
