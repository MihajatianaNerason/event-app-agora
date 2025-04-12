/**
 * Types communs pour l'authentification
 */

export type UserStatus = "loading" | "signed-in" | "signed-out";

export type UserRole = "participant" | "organizer";

export interface AuthError {
  message: string;
  status?: number;
}

export interface UserAccount {
  id: string;
  user_id: string;
  full_name: string;
  image_url?: string | null;
  role: UserRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  profileImage?: FileList;
  role: UserRole;
}

// Constantes pour la validation des images
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
