import { Search, Bell } from 'lucide-react'
import {useRef, useState} from 'react'
import * as React from "react";
import { useClickOutside } from '../hooks/useClickOutside'

interface HeaderProps {
    onFilterOpenChange: (isOpenOnly: boolean) => void;
    searchLocation: string;
    onSearchChange: (value: string) => void;
    onSearch: () => void;
}

interface Notification {
    id: string;
    message: string;
    timestamp: Date;
    read: boolean;
}

const Header = ({ onFilterOpenChange, onSearchChange, onSearch, searchLocation } : HeaderProps) => {
    const [isOpenOnly, setIsOpenOnly] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            message: 'Your reservation at Station XYZ is completed',
            timestamp: new Date(),
            read: false
        }
    ]);
    const notificationRef = useRef<HTMLDivElement>(null);
    useClickOutside(notificationRef, () => setShowNotifications(false));


    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsOpenOnly(checked);
        onFilterOpenChange(checked);
    }

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    return (
        <header className="fixed top-0 right-0 left-64 h-16 glass shadow-sm z-10">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xl flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="search"
                            placeholder="Location..."
                            value={searchLocation}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    onSearch();
                                }
                            }}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
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

                {/* Notification Bell */}
                <div ref={notificationRef} className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 hover:bg-green-900-100 rounded-full transition-colors"
                    >
                        <Bell className="text-gray-600" size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-700">Notifications</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        No notifications
                                    </div>
                                ) : (
                                    <div>
                                        {notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => markAsRead(notification.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        markAsRead(notification.id);
                                                    }
                                                }}
                                                tabIndex={0}
                                                className={`w-full text-left p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                                    !notification.read ? 'bg-blue-50' : ''
                                                }`}
                                            >
                                                <p className="text-sm text-gray-800">{notification.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {notification.timestamp.toLocaleTimeString()}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header