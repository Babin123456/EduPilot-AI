/**
 * EduPilot AI — Professional Exporters for Excel & Presentation Documents
 */

// 1. Export Excel CSV format (readable directly by Microsoft Excel & Google Sheets)
export function downloadExcelSheet(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvRows: string[] = [];
  
  // Header line
  csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));

  // Data rows
  rows.forEach(row => {
    csvRows.push(row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// 2. Export Structured Presentation PPT Outline (compatible with PowerPoint / Google Slides)
export function downloadPresentationOutline(filename: string, slides: { title: string; bullets: string[] }[]) {
  let content = `====================================================\n`;
  content += `EDUPILOT AI — ACADEMIC PRESENTATION SLIDE OUTLINE\n`;
  content += `Generated for Adamas University • ${new Date().toLocaleDateString('en-IN')}\n`;
  content += `====================================================\n\n`;

  slides.forEach((slide, idx) => {
    content += `SLIDE ${idx + 1}: ${slide.title.toUpperCase()}\n`;
    content += `----------------------------------------------------\n`;
    slide.bullets.forEach(b => {
      content += `• ${b}\n`;
    });
    content += `\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.txt') ? filename : `${filename}_PPT_Outline.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
