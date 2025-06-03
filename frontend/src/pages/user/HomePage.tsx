import { Search } from 'lucide-react'
import map from '../../assets/map.jpg'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import LoadingScreen from '../../components/LoadingScreen.tsx'
import * as React from "react";

const HomePage = () => {
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [searchLocation, setSearchLocation] = useState('')

    const handleSearch = () => {
        if (!searchLocation) return alert('Please enter a location.')
        setIsLoading(true)
        setTimeout(() => {
            navigate(`/map?location=${encodeURIComponent(searchLocation)}`)
        }, 1000)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    }

    return (
        <div className="relative h-screen w-full">
            {isLoading && <LoadingScreen />}

            {/* Background Image */}
            <div
                className="fixed left-64 right-0 top-0 bottom-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${map})`,
                    filter: "blur(8px) brightness(95%)",
                }}
            />

            {/* Card Container */}
            <div className="relative z-10 h-full w-full flex items-center justify-center">
                <div className="card max-w-2xl w-full p-8 bg-white/95 backdrop-blur-sm">
                    <div className="flex flex-col gap-16">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Search Charging Stations
                            </h2>
                        </div>

                        <div className="flex flex-col gap-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="search"
                                    placeholder="Location..."
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <button
                                onClick={handleSearch}
                                className="w-full bg-[#243E16] hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage