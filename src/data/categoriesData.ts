import { EducationCategory, PathCategoryItem } from '../types';

export const PATH_CATEGORIES: PathCategoryItem[] = [
  {
    id: 'school',
    title: 'School',
    subtitle: 'CBSE, ICSE, UP Board, State Boards (Class 9 - 12)',
    iconName: 'GraduationCap',
    popularExams: ['CBSE Class 12', 'CBSE Class 10', 'UP Board Inter', 'Bihar Board BSEB', 'Maharashtra HSC'],
    paperCount: 14200,
  },
  {
    id: 'college',
    title: 'College & University',
    subtitle: 'B.Tech, B.Com, B.Sc, BA, BCA, MBA, M.Tech (All Semesters)',
    iconName: 'Building2',
    popularExams: ['AKTU Lucknow', 'Delhi University (DU)', 'SPPU Pune', 'VTU Karnataka', 'Mumbai University', 'Anna University'],
    paperCount: 38500,
  },
  {
    id: 'competitive',
    title: 'Competitive Exams',
    subtitle: 'UPSC CSE, SSC CGL, IBPS Banking, Railways RRB, State PSC',
    iconName: 'Award',
    popularExams: ['UPSC Prelims & Mains', 'SSC CGL', 'IBPS PO', 'RRB NTPC', 'UPPSC', 'BPSC'],
    paperCount: 9800,
  },
  {
    id: 'entrance',
    title: 'Entrance Exams',
    subtitle: 'JEE Main/Adv, NEET UG, GATE, CAT, CUET, CLAT',
    iconName: 'Compass',
    popularExams: ['JEE Main', 'NEET UG', 'GATE CS / EE', 'CAT IIM', 'CUET UG', 'CLAT Law'],
    paperCount: 12400,
  },
  {
    id: 'diploma',
    title: 'Diploma & ITI',
    subtitle: 'Polytechnic Engineering, State Technical Boards, NCVT Trades',
    iconName: 'Wrench',
    popularExams: ['Polytechnic Diploma CS/Mech', 'BTEUP', 'DTE Maharashtra', 'NCVT Electrician', 'NCVT Fitter'],
    paperCount: 5600,
  },
  {
    id: 'professional',
    title: 'Professional Courses',
    subtitle: 'CA Foundation / Inter, CS, CMA, LLB Law, Architecture',
    iconName: 'Briefcase',
    popularExams: ['ICAI CA Foundation', 'CA Intermediate', 'ICSI CS Executive', 'Bar Council LLB', 'NATA Architecture'],
    paperCount: 4300,
  },
  {
    id: 'government',
    title: 'Government Exams',
    subtitle: 'Defence NDA/CDS, Teaching CTET/TET, Police SI, SSC GD',
    iconName: 'ShieldCheck',
    popularExams: ['UPSC NDA', 'CDSE Defence', 'CTET Paper 1 & 2', 'State Police SI', 'SSC GD Constable'],
    paperCount: 7100,
  },
  {
    id: 'other',
    title: 'Other Exams',
    subtitle: 'Nursing (B.Sc/GNM), Pharmacy (B.Pharm), NIOS, IGNOU',
    iconName: 'BookOpen',
    popularExams: ['B.Pharm 1st-8th Sem', 'B.Sc Nursing', 'IGNOU BCA / B.Com', 'NIOS Class 12', 'D.Pharm'],
    paperCount: 3900,
  },
];

export interface BoardExamOption {
  id: string;
  name: string;
  category: EducationCategory;
  courses: {
    name: string;
    subjects: string[];
  }[];
}

