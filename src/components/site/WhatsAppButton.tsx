import { whatsappLink } from "@/config/site";

export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="bg-whatsapp fixed right-4 bottom-4 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lift transition-transform duration-200 hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.86 1.21 3.06c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.71 2-1.4.25-.69.25-1.28.17-1.4-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.37 9.37 0 0 1-1.44-5 9.45 9.45 0 0 1 16.14-6.7 9.38 9.38 0 0 1 2.77 6.7 9.46 9.46 0 0 1-9.5 9.41zM20.13 3.9A11.36 11.36 0 0 0 12.05.55C5.79.55.7 5.62.7 11.86c0 2 .52 3.94 1.52 5.66L.6 23.45l6.08-1.59a11.4 11.4 0 0 0 5.37 1.36h.01c6.26 0 11.35-5.07 11.35-11.31 0-3.02-1.18-5.86-3.28-8z" />
      </svg>
    </a>
  );
}
