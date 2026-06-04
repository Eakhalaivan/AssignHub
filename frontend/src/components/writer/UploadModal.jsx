import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import GlowButton from '../common/GlowButton';

export const UploadModal = ({ isOpen, onClose, onUpload, isLoading }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
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

  const handleSubmit = () => {
    if (!file) return;
    onUpload(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-zinc-800 shadow-3xl animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <h3 className="text-xl font-black tracking-wide text-zinc-100 mb-2 uppercase">
          Upload Artifact
        </h3>
        <p className="text-zinc-500 text-xs tracking-wide mb-6">Attach completed PDF/DOCX payload for evaluation.</p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
            isDragActive 
              ? 'border-sky-500 bg-sky-500/5 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]' 
              : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/60'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center justify-center">
            <svg className="w-10 h-10 text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>

            {file ? (
              <div>
                <p className="text-sky-400 font-bold tracking-wide truncate max-w-xs mx-auto mb-1">{file.name}</p>
                <p className="text-[10px] text-zinc-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
              </div>
            ) : (
              <div>
                <p className="text-zinc-300 text-sm font-semibold mb-1">
                  {isDragActive ? "Release to buffer" : "Drop payload here"}
                </p>
                <p className="text-zinc-600 text-xs">PDF, DOCX allowed (max 25MB)</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <GlowButton variant="outline" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs tracking-wider uppercase">
            Cancel
          </GlowButton>
          <GlowButton 
            onClick={handleSubmit} 
            disabled={isLoading || !file} 
            className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-sky-500 shadow-glow-accent/20"
          >
            {isLoading ? 'Broadcasting...' : 'Confirm Submission'}
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
