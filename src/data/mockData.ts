

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
// FIX: Add 'loan-requests:return' permission, which was missing from the type definition.
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
export let mockCustomers: Customer[] = generateMockCustomers();

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
let allAssets: Asset[] = [];
let allHandovers: Handover[] = [];
let allDismantles: Dismantle[] = [];
let allRequests: Request[] = [];
let allMaintenances: Maintenance[] = [];
let allInstallations: Installation[] = [];
let allNotifications: Notification[] = [];
let allLoanRequests: LoanRequest[] = [];

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
    allRequests = Array.from({ length: REQUEST_COUNT }, (_, i) => {
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
        const purchaseFillDate = new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 1));

        if ([ItemStatus.LOGISTIC_APPROVED, ItemStatus.AWAITING_CEO_APPROVAL, ItemStatus.APPROVED, ItemStatus.COMPLETED, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED].includes(status)) {
            request.logisticApprover = 'Alice Johnson';
            request.logisticApprovalDate = approvalDate.toISOString().split('T')[0];
        }
        if ([ItemStatus.AWAITING_CEO_APPROVAL, ItemStatus.APPROVED, ItemStatus.COMPLETED, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED].includes(status)) {
            request.purchaseDetails = { 1: {
                purchasePrice: totalValue,
                vendor: VENDORS[i % VENDORS.length],
                poNumber: `PO-${String(REQUEST_COUNT - i).padStart(3, '0')}`,
                invoiceNumber: `INV/${VENDORS[i % VENDORS.length].slice(0, 3).toUpperCase()}/${purchaseFillDate.getFullYear()}/${i + 1}`,
                purchaseDate: purchaseFillDate.toISOString().split('T')[0],
                warrantyEndDate: new Date(new Date(purchaseFillDate).setFullYear(purchaseFillDate.getFullYear() + 1)).toISOString().split('T')[0],
                filledBy: 'Brian Adams',
                fillDate: purchaseFillDate.toISOString()
            }};
        }
        if ([ItemStatus.APPROVED, ItemStatus.COMPLETED, ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED].includes(status)) {
            request.finalApprover = 'John Doe';
            request.finalApprovalDate = new Date(new Date(purchaseFillDate).setDate(purchaseFillDate.getDate() + 1)).toISOString().split('T')[0];
        }
        if ([ItemStatus.PURCHASING, ItemStatus.IN_DELIVERY, ItemStatus.ARRIVED, ItemStatus.COMPLETED].includes(status)) {
            request.estimatedDeliveryDate = new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 7)).toISOString().split('T')[0];
        }
        if ([ItemStatus.ARRIVED, ItemStatus.COMPLETED].includes(status)) {
            request.arrivalDate = new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 6)).toISOString().split('T')[0];
            request.receivedBy = 'Alice Johnson';
        }
        if (status === ItemStatus.COMPLETED) {
            request.isRegistered = true;
        }
        if (status === ItemStatus.REJECTED) {
            request.rejectedBy = 'Brian Adams';
            request.rejectionDate = approvalDate.toISOString().split('T')[0];
            request.rejectionReason = 'Stok tidak mencukupi dan pengadaan tidak disetujui.';
            request.rejectedByDivision = 'Purchase';
        }
        
        return request;
    });
};

