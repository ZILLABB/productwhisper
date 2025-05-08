/**
 * User model interface
 */
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  last_login: Date | null;
  preferences: Record<string, any> | null;
  is_active: boolean;
}

/**
 * User creation DTO (Data Transfer Object)
 */
export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

/**
 * User update DTO
 */
export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  preferences?: Record<string, any>;
  is_active?: boolean;
}

/**
 * User response DTO (excludes sensitive information)
 */
export interface UserResponseDTO {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  last_login: Date | null;
  preferences: Record<string, any> | null;
  is_active: boolean;
  roles?: string[];
}
