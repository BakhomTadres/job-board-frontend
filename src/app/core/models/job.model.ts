export type JobType = 'Full-time' | 'Part-time' | 'Remote' | 'Freelance';

export interface Job {
  _id?: string;
  id?: string;
  title: string;
  companyName: string;
  description: string;
  location: string;
  salary?: number;
  type: JobType;
  employer?: string | { _id: string; name: string; email: string };
  skills?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFilters {
  location?: string;
  companyName?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface JobListResponse {
  results: number;
  data: Job[];
}

export interface RecommendedJobsResponse {
  status: string;
  results: number;
  data: {
    jobs: Job[];
  };
}

export interface CreateJobDto {
  title: string;
  companyName: string;
  description: string;
  location: string;
  salary?: number;
  type: JobType;
  skills?: string[];
}

export interface UpdateJobDto {
  title?: string;
  companyName?: string;
  description?: string;
  location?: string;
  salary?: number;
  type?: JobType;
  skills?: string[];
}
