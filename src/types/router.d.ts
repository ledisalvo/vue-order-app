import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: 'buyer' | 'seller' | 'admin'
    requiresTenant?: boolean
    guestOnly?: boolean
  }
}
