export type Locale = 'mn' | 'en';

export const defaultLocale: Locale = 'mn';
export const locales: Locale[] = ['mn', 'en'];

const translations: Record<Locale, Record<string, string>> = {
  mn: {
    // Common
    'common.loading': 'Ачаалж байна...',
    'common.error': 'Алдаа гарлаа',
    'common.success': 'Амжилттай',
    'common.cancel': 'Цуцлах',
    'common.save': 'Хадгалах',
    'common.delete': 'Устгах',
    'common.edit': 'Засах',
    'common.view': 'Харах',
    'common.close': 'Хаах',
    'common.back': 'Буцах',
    'common.next': 'Дараах',
    'common.previous': 'Өмнөх',
    'common.changeLanguage': 'Хэл солих',
    'common.search': 'Хайх...',
    
    // Dashboard
    'dashboard.title': 'Нүүр хуудас',
    'dashboard.greeting': 'Өдрийн мэнд! 👋',
    'dashboard.description': 'Өнөөдрийн байдлаар системийн ерөнхий үзүүлэлтүүд ийм байна.',
    'dashboard.totalJobs': 'Нийт ажил',
    'dashboard.doneJobs': 'Дууссан',
    'dashboard.inProgressJobs': 'Хийгдэж буй',
    'dashboard.sentJobs': 'Илгээсэн',
    
    // Checklist
    'checklist.department.title': 'Хэлтсийн хяналт',
    'checklist.department.description': 'Таны хариуцсан хэлтсийн ажлын явц',
    'checklist.department.jobs': 'ажил',
    'checklist.department.configChart': 'Тохиргоогоор график',
    'checklist.department.configChartDesc': 'Тохиргоо бүрийн бүх ажлуудын нэгтгэсэн график',
    'checklist.department.viewChart': 'График харах',
    'checklist.detail.title': 'Ажлын дэлгэрэнгүй',
    'checklist.detail.branch': 'Салбар нэгж',
    'checklist.detail.config': 'Тохиргоо',
    'checklist.detail.responsible': 'Хариуцсан баг',
    'checklist.detail.summary': 'Тайлбар',
    'checklist.detail.noSummary': 'Тайлбар бичигдээгүй байна',
    'checklist.detail.understood': 'Ойлголоо',
    'checklist.detail.loading': 'Мэдээлэл татаж байна...',
    'checklist.detail.notFound': 'Мэдээлэл олдсонгүй',
    'checklist.detail.id': 'ID',
    'checklist.detail.jobsCount': '{count} ажил',
    'checklist.list.title': 'Миний ажлууд',
    'checklist.list.description': 'Танд хуваарилагдсан шалгах хуудаснууд',
    'checklist.list.empty': 'Одоогоор танд хуваарилагдсан ажил алга байна.',
    'checklist.list.received': 'Хүлээн авсан',
    'checklist.list.inprogress': 'Хийгдэж байгаа',
    'checklist.list.done': 'Гүйцэтгэсэн',
    'checklist.table.title': 'Шалгах хуудас',
    'checklist.table.description': 'Мэдээллийг үнэн зөв бөглөнө үү',
    'checklist.table.save': 'Хадгалах',
    'checklist.table.submit': 'Дуусгах',
    'checklist.table.select': 'Сонгох...',
    'checklist.table.date': 'Огноо',
    'checklist.table.image': 'Зураг оруулах',
    'checklist.table.write': 'Бичих...',
    'checklist.table.preview': 'Preview',
    'checklist.department.fetchError': 'Мэдээлэл татахад алдаа гарлаа.',
    'checklist.department.loading': 'Ажлуудыг ачаалж байна...',
    'checklist.chart.loadError': 'Ачаалалт амжилтгүй',
    'checklist.chart.missingParams': 'jobId эсвэл configId заавал байх ёстой',
    'checklist.chart.networkError': 'Сүлжээний алдаа',
    'checklist.chart.booleanMetric': 'Boolean метрик: <strong>value</strong> = тухайн өдөр true мөрийн тоо, <strong>total</strong> = нийт мөр.',
    
    // Chart
    'chart.from': 'Эхлэх',
    'chart.to': 'Дуусах',
    'chart.metric': 'Метрик',
    'chart.type': 'График',
    'chart.type.auto': 'Авто',
    'chart.type.bar': 'Бар',
    'chart.type.line': 'Шугам',
    'chart.type.stacked': 'Давхарга',
    'chart.load': 'Ачаалах',
    'chart.loading': 'Ачаалж байна...',
    'chart.noData': 'Ачаалах товч дарж өгөгдөл татана уу.',
    'chart.parseError': 'json_data задлахад алдаа гарлаа.',
    'chart.noDataInRange': 'Сонгосон хугацаанд өгөгдөл олдсонгүй.',
    'chart.config.title': 'Тохиргооны график',
    'chart.config.description': 'Тохиргоо #{id} — бүх ажлуудын нэгтгэсэн график',
    'chart.config.invalidId': 'Тохиргооны ID буруу байна.',
    
    // Auth
    'auth.login': 'Нэвтрэх',
    'auth.logout': 'Гарах',
    'auth.notLoggedIn': 'Нэвтрээгүй байна. График харахын тулд эхлээд нэвтрэнэ үү.',
    
    // Table
    'table.date': 'Огноо',
    'table.branch': 'Салбар',
    'table.type': 'Төрөл',
    'table.state': 'Төлөв',
    'table.action': 'Үйлдэл',
    'table.summary': 'Тайлбар',
    'table.pagination.showing': '{start}-{end} / {total}',
    
    // States
    'state.draft': 'Ноорог',
    'state.sent': 'Илгээсэн',
    'state.received': 'Хүлээж авсан',
    'state.inprogress': 'Хийгдэж буй',
    'state.done': 'Дууссан',
    
    // Sidebar
    'sidebar.dashboard': 'Хяналтын самбар',
    'sidebar.checklist': 'Checklist',
    'sidebar.system': 'Систем:',
    'sidebar.version': 'Хувилбар 1.0.1 (Beta)',
    
    // Notification
    'notification.title': 'Мэдэгдэл',
    'notification.new': 'Шинэ',
    'notification.empty': 'Танд одоогоор шинэ мэдэгдэл байхгүй байна.',
    'notification.viewAll': 'Миний ажлууд / Бүгдийг харах',
    
    // Attendance
    'attendance.title': 'Ирц',
    'attendance.working': 'Ажиллаж байна',
    'attendance.notWorking': 'Ажиллаагүй',
    'attendance.started': 'Эхэлсэн',
    'attendance.notRegistered': 'Бүртгэлгүй байна',
    'attendance.last': 'Сүүлчийн',
    'attendance.checkIn': 'Check in',
    'attendance.checkOut': 'Check out',
    'attendance.checkInSuccess': 'Ажилд орлоо',
    'attendance.checkOutSuccess': 'Ажлаас гарлаа',
    
    // User Nav
    'user.profile': 'Профайл',
    'user.settings': 'Тохиргоо',
    'user.logout': 'Гарах',
    'user.name': 'Хэрэглэгч',
    'user.logoutSuccess': 'Системээс амжилттай гарлаа',
  },
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.changeLanguage': 'Change Language',
    'common.search': 'Search...',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.greeting': 'Good morning! 👋',
    'dashboard.description': 'Here are the general indicators of the system as of today.',
    'dashboard.totalJobs': 'Total Jobs',
    'dashboard.doneJobs': 'Done',
    'dashboard.inProgressJobs': 'In Progress',
    'dashboard.sentJobs': 'Sent',
    
    // Checklist
    'checklist.department.title': 'Department Control',
    'checklist.department.description': 'Work progress of your responsible department',
    'checklist.department.jobs': 'jobs',
    'checklist.department.configChart': 'Chart by Configuration',
    'checklist.department.configChartDesc': 'Combined chart of all jobs for each configuration',
    'checklist.department.viewChart': 'View Chart',
    'checklist.detail.title': 'Job Details',
    'checklist.detail.branch': 'Branch/Unit',
    'checklist.detail.config': 'Configuration',
    'checklist.detail.responsible': 'Responsible Team',
    'checklist.detail.summary': 'Summary',
    'checklist.detail.noSummary': 'No summary written',
    'checklist.detail.understood': 'Understood',
    'checklist.detail.loading': 'Loading information...',
    'checklist.detail.notFound': 'Information not found',
    'checklist.detail.id': 'ID',
    'checklist.detail.jobsCount': '{count} jobs',
    'checklist.list.title': 'My Jobs',
    'checklist.list.description': 'Checklists assigned to you',
    'checklist.list.empty': 'No jobs assigned to you yet.',
    'checklist.list.received': 'Received',
    'checklist.list.inprogress': 'In Progress',
    'checklist.list.done': 'Completed',
    'checklist.table.title': 'Checklist',
    'checklist.table.description': 'Please fill in the information accurately',
    'checklist.table.save': 'Save',
    'checklist.table.submit': 'Submit',
    'checklist.table.select': 'Select...',
    'checklist.table.date': 'Date',
    'checklist.table.image': 'Upload Image',
    'checklist.table.write': 'Write...',
    'checklist.table.preview': 'Preview',
    'checklist.department.fetchError': 'Failed to fetch data.',
    'checklist.department.loading': 'Loading jobs...',
    'checklist.chart.loadError': 'Failed to load',
    'checklist.chart.missingParams': 'jobId or configId is required',
    'checklist.chart.networkError': 'Network error',
    'checklist.chart.booleanMetric': 'Boolean metric: <strong>value</strong> = number of true rows for that day, <strong>total</strong> = total rows.',
    
    // Chart
    'chart.from': 'From',
    'chart.to': 'To',
    'chart.metric': 'Metric',
    'chart.type': 'Chart',
    'chart.type.auto': 'Auto',
    'chart.type.bar': 'Bar',
    'chart.type.line': 'Line',
    'chart.type.stacked': 'Stacked',
    'chart.load': 'Load',
    'chart.loading': 'Loading...',
    'chart.noData': 'Click Load button to fetch data.',
    'chart.parseError': 'Failed to parse json_data.',
    'chart.noDataInRange': 'No data found in selected date range.',
    'chart.config.title': 'Configuration Chart',
    'chart.config.description': 'Configuration #{id} — Combined chart of all jobs',
    'chart.config.invalidId': 'Invalid configuration ID.',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.notLoggedIn': 'Not logged in. Please login first to view charts.',
    
    // Table
    'table.date': 'Date',
    'table.branch': 'Branch',
    'table.type': 'Type',
    'table.state': 'State',
    'table.action': 'Action',
    'table.summary': 'Summary',
    'table.pagination.showing': '{start}-{end} / {total}',
    
    // States
    'state.draft': 'Draft',
    'state.sent': 'Sent',
    'state.received': 'Received',
    'state.inprogress': 'In Progress',
    'state.done': 'Done',
    
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.checklist': 'Checklist',
    'sidebar.system': 'System:',
    'sidebar.version': 'Version 1.0.1 (Beta)',
    
    // Notification
    'notification.title': 'Notifications',
    'notification.new': 'New',
    'notification.empty': 'You have no new notifications at the moment.',
    'notification.viewAll': 'My Jobs / View All',
    
    // Attendance
    'attendance.title': 'Attendance',
    'attendance.working': 'Working',
    'attendance.notWorking': 'Not Working',
    'attendance.started': 'Started',
    'attendance.notRegistered': 'Not Registered',
    'attendance.last': 'Last',
    'attendance.checkIn': 'Check in',
    'attendance.checkOut': 'Check out',
    'attendance.checkInSuccess': 'Checked in',
    'attendance.checkOutSuccess': 'Checked out',
    
    // User Nav
    'user.profile': 'Profile',
    'user.settings': 'Settings',
    'user.logout': 'Logout',
    'user.name': 'User',
    'user.logoutSuccess': 'Successfully logged out',
  },
};

export function getTranslations(locale: Locale): Record<string, string> {
  return translations[locale] || translations[defaultLocale];
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const translations = getTranslations(locale);
  let text = translations[key] || key;
  
  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    });
  }
  
  return text;
}
