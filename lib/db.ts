import { prisma } from "./prisma";
import {
  MOCK_CATEGORIES,
  MOCK_TECHNICIANS,
  MOCK_JOBS,
  MOCK_USERS,
  MOCK_REVIEWS,
} from "./data/mock-data";
import {
  Category,
  TechnicianProfile,
  JobRequest,
  User,
  Review,
  JobStatus,
  PaymentStatus,
} from "@/types";

// In-memory active state store for local dev & demo reliability
let memoryCategories: Category[] = [...MOCK_CATEGORIES];
let memoryTechnicians: TechnicianProfile[] = [...MOCK_TECHNICIANS];
let memoryJobs: JobRequest[] = [...MOCK_JOBS];
let memoryUsers: User[] = [...MOCK_USERS];
let memoryReviews: Review[] = [...MOCK_REVIEWS];

export const dbService = {
  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const cats = await prisma.category.findMany();
      if (cats && cats.length > 0) return cats;
    } catch {
      // Fallback to memory
    }
    return memoryCategories;
  },

  // Technicians
  async getTechnicians(filters?: {
    categorySlug?: string;
    subCity?: string;
    availableOnly?: boolean;
    minRating?: number;
    search?: string;
  }): Promise<TechnicianProfile[]> {
    let list = [...memoryTechnicians];

    if (filters) {
      if (filters.categorySlug && filters.categorySlug !== "all") {
        list = list.filter((t) =>
          t.categories.some((c) => c.slug === filters.categorySlug)
        );
      }
      if (filters.subCity && filters.subCity !== "all") {
        list = list.filter(
          (t) => t.user.subCity.toLowerCase() === filters.subCity?.toLowerCase()
        );
      }
      if (filters.availableOnly) {
        list = list.filter((t) => t.isAvailable);
      }
      if (filters.minRating) {
        list = list.filter((t) => t.ratingAverage >= (filters.minRating || 0));
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.user.name.toLowerCase().includes(query) ||
            t.bio?.toLowerCase().includes(query) ||
            t.categories.some(
              (c) =>
                c.nameEn.toLowerCase().includes(query) ||
                c.nameAm.toLowerCase().includes(query) ||
                c.nameTi.toLowerCase().includes(query)
            )
        );
      }
    }

    return list;
  },

  async getTechnicianById(id: string): Promise<TechnicianProfile | null> {
    const tech = memoryTechnicians.find(
      (t) => t.id === id || t.userId === id
    );
    if (!tech) return null;

    // Attach reviews
    const reviews = memoryReviews.filter((r) => r.technicianId === tech.id);
    return {
      ...tech,
      reviewsReceived: reviews,
    };
  },

  async toggleTechnicianAvailability(userId: string, isAvailable: boolean) {
    const techIndex = memoryTechnicians.findIndex((t) => t.userId === userId || t.id === userId);
    if (techIndex >= 0) {
      memoryTechnicians[techIndex].isAvailable = isAvailable;
      return memoryTechnicians[techIndex];
    }
    return null;
  },

  // Jobs
  async getJobs(filters?: { clientId?: string; technicianId?: string }): Promise<JobRequest[]> {
    let list = [...memoryJobs];
    if (filters?.clientId) {
      list = list.filter((j) => j.clientId === filters.clientId);
    }
    if (filters?.technicianId) {
      list = list.filter((j) => j.technicianId === filters.technicianId);
    }
    return list;
  },

  async getJobById(id: string): Promise<JobRequest | null> {
    const job = memoryJobs.find((j) => j.id === id);
    return job || null;
  },

  async createJob(data: {
    clientId: string;
    technicianId: string;
    categoryId: string;
    title: string;
    description: string;
    issuePhotoUrl?: string | null;
    address: string;
    subCity: string;
    woreda?: string;
    agreedPrice: number;
  }): Promise<JobRequest> {
    const tech = memoryTechnicians.find(
      (t) => t.userId === data.technicianId || t.id === data.technicianId
    );
    const client = memoryUsers.find((u) => u.id === data.clientId) || memoryUsers[6];
    const category = memoryCategories.find((c) => c.id === data.categoryId) || memoryCategories[0];

    const newJob: JobRequest = {
      id: `job-${Date.now()}`,
      clientId: client.id,
      client,
      technicianId: tech?.userId || data.technicianId,
      technician: tech?.user,
      techProfile: tech,
      categoryId: category.id,
      category,
      title: data.title,
      description: data.description,
      issuePhotoUrl: data.issuePhotoUrl,
      address: data.address,
      subCity: data.subCity,
      woreda: data.woreda,
      status: "PENDING",
      agreedPrice: data.agreedPrice,
      paymentStatus: "UNPAID",
      createdAt: new Date().toISOString(),
      transaction: null,
    };

    memoryJobs.unshift(newJob);
    return newJob;
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<JobRequest | null> {
    const index = memoryJobs.findIndex((j) => j.id === jobId);
    if (index === -1) return null;

    memoryJobs[index].status = status;
    memoryJobs[index].updatedAt = new Date().toISOString();
    return memoryJobs[index];
  },

  async markJobPaidEscrow(jobId: string, gateway: 'CHAPA' | 'TELEBIRR', txRef: string) {
    const index = memoryJobs.findIndex((j) => j.id === jobId);
    if (index === -1) return null;

    const amount = memoryJobs[index].agreedPrice;
    const commission = Math.round(amount * 0.1); // 10% platform fee
    const payout = amount - commission;          // 90% to technician

    memoryJobs[index].paymentStatus = "HELD_IN_ESCROW";
    memoryJobs[index].transaction = {
      id: `tx-${Date.now()}`,
      jobId,
      amount,
      commissionAmount: commission,
      payoutAmount: payout,
      paymentGateway: gateway,
      txRef,
      status: "HELD_IN_ESCROW",
      createdAt: new Date().toISOString(),
    };

    return memoryJobs[index];
  },

  async releaseEscrowPayout(jobId: string) {
    const index = memoryJobs.findIndex((j) => j.id === jobId);
    if (index === -1) return null;

    memoryJobs[index].paymentStatus = "RELEASED";
    memoryJobs[index].status = "COMPLETED";

    if (memoryJobs[index].transaction) {
      memoryJobs[index].transaction!.status = "RELEASED";
    }

    // Update technician stats
    const tech = memoryTechnicians.find(
      (t) => t.userId === memoryJobs[index].technicianId || t.id === memoryJobs[index].technicianId
    );
    if (tech) {
      tech.totalJobs += 1;
    }

    return memoryJobs[index];
  },

  async addReview(data: {
    jobId: string;
    clientId: string;
    technicianId: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const client = memoryUsers.find((u) => u.id === data.clientId);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      jobId: data.jobId,
      clientId: data.clientId,
      client: client
        ? {
            id: client.id,
            name: client.name,
            avatarUrl: client.avatarUrl,
            subCity: client.subCity,
          }
        : undefined,
      technicianId: data.technicianId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    memoryReviews.unshift(newReview);

    // Update tech average rating
    const tech = memoryTechnicians.find((t) => t.id === data.technicianId || t.userId === data.technicianId);
    if (tech) {
      const techReviews = memoryReviews.filter((r) => r.technicianId === tech.id);
      const totalScore = techReviews.reduce((sum, r) => sum + r.rating, 0);
      tech.ratingAverage = Number((totalScore / techReviews.length).toFixed(1));
    }

    // Attach to job
    const jobIndex = memoryJobs.findIndex((j) => j.id === data.jobId);
    if (jobIndex >= 0) {
      memoryJobs[jobIndex].review = newReview;
    }

    return newReview;
  },

  // Users
  async getUsers(): Promise<User[]> {
    return memoryUsers;
  },

  async getUserById(id: string): Promise<User | null> {
    return memoryUsers.find((u) => u.id === id) || null;
  }
};
