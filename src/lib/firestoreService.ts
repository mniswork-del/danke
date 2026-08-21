import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, PaperItem, EBookItem, AnswerKeyItem, ContentReport, AuditLog, PaymentRecord } from '../types';

const cleanMobile = (m: string) => m.replace(/\D/g, '').slice(-10);

// ========================================================
// 1. ONLINE CLOUD USER PROFILE & AUTH
// ========================================================

export async function saveUserToFirestore(
  userData: Partial<User> & { mobile: string; password?: string }
): Promise<User | null> {
  const cleanMob = cleanMobile(userData.mobile);
  if (!cleanMob || cleanMob.length !== 10) return null;

  try {
    const userDocRef = doc(db, 'users', cleanMob);
    const existingSnap = await getDoc(userDocRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : {};

    const mergedUser: Record<string, any> = {
      id: userData.id || existingData.id || `usr-${Date.now()}`,
      mobile: cleanMob,
      name: (userData.name && !userData.name.startsWith('Student ') && !userData.name.startsWith('User '))
        ? userData.name.trim()
        : (existingData.name && !existingData.name.startsWith('Student ') && !existingData.name.startsWith('User '))
          ? existingData.name.trim()
          : (userData.name || existingData.name || `Student ${cleanMob.slice(-4)}`),
      email: userData.email !== undefined ? userData.email.trim() : (existingData.email || ''),
      dob: userData.dob !== undefined ? userData.dob : (existingData.dob || ''),
      place: userData.place !== undefined ? userData.place.trim() : (existingData.place || existingData.city || ''),
      city: userData.city !== undefined ? userData.city.trim() : (existingData.city || existingData.place || ''),
      state: userData.state || existingData.state || 'Uttar Pradesh',
      educationCategory: userData.educationCategory || existingData.educationCategory || 'college',
      institution: userData.institution !== undefined ? userData.institution.trim() : (existingData.institution || ''),
      course: userData.course !== undefined ? userData.course.trim() : (existingData.course || ''),
      preferredSubjects: userData.preferredSubjects || existingData.preferredSubjects || [],
      avatarUrl: userData.avatarUrl || existingData.avatarUrl || '',
      payoutUpiId: userData.payoutUpiId || existingData.payoutUpiId || '',
      payoutAccountName: userData.payoutAccountName || existingData.payoutAccountName || '',
      otpVerified: true,
      profileCompleted: userData.profileCompleted !== undefined ? userData.profileCompleted : Boolean(existingData.profileCompleted),
      profileCompletionPercent: typeof userData.profileCompletionPercent === 'number'
        ? userData.profileCompletionPercent
        : (existingData.profileCompletionPercent || 0),
      role: userData.role || existingData.role || 'student',
      status: userData.status || existingData.status || 'active',
      joinedDate: userData.joinedDate || existingData.joinedDate || new Date().toISOString().split('T')[0],
      uploadedCount: typeof userData.uploadedCount === 'number' ? userData.uploadedCount : (existingData.uploadedCount || 0),
      approvedCount: typeof userData.approvedCount === 'number' ? userData.approvedCount : (existingData.approvedCount || 0),
      rejectedCount: typeof userData.rejectedCount === 'number' ? userData.rejectedCount : (existingData.rejectedCount || 0),
      duplicateCount: typeof userData.duplicateCount === 'number' ? userData.duplicateCount : (existingData.duplicateCount || 0),
      pendingCount: typeof userData.pendingCount === 'number' ? userData.pendingCount : (existingData.pendingCount || 0),
      totalViews: typeof userData.totalViews === 'number' ? userData.totalViews : (existingData.totalViews || 0),
      totalDownloads: typeof userData.totalDownloads === 'number' ? userData.totalDownloads : (existingData.totalDownloads || 0),
      totalEarned: typeof userData.totalEarned === 'number' ? userData.totalEarned : (existingData.totalEarned || 0),
      pendingPayment: typeof userData.pendingPayment === 'number' ? userData.pendingPayment : (existingData.pendingPayment || 0),
      totalPaid: typeof userData.totalPaid === 'number' ? userData.totalPaid : (existingData.totalPaid || 0),
      updatedAt: new Date().toISOString(),
    };

    // Store password if provided
    if (userData.password) {
      mergedUser.password = userData.password;
    } else if (existingData.password) {
      mergedUser.password = existingData.password;
    }

    await setDoc(userDocRef, mergedUser, { merge: true });
    console.log(`✅ [Cloud Firestore] User profile for ${cleanMob} saved permanently online.`);

    const { password, ...safeUser } = mergedUser;
    return safeUser as User;
  } catch (error) {
    console.error('Error saving user to Firestore:', error);
    return null;
  }
}

export async function getUserFromFirestore(mobile: string): Promise<User | null> {
  const cleanMob = cleanMobile(mobile);
  if (!cleanMob || cleanMob.length !== 10) return null;

  try {
    const userDocRef = doc(db, 'users', cleanMob);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const { password, ...safeUser } = data;
    return safeUser as User;
  } catch (error) {
    console.error('Error fetching user from Firestore:', error);
    return null;
  }
}

export async function authenticateWithFirestore(
  mobile: string,
  password?: string
): Promise<{ user: User | null; isNewUser: boolean; error?: string }> {
  const cleanMob = cleanMobile(mobile);
  if (!cleanMob || cleanMob.length !== 10) {
    return { user: null, isNewUser: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  try {
    const userDocRef = doc(db, 'users', cleanMob);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();

      // If user registered with a password, verify password if provided
      if (password && data.password && data.password !== password) {
        return { user: null, isNewUser: false, error: 'Incorrect password entered.' };
      }

      if (data.status === 'suspended') {
        return { user: null, isNewUser: false, error: 'This account has been suspended.' };
      }

      // Update last active
      await updateDoc(userDocRef, {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(password && !data.password ? { password } : {}),
      });

      const { password: _, ...safeUser } = data;
      return { user: safeUser as User, isNewUser: false };
    }

    // New User Registration in Firestore Online Database
    const newUserRecord: Record<string, any> = {
      id: `usr-${Date.now()}`,
      mobile: cleanMob,
      name: `Student ${cleanMob.slice(-4)}`,
      password: password || 'pass123',
      email: '',
      dob: '',
      place: '',
      city: '',
      state: 'Uttar Pradesh',
      educationCategory: 'college',
      institution: '',
      course: '',
      profileCompleted: false,
      profileCompletionPercent: 20,
      role: 'student',
      status: 'active',
      otpVerified: true,
      joinedDate: new Date().toISOString().split('T')[0],
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newUserRecord);
    console.log(`✅ [Cloud Firestore] New user registered permanently in online database: ${cleanMob}`);

    const { password: _, ...safeUser } = newUserRecord;
    return { user: safeUser as User, isNewUser: true };
  } catch (error: any) {
    console.error('Firestore authentication error:', error);
    return { user: null, isNewUser: false, error: error.message || 'Authentication error.' };
  }
}

// ========================================================
// 2. ONLINE CLOUD PAPERS COLLECTION
// ========================================================

export async function savePaperToFirestore(paper: PaperItem): Promise<boolean> {
  try {
    const paperRef = doc(db, 'papers', paper.id);
    await setDoc(paperRef, paper, { merge: true });
    console.log(`✅ [Cloud Firestore] Paper "${paper.title}" saved online.`);
    return true;
  } catch (error) {
    console.error('Error saving paper to Firestore:', error);
    return false;
  }
}

export async function getPapersFromFirestore(): Promise<PaperItem[]> {
  try {
    const q = query(collection(db, 'papers'), limit(200));
    const snap = await getDocs(q);
    const papers: PaperItem[] = [];
    snap.forEach(d => {
      papers.push(d.data() as PaperItem);
    });
    return papers;
  } catch (error) {
    console.error('Error fetching papers from Firestore:', error);
    return [];
  }
}

export async function updatePaperStatusInFirestore(
  paperId: string,
  status: PaperItem['status'],
  reason?: string
): Promise<boolean> {
  try {
    const paperRef = doc(db, 'papers', paperId);
    await updateDoc(paperRef, {
      status,
      ...(reason ? { rejectionReason: reason } : {}),
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Error updating paper status in Firestore:', error);
    return false;
  }
}

// ========================================================
// 3. ONLINE CLOUD EBOOKS & ANSWER KEYS & REPORTS
// ========================================================

export async function saveEBookToFirestore(ebook: EBookItem): Promise<boolean> {
  try {
    const docRef = doc(db, 'ebooks', ebook.id);
    await setDoc(docRef, ebook, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving ebook to Firestore:', error);
    return false;
  }
}

export async function getEBooksFromFirestore(): Promise<EBookItem[]> {
  try {
    const snap = await getDocs(collection(db, 'ebooks'));
    const list: EBookItem[] = [];
    snap.forEach(d => list.push(d.data() as EBookItem));
    return list;
  } catch (error) {
    console.error('Error fetching ebooks from Firestore:', error);
    return [];
  }
}

export async function saveAnswerKeyToFirestore(answerKey: AnswerKeyItem): Promise<boolean> {
  try {
    const docRef = doc(db, 'answerKeys', answerKey.id);
    await setDoc(docRef, answerKey, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving answer key to Firestore:', error);
    return false;
  }
}

export async function getAnswerKeysFromFirestore(): Promise<AnswerKeyItem[]> {
  try {
    const snap = await getDocs(collection(db, 'answerKeys'));
    const list: AnswerKeyItem[] = [];
    snap.forEach(d => list.push(d.data() as AnswerKeyItem));
    return list;
  } catch (error) {
    console.error('Error fetching answer keys from Firestore:', error);
    return [];
  }
}

export async function saveReportToFirestore(report: ContentReport): Promise<boolean> {
  try {
    const docRef = doc(db, 'reports', report.id);
    await setDoc(docRef, report, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
    return false;
  }
}

export async function getReportsFromFirestore(): Promise<ContentReport[]> {
  try {
    const snap = await getDocs(collection(db, 'reports'));
    const list: ContentReport[] = [];
    snap.forEach(d => list.push(d.data() as ContentReport));
    return list;
  } catch (error) {
    console.error('Error fetching reports from Firestore:', error);
    return [];
  }
}

export async function saveAuditLogToFirestore(log: AuditLog): Promise<boolean> {
  try {
    const docRef = doc(db, 'auditLogs', log.id);
    await setDoc(docRef, log, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving audit log to Firestore:', error);
    return false;
  }
}

export async function getAuditLogsFromFirestore(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: AuditLog[] = [];
    snap.forEach(d => list.push(d.data() as AuditLog));
    return list;
  } catch (error) {
    console.error('Error fetching audit logs from Firestore:', error);
    return [];
  }
}

// ========================================================
// 4. REALTIME LISTENERS
// ========================================================

export function subscribeToOnlinePapers(callback: (papers: PaperItem[]) => void) {
  try {
    const q = query(collection(db, 'papers'), limit(200));
    return onSnapshot(
      q,
      snapshot => {
        const papers: PaperItem[] = [];
        snapshot.forEach(docSnap => {
          papers.push(docSnap.data() as PaperItem);
        });
        callback(papers);
      },
      err => {
        console.warn('Firestore papers subscription note:', err);
      }
    );
  } catch (e) {
    console.warn('Could not attach Firestore listener:', e);
    return () => {};
  }
}

export function subscribeToOnlineUser(mobile: string, callback: (user: User | null) => void) {
  const cleanMob = cleanMobile(mobile);
  if (!cleanMob || cleanMob.length !== 10) return () => {};

  try {
    const userDocRef = doc(db, 'users', cleanMob);
    return onSnapshot(
      userDocRef,
      docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const { password, ...safeUser } = data;
          callback(safeUser as User);
        } else {
          callback(null);
        }
      },
      err => {
        console.warn('Firestore user subscription note:', err);
      }
    );
  } catch (e) {
    console.warn('Could not attach Firestore user listener:', e);
    return () => {};
  }
}
