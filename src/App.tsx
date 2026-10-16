import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import {
  Lock,
  Unlock,
  Plus,
  Search,
  BookOpen,
  Share2,
  GraduationCap,
  Video,
  FileCheck2,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { db, testConnection, handleFirestoreError, isQuotaError } from './firebase';
import { Category, ShelfItem, ShelfConfig, OperationType } from './types';
import { CURRICULUM } from './curriculumData';
import { ThemeToggle } from './components/ThemeToggle';
import { TeacherBar } from './components/TeacherBar';
import { PasscodeModal } from './components/PasscodeModal';
import { CategoryModal } from './components/CategoryModal';
import { AddResourceForm } from './components/AddResourceForm';
import { DrawerItem } from './components/DrawerItem';
import { PreviewModal } from './components/PreviewModal';
import { EditItemModal } from './components/EditItemModal';
import { ExtraResourcesModal } from './components/ExtraResourcesModal';
import { AssessmentsModal } from './components/AssessmentsModal';
import { TimelineModal } from './components/TimelineModal';
import { VisibilityManagerModal } from './components/VisibilityManagerModal';
import { ShareModal } from './components/ShareModal';
import { StandaloneViewer } from './components/StandaloneViewer';
import { saveFileToIndexedDB, deleteFileFromIndexedDB } from './utils/storageDB';
import { createMarkSchemeShelfItem } from './utils/fileViewer';
import { analyseUrl } from './utils/linkAnalyzer';

const DEFAULT_PASSCODE = 'teacher123';
const UNSORTED_CAT_ID = '__unsorted';
const LOCAL_STORAGE_CATS = 'ps.categories';
const LOCAL_STORAGE_LINKS = 'ps.links';
const LOCAL_STORAGE_CONFIG = 'ps.config';

const loadInitialCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge in any newly added syllabus subcategories from the course guides
        const existingIds = new Set(parsed.map((c) => c.id));
        const missing = CURRICULUM.filter((c) => !existingIds.has(c.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
    }
  } catch {}
  return CURRICULUM;
};

const loadInitialLinks = (): ShelfItem[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LINKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [
    {
      id: 'demo-gh-pages',
      type: 'link',
      kind: 'link',
      url: 'https://github.com',
      title: 'GitHub Repositories & Pages',
      cat: 'igcse-t2-1',
      note: 'Teacher starter repositories and student project hosting.',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-flowchart',
      type: 'link',
      kind: 'link',
      url: 'https://poojaaro.github.io/cs-guide/',
      title: 'Computer Science Interactive Guide',
      cat: 'ib-a1-1-1',
      note: 'Interactive syllabus reference and computational thinking notes.',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-video-pipeline',
      type: 'link',
      kind: 'video',
      url: 'https://www.youtube.com/watch?v=rtAlC5J1U40',
      embedUrl: 'https://www.youtube-nocookie.com/embed/rtAlC5J1U40?rel=0',
      title: 'CPU Architecture & Fetch-Decode-Execute Cycle',
      cat: 'ib-a1-1-5',
      note: 'Visual walkthrough of instruction cycle, registers, and ALU.',
      videoDuration: '12 mins',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-logic-quiz',
      type: 'link',
      kind: 'assessment',
      assessmentType: 'quiz',
      url: 'https://forms.google.com',
      title: 'Logic Gates & Boolean Algebra Checkpoint Quiz',
      cat: 'ib-a1-2-3',
      note: 'Formative assessment on truth tables and simplified circuit expressions.',
      dueDate: 'Week 5',
      maxMarks: 20,
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-cs-timeline',
      type: 'link',
      kind: 'timeline',
      url: 'https://cs-timeline-five.vercel.app/',
      title: 'CS Timeline App',
      cat: 'ib-a1',
      note: 'Interactive Computer Science Timeline & Syllabus Roadmap.',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-code-sort',
      type: 'file',
      kind: 'file',
      title: 'Searching & Sorting Algorithms Worksheet',
      fileName: 'algorithms_search_sort.py',
      ext: 'py',
      size: 1420,
      fileData: `# Computer Science IB & IGCSE: Searching and Sorting Algorithms
# Interactive Reference Worksheet

def linear_search(arr, target):
    """Linear Search: Time Complexity O(n)"""
    for index, value in enumerate(arr):
        if value == target:
            return index
    return -1

def binary_search(arr, target):
    """Binary Search on sorted array: Time Complexity O(log n)"""
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def bubble_sort(arr):
    """Bubble Sort with early termination: Time Complexity O(n^2)"""
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

# Test dataset
if __name__ == '__main__':
    data = [64, 34, 25, 12, 22, 11, 90]
    print("Original array:", data)
    sorted_data = bubble_sort(data.copy())
    print("Sorted array:", sorted_data)
    idx = binary_search(sorted_data, 25)
    print("Index of 25 in sorted array:", idx)
`,
      cat: 'ib-a2-1-1',
      note: 'Python code sample: Binary search, linear search, and bubble sort implementations with docstrings. Click to view on desktop!',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-notes-markdown',
      type: 'file',
      kind: 'file',
      title: 'System Fundamentals & Ethics Study Sheet',
      fileName: 'systems_fundamentals_study_notes.md',
      ext: 'md',
      size: 2150,
      fileData: `# Computer Science: Systems in Organizations

## 1. System Planning & Implementation
- **Direct Changeover**: Immediate replacement of old system with new.
  - *Advantage*: Rapid, low cost.
  - *Risk*: Complete dependency; no fallback if failure occurs.
- **Phased Implementation**: Modules installed sequentially.
  - *Advantage*: Controlled rollout, easier user training.
- **Parallel Running**: Both systems run concurrently.
  - *Advantage*: High safety, output comparison.
  - *Disadvantage*: High personnel cost and workload.

## 2. Computational Thinking Principles
1. **Decomposition**: Breaking complex problems into manageable sub-problems.
2. **Pattern Recognition**: Identifying similarities and recurring trends.
3. **Abstraction**: Filtering out unnecessary details to focus on core logic.
4. **Algorithm Design**: Developing step-by-step instructions to solve the problem.

---
*Prepared for Student Desktop Study Reference*
`,
      cat: 'ib-a1-1-1',
      note: 'Markdown revision notes covering changeover strategies and core computational thinking pillars.',
      visibleToStudents: true,
      createdAt: Date.now()
    },
    {
      id: 'demo-pdf-syllabus',
      type: 'file',
      kind: 'file',
      title: 'Computer Science Course Companion & Syllabus PDF',
      fileName: 'cs_syllabus_quick_reference.pdf',
      ext: 'pdf',
      size: 3240,
      fileData: 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAyMTggPj4Kc3RyZWFtCkJUCi9GMTsgMjIgVGYKNTAgNzIwIFRkCihDb21wdXRlciBTY2llbmNlIENvdXJzZSBDb21wYW5pb24gJiBTeWxsYWJ1cykgVGoKL0YxIDEyIFRmCjAgLTMwIFRkCihTdGFuZGFyZCBJQiAmIElHQ1NFIENvbXB1dGVyIFNjaWVuY2UgUXVpY2sgUmVmZXJlbmNlKSBUagowIC0yNSBUZAooMS4gQ1BVIEFyY2hpdGVjdHVyZSAmIFZvbiBOZXVtYW5uIE1vZGVsKSBUagowIC0yMCBUZAooMi4gRGF0YSBSZXByZXNlbnRhdGlvbiAmIEJpbmFyeSBMb2dpYykgVGoKMCAtMjAgVGQKKDMuIENvbXB1dGF0aW9uYWwgVGhpbmtpbmcgJiBBbGdvcml0aG0gRGVzaWduKSBUagowIC0zMCBUZAooRGVza3RvcCBGaWxlIFZpZXdlcjogU3R1ZGVudHMgY2FuIHZpZXcgdGhpcyBkb2N1bWVudCBkaXJlY3RseSB3aXRob3V0IGRvd25sb2FkaW5nISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ0IDAwMDAwIG4gCjAwMDAwMDA1MTQgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo1ODMKJSVFT0Y=',
      cat: 'ib-a1-1',
      note: 'Official Course Guide & Quick Reference PDF. View directly in browser desktop reader or open in a new desktop tab.',
      visibleToStudents: true,
      createdAt: Date.now()
    }
  ];
};

