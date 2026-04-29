import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { tenantService } from '@/services/api'
import type { TenantDetail } from '@/types'

export const useTenantStore = defineStore('tenant', () => {
  const tenant  = ref<TenantDetail | null>(null)
  const loading = ref(false)
  const error   = ref<'not-found' | 'error' | null>(null)

  const isLoaded      = computed(() => tenant.value !== null)
  const slug          = computed(() => tenant.value?.slug          ?? null)
  const name          = computed(() => tenant.value?.name          ?? null)
  const logoUrl       = computed(() => tenant.value?.logoUrl       ?? null)
  const primaryColor  = computed(() => tenant.value?.primaryColor  ?? null)
  const shippingCost  = computed(() => tenant.value?.shippingCost  ?? 0)
  const shippingNotes = computed(() => tenant.value?.shippingNotes ?? null)

  async function loadTenant(tenantSlug: string): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      tenant.value = await tenantService.getBySlug(tenantSlug)
      sessionStorage.setItem('tenant_slug', tenantSlug)
    } catch (err: unknown) {
      tenant.value = null
      error.value  = (err as { response?: { status?: number } }).response?.status === 404
        ? 'not-found'
        : 'error'
    } finally {
      loading.value = false
    }
  }

  async function loadTenantByDomain(hostname: string): Promise<void> {
    loading.value = true
    error.value   = null
    try {
      tenant.value = await tenantService.getByDomain(hostname)
      if (tenant.value?.slug) sessionStorage.setItem('tenant_slug', tenant.value.slug)
    } catch (err: unknown) {
      tenant.value = null
      error.value  = (err as { response?: { status?: number } }).response?.status === 404
        ? 'not-found'
        : 'error'
    } finally {
      loading.value = false
    }
  }

  function clearTenant(): void {
    tenant.value  = null
    loading.value = false
    error.value   = null
    sessionStorage.removeItem('tenant_slug')
  }

  return {
    tenant, loading, error,
    isLoaded, slug, name, logoUrl, primaryColor, shippingCost, shippingNotes,
    loadTenant, loadTenantByDomain, clearTenant,
  }
})