const generateAssets = () => {
    let assetIdCounter = 1;
    const assetGeneratingRequests = allRequests.filter(r => [ItemStatus.ARRIVED, ItemStatus.AWAITING_HANDOVER, ItemStatus.COMPLETED].includes(r.status));
    
    assetGeneratingRequests.forEach(req => {
        req.items.forEach(item => {
            const qty = req.itemStatuses?.[item.id]?.approvedQuantity ?? item.quantity;
            for (let i = 0; i < qty; i++) {
                const id = `AST-${String(assetIdCounter++).padStart(4, '0')}`;
                const template = assetTemplates.find(t => t.name === item.itemName && t.brand === item.itemTypeBrand);
                const purchaseDetails = req.purchaseDetails?.[item.id];
                const registrationDate = new Date(req.arrivalDate!);
                registrationDate.setDate(registrationDate.getDate() + 1);

                allAssets.push({
                    id, name: item.itemName, brand: item.itemTypeBrand,
                    category: template?.category || 'N/A', type: template?.type || 'N/A',
                    serialNumber: `SN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
                    macAddress: `00:0A:95:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}`,
                    registrationDate: registrationDate.toISOString().split('T')[0],
                    recordedBy: 'Alice Johnson',
                    purchaseDate: purchaseDetails?.purchaseDate || new Date().toISOString().split('T')[0],
                    purchasePrice: (purchaseDetails?.purchasePrice || template?.price || 0) / qty,
                    vendor: purchaseDetails?.vendor || VENDORS[0],
                    poNumber: req.id, invoiceNumber: purchaseDetails?.invoiceNumber || null, warrantyEndDate: purchaseDetails?.warrantyEndDate || null,
                    location: 'Gudang Inventori', currentUser: null,
                    status: AssetStatus.IN_STORAGE, condition: AssetCondition.BRAND_NEW,
                    woRoIntNumber: req.id, notes: null, attachments: [],
                    activityLog: [{ id: `log-${id}-create`, timestamp: registrationDate.toISOString(), user: 'Alice Johnson', action: 'Aset Dicatat', details: `Aset dicatat dari request ${req.id}.` }],
                });
            }
        });
    });

    while (allAssets.length < ASSET_COUNT) {
         const id = `AST-${String(assetIdCounter++).padStart(4, '0')}`;
         const template = assetTemplates[allAssets.length % assetTemplates.length];
         allAssets.push({
            id, name: template.name, brand: template.brand, category: template.category, type: template.type,
            serialNumber: `SN-MANUAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            macAddress: `00:0A:95:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}`,
            registrationDate: new Date().toISOString().split('T')[0], recordedBy: 'Alice Johnson',
            purchaseDate: new Date().toISOString().split('T')[0], purchasePrice: template.price,
            vendor: VENDORS[0], poNumber: null, invoiceNumber: null, warrantyEndDate: null,
            location: 'Gudang Inventori', currentUser: null,
            status: AssetStatus.IN_STORAGE, condition: AssetCondition.BRAND_NEW,
            woRoIntNumber: null, notes: null, attachments: [],
            activityLog: [{ id: `log-${id}-create`, timestamp: new Date().toISOString(), user: 'Alice Johnson', action: 'Aset Dicatat', details: 'Aset dicatat secara manual.' }],
         });
    }
};

const generateInstallations = () => {
    const activeCustomers = mockCustomers.filter(c => c.status === CustomerStatus.ACTIVE);
    const technicians = initialMockUsers.filter(u => u.divisionId === 3);
    const ceo = initialMockUsers.find(u => u.role === 'Super Admin');

    const dropcoreAsset = allAssets.find(a => a.name === 'Kabel Dropcore 1 Core 150m');
    const connectorAsset = allAssets.find(a => a.name === 'Konektor Fast Connector SC');

    for (let i = 0; i < 20; i++) {
        const installableAssets = allAssets.filter(a => {
            const category = initialAssetCategories.find(c => c.name === a.category);
            return category?.isCustomerInstallable && a.status === AssetStatus.IN_STORAGE && category.types.find(t => t.name === a.type)?.trackingMethod !== 'bulk';
        });

        if (installableAssets.length === 0 || activeCustomers.length === 0 || technicians.length === 0) break;

        const customer = activeCustomers[i % activeCustomers.length];
        const technician = technicians[i % technicians.length];
        const installationDate = new Date(new Date().setDate(NOW.getDate() - (40 - i)));
        
        const assetToInstall = installableAssets[0];
        const assetsInstalled: InstallationAsset[] = [{
            assetId: assetToInstall.id, assetName: assetToInstall.name, serialNumber: assetToInstall.serialNumber,
        }];
        
        const assetIndex = allAssets.findIndex(a => a.id === assetToInstall.id);
        if (assetIndex > -1) {
            allAssets[assetIndex].status = AssetStatus.IN_USE;
            allAssets[assetIndex].currentUser = customer.id;
            allAssets[assetIndex].location = `Terpasang di: ${customer.address}`;
            allAssets[assetIndex].activityLog.push({ id: `log-inst-${assetToInstall.id}`, timestamp: installationDate.toISOString(), user: technician.name, action: 'Instalasi Pelanggan', details: `Dipasang untuk pelanggan ${customer.name} (${customer.id}).` });
        }

        const materialsUsed: InstallationMaterial[] = [
            { materialAssetId: dropcoreAsset?.id, itemName: 'Kabel Dropcore 1 Core 150m', brand: 'FiberHome', quantity: Math.floor(Math.random() * 50) + 20, unit: 'meter' },
            { materialAssetId: connectorAsset?.id, itemName: 'Konektor Fast Connector SC', brand: 'Generic', quantity: Math.floor(Math.random() * 4) + 2, unit: 'pcs' }
        ];
        
        const customerIndex = mockCustomers.findIndex(c => c.id === customer.id);
        if (customerIndex > -1) {
            const customerToUpdate = mockCustomers[customerIndex];
            if (!customerToUpdate.installedMaterials) customerToUpdate.installedMaterials = [];
            materialsUsed.forEach(newMat => {
                const existingMat = customerToUpdate.installedMaterials!.find(em => em.itemName === newMat.itemName && em.brand === newMat.brand);
                if (existingMat) existingMat.quantity += newMat.quantity;
                else customerToUpdate.installedMaterials!.push({ ...newMat, installationDate: installationDate.toISOString().split('T')[0] });
            });
        }

        const docNumber = generateDocumentNumber('INST', allInstallations, installationDate);
        allInstallations.push({
            id: `INST-${String(i + 1).padStart(3, '0')}`, 
            docNumber, 
            requestNumber: i % 3 === 0 ? `REQ-${String(i + 10).padStart(3, '0')}` : undefined,
            installationDate: installationDate.toISOString().split('T')[0],
            technician: technician.name, 
            customerId: customer.id, 
            customerName: customer.name,
            assetsInstalled, 
            materialsUsed, 
            status: ItemStatus.COMPLETED, 
            notes: 'Instalasi berjalan lancar.',
            acknowledger: ceo?.name,
            createdBy: technician.name, // Assume the technician creates the form
        });
    }
};

const generateMaintenances = () => {
    const technicians = initialMockUsers.filter(u => u.divisionId === 3);

    for (let i = 0; i < 10; i++) {
        const assetsInUseAtCustomer = allAssets.filter(a => a.status === AssetStatus.IN_USE && a.currentUser?.startsWith('TMI-'));
        if (assetsInUseAtCustomer.length === 0 || technicians.length === 0) break;

        const oldAsset = assetsInUseAtCustomer[i % assetsInUseAtCustomer.length];
        const customer = mockCustomers.find(c => c.id === oldAsset.currentUser);
        const newAsset = allAssets.find(a => a.status === AssetStatus.IN_STORAGE && a.name === oldAsset.name && !allMaintenances.some(m => m.replacements?.some(r => r.newAssetId === a.id)));
        
        if (!customer || !newAsset) continue;

        const maintenanceDate = new Date(new Date().setDate(NOW.getDate() - (15 - i)));
        const docNumber = generateDocumentNumber('MNT', allMaintenances, maintenanceDate);
        
        allMaintenances.push({
            id: `MNT-${String(i + 1).padStart(3, '0')}`, 
            docNumber, 
            requestNumber: i % 2 === 0 ? `REQ-${String(i + 20).padStart(3, '0')}` : undefined,
            maintenanceDate: maintenanceDate.toISOString(),
            technician: technicians[i % technicians.length].name,
            customerId: customer.id, customerName: customer.name,
            assets: [{ assetId: oldAsset.id, assetName: oldAsset.name }],
            problemDescription: 'Koneksi intermittent, indikator LOS berkedip.',
            actionsTaken: 'Pergantian unit ONT.', workTypes: ['Ganti Perangkat'], priority: 'Tinggi', status: ItemStatus.COMPLETED,
            completedBy: 'Alice Johnson', completionDate: new Date(new Date(maintenanceDate).setDate(maintenanceDate.getDate() + 1)).toISOString(),
            attachments: [],
            materialsUsed: [{ itemName: 'Konektor Fast Connector SC', brand: 'Generic', quantity: 2, materialAssetId: allAssets.find(a => a.name.includes('Konektor'))?.id }],
            replacements: [{ oldAssetId: oldAsset.id, retrievedAssetCondition: AssetCondition.MAJOR_DAMAGE, newAssetId: newAsset.id }]
        });
        
        // Update old asset
        const oldAssetIndex = allAssets.findIndex(a => a.id === oldAsset.id);
        if (oldAssetIndex > -1) {
            allAssets[oldAssetIndex].status = AssetStatus.IN_STORAGE;
            allAssets[oldAssetIndex].condition = AssetCondition.MAJOR_DAMAGE;
            allAssets[oldAssetIndex].currentUser = null;
            allAssets[oldAssetIndex].location = 'Gudang Inventori';
        }

        // Update new asset
        const newAssetIndex = allAssets.findIndex(a => a.id === newAsset.id);
        if (newAssetIndex > -1) {
            allAssets[newAssetIndex].status = AssetStatus.IN_USE;
            allAssets[newAssetIndex].currentUser = customer.id;
            allAssets[newAssetIndex].location = `Terpasang di: ${customer.address}`;
        }
    }
};

const generateDismantles = () => {
    const technicians = initialMockUsers.filter(u => u.divisionId === 3);
    
    for (let i = 0; i < 5; i++) {
        const assetsToDismantle = allAssets.filter(a => a.status === AssetStatus.IN_USE && a.currentUser?.startsWith('TMI-') && !allDismantles.some(d => d.assetId === a.id));
        if (assetsToDismantle.length === 0 || technicians.length === 0) break;

        const asset = assetsToDismantle[0];
        const customer = mockCustomers.find(c => c.id === asset.currentUser);
        if (!customer) continue;

        const dismantleDate = new Date(new Date().setDate(NOW.getDate() - (5 - i)));
        const docNumber = generateDocumentNumber('DSM', allDismantles, dismantleDate);

        allDismantles.push({
            id: `DSM-${String(i + 1).padStart(3, '0')}`, docNumber, assetId: asset.id, assetName: asset.name,
            dismantleDate: dismantleDate.toISOString(), technician: technicians[i % technicians.length].name,
            customerName: customer.name, customerId: customer.id, customerAddress: customer.address,
            retrievedCondition: AssetCondition.USED_OKAY, notes: 'Pelanggan berhenti berlangganan.',
            acknowledger: 'Alice Johnson', status: ItemStatus.COMPLETED, attachments: [],
        });

        const assetIndex = allAssets.findIndex(a => a.id === asset.id);
        if (assetIndex > -1) {
            allAssets[assetIndex].status = AssetStatus.IN_STORAGE;
            allAssets[assetIndex].condition = AssetCondition.USED_OKAY;
            allAssets[assetIndex].currentUser = null;
            allAssets[assetIndex].location = 'Gudang Inventori';
            allAssets[assetIndex].isDismantled = true;
            allAssets[assetIndex].dismantleInfo = { customerId: customer.id, customerName: customer.name, dismantleDate: dismantleDate.toISOString(), dismantleId: `DSM-00${i + 1}` };
        }
    }
};

const assignInitialAssetsToUsers = (users: User[], assets: Asset[]) => {
    const assignments = [
        { userName: 'Citra Lestari', assetName: 'Laptop ThinkPad T480' },
        { userName: 'Manager NOC', assetName: 'PC Rakitan Core i7' },
        { userName: 'Alice Johnson', assetName: 'Fusion Splicer 90S' },
        { userName: 'Citra Lestari', assetName: 'Optical Power Meter' },
        { userName: 'Manager NOC', assetName: 'Monitor LG 24 inch' },
    ];

    assignments.forEach(assignment => {
        const user = users.find(u => u.name === assignment.userName);
        if (!user) return;

        const assetIndex = assets.findIndex(a => a.name === assignment.assetName && a.status === AssetStatus.IN_STORAGE);
        if (assetIndex === -1) return;

        assets[assetIndex].status = AssetStatus.IN_USE;
        assets[assetIndex].currentUser = user.name;
        assets[assetIndex].location = `Digunakan oleh ${user.name}`;
        assets[assetIndex].activityLog.push({
            id: `log-assign-${assets[assetIndex].id}`,
            timestamp: new Date().toISOString(),
            user: 'System',
            action: 'Serah Terima Internal',
            details: `Aset diserahkan kepada ${user.name} saat inisialisasi data.`
        });
    });
};


// --- FINAL EXECUTION ---
generateRequests();
generateAssets();
generateInstallations();
generateMaintenances();
generateDismantles();
assignInitialAssetsToUsers(initialMockUsers, allAssets);

// --- EXPORTS ---
export const initialMockRequests = allRequests;
export const mockAssets = allAssets;
export const mockHandovers = allHandovers;
export const mockDismantles = allDismantles;
export const mockMaintenances = allMaintenances;
export const mockInstallations = allInstallations;
export const mockNotifications = allNotifications;
export const mockLoanRequests = allLoanRequests;