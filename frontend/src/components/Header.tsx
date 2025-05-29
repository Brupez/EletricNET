import { Search } from 'lucide-react'
import { useState } from 'react'
import * as React from "react";

interface HeaderProps {
    onFilterOpenChange: (isOpenOnly: boolean) => void;
}

const Header = ({ onFilterOpenChange } : HeaderProps) => {
    const [isOpenOnly, setIsOpenOnly] = useState(false);

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsOpenOnly(checked);
        onFilterOpenChange(checked);
    }

    return (
        <header className="fixed top-0 right-0 left-64 h-16 glass shadow-sm z-10">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xl flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="search"
                            placeholder="Location..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                    {/* New Filter Checkbox */}
                    <label className="flex items-center space-x-2 text-gray-700">
                        <input
                            type="checkbox"
                            checked={isOpenOnly}
                            onChange={handleCheckboxChange}
                            className="form-checkbox h-4 w-4 text-green-600 rounded"
                        />
                        <span>Open Now</span>
                    </label>
                </div>
            </div>
        </header>
    );
}

export default Header