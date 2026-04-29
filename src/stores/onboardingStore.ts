import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { onboardingService } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'
import { useTenantStore } from '@/stores/tenantStore'

interface Step1Data {
  name:     string
  email:    string
  password: string
}

interface Step2Data {
  storeName: string
  storeSlug: string
  category:  string
}

export const useOnboardingStore = defineStore('onboarding', () => {
  const step1Data = reactive<Step1Data>({ name: '', email: '', password: '' })
  const step2Data = reactive<Step2Data>({ storeName: '', storeSlug: '', category: '' })
  const loading   = ref(false)
  const error     = ref<string | null>(null)

  function setStep1(data: Step1Data) {
    Object.assign(step1Data, data)
  }

  function setStep2(data: Partial<Step2Data>) {
    Object.assign(step2Data, data)
  }

  async function submitOnboarding(): Promise<void> {
    loading.value = true
    error.value   = null

    try {
      const response = await onboardingService.submit({
        name:      step1Data.name,
        email:     step1Data.email,
        password:  step1Data.password,
        storeName: step2Data.storeName,
        storeSlug: step2Data.storeSlug,
        category:  step2Data.category,
      })

      // Guardar auth
      const authStore = useAuthStore()
      authStore.setAuth(response.accessToken)

      // Precargar tenant con el slug que devuelve el backend
      const tenantStore = useTenantStore()
      await tenantStore.loadTenant(response.tenant.slug)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message ?? 'Error al crear tu tienda. Intentá de nuevo.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function reset() {
    Object.assign(step1Data, { name: '', email: '', password: '' })
    Object.assign(step2Data, { storeName: '', storeSlug: '', category: '' })
    error.value = null
  }

  return { step1Data, step2Data, loading, error, setStep1, setStep2, submitOnboarding, reset }
})
