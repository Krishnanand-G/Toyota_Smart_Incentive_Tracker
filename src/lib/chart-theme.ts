export const chartColors = {
  primary: "#EB0A1E",
  secondary: "#58595B",
  grid: "#E0E0E0",
  axis: "#666666",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E0E0E0",
  tooltipText: "#333333",
  cursor: "rgba(235, 10, 30, 0.2)",
} as const;

export const chartTooltipStyle = {
  background: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: "6px",
  color: chartColors.tooltipText,
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
} as const;
