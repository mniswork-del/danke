import { FileCategory } from '../types';

export function getFileCategory(fileUrl?: string, fileName?: string, explicitType?: FileCategory): FileCategory {
  if (explicitType) return explicitType;

  const name = (fileName || fileUrl || '').toLowerCase();

  // Check data URL MIME type & extensions
  if (name.startsWith('data:image/') || /\.(jpg|jpeg|png|gif|webp|svg|bmp|heic)$/i.test(name)) {
    return 'image';
  }
  if (
    name.includes('presentation') ||
    name.startsWith('data:application/vnd.ms-powerpoint') ||
    name.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml') ||
    /\.(ppt|pptx|pps|ppsx|key)$/i.test(name)
  ) {
    return 'ppt';
  }
  if (
    name.includes('word') ||
    name.startsWith('data:application/msword') ||
    name.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml') ||
    /\.(doc|docx)$/i.test(name)
  ) {
    return 'doc';
  }
  if (
    name.startsWith('data:text/') ||
    /\.(txt|md|rtf|csv|json|js|ts|py|java|cpp|c|sh|sql)$/i.test(name)
  ) {
    return 'text';
  }
  if (name.startsWith('data:application/pdf') || /\.pdf$/i.test(name)) {
    return 'pdf';
  }

  return 'pdf'; // Default fallback for papers & ebooks
}

export function getFileTypeBadgeLabel(category: FileCategory): string {
  switch (category) {
    case 'pdf':
      return 'PDF Paper';
    case 'image':
      return 'Photo / Scan';
    case 'ppt':
      return 'PowerPoint (PPT)';
    case 'doc':
      return 'Word Document';
    case 'text':
      return 'Text / Notes';
    default:
      return 'Study Material';
  }
}
