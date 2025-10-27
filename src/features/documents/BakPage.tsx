import React, { useState, useRef } from 'react';
import { PrintIcon } from '../../components/icons/PrintIcon';
import { DownloadIcon } from '../../components/icons/DownloadIcon';
import { SpinnerIcon } from '../../components/icons/SpinnerIcon';
import { Tooltip } from '../../components/ui/Tooltip';
import { useNotification } from '../../providers/NotificationProvider';

declare const html2canvas: any;
declare const jspdf: any;

const BakPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const addNotification = useNotification();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printableAreaRef.current) {
      addNotification('Konten dokumen belum siap untuk diunduh.', 'error');
      return;
    }

    setIsDownloading(true);
    addNotification('Mempersiapkan file PDF...', 'info');
    
    try {
        const { jsPDF } = jspdf;
        const content = printableAreaRef.current;
        
        const canvas = await html2canvas(content, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            width: content.offsetWidth,
            height: content.offsetHeight,
            windowWidth: content.scrollWidth,
            windowHeight: content.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: 'a4',
            hotfixes: ['px_scaling'],
        });

        const imgProps = pdf.getImageProperties(imgData);
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

        pdf.save('Berita-Acara-Kerjasama-Triniti-Asset.pdf');
    } catch (err) {
        console.error("Error generating PDF:", err);
        addNotification('Gagal membuat file PDF.', 'error');
    } finally {
        setIsDownloading(false);
    }
  };

  // Re-using the styles from PerjanjianPage for consistency
  const bakHtmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Berita Acara Kerjasama</title>
        <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.75; color: #111827; font-size: 12pt; text-align: justify; }
            .page-container { padding: 2.5cm; }
            h2 { font-size: 1.5em; font-weight: bold; text-align: center; text-transform: uppercase; text-decoration: underline; margin-bottom: 0.5em; }
            h3 { font-size: 1.2em; font-weight: bold; text-align: center; margin-top: -1em; margin-bottom: 1.5em; }
            ol { list-style-type: decimal; padding-left: 1.5em; }
            ul { list-style-type: disc; padding-left: 1.5em; }
            li { margin-bottom: 1em; }
            .signature-block { margin-top: 5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: center; break-inside: avoid; }
            .signature-line { border-top: 1px solid black; width: 250px; margin: 100px auto 0 auto; padding-top: 5px; }
            strong { font-weight: bold; }
        </style>
    </head>
    <body>
      <div class="page-container">
        <header>
            <h2>Berita Acara Kesepakatan Kerjasama</h2>
            <h3>NOMOR: 001/BAK-DEV/TMI-AS/X/2025</h3>
        </header>
        <p>Pada hari ini, ........................, tanggal ...... (........................) bulan Oktober tahun Dua Ribu Dua Puluh Lima (2025), yang bertanda tangan di bawah ini telah melakukan dan menyetujui kesepakatan dalam rangka rencana Kerjasama Perancangan dan Pengembangan Aplikasi Inventori Aset ("Aplikasi"), dengan ketentuan sebagai berikut:</p>
        <ol>
            <li>Bahwa <strong>Angga Samuludi Septiawan</strong> ("PIHAK KEDUA") telah mengajukan proposal penawaran untuk pengembangan Aplikasi kepada <strong>PT. TRINITI MEDIA INDONESIA</strong> ("PIHAK PERTAMA") sesuai proposal Nomor: Q-INV/AS/X/2025/001.</li>
            <li>Atas rencana kerjasama tersebut telah disetujui oleh Direksi PIHAK PERTAMA sesuai dengan Perjanjian Kerja Nomor: 001/SPK-DEV/TMI-AS/X/2025.</li>
            <li>Sesuai dengan Surat Persetujuan tersebut di atas, Para Pihak sepakat untuk menuangkan poin-poin kerjasama teknis dan operasional dalam Berita Acara ini.</li>
            <li><strong>Kerjasama Perancangan dan Pengembangan Aplikasi</strong>
                <ol style="list-style-type: lower-alpha;">
                    <li>Para Pihak telah melakukan pembahasan dengan hasil sebagai berikut:
                        <ol style="list-style-type: lower-roman;">
                            <li>Para Pihak sepakat bahwa perancangan dan pengembangan Aplikasi dilaksanakan oleh PIHAK KEDUA selama jangka waktu <strong>10 (sepuluh) minggu</strong>.</li>
                            <li>Atas pekerjaan tersebut, PIHAK PERTAMA akan membayarkan nilai investasi total sebesar <strong>Rp 25.000.000,- (Dua Puluh Lima Juta Rupiah)</strong>.</li>
                        </ol>
                    </li>
                    <li>PIHAK KEDUA akan menerima manfaat berupa pembayaran nilai investasi sesuai dengan termin yang disepakati.</li>
                </ol>
            </li>
            <li><strong>Lingkup Kerjasama</strong>
                <p>Lingkup kerjasama meliputi realisasi modul-modul fungsional dalam bentuk prototipe frontend fungsional penuh, termasuk: Dashboard, Manajemen Aset, Manajemen Pelanggan, Manajemen Pengguna, dan fitur produktivitas lainnya.</p>
            </li>
            <li>Ketentuan lain yang terkait kerjasama ini dituangkan dalam Perjanjian Kerja yang berlaku dan menjadi satu kesatuan yang tidak terpisahkan dengan Berita Acara ini.</li>
        </ol>
        <p>Demikian berita acara ini dibuat dan ditandatangani oleh Para Pihak dalam keadaan sadar dan tanpa ada paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.</p>
        <div class="signature-block">
            <div>
                <p>PIHAK PERTAMA,</p><p><strong>PT. TRINITI MEDIA INDONESIA</strong></p>
                <div class="signature-line"><p><strong>(.........................................)</strong></p><p>Direktur Utama</p></div>
            </div>
            <div>
                <p>PIHAK KEDUA,</p>
                <div class="signature-line" style="margin-top: 116px;"><p><strong>Angga Samuludi Septiawan</strong></p><p>Full-Stack Developer</p></div>
            </div>
        </div>
      </div>
    </body></html>`;


  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center bg-gray-100 min-h-screen">
        <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center no-print">
            <h1 className="text-2xl font-bold text-tm-dark">Berita Acara Kerjasama</h1>
            <div className="flex items-center gap-3">
                <Tooltip text="Unduh sebagai PDF A4">
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-tm-primary border border-transparent rounded-lg shadow-sm hover:bg-tm-primary-hover disabled:bg-gray-400"
                    >
                        {isDownloading ? <SpinnerIcon className="w-4 h-4" /> : <DownloadIcon className="w-4 h-4" />}
                        <span>{isDownloading ? 'Memproses...' : 'Unduh PDF'}</span>
                    </button>
                </Tooltip>
                <Tooltip text="Cetak Dokumen">
                    <button
                        onClick={handlePrint}
                        disabled={isDownloading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <PrintIcon className="w-4 h-4" />
                        <span>Cetak</span>
                    </button>
                </Tooltip>
            </div>
        </div>
      <div 
        ref={printableAreaRef}
        className="printable-area bg-white rounded-lg shadow-lg"
        dangerouslySetInnerHTML={{ __html: bakHtmlContent }}
      />
    </div>
  );
};

export default BakPage;