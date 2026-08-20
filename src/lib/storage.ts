import { 
  PaperItem, 
  User, 
  ContentReport, 
  EBookItem, 
  AnswerKeyItem, 
  PaymentRecord, 
  AuditLog, 
  UploadStatus, 
  ItemType,
  EducationCategory
} from '../types';
import { 
  SEED_PAPERS, 
  SEED_USERS, 
  SEED_EBOOKS, 
  SEED_ANSWER_KEYS, 
  SEED_PAYMENTS, 
  SEED_REPORTS 
} from '../data/mockData';

const STORAGE_KEYS = {
  PAPERS: 'paperhub_papers_v2',
  USERS: 'paperhub_users_v2',
  CURRENT_USER: 'paperhub_current_user_v2',
  EBOOKS: 'paperhub_ebooks_v2',
  ANSWER_KEYS: 'paperhub_answer_keys_v2',
  PAYMENTS: 'paperhub_payments_v2',
  REPORTS: 'paperhub_reports_v2',
  AUDIT_LOGS: 'paperhub_audit_logs_v2',
  LIKES: 'paperhub_likes_v2',
  BOOKMARKS: 'paperhub_bookmarks_v2',
};

// Initialize localStorage if empty
export function initStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(SEED_PAPERS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }

  // NOTE: Do not auto-login mock user on fresh visitor access. 
  // Fresh visitor starts as guest (null) until they register/login.

  if (!localStorage.getItem(STORAGE_KEYS.EBOOKS)) {
    localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(SEED_EBOOKS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ANSWER_KEYS)) {
    localStorage.setItem(STORAGE_KEYS.ANSWER_KEYS, JSON.stringify(SEED_ANSWER_KEYS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(SEED_PAYMENTS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const initialLogs: AuditLog[] = [
      {
        id: 'log-01',
        adminId: 'usr-admin',
        adminName: 'Admin Moderator',
        action: 'APPROVE_PAPER',
        targetId: 'pyq-aktu-dbms-2025',
        targetType: 'paper',
        details: 'Approved AKTU DBMS 2025 question paper, ₹5 reward awarded.',
        timestamp: '2025-01-19 10:30',
      },
      {
        id: 'log-02',
        adminId: 'usr-admin',
        adminName: 'Admin Moderator',
        action: 'MARK_PAYMENT_PAID',
        targetId: 'pay-2025-001',
        targetType: 'payment',
        details: 'Processed payout ₹20 via UPI (Ref: UPI/501238914829/HDFC).',
        timestamp: '2025-01-25 14:30',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
  }
}

// ----------------------------------------------------
// User & Authentication (Mobile Phone -> Password -> Login -> Profile Completion)
// ----------------------------------------------------

export function calculateProfileCompletion(user: User | null): {
  percent: number;
  isReady: boolean;
  missingFields: string[];
} {
  if (!user) {
    return { percent: 0, isReady: false, missingFields: ['Mobile Number', 'Full Name', 'Email Address', 'Date of Birth', 'City / Place'] };
  }

  const missing: string[] = [];
  let score = 0;

  // 1. Mobile (20%)
  if (user.mobile && user.mobile.length >= 10) {
    score += 20;
  } else {
    missing.push('Mobile Number');
  }

  // 2. Full Name (20%) - Real name entered
  if (user.name && user.name.trim() && !user.name.startsWith('Student ') && user.name.length >= 3) {
    score += 20;
  } else {
    missing.push('Full Name');
  }

  // 3. Email Address (20%)
  if (user.email && user.email.includes('@') && user.email.includes('.')) {
    score += 20;
  } else {
    missing.push('Email Address');
  }

  // 4. Date of Birth (15%)
  if (user.dob && user.dob.trim()) {
    score += 15;
  } else {
    missing.push('Date of Birth (DOB)');
  }

  // 5. Place / City / State (15%)
  if ((user.place && user.place.trim()) || (user.city && user.city.trim())) {
    score += 15;
  } else {
    missing.push('Place / City');
  }

  // 6. University / College / Board / Course (10%)
  if (user.institution && user.institution.trim()) {
    score += 10;
  } else {
    missing.push('College / University / Board');
  }

  const percent = Math.min(100, score);
  // Ready to upload & download if core required fields are filled (Name, Email, DOB, Place)
  const isReady = score >= 85 || (
    Boolean(user.name && !user.name.startsWith('Student ')) &&
    Boolean(user.email && user.email.includes('@')) &&
    Boolean(user.dob) &&
    Boolean(user.place || user.city)
  );

  return {
    percent,
    isReady,
    missingFields: missing,
  };
}

export function getCurrentUser(): User | null {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!raw) return null;
  try {
    const user: User = JSON.parse(raw);
    const { percent, isReady } = calculateProfileCompletion(user);
    return {
      ...user,
      profileCompletionPercent: percent,
      profileCompleted: isReady,
    };
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    const { percent, isReady } = calculateProfileCompletion(user);
    // Security: Never store passwords in localStorage
    const { password, ...safeUser } = user;
    const enrichedUser: User = {
      ...safeUser,
      profileCompletionPercent: percent,
      profileCompleted: isReady,
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(enrichedUser));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}

// Store successfully registered user in session without password
export function saveRegisteredUserSession(user: Partial<User> & { mobile: string }): User {
  const users = getAllUsers();
  const cleanMob = user.mobile.replace(/\D/g, '').slice(-10);
  const existingIndex = users.findIndex(u => u.mobile && u.mobile.replace(/\D/g, '').slice(-10) === cleanMob);
  const existing = existingIndex >= 0 ? users[existingIndex] : null;

  const merged: User = {
    id: user.id || existing?.id || `usr-${Date.now()}`,
    mobile: cleanMob,
    name: user.name || existing?.name || `User ${cleanMob.slice(-4)}`,
    email: user.email || existing?.email || '',
    dob: user.dob || existing?.dob || '',
    place: user.place || existing?.place || existing?.city || '',
    city: user.city || existing?.city || user.place || existing?.place || '',
    state: user.state || existing?.state || 'Uttar Pradesh',
    educationCategory: user.educationCategory || existing?.educationCategory || 'college',
    institution: user.institution || existing?.institution || '',
    course: user.course || existing?.course || '',
    preferredSubjects: user.preferredSubjects || existing?.preferredSubjects || [],
    avatarUrl: user.avatarUrl || existing?.avatarUrl || '',
    payoutUpiId: user.payoutUpiId || existing?.payoutUpiId || '',
    payoutAccountName: user.payoutAccountName || existing?.payoutAccountName || user.name || existing?.name || '',
    otpVerified: true,
    profileCompleted: user.profileCompleted ?? existing?.profileCompleted ?? false,
    profileCompletionPercent: typeof user.profileCompletionPercent === 'number' ? user.profileCompletionPercent : (existing?.profileCompletionPercent || 0),
    role: user.role || existing?.role || 'student',
    joinedDate: user.joinedDate || existing?.joinedDate || new Date().toISOString().split('T')[0],
    status: user.status || existing?.status || 'active',
    uploadedCount: existing?.uploadedCount || 0,
    approvedCount: existing?.approvedCount || 0,
    rejectedCount: existing?.rejectedCount || 0,
    duplicateCount: existing?.duplicateCount || 0,
    pendingCount: existing?.pendingCount || 0,
    totalViews: existing?.totalViews || 0,
    totalDownloads: existing?.totalDownloads || 0,
    totalEarned: existing?.totalEarned || 0,
    pendingPayment: existing?.pendingPayment || 0,
    totalPaid: existing?.totalPaid || 0,
  };

  const { percent, isReady } = calculateProfileCompletion(merged);
  const finalizedUser: User = {
    ...merged,
    profileCompletionPercent: percent,
    profileCompleted: isReady || merged.profileCompleted,
  };

  if (existingIndex >= 0) {
    users[existingIndex] = finalizedUser;
  } else {
    users.push(finalizedUser);
  }

  // Sanitize all users to never store passwords in localStorage
  const safeUsersList = users.map(u => {
    const { password, ...safe } = u;
    return safe;
  });

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(safeUsersList));
  setCurrentUser(finalizedUser);
  return finalizedUser;
}

export function getAllUsers(): User[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  try {
    const list: User[] = raw ? JSON.parse(raw) : SEED_USERS;
    return list.map(u => {
      const { percent, isReady } = calculateProfileCompletion(u);
      return {
        ...u,
        profileCompletionPercent: percent,
        profileCompleted: isReady,
      };
    });
  } catch {
    return SEED_USERS;
  }
}

export function getUserByMobile(mobile: string): User | undefined {
  const users = getAllUsers();
  const cleanMob = mobile.replace(/\D/g, '').slice(-10);
  return users.find(u => u.mobile.replace(/\D/g, '').slice(-10) === cleanMob);
}

// Authenticate or Register via Mobile and Password
export function authenticateWithMobileAndPassword(
  mobile: string,
  password?: string
): { user: User; isNewUser: boolean; requiresPasswordSetup: boolean } {
  const users = getAllUsers();
  const cleanMob = mobile.replace(/\D/g, '').slice(-10);
  const existing = users.find(u => u.mobile.replace(/\D/g, '').slice(-10) === cleanMob);

  if (existing) {
    if (password) {
      existing.password = password;
    }
    existing.otpVerified = true;
    const { percent, isReady } = calculateProfileCompletion(existing);
    existing.profileCompletionPercent = percent;
    existing.profileCompleted = isReady;

    setCurrentUser(existing);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { 
      user: existing, 
      isNewUser: false, 
      requiresPasswordSetup: !existing.password 
    };
  }

  // Create new user with phone & password
  const newUser: User = {
    id: `usr-${Date.now()}`,
    mobile: cleanMob,
    name: `Student ${cleanMob.slice(-4)}`,
    password: password || 'pass123',
    otpVerified: true,
    profileCompleted: false,
    profileCompletionPercent: 20, // 20% since mobile is verified
    role: 'student',
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'active',
    uploadedCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarned: 0,
    pendingPayment: 0,
    totalPaid: 0,
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser);
  return { user: newUser, isNewUser: true, requiresPasswordSetup: false };
}

// Authenticate or Register via Mobile OTP
export function authenticateWithMobile(mobile: string, name?: string): { user: User; isNewUser: boolean } {
  const users = getAllUsers();
  const cleanMob = mobile.replace(/\D/g, '').slice(-10);
  const existing = users.find(u => u.mobile.replace(/\D/g, '').slice(-10) === cleanMob);

  if (existing) {
    existing.otpVerified = true;
    const { percent, isReady } = calculateProfileCompletion(existing);
    existing.profileCompletionPercent = percent;
    existing.profileCompleted = isReady;

    setCurrentUser(existing);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return { user: existing, isNewUser: false };
  }

  // Create new uncompleted profile user
  const newUser: User = {
    id: `usr-${Date.now()}`,
    mobile: cleanMob,
    name: name || `Student ${cleanMob.slice(-4)}`,
    password: 'password123',
    otpVerified: true,
    profileCompleted: false,
    profileCompletionPercent: 20,
    role: 'student',
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'active',
    uploadedCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarned: 0,
    pendingPayment: 0,
    totalPaid: 0,
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(newUser);
  return { user: newUser, isNewUser: true };
}

export function updateUserProfile(userId: string, profileData: Partial<User>): User {
  const users = getAllUsers();
  const curr = getCurrentUser();
  let idx = users.findIndex(u => String(u.id) === String(userId));
  
  if (idx === -1 && curr?.mobile) {
    const cleanMob = curr.mobile.replace(/\D/g, '').slice(-10);
    idx = users.findIndex(u => u.mobile && u.mobile.replace(/\D/g, '').slice(-10) === cleanMob);
  }

  const baseUser: User = idx !== -1 ? users[idx] : (curr || {
    id: userId,
    mobile: profileData.mobile || '9876543210',
    name: profileData.name || 'Student',
    role: 'student',
    status: 'active',
    otpVerified: true,
    profileCompleted: false,
    profileCompletionPercent: 20,
    uploadedCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
    pendingCount: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalEarned: 0,
    pendingPayment: 0,
    totalPaid: 0,
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const updatedCandidate: User = {
    ...baseUser,
    ...profileData,
    id: baseUser.id || userId,
  };
  const { percent, isReady } = calculateProfileCompletion(updatedCandidate);
  const finalizedUser: User = {
    ...updatedCandidate,
    profileCompletionPercent: percent,
    profileCompleted: isReady,
  };

  if (idx !== -1) {
    users[idx] = finalizedUser;
  } else {
    users.push(finalizedUser);
  }

  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  setCurrentUser(finalizedUser);
  return finalizedUser;
}

export function switchUserRoleForTesting(userId: string, role: User['role']) {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].role = role;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const curr = getCurrentUser();
    if (curr && curr.id === userId) {
      setCurrentUser(users[idx]);
    }
  }
}

export function toggleUserSuspension(userId: string, adminUser: User): boolean {
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    const nextStatus = users[idx].status === 'active' ? 'suspended' : 'active';
    users[idx].status = nextStatus;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    logAuditAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: nextStatus === 'suspended' ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      targetId: userId,
      targetType: 'user',
      details: `${nextStatus === 'suspended' ? 'Suspended' : 'Unsuspended'} user ${users[idx].name} (${users[idx].mobile}).`,
    });

    return nextStatus === 'suspended';
  }
  return false;
}

// ----------------------------------------------------
// 3-Level Duplicate Detection Engine
// ----------------------------------------------------

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateOf?: PaperItem;
  reason?: string;
  confidenceScore: number; // 0 to 100
}

