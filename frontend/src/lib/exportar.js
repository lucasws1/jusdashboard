/**
 * Exporta uma tabela para PDF e dispara o download.
 * As bibliotecas são carregadas sob demanda (lazy) para não impactar o bundle inicial.
 *
 * @param {string[]} cabecalhos  - Nomes das colunas
 * @param {string[][]} linhas    - Cada item é um array de valores na ordem dos cabeçalhos
 * @param {string} titulo        - Título exibido no topo do PDF
 * @param {string} nomeArquivo  - Nome do arquivo sem extensão
 */
export async function exportarPDF(cabecalhos, linhas, titulo, nomeArquivo) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, 14, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    14,
    23,
  );
  doc.setTextColor(0);

  autoTable(doc, {
    head: [cabecalhos],
    body: linhas,
    startY: 28,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { left: 14, right: 14 },
  });

  doc.save(`${nomeArquivo}.pdf`);
}

/**
 * Exporta dados para Excel (.xlsx) e dispara o download.
 * As bibliotecas são carregadas sob demanda (lazy) para não impactar o bundle inicial.
 *
 * @param {string[]} cabecalhos  - Nomes das colunas
 * @param {string[][]} linhas    - Cada item é um array de valores na ordem dos cabeçalhos
 * @param {string} nomeArquivo  - Nome do arquivo sem extensão
 * @param {string} nomePlanilha - Nome da aba na planilha
 */
export async function exportarExcel(
  cabecalhos,
  linhas,
  nomeArquivo,
  nomePlanilha = "Dados",
) {
  const XLSX = await import("xlsx");

  const dados = [cabecalhos, ...linhas];
  const ws = XLSX.utils.aoa_to_sheet(dados);

  // Largura automática das colunas (baseada no maior conteúdo)
  const larguras = cabecalhos.map((col, i) => {
    const maxConteudo = Math.max(
      col.length,
      ...linhas.map((row) => String(row[i] ?? "").length),
    );
    return { wch: Math.min(maxConteudo + 4, 50) };
  });
  ws["!cols"] = larguras;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, nomePlanilha);
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
}
