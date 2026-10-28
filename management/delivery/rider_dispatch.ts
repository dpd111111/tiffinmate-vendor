/**
 * =========================================================================
 * DELIVERY RIDER GPS CONSOLE & DISPATCH
 * =========================================================================
 * Rider mobile route navigation, doorstep customer contact,
 * OTP delivery confirmation, and cash on delivery collections.
 */

export interface RiderDeliveryStop {
  stopIndex: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  paymentMode: 'prepaid' | 'cod_pending';
  amountToCollect: number;
  deliveryOtp: string;
  isDelivered: boolean;
  deliveredAt?: string;
  proofPhotoUrl?: string;
}

export function verifyDoorstepDeliveryOtp(enteredOtp: string, expectedOtp: string): boolean {
  if (!enteredOtp || !expectedOtp) return false;
  return enteredOtp.trim() === expectedOtp.trim();
}
