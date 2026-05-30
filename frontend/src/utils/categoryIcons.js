import { GiCarrot, GiMeat, GiMilkCarton, GiChiliPepper, GiWheat } from 'react-icons/gi'
import { FaGlassWater, FaBoxOpen } from 'react-icons/fa6'

export const getCategoryIcon = (name) => {
  if (!name) return FaBoxOpen;
  const n = name.toLowerCase();
  if (n.includes('vegetable')) return GiCarrot;
  if (n.includes('meat') || n.includes('poultry')) return GiMeat;
  if (n.includes('dairy') || n.includes('milk')) return GiMilkCarton;
  if (n.includes('beverage') || n.includes('drink')) return FaGlassWater;
  if (n.includes('spice') || n.includes('condiment')) return GiChiliPepper;
  if (n.includes('grain') || n.includes('cereal')) return GiWheat;
  return FaBoxOpen;
}
