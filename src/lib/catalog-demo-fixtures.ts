/**
 * Shared catalogue fixtures for Prisma seed + offline demo catalog (see demo-catalog.ts).
 */
export type DemoCategoryFixture = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

export type DemoPricingTierFixture = {
  minQuantity: number;
  discountPrice: number;
};

export type DemoProductFixture = {
  slug: string;
  sku: string;
  name: string;
  categorySlug: string;
  description: string;
  imageUrl: string;
  basePrice: number;
  gstRate: number;
  hsnCode: string;
  stockQuantity: number;
  minOrderQty: number;
  stepQty: number;
  isFeatured: boolean;
  tiers?: DemoPricingTierFixture[];
};

export const DEMO_CATEGORIES: DemoCategoryFixture[] = [
  {
    name: "Floor Care",
    slug: "floor-care",
    description: "Mops, phenyl-type liquids, scrubbers and machine-care for Indian homes & institutions.",
    imageUrl:
      "https://images.unsplash.com/photo-1581579186913-45d8ab6132f1?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Hand Hygiene",
    slug: "hand-hygiene",
    description: "Handwash refills, sanitisers and bulk packs for kitchens & clinics.",
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a3ad6368?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Laundry",
    slug: "laundry",
    description: "Washing powder, liquid detergents, bleach and linen-care concentrates.",
    imageUrl:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Waste Management",
    slug: "waste-management",
    description: "Heavy-duty bin liners, refuse sacks and odour control for commercial kitchens.",
    imageUrl:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Kitchen Hygiene",
    slug: "kitchen-hygiene",
    description: "Utensil scrubbers, dishwash liquids, degreasers and drain care.",
    imageUrl:
      "https://images.unsplash.com/photo-1610557892470-56040e57dad4?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Washroom & Paper",
    slug: "washroom-paper",
    description: "WC acid cleaners, tissue rolls, urinal blocks and washroom refills.",
    imageUrl:
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Surface Disinfection",
    slug: "surface-disinfection",
    description: "Quat sprays, peroxide systems and high-touch surface protocols.",
    imageUrl:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=82",
  },
];

