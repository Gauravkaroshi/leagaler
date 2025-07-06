let matchedRows = [];
let fourthColumnWords = new Set();

function searchTables() {
  const fileInput = document.getElementById('fileInput');
  const resultDiv = document.getElementById('result');
  const columnFilter = document.getElementById('columnFilter').value;
  const searches = [
    document.getElementById('search1').value.trim(),
    document.getElementById('search2').value.trim(),
    document.getElementById('search3').value.trim(),
    document.getElementById('search4').value.trim(),
    document.getElementById('search5').value.trim(),
    document.getElementById('search6').value.trim()
  ];

  matchedRows = [];
  fourthColumnWords.clear();
  resultDiv.innerHTML = '';

  Array.from(fileInput.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(e.target.result, "text/html");
      const tables = doc.querySelectorAll('table');

      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');

        rows.forEach(row => {
          const cells = row.querySelectorAll('td, th');
          const rowText = row.textContent;
          const fourthColText = cells[3]?.textContent || "";

          if (cells.length >= 4) {
            fourthColumnWords.add(fourthColText.trim());
          }

          const matches = searches.every(word => word === "" || rowText.includes(word));
          const matchFilter = columnFilter === "" || fourthColText.includes(columnFilter);

          if (matches && matchFilter) {
            const clonedRow = row.cloneNode(true);
            searches.forEach(word => {
              if (word) clonedRow.innerHTML = clonedRow.innerHTML.replaceAll(word, `<mark>${word}</mark>`);
            });
            if (columnFilter) clonedRow.innerHTML = clonedRow.innerHTML.replaceAll(columnFilter, `<mark>${columnFilter}</mark>`);

            matchedRows.push(clonedRow.outerHTML);
resultDiv.innerHTML += `
  <div class="result-table-wrapper">
    <table><tr>${clonedRow.innerHTML}</tr></table>
  </div>`;
          }
        });
      });

      updateColumnFilter();
    };
    reader.readAsText(file);
  });
}

function updateColumnFilter() {
  const dropdown = document.getElementById('columnFilter');
  const currentValue = dropdown.value;
  dropdown.innerHTML = '<option value="">-- Select a word --</option>';

  Array.from(fourthColumnWords).sort().forEach(word => {
    const option = document.createElement('option');
    option.value = word;
    option.textContent = word;
    dropdown.appendChild(option);
  });

  dropdown.value = currentValue;
}

function downloadDoc() {
  if (!matchedRows.length) {
    alert("No results to export.");
    return;
  }

  const tableHTML = `<table><tbody>${matchedRows.join("")}</tbody></table>`;
  const fullHTML = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>Marathi Search Result</title>
      <style>
        @page {
          size: A4;
          margin: 1in;
        }
        body {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 12pt;
        }
        table, td, th {
          border: 1px solid black;
          border-collapse: collapse;
        }
        td, th {
          padding: 6px;
        }
        mark {
          background-color: yellow;
        }
      </style>
    </head>
    <body>${tableHTML}</body>
    </html>`;

  const blob = new Blob(['\ufeff', fullHTML], {
    type: 'application/msword',
  });

  saveAs(blob, "Marathi_Search_Result.doc");
}

function downloadExcel() {
  if (!matchedRows.length) {
    alert("No results to export.");
    return;
  }

  const tempTable = document.createElement("table");
  tempTable.innerHTML = matchedRows.join("");

  const ws = XLSX.utils.table_to_sheet(tempTable);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Filtered Results");

  XLSX.writeFile(wb, "Marathi_Search_Result.xlsx");
}

document.getElementById('fileInput').addEventListener('change', function () {
  const count = this.files.length;
  document.getElementById('fileCount').textContent = count
    ? `${count} फाइल${count > 1 ? '्स' : ''} निवडल्या`
    : "कोणतीही फाइल निवडलेली नाही";
});
