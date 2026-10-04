import showroom from "@/assets/showroom1.png";

import solutionKitchen from "@/assets/solution/modernkitchen.png";
import solutionHome from "@/assets/solution/homefurniture.png";
import solutionOffice from "@/assets/solution/officefurniture.png";
import solutionDoor from "@/assets/solution/doorsolution.png";
import solutionWardrobe from "@/assets/solution/wardrobe.png";
import solutionWorkshop from "@/assets/solution/workshop.png";

// Temporary independent solution image references.
// These do NOT depend on category images.

const solutionBathroom = solutionKitchen;
const solutionInterior = solutionWorkshop;

export const solutions = [
  {
    title: "Modular Kitchens",
    description: "Plywood, hardware and kitchen accessories.",
    image: solutionKitchen,
  },
  {
    title: "Premium Wardrobes",
    description: "Boards, fittings, handles and wardrobe accessories.",
    image: solutionWardrobe,
  },
  {
    title: "Home Furniture",
    description: "Plywood, laminates, fittings and hardware.",
    image: solutionHome,
  },
  {
    title: "Bathroom Upgrade",
    description: "Bathroom accessories and LED mirrors.",
    image: solutionBathroom,
  },
  {
    title: "Doors & Entrance Solutions",
    description: "Door locks, handles, hinges and complete door kits.",
    image: solutionDoor,
  },
  {
    title: "Professional Workshop",
    description: "Power tools, drill bits, cutting discs and accessories.",
    image: solutionWorkshop,
  },
  {
    title: "Office Furniture",
    description: "Furniture materials and professional hardware.",
    image: solutionOffice,
  },
  {
    title: "Interior Projects",
    description:
      "Complete material solutions for interior designers and contractors.",
    image: solutionInterior,
  },
];

/** Placeholder reviews — replace with genuine customer feedback. */

export const testimonials = [
  {
    quote:
      "Excellent product quality and helpful staff. They guided us in selecting the right plywood and hardware for our kitchen.",
    name: "Aditya",
    role: "Homeowner",
  },
  {
    quote:
      "Good collection of furniture hardware and bathroom accessories. Pricing was reasonable and service was quick.",
    name: "Gajanan",
    role: "Interior Contractor",
  },
  {
    quote:
      "A convenient one-stop shop for plywood, hardware and interior materials.",
    name: "Sahil",
    role: "Carpenter",
  },
];

export const trustFeatures = [
  {
    title: "Premium Quality",
    description: "Quality products for residential and commercial projects.",
  },
  {
    title: "Wide Product Range",
    description: "Everything from plywood to power tools.",
  },
  {
    title: "Competitive Pricing",
    description: "Value-focused pricing for retail and bulk customers.",
  },
  {
    title: "Expert Assistance",
    description: "Help customers choose the right product.",
  },
  {
    title: "Complete Support",
    description:
      "From product enquiries to solutions, we’re here to assist you.",
  },
];

export const customerTypes = [
  "Homeowners",
  "Carpenters",
  "Furniture manufacturers",
  "Interior designers",
  "Architects",
  "Contractors",
  "Builders",
  "Modular kitchen manufacturers",
  "Commercial customers",
];

export { showroom };