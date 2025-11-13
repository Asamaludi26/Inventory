
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
                quantity: Math.floor(Math.random() * 50) + 20,
                unit: 'meter',
                installationDate: installDate.toISOString().split('T')[0]
            });
        }
        if (i % 5 === 0 && i < 30) {
             installedMaterials.push({
                itemName: 'Konektor Fast Connector SC',
                brand: 'Generic',
                quantity: Math.floor(Math.random() * 4) + 2,
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

// 5. ASSETS (and their related activities)
const allAssets: Asset[] = [];
const allHandovers: Handover[] = [];
const allDismantles: Dismantle[] = [];
const assetTemplates: { category: string; type: string; name: string; brand: string; price: number }[] = [];

const generateMockAssets = () => {
    initialAssetCategories.forEach(cat => cat.types.forEach(type => type.standardItems?.forEach(item => {
        let price = 500000;
        if (item.name.includes('Router Core') || item.name.includes('OTDR')) price = 15000000;
        else if (item.name.includes('Splicer') || item.name.includes('Laptop')) price = 8000000;
        else if (item.name.includes('OLT')) price = 25000000;
        else if (item.name.includes('Switch')) price = 4000000;
        else if (item.name.includes('PC')) price = 6000000;
        assetTemplates.push({ category: cat.name, type: type.name, ...item, price });
    })));

    const engineerUsers = initialMockUsers.filter(u => u.divisionId === 3).map(u => u.name); // Teknisi
    const nocUsers = initialMockUsers.filter(u => u.divisionId === 1).map(u => u.name); // NOC
    const csUsers = initialMockUsers.filter(u => u.divisionId === 2).map(u => u.name); // Customer Service
    const activeCustomers = mockCustomers.filter(c => c.status === CustomerStatus.ACTIVE);

    for (let i = 0; i < ASSET_COUNT; i++) {
        const template = assetTemplates[i % assetTemplates.length];
        const id = `AST-${String(250 - i).padStart(4, '0')}`;
        const poNumber = `REQ-${String(120 - i).padStart(3, '0')}`;
        const purchaseDate = new Date(new Date(NOW).setDate(NOW.getDate() - (365 - i*1.4)));
        const registrationDate = new Date(new Date(purchaseDate).setDate(purchaseDate.getDate() + 5));
        const warrantyEndDate = new Date(new Date(purchaseDate).setFullYear(purchaseDate.getFullYear() + (i % 3 === 0 ? 1 : 2) ));
        
        const activityLog: ActivityLogEntry[] = [{
            id: `log-${id}-create`,
            timestamp: registrationDate.toISOString(),
            user: 'Alice Johnson',
            action: 'Aset Dicatat',
            details: 'Aset baru dicatat ke dalam sistem.'
        }];
        
        let status: AssetStatus = AssetStatus.IN_STORAGE;
        let condition: AssetCondition = AssetCondition.BRAND_NEW;
        let currentUser: string | null = 'Gudang Inventori';
        let location: string | null = 'Gudang Inventori';
        let isDismantled = false;
        let dismantleInfo: Asset['dismantleInfo'] = undefined;

        const templateCategory = initialAssetCategories.find(c => c.name === template.category);
        const templateType = templateCategory?.types.find(t => t.name === template.type);

        let serialNumber: string | undefined;
        if (templateType?.trackingMethod !== 'bulk') {
            serialNumber = `${template.brand.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        }


        // --- Logic for Status & Allocation ---
        const decision = Math.random();
        if (decision < 0.6) status = AssetStatus.IN_USE;
        else if (decision < 0.65) status = AssetStatus.DAMAGED;

        if (status === AssetStatus.IN_USE) {
            if (template.category === 'Perangkat Pelanggan (CPE)' && activeCustomers.length > 0) {
                 // 70% chance to be installed at customer
                 if (Math.random() < 0.7) {
                    const customer = activeCustomers[i % activeCustomers.length];
                    currentUser = customer.id;
                    location = `Terpasang di Pelanggan ${customer.name}`;
                    const installDate = new Date(new Date(registrationDate).setDate(registrationDate.getDate() + 7));
                    activityLog.push({ id: `log-${id}-install`, timestamp: installDate.toISOString(), user: 'Sistem', action: 'Instalasi Pelanggan', details: `Aset dipasang untuk pelanggan ${customer.name}.`, referenceId: `INSTALL-${id}` });
                 }
            } else if (template.category === 'Alat Kerja Lapangan' && engineerUsers.length > 0) {
                currentUser = engineerUsers[i % engineerUsers.length];
                location = `Digunakan oleh ${currentUser}`;
            } else if (template.category === 'Aset Kantor' && (nocUsers.length > 0 || csUsers.length > 0)) {
                currentUser = i % 2 === 0 ? nocUsers[i % nocUsers.length] : csUsers[i % csUsers.length];
                location = `Digunakan oleh ${currentUser}`;
            }
             // For IN_USE assets assigned to staff, create a handover record
            if (currentUser && !currentUser.startsWith('TMI-')) {
                const handoverDate = new Date(new Date(registrationDate).setDate(registrationDate.getDate() + 2));
                const handoverId = `HO-MOCK-${id}`;
                
                const docNumber = generateDocumentNumber('HO', allHandovers, handoverDate);

                activityLog.push({ id: `log-${id}-handover`, timestamp: handoverDate.toISOString(), user: 'Alice Johnson', action: 'Serah Terima Internal', details: `Aset diserahkan kepada ${currentUser}.`, referenceId: handoverId });
                allHandovers.push({
                    id: handoverId,
                    docNumber,
                    handoverDate: handoverDate.toISOString().split('T')[0],
                    menyerahkan: 'Alice Johnson',
                    penerima: currentUser,
                    mengetahui: 'John Doe',
                    woRoIntNumber: `INT-${id}`,
                    items: [{ id: 1, assetId: id, itemName: template.name, itemTypeBrand: template.brand, conditionNotes: 'Kondisi baik', quantity: 1, checked: true }],
                    status: ItemStatus.COMPLETED
                });
            }
        }
        
        // --- Logic for Dismantled Assets ---
        if (i > 200 && template.category === 'Perangkat Pelanggan (CPE)') {
            const customer = activeCustomers[(i - 200) % activeCustomers.length];
            status = AssetStatus.IN_STORAGE;
            condition = AssetCondition.USED_OKAY;
            isDismantled = true;
            location = 'Gudang Inventori';
            currentUser = null;
            const dismantleDate = new Date(new Date(NOW).setDate(NOW.getDate() - Math.floor(Math.random() * 30)));
            const dismantleId = `DSM-MOCK-${id}`;
            dismantleInfo = { customerId: customer.id, customerName: customer.name, dismantleDate: dismantleDate.toISOString().split('T')[0], dismantleId };
            activityLog.push({ id: `log-${id}-dismantle`, timestamp: dismantleDate.toISOString(), user: 'Sistem', action: 'Dismantle dari Pelanggan', details: `Aset ditarik dari pelanggan ${customer.name}.`, referenceId: dismantleId });

            const dismantleStatus = (Math.random() < 0.4) ? ItemStatus.IN_PROGRESS : ItemStatus.COMPLETED;
            const acknowledger = dismantleStatus === ItemStatus.COMPLETED ? 'Alice Johnson' : null;
            
            const docNumber = generateDocumentNumber('DSM', allDismantles, dismantleDate);

            allDismantles.push({
                id: dismantleId,
                docNumber: docNumber,
                requestNumber: poNumber,
                assetId: id,
                assetName: template.name,
                dismantleDate: dismantleDate.toISOString().split('T')[0],
                technician: engineerUsers[i % engineerUsers.length],
                customerId: customer.id,
                customerName: customer.name,
                customerAddress: customer.address,
                retrievedCondition: AssetCondition.USED_OKAY,
                notes: 'Penarikan karena pelanggan berhenti langganan.',
                acknowledger: acknowledger,
                status: dismantleStatus,
                attachments: []
            });
        }

        allAssets.push({
            id, name: template.name, category: template.category, type: template.type, brand: template.brand,
            serialNumber,
            macAddress: `00:0A:95:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}:${Math.floor(Math.random()*255).toString(16).padStart(2,'0').toUpperCase()}`,
            registrationDate: registrationDate.toISOString().split('T')[0],
            recordedBy: 'Alice Johnson',
            purchaseDate: purchaseDate.toISOString().split('T')[0],
            purchasePrice: template.price,
            vendor: VENDORS[i % VENDORS.length],
            poNumber,
            invoiceNumber: `INV/${VENDORS[i % VENDORS.length].slice(0,3).toUpperCase()}/${purchaseDate.getFullYear()}/${i+1}`,
            warrantyEndDate: warrantyEndDate.toISOString().split('T')[0],
            location,
            locationDetail: location === 'Gudang Inventori' ? `Rak ${String.fromCharCode(65 + (i % 5))}-${(i % 10) + 1}` : null,
            currentUser,
            status,
            condition,
            woRoIntNumber: `REG-${id}`,
            notes: isDismantled ? `Aset bekas dari pelanggan ${dismantleInfo?.customerName}.` : null,
            attachments: [],
            activityLog,
            isDismantled,
            dismantleInfo,
            lastModifiedBy: null,
            lastModifiedDate: null,
        });
    }
};

generateMockAssets();
export const mockAssets: Asset[] = allAssets;
export const mockHandovers: Handover[] = allHandovers;
export const mockDismantles: Dismantle[] = allDismantles;

// 6. REQUESTS
export const initialMockRequests: Request[] = Array.from({ length: REQUEST_COUNT }, (_, i) => {
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
    
    // Make some requests high value for testing tiered approval
    if (i % 10 === 0 && requestedModelTemplate.price < 5000000) {
        request.items[0].quantity = 5;
        request.totalValue = requestedModelTemplate.price * 5;
    }
     if (i % 15 === 0) {
        request.totalValue = 12000000; // Force a high-value request
    }


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

    // Add specific examples for new disposition features
    if (i === 5) { // Example for an acknowledged progress request
        request.status = ItemStatus.PURCHASING;
        request.progressUpdateRequest = {
            requestedBy: 'John Doe',
            requestDate: new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 2)).toISOString(),
            isAcknowledged: true,
            acknowledgedBy: 'Brian Adams',
            acknowledgedDate: new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 3)).toISOString()
        };
    }

    if (i === 10) { // Example for a pending progress request
        request.status = ItemStatus.IN_DELIVERY;
        request.progressUpdateRequest = {
            requestedBy: 'John Doe',
            requestDate: new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 4)).toISOString(),
            isAcknowledged: false,
        };
    }

    if (i === 15) { // Example for CEO Prioritization
        request.status = ItemStatus.APPROVED;
        request.isPrioritizedByCEO = true;
        request.ceoDispositionDate = new Date(new Date(approvalDate).setDate(approvalDate.getDate() + 2)).toISOString();
    }
    
    if (request.id === 'REQ-118') { // Example for Follow Up
        request.lastFollowUpAt = new Date(new Date().setHours(NOW.getHours() - 1)).toISOString();
    }
    
    if (request.id === 'REQ-119') { // Example for CEO Follow up
        request.status = ItemStatus.LOGISTIC_APPROVED;
        request.logisticApprover = 'Brian Adams';
        request.logisticApprovalDate = new Date().toISOString();
        request.ceoFollowUpSent = true;
    }


    return request;
});

// FIX: Change mock loan requests to use 'items' array instead of 'assetId' and 'assetName'
export const mockLoanRequests: LoanRequest[] = [
    {
        id: 'LREQ-001',
        requester: 'Citra Lestari',
        division: 'Teknisi',
        items: [{
            id: 1,
            itemName: 'Laptop ThinkPad T480',
            brand: 'Lenovo',
            quantity: 1,
            returnDate: new Date(new Date(NOW).setDate(NOW.getDate() + 5)).toISOString().split('T')[0],
        }],
        requestDate: new Date(new Date(NOW).setDate(NOW.getDate() - 2)).toISOString(),
        status: LoanRequestStatus.PENDING,
        notes: 'Dibutuhkan untuk pengerjaan proyek klien di luar kantor selama seminggu.'
    },
    {
        id: 'LREQ-002',
        requester: 'Manager NOC',
        division: 'NOC',
        items: [{
            id: 1,
            itemName: 'OTDR AQ7280',
            brand: 'Yokogawa',
            quantity: 1,
            returnDate: new Date(new Date(NOW).setDate(NOW.getDate() - 1)).toISOString().split('T')[0],
        }],
        requestDate: new Date(new Date(NOW).setDate(NOW.getDate() - 5)).toISOString(),
        status: LoanRequestStatus.RETURNED,
        approver: 'Alice Johnson',
        approvalDate: new Date(new Date(NOW).setDate(NOW.getDate() - 4)).toISOString(),
        actualReturnDate: new Date(new Date(NOW).setDate(NOW.getDate() - 1)).toISOString(),
        handoverId: 'HO-LREQ-002',
// FIX: Added missing 'notes' property.
        notes: null
    },
    {
        id: 'LREQ-003',
        requester: 'Citra Lestari',
        division: 'Teknisi',
        items: [{
            id: 1,
            itemName: 'Fusion Splicer 90S',
            brand: 'Fujikura',
            quantity: 1,
            returnDate: new Date(new Date(NOW).setDate(NOW.getDate() - 2)).toISOString().split('T')[0],
        }],
        requestDate: new Date(new Date(NOW).setDate(NOW.getDate() - 10)).toISOString(),
        status: LoanRequestStatus.OVERDUE,
        approver: 'Alice Johnson',
        approvalDate: new Date(new Date(NOW).setDate(NOW.getDate() - 9)).toISOString(),
        handoverId: 'HO-LREQ-003',
// FIX: Added missing 'notes' property.
        notes: 'Pekerjaan splicing di area baru.'
    },
     {
        id: 'LREQ-004',
        requester: 'Eko Pratama',
        division: 'Teknisi',
        items: [{
            id: 1,
            itemName: 'Laptop ThinkPad T480',
            brand: 'Lenovo',
            quantity: 1,
            returnDate: new Date(new Date(NOW).setDate(NOW.getDate() + 10)).toISOString().split('T')[0],
        }],
        requestDate: new Date(new Date(NOW).setDate(NOW.getDate() - 3)).toISOString(),
        status: LoanRequestStatus.REJECTED,
        approver: 'Alice Johnson',
        approvalDate: new Date(new Date(NOW).setDate(NOW.getDate() - 3)).toISOString(),
        rejectionReason: 'Semua laptop teknisi sedang digunakan atau dalam perbaikan.',
// FIX: Added missing 'notes' property.
        notes: 'Untuk presentasi proyek.'
    },
    {
        id: 'LREQ-005',
        requester: 'Budi Santoso',
        division: 'Teknisi',
        items: [{
            id: 1,
            itemName: 'Power Meter',
            brand: 'Joinwit',
            quantity: 1,
            returnDate: null,
        }],
        requestDate: new Date(new Date(NOW).setDate(NOW.getDate() - 1)).toISOString(),
        status: LoanRequestStatus.PENDING,
        notes: 'Untuk cadangan di mobil operasional, tanggal kembali belum ditentukan.'
    }
];

export const mockMaintenances: Maintenance[] = [
    {
        id: 'MNT-001',
        docNumber: 'WO-MT-20241017-0001',
        requestNumber: 'REQ-115',
        maintenanceDate: new Date(new Date().setDate(NOW.getDate() - 5)).toISOString(),
        technician: 'Citra Lestari',
        customerId: 'TMI-1001',
        customerName: 'Ahmad Santoso',
        assets: [{ assetId: 'AST-005', assetName: 'ONT F609' }],
        problemDescription: 'Lampu LOS berkedip merah, koneksi internet terputus.',
        actionsTaken: 'Ditemukan kabel putus di dekat rumah pelanggan. Dilakukan penyambungan ulang.',
        workTypes: ['Splicing FO'],
        priority: 'Tinggi',
        status: ItemStatus.COMPLETED,
        completedBy: 'Alice Johnson',
        completionDate: new Date(new Date().setDate(NOW.getDate() - 4)).toISOString(),
        attachments: [],
        materialsUsed: [
            { itemName: 'Konektor Fast Connector SC', brand: 'Generic', quantity: 2 }
        ],
    },
    {
        id: 'MNT-002',
        docNumber: 'WO-MT-20241018-0001',
        maintenanceDate: new Date(new Date().setDate(NOW.getDate() - 2)).toISOString(),
        technician: 'Hadi Gunawan',
        customerId: 'TMI-1015',
        customerName: 'Gita Wijaya',
        assets: [{ assetId: 'AST-012', assetName: 'Router WiFi Archer C6' }],
        problemDescription: 'Konektor RJ45 di ujung kabel LAN ke router rusak (patah).',
        actionsTaken: 'Kabel dipotong dan dipasang konektor RJ45 yang baru.',
        workTypes: ['Ganti Konektor'],
        priority: 'Rendah',
        status: ItemStatus.IN_PROGRESS,
        attachments: [],
        materialsUsed: [
            { itemName: 'Kabel UTP Cat6 305m', brand: 'Belden', quantity: 1 }
        ],
    },
    {
        id: 'MNT-003',
        docNumber: 'WO-MT-20241019-0001',
        maintenanceDate: new Date(new Date().setDate(NOW.getDate() - 1)).toISOString(),
        technician: 'Citra Lestari',
        customerId: 'TMI-1002',
        customerName: 'Budi Wijaya',
        assets: [{ assetId: 'AST-008', assetName: 'ONT HG8245H' }],
        problemDescription: 'Perangkat ONT mati total setelah tersambar petir.',
        actionsTaken: 'ONT yang rusak ditarik dan diganti dengan unit baru dari stok gudang.',
        workTypes: ['Ganti Perangkat'],
        priority: 'Sedang',
        status: ItemStatus.COMPLETED,
        completedBy: 'Alice Johnson',
        completionDate: new Date(new Date().setDate(NOW.getDate() - 1)).toISOString(),
        attachments: [],
        retrievedAssetCondition: AssetCondition.MAJOR_DAMAGE,
        replacementAssetId: 'AST-248', // A new ONT from storage
    },
    {
        id: 'MNT-004',
        docNumber: 'WO-MT-20241020-0001',
        maintenanceDate: new Date().toISOString(),
        technician: 'Eko Pratama',
        customerId: 'TMI-1001',
        customerName: 'Ahmad Santoso',
        assets: [
            { assetId: 'AST-005', assetName: 'ONT F609' },
            { assetId: 'AST-021', assetName: 'Router WiFi AX10' }
        ],
        problemDescription: 'Pemeriksaan rutin dan pembersihan perangkat.',
        actionsTaken: 'Semua perangkat dibersihkan dari debu, koneksi diperiksa. Semua berfungsi normal.',
        workTypes: ['Pemeriksaan Rutin'],
        priority: 'Rendah',
        status: ItemStatus.COMPLETED,
        completedBy: 'Eko Pratama',
        completionDate: new Date().toISOString(),
        attachments: [],
    },
    {
        id: 'MNT-005',
        docNumber: 'WO-MT-20241021-0001',
        maintenanceDate: new Date().toISOString(),
        technician: 'Hadi Gunawan',
        customerId: 'TMI-1015',
        customerName: 'Gita Wijaya',
        problemDescription: 'Kabel dropcore putus akibat galian.',
        actionsTaken: 'Menarik kabel dropcore baru sepanjang 50 meter dan melakukan splicing ulang.',
        workTypes: ['Tarik Ulang Kabel', 'Splicing FO'],
        priority: 'Tinggi',
        status: ItemStatus.COMPLETED,
        completedBy: 'Hadi Gunawan',
        completionDate: new Date().toISOString(),
        attachments: [],
        materialsUsed: [
            { itemName: 'Kabel Dropcore 1 Core 150m', brand: 'FiberHome', quantity: 50 },
            { itemName: 'Konektor Fast Connector SC', brand: 'Generic', quantity: 4 }
        ],
    }
];


// 7. NOTIFICATIONS
export const mockNotifications: Notification[] = [
    {
        id: 'notif-1',
        recipientId: 2, // Brian Adams (Admin Purchase)
        actorName: 'Citra Lestari',
        type: 'FOLLOW_UP',
        isRead: false,
        timestamp: new Date(new Date().setHours(NOW.getHours() - 1)).toISOString(),
        referenceId: 'REQ-118',
    },
    {
        id: 'notif-2',
        recipientId: 2, // Brian Adams (Admin Purchase)
        actorName: 'John Doe',
        type: 'CEO_DISPOSITION',
        isRead: false,
        timestamp: new Date(new Date().setHours(NOW.getHours() - 2)).toISOString(),
        referenceId: 'REQ-105',
    },
    {
        id: 'notif-3',
        recipientId: 99, // John Doe (Super Admin)
        actorName: 'Brian Adams',
        type: 'PROGRESS_FEEDBACK',
        isRead: true,
        timestamp: new Date(new Date().setDate(NOW.getDate() - 1)).toISOString(),
        referenceId: 'REQ-115',
        message: 'Memberi update pada #REQ-115: Status baru adalah "Proses Pengadaan"',
    },
    {
        id: 'notif-4',
        recipientId: 2, // Brian Adams (Admin Purchase)
        actorName: 'John Doe',
        type: 'PROGRESS_UPDATE_REQUEST',
        isRead: false,
        timestamp: new Date(new Date().setMinutes(NOW.getMinutes() - 30)).toISOString(),
        referenceId: 'REQ-110',
    },
     {
        id: 'notif-5',
        recipientId: 3, // Find a staff member
        actorName: 'Brian Adams',
        type: 'REQUEST_REJECTED',
        isRead: false,
        timestamp: new Date(new Date().setHours(NOW.getHours() - 4)).toISOString(),
        referenceId: 'REQ-114',
    }
];
