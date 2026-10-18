// ====================================================================
// consoleConfig.ts — static CONSOLE CONFIG (fake data NAHI)
// ====================================================================
// Ye sirf UI copy aur seed hints hain. Yahan koi number/tenant/list
// nahi hai jo API ki jagah dikhe. Fake data poora hata diya gaya hai
// (pehle yeh mocks/platform.ts mein tha).
// ====================================================================

// Backend ke SeedDataInitializer se milta hai (development only)
export const PLATFORM_ACCOUNT = {
  email: "platform@warehouseos.local",
  password: "Platform@12345",
};

// UI copy: roles ka description (data nahi, label hai)
export const roleCards = [
  {
    role: "Super Admin",
    description: "Full platform access: tenants, billing, flags, staff",
  },
  {
    role: "Support Lead",
    description: "Tenant support, impersonation, no billing changes",
  },
  {
    role: "Support",
    description: "Read-only tenant access for troubleshooting",
  },
  {
    role: "Billing Ops",
    description: "Plans, invoices and payment operations only",
  },
];

// UI copy: request review page par dikhne wale verification steps.
// NOTE: backend abhi verification result nahi bhejta — page isey
// "not run" dikhata hai, green tick nahi.
export const automatedChecks = [
  "Business email domain verified",
  "Company registration matched",
  "No duplicate tenant found",
  "Not on restricted-country list",
];
