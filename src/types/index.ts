export interface NavItem {
  label: string;
  href: string;
  icon: string;
  module: string;
  badge?: string;
  dot?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface ModuleMeta {
  title: string;
  category: string;
  path: string;
}

export interface Testimonial {
  name: string;
  handle: string;
  avatar: string;
  text: string;
  ringColor: string;
}

export interface Feature {
  title: string;
  description: string;
  items: string[];
  wide?: boolean;
}

export interface ModuleCard {
  title: string;
  description: string;
  icon: string;
  secondaryIcon?: string;
}

export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  icon: string;
}
