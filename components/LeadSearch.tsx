import React, { useState } from 'react';
import { Sparkles, MapPin } from 'lucide-react';

interface LeadSearchProps {
    onSearch: (query: string, location: string) => void;
    isLoading: boolean;
}

const LeadSearch: React.FC<LeadSearchProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [location, setLocation] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            onSearch(query, location);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-4">
            <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                <div className="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 pl-6">
                    <Sparkles className="w-5 h-5 text-indigo-400 mr-4" />
                    <input
                        type="text"
                        placeholder="Describe your target leads (e.g. tech startups in Shanghai with old websites)"
                        className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder:text-gray-600 text-lg py-3"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <div className="flex items-center gap-2 px-4 border-l border-white/10 ml-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Location"
                            className="bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-700 w-32"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !query.trim()}
                        className="ml-4 px-8 py-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            <div className="flex gap-2 text-xs text-gray-500 justify-center">
                <span>Recent:</span>
                <button onClick={() => { setQuery('Design Agencies'); setLocation('London'); }} className="hover:text-gray-300">Design Agencies in London</button>
                <span>|</span>
                <button onClick={() => { setQuery('Startups'); setLocation('Silicon Valley'); }} className="hover:text-gray-300">Startups in Silicon Valley</button>
                <span>|</span>
                <button onClick={() => { setQuery('Law Firms with rating > 4.0'); setLocation(''); }} className="hover:text-gray-300">Law Firms with rating &gt; 4.0</button>
            </div>
        </div>
    );
};

export default LeadSearch;
