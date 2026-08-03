import Image from "next/image";
import { ClockIcon, MapPinIcon } from "@/components/contact-icons";

type VenueCardProps = {
  name: string;
  address: string;
  schedule: string;
  image: string;
  imageAlt: string;
};

export function VenueCard({ name, address, schedule, image, imageAlt }: VenueCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/4 shadow-luxe">
      <div className="relative h-64 w-full sm:h-72 lg:h-80">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,12,0)_40%,rgba(2,5,12,0.85)_100%)]" />
      </div>

      <div className="space-y-3 p-6">
        <p className="font-serif text-2xl text-gold-200">{name}</p>
        <p className="flex items-start gap-2 text-sm leading-6 text-slate-300">
          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          {address}
        </p>
        <p className="flex items-start gap-2 text-sm leading-6 text-slate-300">
          <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" />
          {schedule}
        </p>
      </div>
    </article>
  );
}
