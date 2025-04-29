import { Bell } from 'lucide-react'

const Header = () => {
    return (
        <header className="fixed top-0 right-0 left-64 h-16 glass shadow-sm z-10">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
                    <div className="hidden md:flex items-center gap-2">
            <span className="badge badge-success">
              Online
            </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="icon-container relative">
                        <Bell size={24} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header