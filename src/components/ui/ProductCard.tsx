"use client";

/* =============================================================
   PRODUCT CARD — carte produit de luxe (glassmorphism + hover)
   Image & titre cliquables → page produit. Bouton d'ajout panier
   délégué à AddToCartButton (ne déclenche pas la navigation).
   ============================================================= */

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Gadget, Locale } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

interface ProductCardProps {
  gadget: Gadget;
  locale: Locale;
  labels: { addToCart: string; soldOut: string; from: string };
}

export function ProductCard({ gadget, locale, labels }: ProductCardProps) {
  const href = `/${locale}/produit/${gadget.handle}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass group flex flex-col overflow-hidden rounded-[--radius-luxe]"
    >
      {/* Visuel cliquable */}
      <Link href={href} className="relative block aspect-square w-full overflow-hidden bg-gunmetal">
        {gadget.featuredImage ? (
          <Image
            src={gadget.featuredImage.url}
            alt={gadget.featuredImage.altText ?? gadget.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-luxe group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-graphite">
            <span className="font-mono text-xs tracking-widest uppercase">
              {gadget.title}
            </span>
          </div>
        )}
      </Link>

      {/* Infos */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={href}>
          <h3 className="line-clamp-2 text-sm font-medium text-chrome transition-colors group-hover:text-cyan">
            {gadget.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest text-graphite uppercase">
              {labels.from}
            </span>
            <span className="text-lg font-semibold text-titanium">
              {formatPrice(gadget.price.amount, gadget.price.currencyCode, locale)}
            </span>
          </div>

          <AddToCartButton
            gadget={gadget}
            labels={{ addToCart: labels.addToCart, soldOut: labels.soldOut }}
          />
        </div>
      </div>
    </motion.article>
  );
}