export function checkForDuplicatePaper(newPaper: {
  institution: string;
  course: string;
  subject: string;
  year: number;
  semester?: string;
  fileHash?: string;
  title?: string;
}): DuplicateCheckResult {
  const papers = getAllPapers();

  // Level 1: Exact File Hash Match (SHA-256 / Checksum)
  if (newPaper.fileHash) {
    const hashMatch = papers.find(
      p => p.fileHash && p.fileHash.toLowerCase() === newPaper.fileHash?.toLowerCase() && p.status !== 'REJECTED'
    );
    if (hashMatch) {
      return {
        isDuplicate: true,
        duplicateOf: hashMatch,
        reason: 'Level 1 Match: Exact identical file hash found already in database.',
        confidenceScore: 100,
      };
    }
  }

  // Level 2: Metadata Match (Institution + Course + Subject + Year)
  const norm = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

  const normInst = norm(newPaper.institution);
  const normCourse = norm(newPaper.course);
  const normSubject = norm(newPaper.subject);
  const targetYear = Number(newPaper.year);

  const metadataMatch = papers.find(p => {
    if (p.status === 'REJECTED' || p.status === 'REMOVED') return false;
    const sameYear = Number(p.year) === targetYear;
    const sameInst = norm(p.institution).includes(normInst) || normInst.includes(norm(p.institution));
    const sameCourse = norm(p.course).includes(normCourse) || normCourse.includes(norm(p.course));
    const sameSubject = norm(p.subject).includes(normSubject) || normSubject.includes(norm(p.subject));

    return sameYear && sameSubject && (sameInst || sameCourse);
  });

  if (metadataMatch) {
    return {
      isDuplicate: true,
      duplicateOf: metadataMatch,
      reason: `Level 2 Match: This examination paper for ${newPaper.institution} - ${newPaper.subject} (${newPaper.year}) was already uploaded by ${metadataMatch.uploaderName}.`,
      confidenceScore: 90,
    };
  }

  return {
    isDuplicate: false,
    confidenceScore: 0,
  };
}

