import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  Video, 
  BookOpen, 
  Code, 
  FileText, 
  Sparkles
} from 'lucide-react';
import { ResourceItem, StudentProfile } from '../types';

interface ResourceRecommendationsProps {
  resources: ResourceItem[];
  profile: StudentProfile;
}

export const ResourceRecommendations: React.FC<ResourceRecommendationsProps> = ({
  resources,
  profile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const subjectOptions = ['All', ...Array.from(new Set(resources.map(r => r.subject)))];
  const typeOptions = ['All', ...Array.from(new Set(resources.map(r => r.type)))];

  const filteredResources = resources.filter(res => {
    if (selectedSubject !== 'All' && res.subject !== selectedSubject) return false;
    if (selectedType !== 'All' && res.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        res.topic.toLowerCase().includes(q) ||
        res.subject.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'Video Lecture':
        return Video;
      case 'Practice Problems':
        return Code;
      case 'Formula Sheet':
      case 'Revision Notes':
        return FileText;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="card-warm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Curated High-Yield Learning Resources
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 font-semibold border border-sage-200">
              Safe Search Links
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Carefully structured search queries for your weak subjects on verified educational platforms. No hallucinated links.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-charcoal-500 bg-cream-100 px-3 py-2 rounded-xl border border-cream-200">
          <Sparkles className="w-4 h-4 text-coral-500" />
          <span>Tailored to {profile.goal}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search topics, formulas, or problem types..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-2 focus:ring-sage-400 bg-cream-50/50"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-cream-300 bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            {subjectOptions.map(sub => (
              <option key={sub} value={sub}>
                {sub === 'All' ? 'All Subjects' : sub}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-cream-300 bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            {typeOptions.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Formats' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredResources.map(res => {
          const Icon = getIconForType(res.type);

          return (
            <div
              key={res.id}
              className="card-warm p-5 flex flex-col justify-between hover:border-sage-400 hover:shadow-card transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sage-50 text-sage-800 border border-sage-200">
                    {res.subject}
                  </span>
                  <span className="text-[11px] font-semibold text-charcoal-500 bg-cream-100 px-2 py-0.5 rounded-md">
                    {res.platform}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-coral-700 font-bold uppercase tracking-wider mb-1">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{res.type}</span>
                  </div>
                  <h3 className="text-sm font-bold text-charcoal-900 leading-snug group-hover:text-sage-700 transition-colors">
                    {res.topic}
                  </h3>
                </div>

                <p className="text-xs text-charcoal-600 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-cream-200/80">
                <a
                  href={res.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between w-full px-3 py-2 rounded-xl bg-cream-100 hover:bg-sage-500 text-charcoal-700 hover:text-white text-xs font-semibold transition-all group/btn"
                >
                  <span>Search on {res.platform}</span>
                  <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
