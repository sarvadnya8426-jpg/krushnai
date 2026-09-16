/**
 * Single place to edit all business information.
 * Replace the placeholder values below with the real business details.
 */
export const site = {
  name: "Krushnai Tredars",
  legalName: "Krushnai Tredars",
  tagline: "Everything You Need to Build, Furnish & Finish.",
  subTagline: "From Plywood to Hardware. From Bathrooms to Power Tools.",
  description:
    "One-stop destination for plywood, laminates, furniture hardware, modular kitchen accessories, wardrobe fittings, bathroom accessories, LED mirrors, door hardware and power tools.",
  // PLACEHOLDER — replace with the real numbers/addresses
  phones: ["+91 94222 32315", "+91 99238 28206"],
  get phone() {
    return this.phones[0] as string;
  },
  whatsapp: "918767415075", // digits only, with country code
  email: "sarvadnyadhole@gmail.com",
  address: {
    line1: "Krushnai Tredars, Near BSNL Tower Khuldabad Rd, Phulambri",
    line2: "Chhatrapati Sambhajinagar",
    state: "Maharashtra",
    pincode: "431111",
  },
  hours: [
    { days: "Monday – Sunday", time: "9:30 AM – 8:00 PM" },
    
  ],
  mapEmbedUrl:
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3142.15553921432!2d75.413994!3d20.0853108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdbbf0051053899%3A0x6c192573a4a1b322!2sKrushnai%20Tredars!5e1!3m2!1sen!2sin!4v1789308134497!5m2!1sen!2sin",
  social: {
    facebook: "#",
    instagram: "#",
    youtube: "#",
  },
  stats: [
    { value: "20+", label: "Years Experience" },
    { value: "1000+", label: "Happy Customers" },
    { value: "500+", label: "Products" },
    { value: "Quality", label: "Assured" },
  ],
};

export const whatsappLink = (productName?: string) => {
  const message = productName
    ? `Hello, I am interested in ${productName}. Please share the price and availability.`
    : "Hello, I am interested in your products. Please share the price and availability.";
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
};
