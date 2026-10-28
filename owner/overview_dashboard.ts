/**
 * =========================================================================
 * OWNER OVERVIEW OPERATIONS DASHBOARD
 * =========================================================================
 * Real-time business metrics:
 * - Active subscriptions breakdown (Veg, Jain, Satvik)
 * - Today's lunch & dinner cooking count
 * - Live revenue and collection status
 */

export interface OwnerBusinessOverviewMetrics {
  brandName: string;
  totalActiveCustomers: number;
  todayTotalMealsToCook: {
    breakfast: number;
    lunch: number;
    dinner: number;
    pureVeg: number;
    strictJain: number;
    satvik: number;
  };
  todayFinancials: {
    onlineUpiCollected: number;
    doorstepCashCollected: number;
    pendingReceivables: number;
    todayKitchenExpenses: number;
    netDailyProfit: number;
  };
  activeRidersOnField: number;
  tiffinDeliveredPercent: number;
}
