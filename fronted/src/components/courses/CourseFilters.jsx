import { Search, Filter, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';

const FilterSection = ({ title, children }) => (
  <div className="mb-8 last:mb-0">
    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
      <div className="w-1 h-1 bg-primary rounded-full" />
      {title}
    </h4>
    <div className="space-y-2">
      {children}
    </div>
  </div>
);

const RadioFilter = ({ label, count, checked, onChange, value }) => (
  <label className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className={`
        w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
        ${checked ? 'border-primary bg-primary' : 'border-slate-200 dark:border-white/10 group-hover:border-slate-300 dark:group-hover:border-white/20 bg-white dark:bg-white/5'}
      `}>
        {checked && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
      </div>
      <input 
        type="radio" 
        className="hidden" 
        checked={checked} 
        onChange={() => onChange(value)} 
      />
      <span className={`text-[13px] font-bold transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>
        {label}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 transition-colors bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-md">
        {count}
      </span>
    )}
  </label>
);

const CourseFilters = ({ categories, selectedCategory, onCategoryChange, priceRange, onPriceChange }) => {
  const prices = [
    { label: 'All Prices', value: 'all' },
    { label: 'Free', value: '0' },
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: 'Over $100', value: '100+' },
  ];

  return (
    <div className="space-y-6">
      <Card padding="p-6" className="bg-white border-slate-100/60 premium-shadow">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <Filter size={18} className="text-primary" />
            <h3 className="text-lg font-black tracking-tight">Filters</h3>
          </div>
          {(selectedCategory !== 'all' || priceRange !== 'all') && (
            <button 
              onClick={() => { onCategoryChange('all'); onPriceChange('all'); }}
              className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        <FilterSection title="Categories">
          <RadioFilter 
            label="All Categories" 
            value="all"
            checked={selectedCategory === 'all'} 
            onChange={onCategoryChange} 
          />
          {categories.map((cat) => (
            <RadioFilter 
              key={cat.id} 
              label={cat.title} 
              value={cat.slug}
              checked={selectedCategory === cat.slug} 
              onChange={onCategoryChange} 
            />
          ))}
        </FilterSection>

        <div className="h-px bg-slate-50 dark:bg-white/5 my-8" />

        <FilterSection title="Price Range">
          {prices.map((p) => (
            <RadioFilter 
              key={p.value} 
              label={p.label} 
              value={p.value}
              checked={priceRange === p.value} 
              onChange={onPriceChange} 
            />
          ))}
        </FilterSection>

        <div className="h-px bg-slate-50 my-8" />

        <FilterSection title="Ratings">
          {[4, 3, 2, 1].map((rating) => (
            <button key={rating} className="flex items-center gap-2 group w-full text-left">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-white/10'} 
                  />
                ))}
              </div>
              <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">& Up</span>
            </button>
          ))}
        </FilterSection>
      </Card>
      
      {/* Promo Card */}
      <Card className="bg-slate-900 border-none p-8 relative overflow-hidden group cursor-pointer shadow-2xl shadow-primary/20">
         <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[80px] group-hover:bg-primary/40 transition-all duration-500" />
         <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 blur-[60px] group-hover:bg-indigo-500/20 transition-all duration-500" />
         
         <div className="relative z-10">
           <div className="inline-block px-3 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/30 mb-4">
              Premium Path
           </div>
           <h4 className="text-white font-black text-xl leading-tight mb-3 tracking-tight">
             New Skills,<br/>
             <span className="text-primary">New You.</span>
           </h4>
           <p className="text-slate-400 text-xs font-medium mb-8 leading-relaxed">
             Unlock your full potential with<br/>our expert-led premium tracks.
           </p>
           <button className="flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-wider group-hover:gap-4 transition-all duration-300">
             Start Exploring 
             <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white premium-shadow">
                <ChevronRight size={14} />
             </div>
           </button>
         </div>
      </Card>
    </div>
  );
};

const Star = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default CourseFilters;
