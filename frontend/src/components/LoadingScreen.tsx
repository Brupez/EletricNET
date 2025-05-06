const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 font-medium">Loading map...</p>
            </div>
        </div>
    )
}

export default LoadingScreen