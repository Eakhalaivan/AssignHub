import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useWriterData from '../../hooks/useWriterData';
import writerApi from '../../api/writerApi';
import AntigravityCard from '../../components/common/AntigravityCard';
import AssignmentCard from '../../components/writer/AssignmentCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useDropzone } from 'react-dropzone';
import TopNav from '../../components/common/TopNav';
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../../animations/presets';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Briefcase, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function Assignments() {
  const [filter, setFilter] = useState('active');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const { assignments = [], isLoadingAssignments } = useWriterData();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ id, fileObj }) => {
      const formData = new FormData();
      formData.append('file', fileObj);
      return writerApi.uploadCompletedWork(id, formData);
    },
    onSuccess: () => {
      toast.success('File uploaded successfully.');
      queryClient.invalidateQueries(['writerAssignments']);
      setSelectedAssignment(null);
      setFile(null);
    },
    onError: () => {
      toast.error('Failed to upload work files.');
    }
  });

  const filteredAssignments = assignments.filter(a => {
    if (!a) return false;
    const stat = a.status?.toLowerCase();
    if (filter === 'active') return ['assigned', 'in_progress'].includes(stat);
    if (filter === 'completed') return ['completed', 'delivered'].includes(stat);
    return true;
  });

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
    toast.success('Document attached successfully.');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const handleSubmitUpload = () => {
    if (!file || !selectedAssignment) return;
    uploadMutation.mutate({ id: selectedAssignment.id, fileObj: file });
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 select-none"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="font-orbitron font-semibold text-lg text-primary uppercase tracking-wider mb-1">
            Assignments Queue
          </h2>
          <p className="text-xs text-muted font-dm">
            Review detailed requirements specifications and upload final solution files.
          </p>
        </div>

        <div className="flex bg-void p-1 rounded border border-white/5 select-none shrink-0">
          {['active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={clsx(
                "px-4 py-1.5 text-[9px] font-mono uppercase tracking-wider rounded transition-colors",
                filter === tab 
                  ? "bg-[#c5a880]/15 border border-[#c5a880]/30 text-[#c5a880] font-bold" 
                  : "text-muted hover:text-secondary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoadingAssignments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <AntigravityCard key={i} loading variant="default" />
          ))}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-[#111113] border border-white/5 p-16 text-center rounded-md select-none">
          <Briefcase className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-secondary font-orbitron text-xs tracking-wider uppercase font-semibold">No Assignments Found</p>
          <p className="text-muted text-[10px] font-mono mt-1 uppercase tracking-wider">Standby for new customer matchmaking invitations.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map((a, idx) => (
            <AssignmentCard
              key={a.id || idx}
              assignment={a}
              index={idx}
              onAction={(assignment) => setSelectedAssignment(assignment)}
              actionLabel={
                a.status?.toUpperCase() === 'COMPLETED'
                  ? '✓ Uploaded'
                  : 'Deliver Solutions'
              }
            />
          ))}
        </div>
      )}

      {/* Artifact Upload Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => {
          setSelectedAssignment(null);
          setFile(null);
        }}
        title="Deliver Solution Files"
        size="sm"
      >
        <div className="space-y-6">
          <div>
            <p className="text-secondary text-xs leading-relaxed font-dm mb-4">
              Attach the final PDF, DOC, or DOCX document matching the project guidelines.
            </p>
            <div
              {...getRootProps()}
              className={clsx(
                'border border-dashed rounded p-8 text-center transition-colors cursor-pointer',
                isDragActive ? 'border-[#c5a880] bg-[#c5a880]/5' : 'border-white/5 hover:border-zinc-700 hover:bg-[#111113]/50'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center">
                <UploadCloud className="w-8 h-8 text-[#c5a880] mb-3" />

                {file ? (
                  <div className="select-text">
                    <p className="text-[#c5a880] font-bold font-mono text-xs truncate max-w-xs mx-auto mb-1 flex items-center gap-1.5 justify-center">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{file.name}</span>
                    </p>
                    <p className="text-[9px] text-muted font-mono uppercase tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-secondary text-xs font-semibold mb-0.5">
                      {isDragActive ? "Release files here" : "Drag files here or click to browse"}
                    </p>
                    <p className="text-muted text-[9px] font-mono uppercase tracking-wider">PDF, DOC, DOCX accepted (max 25MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => {
              setSelectedAssignment(null);
              setFile(null);
            }} disabled={uploadMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSubmitUpload} 
              disabled={!file}
              loading={uploadMutation.isPending}
            >
              Confirm Delivery
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
