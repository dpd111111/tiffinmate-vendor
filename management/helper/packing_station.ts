/**
 * =========================================================================
 * HELPER PACKING STATION
 * =========================================================================
 * Assembly checklist for tiffin boxes:
 * - Roti, Sabzi, Dal, Rice, Salad/Sweet checkboxes
 * - Special diet badges ('Strict Jain', 'Low-Oil Satvik')
 * - Dispatch bag grouping by sector and delivery rider
 */

export interface HelperTiffinPackingItem {
  tiffinBoxNumber: string;
  customerName: string;
  deliverySector: string;
  dietBadge: 'pure_veg' | 'strict_jain' | 'satvik';
  checklist: {
    rotiPacked: boolean;
    sabziPacked: boolean;
    dalPacked: boolean;
    ricePacked: boolean;
    saladSweetPacked: boolean;
  };
  isFullyPacked: boolean;
  assignedRiderId: string;
}

export function isTiffinReadyForDispatch(checklist: HelperTiffinPackingItem['checklist']): boolean {
  return (
    checklist.rotiPacked &&
    checklist.sabziPacked &&
    checklist.dalPacked &&
    checklist.ricePacked &&
    checklist.saladSweetPacked
  );
}
