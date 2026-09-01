export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'hired';

export interface Application {
  _id?: string;
  id?: string;
  jobTitle: string;
  applicantName: string;
  cv: string;
  status: ApplicationStatus;
  jobId?: string | { _id: string; title: string; companyName: string; location: string };
  userId?: string | { _id: string; name: string; email: string; skills?: string[] };
  matchScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateApplicationDto {
  jobTitle: string;
  applicantName: string;
  cv: string;
}

export interface ApplicationResponse {
  message: string;
  data: Application;
}

export interface ApplicationListResponse {
  message: string;
  data: Application[];
}
