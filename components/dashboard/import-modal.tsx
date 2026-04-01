import { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, X, Loader2, Download } from 'lucide-react';

interface ImportModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportModal({ title, isOpen, onClose, onSuccess }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setStatus('idle');
    
    // Simulate upload delay for UI effect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    setStatus('success');
    setLoading(false);
    
    setTimeout(() => {
      onSuccess?.();
      onClose();
      setFile(null);
      setStatus('idle');
    }, 2000);
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A]">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Upload file CSV atau Excel (.xlsx)</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" />
            
            {file ? (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <FileType className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0F172A]">Klik untuk memilih file</p>
                  <p className="text-xs text-muted-foreground mt-1">atau drag & drop file ke area ini</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
             <AlertCircle className="h-5 w-5 shrink-0 text-blue-500" />
             <div className="space-y-1">
               <p className="font-semibold">Format Kolom</p>
               <p className="text-xs text-blue-700/80">Pastikan format kolom tabel sesuai dengan template yang tersedia agar data terbaca dengan benar.</p>
               <button 
                 onClick={() => {
                   const link = document.createElement('a');
                   link.href = '/template-import.csv';
                   link.download = 'template-import.csv';
                   link.click();
                 }}
                 className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-2"
               >
                 <Download className="h-3 w-3" /> Unduh Template CSV
               </button>
             </div>
          </div>

          {status === 'success' && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="h-5 w-5" />
              Data berhasil diimport!
            </div>
          )}

          {status === 'error' && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold animate-in fade-in">
              <AlertCircle className="h-5 w-5" />
              Terjadi kesalahan format data
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {file && status !== 'success' && (
               <button 
                 onClick={reset}
                 disabled={loading}
                 className="flex-1 px-4 py-2.5 rounded-xl border font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
               >
                 Ganti File
               </button>
            )}
            <button 
              onClick={status === 'success' ? onClose : handleImport}
              disabled={!file || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F172A] text-white font-semibold text-sm hover:bg-[#1E293B] shadow-lg shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (status === 'success' ? 'Selesai' : 'Mulai Import')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