// ----------------------------------------------------
// Papers CRUD & Operations
// ----------------------------------------------------

export function getAllPapers(): PaperItem[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PAPERS);
  try {
    return raw ? JSON.parse(raw) : SEED_PAPERS;
  } catch {
    return SEED_PAPERS;
  }
}

export function getPublicPapers(): PaperItem[] {
  return getAllPapers().filter(p => p.status === 'APPROVED');
}

export function saveUploadedPaper(paperData: {
  category: EducationCategory;
  institution: string;
  board?: string;
  exam?: string;
  course: string;
  semester?: string;
  subject: string;
  subjectCode?: string;
  year: number;
  month?: string;
  examType: PaperItem['examType'];
  language: PaperItem['language'];
  state?: string;
  city?: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileName?: string;
  fileSize: string;
  pageCount: number;
  hasSolutions: boolean;
  fileHash?: string;
  uploader: User;
}): { paper: PaperItem; duplicateResult: DuplicateCheckResult } {
  const papers = getAllPapers();
  const duplicateResult = checkForDuplicatePaper({
    institution: paperData.institution,
    course: paperData.course,
    subject: paperData.subject,
    year: paperData.year,
    semester: paperData.semester,
    fileHash: paperData.fileHash,
    title: paperData.title,
  });

  const isDup = duplicateResult.isDuplicate;
  const status: UploadStatus = isDup ? 'DUPLICATE' : 'APPROVED';
  const rewardAmount = isDup ? 0 : 5;

  const newPaper: PaperItem = {
    id: `pyq-${Date.now()}`,
    title: paperData.title,
    type: 'pyq',
    fileType: 'pdf',
    fileName: paperData.fileName || 'uploaded_paper.pdf',
    category: paperData.category,
    institution: paperData.institution,
    board: paperData.board,
    exam: paperData.exam,
    course: paperData.course,
    semester: paperData.semester,
    subject: paperData.subject,
    subjectCode: paperData.subjectCode,
    year: Number(paperData.year),
    month: paperData.month,
    examType: paperData.examType,
    language: paperData.language,
    state: paperData.state,
    city: paperData.city,
    uploaderId: paperData.uploader.id,
    uploaderName: paperData.uploader.name,
    uploaderMobile: paperData.uploader.mobile,
    uploadDate: new Date().toISOString().split('T')[0],
    fileUrl: paperData.fileUrl,
    fileSize: paperData.fileSize,
    pageCount: paperData.pageCount,
    hasSolutions: paperData.hasSolutions,
    tags: [paperData.subject, paperData.course, `${paperData.year}`, paperData.examType],
    viewsCount: 0,
    downloadsCount: 0,
    likesCount: 1,
    status: status,
    rewardAmount: rewardAmount,
    isDuplicate: isDup,
    duplicateOfId: duplicateResult.duplicateOf?.id,
    duplicateReason: duplicateResult.reason,
    description: paperData.description,
    fileHash: paperData.fileHash,
    approvedAt: isDup ? undefined : new Date().toISOString().replace('T', ' ').substring(0, 16),
  };

  papers.unshift(newPaper);
  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));

  // Update user uploads & rewards
  const users = getAllUsers();
  const uIdx = users.findIndex(u => u.id === paperData.uploader.id);
  if (uIdx !== -1) {
    users[uIdx].uploadedCount = (users[uIdx].uploadedCount || 0) + 1;
    if (isDup) {
      users[uIdx].duplicateCount = (users[uIdx].duplicateCount || 0) + 1;
    } else {
      users[uIdx].approvedCount = (users[uIdx].approvedCount || 0) + 1;
      users[uIdx].totalEarned = (users[uIdx].totalEarned || 0) + 5;
      users[uIdx].pendingPayment = (users[uIdx].pendingPayment || 0) + 5;
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    setCurrentUser(users[uIdx]);
  }

  return { paper: newPaper, duplicateResult };
}

