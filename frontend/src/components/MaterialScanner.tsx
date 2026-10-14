import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  AlertCircle,
  BookOpen,
  Sparkles,
  Trash2,
  Layers,
  HelpCircle,
  Plus,
  Loader2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { StudyMaterial, ExtractedTopic, SubjectRating, TodoTask } from '../types';
import { requestMaterialExtraction } from '../services/apiClient';
import { TopicQuizModal } from './TopicQuizModal';
import { SAMPLE_MATERIALS } from '../data/sampleData';

interface MaterialScannerProps {
  materials: StudyMaterial[];
  subjects: SubjectRating[];
  onAddMaterial: (material: StudyMaterial) => void;
  onDeleteMaterial: (id: string) => void;
  onUpdateTopicStatus: (
    materialId: string,
    topicId: string,
    status: 'not-started' | 'learning' | 'needs-revision' | 'understood',
    quizScore?: number
  ) => void;
  onSelectTopicForTutor: (material: StudyMaterial, topic: ExtractedTopic) => void;
  onAddStudyTask: (task: Omit<TodoTask, 'id' | 'completed' | 'completedAt'> & { id?: string }) => void;
}

export const MaterialScanner: React.FC<MaterialScannerProps> = ({
  materials,
  subjects,
  onAddMaterial,
  onDeleteMaterial,
  onUpdateTopicStatus,
  onSelectTopicForTutor,
  onAddStudyTask,
}) => {
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    materials[0]?.id || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.name || 'Physics'
  );

  // Upload and processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Quiz Modal State
  const [activeQuizTopic, setActiveQuizTopic] = useState<{
    material: StudyMaterial;
    topic: ExtractedTopic;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedMaterial =
    materials.find(m => m.id === selectedMaterialId) || materials[0] || null;

  // Process File Upload
  const processUploadedFile = async (file: File) => {
    setErrorMessage(null);

    // 1. Validate file extension
    const validExtensions = ['pdf', 'docx', 'pptx', 'txt'];
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMessage(
        `Invalid file format '.${ext}'. Please upload a PDF (.pdf), Word (.docx), PowerPoint (.pptx), or plain text (.txt) document.`
      );
      return;
    }

    // 2. Validate file size (10MB limit)
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). The maximum allowed size is ${MAX_MB}MB.`
      );
      return;
    }

    setIsProcessing(true);
    setProcessingStage('Reading and encoding document...');

    try {
      // Read file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          // Strip prefix data URL (e.g. "data:application/pdf;base64,")
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = () => reject(new Error('Failed to read file from disk.'));
        reader.readAsDataURL(file);
      });

      setProcessingStage('Extracting text and identifying topic chapters...');
      const result = await requestMaterialExtraction(
        base64Data,
        file.name,
        ext,
        selectedSubject
      );

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to extract text from document.');
      }

      setProcessingStage('AI Topic Outline synthesized!');
      onAddMaterial(result.data);
      setSelectedMaterialId(result.data.id);
    } catch (err: any) {
      console.error('Material upload error:', err);
      setErrorMessage(err.message || 'An error occurred while processing the document.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    const sample = SAMPLE_MATERIALS[0];
    if (sample) {
      onAddMaterial(sample);
      setSelectedMaterialId(sample.id);
    }
  };

  const handleCreateTaskFromTopic = (topic: ExtractedTopic) => {
    onAddStudyTask({
      title: `Study Chapter Notes: ${topic.title}`,
      description: `Review key concepts, definitions, and formulas from ${selectedMaterial?.fileName || 'Material'}.`,
      subject: selectedMaterial?.subject || subjects[0]?.name || 'General',
      deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority: topic.status === 'needs-revision' ? 'Urgent' : 'High',
      estimatedMinutes: 45,
      topicId: topic.id,
    });
  };

  return (
    <div className="space-y-7">
      {/* Top Header */}
      <div className="card-warm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              My Study Materials & Document Scanner
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 font-bold border border-sage-200">
              {materials.length} Document(s)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Upload PDF, DOCX, PPTX, or TXT study notes. EduBridge extracts readable text and extracts key chapters, definitions, and formulas.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-charcoal-700 hover:bg-cream-100 border border-cream-300 transition-colors shadow-subtle self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Load Sample Material</span>
        </button>
      </div>

      {/* Upload Box & Subject Association */}
      <div className="card-warm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-sage-600" />
            <span>Upload New Material</span>
          </div>

          {/* Subject dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <label className="font-semibold text-charcoal-700">Associate with Subject:</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-cream-300 bg-white text-charcoal-800 font-medium focus:ring-1 focus:ring-sage-400"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.proficiency}/5)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag and drop zone */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sage-500 bg-sage-50/60'
              : 'border-cream-300 hover:border-sage-400 bg-cream-50/50 hover:bg-white'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".pdf,.docx,.pptx,.txt"
            className="hidden"
          />

          {isProcessing ? (
            <div className="space-y-3 py-2">
              <Loader2 className="w-8 h-8 text-sage-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-charcoal-900">{processingStage}</p>
              <p className="text-xs text-charcoal-500">
                Parsing formulas, definitions, and synthesizing topic outline...
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center mx-auto border border-sage-200">
                <FileText className="w-6 h-6 text-sage-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-charcoal-900">
                  Click to browse or drag and drop your study file
                </p>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Supports <strong>PDF</strong>, <strong>DOCX</strong>, <strong>PPTX</strong>, and <strong>TXT</strong> (Up to 10MB)
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-100 text-[11px] text-charcoal-600 font-medium border border-cream-200 mt-2">
                <span>⚠️ Scanned-image PDFs without selectable text are not supported</span>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-coral-50 border border-coral-200 text-xs text-coral-900 flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-coral-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Document Processing Error</div>
              <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Material Viewer & Topics Section */}
      {materials.length === 0 ? (
        <div className="p-10 rounded-3xl bg-white border border-dashed border-cream-300 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-charcoal-400 mx-auto" />
          <h3 className="font-extrabold text-charcoal-800 text-base">No study materials uploaded yet</h3>
          <p className="text-xs text-charcoal-500 max-w-md mx-auto">
            Upload your lecture slides, class syllabus, or revision notes above to automatically generate structured topic outlines, AI explanations, and diagnostic quizzes.
          </p>
          <button
            onClick={handleLoadSample}
            className="px-4 py-2 rounded-xl bg-sage-500 text-white font-bold text-xs"
          >
            Load Sample Material Demo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Documents Selector List */}
          <div className="card-warm p-4 space-y-3 lg:col-span-1">
            <div className="text-xs font-bold text-charcoal-500 uppercase tracking-wider px-1">
              Your Documents ({materials.length})
            </div>

            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {materials.map(mat => {
                const isSelected = mat.id === selectedMaterial?.id;
                return (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMaterialId(mat.id)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                      isSelected
                        ? 'bg-sage-50 border-sage-400 shadow-xs'
                        : 'bg-white border-cream-300 hover:border-sage-300'
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="font-bold text-xs text-charcoal-900 truncate">
                        {mat.fileName}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-charcoal-500">
                        <span className="font-semibold text-sage-800">{mat.subject}</span>
                        <span>•</span>
                        <span>{mat.topics.length} topics</span>
                      </div>
                    </div>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteMaterial(mat.id);
                      }}
                      title="Delete material"
                      className="p-1 rounded-lg text-charcoal-400 hover:text-coral-600 hover:bg-coral-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 3 Cols: Active Document Details & Selectable Topic Outline */}
          {selectedMaterial && (
            <div className="lg:col-span-3 space-y-5">
              {/* Document Overview Banner */}
              <div className="card-warm p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sage-100 text-sage-800 uppercase">
                        {selectedMaterial.fileType}
                      </span>
                      <span className="text-xs text-charcoal-400">•</span>
                      <span className="font-bold text-xs text-charcoal-700">
                        {selectedMaterial.subject}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-charcoal-900 mt-1">
                      {selectedMaterial.title}
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                      {selectedMaterial.wordCount} words
                    </span>
                    {selectedMaterial.pageCount && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-charcoal-400" />
                        {selectedMaterial.pageCount} page(s)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-charcoal-700 leading-relaxed bg-cream-50/80 p-3 rounded-xl border border-cream-200">
                  {selectedMaterial.summary}
                </p>
              </div>

              {/* Topics Outline Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-charcoal-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sage-600" />
                    <span>Selectable Topic Outline ({selectedMaterial.topics.length} Modules)</span>
                  </h3>
                  <span className="text-xs text-charcoal-500">
                    Click any topic to study with AI Tutor, test your recall, or add a study task
                  </span>
                </div>

                <div className="space-y-4">
                  {selectedMaterial.topics.map(topic => {
                    const statusColors = {
                      'not-started': 'bg-cream-100 text-charcoal-700 border-cream-200',
                      'learning': 'bg-amber-50 text-amber-800 border-amber-200',
                      'needs-revision': 'bg-coral-50 text-coral-800 border-coral-200',
                      'understood': 'bg-sage-50 text-sage-800 border-sage-200',
                    };

                    const statusLabels = {
                      'not-started': '⚪ Not Started',
                      'learning': '⚡ In Progress',
                      'needs-revision': '⚠️ Needs Revision',
                      'understood': '✅ Understood',
                    };

                    return (
                      <div
                        key={topic.id}
                        className="card-warm p-5 space-y-4 hover:border-sage-400 transition-all"
                      >
                        {/* Topic Header & Status Dropdown */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-charcoal-500">
                                {topic.chapterTitle || selectedMaterial.subject}
                              </span>
                              {topic.sourceSection && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 text-charcoal-600 font-medium">
                                  {topic.sourceSection}
                                </span>
                              )}
                              {topic.lastQuizScore !== undefined && (
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    topic.lastQuizScore >= 75
                                      ? 'bg-sage-100 text-sage-800'
                                      : 'bg-coral-100 text-coral-800'
                                  }`}
                                >
                                  Quiz Score: {topic.lastQuizScore}%
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-base text-charcoal-900">
                              {topic.title}
                            </h4>
                          </div>

                          {/* Status Select */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-charcoal-500 font-medium">Status:</span>
                            <select
                              value={topic.status}
                              onChange={e =>
                                onUpdateTopicStatus(
                                  selectedMaterial.id,
                                  topic.id,
                                  e.target.value as any
                                )
                              }
                              className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                                statusColors[topic.status]
                              }`}
                            >
                              <option value="not-started">{statusLabels['not-started']}</option>
                              <option value="learning">{statusLabels['learning']}</option>
                              <option value="needs-revision">{statusLabels['needs-revision']}</option>
                              <option value="understood">{statusLabels['understood']}</option>
                            </select>
                          </div>
                        </div>

                        {/* Summary & Subtopics */}
                        <p className="text-xs text-charcoal-700 leading-relaxed">
                          {topic.summary}
                        </p>

                        {/* Subtopics pill list */}
                        {topic.subtopics.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-charcoal-500 uppercase">Subtopics:</span>
                            {topic.subtopics.map((sub, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-cream-100 text-charcoal-700 font-medium border border-cream-200"
                              >
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Definitions & Formulas Preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-cream-200/80 text-xs">
                          {topic.definitions.length > 0 && (
                            <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                              <span className="font-bold text-[11px] text-charcoal-800">
                                📖 Key Definition:
                              </span>
                              <p className="text-[11px] text-charcoal-600">
                                <strong className="text-charcoal-900">{topic.definitions[0].term}:</strong>{' '}
                                {topic.definitions[0].definition}
                              </p>
                            </div>
                          )}

                          {topic.formulas.length > 0 && (
                            <div className="p-3 rounded-xl bg-sage-50/50 border border-sage-200/80 space-y-1">
                              <span className="font-bold text-[11px] text-sage-900">
                                📐 Governing Formula:
                              </span>
                              <p className="text-[11px] font-mono text-sage-950 font-bold">
                                {topic.formulas[0].formula}
                              </p>
                              {topic.formulas[0].explanation && (
                                <p className="text-[10px] text-sage-700">
                                  {topic.formulas[0].explanation}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for this Topic */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Study with AI Tutor */}
                            <button
                              onClick={() => onSelectTopicForTutor(selectedMaterial, topic)}
                              className="px-3.5 py-1.5 rounded-xl bg-sage-500 hover:bg-sage-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Study with AI Tutor</span>
                            </button>

                            {/* Take Topic Quiz */}
                            <button
                              onClick={() =>
                                setActiveQuizTopic({
                                  material: selectedMaterial,
                                  topic,
                                })
                              }
                              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-cream-100 text-charcoal-700 font-semibold text-xs border border-cream-300 flex items-center gap-1.5 transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-sage-600" />
                              <span>Take 3-Min Quiz</span>
                            </button>

                            {/* Create Study Task */}
                            <button
                              onClick={() => handleCreateTaskFromTopic(topic)}
                              className="px-3 py-1.5 rounded-xl text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100 font-semibold text-xs flex items-center gap-1 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Task to Planner</span>
                            </button>
                          </div>

                          <button
                            onClick={() => onSelectTopicForTutor(selectedMaterial, topic)}
                            className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1 ml-auto"
                          >
                            <span>Open in Tutor</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz Modal */}
      {activeQuizTopic && (
        <TopicQuizModal
          isOpen={Boolean(activeQuizTopic)}
          onClose={() => setActiveQuizTopic(null)}
          topic={activeQuizTopic.topic}
          documentName={activeQuizTopic.material.fileName}
          questions={[
            {
              id: `q-${activeQuizTopic.topic.id}-1`,
              question: `According to your study material for '${activeQuizTopic.topic.title}', which definition is correct?`,
              options: [
                activeQuizTopic.topic.definitions[0]?.definition || activeQuizTopic.topic.summary,
                'Arbitrary constant with zero variance across closed conductor boundaries.',
                'A non-physical convention used solely in isolated vacuum benchmarks.',
                'Inversely proportional to entropy with no thermodynamic constraint.',
              ],
              correctAnswer: 0,
              explanation: `Directly derived from the definition in your notes: ${activeQuizTopic.topic.definitions[0]?.definition || activeQuizTopic.topic.summary}`,
              topicId: activeQuizTopic.topic.id,
              sourceReference: `${activeQuizTopic.material.fileName} • ${activeQuizTopic.topic.sourceSection || 'Section 1'}`,
            },
            {
              id: `q-${activeQuizTopic.topic.id}-2`,
              question: `What is the principal formula documented in your material for ${activeQuizTopic.topic.title}?`,
              options: [
                'F = m * a^2',
                activeQuizTopic.topic.formulas[0]?.formula || 'E = -dΦ/dt',
                'PV = nRT^2',
                'W = F / d',
              ],
              correctAnswer: 1,
              explanation: `Formula verified from notes: ${activeQuizTopic.topic.formulas[0]?.formula || 'E = -dΦ/dt'}`,
              topicId: activeQuizTopic.topic.id,
              sourceReference: `${activeQuizTopic.material.fileName} • Formula Section`,
            },
            {
              id: `q-${activeQuizTopic.topic.id}-3`,
              question: `Why is the directional rule or negative sign significant in ${activeQuizTopic.topic.title}?`,
              options: [
                'It is purely decorative without physical meaning.',
                'It upholds conservation of energy by opposing the initiating flux change.',
                'It forces the magnitude to remain strictly below zero at all times.',
                'It accounts for thermometer temperature scale shift.',
              ],
              correctAnswer: 1,
              explanation: 'The negative sign reflects Lenz law and energy conservation.',
              topicId: activeQuizTopic.topic.id,
              sourceReference: `${activeQuizTopic.material.fileName} • Principles`,
            },
            {
              id: `q-${activeQuizTopic.topic.id}-4`,
              question: `If the rate of parameter change in '${activeQuizTopic.topic.title}' doubles, the induced output:`,
              options: ['Doubles proportionally.', 'Halves.', 'Decreases to zero.', 'Remains constant.'],
              correctAnswer: 0,
              explanation: 'Linear time-rate dependence causes the output to double proportionally.',
              topicId: activeQuizTopic.topic.id,
              sourceReference: `${activeQuizTopic.material.fileName} • Applications`,
            },
          ]}
          onCompleteQuiz={(topicId, score, passed) => {
            onUpdateTopicStatus(
              activeQuizTopic.material.id,
              topicId,
              passed ? 'understood' : 'needs-revision',
              score
            );
          }}
          onAddStudyTask={onAddStudyTask}
        />
      )}
    </div>
  );
};
