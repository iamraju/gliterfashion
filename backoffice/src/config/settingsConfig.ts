import { LayoutGrid, Search, Globe, Shield, CreditCard } from 'lucide-react';

export const SETTINGS_GROUPS = [
  { id: 'GENERAL', label: 'General', icon: LayoutGrid, description: 'Basic site configuration' },
  { id: 'SEO', label: 'SEO', icon: Search, description: 'Search engine optimization' },
  { id: 'PAYMENT', label: 'Payment', icon: CreditCard, description: 'Payment gateway configuration' },
  { id: 'SOCIAL', label: 'Social Media', icon: Globe, description: 'Social links and integrations' },
  { id: 'SECURITY', label: 'Security', icon: Shield, description: 'Security and access settings' },
];

export const SETTING_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'boolean', label: 'Toggle (True/False)' },
  { value: 'number', label: 'Number' },
];
