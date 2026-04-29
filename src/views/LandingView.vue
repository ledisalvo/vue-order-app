<template>
  <div class="landing">
    <div class="landing-hero">
      <h1 class="landing-title">Armá tu puestito y empezá a vender hoy</h1>
      <p class="landing-subtitle">
        Creá tu tienda online en minutos, sin conocimientos técnicos.
      </p>
      <RouterLink :to="{ name: 'onboarding-step1' }" class="btn-cta">
        Creá tu puestito
      </RouterLink>
      <p class="landing-login">
        ¿Ya tenés cuenta?
        <RouterLink to="/auth/login" class="auth-link">Ingresá</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.landing {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #f9fafb);
  padding: 2rem 1rem;
}

.landing-hero {
  text-align: center;
  max-width: 560px;
}

.landing-title {
  font-size: clamp(1.75rem, 5vw, 2.75rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.landing-subtitle {
  font-size: 1.15rem;
  color: var(--color-muted, #6b7280);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn-cta {
  display: inline-block;
  background: var(--color-primary, #4f46e5);
  color: white;
  border-radius: 10px;
  padding: 1rem 2.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  text-decoration: none;
  transition: opacity 0.15s;
  margin-bottom: 1.25rem;
}

.btn-cta:hover {
  opacity: 0.9;
}

.landing-login {
  font-size: 0.9rem;
  color: var(--color-muted, #6b7280);
}

.auth-link {
  color: var(--color-primary, #4f46e5);
  text-decoration: underline;
}
</style>
