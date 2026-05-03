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
    description: "Industrial scrubbers, detergents and polishers.",
    imageUrl:
      "https://images.unsplash.com/photo-1581579186913-45d8ab6132f1?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Hand Hygiene",
    slug: "hand-hygiene",
    description: "Dispensers, sanitisers and antibacterial washes.",
    imageUrl:
      "https://images.unsplash.com/photo-1608571423902-eed4a3ad6368?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Laundry",
    slug: "laundry",
    description: "Commercial detergents, softeners and bleach.",
    imageUrl:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Waste Management",
    slug: "waste-management",
    description: "Bins, liners and odor-neutralising additives.",
    imageUrl:
      "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Kitchen Hygiene",
    slug: "kitchen-hygiene",
    description: "Degreasers, surface sprays and dishwasher additives.",
    imageUrl:
      "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Washroom & Paper",
    slug: "washroom-paper",
    description: "Tissue, towels, urinal tabs and air-care refills.",
    imageUrl:
      "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&w=900&q=82",
  },
  {
    name: "Surface Disinfection",
    slug: "surface-disinfection",
    description: "Hospital-grade concentrates and ready-to-use sprays.",
    imageUrl:
      "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=900&q=82",
  },
];

export const DEMO_PRODUCTS: DemoProductFixture[] = [
  {
    slug: "neutral-floor-cleaner-5l",
    sku: "FC-NFC-5L",
    name: "Neutral Floor Cleaner — 5L",
    categorySlug: "floor-care",
    description:
      "Daily-use neutral cleaner suitable for marble, granite and epoxy-coated surfaces.",
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
    name: "Heavy Duty Degreaser — 5L",
    categorySlug: "kitchen-hygiene",
    description: "Cuts grease on extraction hoods, chains and stainless benches.",
    imageUrl:
      "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=82",
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
    name: "Lux Foam Handwash Refill — 5L",
    categorySlug: "hand-hygiene",
    description: "Pearlescent foam refill compatible with standard bulk dispensers.",
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
    name: "Alcohol Hand Rub 500ml — Case of 24",
    categorySlug: "hand-hygiene",
    description: "75% v/v ethanol formula with emollients — WHO recommended ranges.",
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
    name: "Commercial Laundry Detergent — 20kg Bag",
    categorySlug: "laundry",
    description: "Low-foam concentrate for tunnel washers and washer extractors.",
    imageUrl:
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=82",
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
    name: "Fabric Softener Concentrate — 10L",
    categorySlug: "laundry",
    description: "Blue conditioned finish for hotels and hospital linens — dilute per chart.",
    imageUrl:
      "https://images.unsplash.com/photo-1517677208171-0dd672840eee?auto=format&fit=crop&w=900&q=82",
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
    name: "Liquid Chlorine Bleach — 5L",
    categorySlug: "laundry",
    description: "12–13% available chlorine for whitening and sanitising — handle per SDS.",
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
    name: "Bio-Enzyme Drain Maintainer — 5L",
    categorySlug: "kitchen-hygiene",
    description: "Weekly dosing reduces grease buildup and drain odors.",
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
    name: "Machine Dishwash Rinse Aid — 5L",
    categorySlug: "kitchen-hygiene",
    description: "Spot-free drying for conveyor and hood-type machines.",
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
    name: "Odour Neutraliser Concentrate — 1L",
    categorySlug: "waste-management",
    description: "Pair with mop buckets or backpack sprayers for washrooms & refuse areas.",
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
    name: "Microfibre Floor Pad — Case of 12",
    categorySlug: "floor-care",
    description: "Hook-and-loop pads compatible with auto scrubbers — assorted colours.",
    imageUrl:
      "https://images.unsplash.com/photo-1585841011-fdca3d3d2330?auto=format&fit=crop&w=900&q=82",
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
    name: "Glass Cleaner RTU — Case of 12 × 750ml",
    categorySlug: "kitchen-hygiene",
    description: "Streak-free formula for chilled counters and glass partitions.",
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
    name: "Auto Scrubber Squeegee Blade Kit — Pack of 6",
    categorySlug: "floor-care",
    description: "Universal-fit polyurethane blades — inspect compatibility sheet.",
    imageUrl:
      "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=82",
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
    name: "Colour Coded Cleaning Cloths — Pack of 40",
    categorySlug: "hand-hygiene",
    description: "HACCP-friendly cloth bundles with segregation guidance.",
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
    name: "Industrial Bin Liners — Roll of 100 (Heavy Duty)",
    categorySlug: "waste-management",
    description: "240L compatible liners — puncture resistant recycled polymer.",
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
    name: "Centrefeed Wiper Roll — Blue (Pack of 6)",
    categorySlug: "washroom-paper",
    description: "Embossed absorbency for F&B prep and engineering wipes.",
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
    name: "Jumbo Toilet Roll 2-Ply — Case of 12",
    categorySlug: "washroom-paper",
    description: "Compatible with standard mini-jumbo dispensers — septic-safe.",
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
    name: "Urinal Channel Blocks — Tub of 50",
    categorySlug: "washroom-paper",
    description: "Cherry fragrance blocks — reduces scale buildup when paired with daily rinse.",
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
    name: "Metered Air Freshener Refill — Case of 12",
    categorySlug: "washroom-paper",
    description: "Universal aerosol compatible with common programmable dispensers.",
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
    name: "Quaternary Ammonium Surface Disinfectant — 5L",
    categorySlug: "surface-disinfection",
    description: "Broad-spectrum cleaner-disinfectant for hard surfaces — dilute per protocol.",
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
    name: "Accelerated Hydrogen Peroxide Sporicidal — 5L",
    categorySlug: "surface-disinfection",
    description: "For OT adjacent zones and pharma packing — rotation programme recommended.",
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
    name: "Housekeeping Janitor Cart — Grey",
    categorySlug: "floor-care",
    description: "Bag + mop hangers + shelf kit — ships knocked-down with toolkit.",
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
    name: "Wet Mop Head Cotton Mix — Case of 12",
    categorySlug: "floor-care",
    description: "Kentucky-style heads — launder hot up to 90°C.",
    imageUrl:
      "https://images.unsplash.com/photo-1581579186913-45d8ab6132f1?auto=format&fit=crop&w=900&q=82",
    basePrice: 3599,
    gstRate: 18,
    hsnCode: "96039000",
    stockQuantity: 64,
    minOrderQty: 2,
    stepQty: 2,
    isFeatured: false,
  },
];
