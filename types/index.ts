export type Role = 'CLIENT' | 'TECHNICIAN' | 'ADMIN';

export type JobStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: Role;
  subCity: string;
  woreda?: string | null;
  avatarUrl?: string | null;
  isVerified: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  nameTi: string;
  slug: string;
  iconName: string;
}

export interface Review {
  id: string;
  jobId: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    subCity?: string;
  };
  technicianId: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
}

export interface TechnicianProfile {
  id: string;
  userId: string;
  user: User;
  bio?: string | null;
  hourlyRate: number;
  yearsExperience: number;
  idDocumentUrl: string;
  isAvailable: boolean;
  ratingAverage: number;
  totalJobs: number;
  categories: Category[];
  portfolioImages: string[];
  reviewsReceived?: Review[];
}

export interface JobRequest {
  id: string;
  clientId: string;
  client?: User;
  technicianId: string;
  technician?: User;
  techProfile?: TechnicianProfile;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  issuePhotoUrl?: string | null;
  address: string;
  subCity: string;
  woreda?: string;
  status: JobStatus;
  agreedPrice: number;
  paymentStatus: PaymentStatus;
  createdAt: string | Date;
  updatedAt?: string | Date;
  transaction?: Transaction | null;
  review?: Review | null;
}

export interface Transaction {
  id: string;
  jobId: string;
  amount: number;
  commissionAmount: number; // 10% Platform fee
  payoutAmount: number;     // 90% to Technician
  paymentGateway: 'CHAPA' | 'TELEBIRR';
  txRef: string;
  status: PaymentStatus;
  createdAt: string | Date;
}

export type SupportedLanguage = 'en' | 'am' | 'ti';
