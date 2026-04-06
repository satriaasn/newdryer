interface ExportDataOption {
  data: Record<string, any>[];
  filename: string;
}

export function exportToCSV({ data, filename }: ExportDataOption) {
  if (!data || !data.length) {
    alert("Tidak ada data untuk diekspor.");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Map data to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...data.map((row) =>
      headers
        .map((fieldName) => {
          let fieldData = row[fieldName];
          // Handle null/undefined
          if (fieldData === null || fieldData === undefined) {
            fieldData = '';
          } else if (typeof fieldData === 'object') {
            fieldData = JSON.stringify(fieldData);
          } else {
            fieldData = String(fieldData);
          }

          // Escape commas and quotes
          fieldData = fieldData.replace(/"/g, '""');
          return `"${fieldData}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Create Blob and download
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
