"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserRole } from "@/types";

export interface DemoSessionState {
  role: UserRole;
  name: string;
  organizationId: string;
  organizationName: string;
  storeId: string;
  storeName: string;
  email: string;
  setRole: (role: UserRole) => void;
  setOrganization: (orgId: string, orgName: string) => void;
  setStore: (storeId: string, storeName: string) => void;
}

const DEFAULT_SESSION: DemoSessionState = {
  role: "business_owner",
  name: "Elena Rostova",
  organizationId: "org_01",
  organizationName: "Apex Supermarket & Grocery",
  storeId: "store_01_main",
  storeName: "Apex Downtown Superstore",
  email: "elena.owner@apexsupermarket.com",
  setRole: () => {},
  setOrganization: () => {},
  setStore: () => {},
};

const DemoSessionContext = createContext<DemoSessionState>(DEFAULT_SESSION);

export const ORG_LIST = [
  { id: "org_01", name: "Apex Supermarket & Grocery", sector: "Supermarket / Grocery" },
  { id: "org_02", name: "Vogue Fashion Hub", sector: "Fashion & Apparel Boutique" },
  { id: "org_03", name: "Volt Consumer Electronics", sector: "Consumer Electronics & Tech" },
];

export const ROLE_PROFILES: Record<UserRole, { name: string; email: string }> = {
  super_admin: { name: "Alexander Vance", email: "superadmin@retailpilot.ai" },
  business_owner: { name: "Elena Rostova", email: "elena.owner@apexsupermarket.com" },
  store_manager: { name: "Marcus Chen", email: "marcus.manager@apexsupermarket.com" },
  sales_staff: { name: "Sarah Jenkins", email: "sarah.pos@apexsupermarket.com" },
  inventory_staff: { name: "David Miller", email: "david.stock@apexsupermarket.com" },
  customer: { name: "Sophia Martinez", email: "sophia.customer@example.com" },
};

export function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("business_owner");
  const [organizationId, setOrgIdState] = useState<string>("org_01");
  const [organizationName, setOrgNameState] = useState<string>("Apex Supermarket & Grocery");
  const [storeId, setStoreIdState] = useState<string>("store_01_main");
  const [storeName, setStoreNameState] = useState<string>("Apex Downtown Superstore");

  useEffect(() => {
    // Load from localStorage if present
    try {
      const savedRole = localStorage.getItem("retailpilot_role") as UserRole;
      const savedOrg = localStorage.getItem("retailpilot_org");
      const savedOrgName = localStorage.getItem("retailpilot_org_name");
      if (savedRole) setRoleState(savedRole);
      if (savedOrg) setOrgIdState(savedOrg);
      if (savedOrgName) setOrgNameState(savedOrgName);
    } catch {
      // ignore
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem("retailpilot_role", newRole);
    } catch {}
  };

  const setOrganization = (orgId: string, orgName: string) => {
    setOrgIdState(orgId);
    setOrgNameState(orgName);
    try {
      localStorage.setItem("retailpilot_org", orgId);
      localStorage.setItem("retailpilot_org_name", orgName);
    } catch {}
  };

  const setStore = (sId: string, sName: string) => {
    setStoreIdState(sId);
    setStoreNameState(sName);
  };

  const profile = ROLE_PROFILES[role] || ROLE_PROFILES.business_owner;

  return (
    <DemoSessionContext.Provider
      value={{
        role,
        name: profile.name,
        email: profile.email,
        organizationId,
        organizationName,
        storeId,
        storeName,
        setRole,
        setOrganization,
        setStore,
      }}
    >
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  return useContext(DemoSessionContext);
}
