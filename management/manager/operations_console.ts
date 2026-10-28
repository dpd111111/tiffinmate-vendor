/**
 * =========================================================================
 * MANAGER OPERATIONS CONSOLE
 * =========================================================================
 * Daily staff task assignments, attendance tracking, customer plan
 * payment verification and approval.
 */

export interface ManagerStaffTask {
  id: string;
  assignedStaffId: string;
  staffName: string;
  role: 'cook' | 'helper' | 'delivery';
  taskTitle: string;
  description: string;
  deadlineTime: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignedBy: string;
}

export interface PlanApprovalQueueItem {
  orderId: string;
  customerName: string;
  customerPhone: string;
  planName: string;
  amount: number;
  paymentMode: 'online_upi' | 'doorstep_cash';
  utrNumber?: string;
  submittedAt: string;
  isApproved: boolean;
  approvedBy?: string;
}