export function updatePaperStatus(
  paperId: string, 
  newStatus: UploadStatus, 
  adminUser: User, 
  reason?: string
) {
  const papers = getAllPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx === -1) return;

  const prevStatus = papers[idx].status;
  papers[idx].status = newStatus;
  if (reason) {
    papers[idx].rejectionReason = reason;
  }
  if (newStatus === 'APPROVED') {
    papers[idx].approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    papers[idx].rewardAmount = 5;
    papers[idx].isDuplicate = false;
  } else if (newStatus === 'DUPLICATE' || newStatus === 'REJECTED') {
    papers[idx].rewardAmount = 0;
  }

  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));

  // Audit log
  logAuditAction({
    adminId: adminUser.id,
    adminName: adminUser.name,
    action: newStatus === 'APPROVED' ? 'APPROVE_PAPER' : newStatus === 'REJECTED' ? 'REJECT_PAPER' : 'MARK_DUPLICATE',
    targetId: paperId,
    targetType: 'paper',
    details: `Updated paper "${papers[idx].title}" status from ${prevStatus} to ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`,
  });
}

export function overrideDuplicatePaper(paperId: string, adminUser: User, adminNotes: string) {
  const papers = getAllPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx === -1) return;

  papers[idx].isDuplicate = false;
  papers[idx].status = 'APPROVED';
  papers[idx].rewardAmount = 5;
  papers[idx].approvedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  papers[idx].duplicateReason = `Admin Override: ${adminNotes}`;

  localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));

  // Award ₹5 to uploader
  const users = getAllUsers();
  const uIdx = users.findIndex(u => u.id === papers[idx].uploaderId);
  if (uIdx !== -1) {
    users[uIdx].duplicateCount = Math.max(0, (users[uIdx].duplicateCount || 1) - 1);
    users[uIdx].approvedCount = (users[uIdx].approvedCount || 0) + 1;
    users[uIdx].totalEarned = (users[uIdx].totalEarned || 0) + 5;
    users[uIdx].pendingPayment = (users[uIdx].pendingPayment || 0) + 5;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  logAuditAction({
    adminId: adminUser.id,
    adminName: adminUser.name,
    action: 'OVERRIDE_DUPLICATE',
    targetId: paperId,
    targetType: 'paper',
    details: `Admin overridden duplicate for "${papers[idx].title}". Awarded ₹5. Note: ${adminNotes}`,
  });
}

