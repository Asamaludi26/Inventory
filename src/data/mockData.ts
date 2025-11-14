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
    InstalledMaterial
} from '../types';
import { generateDocumentNumber } from '../utils/documentNumberGenerator';

// --- CONFIGURATION ---
const USER_COUNT = 50;
const ASSET_COUNT = 250;
const REQUEST_COUNT = 120;
const CUSTOMER_COUNT = 80;
const NOW = new Date();

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
        { id: 1, name: 'Alice Johnson', email: 'inventory.admin@triniti.com', divisionId: 4, role: 'Admin Logistik' }, // Logistik
        { id: 2, name: 'Brian Adams', email: 'procurement.admin@triniti.com', divisionId: 6, role: 'Admin Purchase' }, // Finance
        { id: 99, name: 'John Doe', email: 'super.admin@triniti.com', divisionId: 5, role: 'Super Admin' }, // Administrasi
        { id: 101, name: 'Manager NOC', email: 'manager.noc@triniti.com', divisionId: 1, role: 'Leader' }, // NOC
        { id: 102, name: 'Citra Lestari', email: 'citra.lestari0@triniti.com', divisionId: 3, role: 'Staff' } // Teknisi
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
             users.push({ id: userIdCounter, name, email, divisionId: division.id, role: 'Staff' });
        } else {
            // Assign Leader role to every 5th staff in non-special divisions (not Logistik or Administrasi)
            let role: UserRole = (userIdCounter % 5 === 0 && division.id !== 4 && division.id !== 5) ? 'Leader' : 'Staff';
            users.push({ id: userIdCounter, name, email, divisionId: division.id, role: role });
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
        
        const installedMaterials: InstalledMaterial[] = [];
        if (i % 3 === 0 && i < 30) { // Add materials to the first 10 active customers
            installedMaterials.push({
                itemName: 'Kabel Dropcore 1 Core 150m',
                brand: 'FiberHome',
                quantity: Math.floor(Math.random() * 200) + 20, // Generate 20-219 to test conversion
                unit: 'meter',
                installationDate: installDate.toISOString().split('T')[0]
            });
        }
        if (i % 5 === 0 && i < 30) {
             installedMaterials.push({
                itemName: 'Konektor Fast Connector SC',
                brand: 'Generic',
                quantity: Math.floor(Math.random() * 150) + 10, // Generate 10-159 to test conversion
                unit: 'pcs',
                installationDate: installDate.toISOString().split('T')[0]
            });
        }

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
            installedMaterials: installedMaterials.length > 0 ? installedMaterials : undefined
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
// This pipeline generates data in a specific order to ensure referential integrity.
// 1. Generate master data (users, customers, categories).
// 2. Generate requests based on master data.
// 3. Generate assets based on *completed* requests.
// 4. Generate handovers, dismantles, and maintenances based on existing assets and users/customers.

let allAssets: Asset[] = [];
let allHandovers: Handover[] = [];
let allDismantles: Dismantle[] = [];
let allRequests: Request[] = [];
let allMaintenances: Maintenance[] = [];
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

// STEP 1: Generate Requests
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
generateRequests();
export const initialMockRequests = allRequests;


// STEP 2: Generate Assets
const generateAssets = () => {
    let assetIdCounter = 1;
    // Create assets from completed/arrived requests
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
                    poNumber: req.id,
                    invoiceNumber: purchaseDetails?.invoiceNumber || null,
                    warrantyEndDate: purchaseDetails?.warrantyEndDate || null,
                    location: 'Gudang Inventori',
                    currentUser: null,
                    status: AssetStatus.IN_STORAGE,
                    condition: AssetCondition.BRAND_NEW,
                    woRoIntNumber: req.id,
                    notes: null,
                    attachments: [],
                    activityLog: [{ id: `log-${id}-create`, timestamp: registrationDate.toISOString(), user: 'Alice Johnson', action: 'Aset Dicatat', details: `Aset dicatat dari request ${req.id}.` }],
                });
            }
        });
    });

    // Add some extra random assets to reach ASSET_COUNT
    while (allAssets.length < ASSET_COUNT) {
         const id = `AST-${String(assetIdCounter++).padStart(4, '0')}`;
         const template = assetTemplates[allAssets.length % assetTemplates.length];
         allAssets.push({
            id, name: template.name, brand: template.brand, category: template.category, type: template.type,
            serialNumber: `SN-MANUAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            macAddress: `00:0A:95:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}`,
            registrationDate: new Date().toISOString().split('T')[0],
            recordedBy: 'Alice Johnson',
            purchaseDate: new Date().toISOString().split('T')[0],
            purchasePrice: template.price,
            vendor: VENDORS[0], poNumber: null, invoiceNumber: null, warrantyEndDate: null,
            location: 'Gudang Inventori', currentUser: null,
            status: AssetStatus.IN_STORAGE, condition: AssetCondition.BRAND_NEW,
            woRoIntNumber: null, notes: null, attachments: [],
            activityLog: [{ id: `log-${id}-create`, timestamp: new Date().toISOString(), user: 'Alice Johnson', action: 'Aset Dicatat', details: 'Aset dicatat secara manual.' }],
         });
    }
};
generateAssets();
export const mockAssets = allAssets;


// STEP 3: Generate Handovers, Dismantles, Installations, and Maintenances
const generateActivities = () => {
    const engineerUsers = initialMockUsers.filter(u => u.divisionId === 3);
    const activeCustomers = mockCustomers.filter(c => c.status === CustomerStatus.ACTIVE);
    
    // Assign some assets to users and customers
    allAssets.forEach((asset, i) => {
        if (i % 3 === 0 && asset.status === AssetStatus.IN_STORAGE) { // Assign to user
            const user = initialMockUsers[i % initialMockUsers.length];
            if (user.role !== 'Super Admin') {
                asset.currentUser = user.name;
                asset.status = AssetStatus.IN_USE;
                asset.location = `Digunakan oleh ${user.name}`;
            }
        } else if (i % 5 === 0 && asset.status === AssetStatus.IN_STORAGE && asset.category === 'Perangkat Pelanggan (CPE)' && activeCustomers.length > 0) { // Install at customer
            const customer = activeCustomers[i % activeCustomers.length];
            asset.currentUser = customer.id;
            asset.status = AssetStatus.IN_USE;
            asset.location = `Terpasang di Pelanggan ${customer.name}`;
        }
    });

    // Generate maintenances dynamically based on installed assets
    for (let i = 0; i < 5; i++) {
        const customerWithAsset = mockCustomers.find(c => allAssets.some(a => a.currentUser === c.id));
        if (!customerWithAsset) continue;

        const oldAsset = allAssets.find(a => a.currentUser === customerWithAsset.id && a.category === 'Perangkat Pelanggan (CPE)');
        if (!oldAsset) continue;

        const newAsset = allAssets.find(a => a.status === AssetStatus.IN_STORAGE && a.name === oldAsset.name && !allMaintenances.some(m => m.replacements?.some(r => r.newAssetId === a.id)));
        if (!newAsset) continue;

        const maintenanceDate = new Date(new Date().setDate(NOW.getDate() - (5 - i)));
        const docNumber = generateDocumentNumber('MNT', allMaintenances, maintenanceDate);
        
        const materialAsset = allAssets.find(a => a.name === 'Konektor Fast Connector SC' && a.status === AssetStatus.IN_STORAGE);

        allMaintenances.push({
            id: `MNT-00${i + 1}`, docNumber, maintenanceDate: maintenanceDate.toISOString(),
            technician: engineerUsers[i % engineerUsers.length].name,
            customerId: customerWithAsset.id, customerName: customerWithAsset.name,
            assets: [{ assetId: oldAsset.id, assetName: oldAsset.name }],
            problemDescription: 'Indikator LOS berkedip, koneksi intermittent.',
            actionsTaken: 'Kabel dropcore disambung ulang, unit ONT diganti.',
            workTypes: ['Ganti Perangkat', 'Splicing FO'], priority: 'Tinggi', status: ItemStatus.COMPLETED,
            completedBy: 'Alice Johnson', completionDate: new Date(new Date(maintenanceDate).setDate(maintenanceDate.getDate() + 1)).toISOString(),
            attachments: [],
            materialsUsed: [{ 
                materialAssetId: materialAsset?.id,
                itemName: 'Konektor Fast Connector SC', 
                brand: 'Generic', 
                quantity: 2 
            }],
            replacements: [{ oldAssetId: oldAsset.id, retrievedAssetCondition: AssetCondition.MAJOR_DAMAGE, newAssetId: newAsset.id }]
        });
    }
};
generateActivities();

export const mockHandovers = allHandovers;
export const mockDismantles = allDismantles;
export const mockMaintenances = allMaintenances;
export const mockNotifications = allNotifications;
export const mockLoanRequests = allLoanRequests;