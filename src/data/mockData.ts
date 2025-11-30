

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
    HandoverItem, 
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
    LoanItem, 
    MaintenanceMaterial, 
    MaintenanceReplacement, 
    AssetReturn
} from '../types'; 
import { generateDocumentNumber } from '../utils/documentNumberGenerator'; 
import { 
    ALL_PERMISSION_KEYS, 
    STAFF_PERMISSIONS, 
    LEADER_PERMISSIONS, 
    ADMIN_LOGISTIK_PERMISSIONS, 
    ADMIN_PURCHASE_PERMISSIONS, 
    SUPER_ADMIN_PERMISSIONS 
} from '../utils/permissions'; 

// --- CONFIGURATION --- 
const USER_COUNT = 50; 
const ASSET_COUNT = 250; 
const REQUEST_COUNT = 120; 
const CUSTOMER_COUNT = 80; 
const LOAN_REQUEST_COUNT = 50; 
const INSTALLATION_COUNT = 40; 
const MAINTENANCE_COUNT = 60; 
const DISMANTLE_COUNT = 25; 
const NOW = new Date(); 

// --- PERMISSION PRESETS are now imported from src/utils/permissions.ts ---

// --- DATA POOLS --- 
const FIRST_NAMES = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indra', 'Joko', 'Kartika', 'Lina', 'Mira', 'Nadia', 'Oscar']; 
const LAST_NAMES = ['Santoso', 'Wijaya', 'Lestari', 'Setiawan', 'Pratama', 'Nugroho', 'Wahyuni', 'Gunawan', 'Saputra', 'Rahayu', 'Kusuma', 'Hidayat']; 
const VENDORS = ['PT. Jaringan Nusantara', 'CV. Sinar Teknik', 'Optik Prima Distribusi', 'Solusi Koneksi Cepat', 'Mega IT Store']; 
const STREET_NAMES = ['Jl. Merdeka', 'Jl. Sudirman', 'Jl. Pahlawan', 'Jl. Gatot Subroto', 'Jl. Diponegoro', 'Jl. Asia Afrika', 'Jl. Kartini']; 
const ISP_PACKAGES = ['Home 30Mbps', 'Home 50Mbps', 'Home 100Mbps', 'Business 200Mbps', 'Business 500Mbps']; 
const MAINTENANCE_PROBLEMS = ['Internet lambat', 'Koneksi sering putus', 'Perangkat ONT mati', 'Pindah titik router', 'Kabel FO putus', 'Gangguan jaringan lokal', 'Perangkat tidak menyala']; 
const MAINTENANCE_ACTIONS = ['Restart ONT', 'Ganti patchcord', 'Splicing ulang kabel dropcore', 'Ganti adaptor', 'Upgrade firmware router', 'Konfigurasi ulang router', 'Cek instalasi kabel']; 


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
export let mockAssets: Asset[] = []; 
export let mockHandovers: Handover[] = []; 
export let mockDismantles: Dismantle[] = []; 
export let initialMockRequests: Request[] = []; 
export let mockMaintenances: Maintenance[] = []; 
export let mockInstallations: Installation[] = []; 
export let mockNotifications: Notification[] = []; 
export let mockLoanRequests: LoanRequest[] = []; 
export let mockReturns: AssetReturn[] = [];

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

    Array.from({ length: ASSET_COUNT }).forEach((_, i) => { 
        const template = assetTemplates[i % assetTemplates.length]; 
        const regDate = new Date(new Date(NOW).setDate(NOW.getDate() - (i * 2))); 
        const user = initialMockUsers[i % initialMockUsers.length]; 
        
        const statuses = [AssetStatus.IN_STORAGE, AssetStatus.IN_USE, AssetStatus.IN_STORAGE, AssetStatus.IN_STORAGE, AssetStatus.DAMAGED, AssetStatus.UNDER_REPAIR, AssetStatus.OUT_FOR_REPAIR]; 
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
            location: status === AssetStatus.IN_STORAGE ? 'Gudang Inventori' : `Digunakan oleh: ${user.name}`, 
            currentUser: status === AssetStatus.IN_USE ? user.name : null, 
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
    
    // Generate some handovers for COMPLETED requests 
    const completedRequests = initialMockRequests.filter(r => 
        r.status === ItemStatus.COMPLETED || r.status === ItemStatus.AWAITING_HANDOVER 
    ); 

    completedRequests.slice(0, 20).forEach((req, i) => { 
        const assetsForReq = mockAssets.filter(a => a.poNumber === req.id); 
        if (assetsForReq.length > 0) { 
            const handoverDate = new Date(req.requestDate); 
            handoverDate.setDate(handoverDate.getDate() + 5); 

            const newDocNumber = generateDocumentNumber('HO-RO', handovers, handoverDate); 
            const newHandover: Handover = { 
                id: `HO-${String(i + 1).padStart(3, '0')}`, 
                docNumber: newDocNumber, 
                handoverDate: handoverDate.toISOString().split('T')[0], 
                menyerahkan: 'Alice Johnson', 
                penerima: req.requester, 
                mengetahui: 'John Doe', 
                woRoIntNumber: req.id, 
                items: assetsForReq.map(asset => ({ 
                    id: Date.now() + Math.random(), 
                    assetId: asset.id, 
                    itemName: asset.name, 
                    itemTypeBrand: asset.brand, 
                    conditionNotes: 'Kondisi Baru', 
                    quantity: 1, 
                    checked: true, 
                })), 
                status: ItemStatus.COMPLETED, 
            }; 
            handovers.push(newHandover); 
        } 
    }); 
    
    mockHandovers = handovers; 
}; 
generateAssetsHandoversDismantles(); 


const generateCustomerOperations = () => { 
    const installations: Installation[] = []; 
    const maintenances: Maintenance[] = []; 
    const dismantles: Dismantle[] = []; 
    const technicians = initialMockUsers.filter(u => u.divisionId === 3); 
    const installableAssetTypes = initialAssetCategories.filter(c => c.isCustomerInstallable).flatMap(c => c.types.filter(t => t.trackingMethod !== 'bulk')); 
    const installableMaterialTypes = initialAssetCategories.filter(c => c.isCustomerInstallable).flatMap(c => c.types.filter(t => t.trackingMethod === 'bulk')); 

    // 1. Installations 
    for (let i = 0; i < INSTALLATION_COUNT; i++) { 
        const customer = mockCustomers[i % mockCustomers.length]; 
        const installDate = new Date(new Date(customer.installationDate).setHours(NOW.getHours() - i * 24)); 
        const assetsToInstall: InstallationAsset[] = []; 
        let installableAssets = mockAssets.filter(a => a.status === AssetStatus.IN_STORAGE && installableAssetTypes.some(t => t.name === a.type)); 
        
        if (installableAssets.length >= 2) { 
            const assetsForThisInstall = installableAssets.slice(0, 2); 
            assetsForThisInstall.forEach(asset => { 
                assetsToInstall.push({ assetId: asset.id, assetName: asset.name, serialNumber: asset.serialNumber }); 
                const assetIndex = mockAssets.findIndex(a => a.id === asset.id); 
                if (assetIndex !== -1) { 
                    mockAssets[assetIndex].status = AssetStatus.IN_USE; 
                    mockAssets[assetIndex].currentUser = customer.id; 
                    mockAssets[assetIndex].location = `Terpasang di: ${customer.address}`; 
                } 
            }); 
        } 

        const materialsToUse: InstallationMaterial[] = []; 
        const customerMaterialUpdate: InstalledMaterial[] = []; 
        for(let j=0; j < 2; j++) { 
            const materialType = installableMaterialTypes[(i+j) % installableMaterialTypes.length]; 
            const materialItem = materialType.standardItems![0]; 
            const quantity = Math.floor(Math.random() * 50) + 10; 
            materialsToUse.push({ itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs' }); 
            customerMaterialUpdate.push({ itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs', installationDate: installDate.toISOString() }); 
        } 

        const newInstallation: Installation = { 
            id: `INST-${String(i + 1).padStart(3, '0')}`, 
            docNumber: generateDocumentNumber('INST', installations, installDate), 
            installationDate: installDate.toISOString(), 
            technician: technicians[i % technicians.length].name, 
            customerId: customer.id, 
            customerName: customer.name, 
            assetsInstalled: assetsToInstall, 
            materialsUsed: materialsToUse, 
            status: ItemStatus.COMPLETED, 
        }; 
        installations.push(newInstallation); 

        // Update customer materials 
        const customerIndex = mockCustomers.findIndex(c => c.id === customer.id); 
        if (customerIndex !== -1) { 
            const existingMaterials = mockCustomers[customerIndex].installedMaterials || []; 
            customerMaterialUpdate.forEach(newMat => { 
                const existingMatIndex = existingMaterials.findIndex(em => em.itemName === newMat.itemName && em.brand === newMat.brand); 
                if (existingMatIndex > -1) { 
                    existingMaterials[existingMatIndex].quantity += newMat.quantity; 
                } else { 
                    existingMaterials.push(newMat); 
                } 
            }); 
            mockCustomers[customerIndex].installedMaterials = existingMaterials; 
        } 
    } 

    // 2. Maintenances 
    for (let i = 0; i < MAINTENANCE_COUNT; i++) { 
        const customer = mockCustomers[(i + INSTALLATION_COUNT) % mockCustomers.length]; 
        const customerAssets = mockAssets.filter(a => a.currentUser === customer.id); 
        if (customerAssets.length === 0) continue; 
        
        const maintenanceDate = new Date(new Date(customer.installationDate).setDate(new Date(customer.installationDate).getDate() + i * 7)); 
        
        const PRIORITIES: ('Tinggi' | 'Sedang' | 'Rendah')[] = ['Tinggi', 'Sedang', 'Rendah', 'Sedang']; 
        const ALL_WORK_TYPES = ['Ganti Perangkat', 'Splicing FO', 'Tarik Ulang Kabel', 'Ganti Konektor', 'Backup Sementara', 'Lainnya', 'Pembersihan Perangkat', 'Upgrade Firmware']; 

        const newMaintenance: Maintenance = { 
            id: `MNT-${String(i + 1).padStart(3, '0')}`, 
            docNumber: generateDocumentNumber('MNT', maintenances, maintenanceDate), 
            maintenanceDate: maintenanceDate.toISOString(), 
            technician: technicians[i % technicians.length].name, 
            customerId: customer.id, 
            customerName: customer.name, 
            assets: customerAssets.slice(0,1).map(a => ({ assetId: a.id, assetName: a.name })), 
            problemDescription: MAINTENANCE_PROBLEMS[i % MAINTENANCE_PROBLEMS.length], 
            actionsTaken: MAINTENANCE_ACTIONS[i % MAINTENANCE_ACTIONS.length], 
            status: ItemStatus.COMPLETED, 
            attachments: i % 4 === 0 ? [{ id: Date.now(), name: `foto_kondisi_${i}.jpg`, url: '#', type: 'image' }] : [], 
            priority: PRIORITIES[i % PRIORITIES.length], 
            workTypes: [ALL_WORK_TYPES[i % ALL_WORK_TYPES.length]], 
            completedBy: technicians[i % technicians.length].name, 
            completionDate: new Date(maintenanceDate.getTime() + (2 * 60 * 60 * 1000)).toISOString(), 
        }; 

        // Scenarios 
        // i < 20: Device Replacement ONLY 
        if (i < 20 && customerAssets.length > 0) { 
            const oldAsset = customerAssets[0]; 
            const replacementAsset = mockAssets.find(a => a.status === AssetStatus.IN_STORAGE && a.name === oldAsset.name && a.brand === oldAsset.brand && a.id !== oldAsset.id); 
            if (replacementAsset) { 
                newMaintenance.replacements = [{ oldAssetId: oldAsset.id, retrievedAssetCondition: AssetCondition.MINOR_DAMAGE, newAssetId: replacementAsset.id }]; 
                if(newMaintenance.workTypes) newMaintenance.workTypes.push('Ganti Perangkat'); 
                
                const oldAssetIndex = mockAssets.findIndex(a => a.id === oldAsset.id); 
                if (oldAssetIndex !== -1) { 
                    mockAssets[oldAssetIndex].status = AssetStatus.DAMAGED; 
                    mockAssets[oldAssetIndex].currentUser = null; 
                    mockAssets[oldAssetIndex].location = 'Gudang Inventori'; 
                } 

                const newAssetIndex = mockAssets.findIndex(a => a.id === replacementAsset.id); 
                if (newAssetIndex !== -1) { 
                    mockAssets[newAssetIndex].status = AssetStatus.IN_USE; 
                    mockAssets[newAssetIndex].currentUser = customer.id; 
                    mockAssets[newAssetIndex].location = `Terpasang di: ${customer.address}`; 
                } 
            } 
        } 
        // 20 <= i < 40: Material Usage ONLY 
        else if (i >= 20 && i < 40) { 
            const materialType = installableMaterialTypes[i % installableMaterialTypes.length]; 
            if (materialType && materialType.standardItems && materialType.standardItems.length > 0) { 
                const materialItem = materialType.standardItems![0]; 
                const quantity = Math.floor(Math.random() * 10) + 1; 
                newMaintenance.materialsUsed = [{ itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs' }]; 
                
                const customerIndex = mockCustomers.findIndex(c => c.id === customer.id); 
                if (customerIndex !== -1) { 
                    const existingMaterials = mockCustomers[customerIndex].installedMaterials || []; 
                    const matToUpdate = { itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs', installationDate: maintenanceDate.toISOString() }; 
                    const existingMatIndex = existingMaterials.findIndex(em => em.itemName === matToUpdate.itemName && em.brand === matToUpdate.brand); 
                    if (existingMatIndex > -1) { 
                        existingMaterials[existingMatIndex].quantity += matToUpdate.quantity; 
                    } else { 
                        existingMaterials.push(matToUpdate); 
                    } 
                    mockCustomers[customerIndex].installedMaterials = existingMaterials; 
                } 
            } 
        } 
        // 40 <= i < 60: BOTH Replacement AND Material Usage 
        else if (i >= 40) { 
            if (customerAssets.length > 0) { 
                 const oldAsset = customerAssets[0]; 
                 const replacementAsset = mockAssets.find(a => a.status === AssetStatus.IN_STORAGE && a.name === oldAsset.name && a.brand === oldAsset.brand && a.id !== oldAsset.id); 
                 if (replacementAsset) { 
                    newMaintenance.replacements = [{ oldAssetId: oldAsset.id, retrievedAssetCondition: AssetCondition.MAJOR_DAMAGE, newAssetId: replacementAsset.id }]; 
                    if(newMaintenance.workTypes) newMaintenance.workTypes.push('Ganti Perangkat'); 

                    const oldAssetIndex = mockAssets.findIndex(a => a.id === oldAsset.id); 
                    if (oldAssetIndex !== -1) { 
                        mockAssets[oldAssetIndex].status = AssetStatus.DECOMMISSIONED; 
                        mockAssets[oldAssetIndex].currentUser = null; 
                        mockAssets[oldAssetIndex].location = 'Diberhentikan'; 
                    } 

                    const newAssetIndex = mockAssets.findIndex(a => a.id === replacementAsset.id); 
                    if (newAssetIndex !== -1) { 
                        mockAssets[newAssetIndex].status = AssetStatus.IN_USE; 
                        mockAssets[newAssetIndex].currentUser = customer.id; 
                        mockAssets[newAssetIndex].location = `Terpasang di: ${customer.address}`; 
                    } 
                 } 
            } 
            const materialType = installableMaterialTypes[(i+1) % installableMaterialTypes.length]; 
            if (materialType && materialType.standardItems && materialType.standardItems.length > 0) { 
                const materialItem = materialType.standardItems![0]; 
                const quantity = Math.floor(Math.random() * 5) + 1; 
                newMaintenance.materialsUsed = [...(newMaintenance.materialsUsed || []), { itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs' }]; 
                
                const customerIndex = mockCustomers.findIndex(c => c.id === customer.id); 
                 if (customerIndex !== -1) { 
                    const existingMaterials = mockCustomers[customerIndex].installedMaterials || []; 
                    const matToUpdate = { itemName: materialItem.name, brand: materialItem.brand, quantity, unit: materialType.baseUnitOfMeasure || 'pcs', installationDate: maintenanceDate.toISOString() }; 
                    const existingMatIndex = existingMaterials.findIndex(em => em.itemName === matToUpdate.itemName && em.brand === matToUpdate.brand); 
                    if (existingMatIndex > -1) { 
                        existingMaterials[existingMatIndex].quantity += matToUpdate.quantity; 
                    } else { 
                        existingMaterials.push(matToUpdate); 
                    } 
                    mockCustomers[customerIndex].installedMaterials = existingMaterials; 
                } 
            } 
        } 
        maintenances.push(newMaintenance); 
    } 
    
    // 3. Dismantles 
    for (let i = 0; i < DISMANTLE_COUNT; i++) { 
        const assetToDismantle = mockAssets.find(a => a.status === AssetStatus.IN_USE && a.currentUser?.startsWith('TMI-')); 
        if (!assetToDismantle) continue; 
        
        const customer = mockCustomers.find(c => c.id === assetToDismantle.currentUser)!; 
        const dismantleDate = new Date(); 
        dismantleDate.setDate(dismantleDate.getDate() - (DISMANTLE_COUNT - i)); 
        
        const newDismantle: Dismantle = { 
            id: `DSM-${String(i + 1).padStart(3, '0')}`, 
            docNumber: generateDocumentNumber('DSM', dismantles, dismantleDate), 
            assetId: assetToDismantle.id, 
            assetName: assetToDismantle.name, 
            dismantleDate: dismantleDate.toISOString(), 
            technician: technicians[i % technicians.length].name, 
            customerName: customer.name, 
            customerId: customer.id, 
            customerAddress: customer.address, 
            retrievedCondition: AssetCondition.USED_OKAY, 
            notes: "Penarikan aset karena pelanggan berhenti berlangganan.", 
            status: ItemStatus.COMPLETED, 
            acknowledger: 'Alice Johnson', 
            attachments: [], 
        }; 
        dismantles.push(newDismantle); 

        const assetIndex = mockAssets.findIndex(a => a.id === assetToDismantle.id); 
        mockAssets[assetIndex].status = AssetStatus.IN_STORAGE; 
        mockAssets[assetIndex].currentUser = null; 
        mockAssets[assetIndex].location = 'Gudang Inventori'; 
        mockAssets[assetIndex].isDismantled = true; 
        mockAssets[assetIndex].dismantleInfo = { customerId: customer.id, customerName: customer.name, dismantleDate: newDismantle.dismantleDate, dismantleId: newDismantle.id }; 
    } 

    mockInstallations = installations; 
    mockMaintenances = maintenances; 
    mockDismantles = dismantles; 
}; 

const generateLoanRequests = () => { 
    const loanRequests: LoanRequest[] = []; 

    const loanableAssetTemplates = assetTemplates.filter(t => 
        ['Alat Kerja Lapangan', 'Aset Kantor'].includes(t.category) 
    ); 

    if (loanableAssetTemplates.length === 0) { 
        loanableAssetTemplates.push(...assetTemplates.filter(t => t.category === 'Perangkat Pelanggan (CPE)')); 
    } 

    for (let i = 0; i < LOAN_REQUEST_COUNT; i++) { 
        const user = initialMockUsers[i % initialMockUsers.length]; 
        const division = mockDivisions.find(d => d.id === user.divisionId)?.name || 'N/A'; 
        const requestDate = new Date(new Date(NOW).setHours(NOW.getHours() - ((LOAN_REQUEST_COUNT - i) * 8))); 

        const statuses = [LoanRequestStatus.PENDING, LoanRequestStatus.APPROVED, LoanRequestStatus.REJECTED, LoanRequestStatus.ON_LOAN, LoanRequestStatus.RETURNED, LoanRequestStatus.OVERDUE, LoanRequestStatus.AWAITING_RETURN]; 
        const status = statuses[i % statuses.length]; 

        const items: LoanItem[] = []; 
        const numItems = Math.floor(Math.random() * 2) + 1; 
        for (let j = 0; j < numItems; j++) { 
            const template = loanableAssetTemplates[(i + j) % loanableAssetTemplates.length]; 
            const returnDate = new Date(requestDate); 
            returnDate.setDate(returnDate.getDate() + (status === LoanRequestStatus.OVERDUE ? -7 : 14)); 

            items.push({ 
                id: j + 1, 
                itemName: template.name, 
                brand: template.brand, 
                quantity: 1, 
                keterangan: `Untuk pengerjaan proyek ${division}`, 
                returnDate: status !== LoanRequestStatus.REJECTED ? returnDate.toISOString().split('T')[0] : null, 
            }); 
        } 

        const loanRequest: LoanRequest = { 
            id: `LREQ-${String(LOAN_REQUEST_COUNT - i).padStart(3, '0')}`, 
            requester: user.name, 
            division, 
            requestDate: requestDate.toISOString(), 
            status, 
            items, 
            notes: `Kebutuhan mendesak untuk tim ${division}.`, 
            approver: undefined, 
            approvalDate: undefined, 
            rejectionReason: undefined, 
            assignedAssetIds: {}, 
            handoverId: undefined, 
            actualReturnDate: undefined, 
        }; 

        if ([LoanRequestStatus.APPROVED, LoanRequestStatus.ON_LOAN, LoanRequestStatus.RETURNED, LoanRequestStatus.OVERDUE, LoanRequestStatus.AWAITING_RETURN].includes(status)) { 
            loanRequest.approver = 'Alice Johnson'; 
            loanRequest.approvalDate = new Date(new Date(requestDate).setDate(requestDate.getDate() + 1)).toISOString(); 
            
            let allAssetsFound = true; 
            loanRequest.items.forEach(item => { 
                const availableAssets = mockAssets.filter(a => 
                    a.name === item.itemName && 
                    a.brand === item.brand && 
                    a.status === AssetStatus.IN_STORAGE 
                ); 

                if (availableAssets.length >= item.quantity) { 
                    const assetsToAssign = availableAssets.slice(0, item.quantity); 
                    loanRequest.assignedAssetIds![item.id] = assetsToAssign.map(a => a.id); 

                    if ([LoanRequestStatus.ON_LOAN, LoanRequestStatus.OVERDUE, LoanRequestStatus.AWAITING_RETURN].includes(status)) { 
                        assetsToAssign.forEach(assignedAsset => { 
                            const assetIndex = mockAssets.findIndex(a => a.id === assignedAsset.id); 
                            if (assetIndex !== -1) { 
                                mockAssets[assetIndex].status = AssetStatus.IN_USE; 
                                mockAssets[assetIndex].currentUser = loanRequest.requester; 
                                mockAssets[assetIndex].location = `Dipinjam oleh: ${loanRequest.requester}`; 
                            } 
                        }); 
                    } 
                } else { 
                    allAssetsFound = false; 
                } 
            }); 

            if (allAssetsFound && (status === LoanRequestStatus.ON_LOAN || status === LoanRequestStatus.RETURNED)) { 
                 const handoverDate = new Date(loanRequest.approvalDate!); 
                 handoverDate.setHours(handoverDate.getHours() + 2); 
                 
                 const handoverDocNumber = generateDocumentNumber('HO-LN', mockHandovers, handoverDate); 
                 const handoverId = `HO-${String(mockHandovers.length + 1).padStart(3, '0')}`; 

                 const handoverItems: HandoverItem[] = []; 
                 for (const itemId in loanRequest.assignedAssetIds) { 
                     const assetIds = loanRequest.assignedAssetIds[itemId]; 
                     assetIds.forEach(assetId => { 
                         const asset = mockAssets.find(a => a.id === assetId); 
                         if (asset) { 
                             handoverItems.push({ 
                                 id: Date.now() + Math.random(), 
                                 assetId: asset.id, 
                                 itemName: asset.name, 
                                 itemTypeBrand: asset.brand, 
                                 conditionNotes: 'Kondisi baik saat dipinjamkan', 
                                 quantity: 1, 
                                 checked: true, 
                             }); 
                         } 
                     }); 
                 } 

                 const newHandover: Handover = { 
                     id: handoverId, 
                     docNumber: handoverDocNumber, 
                     handoverDate: handoverDate.toISOString().split('T')[0], 
                     menyerahkan: 'Alice Johnson', 
                     penerima: loanRequest.requester, 
                     mengetahui: 'John Doe', 
                     woRoIntNumber: loanRequest.id, 
                     items: handoverItems, 
                     status: ItemStatus.COMPLETED, 
                 }; 
                 mockHandovers.push(newHandover); 
                 loanRequest.handoverId = handoverId; 
            } 

            if (status === LoanRequestStatus.RETURNED) { 
                loanRequest.actualReturnDate = new Date().toISOString(); 
            } 
        } 
        
        if (status === LoanRequestStatus.REJECTED) { 
            loanRequest.approver = 'Alice Johnson'; 
            loanRequest.approvalDate = new Date(new Date(requestDate).setDate(requestDate.getDate() + 1)).toISOString(); 
            loanRequest.rejectionReason = 'Aset tidak tersedia untuk jangka waktu yang diminta.'; 
        } 

        loanRequests.push(loanRequest); 
    } 
    mockLoanRequests = loanRequests; 
}; 

const generateNotifications = () => { 
    // This can be populated with more complex logic later if needed 
    mockNotifications = []; 
}; 

const setupTestReturnData = () => {
    const citra = initialMockUsers.find(u => u.email === 'citra.lestari0@triniti.com');
    if (!citra) return;

    // --- Scenario 1: Active Loan (Fusion Splicer) ---
    const splicerAsset = mockAssets.find(a => a.name.includes('Fusion Splicer') && a.status === AssetStatus.IN_STORAGE);
    if (splicerAsset) {
        const requestDate = new Date();
        requestDate.setDate(requestDate.getDate() - 10);
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 10);

        const activeLoan: LoanRequest = {
            id: 'LREQ-CITRA-001',
            requester: citra.name,
            division: 'Teknisi',
            requestDate: requestDate.toISOString(),
            status: LoanRequestStatus.ON_LOAN,
            items: [{ id: 1, itemName: splicerAsset.name, brand: splicerAsset.brand, quantity: 1, returnDate: returnDate.toISOString().split('T')[0] }],
            notes: 'Peminjaman untuk perbaikan darurat.',
            approver: 'Alice Johnson',
            approvalDate: new Date(requestDate.getTime() + 3600000).toISOString(),
            assignedAssetIds: { 1: [splicerAsset.id] },
        };

        const handoverId = `HO-CITRA-001`;
        activeLoan.handoverId = handoverId;
        const newHandover: Handover = {
            id: handoverId,
            docNumber: generateDocumentNumber('HO-LN', mockHandovers, requestDate),
            handoverDate: activeLoan.approvalDate!,
            menyerahkan: 'Alice Johnson',
            penerima: citra.name,
            mengetahui: 'John Doe',
            woRoIntNumber: activeLoan.id,
            items: [{ id: 1, assetId: splicerAsset.id, itemName: splicerAsset.name, itemTypeBrand: splicerAsset.brand, conditionNotes: 'Baik', quantity: 1, checked: true }],
            status: ItemStatus.COMPLETED
        };
        mockHandovers.push(newHandover);

        const splicerIndex = mockAssets.findIndex(a => a.id === splicerAsset.id);
        mockAssets[splicerIndex] = { ...splicerAsset, status: AssetStatus.IN_USE, currentUser: citra.name, location: `Dipinjam oleh: ${citra.name}` };
        
        mockLoanRequests.unshift(activeLoan);
    }

    // --- Scenario 2: Overdue Loan (OTDR) ---
    const otdrAsset = mockAssets.find(a => a.name.includes('OTDR') && a.status === AssetStatus.IN_STORAGE);
    if (otdrAsset) {
        const requestDate = new Date();
        requestDate.setDate(requestDate.getDate() - 20);
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() - 5); // Overdue by 5 days

        const overdueLoan: LoanRequest = {
            id: 'LREQ-CITRA-002',
            requester: citra.name,
            division: 'Teknisi',
            requestDate: requestDate.toISOString(),
            status: LoanRequestStatus.OVERDUE,
            items: [{ id: 1, itemName: otdrAsset.name, brand: otdrAsset.brand, quantity: 1, returnDate: returnDate.toISOString().split('T')[0] }],
            notes: 'Peminjaman untuk audit jaringan.',
            approver: 'Alice Johnson',
            approvalDate: new Date(requestDate.getTime() + 3600000).toISOString(),
            assignedAssetIds: { 1: [otdrAsset.id] },
        };
        
        const handoverId = `HO-CITRA-002`;
        overdueLoan.handoverId = handoverId;
        const newHandover: Handover = {
            id: handoverId,
            docNumber: generateDocumentNumber('HO-LN', mockHandovers, requestDate),
            handoverDate: overdueLoan.approvalDate!,
            menyerahkan: 'Alice Johnson',
            penerima: citra.name,
            mengetahui: 'John Doe',
            woRoIntNumber: overdueLoan.id,
            items: [{ id: 1, assetId: otdrAsset.id, itemName: otdrAsset.name, itemTypeBrand: otdrAsset.brand, conditionNotes: 'Baik', quantity: 1, checked: true }],
            status: ItemStatus.COMPLETED
        };
        mockHandovers.push(newHandover);

        const otdrIndex = mockAssets.findIndex(a => a.id === otdrAsset.id);
        mockAssets[otdrIndex] = { ...otdrAsset, status: AssetStatus.IN_USE, currentUser: citra.name, location: `Dipinjam oleh: ${citra.name}` };
        
        mockLoanRequests.unshift(overdueLoan);
    }
};

generateAssetsHandoversDismantles(); 
generateCustomerOperations(); 
generateLoanRequests(); 
generateNotifications();
setupTestReturnData(); // Add specific test data for Citra
