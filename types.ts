// FIX: Removed circular import and defined the Page type.
export type Page =
  | 'dashboard'
  | 'registration'
  | 'request'
  | 'handover'
  | 'dismantle'
  | 'akun'
  | 'divisi'
  | 'customers'
  | 'stock'
  | 'kategori';

// FIX: Added PreviewData type to be shared across components.
export type PreviewData = {
    type: 'asset' | 'customer' | 'user' | 'request' | 'handover' | 'dismantle' | 'customerAssets' | 'stockItemAssets';
    id: string | number;
};

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
  REJECTED = 'Ditolak',
  COMPLETED = 'Selesai',
  IN_PROGRESS = 'Dalam Proses',
}

export enum AssetStatus {
  IN_USE = 'Digunakan',
  IN_STORAGE = 'Disimpan',
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
  serialNumber: string;
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

export interface Request {
  id: string;
  requester: string;
  division: string;
  requestDate: string;
  status: ItemStatus;
  order: string;
  lembar: '1. Logistic' | '2. Divisi' | '3. Purchase';
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
    lembar: '1. Menyerahkan' | '2. Penerima';
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
    acknowledger: string | null;
    status: ItemStatus;
}

export interface ActivityLog {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  message: string;
  isRead: boolean;
}

export type UserRole = 'Admin' | 'Staff' | 'Super Admin';

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

export interface AssetType {
  id: number;
  name: string;
}

export interface AssetCategory {
  id: number;
  name: string;
  types: AssetType[];
  associatedDivisions: number[]; // Array of Division IDs
}