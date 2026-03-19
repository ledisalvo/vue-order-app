<template>
  <footer class="footer">
    <div class="container footer-inner">
      <span class="footer-copy">© {{ year }} MiTienda. Todos los derechos reservados.</span>
      <nav class="footer-links" aria-label="Links informativos">
        <RouterLink to="/terminos" class="footer-link">Términos y condiciones</RouterLink>
        <RouterLink to="/privacidad" class="footer-link">Política de privacidad</RouterLink>
        <RouterLink to="/como-comprar" class="footer-link">Cómo comprar</RouterLink>
        <RouterLink to="/contacto" class="footer-link">Contacto</RouterLink>
      </nav>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: #111827;
  color: #9ca3af;
  margin-top: auto;
}
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 0;
  flex-wrap: wrap;
}
.footer-copy { font-size: .8rem; }
.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}
.footer-link {
  font-size: .8rem;
  color: #9ca3af;
  text-decoration: none;
  transition: color .15s;
}
.footer-link:hover { color: #fff; }

@media (max-width: 640px) {
  .footer-inner { flex-direction: column; align-items: flex-start; }
}
</style>
