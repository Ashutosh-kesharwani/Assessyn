import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, Building2, Globe } from 'lucide-react';
import { useDebounce } from '../../utils/useDebounce';
import Button from '@/components/ui/Button';
import { ShurikenIcon } from '@/components/ui/ShinobiIcons';

export default function SearchBar({ onSearch, initialQuery = '', initialLocation = '', initialRemote = false, isFetching = false }) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [isRemote, setIsRemote] = useState(initialRemote);

  const debouncedQuery = useDebounce(query, 300);
  const debouncedLocation = useDebounce(location, 300);
  const debouncedRemote = useDebounce(isRemote, 300);

  useEffect(() => {
    onSearch({ 
      q: debouncedQuery, 
      where: debouncedRemote ? 'remote' : debouncedLocation,
      remote: debouncedRemote 
    });
  }, [debouncedQuery, debouncedLocation, debouncedRemote]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ 
      q: query, 
      where: isRemote ? 'remote' : location,
      remote: isRemote 
    });
  };

  return (
    <div className="w-full relative z-20 group">
      <form 
        onSubmit={handleSubmit}
        className="relative flex flex-col md:flex-row items-stretch md:items-center bg-surface/90 backdrop-blur-2xl rounded-3xl border border-subtle shadow-2xl p-2.5 gap-3"
      >
        {/* Keywords Search */}
        <div className="flex-1 flex items-center px-4 py-2 rounded-2xl bg-surface border border-subtle">
          <Search className="w-4 h-4 text-brand-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Target role, engineering stack, or company..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-secondary font-medium text-xs sm:text-sm"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 rounded-lg text-secondary hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Search */}
        <div className="flex-1 flex items-center px-4 py-2 rounded-2xl bg-surface border border-subtle">
          <MapPin className={`w-4 h-4 mr-3 flex-shrink-0 ${isRemote ? 'text-slate-600' : 'text-brand-400'}`} />
          <input
            type="text"
            value={isRemote ? 'Remote (Worldwide)' : location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isRemote}
            placeholder="City, region, or jurisdiction..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-secondary font-medium text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {location && !isRemote && (
            <button type="button" onClick={() => setLocation('')} className="p-1 rounded-lg text-secondary hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Remote Toggle & Action Trigger */}
        <div className="flex items-center justify-between md:justify-end gap-3 px-2 md:px-0">
          <button
            type="button"
            onClick={() => setIsRemote(!isRemote)}
            className={`px-3.5 py-2.5 rounded-2xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              isRemote
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-300 shadow-sm'
                : 'bg-surface border-subtle text-secondary hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Remote Only</span>
          </button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={ShurikenIcon}
            isLoading={isFetching}
            className="font-bold px-6 text-xs flex-shrink-0"
          >
            <span>Scan Market</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
