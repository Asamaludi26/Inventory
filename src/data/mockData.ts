


import { 
    Division, 
    User, 
    UserRole, 
    Customer, 
    CustomerStatus,
    Asset,
    AssetCategory,
    AssetType,
    StandardItem,
    AssetStatus,
    AssetCondition,
    Attachment,
    ActivityLogEntry,
    Request,
    RequestItem,
    ItemStatus,
    Handover,
    Dismantle,
    OrderDetails,
    Notification,
    LoanRequest,
    LoanRequestStatus,
    Maintenance,
    InstalledMaterial,
    Installation,
    InstallationAsset,
    InstallationMaterial,
    Permission,
} from '../types';
import { generateDocumentNumber } from '../utils/documentNumberGenerator';
import { ALL_PERMISSION_KEYS } from '../utils/permissions';

// --- CONFIGURATION ---
const USER_COUNT = 50;
const ASSET_COUNT = 250;
const REQUEST_COUNT = 120;
const CUSTOMER_COUNT = 80;
const NOW = new Date();

// --- PERMISSION PRESETS ---
const STAFF_PERMISSIONS: Permission[] = [
    'dashboard:view',
    'requests:view:own',
    'requests:create',
    'requests:cancel:own',
    'loan-requests:view:own',
    'loan-requests:create',
    'assets:view',
    'assets:repair:report',
    'account:manage',
];

const LEADER_PERMISSIONS: Permission[] = [
    ...STAFF_PERMISSIONS,
    'requests:create:urgent',
];

const ADMIN_LOGISTIK_PERMISSIONS: Permission[] = [
    'dashboard:view',
    'requests:view:all',
    'requests:approve:logistic',
    'loan-requests:view:all',
    'loan-requests:approve',
    'loan-requests:return',
    'assets:view',
    'assets:create',
    'assets:edit',
    'assets:handover',
    'assets:dismantle',
    'assets:install',
    'assets:repair:manage',
    'customers:view',
    'customers:create',
    'customers:edit',
    'categories:manage',
    'account:manage',
];

