import "dotenv/config";
import { createCategory } from "@/actions/categories";

const categoriesToSeed = [
  {
    id: "0a068287-1528-4ea2-a83b-c97225af05f1",
    name: "Jewelry",
    description: undefined,
    created_at: "2025-08-05 09:16:22.311",
    updated_at: "2025-08-05 09:16:22.311",
  },
  {
    id: "0a068287-1528-4ea2-a83b-c97925af05f2",
    name: "Cosmetics",
    description: undefined,
    created_at: "2025-08-05 09:16:22.311",
    updated_at: "2025-08-05 09:16:22.311",
  },
  {
    id: "0f4726df-d5dc-43cb-a7fd-292719438768",
    name: "Books",
    description: undefined,
    created_at: "2025-08-05 09:16:18.514",
    updated_at: "2025-08-05 09:16:18.514",
  },
  {
    id: "36a69039-7b5c-48d5-95e1-de7e0adefdbb",
    name: "Sports",
    description: undefined,
    created_at: "2025-08-05 09:16:23.257",
    updated_at: "2025-08-05 09:16:23.257",
  },
  {
    id: "418bd706-6825-457a-9dc3-b623f421a829",
    name: "Health",
    description: undefined,
    created_at: "2025-08-05 09:16:25.136",
    updated_at: "2025-08-05 09:16:25.136",
  },
  {
    id: "4ad0c57c-293d-48a5-9a90-0b531fc8b366",
    name: "Automotive",
    description: undefined,
    created_at: "2025-08-05 09:16:24.207",
    updated_at: "2025-08-05 09:16:24.207",
  },
  {
    id: "4c007f2c-8cbb-40e2-b735-7d28ee9bef53",
    name: "Baby",
    description: undefined,
    created_at: "2025-08-05 09:16:29.778",
    updated_at: "2025-08-05 09:16:29.778",
  },
  {
    id: "51eb6218-675d-4e72-af41-e28e4e74227a",
    name: "Shoes",
    description: undefined,
    created_at: "2025-08-05 09:16:21.417",
    updated_at: "2025-08-05 09:16:21.417",
  },
  {
    id: "58fd997c-85e9-41fc-bca2-a699f97ef06a",
    name: "Home",
    description: undefined,
    created_at: "2025-08-05 09:16:26.959",
    updated_at: "2025-08-05 09:16:26.959",
  },
  {
    id: "6d5b123b-1803-49d4-a14d-545704fba6ba",
    name: "Furniture",
    description: undefined,
    created_at: "2025-08-05 09:16:19.536",
    updated_at: "2025-08-05 09:16:19.536",
  },
  {
    id: "6d7d23b2-f71d-4b5c-92c9-212f709f5201",
    name: "Toys",
    description: undefined,
    created_at: "2025-08-05 09:16:20.482",
    updated_at: "2025-08-05 09:16:20.482",
  },
  {
    id: "74acd517-d604-446a-8f01-6cf7e9429b2c",
    name: "Electronics",
    description: undefined,
    created_at: "2025-08-05 09:16:16.6",
    updated_at: "2025-08-05 09:16:16.6",
  },
  {
    id: "943a5096-288a-435f-a329-6b8333da6ca9",
    name: "Beauty",
    description: undefined,
    created_at: "2025-08-05 09:16:26.016",
    updated_at: "2025-08-05 09:16:26.016",
  },
  {
    id: "c440704f-34b4-48f9-a5e5-0339aa58d1dd",
    name: "Garden",
    description: undefined,
    created_at: "2025-08-05 09:16:27.888",
    updated_at: "2025-08-05 09:16:27.888",
  },
  {
    id: "d3eae5fb-8359-4fce-ab3e-cdcc7413394d",
    name: "Clothing",
    description: undefined,
    created_at: "2025-08-05 09:16:17.597",
    updated_at: "2025-08-05 09:16:17.597",
  },
  {
    id: "eef57906-d2ac-451e-a1b2-4ffdde03af6c",
    name: "Pet Supplies",
    description: undefined,
    created_at: "2025-08-05 09:16:28.844",
    updated_at: "2025-08-05 09:16:28.844",
  },
];

const seedCategories = async () => {
  for (const category of categoriesToSeed) {
    await createCategory(category);
  }
};

const main = async () => {
  try {
    console.log("Seeding categories...");
    await seedCategories();
    console.log("Categories seeded successfully");
  } catch (error) {
    console.error(error);
  }
};

main();
