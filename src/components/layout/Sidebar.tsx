import React, { useState, useEffect } from 'react';
import { Page, User } from '../../types';
import { DashboardIcon } from '../icons/DashboardIcon';
import { RequestIcon } from '../icons/RequestIcon';
import { RegisterIcon } from '../icons/RegisterIcon';
import { HandoverIcon } from '../icons/HandoverIcon';
import { DismantleIcon } from '../icons/DismantleIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { AssetIcon } from '../icons/AssetIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { TrinitiLogoIcon } from '../icons/TrinitiLogoIcon';
import { CustomerIcon } from '../icons/CustomerIcon';
import { BoxIcon } from '../icons/BoxIcon';
import { SettingsIcon } from '../icons/SettingsIcon';
import { CategoryIcon } from '../icons/CategoryIcon';
import { WrenchIcon } from '../icons/WrenchIcon';

interface SidebarProps {
  currentUser: User;
  activePage: Page;
  setActivePage: (page: Page, filters?: any) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type MenuItem = {
  id: string; // Unique identifier for the item itself
  label: string;
  icon: React.FC<{ className?: string }>;
  roles?: User['role'][];
  children?: MenuItem[];
  page?: Page; // The page ID it navigates to, if different from id
  filter?: Record<string, any>; // Filters to pass to the page
};

const allMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  {
    id: 'assetManagement',
    label: 'Manajemen Aset',
    icon: AssetIcon,
    children: [
      { id: 'registration', label: 'Catat Aset', icon: RegisterIcon, roles: ['Admin', 'Super Admin'] },
      { id: 'stock', label: 'Stok Aset', icon: BoxIcon },
      { id: 'request', label: 'Request Aset', icon: RequestIcon },
      { id: 'handover', label: 'Handover Aset', icon: HandoverIcon },
      { id: 'dismantle', label: 'Dismantle Aset', icon: DismantleIcon },
      { id: 'repair', label: 'Perbaikan Aset', icon: WrenchIcon, roles: ['Admin', 'Super Admin'] },
    ],
  },
  { id: 'customers', label: 'Daftar Pelanggan', icon: CustomerIcon, roles: ['Admin', 'Super Admin'] },
  {
    id: 'settings',
    label: 'Pengaturan',
    icon: SettingsIcon,
    roles: ['Admin', 'Super Admin'],
    children: [
        { id: 'settings-pengguna', page: 'pengaturan-pengguna', label: 'Akun & Divisi', icon: UsersIcon },
        { id: 'settings-kategori', page: 'kategori', label: 'Kategori & Model', icon: CategoryIcon },
    ]
  },
];


const NavLink: React.FC<{
  item: MenuItem;
  activePage: Page;
  onClick: () => void;
  isSubmenu?: boolean;
}> = ({ item, activePage, onClick, isSubmenu = false }) => {
  const pageId = item.page || (item.id as Page);
  const isActive = activePage === pageId;
  const baseClasses = 'relative flex items-center px-4 py-2.5 my-1 rounded-md text-sm font-medium transition-colors duration-200 group';
  const activeClasses = 'bg-gray-700/60 text-white';
  const inactiveClasses = 'text-gray-400 hover:bg-gray-700/40 hover:text-white';

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {isActive && <span className="absolute inset-y-0 left-0 w-1 bg-tm-accent rounded-r-full"></span>}
      <item.icon className={`flex-shrink-0 w-5 h-5 mr-4 transition-colors group-hover:text-white ${isActive ? 'text-white' : 'text-gray-500'}`} />
      <span>{item.label}</span>
    </a>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ currentUser, activePage, setActivePage, isOpen, setIsOpen }) => {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        allMenuItems.forEach(item => {
            if (item.children) {
                const childPages = item.children.map(c => c.page || c.id);
                if (childPages.includes(activePage)) {
                    initialState[item.id] = true;
                }
            }
        });
        return initialState;
    });

    const menuItems = React.useMemo(() => {
        return allMenuItems.filter(item => {
            if (item.roles) {
                return item.roles.includes(currentUser.role);
            }
            return true;
        }).map(item => {
            if (item.children) {
                const visibleChildren = item.children.filter(child => {
                    if (child.roles) {
                        return child.roles.includes(currentUser.role);
                    }
                    return true;
                });
                return { ...item, children: visibleChildren };
            }
            return item;
        });
    }, [currentUser.role]);


    useEffect(() => {
        allMenuItems.forEach(item => {
            if (item.children) {
                const childPages = item.children.map(c => c.page || c.id);
                if (childPages.includes(activePage)) {
                    setOpenMenus(prev => ({...prev, [item.id]: true}));
                }
            }
        });
    }, [activePage]);

    const handleNavClick = (page: Page, filters?: Record<string, any>) => {
        setActivePage(page, filters);
        if(window.innerWidth < 768) { // close on mobile
            setIsOpen(false);
        }
    };
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700/80">
                <div className="flex items-center gap-3">
                    <TrinitiLogoIcon className="w-10 h-10 text-tm-accent" />
                    <span className="text-xl font-bold tracking-wider text-white">
                        Triniti<span className="font-normal opacity-75">Asset</span>
                    </span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 md:hidden hover:text-white">
                    <CloseIcon />
                </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    if (!item.children || item.children.length === 0) {
                        return (
                            <NavLink 
                                key={item.id} 
                                item={item as any}
                                activePage={activePage} 
                                onClick={() => handleNavClick(item.id as Page)}
                            />
                        );
                    }

                    const isParentActive = item.children?.some(child => (child.page || child.id) === activePage);

                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => setOpenMenus(prev => ({...prev, [item.id]: !prev[item.id]}))}
                                className={`flex items-center justify-between w-full px-4 py-2.5 my-1 rounded-md text-sm font-medium transition-colors duration-200 group focus:outline-none ${isParentActive ? 'text-white' : 'text-gray-400'} hover:bg-gray-700/40 hover:text-white`}
                            >
                                <div className="flex items-center">
                                    <item.icon className={`flex-shrink-0 w-5 h-5 mr-4 transition-colors group-hover:text-white ${isParentActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span>{item.label}</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${openMenus[item.id] ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[item.id] ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="pt-1 pb-1 pl-6">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.id}
                                            item={child as any}
                                            activePage={activePage}
                                            onClick={() => handleNavClick((child.page || child.id) as Page, child.filter)}
                                            isSubmenu={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-700/80">
                <p className="text-xs text-center text-gray-500">© 2024 Triniti Media Indonesia</p>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            <div 
                className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden no-print ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-tm-dark text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 no-print ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </>
    );
};