export function deletePaperByAdmin(paperId: string, adminUser: User, reason: string) {
  const papers = getAllPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx !== -1) {
    const title = papers[idx].title;
    papers[idx].status = 'REMOVED';
    papers[idx].rejectionReason = reason;
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));

    logAuditAction({
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'REMOVE_CONTENT',
      targetId: paperId,
      targetType: 'paper',
      details: `Removed paper "${title}". Reason: ${reason}`,
    });
  }
}

export function incrementPaperView(paperId: string) {
  const papers = getAllPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx !== -1) {
    papers[idx].viewsCount += 1;
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  }
}

export function incrementPaperDownload(paperId: string) {
  const papers = getAllPapers();
  const idx = papers.findIndex(p => p.id === paperId);
  if (idx !== -1) {
    papers[idx].downloadsCount += 1;
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  }
}

// ----------------------------------------------------
// Free E-Books Storage
// ----------------------------------------------------

export function getAllEBooks(): EBookItem[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.EBOOKS);
  try {
    if (!raw) return SEED_EBOOKS;
    const list: EBookItem[] = JSON.parse(raw);
    // Sync seed cover images if present
    const updated = list.map(item => {
      const seedMatch = SEED_EBOOKS.find(s => s.id === item.id);
      if (seedMatch && seedMatch.coverImage !== item.coverImage) {
        return { ...item, coverImage: seedMatch.coverImage };
      }
      return item;
    });
    return updated;
  } catch {
    return SEED_EBOOKS;
  }
}

