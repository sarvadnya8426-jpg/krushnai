import showroom from "@/assets/showroom1.png";
import { categories } from "./categories";

const img = (slug: string) => categories.find((c) => c.slug === slug)!.image;

export const solutions = [
  {
    title: "Modular Kitchens",
    description: "Plywood, hardware and kitchen accessories.",
    image: img("modular-kitchen"),
  },
  {
    title: "Premium Wardrobes",
    description: "Boards, fittings, handles and wardrobe accessories.",
    image: img("wardrobe-accessories"),
  },
  {
    title: "Home Furniture",
    description: "Plywood, laminates, fittings and hardware.",
    image: img("plywood-boards"),
  },
  {
    title: "Bathroom Upgrade",
    description: "Bathroom accessories and LED mirrors.",
    image: img("bathroom-accessories"),
  },
  {
    title: "Doors & Entrance Solutions",
    description: "Door locks, handles, hinges and complete door kits.",
    image: img("door-hardware"),
  },
  {
    title: "Professional Workshop",
    description: "Power tools, drill bits, cutting discs and accessories.",
    image: img("power-tools"),
  },
  {
    title: "Office Furniture",
    description: "Furniture materials and professional hardware.",
    image: img("laminates"),
  },
  {
    title: "Interior Projects",
    description: "Complete material solutions for interior designers and contractors.",
    image: img("general-hardware"),
  },
];

/** Editable placeholder brand list — replace with the brands actually stocked. */
export const brandList = [
  "Brand Name 1",
  "Brand Name 2",
  "Brand Name 3",
  "Brand Name 4",
  "Brand Name 5",
  "Brand Name 6",
  "Brand Name 7",
  "Brand Name 8",
];

export type GalleryItem = { src: string; alt: string; filter: string };

export const gallery: GalleryItem[] = [
  { src: showroom, alt: "Krushnai Traders showroom interior", filter: "Showroom" },
  { src: img("plywood-boards"), alt: "Plywood and board stock", filter: "Showroom" },
  { src: img("modular-kitchen"), alt: "Modular kitchen with pull-out accessories", filter: "Kitchens" },
  { src: "/images/gallery/mainshop.jpeg", alt: "Krushnai Traders main shop", filter: "Showroom" },
  { src: img("bathroom-accessories"), alt: "Bathroom with premium accessories", filter: "Bathrooms" },
  { src: img("led-mirrors"), alt: "Backlit LED bathroom mirror", filter: "Bathrooms" },
  { src: img("door-hardware"), alt: "Brass door handle and lock", filter: "Doors" },
  { src: img("power-tools"), alt: "Power tools on a workbench", filter: "Tools" },
  { src: img("power-tool-accessories"), alt: "Drill bits and cutting discs", filter: "Tools" },
  { src: img("laminates"), alt: "Laminate display in the showroom", filter: "Showroom" },
  { src: img("general-hardware"), alt: "General hardware and fasteners", filter: "Showroom" },
   { src: "/images/gallery/IMG20250405174643.jpeg", alt: "Mortise handle", filter: "Furniture" },
    { src: "/images/gallery/IMG20250405174634.jpeg", alt: "Mortise handle", filter: "Furniture" },
     
      { src: "/images/gallery/handle.jpeg", alt: "Handle", filter: "Furniture" },
       { src: "/images/gallery/IMG20250405174737.jpeg", alt: "Handle", filter: "Showroom" },
        { src: "/images/gallery/20250419_161317-COLLAGE.jpeg", alt: "Premium Hanger", filter: "Furniture" },
         { src: "/images/gallery/IMG20250405174751.jpeg", alt: "handle", filter: "Showroom" },
          { src: "/images/gallery/cordlessdrill.jpeg", alt: "Cordless drill", filter: "Tools" },
           { src: "/images/gallery/IMG20250428165110.jpeg", alt: "Cordless Grinder", filter: "Tools" },
            { src: "/images/gallery/IMG20250515121205.jpeg", alt: "Cordless Hammer", filter: "Tools" },
             { src: "/images/gallery/IMG20251126120613.jpeg", alt: "Hardware", filter: "Showroom" },
              { src: "/images/gallery/IMG20251126120822.jpeg", alt: "Bathroom Accessories Display", filter: "Showroom" },
                { src: "/images/gallery/IMG20250428170937.jpeg", alt: "Soap Dish", filter: "Showroom" },
                 { src: "/images/gallery/IMG20250805180019.jpeg", alt: "Door Knocker", filter: "Doors" },
                 { src: "/images/gallery/IMG20250405174826.jpeg", alt: "krushnai Traders", filter: "Showroom" },



    ];

export const galleryFilters = ["All", "Showroom", "Furniture", "Kitchens", "Bathrooms", "Doors", "Tools"];

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
    quote: "A convenient one-stop shop for plywood, hardware and interior materials.",
    name: "Sahil",
    role: "Carpenter",
  },
];

export const trustFeatures = [
  {
    title: "Premium Quality",
    description: "Quality products for residential and commercial projects.",
  },
  { title: "Wide Product Range", description: "Everything from plywood to power tools." },
  {
    title: "Competitive Pricing",
    description: "Value-focused pricing for retail and bulk customers.",
  },
  { title: "Expert Assistance", description: "Help customers choose the right product." },
  { title: "Complete Support", description: "From product enquiries to solutions, we’re here to assist you." },
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
