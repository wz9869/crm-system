import type { CustomerGrade } from "./types";

/** 表结构无评分字段时占位，避免引用方报错 */
export function calculateCustomerScore(_customer: unknown): number {
  return 0;
}

export function calculateCustomerGrade(_customer: unknown): CustomerGrade {
  return "C";
}
