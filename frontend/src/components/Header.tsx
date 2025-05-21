import { Search } from 'lucide-react'

const Header = () => {
    return (
        <header className="fixed top-0 right-0 left-64 h-16 glass shadow-sm z-10">
            <div className="h-full px-6 flex items-center justify-between gap-4">
                <div className="flex-1 max-w-xl">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="search"
                            placeholder="Location..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header