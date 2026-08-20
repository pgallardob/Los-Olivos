/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_COMPANY_TAGLINE?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_CONTACT_PHONE?: string;
  readonly VITE_CONTACT_ADDRESS?: string;
  readonly VITE_CONTACT_HOURS?: string;
  readonly VITE_SOCIAL_INSTAGRAM?: string;
  readonly VITE_SOCIAL_TIKTOK?: string;
  readonly VITE_SOCIAL_WHATSAPP?: string;
  readonly VITE_SOCIAL_FACEBOOK?: string;
  readonly VITE_SOCIAL_LINKS_INSTAGRAM?: string;
  readonly VITE_SOCIAL_LINKS_TIKTOK?: string;
  readonly VITE_SOCIAL_LINKS_WHATSAPP?: string;
  readonly VITE_SOCIAL_LINKS_FACEBOOK?: string;
  readonly VITE_FORM_ENDPOINT?: string;
  readonly VITE_CHATBOT_API_URL?: string;
  readonly VITE_AVISOS_API_URL?: string;
  readonly VITE_FALLBACK_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
