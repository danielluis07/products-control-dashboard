import type { ItemToNotify } from "@/app/api/[[...route]]/check-expirations";
// Definir as props que o template espera
interface EmailTemplateProps {
  firstName: string;
  items: ItemToNotify[];
  isGlobalAdminSummary?: boolean;
}

// Função helper para formatar a data
function formatarData(dataISO: string) {
  return new Date(dataISO).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC", // Importante, já que as datas vêm do DB
  });
}

// --- Estilos Inline para E-mail ---
// E-mail é chato, CSS inline é a forma mais segura.
const container: React.CSSProperties = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "20px",
  backgroundColor: "#f4f4f4",
};
const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "24px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
};
const heading: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  marginTop: 0,
};
const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#555",
};
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "20px",
};
const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
  backgroundColor: "#f9f9f9",
  fontWeight: "bold",
  color: "#333",
};
const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "10px",
  color: "#444",
};
const footer: React.CSSProperties = {
  marginTop: "20px",
  fontSize: "12px",
  color: "#888",
};
// --- Fim dos Estilos ---

export function EmailTemplate({
  firstName,
  items,
  isGlobalAdminSummary = false,
}: EmailTemplateProps) {
  // Títulos e textos dinâmicos
  const title = isGlobalAdminSummary
    ? "Resumo Diário da Rede"
    : `Olá, ${firstName}!`;

  const subtitle = isGlobalAdminSummary
    ? `Um resumo de ${items.length} novo(s) lote(s) que entraram na janela de alerta de vencimento nas últimas 24h.`
    : `Você tem ${items.length} novo(s) lote(s) que precisam da sua atenção e entraram na janela de alerta de vencimento.`;

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={heading}>{title}</h1>
        <p style={text}>{subtitle}</p>

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Produto</th>
              <th style={th}>Quantidade</th>
              <th style={th}>Data de Vencimento</th>
              {/* Coluna condicional: só aparece para o Admin */}
              {isGlobalAdminSummary && <th style={th}>Posto</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.inventoryItemId}>
                <td style={td}>{item.productName}</td>
                <td style={td}>{item.quantity}</td>
                <td style={{ ...td, color: "#c00" }}>
                  {/* Deixa a data vermelha */}
                  {formatarData(item.expiryDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p style={footer}>
          Este é um e-mail automático. Não é necessário responder.
        </p>
      </div>
    </div>
  );
}
