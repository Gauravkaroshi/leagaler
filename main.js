let matchedRows = [];

function searchWord() {
  matchedRows = [];

  const words = [
    document.getElementById("searchInput1").value.trim(),
    document.getElementById("searchInput2").value.trim(),
    document.getElementById("searchInput3").value.trim(),
    document.getElementById("searchInput4").value.trim(),
    document.getElementById("searchInput5").value.trim(),
    document.getElementById("searchInput6").value.trim()
  ];

  const basicWords = words.slice(0, 5).filter(Boolean);  // First 5 words
  const word6 = words[5];  // Special case for variation match

  if (!basicWords.length && !word6) {
    alert("Please enter at least one Marathi word.");
    return;
  }

  const files = document.getElementById("fileInput").files;
  if (!files.length) {
    alert("Please upload at least one .xls file.");
    return;
  }

  Array.from(files).forEach(file => {
    if (file.name.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const fileContent = event.target.result;
        extractMatchingRows(fileContent, basicWords, word6);
      };
      reader.readAsText(file, "UTF-8");
    } else {
      alert("Only .xls files are supported.");
    }
  });
}

function extractMatchingRows(htmlContent, searchWords, variationWord) {
  const temp = document.createElement("div");
  temp.innerHTML = htmlContent;
  const rows = temp.querySelectorAll("tr");

  rows.forEach(row => {
    const rowText = row.innerText;
    const baseMatch = searchWords.every(word => rowText.includes(word));

    // Build flexible RegExp for searchInput6
    if (baseMatch && variationWord) {
      const pattern = variationWord
        .replace(/ा/g, '[ा|]')
        .replace(/ि/g, '[ि|]')
        .replace(/ी/g, '[ी|]')
        .replace(/ु/g, '[ु|]')
        .replace(/ू/g, '[ू|]')
        .replace(/े/g, '[े|]')
        .replace(/ै/g, '[ै|]')
        .replace(/ो/g, '[ो|]')
        .replace(/ौ/g, '[ौ|]');
      const regex6 = new RegExp(pattern, 'gi');

      if (regex6.test(rowText)) {
        let rowHTML = row.innerHTML;

        searchWords.forEach(word => {
          const regex = new RegExp(`(${word})`, 'gi');
          rowHTML = rowHTML.replace(regex, '<mark>$1</mark>');
        });

        rowHTML = rowHTML.replace(regex6, '<mark>$1</mark>');
        matchedRows.push("<tr>" + rowHTML + "</tr>");
      }
    } else if (baseMatch && !variationWord) {
      let rowHTML = row.innerHTML;
      searchWords.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        rowHTML = rowHTML.replace(regex, '<mark>$1</mark>');
      });
      matchedRows.push("<tr>" + rowHTML + "</tr>");
    }
  });

  displayResults();
}

function displayResults() {
  const resultsDiv = document.getElementById("results");
  if (!matchedRows.length) {
    resultsDiv.innerHTML = "<p>No matching rows found.</p>";
    return;
  }

  const tableHTML = `<table><tbody>${matchedRows.join("")}</tbody></table>`;
  resultsDiv.innerHTML = tableHTML;
}

function downloadDoc() {
  if (!matchedRows.length) {
    alert("No results to export.");
    return;
  }

  const content = `<table><tbody>${matchedRows.join("")}</tbody></table>`;
  const converted = window.htmlDocx.asBlob(content);
  saveAs(converted, "Marathi_Search_Result.docx");
}