export const ACADEMIC_DIRECTORY: Record<EducationCategory, {
  institutions: {
    name: string;
    shortCode?: string;
    state?: string;
    courses: {
      name: string;
      semestersOrClasses: string[];
      subjects: string[];
    }[];
  }[];
}> = {
  school: {
    institutions: [
      {
        name: 'Central Board of Secondary Education (CBSE)',
        shortCode: 'CBSE',
        state: 'All India',
        courses: [
          {
            name: 'Class 12 (Science Stream)',
            semestersOrClasses: ['Board Final Examination', 'Pre-Board Exam', 'Term 1 / Mid-Term'],
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science (Python)', 'English Core'],
          },
          {
            name: 'Class 12 (Commerce Stream)',
            semestersOrClasses: ['Board Final Examination', 'Pre-Board Exam', 'Term 1 / Mid-Term'],
            subjects: ['Accountancy', 'Business Studies', 'Economics', 'Applied Mathematics', 'English Core'],
          },
          {
            name: 'Class 12 (Humanities / Arts)',
            semestersOrClasses: ['Board Final Examination', 'Pre-Board Exam'],
            subjects: ['History', 'Political Science', 'Geography', 'Psychology', 'Sociology', 'English Elective'],
          },
          {
            name: 'Class 10 (Secondary School)',
            semestersOrClasses: ['Annual Board Exam', 'Pre-Board Exam'],
            subjects: ['Mathematics (Standard)', 'Mathematics (Basic)', 'Science', 'Social Science', 'English', 'Hindi'],
          },
        ],
      },
      {
        name: 'Uttar Pradesh State Board (UPMSP / UP Board)',
        shortCode: 'UP Board',
        state: 'Uttar Pradesh',
        courses: [
          {
            name: 'Class 12 (Intermediate)',
            semestersOrClasses: ['Board Annual Exam', 'Model Papers'],
            subjects: ['General Hindi', 'Physics (Bhautik Vigyan)', 'Chemistry (Rasayan)', 'Mathematics', 'Biology (Jeev Vigyan)', 'English'],
          },
          {
            name: 'Class 10 (High School)',
            semestersOrClasses: ['Board Annual Exam'],
            subjects: ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English', 'Drawing / Computer'],
          },
        ],
      },
      {
        name: 'Bihar School Examination Board (BSEB)',
        shortCode: 'BSEB',
        state: 'Bihar',
        courses: [
          {
            name: 'Class 12 (Inter Science & Arts)',
            semestersOrClasses: ['Annual Board Exam', 'Sent Up Examination'],
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Hindi 100 Marks', 'English 100 Marks'],
          },
        ],
      },
      {
        name: 'Council for the Indian School Certificate Examinations (ICSE / ISC)',
        shortCode: 'CISCE',
        state: 'All India',
        courses: [
          {
            name: 'ISC Class 12',
            semestersOrClasses: ['Board Exam', 'Pre-Board'],
            subjects: ['Physics', 'Chemistry', 'Mathematics', 'Commerce', 'Accounts', 'Literature in English'],
          },
          {
            name: 'ICSE Class 10',
            semestersOrClasses: ['Board Exam'],
            subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography', 'English Language'],
          },
        ],
      },
      {
        name: 'Maharashtra State Board (MSBSHSE)',
        shortCode: 'HSC Board',
        state: 'Maharashtra',
        courses: [
          {
            name: 'Class 12 (HSC Science & Commerce)',
            semestersOrClasses: ['HSC Board Examination'],
            subjects: ['Physics', 'Chemistry', 'Mathematics & Statistics', 'Biology', 'Secretarial Practice', 'Book Keeping & Accountancy'],
          },
        ],
      },
    ],
  },
  college: {
    institutions: [
      {
        name: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU / UPTU)',
        shortCode: 'AKTU',
        state: 'Uttar Pradesh',
        courses: [
          {
            name: 'B.Tech Computer Science & Engineering',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
            subjects: ['Data Structures & Algorithms', 'Database Management Systems (DBMS)', 'Operating Systems', 'Design and Analysis of Algorithms (DAA)', 'Computer Networks', 'Discrete Mathematics', 'Theory of Automata & Formal Languages', 'Compiler Design', 'Software Engineering'],
          },
          {
            name: 'B.Tech Electronics & Communication (ECE)',
            semestersOrClasses: ['Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Digital Signal Processing', 'Electromagnetic Field Theory', 'Microprocessors & Microcontrollers', 'Signals and Systems', 'VLSI Design'],
          },
          {
            name: 'B.Tech Mechanical & Civil Engineering',
            semestersOrClasses: ['Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Kinematics of Machines', 'Structural Analysis'],
          },
          {
            name: 'MBA (Master of Business Administration)',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
            subjects: ['Financial Management', 'Marketing Management', 'Human Resource Management', 'Quantitative Techniques', 'Business Research Methods'],
          },
        ],
      },
      {
        name: 'University of Delhi (DU / Delhi University)',
        shortCode: 'DU',
        state: 'Delhi NCR',
        courses: [
          {
            name: 'B.Com (Honours)',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Financial Accounting', 'Corporate Laws', 'Income Tax Law & Practice', 'Cost Accounting', 'Management Principles & Applications', 'Goods & Services Tax (GST)'],
          },
          {
            name: 'B.Sc (Hons) Computer Science & Physics',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Programming Fundamentals using C++', 'Data Structures', 'Mathematical Physics', 'Classical Mechanics', 'Quantum Mechanics', 'Digital System Architecture'],
          },
          {
            name: 'BA (Hons) Economics & Political Science',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Introductory Microeconomics', 'Introductory Macroeconomics', 'Statistical Methods for Economics', 'Colonialism and Nationalism in India', 'Global Politics'],
          },
        ],
      },
      {
        name: 'Savitribai Phule Pune University (SPPU / Pune University)',
        shortCode: 'SPPU',
        state: 'Maharashtra',
        courses: [
          {
            name: 'B.E. Computer Engineering / IT',
            semestersOrClasses: ['Sem 3 (SE)', 'Sem 4 (SE)', 'Sem 5 (TE)', 'Sem 6 (TE)', 'Sem 7 (BE)', 'Sem 8 (BE)'],
            subjects: ['Data Structures and Algorithms', 'Object Oriented Programming', 'Database Management Systems', 'Theory of Computation', 'Computer Organization & Architecture', 'Cloud Computing', 'Artificial Intelligence'],
          },
        ],
      },
      {
        name: 'Visvesvaraya Technological University (VTU)',
        shortCode: 'VTU',
        state: 'Karnataka',
        courses: [
          {
            name: 'B.E. Computer Science / Information Science',
            semestersOrClasses: ['3rd Sem (21Scheme)', '4th Sem', '5th Sem', '6th Sem', '7th Sem'],
            subjects: ['Analog & Digital Electronics', 'Data Structures using C', 'Computer Organization', 'Design & Analysis of Algorithms', 'Microcontroller and Embedded Systems', 'Operating Systems'],
          },
        ],
      },
      {
        name: 'Anna University (Chennai)',
        shortCode: 'Anna Univ',
        state: 'Tamil Nadu',
        courses: [
          {
            name: 'B.E. / B.Tech (Regulation 2021)',
            semestersOrClasses: ['Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'],
            subjects: ['Engineering Mathematics II', 'Digital Principles & System Design', 'Data Structures', 'Object Oriented Programming in Java', 'Computer Architecture', 'Theory of Computation'],
          },
        ],
      },
      {
        name: 'Maulana Abul Kalam Azad University of Technology (MAKAUT / WBUT)',
        shortCode: 'MAKAUT',
        state: 'West Bengal',
        courses: [
          {
            name: 'B.Tech All Branches',
            semestersOrClasses: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            subjects: ['Basic Electrical Engineering', 'Physics-I', 'Data Structure & Algorithm', 'Discrete Mathematics', 'Digital Electronics', 'Formal Language & Automata Theory'],
          },
        ],
      },
    ],
  },
  competitive: {
    institutions: [
      {
        name: 'Union Public Service Commission (UPSC)',
        shortCode: 'UPSC',
        courses: [
          {
            name: 'Civil Services Examination (CSE)',
            semestersOrClasses: ['Prelims Paper 1 (General Studies)', 'Prelims Paper 2 (CSAT)', 'Mains GS Paper 1', 'Mains GS Paper 2', 'Mains GS Paper 3', 'Mains GS Paper 4 (Ethics)', 'Mains Essay Paper'],
            subjects: ['Indian Polity & Governance', 'Modern Indian History & Culture', 'Geography of India & World', 'Indian Economy & Sustainable Development', 'General Science & Environment', 'Ethics, Integrity & Aptitude', 'CSAT Quantitative Aptitude & Reading Comprehension'],
          },
        ],
      },
      {
        name: 'Staff Selection Commission (SSC)',
        shortCode: 'SSC',
        courses: [
          {
            name: 'SSC Combined Graduate Level (CGL)',
            semestersOrClasses: ['Tier 1 Exam', 'Tier 2 Paper 1 (Maths & Reasoning)', 'Tier 2 Paper 2 (English & GA)', 'Tier 2 Computer Knowledge Test'],
            subjects: ['Quantitative Aptitude (Maths)', 'General Intelligence & Reasoning', 'English Language & Comprehension', 'General Awareness', 'Computer Knowledge & Statistics'],
          },
          {
            name: 'SSC CHSL (10+2 Level)',
            semestersOrClasses: ['Tier 1 Exam', 'Tier 2 Exam'],
            subjects: ['Quantitative Aptitude', 'General Intelligence', 'English Language', 'General Awareness'],
          },
        ],
      },
      {
        name: 'Institute of Banking Personnel Selection (IBPS / SBI)',
        shortCode: 'IBPS / SBI',
        courses: [
          {
            name: 'Bank Probationary Officer (PO)',
            semestersOrClasses: ['Prelims Exam', 'Mains Examination'],
            subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General / Banking / Economy Awareness', 'Data Analysis & Interpretation'],
          },
        ],
      },
      {
        name: 'Railway Recruitment Boards (RRB)',
        shortCode: 'RRB',
        courses: [
          {
            name: 'RRB NTPC (Non-Technical Popular Categories)',
            semestersOrClasses: ['CBT 1 (Stage 1)', 'CBT 2 (Stage 2)'],
            subjects: ['General Awareness', 'Mathematics', 'General Intelligence & Reasoning'],
          },
        ],
      },
    ],
  },
  entrance: {
    institutions: [
      {
        name: 'National Testing Agency (NTA)',
        shortCode: 'NTA',
        courses: [
          {
            name: 'JEE Main (Joint Entrance Examination)',
            semestersOrClasses: ['January Session (Shift 1 & 2)', 'April Session (Shift 1 & 2)'],
            subjects: ['Physics', 'Chemistry', 'Mathematics'],
          },
          {
            name: 'NEET UG (National Eligibility cum Entrance Test)',
            semestersOrClasses: ['National Exam (Single Shift)'],
            subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
          },
          {
            name: 'CUET UG (Common University Entrance Test)',
            semestersOrClasses: ['Slot 1', 'Slot 2'],
            subjects: ['General Test', 'English Language', 'Physics', 'Mathematics', 'Chemistry', 'Economics', 'Accountancy', 'Political Science'],
          },
        ],
      },
      {
        name: 'IIT Graduate Aptitude Test in Engineering (GATE)',
        shortCode: 'GATE',
        courses: [
          {
            name: 'GATE Computer Science & IT (CS)',
            semestersOrClasses: ['National Examination'],
            subjects: ['Engineering Mathematics & Discrete Math', 'Digital Logic & Computer Architecture', 'Data Structures & Algorithms', 'Theory of Computation & Compilers', 'Operating Systems & DBMS', 'Computer Networks'],
          },
          {
            name: 'GATE Electrical & Electronics (EE / EC)',
            semestersOrClasses: ['National Examination'],
            subjects: ['Electric Circuits', 'Electromagnetic Fields', 'Signals and Systems', 'Electrical Machines', 'Power Systems', 'Control Systems'],
          },
        ],
      },
      {
        name: 'Common Admission Test (CAT IIM)',
        shortCode: 'CAT',
        courses: [
          {
            name: 'CAT for IIMs MBA Entrance',
            semestersOrClasses: ['Slot 1', 'Slot 2', 'Slot 3'],
            subjects: ['Verbal Ability & Reading Comprehension (VARC)', 'Data Interpretation & Logical Reasoning (DILR)', 'Quantitative Aptitude (QA)'],
          },
        ],
      },
    ],
  },
  diploma: {
    institutions: [
      {
        name: 'Board of Technical Education UP (BTEUP / Polytechnic)',
        shortCode: 'BTEUP',
        state: 'Uttar Pradesh',
        courses: [
          {
            name: 'Polytechnic Diploma in Computer Science',
            semestersOrClasses: ['1st Year (Sem 1 & 2)', '2nd Year (Sem 3 & 4)', '3rd Year (Sem 5 & 6)'],
            subjects: ['Applied Mathematics', 'Applied Physics', 'Concept of Programming using C', 'Data Structure using C', 'Database Management System', 'Operating System', 'Web Development (PHP/JS)'],
          },
          {
            name: 'Polytechnic Diploma in Mechanical / Civil',
            semestersOrClasses: ['Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
            subjects: ['Applied Mechanics', 'Fluid Mechanics', 'Engineering Materials', 'Strength of Materials', 'Surveying'],
          },
        ],
      },
      {
        name: 'Directorate of Technical Education Maharashtra (MSBTE)',
        shortCode: 'MSBTE',
        state: 'Maharashtra',
        courses: [
          {
            name: 'Diploma in Engineering (I-Scheme)',
            semestersOrClasses: ['Semester 3', 'Semester 4', 'Semester 5'],
            subjects: ['Applied Mathematics', 'Data Structures', 'Object Oriented Programming', 'Computer Networks', 'Software Engineering'],
          },
        ],
      },
    ],
  },
  professional: {
    institutions: [
      {
        name: 'Institute of Chartered Accountants of India (ICAI)',
        shortCode: 'ICAI',
        courses: [
          {
            name: 'CA Foundation Course',
            semestersOrClasses: ['May / June Exam', 'Nov / Dec Exam'],
            subjects: ['Principles and Practice of Accounting', 'Business Laws and Business Correspondence (BCR)', 'Business Mathematics, Logical Reasoning & Statistics', 'Business Economics and Business & Commercial Knowledge (BCK)'],
          },
          {
            name: 'CA Intermediate (Group 1 & 2)',
            semestersOrClasses: ['Group 1 Papers', 'Group 2 Papers'],
            subjects: ['Advanced Accounting', 'Corporate and Other Laws', 'Taxation (Income Tax & GST)', 'Cost and Management Accounting', 'Auditing and Ethics', 'Financial Management and Strategic Management'],
          },
        ],
      },
      {
        name: 'Bar Council / CLAT PG & LLB',
        shortCode: 'Law',
        courses: [
          {
            name: '3-Year & 5-Year LL.B.',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
            subjects: ['Constitutional Law of India', 'Law of Torts and Consumer Protection', 'Law of Crimes (Indian Penal Code)', 'Law of Contract', 'Family Law (Hindu & Muslim Law)', 'Jurisprudence'],
          },
        ],
      },
    ],
  },
  government: {
    institutions: [
      {
        name: 'UPSC National Defence Academy (NDA)',
        shortCode: 'NDA / NA',
        courses: [
          {
            name: 'NDA & NA Examination (I & II)',
            semestersOrClasses: ['Paper 1 (Mathematics)', 'Paper 2 (General Ability Test - GAT)'],
            subjects: ['Mathematics (Trigonometry, Algebra, Calculus)', 'English Vocabulary & Comprehension', 'General Knowledge (Physics, Chemistry, History, Current Events)'],
          },
        ],
      },
      {
        name: 'Central Teacher Eligibility Test (CTET)',
        shortCode: 'CTET',
        courses: [
          {
            name: 'CTET (Paper 1 - Classes I to V & Paper 2 - Classes VI to VIII)',
            semestersOrClasses: ['Paper 1 (Primary Stage)', 'Paper 2 (Elementary Stage)'],
            subjects: ['Child Development and Pedagogy (CDP)', 'Mathematics & Pedagogy', 'Environmental Studies (EVS)', 'Language I (Hindi / English)', 'Social Studies / Science'],
          },
        ],
      },
    ],
  },
  other: {
    institutions: [
      {
        name: 'Pharmacy Council of India (PCI) / State Universities',
        shortCode: 'PCI B.Pharm',
        courses: [
          {
            name: 'Bachelor of Pharmacy (B.Pharm - PCI Syllabus)',
            semestersOrClasses: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
            subjects: ['Human Anatomy and Physiology', 'Pharmaceutical Analysis', 'Pharmaceutics', 'Pharmaceutical Inorganic Chemistry', 'Physical Pharmaceutics', 'Pharmacology', 'Medicinal Chemistry'],
          },
        ],
      },
      {
        name: 'Indira Gandhi National Open University (IGNOU)',
        shortCode: 'IGNOU',
        courses: [
          {
            name: 'IGNOU BCA / MCA',
            semestersOrClasses: ['Term End Exam (June)', 'Term End Exam (December)'],
            subjects: ['BCS-011 Computer Basics and PC Software', 'BCS-012 Basic Mathematics', 'MCS-021 Data and File Structures', 'MCS-023 Introduction to Database Management Systems'],
          },
        ],
      },
    ],
  },
};
