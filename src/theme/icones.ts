/**
 * Lista curada de ícones lucide para hábitos — SPEC §4.4.
 *
 * `Habito.icone` guarda a *chave* (string) deste mapa; os componentes nunca
 * referenciam ícones soltos fora daqui. Critério: ícones reconhecíveis para
 * rotinas diárias.
 */
import {
  Activity,
  Apple,
  Bed,
  Bike,
  Book,
  BookOpen,
  Brain,
  Coffee,
  Droplets,
  Dumbbell,
  Footprints,
  GlassWater,
  Heart,
  HeartPulse,
  Languages,
  Leaf,
  Moon,
  Music,
  Pen,
  Salad,
  Smile,
  Sparkles,
  Sun,
  Target,
  type LucideIcon,
} from 'lucide-react';

export const ICONES = {
  dumbbell: Dumbbell,
  bike: Bike,
  footprints: Footprints,
  activity: Activity,
  heartPulse: HeartPulse,
  heart: Heart,
  brain: Brain,
  book: Book,
  bookOpen: BookOpen,
  pen: Pen,
  languages: Languages,
  music: Music,
  sparkles: Sparkles,
  target: Target,
  smile: Smile,
  leaf: Leaf,
  salad: Salad,
  apple: Apple,
  coffee: Coffee,
  glassWater: GlassWater,
  droplets: Droplets,
  bed: Bed,
  moon: Moon,
  sun: Sun,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof ICONES;

export const ICONES_LISTA = Object.keys(ICONES) as NomeIcone[];

/** Componente do ícone para uma chave, ou `null` se a chave for desconhecida. */
export function iconePor(nome: string | undefined): LucideIcon | null {
  if (nome != null && nome in ICONES) {
    return ICONES[nome as NomeIcone];
  }
  return null;
}
