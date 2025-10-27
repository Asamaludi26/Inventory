import React, { useState, useEffect, useRef } from 'react';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { ExclamationTriangleIcon } from '../../components/icons/ExclamationTriangleIcon';
import { PrintIcon } from '../../components/icons/PrintIcon';
import { DownloadIcon } from '../../components/icons/DownloadIcon';
import { Tooltip } from '../../components/ui/Tooltip';
import { useNotification } from '../../providers/NotificationProvider';

declare const html2canvas: any;
declare const jspdf: any;

const PerjanjianPage: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const addNotification = useNotification();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch('/Docs/Business/perjanjian.html');
        if (!response.ok) {
          throw new Error(`Gagal memuat dokumen: Status ${response.status}`);
        }
        const text = await response.text();
        setHtmlContent(text);
      } catch (e: any) {
        setError(e.message || 'Terjadi kesalahan saat mengambil dokumen.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, []);

  const handlePrint = () => {
    if (!iframeRef.current?.contentWindow) {
      addNotification('Konten dokumen belum siap untuk dicetak.', 'error');
      return;
    }
    iframeRef.current.contentWindow.focus();
    iframeRef.current.contentWindow.print();
  };

  const handleDownloadPdf = async () => {
    if (!iframeRef.current?.contentWindow?.document?.body) {
      addNotification('Konten dokumen belum siap untuk diunduh.', 'error');
      return;
    }

    setIsDownloading(true);
    addNotification('Mempersiapkan file PDF...', 'info');
    
    try {
        const { jsPDF } = jspdf;
        const doc = iframeRef.current.contentWindow.document;
        const container = doc.querySelector('.container') as HTMLElement;
        if (!container) throw new Error('Elemen konten tidak ditemukan.');

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
            hotfixes: ['px_scaling'],
        });

        const imgProps= pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfHeight;
        let position = 0;
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('Perjanjian-Kerja-Triniti-Asset.pdf');
    } catch (err) {
        console.error("Error generating PDF:", err);
        addNotification('Gagal membuat file PDF.', 'error');
    } finally {
        setIsDownloading(false);
    }
  };


  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 no-print">
        <h1 className="text-2xl font-bold text-tm-dark">Perjanjian Kerja</h1>
        <div className="flex items-center gap-3">
          <Tooltip text="Unduh dokumen sebagai file PDF berformat A4.">
            <button
                onClick={handleDownloadPdf}
                disabled={isLoading || !!error || isDownloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 bg-tm-primary border border-transparent rounded-lg shadow-sm hover:bg-tm-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-gray-400"
            >
                {isDownloading ? <SpinnerIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                <span>{isDownloading ? 'Memproses...' : 'Unduh PDF'}</span>
            </button>
          </Tooltip>
          <Tooltip text="Membuka dialog cetak untuk mencetak dokumen ke printer.">
            <button
                onClick={handlePrint}
                disabled={isLoading || !!error || isDownloading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tm-accent disabled:bg-gray-300"
            >
                <PrintIcon className="w-4 h-4" />
                <span>Cetak</span>
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="flex-grow w-full border rounded-xl shadow-md overflow-hidden bg-white flex items-center justify-center">
        {isLoading && (
            <div className="flex flex-col items-center text-gray-500">
                <SpinnerIcon className="w-8 h-8" />
                <p className="mt-2">Memuat Dokumen...</p>
            </div>
        )}
        {error && (
            <div className="text-center text-red-600">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto" />
                <p className="mt-2 font-semibold">Gagal Memuat</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        {!isLoading && !error && (
            <iframe 
                ref={iframeRef}
                srcDoc={htmlContent}
                title="Perjanjian Kerja" 
                style={{width: '100%', height: '100%', border: 0}}
                sandbox="allow-scripts allow-same-origin"
            />
        )}
      </div>
    </div>
  );
};

export default PerjanjianPage;