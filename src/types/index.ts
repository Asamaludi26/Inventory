// --- CORE TYPES & ENUMS ---

export type Page =
  | 'dashboard'
  | 'request'
  | 'request-pinjam'
  | 'registration'
  | 'handover'
  | 'dismantle'
  | 'stock'
  | 'repair'
  | 'customers'
  | 'customer-installation-form'
  | 'customer-maintenance-form'
  | 'customer-dismantle-form'
  | 'pengaturan-pengguna'
  | 'kategori';

export type UserRole = 'Super Admin' | 'Admin Logistik' | 'Admin Purchase' | 'Leader' | 'Staff';

export enum CustomerStatus {
  ACTIVE = 'Aktif',
  INACTIVE = 'Tidak Aktif',
  SUSPENDED = 'Suspend',
}

export enum AssetStatus {
  IN_STORAGE = 'Di Gudang',
  IN_USE = 'Digunakan',
  UNDER_REPAIR = 'Dalam Perbaikan',
  OUT_FOR_REPAIR = 'Perbaikan Eksternal',
  DAMAGED = 'Rusak',
  DECOMMISSIONED = 'Diberhentikan',
}

export enum AssetCondition {
  BRAND_NEW = 'Baru',
  GOOD = 'Baik',
  USED_OKAY = 'Bekas Layak Pakai',
  MINOR_DAMAGE = 'Rusak Ringan',
  MAJOR_DAMAGE = 'Rusak Berat',
  FOR_PARTS = 'Untuk Kanibalisasi',
}

export enum ItemStatus {
  PENDING = 'Menunggu Persetujuan',
  LOGISTIC_APPROVED = 'Disetujui Logistik',
  AWAITING_CEO_APPROVAL = 'Menunggu Persetujuan CEO',
  APPROVED = 'Disetujui',
  REJECTED = 'Ditolak',
  CANCELLED = 'Dibatalkan',
  PURCHASING = 'Proses Pengadaan',
  IN_DELIVERY = 'Dalam Pengiriman',
  ARRIVED = 'Barang Tiba',
  AWAITING_HANDOVER = 'Siap Serah Terima',
  COMPLETED = 'Selesai',
  IN_PROGRESS = 'Dalam Proses', // General purpose
}

export enum LoanRequestStatus {
    PENDING = 'Menunggu Persetujuan',
    APPROVED = 'Disetujui',
    REJECTED = 'Ditolak',
    ON_LOAN = 'Dipinjam',
    RETURNED = 'Dikembalikan',
    OVERDUE = 'Terlambat',
    AWAITING_RETURN = 'Menunggu Pengembalian',
}

export type TrackingMethod = 'individual' | 'bulk';
export type OrderType = 'Regular Stock' | 'Urgent' | 'Project Based';

// --- INTERFACES ---

export interface Division {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  divisionId: number | null;
  role: UserRole;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  referenceId?: string;
}

export interface Attachment {
    id: number;
    name: string;
    url: string;
    type: 'image' | 'pdf' | 'other';
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

export interface StandardItem {
  id: number;
  name: string;
  brand: string;
}

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
  isCustomerInstallable: boolean;
  associatedDivisions: number[];
  types: AssetType[];
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  type: string;
  brand: string;
  serialNumber?: string;
  macAddress?: string;
  registrationDate: string;
  recordedBy: string;
  purchaseDate: string;
  purchasePrice: number | null;
  vendor: string | null;
  poNumber: string | null;
  invoiceNumber: string | null;
  warrantyEndDate: string | null;
  location: string | null;
  locationDetail?: string | null;
  currentUser: string | null;
  status: AssetStatus;
  condition: AssetCondition;
  woRoIntNumber?: string | null;
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
  lastModifiedBy?: string | null;
  lastModifiedDate?: string | null;
}

export interface RequestItem {
  id: number;
  itemName: string;
  itemTypeBrand: string;
  stock: number;
  quantity: number;
  keterangan: string;
}

