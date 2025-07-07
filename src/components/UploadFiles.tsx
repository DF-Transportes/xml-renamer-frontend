import React, { useRef, useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function UploadFiles() {
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 500) {
            setSelectedFiles(null);
            setError('Você pode enviar no máximo 500 arquivos por vez.');

            // Limpa visualmente o input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setSelectedFiles(files);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFiles || selectedFiles.length === 0) {
            setError('Selecione ao menos 1 arquivo.');
            return;
        }

        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => formData.append('files', file));

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('https://xml-renamer-backend.onrender.com/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Erro no upload');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'renomeados.zip';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message || 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Renomear XMLs
                </h1>

                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xml"
                        multiple
                        onChange={handleFileChange}
                        className="border border-gray-300 rounded px-4 py-3 cursor-pointer"
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                        <div className="flex items-center gap-3 bg-blue-50 border border-blue-300 rounded px-4 py-2 select-none">
                            <CloudArrowUpIcon className="h-7 w-7 text-blue-600" />
                            <span className="text-blue-800 font-semibold text-lg">
                                {selectedFiles.length} arquivo{selectedFiles.length > 1 ? 's' : ''} selecionado{selectedFiles.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>

                {error && (
                    <p className="text-red-600 text-center text-sm mt-2">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
