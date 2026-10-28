/**
 * =========================================================================
 * TIFFINMATE UNIFIED ROLE-BASED NAVIGATION SYSTEM
 * =========================================================================
 * Maps user roles (Owner, Manager, Cook, Helper, Delivery, Vendor, Customer)
 * to their respective views and permissions to eliminate file confusion
 * and ensure that adding new features never breaks existing functionality.
 */

export type UserRole = 
  | 'customer'
  | 'owner'
  | 'manager'
  | 'cook'
  | 'helper'
  | 'delivery'
  | 'vendor'
  | 'inventory';

export interface RoleNavigationRoute {
  role: UserRole;
  title: string;
  hindiTitle: string;
  defaultView: string;
  queryParam: string;
  allowedViews: string[];
  requiresAuth: boolean;
  authType: 'none' | 'customer_phone' | 'staff_pin' | 'owner_credentials';
  themeColor: string;
  badgeIcon: string;
}

export const ROLE_NAVIGATION_REGISTRY: Record<UserRole, RoleNavigationRoute> = {
  customer: {
    role: 'customer',
    title: 'Customer Meal & Subscription Portal',
    hindiTitle: 'ग्राहक पोर्टल (थाली बुकिंग व ट्रैकिंग)',
    defaultView: 'customer',
    queryParam: 'mode=customer',
    allowedViews: ['customer', 'menu', 'booking', 'tracking', 'profile', 'pause_meal', 'referrals'],
    requiresAuth: false,
    authType: 'customer_phone',
    themeColor: '#2E7D32',
    badgeIcon: '🍱'
  },
  owner: {
    role: 'owner',
    title: 'Super Admin & Owner Master Control Center',
    hindiTitle: 'मालिक कंट्रोल रूम (ऑनर डैशबोर्ड व बहीखाता)',
    defaultView: 'admin',
    queryParam: 'app=owner',
    allowedViews: [
      'admin',
      'overview',
      'subscription_sales',
      'plan_approval_desk',
      'accounts_ledger',
      'payment_history',
      'owner_salary_control',
      'security_deposit',
      'owner_vault',
      'owner_dish_audit',
      'customers',
      'staff',
      'menu_card_builder',
      'reviews_moderation'
    ],
    requiresAuth: true,
    authType: 'owner_credentials',
    themeColor: '#0F172A',
    badgeIcon: '👑'
  },
  manager: {
    role: 'manager',
    title: 'Operations Hub • Manager Console',
    hindiTitle: 'मैनेजर ऑपरेशन्स कंसोल',
    defaultView: 'admin',
    queryParam: 'app=manager',
    allowedViews: [
      'admin',
      'manager_tasks',
      'manager_staff_onboarding',
      'plan_approval_desk',
      'orders_pipeline',
      'tiffin_delivery_audit',
      'manager_dish_evaluation',
      'kitchen_prep',
      'inventory',
      'vendor_portal'
    ],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#D97706',
    badgeIcon: '👔'
  },
  cook: {
    role: 'cook',
    title: 'Kitchen Station • Cook Terminal',
    hindiTitle: 'रसोई टर्मिनल (शेफ़ / कुक)',
    defaultView: 'admin',
    queryParam: 'app=cook',
    allowedViews: ['admin', 'cook_terminal', 'kitchen_prep', 'manager_dish_evaluation'],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#EA580C',
    badgeIcon: '👨‍🍳'
  },
  helper: {
    role: 'helper',
    title: 'Packing Station • Helper Hub',
    hindiTitle: 'पैकिंग स्टेशन (हेल्पर)',
    defaultView: 'admin',
    queryParam: 'app=helper',
    allowedViews: ['admin', 'packing_station', 'orders_pipeline'],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#0284C7',
    badgeIcon: '🍱'
  },
  delivery: {
    role: 'delivery',
    title: 'Delivery Partner GPS Dispatch Console',
    hindiTitle: 'डिलीवरी राइडर GPS ऐप',
    defaultView: 'rider',
    queryParam: 'app=delivery',
    allowedViews: ['rider', 'orders_pipeline', 'tiffin_delivery_audit', 'ontime_analytics'],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#059669',
    badgeIcon: '🛵'
  },
  vendor: {
    role: 'vendor',
    title: 'Supplier & Procurement Desk',
    hindiTitle: 'वेंडर व कच्चा माल सप्लायर पोर्टल',
    defaultView: 'admin',
    queryParam: 'app=vendor',
    allowedViews: ['admin', 'vendor_portal', 'inventory'],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#7C3AED',
    badgeIcon: '🏪'
  },
  inventory: {
    role: 'inventory',
    title: 'Kitchen Inventory & Stock Warehouse',
    hindiTitle: 'राशन गोदाम व इन्वेंट्री मैनेजमेंट',
    defaultView: 'admin',
    queryParam: 'app=inventory',
    allowedViews: ['admin', 'inventory', 'vendor_portal', 'kitchen_prep'],
    requiresAuth: true,
    authType: 'staff_pin',
    themeColor: '#475569',
    badgeIcon: '📦'
  }
};

/**
 * Resolves current active application role from URL params and session storage
 */
export function resolveCurrentRole(searchQuery: string = ''): UserRole {
  if (typeof window === 'undefined') return 'customer';

  const params = new URLSearchParams(searchQuery || window.location.search);
  const appParam = params.get('app') || params.get('role');
  const viewParam = params.get('view') || params.get('portal');
  const modeParam = params.get('mode');

  // Explicit customer mode
  if (modeParam === 'customer' || viewParam === 'customer') {
    return 'customer';
  }

  // Owner indicators
  if (
    appParam === 'owner' || 
    viewParam === 'owner' || 
    viewParam === 'owner_private_gate' || 
    viewParam === 'navovia_master'
  ) {
    return 'owner';
  }

  // Direct role matches
  if (appParam && appParam in ROLE_NAVIGATION_REGISTRY) {
    return appParam as UserRole;
  }

  // View matches
  if (viewParam === 'rider' || viewParam === 'delivery') return 'delivery';
  if (viewParam === 'admin' || viewParam === 'management') return 'owner';
  if (viewParam === 'cook') return 'cook';
  if (viewParam === 'helper') return 'helper';
  if (viewParam === 'vendor') return 'vendor';

  // Default fallback is always customer-facing UI
  return 'customer';
}