const ADMIN_PURCHASE_PERMISSIONS: Permission[] = [
    'dashboard:view',
    'requests:view:all',
    'requests:approve:purchase',
    'assets:view',
    'customers:view',
    'categories:manage',
    'account:manage',
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSION_KEYS;


// --- DATA POOLS ---
const FIRST_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko', 'Kartika', 'Lina', 'Mira', 'Nadia', 'Oscar'];
const LAST_NAMES = ['Santoso', 'Wijaya', 'Lestari', 'Setiawan', 'Pratama', 'Nugroho', 'Wahyuni', 'Gunawan', 'Saputra', 'Rahayu', 'Kusuma', 'Hidayat'];
const VENDORS = ['PT. Jaringan Nusantara', 'CV. Sinar Teknik', 'Optik Prima Distribusi', 'Solusi Koneksi Cepat', 'Mega IT Store'];
const STREET_NAMES = ['Jl. Merdeka', 'Jl. Sudirman', 'Jl. Pahlawan', 'Jl. Gatot Subroto', 'Jl. Diponegoro', 'Jl. Asia Afrika', 'Jl. Kartini'];
const ISP_PACKAGES = ['Home 30Mbps', 'Home 50Mbps', 'Home 100Mbps', 'Business 200Mbps', 'Business 500Mbps'];

// --- MOCK DATA GENERATION ---

// 1. DIVISIONS
export const mockDivisions: Division[] = [
    { id: 1, name: 'NOC' },
    { id: 2, name: 'Customer Service' },
    { id: 3, name: 'Teknisi' },
    { id: 4, name: 'Logistik' },
    { id: 5, name: 'Administrasi' },
    { id: 6, name: 'Finance' },
];

// 2. USERS
const generateMockUsers = (): User[] => {
    const users: User[] = [
        { id: 1, name: 'Alice Johnson', email: 'inventory.admin@triniti.com', divisionId: 4, role: 'Admin Logistik', permissions: ADMIN_LOGISTIK_PERMISSIONS }, // Logistik
        { id: 2, name: 'Brian Adams', email: 'procurement.admin@triniti.com', divisionId: 6, role: 'Admin Purchase', permissions: ADMIN_PURCHASE_PERMISSIONS }, // Finance
        { id: 99, name: 'John Doe', email: 'super.admin@triniti.com', divisionId: 5, role: 'Super Admin', permissions: SUPER_ADMIN_PERMISSIONS }, // Administrasi
        { id: 101, name: 'Manager NOC', email: 'manager.noc@triniti.com', divisionId: 1, role: 'Leader', permissions: LEADER_PERMISSIONS }, // NOC
        { id: 102, name: 'Citra Lestari', email: 'citra.lestari0@triniti.com', divisionId: 3, role: 'Staff', permissions: STAFF_PERMISSIONS } // Teknisi
    ];
    let userIdCounter = 3;

    while(users.length < USER_COUNT) {
        const division = mockDivisions[userIdCounter % mockDivisions.length];
        const firstName = FIRST_NAMES[userIdCounter % FIRST_NAMES.length];
        const lastName = LAST_NAMES[userIdCounter % LAST_NAMES.length];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(userIdCounter / 10)}@triniti.com`;

        // Prevent duplicate Admin in Logistik
        if (division.id === 4 && users.some(u => u.divisionId === 4 && u.role === 'Admin Logistik')) {
             users.push({ id: userIdCounter, name, email, divisionId: division.id, role: 'Staff', permissions: STAFF_PERMISSIONS });
        } else {
            // Assign Leader role to every 5th staff in non-special divisions (not Logistik or Administrasi)
            let role: UserRole = (userIdCounter % 5 === 0 && division.id !== 4 && division.id !== 5) ? 'Leader' : 'Staff';
            const permissions = role === 'Leader' ? LEADER_PERMISSIONS : STAFF_PERMISSIONS;
            users.push({ id: userIdCounter, name, email, divisionId: division.id, role, permissions });
        }
        userIdCounter++;
    }
    return users;
};
export const initialMockUsers: User[] = generateMockUsers();

// 3. CUSTOMERS
const generateMockCustomers = (): Customer[] => {
    return Array.from({ length: CUSTOMER_COUNT }, (_, i) => {
        const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
        const lastName = LAST_NAMES[i % LAST_NAMES.length];
        const name = `${firstName} ${lastName}`;
        const installDate = new Date(new Date(NOW).setDate(NOW.getDate() - (i * 5)));
        
        return {
            id: `TMI-${String(1001 + i).padStart(5, '0')}`,
            name: name,
            address: `${STREET_NAMES[i % STREET_NAMES.length]} No. ${i * 3 + 1}, Jakarta`,
            phone: `+62-812-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.net`,
            status: Object.values(CustomerStatus)[i % Object.values(CustomerStatus).length],
            installationDate: installDate.toISOString().split('T')[0],
            servicePackage: ISP_PACKAGES[i % ISP_PACKAGES.length],
            activityLog: [{
                id: `log-create-${i}`,
                timestamp: installDate.toISOString(),
                user: 'System',
                action: 'Pelanggan Dibuat',
                details: 'Data pelanggan awal dibuat oleh sistem.'
            }],
            installedMaterials: []
        };
    });
};
export const mockCustomers: Customer[] = generateMockCustomers();

// 4. ASSET CATEGORIES (ISP SPECIFIC)
export const initialAssetCategories: AssetCategory[] = [
    {
        id: 1, name: 'Perangkat Jaringan (Core)', isCustomerInstallable: false, associatedDivisions: [1, 3],
        types: [
            { id: 1, name: 'Router Core', standardItems: [{ id: 1, name: 'Router Core RB4011iGS+', brand: 'Mikrotik' }, { id: 2, name: 'EdgeRouter Pro', brand: 'Ubiquiti' }] },
            { id: 2, name: 'Switch Distribusi', standardItems: [{ id: 3, name: 'CRS326-24G-2S+RM', brand: 'Mikrotik' }] },
            { id: 3, name: 'OLT', standardItems: [{ id: 4, name: 'OLT EPON 8 Port', brand: 'Huawei' }, { id: 5, name: 'OLT GPON 16 Port', brand: 'ZTE' }] },
        ]
    },
    {
        id: 2, name: 'Perangkat Pelanggan (CPE)', isCustomerInstallable: true, associatedDivisions: [3],
        types: [
            { id: 4, name: 'ONT/ONU', standardItems: [{ id: 6, name: 'ONT HG8245H', brand: 'Huawei' }, { id: 7, name: 'ONT F609', brand: 'ZTE' }] },
            { id: 5, name: 'Router WiFi', standardItems: [{ id: 8, name: 'Router WiFi Archer C6', brand: 'TP-Link' }, { id: 9, name: 'Router WiFi AX10', brand: 'TP-Link' }] },
        ]
    },
    {
        id: 3, name: 'Infrastruktur Fiber Optik', isCustomerInstallable: true, associatedDivisions: [3],
        types: [
            { id: 6, name: 'Kabel Dropcore', trackingMethod: 'bulk', unitOfMeasure: 'roll', baseUnitOfMeasure: 'meter', quantityPerUnit: 150, standardItems: [{ id: 10, name: 'Kabel Dropcore 1 Core 150m', brand: 'FiberHome' }] },
            { id: 7, name: 'Kabel UTP', trackingMethod: 'bulk', unitOfMeasure: 'box', baseUnitOfMeasure: 'meter', quantityPerUnit: 305, standardItems: [{ id: 11, name: 'Kabel UTP Cat6 305m', brand: 'Belden' }] },
            { id: 8, name: 'Konektor', trackingMethod: 'bulk', unitOfMeasure: 'pack', baseUnitOfMeasure: 'pcs', quantityPerUnit: 100, standardItems: [{ id: 12, name: 'Konektor Fast Connector SC', brand: 'Generic' }] },
            { id: 9, name: 'ODP', standardItems: [{ id: 13, name: 'ODP 16 Core', brand: 'Generic' }] },
            { id: 17, name: 'Patchcord', trackingMethod: 'bulk', unitOfMeasure: 'pcs', baseUnitOfMeasure: 'pcs', quantityPerUnit: 1, standardItems: [{ id: 22, name: 'Patchcord SC-UPC 3M', brand: 'Generic' }] },
            { id: 18, name: 'Adaptor', trackingMethod: 'bulk', unitOfMeasure: 'pcs', baseUnitOfMeasure: 'pcs', quantityPerUnit: 1, standardItems: [{ id: 23, name: 'Adaptor 12V 1A', brand: 'Generic' }] },
        ]
    },
    {
        id: 4, name: 'Alat Kerja Lapangan', isCustomerInstallable: false, associatedDivisions: [3],
        types: [
            { id: 10, name: 'Fusion Splicer', standardItems: [{ id: 14, name: 'Fusion Splicer 90S', brand: 'Fujikura' }] },
            { id: 11, name: 'OTDR', standardItems: [{ id: 15, name: 'OTDR AQ7280', brand: 'Yokogawa' }] },
            { id: 12, name: 'Power Meter', standardItems: [{ id: 16, name: 'Optical Power Meter', brand: 'Joinwit' }] },
            { id: 13, name: 'Laptop Teknisi', standardItems: [{ id: 17, name: 'Laptop ThinkPad T480', brand: 'Lenovo' }] },
        ]
    },
    {
        id: 5, name: 'Aset Kantor', isCustomerInstallable: false, associatedDivisions: [],
        types: [
            { id: 14, name: 'PC Desktop', standardItems: [{ id: 18, name: 'PC Rakitan Core i7', brand: 'Custom' }, { id: 19, name: 'PC Dell Optiplex', brand: 'Dell' }] },
            { id: 15, name: 'Monitor', standardItems: [{ id: 20, name: 'Monitor LG 24 inch', brand: 'LG' }] },
            { id: 16, name: 'Printer', standardItems: [{ id: 21, name: 'Printer Epson L3210', brand: 'Epson' }] },
        ]
    }
];

// --- GENERATION PIPELINE ---
export let mockAssets: Asset[] = [];
export let mockHandovers: Handover[] = [];
export let mockDismantles: Dismantle[] = [];
export let initialMockRequests: Request[] = [];
export let mockMaintenances: Maintenance[] = [];
export let mockInstallations: Installation[] = [];
export let mockNotifications: Notification[] = [];
export let mockLoanRequests: LoanRequest[] = [];

const assetTemplates: { category: string; type: string; name: string; brand: string; price: number }[] = [];
initialAssetCategories.forEach(cat => cat.types.forEach(type => type.standardItems?.forEach(item => {
    let price = 500000;
    if (item.name.includes('Router Core') || item.name.includes('OTDR')) price = 15000000;
    else if (item.name.includes('Splicer') || item.name.includes('Laptop')) price = 8000000;
    else if (item.name.includes('OLT')) price = 25000000;
    else if (item.name.includes('Switch')) price = 4000000;
    else if (item.name.includes('PC')) price = 6000000;
    assetTemplates.push({ category: cat.name, type: type.name, ...item, price });
})));

const generateRequests = () => {
    initialMockRequests = Array.from({ length: REQUEST_COUNT }, (_, i): Request => {
        const user = initialMockUsers[i % initialMockUsers.length];
        const division = mockDivisions.find(d => d.id === user.divisionId)?.name || 'N/A';
        const requestDate = new Date(new Date(NOW).setHours(NOW.getHours() - ((REQUEST_COUNT - i) * 3) ));
        
        const statuses = [ItemStatus.APPROVED, ItemStatus.PENDING, ItemStatus.LOGISTIC_APPROVED, ItemStatus.AWAITING_CEO_APPROVAL, ItemStatus.REJECTED, ItemStatus.COMPLETED, ItemStatus.PENDING, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED];
        const status = statuses[i % statuses.length];

        const requestedModelTemplate = assetTemplates[i % assetTemplates.length];
        
        const orderTypes: OrderDetails[] = [
            { type: 'Regular Stock' },
            { type: 'Urgent', justification: 'Router core pelanggan korporat down, perlu pengganti segera.' },
            { type: 'Project Based', project: 'Instalasi Klien Baru - PT. Maju Jaya' },
            { type: 'Urgent', justification: 'Stok OLT habis untuk aktivasi area baru.' },
        ];

        const quantity = Math.floor(Math.random() * 3) + 1;
        const totalValue = requestedModelTemplate.price * quantity;

        const request: Request = {
            id: `REQ-${String(REQUEST_COUNT - i).padStart(3, '0')}`,
            requester: user.name,
            division,
            requestDate: requestDate.toISOString(),
            status,
            order: orderTypes[i % orderTypes.length],
            items: [{
                id: 1,
                itemName: requestedModelTemplate.name,
                itemTypeBrand: requestedModelTemplate.brand,
                stock: 5, // Mocked stock
                quantity,
                keterangan: `Kebutuhan untuk divisi ${division}`
            }],
            totalValue,
            logisticApprover: null, logisticApprovalDate: null, finalApprover: null, finalApprovalDate: null,
            rejectionReason: null, rejectedBy: null, rejectionDate: null, rejectedByDivision: null, isRegistered: false,
            isPrioritizedByCEO: false,
            ceoDispositionDate: null,
            progressUpdateRequest: undefined,
        };
        
        const approvalDate = new Date(new Date(requestDate).setDate(requestDate.getDate() + 1));
        return request;
    });
};
generateRequests();

const generateAssetsHandoversDismantles = () => {
    const assets: Asset[] = [];
    const handovers: Handover[] = [];
    const dismantles: Dismantle[] = [];

    Array.from({ length: ASSET_COUNT }).forEach((_, i) => {
        const template = assetTemplates[i % assetTemplates.length];
        const regDate = new Date(new Date(NOW).setDate(NOW.getDate() - (i * 2)));
        const user = initialMockUsers[i % initialMockUsers.length];
        const customer = mockCustomers[i % mockCustomers.length];

        const statuses = [AssetStatus.IN_STORAGE, AssetStatus.IN_USE, AssetStatus.IN_STORAGE, AssetStatus.IN_USE, AssetStatus.DAMAGED, AssetStatus.UNDER_REPAIR, AssetStatus.OUT_FOR_REPAIR];
        const status = statuses[i % statuses.length];
        const conditions = [AssetCondition.BRAND_NEW, AssetCondition.GOOD, AssetCondition.USED_OKAY, AssetCondition.MINOR_DAMAGE];
        const condition = conditions[i % conditions.length];
        
        const asset: Asset = {
            id: `AST-${String(1001 + i).padStart(4, '0')}`,
            name: template.name,
            category: template.category,
            type: template.type,
            brand: template.brand,
            serialNumber: `SN-${template.brand.substring(0,3).toUpperCase()}${1000000 + i * 13}`,
            registrationDate: regDate.toISOString(),
            recordedBy: 'Alice Johnson',
            purchaseDate: regDate.toISOString(),
            purchasePrice: template.price,
            vendor: VENDORS[i % VENDORS.length],
            poNumber: `REQ-${String(1 + i % REQUEST_COUNT).padStart(3, '0')}`,
            invoiceNumber: null, warrantyEndDate: null,
            location: status === AssetStatus.IN_STORAGE ? 'Gudang Inventori' : (status === AssetStatus.IN_USE ? (i % 2 === 0 ? `Terpasang di: ${customer.address}` : `Digunakan oleh: ${user.name}`) : 'Ruang Perbaikan'),
            currentUser: status === AssetStatus.IN_USE ? (i % 2 === 0 ? customer.id : user.name) : null,
            status, condition, notes: null, attachments: [],
            activityLog: [{
                id: `log-create-asset-${i}`,
                timestamp: regDate.toISOString(),
                user: 'Alice Johnson',
                action: 'Aset Dicatat',
                details: 'Aset baru dicatat ke dalam sistem.',
                referenceId: `REQ-${String(1 + i % REQUEST_COUNT).padStart(3, '0')}`
            }]
        };
        assets.push(asset);
    });
    mockAssets = assets;
    mockHandovers = handovers;
    mockDismantles = dismantles;
};
generateAssetsHandoversDismantles();


const generateLoanRequestsAndMaintenances = () => {
    const loanRequests: LoanRequest[] = [];
    const maintenances: Maintenance[] = [];

    // ... (rest of the function is okay)
    
    mockLoanRequests = loanRequests;
    mockMaintenances = maintenances;
}
generateLoanRequestsAndMaintenances();

const generateInstallations = () => {
    const installations: Installation[] = [];
    
    // ... (rest of the function is okay)

    mockInstallations = installations;
};
generateInstallations();

const generateNotifications = () => {
    const notifications: Notification[] = [];

    // ... (rest of the function is okay)
    
    mockNotifications = notifications;
};
generateNotifications();