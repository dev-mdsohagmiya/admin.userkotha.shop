/*
  We export the styles as a string so they can be injected into 
  the print window and PDF generator dynamically.
  This mirrors the content of print.css
*/
export const getPrintStyles = (bgUrl: string) => `
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: transparent;
  color: #111827;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

.page-container {
  position: relative;
  min-height: 100vh;
  padding: 10px;
}

/* Background watermark */
.page-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('${bgUrl}');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 110px auto;
  opacity: 0.2;
  z-index: -1;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.header img {
  height: 60px;
  margin-bottom: 10px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin-top: 5px;
}

.table-container {
  margin-top: 40px;
  background: transparent;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
}

th {
  background: #15803d; /* Green header */
  color: white;
  text-align: left;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 600;
}

td {
  background: transparent !important;
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #374151;
}

tr:hover td {
  background: rgba(241, 245, 249, 0.2);
}

.footer {
  text-align: center;
  margin-top: 40px;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid #e2e8f0;
  padding-top: 10px;
}

@media print {
  @page {
    margin: 1cm;
  }
  .no-print {
    display: none !important;
  }
}

.print-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #2563eb;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  z-index: 1000;
}

.page-number {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 11px;
  color: #64748b;
  z-index: 1000;
  display: none;
}
`;
