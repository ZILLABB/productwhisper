/**
 * Role model interface
 */
export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
}

/**
 * User-Role relationship interface
 */
export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  created_at: Date;
}

/**
 * Role creation DTO
 */
export interface CreateRoleDTO {
  name: string;
  description?: string;
}

/**
 * Role update DTO
 */
export interface UpdateRoleDTO {
  name?: string;
  description?: string;
}
