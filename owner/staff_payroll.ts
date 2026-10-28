/**
 * =========================================================================
 * OWNER STAFF PAYROLL & SALARY CONTROL
 * =========================================================================
 * Owner-exclusive authority to approve monthly staff salaries, advances,
 * and bonuses.
 */

export interface StaffSalaryRecord {
  staffId: string;
  name: string;
  role: 'cook' | 'helper' | 'delivery' | 'manager';
  baseSalary: number;
  advancesDeducted: number;
  incentives: number;
  netPayable: number;
  monthString: string;
  isOwnerApproved: boolean;
  approvedAt?: string;
  paidVia?: string;
}

export function calculateNetSalary(base: number, advances: number, incentives: number): number {
  return Math.max(0, (base || 0) + (incentives || 0) - (advances || 0));
}
