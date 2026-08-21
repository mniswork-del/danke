export type Role = 'student' | 'teacher' | 'contributor' | 'admin';

export type ItemType = 'pyq' | 'ebook' | 'answer_key' | 'note';

export type FileCategory = 'pdf' | 'image' | 'ppt' | 'doc' | 'text' | 'other';

export type UploadStatus = 
  | 'UPLOADED'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DUPLICATE'
  | 'REMOVED'
  | 'PAID';

export type EducationCategory = 
  | 'school'
  | 'college'
  | 'competitive'
  | 'entrance'
  | 'diploma'
  | 'professional'
  | 'government'
  | 'other';

export interface User {
  id: string;
  mobile: string;
  name: string;
  email?: string;
  dob?: string; // Date of Birth (YYYY-MM-DD)
  place?: string; // City / Town / Place
  password?: string;
  otpVerified: boolean;
  profileCompleted: boolean;
  profileCompletionPercent?: number; // 0 to 100
  role: Role;
  state?: string;
  city?: string;
  educationCategory?: string;
  institution?: string; // University, Board, or College name
  course?: string;
  preferredSubjects?: string[];
  avatarUrl?: string;
  joinedDate: string;
  status: 'active' | 'suspended';
  
  // Stats & Rewards
  uploadedCount: number;
  approvedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  pendingCount: number;
  totalViews: number;
  totalDownloads: number;

  // Wallet
  totalEarned: number; // in INR (₹)
  pendingPayment: number; // in INR (₹)
  totalPaid: number; // in INR (₹)
  payoutUpiId?: string;
  payoutAccountName?: string;
}

export interface PaperItem {
  id: string;
  title: string;
  type: ItemType;
  fileType?: FileCategory;
  fileName?: string;
  category: EducationCategory;
  institution: string; // University / Board / Exam conducting body
  board?: string;
  exam?: string;
  course: string; // e.g. "B.Tech Computer Science", "Class 12 Science", "UPSC CSE"
  semester?: string; // e.g. "Semester 5", "Annual Exam"
  subject: string;
  subjectCode?: string;
  year: number;
  month?: string;
  examType: 'Mid-Sem' | 'End-Sem' | 'Board-Final' | 'Prelims' | 'Mains' | 'Entrance' | 'Unit-Test' | 'Textbook' | 'Other';
  language: 'English' | 'Hindi' | 'Bilingual' | 'Regional';
  state?: string;
  city?: string;
  uploaderId: string;
  uploaderName: string;
  uploaderMobile?: string;
  uploadDate: string;
  fileUrl: string;
  fileSize: string;
  pageCount: number;
  hasSolutions: boolean;
  answerKeyId?: string;
  tags: string[];
  viewsCount: number;
  downloadsCount: number;
  likesCount?: number;
  status: UploadStatus;
  rewardAmount: number; // ₹5 for approved unique
  isDuplicate?: boolean;
  duplicateOfId?: string;
  duplicateReason?: string;
  rejectionReason?: string;
  description?: string;
  approvedAt?: string;
  fileHash?: string; // SHA-256 or MD5 signature
  extractedTextHash?: string;
}

export interface EBookItem {
  id: string;
  title: string;
  author: string;
  category: EducationCategory | string;
  language: string;
  fileUrl: string;
  coverImage?: string;
  pageCount: number;
  fileSize: string;
  description: string;
  subject?: string;
  isPublicDomain: boolean;
  downloadsCount: number;
  viewsCount: number;
  uploadDate: string;
  status: 'APPROVED' | 'PENDING';
}

export interface AnswerKeyItem {
  id: string;
  paperId: string;
  paperTitle: string;
  exam: string;
  institution: string;
  course: string;
  subject: string;
  year: number;
  fileUrl: string;
  fileSize: string;
  previewImage?: string;
  pagesCount?: number;
  verifiedByTeacher: boolean;
  uploadDate: string;
  status: 'APPROVED' | 'PENDING';
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  category: EducationCategory | string;
  course: string;
  semester?: string;
  institution?: string;
  author: string;
  authorRole?: 'Topper' | 'Faculty' | 'Gold Medalist' | 'Scholar' | 'Educator';
  isHandwritten: boolean;
  topics: string[];
  pageCount: number;
  fileSize: string;
  fileUrl: string;
  previewImage?: string;
  rating?: number;
  viewsCount: number;
  downloadsCount: number;
  likesCount?: number;
  uploadDate: string;
  description: string;
  status: 'APPROVED' | 'PENDING';
}

export interface WalletTransaction {
  id: string;
  userId: string;
  paperId?: string;
  paperTitle?: string;
  type: 'REWARD_EARNED' | 'MANUAL_PAYOUT' | 'REWARD_REVERSED';
  amount: number; // in INR
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  description: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  amount: number; // in INR
  approvedPapersCount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod?: 'UPI' | 'NEFT' | 'IMPS' | 'GPay' | 'Paytm' | 'Bank Transfer';
  transactionReference?: string; // UTR or Txn ID
  paidAt?: string;
  createdAt: string;
  adminNote?: string;
  paperIds?: string[];
}

export interface ContentReport {
  id: string;
  contentId: string;
  contentTitle: string;
  contentType: ItemType;
  reporterName?: string;
  reporterEmail: string;
  reason: 'Copyright Infringement' | 'Corrupted/Blank PDF' | 'Wrong Subject/Year' | 'Spam or Advertising' | 'Adult or Prohibited Content' | 'Personal Information' | 'Other';
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  adminNote?: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: 'APPROVE_PAPER' | 'REJECT_PAPER' | 'MARK_DUPLICATE' | 'OVERRIDE_DUPLICATE' | 'MARK_PAYMENT_PAID' | 'SUSPEND_USER' | 'UNSUSPEND_USER' | 'REMOVE_CONTENT';
  targetId: string;
  targetType: 'paper' | 'user' | 'payment' | 'report';
  details: string;
  timestamp: string;
}

export interface PathCategoryItem {
  id: EducationCategory;
  title: string;
  subtitle: string;
  iconName: string;
  popularExams: string[];
  paperCount: number;
}
