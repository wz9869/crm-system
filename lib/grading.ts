import type { Customer, CustomerGrade, ProjectStage } from "./types";

const stageScoreMap: Record<ProjectStage, number> = {
  "New Inquiry": 5,
  Sampling: 12,
  Quoting: 18,
  Negotiating: 24,
  "Closed Won": 30,
  "Closed Lost": 0,
};

function quantityScore(quantity: number): number {
  if (quantity >= 50) return 30;
  if (quantity >= 25) return 24;
  if (quantity >= 12) return 18;
  if (quantity >= 5) return 10;
  return 5;
}

function budgetScore(level: Customer["budgetClarity"]): number {
  if (level === "High") return 20;
  if (level === "Medium") return 12;
  return 6;
}

function responseScore(speed: Customer["responseSpeed"]): number {
  if (speed === "Fast") return 20;
  if (speed === "Medium") return 12;
  return 6;
}

export function calculateCustomerScore(customer: Customer): number {
  const score =
    quantityScore(customer.estimatedQuantity) +
    budgetScore(customer.budgetClarity) +
    responseScore(customer.responseSpeed) +
    stageScoreMap[customer.projectStage];

  return Math.max(0, Math.min(100, score));
}

export function calculateCustomerGrade(customer: Customer): CustomerGrade {
  const total = calculateCustomerScore(customer);
  if (total >= 80) return "A";
  if (total >= 65) return "B";
  if (total >= 50) return "C";
  return "D";
}
