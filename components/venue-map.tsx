import { MapPinIcon } from "@/components/contact-icons";
import {
  VENUE_LOCATION,
  getVenueDirectionsUrl,
  getVenueMapEmbedUrl,
} from "@/lib/venue-location";

/**
 * Mapa de "Cómo llegar". La ubicación sale entera de `lib/venue-location.ts`.
 */
export function VenueMap() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-[1.5rem] border border-gold-300/20 bg-ink-950/60 shadow-luxe">
        <iframe
          src={getVenueMapEmbedUrl()}
          title={`Mapa con la ubicación de la iglesia en ${VENUE_LOCATION.query}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="block h-[18rem] w-full border-0 sm:h-[22rem]"
        />
      </div>

      <a
        href={getVenueDirectionsUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-300/30 bg-gold-400/10 px-5 py-2.5 text-sm font-semibold text-gold-200 transition hover:border-gold-300/70 hover:bg-gold-400/20"
      >
        <MapPinIcon className="h-4 w-4" />
        Ver en Google Maps
      </a>
    </div>
  );
}