export default function App() {
  const [categories, setCategories] = useState<Category[]>(loadInitialCategories);
  const [links, setLinks] = useState<ShelfItem[]>(loadInitialLinks);
  const [config, setConfig] = useState<ShelfConfig>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.timelineAppUrl || parsed.timelineAppUrl.includes('poojaaro.github.io/timeline')) {
          parsed.timelineAppUrl = 'https://cs-timeline-five.vercel.app/';
          parsed.timelineAppTitle = 'Timeline App';
          localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    return {
      teacherPasscodeHash: DEFAULT_PASSCODE,
      shelfTitle: 'Page Shelf',
      shelfDescription: "Every web page and file you've made, in one place. Categorized by topic and accessible to students.",
      showExtraResourcesToStudents: true,
      showAssessmentsToStudents: true,
      showTimelineToStudents: true,
      timelineAppUrl: 'https://cs-timeline-five.vercel.app/',
      timelineAppTitle: 'Timeline App'
    };
  });
  const [loading, setLoading] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  // Standalone route detection helpers
  const isStudentUrl = (): boolean => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      return (
        path.includes('/student') ||
        path.includes('/learn') ||
        hash.includes('student') ||
        params.has('student') ||
        params.get('view') === 'student'
      );
    } catch {
      return false;
    }
  };

  const isTeacherUrl = (): boolean => {
    try {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      return (
        hash.includes('teacher') ||
        hash.includes('admin') ||
        path.includes('/teacher') ||
        path.includes('/admin') ||
        params.has('teacher') ||
        params.get('view') === 'teacher'
      );
    } catch {
      return false;
    }
  };

  // Standalone full-screen file viewer detection: #view=itemId
  const [standaloneViewerItemId, setStandaloneViewerItemId] = useState<string | null>(() => {
    try {
      const hash = window.location.hash;
      const match = hash.match(/[#&]view=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      if (viewParam && viewParam !== 'student' && viewParam !== 'teacher') return viewParam;
    } catch {}
    return null;
  });

  // Teacher mode & authentication state - Default is ALWAYS Student View
  const [isTeacher, setIsTeacher] = useState<boolean>(() => {
    try {
      // If student session or student URL, permanently lock in student mode across all navigation
      if (
        sessionStorage.getItem('ps.isStudentSession') === 'true' ||
        localStorage.getItem('ps.isStudentSession') === 'true' ||
        isStudentUrl()
      ) {
        sessionStorage.setItem('ps.isStudentSession', 'true');
        localStorage.setItem('ps.isStudentSession', 'true');
        sessionStorage.removeItem('ps.teacherMode');
        return false;
      }
      // Only unlock teacher if explicitly on teacher route and previously authenticated
      if (isTeacherUrl()) {
        return sessionStorage.getItem('ps.teacherMode') === 'true';
      }
    } catch {}
    // Base URL / ALWAYS defaults to safe Student View
    return false;
  });
  const [studentPreview, setStudentPreview] = useState(false);
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Tab & search filtering
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & previews
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryModalParent, setCategoryModalParent] = useState<string>('');
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [previewItem, setPreviewItem] = useState<ShelfItem | null>(null);
  const [editItem, setEditItem] = useState<ShelfItem | null>(null);
  const [extraResourcesModalOpen, setExtraResourcesModalOpen] = useState(false);
  const [assessmentsModalOpen, setAssessmentsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [visibilityManagerModalOpen, setVisibilityManagerModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  // Listen to hash changes (for standalone viewer and teacher portal)
  useEffect(() => {
    const handleHash = () => {
      try {
        const hash = window.location.hash;
        const match = hash.match(/[#&]view=([^&]+)/);
        if (match) {
          setStandaloneViewerItemId(decodeURIComponent(match[1]));
        } else {
          setStandaloneViewerItemId(null);
        }

        if (hash.includes('teacher') || hash.includes('admin')) {
          const saved = sessionStorage.getItem('ps.teacherMode') === 'true';
          if (!saved) {
            setIsChangingPasscode(false);
            setPasscodeModalOpen(true);
          } else {
            setIsTeacher(true);
          }
        }
      } catch {}
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Initialize and check URL parameters & routes on boot
  useEffect(() => {
    testConnection();

    if (isStudentUrl()) {
      // Force student mode and purge any teacher session token
      setIsTeacher(false);
      setStudentPreview(false);
      try {
        sessionStorage.setItem('ps.isStudentSession', 'true');
        localStorage.setItem('ps.isStudentSession', 'true');
        sessionStorage.removeItem('ps.teacherMode');
      } catch {}
    } else if (isTeacherUrl()) {
      const saved = sessionStorage.getItem('ps.teacherMode') === 'true';
      if (!saved) {
        setIsChangingPasscode(false);
        setPasscodeModalOpen(true);
      } else {
        setIsTeacher(true);
      }
    }
  }, []);

  // Firestore real-time synchronization
  useEffect(() => {
    let isQuotaActive = false;
    try {
      isQuotaActive = sessionStorage.getItem('ps.quotaExceeded') === 'true';
    } catch {}

    if (isQuotaActive) {
      setQuotaExceeded(true);
      setLoading(false);
      return;
    }

    if (!db) {
      setLoading(false);
      return;
    }

    let unsubConfig: (() => void) | null = null;
    let unsubCats: (() => void) | null = null;
    let unsubLinks: (() => void) | null = null;

    // Safety fallback: ensure loading never hangs if remote connection is slow or blocked
    const fallbackTimer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    const detachAll = () => {
      clearTimeout(fallbackTimer);
      unsubConfig?.();
      unsubCats?.();
      unsubLinks?.();
      unsubConfig = null;
      unsubCats = null;
      unsubLinks = null;
    };

    const handleQuota = () => {
      setQuotaExceeded(true);
      try {
        sessionStorage.setItem('ps.quotaExceeded', 'true');
      } catch {}
      setLoading(false);
      detachAll();
    };

    // 1. Listen to config safely
    try {
      unsubConfig = onSnapshot(
        doc(db, 'config', 'settings'),
        (snapshot) => {
          if (snapshot.exists()) {
            const cfg = snapshot.data() as ShelfConfig;
            if (!cfg.timelineAppUrl || cfg.timelineAppUrl.includes('poojaaro.github.io/timeline')) {
              cfg.timelineAppUrl = 'https://cs-timeline-five.vercel.app/';
              cfg.timelineAppTitle = 'Timeline App';
              updateDoc(doc(db, 'config', 'settings'), {
                timelineAppUrl: 'https://cs-timeline-five.vercel.app/',
                timelineAppTitle: 'Timeline App',
                updatedAt: Date.now()
              }).catch(() => {});
            }
            setConfig(cfg);
            try {
              localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(cfg));
            } catch {}
          }
        },
        (error) => {
          if (isQuotaError(error)) {
            handleQuota();
          } else {
            console.warn('Config snapshot notice:', error);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach config listener:', err);
    }

    // 2. Listen to categories safely
    try {
      unsubCats = onSnapshot(
        collection(db, 'categories'),
        (snapshot) => {
          const catList: Category[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          } as Category));

          if (catList.length === 0 && snapshot.metadata.fromCache === false) {
            seedInitialCurriculum();
          } else if (catList.length > 0) {
            setCategories(catList);
            try {
              localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(catList));
            } catch {}
            setLoading(false);
          }
        },
        (error) => {
          if (isQuotaError(error)) {
            handleQuota();
          } else {
            console.warn('Categories snapshot notice:', error);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach categories listener:', err);
    }

    // 3. Listen to links safely
    try {
      unsubLinks = onSnapshot(
        collection(db, 'links'),
        (snapshot) => {
          const linkList: ShelfItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data()
          } as ShelfItem));
          if (linkList.length > 0 || snapshot.docs.length === 0) {
            setLinks(linkList);
            try {
              localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(linkList));
            } catch {}
          }
        },
        (error) => {
          if (isQuotaError(error)) {
            handleQuota();
          } else {
            console.warn('Links snapshot notice:', error);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to attach links listener:', err);
    }

    return () => {
      detachAll();
    };
  }, [retryKey]);

  // Helper: Seed initial curriculum into Firestore
  const seedInitialCurriculum = async () => {
    // Merge or refresh with full curriculum
    const existingIds = new Set(categories.map((c) => c.id));
    const missing = CURRICULUM.filter((c) => !existingIds.has(c.id));
    const updatedCats = missing.length > 0 ? [...categories, ...missing] : CURRICULUM;

    setCategories(updatedCats);
    try {
      localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(updatedCats));
    } catch {}

    showToast(`Loaded ${CURRICULUM.length} syllabus topics and subcategories!`);

    try {
      const batch = writeBatch(db);
      for (const cat of CURRICULUM) {
        const ref = doc(db, 'categories', cat.id);
        batch.set(ref, {
          name: cat.name,
          parent: cat.parent,
          order: cat.order,
          visibleToStudents: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }, { merge: true });
      }

      // Add demo links
      const demoRef1 = doc(db, 'links', 'demo-gh-pages');
      batch.set(demoRef1, {
        type: 'link',
        url: 'https://github.com',
        title: 'GitHub Repositories & Pages',
        cat: 'igcse-t2-1-1',
        note: 'Teacher starter repositories and student project hosting.',
        visibleToStudents: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });

      const demoRef2 = doc(db, 'links', 'demo-flowchart');
      batch.set(demoRef2, {
        type: 'link',
        url: 'https://poojaaro.github.io/cs-guide/',
        title: 'Computer Science Interactive Guide',
        cat: 'ib-a1-1-1',
        note: 'Interactive syllabus reference and computational thinking notes.',
        visibleToStudents: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });

      const demoRef3 = doc(db, 'links', 'demo-video-pipeline');
      batch.set(demoRef3, {
        type: 'link',
        kind: 'video',
        url: 'https://www.youtube.com/watch?v=rtAlC5J1U40',
        embedUrl: 'https://www.youtube-nocookie.com/embed/rtAlC5J1U40?rel=0',
        title: 'CPU Architecture & Fetch-Decode-Execute Cycle',
        cat: 'ib-a1-1-5',
        note: 'Visual walkthrough of instruction cycle, registers, and ALU.',
        videoDuration: '12 mins',
        visibleToStudents: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });

      const demoRef4 = doc(db, 'links', 'demo-logic-quiz');
      batch.set(demoRef4, {
        type: 'link',
        kind: 'assessment',
        assessmentType: 'quiz',
        url: 'https://forms.google.com',
        title: 'Logic Gates & Boolean Algebra Checkpoint Quiz',
        cat: 'ib-a1-2-3',
        note: 'Formative assessment on truth tables and simplified circuit expressions.',
        dueDate: 'Week 5',
        maxMarks: 20,
        visibleToStudents: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }, { merge: true });

      // Config doc
      const configRef = doc(db, 'config', 'settings');
      batch.set(configRef, {
        shelfTitle: 'Page Shelf',
        shelfDescription: "Every web page and file you've made, in one place. Categorized by topic and accessible to students.",
        teacherPasscodeHash: DEFAULT_PASSCODE,
        showExtraResourcesToStudents: true,
        showAssessmentsToStudents: true,
        showTimelineToStudents: true,
        timelineAppUrl: 'https://cs-timeline-five.vercel.app/',
        timelineAppTitle: 'Timeline App',
        seeded: true,
        updatedAt: Date.now()
      }, { merge: true });

      await batch.commit();
    } catch {
      // If Firestore has quota limit, local storage has everything preserved!
    }
  };

  // Check if effective view is teacher mode
  const effectiveTeacher = isTeacher && !studentPreview;

  // Filtered categories and links based on student visibility
  const visibleCategories = useMemo(() => {
    if (effectiveTeacher) return categories;
    return categories.filter((c) => c.visibleToStudents !== false);
  }, [categories, effectiveTeacher]);

  const visibleLinks = useMemo(() => {
    let list = links;
    if (!effectiveTeacher) {
      list = list.filter((l) => l.visibleToStudents !== false);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.url && l.url.toLowerCase().includes(q)) ||
          (l.note && l.note.toLowerCase().includes(q)) ||
          (l.fileName && l.fileName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [links, effectiveTeacher, searchQuery]);

  // Top-level categories (tabs)
  const topLevelCategories = useMemo(() => {
    const top = visibleCategories.filter((c) => !c.parent);
    top.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
    return top;
  }, [visibleCategories]);

  // Unsorted items count
  const unsortedCount = useMemo(() => {
    return visibleLinks.filter((l) => !l.cat || l.cat === UNSORTED_CAT_ID).length;
  }, [visibleLinks]);

  // Get deep count for a category tab
  const getSubtreeCount = useCallback(
    (catId: string): number => {
      const direct = visibleLinks.filter((l) => l.cat === catId).length;
      const kids = visibleCategories.filter((c) => c.parent === catId);
      return direct + kids.reduce((sum, k) => sum + getSubtreeCount(k.id), 0);
    },
    [visibleLinks, visibleCategories]
  );

  // Tabs list with counters
  const tabsList = useMemo(() => {
    const list = [
      { id: 'all', name: 'All', count: visibleLinks.length },
      ...topLevelCategories.map((c) => ({
        id: c.id,
        name: c.name,
        count: getSubtreeCount(c.id)
      }))
    ];
    if (unsortedCount > 0) {
      list.push({ id: UNSORTED_CAT_ID, name: 'Unsorted', count: unsortedCount });
    }
    return list;
  }, [topLevelCategories, visibleLinks.length, getSubtreeCount, unsortedCount]);

  // Feature section counts
  const extraResourcesCount = useMemo(() => {
    return visibleLinks.filter((item) => {
      if (item.kind === 'video' || (item.kind as string) === 'extra') return true;
      const a = item.url ? analyseUrl(item.url) : null;
      return a?.detectedKind === 'video' || ['mp4', 'webm'].includes(item.ext || '');
    }).length;
  }, [visibleLinks]);

  const assessmentsCount = useMemo(() => {
    return visibleLinks.filter((item) => {
      if (item.kind === 'assessment' || item.assessmentType) return true;
      const lowerTitle = item.title.toLowerCase();
      const lowerUrl = (item.url || '').toLowerCase();
      return (
        lowerTitle.includes('quiz') ||
        lowerTitle.includes('exam') ||
        lowerTitle.includes('test') ||
        lowerTitle.includes('assessment') ||
        lowerUrl.includes('forms.google.com')
      );
    }).length;
  }, [visibleLinks]);

  const showExtraBtn = effectiveTeacher || config.showExtraResourcesToStudents !== false;
  const showAssessmentsBtn = effectiveTeacher || config.showAssessmentsToStudents !== false;
  const showTimelineBtn = effectiveTeacher || config.showTimelineToStudents !== false;
  const hasAnyFeatureBtn = showExtraBtn || showAssessmentsBtn || showTimelineBtn;

  // Teacher Passcode Handlers
  const handleUnlockTeacher = (inputPasscode: string): boolean => {
    const currentPass = config.teacherPasscodeHash || DEFAULT_PASSCODE;
    if (inputPasscode === currentPass) {
      setIsTeacher(true);
      setStudentPreview(false);
      try {
        sessionStorage.removeItem('ps.isStudentSession');
        localStorage.removeItem('ps.isStudentSession');
        sessionStorage.setItem('ps.teacherMode', 'true');
      } catch {}
      window.location.hash = '#teacher';
      showToast('Teacher Portal unlocked.');
      return true;
    }
    return false;
  };

  const handleLockTeacher = () => {
    setIsTeacher(false);
    setStudentPreview(false);
    try {
      sessionStorage.removeItem('ps.teacherMode');
      sessionStorage.setItem('ps.isStudentSession', 'true');
      localStorage.setItem('ps.isStudentSession', 'true');
    } catch {}
    window.location.hash = '';
    showToast('Controls locked. Switched to Student View.');
  };

  const handleChangePasscode = async (newPasscode: string) => {
    try {
      await updateDoc(doc(db, 'config', 'settings'), {
        teacherPasscodeHash: newPasscode,
        updatedAt: Date.now()
      });
      showToast('Teacher passcode updated successfully.');
      try {
        localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify({ ...config, teacherPasscodeHash: newPasscode }));
      } catch {}
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, 'config/settings');
      } catch {
        setQuotaExceeded(true);
        showToast('Updated locally (Firestore quota limit reached).');
      }
    }
  };

  const handleCopyStudentLink = () => {
    const studentUrl = `${window.location.origin}/#student`;
    try {
      navigator.clipboard.writeText(studentUrl);
    } catch {}
    setShareModalOpen(true);
    showToast('Student link copied!');
  };

  const handleUpdateConfig = async (newCfg: Partial<ShelfConfig>) => {
    const merged = { ...config, ...newCfg, updatedAt: Date.now() };
    setConfig(merged);
    try {
      localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(merged));
    } catch {}

    try {
      await setDoc(doc(db, 'config', 'settings'), merged, { merge: true });
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, 'config/settings');
      } catch {
        setQuotaExceeded(true);
      }
    }
  };

  const handleBulkUpdateItemsVisibility = async (visible: boolean) => {
    const nextLinks = links.map((l) => ({ ...l, visibleToStudents: visible, updatedAt: Date.now() }));
    setLinks(nextLinks);
    try {
      const safeLinks = nextLinks.map((l) => (l.fileData && l.fileData.length > 50000 ? { ...l, fileData: '' } : l));
      localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(safeLinks));
    } catch {}

    showToast(visible ? 'All resources are now visible to students.' : 'All resources are now hidden from students.');

    try {
      const batch = writeBatch(db);
      for (const l of nextLinks.slice(0, 100)) {
        batch.update(doc(db, 'links', l.id), { visibleToStudents: visible, updatedAt: Date.now() });
      }
      await batch.commit();
    } catch {}
  };

  // Item Actions
  const handleAddLink = async (item: Partial<ShelfItem>): Promise<boolean> => {
    const newId = 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    
    // Save file blob to high-capacity IndexedDB storage (handles files of any size)
    if (item.fileBlob) {
      await saveFileToIndexedDB(newId, item.fileBlob);
    } else if (item.fileData) {
      await saveFileToIndexedDB(newId, item.fileData);
    }

    // Save attached mark scheme file blob to IndexedDB
    if (item.markSchemeFileBlob) {
      await saveFileToIndexedDB(`${newId}_markscheme`, item.markSchemeFileBlob);
      await saveFileToIndexedDB(`${newId}_ms`, item.markSchemeFileBlob);
    } else if (item.markSchemeFileData) {
      await saveFileToIndexedDB(`${newId}_markscheme`, item.markSchemeFileData);
      await saveFileToIndexedDB(`${newId}_ms`, item.markSchemeFileData);
    }

    const isLarge = (item.size && item.size > 600 * 1024) || !!item.isLargeFile;
    const isMsLarge = (item.markSchemeSize && item.markSchemeSize > 600 * 1024) || !!item.markSchemeIsLargeFile;

    // Construct clean object without undefined values for Firestore
    const newItem: ShelfItem = {
      id: newId,
      type: item.type || 'link',
      title: item.title || 'Untitled',
      url: item.url || '',
      cat: item.cat || '',
      note: item.note || '',
      fileName: item.fileName || '',
      fileData: isLarge ? '' : (item.fileData || ''),
      ext: item.ext || '',
      size: item.size || 0,
      visibleToStudents: item.visibleToStudents ?? true,
      isLargeFile: isLarge,
      hasStoredContent: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    if (item.kind) newItem.kind = item.kind;
    if (item.assessmentType) newItem.assessmentType = item.assessmentType;
    if (item.dueDate) newItem.dueDate = item.dueDate;
    if (item.maxMarks !== undefined) newItem.maxMarks = item.maxMarks;
    if (item.videoDuration) newItem.videoDuration = item.videoDuration;
    if (item.embedUrl) newItem.embedUrl = item.embedUrl;
    if (item.timelineDate) newItem.timelineDate = item.timelineDate;
    if (item.timelinePhase) newItem.timelinePhase = item.timelinePhase;

    // Mark scheme fields
    if (item.markSchemeTitle) newItem.markSchemeTitle = item.markSchemeTitle;
    if (item.markSchemeUrl) newItem.markSchemeUrl = item.markSchemeUrl;
    if (item.markSchemeFileName) newItem.markSchemeFileName = item.markSchemeFileName;
    if (item.markSchemeFileData) newItem.markSchemeFileData = isMsLarge ? '' : item.markSchemeFileData;
    if (item.markSchemeExt) newItem.markSchemeExt = item.markSchemeExt;
    if (item.markSchemeSize !== undefined) newItem.markSchemeSize = item.markSchemeSize;
    if (item.markSchemeVisibleToStudents !== undefined) newItem.markSchemeVisibleToStudents = item.markSchemeVisibleToStudents;
    if (isMsLarge) newItem.markSchemeIsLargeFile = true;

    // Keep fileData in memory for immediate viewing
    const memoryItem = {
      ...newItem,
      fileData: item.fileData || '',
      markSchemeFileData: item.markSchemeFileData || ''
    };

    // Update local cache immediately with safe size
    setLinks((prev) => {
      const next = [memoryItem, ...prev];
      try {
        const safeLinks = next.map((l) => (l.fileData && l.fileData.length > 50000 ? { ...l, fileData: '' } : l));
        localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(safeLinks));
      } catch {}
      return next;
    });

    try {
      await setDoc(doc(db, 'links', newId), newItem);
      showToast(`Added "${newItem.title}" to shelf.`);
      return true;
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'links');
      } catch {
        setQuotaExceeded(true);
        showToast(`Saved locally to shelf (Firestore quota active).`);
      }
      return true;
    }
  };

  const handleUpdateItem = async (updated: Partial<ShelfItem>, itemIdOverride?: string) => {
    const targetId = itemIdOverride || updated.id || editItem?.id;
    if (!targetId) return;

    if (updated.markSchemeFileBlob) {
      await saveFileToIndexedDB(`${targetId}_markscheme`, updated.markSchemeFileBlob);
      await saveFileToIndexedDB(`${targetId}_ms`, updated.markSchemeFileBlob);
    }
    if (updated.fileBlob) {
      await saveFileToIndexedDB(targetId, updated.fileBlob);
    }

    const nextLinks = links.map((l) => (l.id === targetId ? { ...l, ...updated, updatedAt: Date.now() } : l));
    setLinks(nextLinks);
    try {
      const safeLinks = nextLinks.map((l) => (l.fileData && l.fileData.length > 50000 ? { ...l, fileData: '' } : l));
      localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(safeLinks));
    } catch {}

    try {
      const cleanUpdated: Record<string, any> = { updatedAt: Date.now() };
      for (const [k, v] of Object.entries(updated)) {
        if (v !== undefined && k !== 'fileBlob' && k !== 'markSchemeFileBlob') {
          cleanUpdated[k] = v;
        }
      }
      await updateDoc(doc(db, 'links', targetId), cleanUpdated);
      showToast('Resource updated.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `links/${targetId}`);
      } catch {
        setQuotaExceeded(true);
        showToast('Updated in local storage (Firestore quota active).');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    deleteFileFromIndexedDB(itemId);
    deleteFileFromIndexedDB(`${itemId}_markscheme`);
    deleteFileFromIndexedDB(`${itemId}_ms`);
    const nextLinks = links.filter((l) => l.id !== itemId);
    setLinks(nextLinks);
    try {
      const safeLinks = nextLinks.map((l) => (l.fileData && l.fileData.length > 50000 ? { ...l, fileData: '' } : l));
      localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(safeLinks));
    } catch {}

    try {
      await deleteDoc(doc(db, 'links', itemId));
      showToast('Resource removed.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `links/${itemId}`);
      } catch {
        setQuotaExceeded(true);
        showToast('Removed from local shelf.');
      }
    }
  };

  const handleToggleItemVisibility = async (item: ShelfItem) => {
    const nextVisible = item.visibleToStudents === false;
    const nextLinks = links.map((l) => (l.id === item.id ? { ...l, visibleToStudents: nextVisible } : l));
    setLinks(nextLinks);
    try {
      localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(nextLinks));
    } catch {}

    try {
      await updateDoc(doc(db, 'links', item.id), {
        visibleToStudents: nextVisible,
        updatedAt: Date.now()
      });
      showToast(nextVisible ? 'Visible to students' : 'Hidden from students (Teacher only)');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `links/${item.id}`);
      } catch {
        setQuotaExceeded(true);
        showToast(nextVisible ? 'Visible to students (local)' : 'Hidden from students (local)');
      }
    }
  };

  // Category Actions
  const handleSaveCategory = async (catData: Partial<Category>) => {
    if (categoryToEdit) {
      const nextCats = categories.map((c) =>
        c.id === categoryToEdit.id
          ? {
              ...c,
              name: catData.name || c.name,
              parent: catData.parent !== undefined ? catData.parent : c.parent,
              visibleToStudents: catData.visibleToStudents !== undefined ? catData.visibleToStudents : c.visibleToStudents,
              updatedAt: Date.now()
            }
          : c
      );
      setCategories(nextCats);
      try {
        localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(nextCats));
      } catch {}

      try {
        await updateDoc(doc(db, 'categories', categoryToEdit.id), {
          name: catData.name,
          parent: catData.parent ?? categoryToEdit.parent,
          visibleToStudents: catData.visibleToStudents ?? categoryToEdit.visibleToStudents,
          updatedAt: Date.now()
        });
        showToast(`Category "${catData.name}" updated.`);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.UPDATE, 'categories');
        } catch {
          setQuotaExceeded(true);
          showToast(`Category updated locally.`);
        }
      }
    } else {
      const newCatId = 'cat_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const newCat: Category = {
        id: newCatId,
        name: catData.name || 'New Category',
        parent: catData.parent || '',
        order: Date.now(),
        visibleToStudents: catData.visibleToStudents ?? true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const nextCats = [...categories, newCat];
      setCategories(nextCats);
      try {
        localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(nextCats));
      } catch {}

      if (!catData.parent) {
        setActiveTab(newCatId);
      }

      try {
        await setDoc(doc(db, 'categories', newCatId), newCat);
        showToast(`Created category "${catData.name}".`);
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.CREATE, 'categories');
        } catch {
          setQuotaExceeded(true);
          showToast(`Category "${catData.name}" created locally.`);
        }
      }
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    const nextLinks = links.map((l) => (l.cat === catId ? { ...l, cat: '' } : l));
    const nextCats = categories.filter((c) => c.id !== catId);
    setLinks(nextLinks);
    setCategories(nextCats);
    try {
      localStorage.setItem(LOCAL_STORAGE_LINKS, JSON.stringify(nextLinks));
      localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(nextCats));
    } catch {}

    if (activeTab === catId) {
      setActiveTab('all');
    }

    try {
      const batch = writeBatch(db);
      const itemsToMove = links.filter((l) => l.cat === catId);
      for (const item of itemsToMove) {
        batch.update(doc(db, 'links', item.id), { cat: '', updatedAt: Date.now() });
      }
      batch.delete(doc(db, 'categories', catId));
      await batch.commit();
      showToast('Category deleted. Contained items moved to Unsorted.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
      } catch {
        setQuotaExceeded(true);
        showToast('Category removed from local shelf.');
      }
    }
  };

  const handleToggleCategoryVisibility = async (cat: Category) => {
    const nextVisible = cat.visibleToStudents === false;
    const nextCats = categories.map((c) => (c.id === cat.id ? { ...c, visibleToStudents: nextVisible } : c));
    setCategories(nextCats);
    try {
      localStorage.setItem(LOCAL_STORAGE_CATS, JSON.stringify(nextCats));
    } catch {}

    try {
      await updateDoc(doc(db, 'categories', cat.id), {
        visibleToStudents: nextVisible,
        updatedAt: Date.now()
      });
      showToast(nextVisible ? `"${cat.name}" visible to students` : `"${cat.name}" hidden from students`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `categories/${cat.id}`);
      } catch {
        setQuotaExceeded(true);
        showToast(nextVisible ? `"${cat.name}" visible (local)` : `"${cat.name}" hidden (local)`);
      }
    }
  };

  // Drawers to render for active tab
  const activeDrawers = useMemo(() => {
    if (activeTab === 'all') {
      const topLevel = visibleCategories.filter((c) => !c.parent);
      topLevel.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));
      const list = [...topLevel];
      if (unsortedCount > 0) {
        list.push({
          id: UNSORTED_CAT_ID,
          name: 'Unsorted',
          parent: '',
          order: 999999,
          visibleToStudents: true
        });
      }
      return list;
    } else if (activeTab === UNSORTED_CAT_ID) {
      return [
        {
          id: UNSORTED_CAT_ID,
          name: 'Unsorted',
          parent: '',
          order: 999999,
          visibleToStudents: true
        }
      ];
    } else {
      const found = visibleCategories.find((c) => c.id === activeTab);
      return found ? [found] : [];
    }
  }, [activeTab, visibleCategories, unsortedCount]);

  const totalLinkCount = visibleLinks.filter((l) => l.type === 'link').length;
  const totalFileCount = visibleLinks.filter((l) => l.type === 'file').length;

  // Dedicated Full-Window Standalone File Viewer (#view=itemId)
  const standaloneItem = useMemo(() => {
    if (!standaloneViewerItemId) return null;
    const direct = links.find((l) => l.id === standaloneViewerItemId);
    if (direct) return direct;
    if (standaloneViewerItemId.endsWith('_ms')) {
      const parentId = standaloneViewerItemId.replace(/_ms$/, '');
      const parent = links.find((l) => l.id === parentId);
      if (parent) {
        return createMarkSchemeShelfItem(parent);
      }
    }
    return null;
  }, [standaloneViewerItemId, links]);

  if (standaloneViewerItemId && standaloneItem) {
    return (
      <StandaloneViewer
        item={standaloneItem}
        onBackToShelf={() => {
          setStandaloneViewerItemId(null);
          window.location.hash = '';
        }}
        onToast={showToast}
      />
    );
  }

  if (standaloneViewerItemId && !standaloneItem) {
    return (
      <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[var(--bg)] text-[var(--ink)] p-4 text-center">
        {loading ? (
          <div className="text-sm font-medium animate-pulse">Loading file view…</div>
        ) : (
          <div className="space-y-3 max-w-sm">
            <h2 className="text-lg font-bold">File not found</h2>
            <p className="text-xs text-[var(--muted)]">The requested resource could not be found or has been moved.</p>
            <button
              type="button"
              className="btn primary sm"
              onClick={() => {
                setStandaloneViewerItemId(null);
                window.location.hash = '';
              }}
            >
              Return to Course Shelf
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* Top Header */}
      <header className="top">
        <div>
          <h1 className="title-main">
            Page <span>Shelf</span>
          </h1>
          <p className="sub">
            {effectiveTeacher
              ? 'Teacher Portal: Add GitHub web apps, worksheets, or lesson files, organize into tabs & dropdowns, and control what students can see.'
              : 'Course Web Apps & Resources: Browse interactive pages, simulations, and course materials organized by topic.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs text-[var(--muted)]" aria-live="polite">
            {totalLinkCount} link{totalLinkCount === 1 ? '' : 's'} · {totalFileCount} file{totalFileCount === 1 ? '' : 's'} · {visibleCategories.length} categories
          </span>

          <ThemeToggle />

          {/* Teacher Mode Button in Header (shown only when teacher is logged in) */}
          {isTeacher && (
            <button
              type="button"
              className="btn sm danger"
              onClick={handleLockTeacher}
              title="Lock Teacher Controls"
            >
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              Lock
            </button>
          )}
        </div>
      </header>

      {/* Quota Exceeded Notification Banner */}
      {quotaExceeded && (
        <div className="banner bg-amber-500/10 border border-amber-500/30 text-[var(--ink)] p-3 rounded-xl flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2.5 max-w-[85ch]">
            <span className="text-base mt-0.5">⚠️</span>
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Firestore Free Tier Daily Read Quota Reached:</span> Your page shelf is operating seamlessly in <strong>Local Storage Cache Mode</strong> so you and your students can still browse, organize, preview, and add resources without interruption. The free daily read quota resets automatically tomorrow, or you can manage limits in the{' '}
              <a
                href="https://console.firebase.google.com/project/zinc-terminal-xr5vm/firestore/databases/ai-studio-740d0d3d-69de-4919-8aef-5b45f4d04856/data?openUpgradeDialog=true"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
              >
                Firebase Console →
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn sm"
              onClick={() => {
                sessionStorage.removeItem('ps.quotaExceeded');
                setQuotaExceeded(false);
                setRetryKey((k) => k + 1);
                showToast('Testing Firebase connection…');
              }}
              title="Test connection to Firebase"
            >
              Retry Live Sync
            </button>
            <button
              type="button"
              className="btn sm"
              onClick={() => setQuotaExceeded(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Teacher Management Toolbar */}
      <TeacherBar
        isTeacher={isTeacher}
        studentPreview={studentPreview}
        onToggleStudentPreview={() => setStudentPreview(!studentPreview)}
        onOpenVisibilityManager={() => setVisibilityManagerModalOpen(true)}
        onOpenChangePasscode={() => {
          setIsChangingPasscode(true);
          setPasscodeModalOpen(true);
        }}
        onLockTeacher={handleLockTeacher}
        onCopyStudentLink={handleCopyStudentLink}
        onReseedCurriculum={seedInitialCurriculum}
      />

      {/* Student View Banner if not teacher */}
      {!isTeacher && (
        <div className="banner student-notice">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-semibold text-xs md:text-sm">
              Student View · Interactive Computer Science Web Pages & Files
            </span>
          </div>
          <button
            type="button"
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1 font-medium underline underline-offset-2"
            onClick={handleCopyStudentLink}
          >
            <Share2 className="w-3 h-3" /> Copy Link
          </button>
        </div>
      )}

      {/* Add Resource Bar - TEACHER ONLY */}
      {effectiveTeacher && (
        <AddResourceForm
          categories={categories}
          activeCategory={activeTab}
          onAddLink={handleAddLink}
          onOpenNewCategory={(parent) => {
            setCategoryToEdit(null);
            setCategoryModalParent(parent || '');
            setCategoryModalOpen(true);
          }}
          isTeacher={true}
          onToast={showToast}
        />
      )}

      {/* Quick Feature Buttons: Extra Resources, Assessments, Timeline App */}
      {hasAnyFeatureBtn && (
        <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex-wrap shadow-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Extra Resources Button */}
            {showExtraBtn && (
              <button
                type="button"
                className="btn sm flex items-center gap-2 bg-[var(--surface2)] hover:border-emerald-500/50"
                onClick={() => setExtraResourcesModalOpen(true)}
                title="Open Extra Resources & Videos"
              >
                <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-xs sm:text-sm">Extra Resources</span>
                <span className="n bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono text-xs">
                  {extraResourcesCount}
                </span>
                {effectiveTeacher && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                      config.showExtraResourcesToStudents !== false
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {config.showExtraResourcesToStudents !== false ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Visible
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Hidden
                      </>
                    )}
                  </span>
                )}
              </button>
            )}

            {/* Assessments Button */}
            {showAssessmentsBtn && (
              <button
                type="button"
                className="btn sm flex items-center gap-2 bg-[var(--surface2)] hover:border-blue-500/50"
                onClick={() => setAssessmentsModalOpen(true)}
                title="Open Assessments & Quizzes"
              >
                <FileCheck2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-xs sm:text-sm">Assessments</span>
                <span className="n bg-blue-500/10 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono text-xs">
                  {assessmentsCount}
                </span>
                {effectiveTeacher && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                      config.showAssessmentsToStudents !== false
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {config.showAssessmentsToStudents !== false ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Visible
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Hidden
                      </>
                    )}
                  </span>
                )}
              </button>
            )}

            {/* Timeline App Button */}
            {showTimelineBtn && (
              <button
                type="button"
                className="btn sm flex items-center gap-2 bg-[var(--surface2)] hover:border-amber-500/50"
                onClick={() => setTimelineModalOpen(true)}
                title="Open Timeline App & Milestones"
              >
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-xs sm:text-sm">{config.timelineAppTitle || 'Timeline App'}</span>
                {effectiveTeacher && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 ${
                      config.showTimelineToStudents !== false
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {config.showTimelineToStudents !== false ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Visible
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Hidden
                      </>
                    )}
                  </span>
                )}
              </button>
            )}
          </div>

          {effectiveTeacher && (
            <button
              type="button"
              className="btn sm ghost text-xs text-[var(--muted)] hover:text-[var(--ink)]"
              onClick={() => setVisibilityManagerModalOpen(true)}
              title="Open Student Access & Visibility Controls"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Student Access Settings
            </button>
          )}
        </div>
      )}

      {/* Tab Navigation & Search Bar */}
      <div className="bar">
        <div className="tabs" role="tablist" aria-label="Course categories">
          {tabsList.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="tab"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
              <span className="n">{tab.count}</span>
            </button>
          ))}

          {/* New Tab Button - TEACHER ONLY */}
          {effectiveTeacher && (
            <button
              type="button"
              className="tab addtab"
              onClick={() => {
                setCategoryToEdit(null);
                setCategoryModalParent('');
                setCategoryModalOpen(true);
              }}
              title="Create a new top-level tab or syllabus category"
            >
              <Plus className="w-3.5 h-3.5" /> New Tab
            </button>
          )}
        </div>

        <div className="relative search">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            className="inp pl-8 text-sm"
            type="search"
            placeholder="Search links and files…"
            aria-label="Search links and files"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Shelves / Nested Drawers */}
      <main className="shelf" id="shelf">
        {loading ? (
          <div className="emptystate">
            <h2>Loading your shelf from Firebase…</h2>
            <p>Retrieving your categories, web pages, and files.</p>
          </div>
        ) : activeDrawers.length === 0 ? (
          <div className="emptystate">
            <BookOpen className="w-10 h-10 text-[var(--muted)] stroke-[1.5]" />
            <h2>No items found</h2>
            <p>
              {searchQuery
                ? `No resources match your search "${searchQuery}".`
                : effectiveTeacher
                ? 'Your shelf is empty. Use the box above to paste your first GitHub link or create a new tab.'
                : 'No course materials have been published yet in this section.'}
            </p>
          </div>
        ) : (
          activeDrawers.map((cat) => (
            <DrawerItem
              key={cat.id}
              category={cat}
              depth={0}
              allCategories={visibleCategories}
              items={visibleLinks}
              isTeacher={effectiveTeacher}
              searchQuery={searchQuery}
              onPreview={(item) => setPreviewItem(item)}
              onEditCategory={(c) => {
                setCategoryToEdit(c);
                setCategoryModalOpen(true);
              }}
              onDeleteCategory={handleDeleteCategory}
              onToggleCategoryVisibility={handleToggleCategoryVisibility}
              onEditItem={(item) => setEditItem(item)}
              onDeleteItem={handleDeleteItem}
              onToggleItemVisibility={handleToggleItemVisibility}
              onAddLinkHere={(catId) => {
                setActiveTab(catId);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(`Selected category for new item.`);
              }}
              onAddSubcategory={(parentId) => {
                setCategoryToEdit(null);
                setCategoryModalParent(parentId);
                setCategoryModalOpen(true);
              }}
              onToast={showToast}
            />
          ))
        )}
      </main>

      {/* Interactive In-Shelf / Full Preview Modal */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          onToast={showToast}
        />
      )}

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        item={editItem}
        categories={categories}
        onSave={handleUpdateItem}
      />

      {/* Category Creation / Rename Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSubmit={handleSaveCategory}
        categories={categories}
        initialParent={categoryModalParent}
        categoryToEdit={categoryToEdit}
      />

      {/* Passcode Unlock / Change Modal */}
      <PasscodeModal
        isOpen={passcodeModalOpen}
        onClose={() => setPasscodeModalOpen(false)}
        onUnlock={handleUnlockTeacher}
        currentPasscode={config.teacherPasscodeHash || DEFAULT_PASSCODE}
        isChangingPasscode={isChangingPasscode}
        onChangePasscode={handleChangePasscode}
      />

      {/* Extra Resources & Videos Modal */}
      <ExtraResourcesModal
        isOpen={extraResourcesModalOpen}
        onClose={() => setExtraResourcesModalOpen(false)}
        items={links}
        categories={categories}
        isTeacher={effectiveTeacher}
        config={config}
        onAddResource={handleAddLink}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onToggleItemVisibility={handleToggleItemVisibility}
        onUpdateConfig={handleUpdateConfig}
        onEditItemModal={(item) => {
          setEditItem(item);
          setExtraResourcesModalOpen(false);
        }}
        onPreviewItem={(item) => {
          setPreviewItem(item);
          setExtraResourcesModalOpen(false);
        }}
        onToast={showToast}
      />

      {/* Assessments & Quizzes Modal */}
      <AssessmentsModal
        isOpen={assessmentsModalOpen}
        onClose={() => setAssessmentsModalOpen(false)}
        items={links}
        categories={categories}
        isTeacher={effectiveTeacher}
        config={config}
        onAddAssessment={handleAddLink}
        onUpdateItem={handleUpdateItem}
        onDeleteItem={handleDeleteItem}
        onToggleItemVisibility={handleToggleItemVisibility}
        onUpdateConfig={handleUpdateConfig}
        onEditItemModal={(item) => {
          setEditItem(item);
          setAssessmentsModalOpen(false);
        }}
        onPreviewItem={(item) => {
          setPreviewItem(item);
          setAssessmentsModalOpen(false);
        }}
        onToast={showToast}
      />

      {/* Timeline App & Roadmap Modal */}
      <TimelineModal
        isOpen={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        categories={categories}
        isTeacher={effectiveTeacher}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onToast={showToast}
      />

      {/* Student Visibility & Access Controls Modal */}
      <VisibilityManagerModal
        isOpen={visibilityManagerModalOpen}
        onClose={() => setVisibilityManagerModalOpen(false)}
        config={config}
        categories={categories}
        items={links}
        onUpdateConfig={handleUpdateConfig}
        onToggleCategoryVisibility={handleToggleCategoryVisibility}
        onBulkUpdateItemsVisibility={handleBulkUpdateItemsVisibility}
        onToast={showToast}
      />

      {/* Standalone Student URL & Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onToast={showToast}
      />

      {/* Student/Course Footer */}
      <footer className="mt-12 py-6 border-t border-[var(--line)] text-xs text-[var(--muted)] flex items-center justify-between flex-wrap gap-3">
        <div>
          Computer Science Course Shelf · Interactive Web Pages & Learning Files
        </div>
        <div className="flex items-center gap-3">
          {!isTeacher && (
            <button
              type="button"
              className="text-[var(--muted)] hover:text-[var(--ink)] flex items-center gap-1.5 font-mono text-[11px] px-2 py-1 rounded hover:bg-[var(--surface2)]"
              onClick={() => {
                setIsChangingPasscode(false);
                setPasscodeModalOpen(true);
              }}
              title="Teacher Portal Access (Passcode required)"
            >
              <Lock className="w-3 h-3 text-[var(--muted)]" /> Teacher Portal
            </button>
          )}
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && <div className="toast-msg">{toastMessage}</div>}
    </div>
  );
}