export function saveEBook(ebook: Omit<EBookItem, 'id' | 'viewsCount' | 'downloadsCount' | 'uploadDate' | 'status'>): EBookItem {
  const ebooks = getAllEBooks();
  const newBook: EBookItem = {
    ...ebook,
    id: `ebk-${Date.now()}`,
    viewsCount: 0,
    downloadsCount: 0,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'APPROVED',
  };
  ebooks.unshift(newBook);
  localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
  return newBook;
}

export function incrementEBookDownload(ebookId: string) {
  const ebooks = getAllEBooks();
  const idx = ebooks.findIndex(b => b.id === ebookId);
  if (idx !== -1) {
    ebooks[idx].downloadsCount += 1;
    localStorage.setItem(STORAGE_KEYS.EBOOKS, JSON.stringify(ebooks));
  }
}

// ----------------------------------------------------
// Answer Keys Storage
// ----------------------------------------------------

export function getAllAnswerKeys(): AnswerKeyItem[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ANSWER_KEYS);
  try {
    if (!raw) return SEED_ANSWER_KEYS;
    const parsed: AnswerKeyItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_ANSWER_KEYS;
    // Map in fallback preview images if missing in cached storage
    return parsed.map(k => {
      const seedMatch = SEED_ANSWER_KEYS.find(s => s.id === k.id);
      return {
        ...k,
        previewImage: k.previewImage || seedMatch?.previewImage || 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
        pagesCount: k.pagesCount || seedMatch?.pagesCount || 8,
      };
    });
  } catch {
    return SEED_ANSWER_KEYS;
  }
}

export function saveAnswerKey(ansKey: Omit<AnswerKeyItem, 'id' | 'uploadDate' | 'status'>): AnswerKeyItem {
  const keys = getAllAnswerKeys();
  const newKey: AnswerKeyItem = {
    ...ansKey,
    id: `ans-${Date.now()}`,
    uploadDate: new Date().toISOString().split('T')[0],
    status: 'APPROVED',
  };
  keys.unshift(newKey);
  localStorage.setItem(STORAGE_KEYS.ANSWER_KEYS, JSON.stringify(keys));

  // Link to paper
  const papers = getAllPapers();
  const pIdx = papers.findIndex(p => p.id === ansKey.paperId);
  if (pIdx !== -1) {
    papers[pIdx].hasSolutions = true;
    papers[pIdx].answerKeyId = newKey.id;
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers));
  }

  return newKey;
}

