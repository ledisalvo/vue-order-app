export interface User {
  id: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
}

export interface Tenant {
  id: string
  slug: string
  name: string
  logoUrl?: string
  bannerUrl?: string
  primaryColor?: string
  category: string
  description?: string
  shippingCost: number
  shippingNotes?: string
}

export interface TenantDetail extends Tenant {
  plan: 'free' | 'premium'
  planExpiresAt?: string
  customDomain?: string
  customDomainVerified: boolean
  mpConnected: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface OnboardingResponse extends AuthResponse {
  tenant: { id: string; slug: string }
}

export interface JwtPayload {
  sub: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
  exp: number
  iat: number
}
