export default function Logo({ className = "w-8 h-8", textClass = "text-xl font-bold" }) {
    return (
        <div className="flex items-center gap-2">
            <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Ring/Arrows Loop */}
                <path d="M 35 50 A 15 15 0 1 1 50 35 M 35 50 A 15 15 0 1 0 50 65" stroke="url(#blue-grad)" strokeWidth="10" strokeLinecap="round" />
                <path d="M 65 50 A 15 15 0 1 1 50 65 M 65 50 A 15 15 0 1 0 50 35" stroke="url(#teal-grad)" strokeWidth="10" strokeLinecap="round" />

                {/* Arrow heads */}
                <path d="M 50 28 L 50 42 L 40 35 Z" fill="#0088ff" />
                <path d="M 50 72 L 50 58 L 60 65 Z" fill="#20c997" />

                {/* Central Box */}
                <rect x="42" y="42" width="16" height="16" rx="3" fill="#0088ff" />
                <path d="M 46 50 L 50 54 L 54 46" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                <defs>
                    <linearGradient id="blue-grad" x1="0" y1="0" x2="100" y2="100">
                        <stop offset="0%" stopColor="#0056b3" />
                        <stop offset="100%" stopColor="#0088ff" />
                    </linearGradient>
                    <linearGradient id="teal-grad" x1="100" y1="100" x2="0" y2="0">
                        <stop offset="0%" stopColor="#20c997" />
                        <stop offset="100%" stopColor="#0dcaf0" />
                    </linearGradient>
                </defs>
            </svg>
            <span className={`${textClass} tracking-tight`}>StockFlow</span>
        </div>
    );
}
