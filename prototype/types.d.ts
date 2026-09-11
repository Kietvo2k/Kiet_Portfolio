type ProjectVisual = "garden" | "thermal" | "memories" | "chess" | "orbit" | "particles";
type Accent = "orange" | "violet" | "blue" | "green";
interface Project {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  description: string;
  year: string;
  status: string;
  visual: ProjectVisual;
  image?: string;
  featured: boolean;
  tags: string[];
  role: string;
  challenge: string;
  approach: string;
  learning: string;
  url: string;
  linkLabel: string;
}
interface PortfolioConfig {
  name: string;
  shortName: string;
  initials: string;
  avatar: string;
  role: string;
  location: string;
  timezone: string;
  available: boolean;
  availability: string;
  email: string;
  emailIsPlaceholder: boolean;
  github: string;
  hero: { artwork: string; artworkAlt: string; eyebrow: string; firstLine: string; secondLine: string; description: string; note: string };
  about: {
    headline: string;
    description: string;
    philosophy: string;
    currently: string;
    principles: { title: string; description: string }[];
    journey: { date: string; title: string; description: string }[];
  };
  skills: string[];
  projects: Project[];
  theme: { accent: Accent; mode: "light" | "dark" };
}
