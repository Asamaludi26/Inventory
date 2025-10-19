// --- Helper Functions for LocalStorage ---

const SIMULATED_LATENCY = 300; // ms

function getFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue && storedValue !== 'undefined') {
            return JSON.parse(storedValue);
        }
    } catch (error) {
        console.error(`Gagal mem-parsing localStorage untuk kunci "${key}":`, error);
    }
    
    if (typeof defaultValue === 'function') {
        return (defaultValue as () => T)();
    }
    return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Gagal menyimpan ke localStorage untuk kunci "${key}":`, error);
    }
}


// Wrapper to simulate an API call
function apiCall<T>(dataOperation: () => T): Promise<T> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // Simulate occasional random failures for testing error handling
                // if (Math.random() < 0.1) {
                //     throw new Error("Simulated network error");
                // }
                const result = dataOperation();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }, SIMULATED_LATENCY);
    });
}

// --- API Function Implementations ---
import {
    Asset, Request, Handover, Dismantle, Customer, User, Division, AssetCategory, StandardItem, Notification
} from '../types';
import {
  initialMockRequests,
  mockAssets,
  mockHandovers,
  mockDismantles,
  initialMockUsers,
  mockDivisions,
  mockCustomers,
  initialAssetCategories as generateInitialAssetCategories,
  mockNotifications
} from '../data/mockData';

const initialAssetCategories = (): AssetCategory[] => {
  return generateInitialAssetCategories;
};

// Fetch all data types
export const fetchAllData = () => {
    return apiCall(() => {
        const assets = getFromStorage<Asset[]>('app_assets', mockAssets);
        const requests = getFromStorage<Request[]>('app_requests', initialMockRequests);
        const handovers = getFromStorage<Handover[]>('app_handovers', mockHandovers);
        const dismantles = getFromStorage<Dismantle[]>('app_dismantles', mockDismantles);
        const customers = getFromStorage<Customer[]>('app_customers', mockCustomers);
        const users = getFromStorage<User[]>('app_users', initialMockUsers);
        const divisions = getFromStorage<Division[]>('app_divisions', mockDivisions);
        const assetCategories = getFromStorage<AssetCategory[]>('app_assetCategories', initialAssetCategories());
        const notifications = getFromStorage<Notification[]>('app_notifications', mockNotifications);

        return { assets, requests, handovers, dismantles, customers, users, divisions, assetCategories, notifications };
    });
};

// Generic update function for simplicity
export function updateData<T>(key: string, data: T): Promise<T> {
    return apiCall(() => {
        saveToStorage(key, data);
        return data;
    });
}

// Login
export const loginUser = (email: string, pass: string): Promise<User> => {
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getFromStorage<User[]>('app_users', initialMockUsers);
            const foundUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

            if (foundUser) {
                // In a real app, you'd verify the password hash here
                localStorage.setItem('currentUser', JSON.stringify(foundUser));
                resolve(foundUser);
            } else {
                reject(new Error("Invalid credentials"));
            }
        }, 800);
    });
}