// ----------------------------------------------------
// Payments & Manual Payouts
// ----------------------------------------------------

export function getAllPayments(): PaymentRecord[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  try {
    return raw ? JSON.parse(raw) : SEED_PAYMENTS;
  } catch {
    return SEED_PAYMENTS;
  }
}

export function markPaymentAsPaid(params: {
  paymentId?: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentRecord['paymentMethod'];
  transactionReference: string;
  adminNote?: string;
  adminUser: User;
}): PaymentRecord {
  const payments = getAllPayments();
  const users = getAllUsers();
  const uIdx = users.findIndex(u => u.id === params.userId);

  if (uIdx === -1) throw new Error('User not found');
  const user = users[uIdx];

  let record: PaymentRecord;

  if (params.paymentId) {
    const pIdx = payments.findIndex(p => p.id === params.paymentId);
    if (pIdx !== -1) {
      payments[pIdx].paymentStatus = 'PAID';
      payments[pIdx].paymentMethod = params.paymentMethod;
      payments[pIdx].transactionReference = params.transactionReference;
      payments[pIdx].paidAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
      payments[pIdx].adminNote = params.adminNote;
      record = payments[pIdx];
    } else {
      throw new Error('Payment record not found');
    }
  } else {
    record = {
      id: `pay-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userMobile: user.mobile,
      amount: params.amount,
      approvedPapersCount: Math.floor(params.amount / 5),
      paymentStatus: 'PAID',
      paymentMethod: params.paymentMethod,
      transactionReference: params.transactionReference,
      paidAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminNote: params.adminNote,
    };
    payments.unshift(record);
  }

  // Update user wallet balances
  user.pendingPayment = Math.max(0, (user.pendingPayment || 0) - params.amount);
  user.totalPaid = (user.totalPaid || 0) + params.amount;

  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const curr = getCurrentUser();
  if (curr && curr.id === user.id) {
    setCurrentUser(user);
  }

  logAuditAction({
    adminId: params.adminUser.id,
    adminName: params.adminUser.name,
    action: 'MARK_PAYMENT_PAID',
    targetId: record.id,
    targetType: 'payment',
    details: `Marked ₹${params.amount} payout to ${user.name} (${user.mobile}) as PAID via ${params.paymentMethod}. Ref: ${params.transactionReference}`,
  });

  return record;
}

// ----------------------------------------------------
// Content Reports & DMCA
// ----------------------------------------------------

export function getAllReports(): ContentReport[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.REPORTS);
  try {
    return raw ? JSON.parse(raw) : SEED_REPORTS;
  } catch {
    return SEED_REPORTS;
  }
}

export function submitContentReport(report: Omit<ContentReport, 'id' | 'status' | 'createdAt'>): ContentReport {
  const reports = getAllReports();
  const newReport: ContentReport = {
    ...report,
    id: `rep-${Date.now()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  return newReport;
}

export function updateReportStatus(reportId: string, status: 'RESOLVED' | 'DISMISSED', adminNote?: string) {
  const reports = getAllReports();
  const idx = reports.findIndex(r => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    if (adminNote) reports[idx].adminNote = adminNote;
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }
}

// ----------------------------------------------------
// Audit Trail Logs
// ----------------------------------------------------

export function getAuditLogs(): AuditLog[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAuditAction(log: Omit<AuditLog, 'id' | 'timestamp'>) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
  };
  logs.unshift(newLog);
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
}

// ----------------------------------------------------
// Bookmarks
// ----------------------------------------------------

export function getBookmarks(): string[] {
  initStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  try {
    return raw ? JSON.parse(raw) : ['pyq-aktu-dbms-2025', 'pyq-cbse-12-physics-2025'];
  } catch {
    return [];
  }
}

export function toggleBookmark(paperId: string): boolean {
  const bookmarks = getBookmarks();
  const idx = bookmarks.indexOf(paperId);
  let isBookmarked = false;
  if (idx !== -1) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push(paperId);
    isBookmarked = true;
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  return isBookmarked;
}
