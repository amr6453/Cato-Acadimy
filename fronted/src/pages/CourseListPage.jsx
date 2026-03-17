import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import CourseCard from '../components/courses/CourseCard';
import CourseFilters from '../components/courses/CourseFilters';
import Button from '../components/ui/Button';

const CourseListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters from URL
  const selectedCategory = searchParams.get('category') || 'all';
  const priceRange = searchParams.get('price') || 'all';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, priceRange, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/categories/');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = 'http://127.0.0.1:8000/api/public/courses/';
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      // Handle price range
      if (priceRange === '0') {
        params.append('price', '0');
      } else if (priceRange === '0-50') {
        params.append('max_price', '50');
      } else if (priceRange === '50-100') {
        params.append('min_price', '50');
        params.append('max_price', '100');
      } else if (priceRange === '100+') {
        params.append('min_price', '100');
      }

      const response = await axios.get(`${url}?${params.toString()}`);
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handlePriceChange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    if (range === 'all') {
      newParams.delete('price');
    } else {
      newParams.set('price', range);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-10">
      {/* -- Sidebar -- */}
      <aside className="w-full lg:w-72 flex-shrink-0">
        <CourseFilters 
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
          priceRange={priceRange}
          onPriceChange={handlePriceChange}
        />
      </aside>

      {/* -- Main Content -- */}
      <main className="flex-grow">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-1 bg-primary rounded-full transition-all duration-500 group-hover:w-12" />
              <span className="text-[11px] font-black text-primary uppercase tracking-[3px]">Explore Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Available Courses'}
            </h1>
          </div>
          <div className="text-sm font-bold text-slate-400 dark:text-slate-500">
             Showing <span className="text-slate-900 dark:text-white">{courses.length}</span> results
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-4">
                <div className="aspect-video bg-slate-200 dark:bg-white/5 rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
                <div className="h-10 bg-slate-200 dark:bg-white/5 rounded mt-2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-red-50 dark:bg-red-500/5 rounded-3xl border border-red-100 dark:border-red-500/20">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-black text-red-900 dark:text-red-500 mb-2">Oops! Something went wrong</h3>
            <p className="text-red-700/60 dark:text-red-400 font-medium mb-6">{error}</p>
            <Button variant="primary" onClick={fetchCourses}>Try Again</Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <BookOpen size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
            <Button variant="outline" onClick={() => { setSearchParams({}); }}>Clear all filters</Button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CourseListPage;