export const DEMO_PRODUCTS: DemoProductFixture[] = [
  {
    slug: "neutral-floor-cleaner-5l",
    sku: "FC-NFC-5L",
    name: "Shakti Multipurpose Cleaning Liquid — 5L",
    categorySlug: "floor-care",
    description:
      "All-in-one floor & surface liquid for daily pocha — marble, granite, kota and epoxy finishes; dilute as per bucket chart.",
    imageUrl:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=900&q=82",
    basePrice: 649,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 420,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: true,
    tiers: [
      { minQuantity: 10, discountPrice: 599 },
      { minQuantity: 40, discountPrice: 549 },
    ],
  },
  {
    slug: "heavy-duty-degreaser-5l",
    sku: "KH-HDD-5L",
    name: "Shakti Chimney & Kadhai Degreaser — 5L",
    categorySlug: "kitchen-hygiene",
    description:
      "Cuts thick Indian cooking grease on chimneys, tandoors, chains and stainless benches — rinse thoroughly.",
    imageUrl:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=82",
    basePrice: 799,
    gstRate: 18,
    hsnCode: "38109090",
    stockQuantity: 260,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: true,
    tiers: [{ minQuantity: 24, discountPrice: 729 }],
  },
  {
    slug: "foam-handwash-refill-5l",
    sku: "HH-FHW-5L",
    name: "Shakti Pearl Handwash Refill — 5L",
    categorySlug: "hand-hygiene",
    description: "Thick pearl foam refill for bulk dispensers — restaurants, schools and office washrooms.",
    imageUrl:
      "https://images.unsplash.com/photo-1584466977773-e863ae316082?auto=format&fit=crop&w=900&q=82",
    basePrice: 899,
    gstRate: 18,
    hsnCode: "34013090",
    stockQuantity: 310,
    minOrderQty: 3,
    stepQty: 3,
    isFeatured: true,
  },
  {
    slug: "alcohol-hand-rub-500ml-case",
    sku: "HH-AHR-500-C24",
    name: "Shakti Instant Hand Sanitizer — 500ml (Case of 24)",
    categorySlug: "hand-hygiene",
    description: "75% v/v ethanol with glycerine — retail-ready bottles for kirana, clinics and front desks.",
    imageUrl:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=82",
    basePrice: 3899,
    gstRate: 18,
    hsnCode: "38089400",
    stockQuantity: 120,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
    tiers: [{ minQuantity: 5, discountPrice: 3599 }],
  },
  {
    slug: "commercial-laundry-detergent-20kg",
    sku: "LD-COM-20KG",
    name: "Shakti Washing Powder (Commercial) — 20kg Bag",
    categorySlug: "laundry",
    description:
      "High-foam powder for dhobi & hotel laundry — strong on curry and oil stains; top/front load compatible when dosed correctly.",
    imageUrl:
      "https://images.unsplash.com/photo-1517677208171-0dd672840eee?auto=format&fit=crop&w=900&q=82",
    basePrice: 4699,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 85,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: true,
    tiers: [
      { minQuantity: 4, discountPrice: 4399 },
      { minQuantity: 10, discountPrice: 4099 },
    ],
  },
  {
    slug: "fabric-softener-concentrate-10l",
    sku: "LD-FSC-10L",
    name: "Shakti Blue Fabric Conditioner — 10L",
    categorySlug: "laundry",
    description: "Soft finish for hotel & hospital linen — dilute per dosing chart for last rinse.",
    imageUrl:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=82",
    basePrice: 2899,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 55,
    minOrderQty: 2,
    stepQty: 1,
    isFeatured: false,
    tiers: [{ minQuantity: 8, discountPrice: 2699 }],
  },
  {
    slug: "liquid-chlorine-bleach-5l",
    sku: "LD-LCB-5L",
    name: "Shakti Liquid Safedi (Chlorine Bleach) — 5L",
    categorySlug: "laundry",
    description: "12–13% available chlorine for whitening white uniforms and sanitising buckets — handle per SDS.",
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a3ad6368?auto=format&fit=crop&w=900&q=82",
    basePrice: 449,
    gstRate: 18,
    hsnCode: "28289090",
    stockQuantity: 300,
    minOrderQty: 6,
    stepQty: 6,
    isFeatured: false,
  },
  {
    slug: "bio-enzyme-drain-maintainer-5l",
    sku: "KH-BDM-5L",
    name: "Shakti Bio Drain Cleaner — 5L",
    categorySlug: "kitchen-hygiene",
    description: "Weekly dosing for Indian kitchen sinks — cuts grease buildup and nagging drain smell.",
    imageUrl:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=82",
    basePrice: 1199,
    gstRate: 18,
    hsnCode: "38089400",
    stockQuantity: 150,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: false,
  },
  {
    slug: "machine-dishwash-rinse-aid-5l",
    sku: "KH-DRA-5L",
    name: "Shakti Dishwash Rinse Aid — 5L",
    categorySlug: "kitchen-hygiene",
    description: "Spot-free drying for hood-type and rack conveyor machines in central kitchens.",
    imageUrl:
      "https://images.unsplash.com/photo-1556910096-6f5e446611ef?auto=format&fit=crop&w=900&q=82",
    basePrice: 929,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 175,
    minOrderQty: 4,
    stepQty: 2,
    isFeatured: false,
    tiers: [{ minQuantity: 20, discountPrice: 849 }],
  },
  {
    slug: "odour-neutraliser-concentrate-1l",
    sku: "WM-ODN-1L",
    name: "Shakti Black Phenyl Concentrate — 1L",
    categorySlug: "waste-management",
    description: "Classic Indian-style black disinfectant concentrate — dilute for mopping corridors, yards and refuse areas.",
    imageUrl:
      "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=900&q=82",
    basePrice: 529,
    gstRate: 18,
    hsnCode: "38089400",
    stockQuantity: 200,
    minOrderQty: 6,
    stepQty: 6,
    isFeatured: false,
    tiers: [{ minQuantity: 48, discountPrice: 479 }],
  },
  {
    slug: "microfibre-floor-pad-case",
    sku: "FC-MFP-C12",
    name: "Shakti Stainless Utensil Scrubber — Card of 6 × 6 pcs",
    categorySlug: "kitchen-hygiene",
    description: "Galvanised steel scrubbers for kadais & tawa — HORECA pack; rust-resistant when dried after use.",
    imageUrl:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=82",
    basePrice: 2499,
    gstRate: 18,
    hsnCode: "63079090",
    stockQuantity: 60,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
  },
  {
    slug: "glass-cleaner-ready-to-use-750ml-case",
    sku: "KH-GCW-750-C12",
    name: "Shakti Acid WC & Tile Cleaner (HCl blend) — 12 × 750ml",
    categorySlug: "washroom-paper",
    description:
      "Thickened acid for Indian WC bowls, tiles & ceramic — wear gloves & eye protection; never mix with bleach.",
    imageUrl:
      "https://images.unsplash.com/photo-1507652313519-d4c917358e32?auto=format&fit=crop&w=900&q=82",
    basePrice: 2299,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 110,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: false,
  },
  {
    slug: "auto-scrubber-drier-strips-case",
    sku: "FC-SSD-C6",
    name: "Shakti Sponge Mop with Refill — Pack of 6",
    categorySlug: "floor-care",
    description: "PVA sponge mops for home & shop floors — squeeze-type heads; includes spare refills.",
    imageUrl:
      "https://images.unsplash.com/photo-1581579186913-45d8ab6132f1?auto=format&fit=crop&w=900&q=82",
    basePrice: 3199,
    gstRate: 18,
    hsnCode: "40169340",
    stockQuantity: 12,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
    tiers: [{ minQuantity: 5, discountPrice: 2999 }],
  },
  {
    slug: "colour-coded-cleaning-cloths-pack",
    sku: "HH-CCC-P40",
    name: "Shakti Non-Scratch Scrub Sponge — Pack of 40",
    categorySlug: "kitchen-hygiene",
    description: "Dual-layer sponges for non-stick, glass and melamine — bulk pack for cloud kitchens.",
    imageUrl:
      "https://images.unsplash.com/photo-1566766969125-3d2498e6e848?auto=format&fit=crop&w=900&q=82",
    basePrice: 1299,
    gstRate: 18,
    hsnCode: "63071010",
    stockQuantity: 8,
    minOrderQty: 5,
    stepQty: 5,
    isFeatured: true,
  },
  {
    slug: "industrial-black-bin-liners-roll",
    sku: "WM-BBL-R100",
    name: "Shakti Heavy Duty Garbage Bags — Roll of 100",
    categorySlug: "waste-management",
    description: "240L compatible black liners for hotels & mandi waste — puncture resistant recycled polymer.",
    imageUrl:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=82",
    basePrice: 2199,
    gstRate: 18,
    hsnCode: "39232990",
    stockQuantity: 95,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: false,
  },
  {
    slug: "centrefeed-roll-blue-6-pack",
    sku: "WP-CFB-P6",
    name: "Shakti Centrefeed Kitchen Roll — Blue (Pack of 6)",
    categorySlug: "washroom-paper",
    description: "Embossed rolls for F&B pass-throughs, dosa counters and engineering wipes.",
    imageUrl:
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=900&q=82",
    basePrice: 1899,
    gstRate: 18,
    hsnCode: "48189000",
    stockQuantity: 140,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: true,
    tiers: [{ minQuantity: 10, discountPrice: 1749 }],
  },
  {
    slug: "jumbo-toilet-roll-2ply-case",
    sku: "WP-JTR-C12",
    name: "Shakti Jumbo Toilet Roll 2-Ply — Case of 12",
    categorySlug: "washroom-paper",
    description: "Mini-jumbo size for mall & office washrooms — septic-safe when flushed moderately.",
    imageUrl:
      "https://images.unsplash.com/photo-1584622650111-993a426352bf?auto=format&fit=crop&w=900&q=82",
    basePrice: 2699,
    gstRate: 18,
    hsnCode: "48181090",
    stockQuantity: 88,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
  },
  {
    slug: "urinal-channel-blocks-tub",
    sku: "WP-UCB-T50",
    name: "Shakti Urinal Channel Blocks — Tub of 50",
    categorySlug: "washroom-paper",
    description: "Cherry fragrance cubes — helps control odour & scale in busy male washrooms.",
    imageUrl:
      "https://images.unsplash.com/photo-1600880292203-75700762e37e?auto=format&fit=crop&w=900&q=82",
    basePrice: 749,
    gstRate: 18,
    hsnCode: "34029099",
    stockQuantity: 200,
    minOrderQty: 4,
    stepQty: 4,
    isFeatured: false,
  },
  {
    slug: "metered-air-freshener-refill-case",
    sku: "WP-AFR-C12",
    name: "Shakti Air Freshener Refill — Case of 12",
    categorySlug: "washroom-paper",
    description: "Metered aerosol refills for programmable dispensers — jasmine & lemongrass notes.",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=82",
    basePrice: 3199,
    gstRate: 18,
    hsnCode: "33074900",
    stockQuantity: 45,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
    tiers: [{ minQuantity: 6, discountPrice: 2999 }],
  },
  {
    slug: "quat-surface-disinfectant-5l",
    sku: "SD-QSD-5L",
    name: "Shakti QAC Surface Disinfectant — 5L",
    categorySlug: "surface-disinfection",
    description: "Quat-based cleaner-disinfectant for clinics, counters and high-touch rails — dilute per protocol.",
    imageUrl:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=82",
    basePrice: 1399,
    gstRate: 18,
    hsnCode: "38089400",
    stockQuantity: 210,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: true,
    tiers: [{ minQuantity: 12, discountPrice: 1299 }],
  },
  {
    slug: "hydrogen-peroxide-sporicidal-5l",
    sku: "SD-HPS-5L",
    name: "Shakti Peroxide Multi-Surface Sanitizer — 5L",
    categorySlug: "surface-disinfection",
    description: "Accelerated hydrogen peroxide system for pharma packing & sensitive areas — rotation programme recommended.",
    imageUrl:
      "https://images.unsplash.com/photo-1506617566049-2fb4928a811b?auto=format&fit=crop&w=900&q=82",
    basePrice: 4899,
    gstRate: 18,
    hsnCode: "38089400",
    stockQuantity: 42,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: true,
  },
  {
    slug: "housekeeping-janitor-cart-grey",
    sku: "FC-HJC-01",
    name: "Shakti Janitor Trolley — Grey",
    categorySlug: "floor-care",
    description: "Bucket, wringer, mop clip & bag kit for housekeeping boys — ships knocked-down with toolkit.",
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=900&q=82",
    basePrice: 12999,
    gstRate: 18,
    hsnCode: "87169090",
    stockQuantity: 18,
    minOrderQty: 1,
    stepQty: 1,
    isFeatured: false,
    tiers: [{ minQuantity: 6, discountPrice: 12299 }],
  },
  {
    slug: "wet-mop-head-cotton-mix-case",
    sku: "FC-WMH-C12",
    name: "Shakti Cotton Mop (Ghatta) Head — Case of 12",
    categorySlug: "floor-care",
    description: "Traditional wide cotton strings for daily pocha — machine wash hot up to 90°C.",
    imageUrl:
      "https://images.unsplash.com/photo-1585841011-fdca3d3d2330?auto=format&fit=crop&w=900&q=82",
    basePrice: 3599,
    gstRate: 18,
    hsnCode: "96039000",
    stockQuantity: 64,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: false,
  },
];
