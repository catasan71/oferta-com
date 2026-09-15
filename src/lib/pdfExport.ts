import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Quote } from '../types.ts';

export interface PdfExportResult {
  success: boolean;
  blobUrl?: string;
  fileName?: string;
  error?: string;
}

/**
 * Capturează elementul vizual HTML al ofertei și îl convertește într-un PDF A4
 * de înaltă rezoluție, păstrând 100% fonturile, culorile, diacriticele și așezarea în pagină.
 */
export async function exportQuoteToPdf(quote: Quote, elementId: string = 'quote-document-paper'): Promise<PdfExportResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    return {
      success: false,
      error: `Elementul "${elementId}" nu a fost găsit în pagină.`,
    };
  }

  const cleanClientName = (quote.client_name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Oferta_${quote.numar_oferta}_${cleanClientName}.pdf`;

  try {
    // Opțiuni optime pentru html2canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Rezoluție Retina / 300 DPI pentru claritate maximă
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024,
      onclone: (clonedDoc) => {
        const clonedPaper = clonedDoc.getElementById(elementId);
        if (clonedPaper) {
          // Eliminăm rotunjirea și umbrele de ecran pentru un document tipărit impecabil
          clonedPaper.style.boxShadow = 'none';
          clonedPaper.style.border = 'none';
          clonedPaper.style.borderRadius = '0';
          clonedPaper.style.width = '820px';
          clonedPaper.style.maxWidth = '820px';
          clonedPaper.style.margin = '0 auto';
        }

        // Ascundem butoanele interactive nerelevante pe PDF
        clonedDoc.querySelectorAll('.print\\:hidden').forEach((node) => {
          (node as HTMLElement).style.display = 'none';
        });
      },
    });

    // Dimensiuni standard A4 în milimetri
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 8; // mm
    const contentWidth = pageWidth - margin * 2; // 194 mm
    const contentHeight = pageHeight - margin * 2; // 281 mm

    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.96);

    let heightLeft = imgHeight;
    let position = margin;

    // Pagina 1
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;

    // Paginile următoare (dacă documentul are multe articole)
    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= contentHeight;
    }

    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);

    // Declanșare automată descărcare
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
    }, 1000);

    return {
      success: true,
      blobUrl,
      fileName,
    };
  } catch (err: any) {
    console.error('Eroare exportQuoteToPdf:', err);
    return {
      success: false,
      error: err?.message || 'A apărut o eroare la generarea PDF-ului.',
    };
  }
}
