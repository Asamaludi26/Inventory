import React, { useState, useEffect } from 'react';
import { Page } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { RequestIcon } from './icons/RequestIcon';
import { RegisterIcon } from './icons/RegisterIcon';
import { HandoverIcon } from './icons/HandoverIcon';
import { DismantleIcon } from './icons/DismantleIcon';
import { CloseIcon } from './icons/CloseIcon';
import { AssetIcon } from './icons/AssetIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UsersIcon } from './icons/UsersIcon';
import { TrinitiLogoIcon } from './icons/TrinitiLogoIcon';
import { CustomerIcon } from './icons/CustomerIcon';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  {
    id: 'assetManagement',
    label: 'Manajemen Aset',
    icon: AssetIcon,
    children: [
      { id: 'registration', label: 'Daftar Aset', icon: RegisterIcon },
      { id: 'customers', label: 'Daftar Pelanggan', icon: CustomerIcon },
      { id: 'request', label: 'Daftar Request', icon: RequestIcon },
      { id: 'handover', label: 'Daftar Handover', icon: HandoverIcon },
      { id: 'dismantle', label: 'Daftar Dismantle', icon: DismantleIcon },
    ],
  },
  { id: 'accounts', label: 'Akun & Divisi', icon: UsersIcon },
];
const assetPages = menuItems.find(i => i.id === 'assetManagement')?.children?.map(c => c.id) || [];

const NavLink: React.FC<{
  item: { id: string; label: string; icon: React.FC<{ className?: string }> };
  activePage: Page;
  onClick: () => void;
  isSubmenu?: boolean;
}> = ({ item, activePage, onClick, isSubmenu = false }) => {
  const isActive = activePage === item.id;
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


export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen }) => {
    const [isAssetMenuOpen, setIsAssetMenuOpen] = useState(assetPages.includes(activePage));

    useEffect(() => {
        if (assetPages.includes(activePage)) {
            setIsAssetMenuOpen(true);
        }
    }, [activePage]);

    const handleNavClick = (page: Page) => {
        setActivePage(page);
        if(window.innerWidth < 768) { // close on mobile
            setIsOpen(false);
        }
    };
    
    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700/80">
                <div className="flex items-center gap-3">
                    <TrinitiLogoIcon className="w-8 h-8 text-tm-accent" />
                    <span className="text-xl font-bold tracking-wide text-white">TRINITI ASSET</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 md:hidden hover:text-white">
                    <CloseIcon />
                </button>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    if (!item.children) {
                        return (
                            <NavLink 
                                key={item.id} 
                                item={item as any}
                                activePage={activePage} 
                                onClick={() => handleNavClick(item.id as Page)}
                            />
                        );
                    }

                    const isParentActive = assetPages.includes(activePage);

                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => setIsAssetMenuOpen(!isAssetMenuOpen)}
                                className={`flex items-center justify-between w-full px-4 py-2.5 my-1 rounded-md text-sm font-medium transition-colors duration-200 group focus:outline-none ${isParentActive ? 'text-white' : 'text-gray-400'} hover:bg-gray-700/40 hover:text-white`}
                            >
                                <div className="flex items-center">
                                    <item.icon className={`flex-shrink-0 w-5 h-5 mr-4 transition-colors group-hover:text-white ${isParentActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span>{item.label}</span>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${isAssetMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </button>
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAssetMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="pt-1 pb-1 pl-6">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.id}
                                            item={{...child, label: child.label.replace('Form ', '')} as any}
                                            activePage={activePage}
                                            onClick={() => handleNavClick(child.id as Page)}
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
                className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />
            
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-30 h-full w-64 bg-tm-dark text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>
        </>
    );
};
