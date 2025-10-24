// FIX: Removed circular dependency by deleting the import of 'Page' from the same file.
export type Page =
  | 'dashboard'
  | 'registration'
  | 'stock'
  | 'request'
  | 'handover'
  | 'dismantle'
  | 'customers'
  | 'pengaturan-pengguna'
  | 'kategori'
  | 'repair';

export type PreviewData = {
    type: 'asset' | 'customer' | 'user' | 'request' | 'handover' | 'dismantle' | 'customerAssets' | 'stockItemAssets' | 'stockHistory';
    id: string | number;
};

export interface ParsedScanResult {
    id?: string;
    // FIX: Add name property to support displaying asset names from QR codes.
    name?: string;
    serialNumber?: string;
    macAddress?: string;
    raw: string;
}

export enum CustomerStatus {
  ACTIVE = 'Aktif',
  INACTIVE = 'Tidak Aktif',
  SUSPENDED = 'Suspend',
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: CustomerStatus;
  installationDate: string;
  servicePackage: string;
  activityLog: ActivityLogEntry[];
}

export enum ItemStatus {
  PENDING = 'Menunggu Persetujuan',
  LOGISTIC_APPROVED = 'Disetujui Logistik',
  APPROVED = 'Disetujui',
  PURCHASING = 'Proses Pengadaan',
  IN_DELIVERY = 'Dalam Pengiriman',
  ARRIVED = 'Telah Tiba',
  REJECTED = 'Ditolak',
  CANCELLED = 'Dibatalkan',
  COMPLETED = 'Selesai',
  IN_PROGRESS = 'Dalam Proses',
  AWAITING_HANDOVER = 'Menunggu Diserahkan',
}

export enum AssetStatus {
  IN_USE = 'Digunakan',
  IN_STORAGE = 'Disimpan',
  UNDER_REPAIR = 'Dalam Perbaikan',
  OUT_FOR_REPAIR = 'Perbaikan Eksternal',
  DAMAGED = 'Rusak',
  DECOMMISSIONED = 'Diberhentikan',
}

export enum AssetCondition {
  BRAND_NEW = 'Baru (Segel)',
  GOOD = 'Baik',
  USED_OKAY = 'Bekas Layak Pakai',
  MINOR_DAMAGE = 'Rusak Ringan (Perlu Perbaikan)',
  MAJOR_DAMAGE = 'Rusak Berat',
  FOR_PARTS = 'Untuk Kanibalisasi',
}

export interface Attachment {
  id: number;
  name: string;
  url: string; // In a real app, this would be a URL to the file
  type: 'image' | 'pdf' | 'other';
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  referenceId?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  serialNumber: string | null;
  macAddress: string | null;
  registrationDate: string;
  recordedBy: string;
  purchaseDate: string;
  purchasePrice: number | null;
  vendor: string | null;
  poNumber: string | null;
  invoiceNumber: string | null;
  warrantyEndDate: string | null;
  location: string | null;
  locationDetail: string | null;
  currentUser: string | null; // Can be staff name or Customer ID
  woRoIntNumber: string;
  status: AssetStatus;
  condition: AssetCondition;
  notes: string | null;
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  isDismantled?: boolean;
  dismantleInfo?: {
    customerId: string;
    customerName: string;
    dismantleDate: string;
    dismantleId: string;
  };
  lastModifiedDate: string | null;
  lastModifiedBy: string | null;
}

export interface RequestItem {
  id: number; // Unique ID for client-side rendering
  itemName: string;
  itemTypeBrand: string;
  stock: number;
  quantity: number;
  keterangan: string;
}

export type OrderType = 'Regular Stock' | 'Urgent' | 'Project Based';

export interface OrderDetails {
    type: OrderType;
    justification?: string;
    project?: string;
    source?: 'STOCK' | 'PROCUREMENT';
}

export interface Request {
  id: string;
  requester: string;
  division: string;
  requestDate: string;
  status: ItemStatus;
  order: OrderDetails;
  items: RequestItem[];
  logisticApprover: string | null;
  logisticApprovalDate: string | null;
  finalApprover: string | null;
  finalApprovalDate: string | null;
  rejectionReason: string | null;
  rejectedBy: string | null;
  rejectionDate: string | null;
  rejectedByDivision: string | null;
  isRegistered?: boolean;
  estimatedDeliveryDate?: string | null;
  arrivalDate?: string | null;
  receivedBy?: string | null;
  partiallyRegisteredItems?: Record<number, number>; // { [requestItemId]: count }
  totalValue?: number;
  isPrioritizedByCEO?: boolean;
  ceoDispositionDate?: string | null;
  progressUpdateRequest?: {
    requestedBy: string;
    requestDate: string;
    isAcknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedDate?: string;
    feedbackSent?: boolean;
  };
  ceoDispositionFeedbackSent?: boolean;
  lastFollowUpAt?: string;
  ceoFollowUpSent?: boolean;
}

export interface HandoverItem {
    id: number;
    itemName: string;
    itemTypeBrand: string;
    conditionNotes: string;
    quantity: number;
    checked: boolean;
    assetId?: string; // Tying back to a specific asset
}

export interface Handover {
    id: string;
    handoverDate: string;
    menyerahkan: string;
    penerima: string; // Can be staff or customer name
    mengetahui: string;
    woRoIntNumber: string;
    items: HandoverItem[];
    status: ItemStatus;
}


export interface Dismantle {
    id: string;
    assetId: string;
    assetName: string; 
    dismantleDate: string;
    technician: string;
    customerName: string;
    customerId: string;
    customerAddress: string;
    retrievedCondition: AssetCondition;
    notes: string | null;
    acknowledger: string | null;
    status: ItemStatus;
    attachments: Attachment[];
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

export type NotificationType =
  | 'REQUEST_CREATED'
  | 'REQUEST_AWAITING_FINAL_APPROVAL'
  | 'REQUEST_FULLY_APPROVED'
  | 'REQUEST_COMPLETED'
  | 'FOLLOW_UP'
  | 'CEO_DISPOSITION'
  | 'PROGRESS_UPDATE_REQUEST'
  | 'PROGRESS_FEEDBACK'
  | 'STATUS_CHANGE'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'ASSET_DAMAGED_REPORT'
  | 'REPAIR_STARTED'
  | 'REPAIR_COMPLETED'
  | 'ASSET_DECOMMISSIONED'
  | 'REPAIR_PROGRESS_UPDATE';

export interface Notification {
  id: string;
  recipientId: number;
  actorName: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string; // ISO string
  referenceId: string; // e.g., REQ-001
  message?: string; // Optional custom message for complex notifications
}

export type UserRole = 'Super Admin' | 'Procurement Admin' | 'Inventory Admin' | 'Manager' | 'Staff';

export interface User {
  id: number;
  name: string;
  email: string;
  divisionId: number | null;
  role: UserRole;
}

export interface Division {
  id: number;
  name: string;
}

export interface StandardItem {
  id: number;
  name: string;
  brand: string;
}

export type TrackingMethod = 'individual' | 'bulk';

export interface AssetType {
  id: number;
  name: string;
  trackingMethod?: TrackingMethod;
  unitOfMeasure?: string;
  baseUnitOfMeasure?: string;
  quantityPerUnit?: number;
  standardItems?: StandardItem[];
}

export interface AssetCategory {
  id: number;
  name: string;
  types: AssetType[];
  associatedDivisions: number[]; // Array of Division IDs
  isCustomerInstallable?: boolean;
}
