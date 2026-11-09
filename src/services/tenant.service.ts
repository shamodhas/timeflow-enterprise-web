import api from "./api"

export interface TestDbResponse {
  connected: boolean
  latencyMs: number
  serverVersion?: string
  maskedUrl: string
  error?: string
}

export interface OnboardTenantPayload {
  name: string
  slug: string
  domain?: string
  primaryColor?: string
  plan: "FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE"
  dbStrategy: "DEFAULT_HOST" | "DEDICATED_MANAGED" | "BYOD_CUSTOM"
  customDatabaseUrl?: string
  dbSslRequired?: boolean
  timezone?: string
  adminFullName: string
  adminEmail: string
  adminPassword: string
  adminEmployeeCode?: string
}

export const resolveWorkspace = async (params: {
  slug?: string
  email?: string
}) => {
  const res = await api.get("/tenants/resolve", {
    params,
    headers: { "X-Skip-Loader": "true" }
  })
  return res.data
}

export const testCustomDatabase = async (
  databaseUrl: string,
  sslRequired = true
): Promise<TestDbResponse> => {
  const res = await api.post("/tenants/test-db", {
    databaseUrl,
    sslRequired
  })
  return res.data
}

export const onboardNewTenant = async (payload: OnboardTenantPayload) => {
  const res = await api.post("/tenants/onboard", payload)
  return res.data
}

export const getCurrentTenantDetails = async () => {
  const res = await api.get("/tenants/current")
  return res.data
}

export const listAllTenants = async () => {
  const res = await api.get("/tenants")
  return res.data
}

export const updateTenantDatabaseConfig = async (payload: {
  tenantId?: string
  customDatabaseUrl?: string
  dbStrategy?: "DEFAULT_HOST" | "DEDICATED_MANAGED" | "BYOD_CUSTOM"
  dbSslRequired?: boolean
  name?: string
  primaryColor?: string
  timezone?: string
  plan?: "FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE"
  maxEmployees?: number
  maxBranches?: number
}) => {
  const endpoint = payload.tenantId
    ? `/tenants/${payload.tenantId}/database`
    : "/tenants/current/database"
  const res = await api.put(endpoint, payload)
  return res.data
}
