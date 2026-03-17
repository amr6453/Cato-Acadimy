import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Camera, 
  Plus, 
  Video, 
  Check,
  Upload,
  Loader2,
  Info,
  Trash2,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CourseWizard = ({ isOpen, onClose, onRefresh }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // Track progress per file
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeLocalSectionId, setActiveLocalSectionId] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      category: '',
      price: '',
      level: 'BEGINNER',
      description: '',
      learning_outcomes: '',
      course_includes: '',
      thumbnail: null,
      promo_video: null
    }
  });

  const watchThumbnail = watch('thumbnail');
  const watchPromoVideo = watch('promo_video');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories.");
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // ── Curriculum Management ──────────────────────────────────────────────────
  const addSection = () => {
    const title = prompt("Enter section title:");
    if (!title) return;
    setSections([...sections, { id: Date.now(), title, lessons: [] }]);
  };

  const removeSection = (id) => setSections(sections.filter(s => s.id !== id));

  const addLesson = (sectionId, lessonData) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, lessons: [...s.lessons, { ...lessonData, id: Date.now() }] } : s
    ));
    setShowLessonModal(false);
  };

  const removeLesson = (sectionId, lessonId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
    ));
  };

  // ── Form Submission Logic ──────────────────────────────────────────────────
  const onSubmit = async (data) => {
    if (sections.length === 0) {
      return toast.error("Please add at least one section to your curriculum.");
    }

    setLoading(true);
    setOverallProgress(5);
    setCurrentTask('Initializing course creation...');

    try {
      // 1. Create Course
      const courseFormData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) courseFormData.append(key, value);
      });

      const courseRes = await api.post('/api/courses/', courseFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
             const percent = Math.round((p.loaded * 100) / p.total);
             setOverallProgress(5 + (percent * 0.2)); // First 25% for course headers + promo doc
        }
      });
      
      const courseId = courseRes.data.id;
      setOverallProgress(25);

      // 2. Create Sections & Lessons
      let totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);
      let lessonsProcessed = 0;

      for (const section of sections) {
        setCurrentTask(`Creating section: ${section.title}`);
        const secRes = await api.post(`/api/courses/${courseId}/sections/`, {
          title: section.title,
          course: courseId
        });
        const sectionId = secRes.data.id;

        for (const lesson of section.lessons) {
          setCurrentTask(`Uploading lesson: ${lesson.title}`);
          const lessonFormData = new FormData();
          lessonFormData.append('title', lesson.title);
          lessonFormData.append('lesson_type', 'VIDEO');
          lessonFormData.append('video_file', lesson.videoFile);
          lessonFormData.append('video_thumbnail', lesson.thumbFile);
          
          await api.post(`/api/sections/${sectionId}/lessons/`, lessonFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (p) => {
              const lessonPercent = Math.round((p.loaded * 100) / p.total);
              const base = 25 + (lessonsProcessed * (70 / totalLessons));
              const current = base + (lessonPercent * (70 / totalLessons) / 100);
              setOverallProgress(Math.round(current));
            }
          });
          lessonsProcessed++;
        }
      }

      setOverallProgress(100);
      toast.success("Course created successfully!");
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl bg-dark-card border border-white/5 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic">Course Wizard</h2>
            <div className="flex items-center gap-4 mt-2">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${currentStep >= s ? 'bg-primary text-white' : 'bg-white/5 text-slate-500'}`}>
                    {s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 rounded-full ${currentStep > s ? 'bg-primary' : 'bg-white/5'}`} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div 
                key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Title" placeholder="Mastering React 19" {...register('title', { required: true })} error={errors.title && 'Title is required'} />
                  <Input label="Subtitle" placeholder="From Zero to Hero with Framer Motion" {...register('subtitle')} />
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Category</label>
                    <select {...register('category', { required: true })} className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                      <option value="" disabled className="bg-dark-card">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id} className="bg-dark-card">{c.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Price ($)" type="number" placeholder="49.99" {...register('price', { required: true })} />
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Level</label>
                      <select {...register('level')} className="w-full h-14 bg-white/5 border-2 border-white/5 rounded-2xl px-4 text-white font-bold outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer">
                        <option value="BEGINNER" className="bg-dark-card">Beginner</option>
                        <option value="INTERMEDIATE" className="bg-dark-card">Intermediate</option>
                        <option value="ADVANCED" className="bg-dark-card">Advanced</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-400 uppercase tracking-wider ml-1">Description</label>
                  <textarea {...register('description', { required: true })} className="w-full h-32 bg-white/5 border-2 border-white/5 rounded-2xl p-4 text-white font-medium outline-none focus:border-primary/50 transition-all resize-none" placeholder="What is this course about?" />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div 
                key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   {/* Thumbnail Upload */}
                   <div className="space-y-4">
                     <label className="text-sm font-black text-white uppercase tracking-widest italic">Course Thumbnail</label>
                     <label className="relative block aspect-video rounded-[32px] overflow-hidden bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/50 cursor-pointer transition-all group">
                        {watchThumbnail?.[0] ? (
                            <img src={URL.createObjectURL(watchThumbnail[0])} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                <Plus size={40} />
                                <span className="text-xs font-black uppercase mt-2">Upload Cover</span>
                            </div>
                        )}
                        <input type="file" hidden accept="image/*" {...register('thumbnail', { required: true })} />
                     </label>
                   </div>

                   {/* Promo Video Upload */}
                   <div className="space-y-4">
                     <label className="text-sm font-black text-white uppercase tracking-widest italic">Promotional Video</label>
                     <label className="relative block aspect-video rounded-[32px] overflow-hidden bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 cursor-pointer transition-all group">
                        {watchPromoVideo?.[0] ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-500/10 text-purple-400">
                                <Video size={40} />
                                <span className="text-[10px] font-black uppercase mt-2">{watchPromoVideo[0].name}</span>
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 group-hover:text-purple-400 transition-colors">
                                <Video size={40} />
                                <span className="text-xs font-black uppercase mt-2">Upload Trailer</span>
                            </div>
                        )}
                        <input type="file" hidden accept="video/*" {...register('promo_video')} />
                     </label>
                   </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div 
                key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Curriculum Builder</h3>
                  <Button type="button" icon={Plus} size="sm" onClick={addSection}>Add Section</Button>
                </div>

                <div className="space-y-6">
                  {sections.map((section, sIdx) => (
                    <div key={section.id} className="bg-white/5 border border-white/5 rounded-[32px] p-8 group">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-slate-500">S{sIdx+1}</span>
                          <h4 className="text-lg font-black text-white uppercase">{section.title}</h4>
                        </div>
                        <div className="flex gap-2">
                           <Button type="button" variant="glass" size="sm" icon={Trash2} onClick={() => removeSection(section.id)} className="text-red-500" />
                           <Button type="button" variant="glass" size="sm" icon={Video} onClick={() => { setActiveLocalSectionId(section.id); setShowLessonModal(true); }}>Add Lesson</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {section.lessons.map((lesson, lIdx) => (
                          <div key={lesson.id} className="relative aspect-video rounded-2xl overflow-hidden group/lesson border border-white/10">
                            <img src={URL.createObjectURL(lesson.thumbFile)} className="w-full h-full object-cover" alt="" />
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/lesson:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <button type="button" onClick={() => removeLesson(section.id, lesson.id)} className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center"><Trash2 size={18} /></button>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 p-2 bg-dark-bg/80 backdrop-blur-md rounded-xl border border-white/10">
                               <p className="text-[10px] font-bold text-white uppercase truncate">{lIdx+1}. {lesson.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/2 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-6">
            {loading ? (
               <div className="flex flex-col">
                 <div className="flex items-center gap-3 mb-2">
                    <Loader2 size={16} className="text-primary animate-spin" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{currentTask}</span>
                 </div>
                 <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary" animate={{ width: `${overallProgress}%` }} />
                 </div>
               </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500">
                <Info size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Step {currentStep} of 3</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {currentStep > 1 && !loading && <Button type="button" variant="glass" onClick={prevStep} icon={ChevronLeft}>Back</Button>}
            {currentStep < 3 ? (
              <Button type="button" variant="primary" onClick={nextStep} icon={ChevronRight} className="pr-4">Next Step</Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={loading} icon={Check}>
                {loading ? 'Submitting...' : 'Launch Course'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <LessonModal 
            onClose={() => setShowLessonModal(false)}
            onAdd={(data) => addLesson(activeLocalSectionId, data)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const LessonModal = ({ onClose, onAdd }) => {
  const [data, setData] = useState({ title: '', videoFile: null, thumbFile: null });
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-dark-card border border-white/10 rounded-[32px] p-8">
        <h3 className="text-xl font-black text-white uppercase italic mb-8">Add New Lesson</h3>
        <div className="space-y-6">
          <Input label="Lesson Title" placeholder="e.g. Setting up Environment" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Video File</label>
               <label className="flex flex-col items-center justify-center aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-all">
                  {data.videoFile ? <Check className="text-primary" /> : <Video className="text-slate-500" />}
                  <input type="file" hidden accept="video/*" onChange={e => setData({...data, videoFile: e.target.files[0]})} />
               </label>
             </div>
             <div className="space-y-2">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Thumbnail</label>
               <label className="flex flex-col items-center justify-center aspect-square bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-all overflow-hidden">
                  {data.thumbFile ? <img src={URL.createObjectURL(data.thumbFile)} className="w-full h-full object-cover" /> : <Camera className="text-slate-500" />}
                  <input type="file" hidden accept="image/*" onChange={e => setData({...data, thumbFile: e.target.files[0]})} />
               </label>
             </div>
          </div>
          <Button fullWidth variant="primary" onClick={() => data.title && data.videoFile && data.thumbFile && onAdd(data)} icon={Plus}>Add to Section</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseWizard;
