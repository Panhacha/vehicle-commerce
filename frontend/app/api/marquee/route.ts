import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CONFIG_FILE = path.join(process.cwd(), "public", "marquee-config.json");

const DEFAULT_CONFIG = {
  speed: 40,
  categories: [
    { id: "all", name: "ទាំងអស់ (All Products)", iconKey: "all" },
    { id: "suv", name: "SUV & Crossover", iconKey: "suv" },
    { id: "sedan", name: "Sedan & Sport", iconKey: "sedan" },
    { id: "truck", name: "Truck & Pickup", iconKey: "truck" },
    { id: "ev", name: "Electric & Hybrid", iconKey: "ev" },
    { id: "minivan", name: "Minivan & Family", iconKey: "minivan" },
    { id: "ebike", name: "កង់អគ្គិសនី (E-Bikes)", iconKey: "ebike" },
    { id: "parts", name: "គ្រឿងបន្លាស់ (Parts)", iconKey: "parts" },
  ],
  brands: [
    { id: "all", name: "គ្រប់ប្រេន (All Brands)", iconKey: "sparkles" },
    { id: "Toyota", name: "Toyota", iconKey: "Toyota" },
    { id: "Lexus", name: "Lexus", iconKey: "Lexus" },
    { id: "Ford", name: "Ford", iconKey: "Ford" },
    { id: "BYD", name: "BYD", iconKey: "BYD" },
    { id: "Tesla", name: "Tesla", iconKey: "Tesla" },
    { id: "Hyundai", name: "Hyundai", iconKey: "Hyundai" },
    { id: "Kia", name: "KIA", iconKey: "Kia" },
    { id: "BMW", name: "BMW", iconKey: "BMW" },
    { id: "Mercedes-Benz", name: "Mercedes", iconKey: "Mercedes-Benz" },
    { id: "Peugeot", name: "Peugeot", iconKey: "Peugeot" },
  ],
};

function readConfigFile() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading marquee config file:", e);
  }
  return DEFAULT_CONFIG;
}

function writeConfigFile(data: any) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Error writing marquee config file:", e);
    return false;
  }
}

export async function GET() {
  const config = readConfigFile();
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.categories)) {
      return NextResponse.json({ error: "Invalid configuration format" }, { status: 400 });
    }

    const sanitized = {
      speed: typeof body.speed === "number" && body.speed >= 5 ? body.speed : 40,
      categories: body.categories.map((c: any) => ({
        id: String(c.id || "").trim() || "category",
        name: String(c.name || "").trim() || "Category",
        iconKey: String(c.iconKey || "all").trim(),
      })),
      brands: Array.isArray(body.brands)
        ? body.brands.map((b: any) => ({
            id: String(b.id || "").trim() || "brand",
            name: String(b.name || "").trim() || "Brand",
            iconKey: String(b.iconKey || "").trim(),
          }))
        : DEFAULT_CONFIG.brands,
    };

    writeConfigFile(sanitized);
    return NextResponse.json(sanitized);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save configuration" }, { status: 500 });
  }
}

