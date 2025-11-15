

import React, { useMemo } from 'react';
import { Permission } from '../../../types';
import { ALL_PERMISSIONS } from '../../../utils/permissions';
import { Checkbox } from '../../../components/ui/Checkbox';

interface PermissionManagerProps {
    currentPermissions: Permission[];
    onChange: (newPermissions: Permission[]) => void;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ currentPermissions, onChange }) => {

    const handlePermissionChange = (permissionKey: Permission, checked: boolean) => {
        if (checked) {
            onChange([...currentPermissions, permissionKey]);
        } else {
            onChange(currentPermissions.filter(p => p !== permissionKey));
        }
    };

    const handleGroupToggle = (groupPermissions: Permission[], isAllChecked: boolean) => {
        const groupKeys = groupPermissions.map(p => p);
        if (isAllChecked) {
            // Remove all permissions from this group
            onChange(currentPermissions.filter(p => !groupKeys.includes(p)));
        } else {
            // Add all permissions from this group
            onChange([...new Set([...currentPermissions, ...groupKeys])]);
        }
    };

    return (
        <div className="space-y-6">
            {ALL_PERMISSIONS.map(group => {
                const groupPermissionKeys = group.permissions.map(p => p.key);
                const checkedCount = groupPermissionKeys.filter(p => currentPermissions.includes(p)).length;
                const isAllChecked = checkedCount === groupPermissionKeys.length;
                const isIndeterminate = checkedCount > 0 && !isAllChecked;

                return (
                    <div key={group.group} className="p-4 border rounded-lg bg-gray-50/70 border-gray-200/80">
                        <div className="flex items-center justify-between pb-3 border-b">
                            <h4 className="text-base font-semibold text-gray-800">{group.group}</h4>
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-600 cursor-pointer">
                                <Checkbox
                                    id={`group-toggle-${group.group}`}
                                    checked={isAllChecked}
                                    onChange={() => handleGroupToggle(groupPermissionKeys, isAllChecked)}
// FIX: Changed from using a ref to pass the `indeterminate` prop, which is now supported by the Checkbox component.
                                    indeterminate={isIndeterminate}
                                />
                                <span>Pilih Semua</span>
                            </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4">
                            {group.permissions.map(permission => (
                                <label key={permission.key} className="flex items-start space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-100">
                                    <Checkbox
                                        id={permission.key}
                                        checked={currentPermissions.includes(permission.key)}
                                        onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                                        className="mt-0.5"
                                    />
                                    <span className="text-sm text-gray-700">{permission.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};