export interface PurchaseDetails {
    purchasePrice: number;
    vendor: string;
    poNumber: string;
    invoiceNumber: string;
    purchaseDate: string;
    warrantyEndDate: string | null;
    filledBy: string;
    fillDate: string;
}

export interface OrderDetails {
    type: OrderType;
    justification?: string;
    project?: string;
}

export interface Activity {
    id: number;
    author: string;
    timestamp: string;
    type: 'comment' | 'status_change' | 'revision';
    parentId?: number;
    payload: {
        text?: string;
        oldStatus?: ItemStatus;
        newStatus?: ItemStatus;
        revisions?: {
            itemName: string;
            originalQuantity: number;
            approvedQuantity: number;
            reason: string;
        }[];
    };
}


export interface Request {
  id: string;
  requester: string;
  division: string;
  requestDate: string;
  status: ItemStatus;
  order: OrderDetails;
  items: RequestItem[];
  totalValue: number;
  logisticApprover: string | null;
  logisticApprovalDate: string | null;
  finalApprover: string | null;
  finalApprovalDate: string | null;
  rejectionReason: string | null;
  rejectedBy: string | null;
  rejectionDate: string | null;
  rejectedByDivision: string | null;
  isRegistered?: boolean;
  purchaseDetails?: Record<number, PurchaseDetails>;
  estimatedDeliveryDate?: string;
  actualShipmentDate?: string;
  arrivalDate?: string;
  receivedBy?: string;
  completionDate?: string;
  completedBy?: string;
  partiallyRegisteredItems?: Record<number, number>; // itemId -> count
  itemStatuses?: Record<number, { status: 'rejected' | 'partial'; reason: string; approvedQuantity: number }>;
  isPrioritizedByCEO?: boolean;
  ceoDispositionDate?: string | null;
  ceoDispositionFeedbackSent?: boolean;
  progressUpdateRequest?: {
      requestedBy: string;
      requestDate: string;
      isAcknowledged: boolean;
      acknowledgedBy?: string;
      acknowledgedDate?: string;
      feedbackSent?: boolean;
  };
  lastFollowUpAt?: string;
  ceoFollowUpSent?: boolean;
  activityLog?: Activity[];
}

export interface LoanItem {
    id: number;
    itemName: string;
    brand: string;
    quantity: number;
    returnDate: string;
    keterangan?: string;
}

export interface LoanRequest {
  id: string;
  requester: string;
  division: string;
  requestDate: string;
  status: LoanRequestStatus;
  items: LoanItem[];
  notes: string | null;
  approver?: string;
  approvalDate?: string;
  rejectionReason?: string;
  assignedAssetIds?: Record<number, string[]>; // loan item id -> array of asset ids
  handoverId?: string;
  actualReturnDate?: string;
}


export interface HandoverItem {
  id: number;
  assetId?: string;
  itemName: string;
  itemTypeBrand: string;
  conditionNotes: string;
  quantity: number;
  checked: boolean;
}

export interface Handover {
  id: string;
  docNumber: string;
  handoverDate: string;
  menyerahkan: string;
  penerima: string;
  mengetahui: string;
  woRoIntNumber?: string;
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

export interface Notification {
  id: string;
  recipientId: number;
  actorName: string;
  type:
    | 'REQUEST_CREATED'
    | 'REQUEST_LOGISTIC_APPROVED'
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
    | 'REPAIR_PROGRESS_UPDATE'
    | 'ASSET_DECOMMISSIONED'
    | 'CEO_FOLLOW_UP_REQUEST';
  isRead: boolean;
  timestamp: string;
  referenceId: string;
  message?: string;
}

export interface ParsedScanResult {
  raw: string;
  id?: string;
  serialNumber?: string;
  macAddress?: string;
  name?: string;
}

export type PreviewData =
  | { type: 'asset'; id: string }
  | { type: 'customer'; id: string }
  | { type: 'user'; id: string | number }
  | { type: 'request'; id: string }
  | { type: 'handover'; id: string }
  | { type: 'dismantle'; id: string }
  | { type: 'customerAssets'; id: string }
  | { type: 'stockItemAssets', id: string }
  | { type: 'stockHistory', id: string };