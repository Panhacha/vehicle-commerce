"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Car, 
  Calculator, 
  Calendar, 
  Phone, 
  ExternalLink, 
  Search, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  Maximize2,
  Minimize2,
  DollarSign,
  Fuel,
  Users,
  Award,
  Check,
  BadgeCheck,
  Gift,
  HelpCircle,
  ThumbsUp,
  Compass,
  Key
} from "lucide-react";
import { Product, Branch } from "./types";

interface Message {
  id: string;
  sender: "bot" | "user";
  text?: string;
  timestamp: string;
  type?: "text" | "quick_actions" | "car_results" | "loan_calculator" | "test_drive_form" | "booking_success" | "lead_form" | "dealership_info";
  data?: any;
  suggestions?: string[];
}

interface CarChatbotProps {
  products: Product[];
  branches: Branch[];
  onOpenColorStudio?: (product: Product) => void;
  onOpenLoanModal?: (product: Product) => void;
  onOpenOrderModal?: (product: Product) => void;
  onOpenTradeInModal?: (product: Product) => void;
}

const KHMER_DIGITS_MAP: Record<string, string> = {
  '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4',
  '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9'
};

function normalizeKhmer(str: string): string {
  if (!str) return "";
  return str.toLowerCase().replace(/[០-៩]/g, (d) => KHMER_DIGITS_MAP[d] || d);
}

// Convert Khmer numerals and colloquial expressions to standard number
function parseKhmerNumber(str: string): number | null {
  if (!str) return null;
  const normalized = normalizeKhmer(str);

  // Check for "ម៉ឺន" (10,000) e.g., ២ម៉ឺន = 20,000, 2.5ម៉ឺន = 25,000, ៣ម៉ឺន = 30,000
  const meunMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:ម៉ឺន|meun|mun)/i);
  if (meunMatch) {
    return Math.round(parseFloat(meunMatch[1]) * 10000);
  }

  // Check for "ពាន់" / "k" (1,000) e.g., 20ពាន់ = 20,000, 30k = 30,000
  const moanMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:ពាន់|k|thousand)/i);
  if (moanMatch) {
    return Math.round(parseFloat(moanMatch[1]) * 1000);
  }

  // Standard numeric format: "$20,000", "20000", "20,000"
  const numMatch = normalized.match(/\$?\s*(\d{1,3}(?:,\d{3})+|\d{4,7})/);
  if (numMatch) {
    return parseInt(numMatch[1].replace(/,/g, ''), 10);
  }

  return null;
}

// Parse passenger count (e.g., "៥នាក់", "5 នាក់", "7 កៅអី")
function parsePassengers(str: string): number | null {
  const norm = normalizeKhmer(str);
  const m = norm.match(/(\d+)\s*(?:នាក់|កៅអី|people|seats|seat|person)/);
  if (m) {
    return parseInt(m[1], 10);
  }
  return null;
}

export interface ColorInfo {
  id: string;
  khmerName: string;
  englishName: string;
  studioName: string;
  hex: string;
  description: string;
  emoji: string;
}

export const COLOR_DATABASE: Record<string, ColorInfo> = {
  red: {
    id: "red",
    khmerName: "ពណ៌ក្រហម",
    englishName: "Supersonic Crimson Red",
    studioName: "Supersonic Crimson Red",
    hex: "#8E1724",
    description: "ពណ៌ក្រហម (Supersonic Crimson Red) គឺជាពណ៌ដ៏លេចធ្លោ ស៊ីវិល័យ បែបស្ព័រ និងទាក់ទាញភ្នែកគ្រប់ដងផ្លូវ! ជួយលើកសម្រស់រថយន្តឱ្យកាន់តែមានអំណាច និងយុវវ័យ។",
    emoji: "❤️"
  },
  white: {
    id: "white",
    khmerName: "ពណ៌សគុជខ្យង",
    englishName: "Wind Chill Pearl White",
    studioName: "Wind Chill Pearl",
    hex: "#F4F6F9",
    description: "ពណ៌សគុជខ្យង (Wind Chill Pearl) ជាពណ៌ស្តេចលក់ដាច់បំផុត! មិនស្រូបកម្តៅថ្ងៃ មើលទៅភ្លឺថ្លាស្អាតជានិច្ច និងលក់ចេញវិញមានហាងឆេងខ្ពស់បំផុត។",
    emoji: "🤍"
  },
  black: {
    id: "black",
    khmerName: "ពណ៌ខ្មៅរលើប",
    englishName: "Midnight Onyx Black",
    studioName: "Midnight Onyx Black",
    hex: "#141518",
    description: "ពណ៌ខ្មៅ (Midnight Onyx Black) បង្ហាញពីភាពអស្ចារ្យ កិត្យានុភាព និងប្រណីតភាពកម្រិត VIP ដូចរថយន្តថ្នាក់ដឹកនាំកំពូល។",
    emoji: "🖤"
  },
  gray: {
    id: "gray",
    khmerName: "ពណ៌ប្រផេះ",
    englishName: "Brooklyn Slate Grey",
    studioName: "Brooklyn Slate Grey",
    hex: "#71767B",
    description: "ពណ៌ប្រផេះបែប Modern Slate ស្ទាយអភិជន មិនងាយប្រឡាក់ មិនសូវជាប់ធូលី និងងាយស្រួលថែទាំបំផុត។",
    emoji: "🩶"
  },
  green: {
    id: "green",
    khmerName: "ពណ៌បៃតងចាស់",
    englishName: "Imperial Dark Green",
    studioName: "Imperial Dark Green",
    hex: "#22352A",
    description: "ពណ៌បៃតងចាស់បែប Off-road ផ្សងព្រេង មាំទាំ និងប្លែកភ្នែក ពេញនិយមខ្លាំងសម្រាប់ប្រភេទ SUV និង Pickup។",
    emoji: "💚"
  },
  sand: {
    id: "sand",
    khmerName: "ពណ៌មាសខ្សាច់",
    englishName: "Desert Sand Metallic",
    studioName: "Desert Sand Metallic",
    hex: "#C5A059",
    description: "ពណ៌មាសខ្សាច់ (Desert Sand) ពណ៌លំដាប់ Limited Edition ប្រណីត ថ្លៃថ្នូរ និងមិនងាយច្រឡំជាមួយរថយន្តដទៃ។",
    emoji: "🏜️"
  },
  blue: {
    id: "blue",
    khmerName: "ពណ៌ខៀវ",
    englishName: "Blueprint / Deep Blue",
    studioName: "Blueprint",
    hex: "#1d4ed8",
    description: "ពណ៌ខៀវបែបស្ព័រ និងបច្ចេកវិទ្យា ទំនើប និងទាក់ទាញខ្លាំងសម្រាប់យុវវ័យសម័យថ្មី។",
    emoji: "💙"
  },
  silver: {
    id: "silver",
    khmerName: "ពណ៌ទឹកប្រាក់",
    englishName: "Celestial Silver Metallic",
    studioName: "Celestial Silver",
    hex: "#cbd5e1",
    description: "ពណ៌ទឹកប្រាក់ ភ្លឺចែងចាំង ធន់នឹងស្នាមឆ្កូតតូចតាច និងងាយស្រួលសម្អាតបំផុត។",
    emoji: "✨"
  }
};

function parseCarColor(str: string): ColorInfo | null {
  const norm = normalizeKhmer(str);
  if (norm.includes("ក្រហម") || norm.includes("red") || norm.includes("crimson")) return COLOR_DATABASE.red;
  if (norm.includes("ពណ៌ស") || norm.includes("ពណ៍ស") || (norm.includes("ស") && (norm.includes("ពណ៌") || norm.includes("ពណ៍") || norm.includes("white")))) return COLOR_DATABASE.white;
  if (norm.includes("ខ្មៅ") || norm.includes("black") || norm.includes("onyx")) return COLOR_DATABASE.black;
  if (norm.includes("ប្រផេះ") || norm.includes("កណ្តុរប្រមេះ") || norm.includes("grey") || norm.includes("gray") || norm.includes("slate")) return COLOR_DATABASE.gray;
  if (norm.includes("បៃតង") || norm.includes("ស្លឹកចេក") || norm.includes("green")) return COLOR_DATABASE.green;
  if (norm.includes("មាស") || norm.includes("ខ្សាច់") || norm.includes("ស្ពាន់") || norm.includes("sand") || norm.includes("gold") || norm.includes("bronze")) return COLOR_DATABASE.sand;
  if (norm.includes("ខៀវ") || norm.includes("ទឹកប៊ិច") || norm.includes("blue")) return COLOR_DATABASE.blue;
  if (norm.includes("ទឹកប្រាក់") || norm.includes("ប្រាក់") || norm.includes("silver")) return COLOR_DATABASE.silver;
  return null;
}

const INITIAL_QUICK_ACTIONS = [
  { id: "search_car", label: "🔍 ស្វែងរករថយន្តតាមតម្រូវការ", desc: "ប្រាប់ពីកម្រិតថវិកា ឬចំណូលចិត្តរបស់បង" },
  { id: "calc_loan", label: "💰 គណនាការបង់រំលស់ប្រចាំខែ", desc: "គណនាប្រាក់បង់មុន និងលុយបង់ប្រចាំខែ" },
  { id: "trade_in", label: "🔄 វាយប្តូររថយន្តចាស់ (Trade-In)", desc: "វាយតម្លៃរថយន្តចាស់កាត់ប្រាក់ទិញឡានថ្មី" },
  { id: "test_drive", label: "📅 ណាត់បើកបរសាកល្បងដោយឥតគិតថ្លៃ", desc: "សាកល្បងបើកបរផ្ទាល់នៅ Showroom" },
  { id: "contact_sales", label: "📞 ជជែកផ្ទាល់ជាមួយខ្ញុំ (វិបុល)", desc: "Telegram ផ្ទាល់ ឬទូរស័ព្ទមកកាន់ខ្ញុំ" }
];

export const CarChatbot: React.FC<CarChatbotProps> = ({
  products,
  branches,
  onOpenColorStudio,
  onOpenLoanModal,
  onOpenOrderModal,
  onOpenTradeInModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);

  // Gemini AI states
  const [customApiKey, setCustomApiKey] = useState<string>("");
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("drivex_gemini_key");
      if (savedKey) {
        setCustomApiKey(savedKey);
        setIsGeminiActive(true);
      }
    } catch (e) {}
  }, []);

  const handleSaveApiKey = () => {
    try {
      if (customApiKey.trim()) {
        localStorage.setItem("drivex_gemini_key", customApiKey.trim());
        setIsGeminiActive(true);
      } else {
        localStorage.removeItem("drivex_gemini_key");
        setIsGeminiActive(false);
      }
      setShowApiKeyModal(false);
    } catch (e) {}
  };

  // Conversational Context Memory
  const [contextProduct, setContextProduct] = useState<Product | null>(null);

  // Inline Loan Calculator state within chat
  const [calcCarId, setCalcCarId] = useState<string>("");
  const [calcDownPaymentPercent, setCalcDownPaymentPercent] = useState<number>(20);
  const [calcTermYears, setCalcTermYears] = useState<number>(5);

  // Inline Test Drive Booking Form state within chat
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    carId: "",
    branchId: "",
    date: "",
    time: "10:00 AM"
  });

  // Lead capture form state
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
    telegram: "",
    note: ""
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message with warm consultant greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialMsg: Message = {
        id: "msg-init",
        sender: "bot",
        text: "បាទជម្រាបសួរអតិថិជនជាទីគោរព! 🙏\n\nខ្ញុំបាទឈ្មោះ **វិបុល (Vibol)** ជាទីប្រឹក្សាជាន់ខ្ពស់ផ្នែកលក់រថយន្តប្រចាំ Showroom VehicleHub។\n\nបងអាចជជែកសួរនាំខ្ញុំបានដោយសេរី ដូចបងកំពុងមកដល់ Showroom ជជែកជាមួយខ្ញុំផ្ទាល់ចឹងបាទ! មិនថាបងចង់ដឹងអំពីរថយន្តតាមថវិកា, ចង់ឱ្យណែនាំឡានដំបូង, ឡានគ្រួសារ, ការបង់រំលស់, ឬប្រៀបធៀបម៉ូឌែលផ្សេងៗនោះទេ...\n\nតើថ្ងៃនេះបងកំពុងស្វែងរករថយន្តសម្រាប់ប្រើប្រាស់លក្ខណៈបែបណាដែរ ឬមានកម្រិតថវិកាប៉ុន្មានក្នុងចិត្តដែរទេបាទ?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "quick_actions",
        suggestions: [
          "ខ្ញុំចង់បានឡានពណ៌ក្រហមមួយ តើមានទេ",
          "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
          "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
          "ឡានណាដែលស៊ីសាំងតិច ជិះធ្វើការ?",
          "បង់រំលស់ត្រូវការប្រាក់ខែប៉ុន្មាន?"
        ]
      };
      setMessages([initialMsg]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addBotMessage = (messageProps: Partial<Message>) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...messageProps
        }
      ]);
    }, 600);
  };

  const addUserMessage = (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    return userMsg;
  };

  // Deep Human-Like Conversational Reasoning Engine
  const processQuery = (rawQuery: string) => {
    const q = rawQuery.trim();
    const norm = normalizeKhmer(q);
    const budget = parseKhmerNumber(q);
    const passengers = parsePassengers(q);
    const detectedColor = parseCarColor(q);

    // Contextual reference car
    const activeDiscussedCar = contextProduct || products.find(p => p.base_price > 20000 && p.brand.toLowerCase() === "toyota") || products[0];

    // =========================================================================
    // 1. 360 COLOR STUDIO VIEW INTENT (ឧ. "មើល 360", "មើលរូប", "មើលមួយជុំ")
    // =========================================================================
    if (norm.includes("មើល") && (norm.includes("360") || norm.includes("studio") || norm.includes("ជ្រុង") || norm.includes("រូប") || norm.includes("មួយជុំ"))) {
      const foundByName = products.find((p) => 
        (p.model && norm.includes(p.model.toLowerCase())) || 
        (p.name && norm.includes(p.name.toLowerCase())) ||
        (p.brand && norm.includes(p.brand.toLowerCase()))
      ) || activeDiscussedCar;

      if (foundByName) {
        setContextProduct(foundByName);
        onOpenColorStudio?.(foundByName);
        addBotMessage({
          text: `បាទបង! ខ្ញុំបានបើកផ្ទាំង **360° Configurator Studio** សម្រាប់ **${foundByName.brand} ${foundByName.model || foundByName.name}** ជូនបងផ្ទាល់នៅលើអេក្រង់រួចរាល់ហើយ!\n\nបងអាចចុចពិនិត្យមើលមួយតួខ្លួនពេញលេញបានទាំង ៦ ផ្នែក៖\n- **ពីមុខ (Front Grille)**\n- **ពីក្រោយ (Rear Tailgate)**\n- **ចំហៀង (Side Profile 360°)**\n- **មុំ ៣/៤ (Studio Dynamic)**\n- **យ៉ាន់កង់ & ហ្វ្រាំង Brembo**\n- **ផ្នែកខាងក្នុងប្រណីត (Interior Cockpit)**\n\nតើបងពេញចិត្តរាង និងពណ៌មួយណាដែរ? បងអាចប្រាប់ខ្ញុំដើម្បីឱ្យខ្ញុំជួយរៀបចំតម្លៃពិសេសជូនបានបាទ!`,
          suggestions: [
            `💰 គណនាការបង់រំលស់ $${foundByName.base_price.toLocaleString()}`,
            `📅 កក់បើកបរ ${foundByName.brand} ${foundByName.model || foundByName.name}`,
            "📞 ពិគ្រោះតម្លៃពិសេសជាមួយវិបុល"
          ]
        });
        return;
      }
    }

    // =========================================================================
    // 2. COLOR INQUIRY & SELECTION INTENT (ឧ. "ខ្ញុំចង់បានឡានពណ៌ក្រហមមួយ តើមានទេ", "មានពណ៌អីខ្លះ?")
    // =========================================================================
    if (detectedColor) {
      let matchingCars: Product[] = [];
      if (detectedColor.id === "red") {
        const camry = products.find(p => p.model.toLowerCase() === "camry");
        const cross = products.find(p => p.model.toLowerCase().includes("cross"));
        const rav4 = products.find(p => p.model.toLowerCase() === "rav4");
        const runner = products.find(p => p.model.toLowerCase() === "4runner");
        matchingCars = [camry, cross, runner || rav4].filter(Boolean) as Product[];
      } else if (detectedColor.id === "white") {
        const cross = products.find(p => p.model.toLowerCase().includes("cross"));
        const camry = products.find(p => p.model.toLowerCase() === "camry");
        const highlander = products.find(p => p.model.toLowerCase().includes("highlander"));
        matchingCars = [cross, camry, highlander].filter(Boolean) as Product[];
      } else if (detectedColor.id === "black") {
        const runner = products.find(p => p.model.toLowerCase() === "4runner");
        const camry = products.find(p => p.model.toLowerCase() === "camry");
        const landcruiser = products.find(p => p.model.toLowerCase().includes("land cruiser"));
        matchingCars = [runner, camry, landcruiser].filter(Boolean) as Product[];
      } else if (detectedColor.id === "green" || detectedColor.id === "sand") {
        const runner = products.find(p => p.model.toLowerCase() === "4runner");
        const tacoma = products.find(p => p.model.toLowerCase().includes("tacoma"));
        const rav4 = products.find(p => p.model.toLowerCase() === "rav4");
        matchingCars = [runner, tacoma, rav4].filter(Boolean) as Product[];
      } else {
        const camry = products.find(p => p.model.toLowerCase() === "camry");
        const cross = products.find(p => p.model.toLowerCase().includes("cross"));
        const bz = products.find(p => p.model.toLowerCase().includes("bz"));
        matchingCars = [camry, cross, bz].filter(Boolean) as Product[];
      }

      if (matchingCars.length === 0) matchingCars = products.slice(0, 3);
      const topCar = matchingCars[0];
      setContextProduct(topCar);

      addBotMessage({
        text: `បាទជម្រាបជូនបង! ពិតជាមានបាទ! ${detectedColor.emoji}✨\n\n**${detectedColor.khmerName} (${detectedColor.englishName})** គឺជាជម្រើសពណ៌ដ៏ទាក់ទាញ និងពេញនិយមខ្លាំងណាស់បាទ!\n\n${detectedColor.description}\n\nShowroom យើងខ្ញុំមានរថយន្ត ${detectedColor.khmerName} ក្នុងស្តុកស្រាប់ជាច្រើនជម្រើស (ដូចបង្ហាញខាងក្រោម)។ ពិសេសបងអាចចុច **«មើល 360° Studio»** នៅលើរថយន្តណាមួយដើម្បីពិនិត្យមើលរូបរាងពិតមួយតួខ្លួនពេញលេញបានភ្លាមៗបាទ៖`,
        type: "car_results",
        data: matchingCars.slice(0, 3),
        suggestions: [
          `🎨 មើល ${topCar.brand} ${topCar.model || topCar.name} 360° (${detectedColor.khmerName})`,
          `💰 គណនាការបង់រំលស់ ${topCar.brand} ${topCar.model || topCar.name}`,
          `📅 កក់បើកបរសាកល្បង ${detectedColor.khmerName}`,
          "📞 ពិគ្រោះស្តុកពណ៌ផ្ទាល់ជាមួយវិបុល"
        ]
      });
      return;
    }

    if (norm.includes("ពណ៌") || norm.includes("ពណ៍") || norm.includes("color")) {
      addBotMessage({
        text: `បាទបង! Showroom VehicleHub យើងខ្ញុំមានជម្រើសពណ៌ដ៏ប្រណីតរហូតដល់ **៨ ពណ៌ស្តង់ដារោងចក្រ** សម្រាប់រថយន្តគ្រប់ម៉ូឌែល៖\n\n- 🔴 **Supersonic Crimson Red:** ពណ៌ក្រហមបែបស្ព័រ ស៊ីវិល័យ និងទាក់ទាញ\n- ⚪ **Wind Chill Pearl White:** ពណ៌សគុជខ្យង ភ្លឺថ្លា មិនក្តៅ ពេញនិយមបំផុត\n- 🖤 **Midnight Onyx Black:** ពណ៌ខ្មៅរលើប ប្រណីត កិត្យានុភាពកម្រិត VIP\n- 🩶 **Brooklyn Slate Grey:** ពណ៌ប្រផេះបែប Modern មិនងាយប្រឡាក់ ងាយស្រួលថែទាំ\n- 💚 **Imperial Dark Green:** ពណ៌បៃតងចាស់បែប Off-road ផ្សងព្រេង មាំទាំ\n- 🏜️ **Desert Sand Metallic:** ពណ៌មាសខ្សាច់ លំដាប់ Limited Edition\n- 💙 **Blueprint / Deep Blue:** ពណ៌ខៀវយុវវ័យ ទាន់សម័យ\n- ✨ **Celestial Silver:** ពណ៌ទឹកប្រាក់ ភ្លឺចែងចាំង\n\nតើបងពេញចិត្តពណ៌មួយណាដែរ ដើម្បីឱ្យខ្ញុំបង្ហាញរថយន្តជាក់ស្តែង និងបើក 360° Studio ជូនបងមើលបាទ?`,
        suggestions: [
          "ខ្ញុំចង់បានឡានពណ៌ក្រហមមួយ តើមានទេ",
          "ខ្ញុំចង់បានឡានពណ៌ស",
          "ខ្ញុំចង់បានឡានពណ៌ខ្មៅ",
          "ខ្ញុំចង់បានឡានពណ៌ប្រផេះ"
        ]
      });
      return;
    }

    // =========================================================================
    // 2. FINANCING / LOAN INTENT (ឧ. "គណនាបង់រំលស់", "ការប្រាក់ប៉ុន្មាន")
    // =========================================================================
    const isLoanCalculationIntent = (norm.includes("គណនា") || norm.includes("បង់រំលស់") || norm.includes("រំលស់") || norm.includes("loan") || norm.includes("installment")) &&
      !norm.includes("ប្រាក់ខែ") && !norm.includes("លក្ខខណ្ឌ") && !norm.includes("អ្នកធានា") && !norm.includes("គ្មានលិខិត");

    if (isLoanCalculationIntent) {
      let targetCar = activeDiscussedCar;
      if (budget !== null) {
        const foundByPrice = products.find((p) => p.base_price === budget || Math.abs(p.base_price - budget) < 800);
        if (foundByPrice) targetCar = foundByPrice;
      }
      const foundByName = products.find((p) => 
        (p.model && norm.includes(p.model.toLowerCase())) || 
        (p.name && norm.includes(p.name.toLowerCase()))
      );
      if (foundByName) targetCar = foundByName;

      setContextProduct(targetCar);
      setCalcCarId(targetCar.id);
      addBotMessage({
        text: `បាទបង! ចំពោះរឿងបង់រំលស់ គឺងាយស្រួល និងរហ័សទាន់ចិត្តបំផុតបាទ។\n\nនេះជាតារាងគណនាការបង់រំលស់ជាក់ស្តែងសម្រាប់ **${targetCar.brand} ${targetCar.model || targetCar.name}** ($${targetCar.base_price.toLocaleString()})៖\n- អត្រាការប្រាក់សមរម្យត្រឹម **8.5%/ឆ្នាំ**\n- រយៈពេលបង់រំលស់រហូតដល់ **៧ ឆ្នាំ (៨៤ ខែ)**\n- អនុម័តរហ័សត្រឹមតែ **២៤ ម៉ោង** ដោយមិនចាំបាច់មានទ្រព្យបញ្ចាំឡើយ!\n\nបងអាចសាកល្បងចុចជ្រើសរើសភាគរយបង់មុន (10%, 20%, 30%, 50%) នៅខាងក្រោមដើម្បីមើលប្រាក់ត្រូវបង់ជាក់ស្តែងបានភ្លាមៗ៖`,
        type: "loan_calculator",
        suggestions: [
          `🚗 មើល ${targetCar.brand} ${targetCar.model || targetCar.name} 360°`,
          "📅 កក់បើកបរសាកល្បង",
          "📄 ឯកសារដែលត្រូវត្រៀម",
          "📞 ពិគ្រោះផ្ទាល់ជាមួយវិបុល"
        ]
      });
      return;
    }

    // =========================================================================
    // 3. FAMILY & PASSENGER SIZE (ឧ. "គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់", "ឡានគ្រួសារ", "៧ នាក់")
    // =========================================================================
    const isFamilyQuery = norm.includes("គ្រួសារ") || norm.includes("កូន") || norm.includes("ប្រពន្ធ") || norm.includes("ប្តី") || norm.includes("ឪពុក") || norm.includes("ម្តាយ") || (passengers !== null && passengers >= 4);

    if (isFamilyQuery) {
      if (passengers === 5 || (passengers !== null && passengers <= 5) || (!passengers && norm.includes("៥"))) {
        // Specific 5-passenger family response: Curate Corolla Cross, Camry, and 4Runner/RAV4
        const cross = products.find(p => p.model.toLowerCase().includes("cross") || p.name.toLowerCase().includes("cross"));
        const camry = products.find(p => p.model.toLowerCase() === "camry" || p.name.toLowerCase() === "camry");
        const fourRunner = products.find(p => p.model.toLowerCase() === "4runner" || p.name.toLowerCase() === "4runner");
        const rav4 = products.find(p => p.model.toLowerCase() === "rav4" || p.name.toLowerCase() === "rav4");

        const curated5SeatCars = [cross, camry, fourRunner || rav4].filter(Boolean) as Product[];
        const fiveSeatCars = curated5SeatCars.length >= 2 ? curated5SeatCars : products.filter(
          (p) => p.body_type === "SUV" || p.model.toLowerCase().includes("corolla") || p.model.toLowerCase().includes("camry")
        ).slice(0, 3);
        setContextProduct(fiveSeatCars[0]);

        addBotMessage({
          text: `បាទជម្រាបជូនបង! ចំពោះគ្រួសារដែលមានសមាជិក **៥ នាក់ (5-Seater Family)** នេះជាទំហំគ្រួសារដ៏កក់ក្តៅ និងពេញនិយមបំផុតបាទ! 👨‍👩‍👧‍👦\n\nសម្រាប់គ្រួសារ ៥ នាក់ បងមិនចាំបាច់ទិញឡានធំសម្បើម 7-8 កៅអីដែលពិបាកចត ឬស៊ីសាំងច្រើននោះទេ ខ្ញុំសូមណែនាំប្រភេទ **Compact & Mid-size SUV ឬ Crossover (៥ កៅអីទូលាយ)** និងប្រភេទ **Sedan ប្រណីត** ដែលមាន៖\n\n✨ **កៅអីជួរក្រោយទូលាយ:** អង្គុយ ៣ នាក់ពេញមិនចង្អៀតស្មា ឬទើសជង្គង់ឡើយ។\n✨ **ឃ្លុបក្រោយធំទូលាយ:** ផ្ទុកវ៉ាលី កាបូប និងអីវ៉ាន់ដើរលេងបានច្រើនសន្ធឹកសន្ធាប់។\n✨ **កម្ពស់ខ្ពស់ផុតពីដី (SUV):** ជិះផ្លូវរដិបរដុប ផ្លូវជង្ហុក ឬផ្លូវទឹកលិចក្នុងក្រុងបានយ៉ាងស្រួល។\n✨ **សន្សំសំចៃសាំង (Hybrid):** ស៊ីសាំងតិច (~4.5L/100km) ជួយសន្សំការចំណាយគ្រួសារបានរាប់រយដុល្លារក្នុងមួយខែ!\n\n💡 **ជម្រើសកំពូលៗសម្រាប់គ្រួសារ ៥ នាក់ដែលខ្ញុំសូមណែនាំជូនបង៖**\n១. **Toyota Corolla Cross / RAV4 ($25,335):** ឡាន SUV 5 កៅអី កម្ពស់ខ្ពស់ ជិះស្រួលគ្រប់ស្ថានភាពផ្លូវ\n២. **Toyota Camry ($29,600):** ប្រណីត ស្ងាត់ ផាសុកភាពខ្ពស់ ជិះ ៥ នាក់ស្រួលបំផុតលើផ្លូវឆ្ងាយ\n៣. **Toyota 4Runner ($42,270):** បើបងចង់បានរាងមាំទាំ តួខ្លួនរឹងមាំ និងដើរលេងផ្សងព្រេង\n\nនេះជារថយន្តទាំង ៣ ម៉ូឌែលដែលស័ក្តិសមបំផុតសម្រាប់គ្រួសារបង៖`,
          type: "car_results",
          data: fiveSeatCars,
          suggestions: [
            `🚗 មើល Toyota Corolla Cross 360°`,
            `🚗 មើល Toyota Camry 360°`,
            `💰 គណនាការបង់រំលស់សម្រាប់ ៥ នាក់`,
            "📅 កក់បើកបរសាកល្បងគ្រួសារ"
          ]
        });
        return;
      } else if (passengers && passengers >= 6) {
        // Large family (6, 7, 8 people)
        const sevenSeatCars = products.filter(
          (p) => (p.seating && p.seating >= 7) || p.model.toLowerCase().includes("highlander") || p.model.toLowerCase().includes("sequoia") || p.model.toLowerCase().includes("land cruiser") || p.model.toLowerCase().includes("sienna")
        ).slice(0, 3);
        setContextProduct(sevenSeatCars[0]);

        addBotMessage({
          text: `បាទបង! សម្រាប់គ្រួសារធំដែលមានសមាជិក **${passengers} នាក់** ខ្ញុំសូមណែនាំរថយន្តដែលមានកៅអី ៣ ជួរធំទូលាយ (៧ ទៅ ៨ កៅអី)៖\n\n👨‍👩‍👧‍👦 **ចំណុចពិសេសសម្រាប់គ្រួសារធំ៖**\n- **កៅអី ៣ ជួរពេញទំហំ:** មនុស្សចាស់ និងកូនក្មេងជិះស្រួល មិនចង្អៀតជើង។\n- **ម៉ាស៊ីនត្រជាក់ស្វ័យប្រវត្តិតាមជួរ (Independent Rear AC):** ត្រជាក់ដល់ជួរទី ៣ មិនក្តៅឡើយ។\n- **ឃ្លុបក្រោយធំទូលាយ:** ផ្ទុកវ៉ាលី និងអីវ៉ាន់ដើរលេងបានច្រើន។\n\nនេះជាកំពូលរថយន្តគ្រួសារ ៧-៨ កៅអីដែលស័ក្តិសមបំផុត៖`,
          type: "car_results",
          data: sevenSeatCars,
          suggestions: [
            `🚗 មើល ${sevenSeatCars[0]?.brand} ${sevenSeatCars[0]?.model || sevenSeatCars[0]?.name} 360°`,
            "💰 គណនាការបង់រំលស់",
            "📅 កក់បើកបរសាកល្បងគ្រួសារ"
          ]
        });
        return;
      } else {
        // General family inquiry
        const familyCars = products.filter(
          (p) => p.body_type === "SUV" || p.model.toLowerCase().includes("corolla") || p.model.toLowerCase().includes("camry")
        ).slice(0, 3);
        setContextProduct(familyCars[0]);

        addBotMessage({
          text: `បាទជម្រាបជូនបង! ការជ្រើសរើសរថយន្តសម្រាប់គ្រួសារ គឺផ្តោតលើភាពធំទូលាយ សុវត្ថិភាពខ្ពស់ និងការសន្សំសំចៃសាំង។\n\nតើគ្រួសាររបស់បងមានសមាជិកប្រហែលប៉ុន្មាននាក់ដែរ (ឧទាហរណ៍ ៥ នាក់ ឬ ៧ នាក់) ដើម្បីឱ្យខ្ញុំជួយរើសទំហំរថយន្ត និងកៅអីឱ្យត្រូវនឹងតម្រូវការជាក់ស្តែងបាទ? ខាងក្រោមនេះជាជម្រើសរថយន្តគ្រួសារដែលពេញនិយមបំផុត៖`,
          type: "car_results",
          data: familyCars,
          suggestions: [
            "គ្រួសារខ្ញុំមានគ្នា ៥ នាក់",
            "គ្រួសារខ្ញុំមានគ្នា ៧ នាក់",
            "💰 គណនាការបង់រំលស់"
          ]
        });
        return;
      }
    }

    // =========================================================================
    // 4. FLOODED ROAD, ROUGH TERRAIN & HIGH GROUND CLEARANCE
    // =========================================================================
    if (norm.includes("ទឹកលិច") || norm.includes("លិចទឹក") || norm.includes("ជង្ហុក") || norm.includes("ផ្លូវពិបាក") || norm.includes("ផ្លូវដី") || norm.includes("ខ្ពស់") || norm.includes("ទើស") || norm.includes("off-road") || norm.includes("ឡើងភ្នំ")) {
      const highClearanceCars = products.filter(
        (p) => p.body_type === "Truck" || p.model.toLowerCase().includes("4runner") || p.model.toLowerCase().includes("cross") || p.model.toLowerCase().includes("land cruiser") || p.model.toLowerCase().includes("tacoma")
      ).slice(0, 3);
      setContextProduct(highClearanceCars[0]);

      addBotMessage({
        text: `បាទបង! នេះជាកង្វល់ជាក់ស្តែងរបស់បងប្អូនយើងនៅស្រុកខ្មែរ ពិសេសរដូវភ្លៀង និងផ្លូវជង្ហុកបាទ! 🌧️🌊\n\nសម្រាប់ផ្លូវឧស្សាហ៍លិចទឹក ឬផ្លូវរដិបរដុប ខ្ញុំសូមណែនាំរថយន្តប្រភេទ **SUV កម្ពស់ខ្ពស់ផុតពីដី (High Ground Clearance)** ឬប្រភេទ **Pickup 4x4** ដែលមាន៖\n- **កម្ពស់ផុតពីដីខ្ពស់ (200mm - 250mm):** បើកកាត់ទឹកមិនបារម្ភចូលម៉ាស៊ីន ឬទើសបាតឡាន។\n- **ប្រព័ន្ធជើងក្រោមរឹងមាំ:** ស្រូបទម្ងន់ និងរំញ័របានល្អ ជិះមិនឃ្លេងឃ្លោង។\n- **ប្រព័ន្ធបើកបរប៉ុងពីរ (AWD / 4WD):** មិនជាប់ផុងពេលជួបផ្លូវភក់ ឬខ្សាច់។\n\nនេះជារថយន្តជើងក្រោមរឹងមាំ និងកម្ពស់ខ្ពស់ការពារទឹកលិចបានល្អបំផុត៖`,
        type: "car_results",
        data: highClearanceCars,
        suggestions: [
          `🚗 មើល ${highClearanceCars[0]?.brand} ${highClearanceCars[0]?.model} 360°`,
          "💰 គណនាការបង់រំលស់",
          "📅 កក់បើកបរសាកល្បង"
        ]
      });
      return;
    }

    // =========================================================================
    // 5. BUDGET INQUIRIES (ឧ. "តើមានឡានណាតម្លៃក្រោម២០០០០អត់", "ក្រោម ២ម៉ឺន", "ក្រោម 30000$")
    // =========================================================================
    const isUnderBudget = norm.includes("ក្រោម") || norm.includes("under") || norm.includes("below") || norm.includes("តិចជាង") || norm.includes("ត្រឹម") || norm.includes("ល្មម");
    const isPriceQuery = norm.includes("តម្លៃ") || norm.includes("price") || norm.includes("ថ្លៃ") || norm.includes("ថោក") || budget !== null;

    if (budget !== null && (isUnderBudget || isPriceQuery)) {
      const underCars = products
        .filter((p) => p.base_price <= budget && p.base_price > 10000)
        .sort((a, b) => a.base_price - b.base_price);

      if (underCars.length > 0) {
        setContextProduct(underCars[0]);
        addBotMessage({
          text: `បាទជម្រាបសួរអតិថិជនជាទីគោរព! ពិតជាមានបង! 🎉\n\nក្នុងកម្រិតថវិកាក្រោម **$${budget.toLocaleString()}** Showroom យើងខ្ញុំមានរថយន្តស៊េរីថ្មីគុណភាពខ្ពស់ចំនួន **${underCars.length} គ្រឿង** ក្នុងស្តុកស្រាប់ ដែលស័ក្តិសម និងសន្សំសំចៃបំផុតសម្រាប់បង៖\n\n💡 **ចំណុចពិសេសពីវិបុល:** ឡានទាំងអស់នេះធានាផ្លូវការពីរោងចក្រ ៣ ឆ្នាំ ហើយបងអាចជ្រើសរើសជម្រើសបង់រំលស់ជាមួយការប្រាក់អនុគ្រោះទាបត្រឹម 8.5%/ឆ្នាំ ឬកក់បើកបរសាកល្បងឥតគិតថ្លៃបានភ្លាមៗបាទ!`,
          type: "car_results",
          data: underCars.slice(0, 4),
          suggestions: [
            `💰 គណនាបង់រំលស់ $${underCars[0].base_price.toLocaleString()}`,
            `🚗 មើល ${underCars[0].brand} ${underCars[0].model || underCars[0].name} 360°`,
            "📅 កក់បើកបរសាកល្បង",
            "📞 ពិគ្រោះជាមួយវិបុលផ្ទាល់"
          ]
        });
        return;
      } else {
        // No cars strictly under this budget (e.g., $20,000, lowest in showroom is $23,125)
        const sortedCars = [...products]
          .filter((p) => p.base_price > 10000)
          .sort((a, b) => a.base_price - b.base_price);
        const closestCars = sortedCars.slice(0, 3);
        const lowestPrice = closestCars[0]?.base_price || 23125;
        const lowestCar = closestCars[0];
        setContextProduct(lowestCar);
        const estDownPayment = Math.round(lowestPrice * 0.2);
        const estMonthly = Math.round((lowestPrice * 0.8 * (0.085 / 12) * Math.pow(1 + 0.085 / 12, 60)) / (Math.pow(1 + 0.085 / 12, 60) - 1));

        addBotMessage({
          text: `បាទជម្រាបសួរអតិថិជនជាទីគោរព! 🙏 ខ្ញុំបាទ វិបុល សូមជម្រាបជូនបងដោយស្មោះត្រង់បាទ៖\n\nបច្ចុប្បន្នរថយន្តស៊េរីថ្មី Brand New ក្នុងស្តុក Showroom របស់យើងខ្ញុំ តម្លៃចាប់ផ្តើមទាបបំផុតគឺ **$${lowestPrice.toLocaleString()}** (គឺ **${lowestCar.brand} ${lowestCar.model || lowestCar.name}**) ដែលលើសពីកម្រិតថវិកា $${budget.toLocaleString()} របស់បងត្រឹមតែបន្តិចបន្តួចប៉ុណ្ណោះ។\n\n💡 **យោបល់ និងការណែនាំដ៏ល្អបំផុតពីខ្ញុំ៖**\n១. ខ្ញុំសូមណែនាំម៉ូឌែលដែលល្អ និងជិត $${budget.toLocaleString()} បំផុតជូនបង (ដូចបង្ហាញខាងក្រោម) ដែលជាកំពូលរថយន្តធន់ មិនងាយខូច សន្សំសំចៃសាំងបំផុត (${lowestCar.mpg_range || "32/41 MPG"}) និងលក់ចេញវិញមានហាងឆេងខ្ពស់។\n២. **ដំណោះស្រាយបង់រំលស់ (Easy Financing):** បងមិនចាំបាច់មានលុយសុទ្ធដល់ $${budget.toLocaleString()} ទេបាទ! បងគ្រាន់តែមានប្រាក់កក់មុន ២០% (ត្រឹមតែ **~$${estDownPayment.toLocaleString()}**) គឺអាចយកឡានជិះបានភ្លាមៗ ដោយបង់ប្រចាំខែត្រឹមតែ **~$${estMonthly}/ខែ** ប៉ុណ្ណោះ!\n\nតើបងយល់យ៉ាងណាដែរចំពោះជម្រើសនេះ? ខ្ញុំអាចជួយរៀបចំការគណនាលម្អិតជូនបងបានភ្លាមៗបាទ!`,
          type: "car_results",
          data: closestCars,
          suggestions: [
            `💰 គណនាការបង់រំលស់ $${lowestPrice.toLocaleString()}`,
            `🚗 មើល ${lowestCar.brand} ${lowestCar.model || lowestCar.name} 360°`,
            "📅 កក់បើកបរសាកល្បងឥតគិតថ្លៃ",
            "📞 ពិគ្រោះជាមួយវិបុលផ្ទាល់"
          ]
        });
        return;
      }
    }

    // =========================================================================
    // 6. BEGINNER / FIRST TIME BUYER (ឧ. "ខ្ញុំទើបចេះបើកបរ គួរទិញឡានអី?")
    // =========================================================================
    if (norm.includes("ទើប") || norm.includes("ចេះបើកបរ") || norm.includes("រៀនបើក") || norm.includes("ឡានដំបូង") || norm.includes("ស្រី") || norm.includes("beginner") || norm.includes("first car")) {
      const beginnerCars = products.filter(p => p.model.toLowerCase().includes("corolla") || p.body_type === "Sedan" || p.model.toLowerCase().includes("camry")).slice(0, 3);
      setContextProduct(beginnerCars[0]);

      addBotMessage({
        text: `បាទជម្រាបជូនបង! ពិតជាសំណួរល្អ និងឆ្លាតវៃមែនទែនបង! 👏\n\nសម្រាប់អ្នកដែលទើបតែចេះបើកបរ ឬទិញរថយន្តជិះលើកដំបូង តាមបទពិសោធន៍ផ្ទាល់របស់ខ្ញុំ ខ្ញុំសូមណែនាំឱ្យជ្រើសរើសរថយន្តដែលមានលក្ខណៈសម្បត្តិដូចខាងក្រោម៖\n\n១. **រាងល្មម ងាយស្រួលបត់បែន និងចត (Compact & Nimble):** ដូចជា **Toyota Corolla** ឬ **Corolla Hatchback** ដែលមានទំហំល្មម មើលឃើញផ្លូវច្បាស់ ងាយស្រួលបើកក្នុងក្រុងដែលចរាចរណ៍កកស្ទះ និងចតស្រួល។\n២. **បច្ចេកវិទ្យាសុវត្ថិភាពជំនួយពេលបើកបរ:** បំពាក់ប្រព័ន្ធចាប់ហ្វ្រាំងស្វ័យប្រវត្តិពេលមានឧបសគ្គ, ប្រព័ន្ធរក្សាគន្លងផ្លូវ (Lane Tracing Assist), និងកាមេរ៉ាជំនួយពេលថយក្រោយ។\n៣. **សន្សំសំចៃសាំង និងធន់:** មិនបារម្ភរឿងខាតសាំង ឬខូចកំប៉ិកកំប៉ុកឡើយ។\n\nនេះជារថយន្តដែលស័ក្តិសមបំផុតសម្រាប់អ្នកចាប់ផ្តើមដំបូង៖`,
        type: "car_results",
        data: beginnerCars,
        suggestions: [
          `🚗 មើល Toyota Corolla 360°`,
          `💰 គណនាការបង់រំលស់`,
          `📅 ណាត់បើកបរសាកល្បងសាកមើល`
        ]
      });
      return;
    }

    // =========================================================================
    // 7. FUEL ECONOMY & COMMUTE (ឧ. "ឡានណាដែលស៊ីសាំងតិច?", "សន្សំសំចៃសាំង")
    // =========================================================================
    if (norm.includes("ស៊ីសាំងតិច") || norm.includes("សន្សំសំចៃ") || norm.includes("ក្នុងក្រុង") || norm.includes("hybrid") || norm.includes("ev") || norm.includes("អគ្គិសនី") || norm.includes("សាំងតិច") || norm.includes("សាំង")) {
      const ecoCars = products.filter(
        (p) => p.top_label?.toLowerCase().includes("hybrid") || p.top_label?.toLowerCase().includes("ev") || p.powertrain_type === "HYBRID_EV" || p.powertrain_type === "BATTERY_EV" || p.mpg_range?.includes("53") || p.mpg_range?.includes("52") || p.brand.toLowerCase() === "tesla"
      ).slice(0, 3);
      setContextProduct(ecoCars[0]);

      addBotMessage({
        text: `បាទបង! ចំពោះការសន្សំសំចៃសាំង គឺជារឿងសំខាន់បំផុតសម្រាប់អ្នកជិះធ្វើការប្រចាំថ្ងៃបាទ! ⛽💸\n\nខ្ញុំសូមណែនាំបច្ចេកវិទ្យា **Toyota Hybrid EV** ឬ **Pure Electric (EV)** ៖\n\n🌟 **Toyota Corolla Hybrid / Camry Hybrid:**\n- ស៊ីសាំងត្រឹមតែ **~4.2L ទៅ 4.5L ក្នុង 100 គីឡូម៉ែត្រ** ប៉ុណ្ណោះ (ស្មើនឹង 53 MPG)!\n- ចាក់សាំងមួយពេញធុង អាចជិះបានជិត **១,០០០ គីឡូម៉ែត្រ**!\n- មិនបាច់ដោតឌុយសាកថ្មទេ ឡានសាកថ្មដោយខ្លួនឯងពេលជាន់ហ្វ្រាំង និងរត់លើផ្លូវ។\n- មួយខែៗជួយសន្សំលុយសាំងរបស់បងបានរាប់រយដុល្លារឯណោះ!\n\nនេះជាកំពូលរថយន្តសន្សំសំចៃសាំងបំផុតក្នុង Showroom៖`,
        type: "car_results",
        data: ecoCars,
        suggestions: [
          `🚗 មើល Toyota Corolla Hybrid 360°`,
          `💰 គណនាការបង់រំលស់`,
          `📅 កក់បើកបរសាកល្បង Hybrid`
        ]
      });
      return;
    }

    // =========================================================================
    // 8. SALARY, DOWN PAYMENT & FINANCING REQUIREMENTS
    // =========================================================================
    if (norm.includes("ប្រាក់ខែ") || norm.includes("ចំណូល") || norm.includes("salary") || norm.includes("គ្មានលិខិត") || norm.includes("រកស៊ី") || norm.includes("លក់ដូរ") || norm.includes("អ្នកធានា")) {
      addBotMessage({
        text: `បាទបង! ចំពោះលក្ខខណ្ឌបង់រំលស់ (Financing Requirements) គឺងាយស្រួល និងបត់បែនបំផុតបាទ! 😊\n\n💼 **ប្រាក់ខែ ឬចំណូល:** ត្រឹមតែចាប់ពី **$400 - $500/ខែ** ឡើងទៅគឺអាចស្នើសុំបង់រំលស់បានហើយ (ឬអាចបូកបញ្ចូលចំណូលប្តី-ប្រពន្ធ ឬអ្នករួមធានា)។\n📄 **បើគ្មានលិខិតបញ្ជាក់ប្រាក់ខែ (អ្នករកស៊ី/លក់ដូរ):** គ្រាន់តែប្រើ **របាយការណ៍ធនាគារ (Bank Statement) ៣-៦ ខែ** ឬវិក្កយបត្រទិញ-លក់ គឺគ្រប់គ្រាន់ហើយបាទ!\n💵 **ប្រាក់កក់មុន (Down Payment):** ចាប់ពី **១០% ទៅ ២០%** នៃតម្លៃរថយន្ត។\n📅 **រយៈពេលខ្ចី:** រហូតដល់ **៧ ឆ្នាំ (៨៤ ខែ)** ជាមួយការប្រាក់អនុគ្រោះត្រឹមតែ **8.5%/ឆ្នាំ**។\n⚡ **ល្បឿនអនុម័ត:** រហ័សត្រឹមតែ **២៤ ម៉ោង** ដោយមិនចាំបាច់មានទ្រព្យបញ្ចាំឡើយ!\n\nតើបងចង់ឱ្យខ្ញុំជួយគណនាប្រាក់បង់ប្រចាំខែជូនបងឥឡូវនេះដែរទេបាទ?`,
        type: "loan_calculator",
        suggestions: [
          "💰 សាកល្បងគណនាការបង់រំលស់",
          "📞 ជជែកជាមួយវិបុលផ្ទាល់",
          "📅 កក់បើកបរសាកល្បង"
        ]
      });
      return;
    }

    // =========================================================================
    // 9. PROMOTIONS & GIFTS (ឧ. "មានប្រូម៉ូសិន ឬថែមអីខ្លះបង?", "ចុះថ្លៃបានអត់?")
    // =========================================================================
    if (norm.includes("ប្រូម៉ូសិន") || norm.includes("ថែម") || norm.includes("ចុះថ្លៃ") || norm.includes("បញ្ចុះ") || norm.includes("promotion") || norm.includes("discount") || norm.includes("កាដូ")) {
      addBotMessage({
        text: `បាទបង! ចំពោះរឿងតម្លៃ និងការដូថែម គឺពិសេសខ្លាំងណាស់ក្នុងខែនេះបាទ! 🎁✨\n\nនៅពេលបងជាវរថយន្តពី Showroom យើងខ្ញុំថ្ងៃនេះ បងនឹងទទួលបាន **កញ្ចប់កាដូពិសេស (Premier Value Pack)** រួមមាន៖\n\n🎁 **១. ហ្វ្រីការចុះបញ្ជី និងស្លាកលេខភ្នំពេញ**\n🎁 **២. ហ្វ្រីការបិទហ្វីមការពារកម្ដៅថ្ងៃ Nano Ceramic UV ជុំវិញរថយន្ត** (តម្លៃ $350)\n🎁 **៣. ហ្វ្រីសេវាប្តូរប្រេងម៉ាស៊ីន និងត្រួតពិនិត្យ ២៥ ចំណុចឥតគិតថ្លៃ ១ ឆ្នាំដំបូង**\n🎁 **៤. ហ្វ្រីកម្រាលជើង VIP 5D ពេញមួយតួឡាន**\n🎁 **៥. ប័ណ្ណចាក់សាំងពេញធុងនៅថ្ងៃទទួលរថយន្ត**\n\n💵 **ចំពោះការបញ្ចុះតម្លៃបន្ថែម (Cash Discount):** ប្រសិនបើបងពេញចិត្តម៉ូឌែលណាមួយពិតប្រាកដ ខ្ញុំអាចស្នើសុំថ្នាក់ដឹកនាំបញ្ចុះតម្លៃពិសេសជូនបងបន្ថែមទៀតបានបាទ! តើបងស្រឡាញ់ម៉ូឌែលណាដែរ?`,
        suggestions: [
          "🚗 មើលរថយន្តក្នុងស្តុក",
          "💰 គណនាការបង់រំលស់",
          "📞 ជជែកចរចាតម្លៃផ្ទាល់ជាមួយវិបុល"
        ]
      });
      return;
    }

    // =========================================================================
    // 10. RESALE VALUE & DURABILITY
    // =========================================================================
    if (norm.includes("ធន់") || norm.includes("មិនងាយខូច") || norm.includes("ខាត") || norm.includes("លក់វិញ") || norm.includes("ហាងឆេង") || norm.includes("resale")) {
      const durableCars = products.filter(p => p.brand.toLowerCase() === "toyota" || p.brand.toLowerCase() === "lexus").slice(0, 3);
      setContextProduct(durableCars[0]);

      addBotMessage({
        text: `បាទបង! នេះជាសំណួរដែលអតិថិជនខ្មែរយើងតែងតែសួរខ្ញុំច្រើនជាងគេបំផុត! 🏆\n\nនៅស្រុកខ្មែរយើង បើនិយាយពីរឿង **«ធន់ មិនងាយខូច គ្រឿងបន្លាស់សម្បូរ និងលក់ចេញវិញមិនសូវខាតហាងឆេង»** គ្មានជម្រើសណាអាចផ្តួល **Toyota** និង **Lexus** បានឡើយបាទ៖\n\n១. **ហាងឆេងទីផ្សាររឹងមាំ:** ជិះ ២-៣ ឆ្នាំ លក់ចេញវិញស្រួល និងបាត់បង់តម្លៃតិចតួចបំផុត។\n២. **គ្រឿងបន្លាស់សម្បូរហូរហៀរ:** ពីភ្នំពេញរហូតដល់គ្រប់ស្រុកខេត្ត រកទិញបានងាយស្រួល និងតម្លៃសមរម្យ។\n៣. **ជាងណាៗក៏ចេះជួសជុល:** បច្ចេកវិទ្យាម៉ាស៊ីនស្គាល់ច្បាស់ ងាយស្រួលថែទាំបំផុត។\n\nខ្ញុំសូមណែនាំម៉ូឌែលដែលមានហាងឆេងរឹងមាំ និងធន់ជាងគេបំផុត៖`,
        type: "car_results",
        data: durableCars,
        suggestions: [
          `🚗 មើល ${durableCars[0]?.brand} ${durableCars[0]?.model} 360°`,
          "💰 គណនាការបង់រំលស់",
          "📅 កក់បើកបរសាកល្បង"
        ]
      });
      return;
    }

    // =========================================================================
    // 11. CHEAPEST CAR INQUIRY
    // =========================================================================
    if (norm.includes("ថោក") || norm.includes("ធូរ") || norm.includes("ទាប") || norm.includes("cheapest") || norm.includes("lowest")) {
      const sortedCars = [...products]
        .filter((p) => p.base_price > 10000)
        .sort((a, b) => a.base_price - b.base_price);
      const first = sortedCars[0];
      setContextProduct(first);

      addBotMessage({
        text: `បាទបង! រថយន្តដែលមានតម្លៃសមរម្យ និងធូរថ្លៃជាងគេបំផុតក្នុង Showroom យើងខ្ញុំគឺ **${first.brand} ${first.model || first.name}** តម្លៃត្រឹមតែ **$${first.base_price.toLocaleString()}** ប៉ុណ្ណោះ! ✨\n\n🌟 **ហេតុអ្វីបានជាម៉ូឌែលនេះលក់ដាច់ជាងគេ?**\n- សន្សំសំចៃសាំងខ្ពស់ (${first.mpg_range || "32/41"} MPG)\n- បំពាក់ប្រព័ន្ធសុវត្ថិភាព Toyota Safety Sense ជំនាន់ថ្មី\n- បង់មុន ២០% ត្រឹមតែ ~$${Math.round(first.base_price * 0.2).toLocaleString()} និងបង់ប្រចាំខែត្រឹមតែ ~$${Math.round((first.base_price * 0.8) / 60)}/ខែ!\n\nនេះជារូបភាព និងព័ត៌មានលម្អិតរបស់វាបាទ៖`,
        type: "car_results",
        data: sortedCars.slice(0, 3),
        suggestions: [
          `🚗 មើល ${first.brand} ${first.model} 360°`,
          `💰 គណនាបង់រំលស់ $${first.base_price.toLocaleString()}`,
          "📅 កក់បើកបរសាកល្បង"
        ]
      });
      return;
    }

    // =========================================================================
    // 12. BRAND / MODEL SPECIFIC INQUIRIES (Toyota, Ford, Lexus, Tesla, etc.)
    // =========================================================================
    const matchedProducts = products.filter((p) => {
      const brandMatch = p.brand.toLowerCase().includes(norm) || norm.includes(p.brand.toLowerCase());
      const modelMatch = p.model.toLowerCase().includes(norm) || p.name.toLowerCase().includes(norm) || norm.includes(p.model.toLowerCase());

      const isToyota = (norm.includes("toyota") || norm.includes("តូយ៉ូតា")) && p.brand.toLowerCase() === "toyota";
      const isFord = (norm.includes("ford") || norm.includes("ហ្វត") || norm.includes("raptor")) && p.brand.toLowerCase() === "ford";
      const isLexus = (norm.includes("lexus") || norm.includes("ឡិចស៊ីស")) && p.brand.toLowerCase() === "lexus";
      const isTesla = (norm.includes("tesla") || norm.includes("តេសឡា")) && p.brand.toLowerCase() === "tesla";

      return brandMatch || modelMatch || isToyota || isFord || isLexus || isTesla;
    });

    if (matchedProducts.length > 0) {
      setContextProduct(matchedProducts[0]);
      addBotMessage({
        text: `បាទបង! ខ្ញុំបានរកឃើញរថយន្តចំនួន **${matchedProducts.length} គ្រឿង** ក្នុងស្តុកដែលត្រូវនឹងការសួរនាំរបស់បង៖\n\nបងអាចចុច «មើល 360°» ដើម្បីពិនិត្យមើលគ្រប់ជ្រុងនៃរថយន្ត ឬចុច «គណនាកម្ចី» ដើម្បីមើលប្រាក់ត្រូវបង់ប្រចាំខែបានភ្លាមៗបាទ!`,
        type: "car_results",
        data: matchedProducts.slice(0, 4),
        suggestions: [
          `🚗 មើល ${matchedProducts[0].brand} ${matchedProducts[0].model || matchedProducts[0].name} 360°`,
          `💰 គណនាបង់រំលស់ $${matchedProducts[0].base_price.toLocaleString()}`,
          "📅 កក់បើកបរសាកល្បង",
          "📞 ពិគ្រោះជាមួយវិបុលផ្ទាល់"
        ]
      });
      return;
    }

    // =========================================================================
    // 13. FEEDBACK & INTELLIGENCE CRITICISM (ឧ. "chatbot នៅតែមិនទាន់យល់ពីអ្វីគេចង់បានដដែលល", "មិនឆ្លាត")
    // =========================================================================
    const isCriticism = 
      norm.includes("មិនទាន់ល្អ") || 
      norm.includes("មិនល្អ") || 
      norm.includes("មិនឆ្លាត") || 
      norm.includes("មិនសូវឆ្លាត") || 
      norm.includes("អន់") || 
      norm.includes("ឆ្លើយខុស") || 
      norm.includes("មិនយល់") ||
      norm.includes("មិនទាន់យល់") ||
      norm.includes("អត់យល់") ||
      norm.includes("ដដែល") ||
      (norm.includes("ឆ្លាត") && (norm.includes("ទេ") || norm.includes("មិន") || norm.includes("អត់") || norm.includes("ទាន់")));

    if (isCriticism) {
      addBotMessage({
        text: `បាទ ខ្ញុំបាទ វិបុល សូមអភ័យទោសដោយស្មោះពីចិត្តចំពោះភាពខ្វះខាតក្នុងការឆ្លើយតបមុននេះបាទ! 🙏\n\nខ្ញុំសូមទទួលយកមតិកែលម្អរបស់បងដោយក្តីគោរពបំផុត។ ឥឡូវនេះខ្ញុំអាចជួយបងលើគ្រប់តម្រូវការជាក់ស្តែងបានភ្លាមៗ ដូចជា៖\n\n- **ស្វែងរករថយន្តតាមពណ៌:** ពណ៌ក្រហម ❤️, ពណ៌សគុជខ្យង 🤍, ពណ៌ខ្មៅរលើប 🖤, ប្រផេះ 🩶, បៃតង 💚, មាសខ្សាច់ 🏜️\n- **ស្វែងរកតាមទំហំគ្រួសារ:** គ្រួសារ ៥ នាក់ (Compact/Mid SUV & Sedan) ឬ គ្រួសារ ៧-៨ នាក់ (Full SUV)\n- **ស្វែងរកតាមកម្រិតថវិកា:** ក្រោម ២ ម៉ឺន$, ៣ ម៉ឺន$, ៤ ម៉ឺន$\n- **រថយន្តសន្សំសំចៃសាំង (Hybrid) ឬ អគ្គិសនី (EV)**\n- **គណនាការបង់រំលស់ និងកក់ការបើកបរសាកល្បង**\n\nសូមបងប្រាប់ពីចំណូលចិត្ត ឬសាកល្បងសួរខ្ញុំម្តងទៀតបានបាទ!`,
        suggestions: [
          "ខ្ញុំចង់បានឡានពណ៌ក្រហមមួយ តើមានទេ",
          "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
          "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
          "ឡានណាដែលស៊ីសាំងតិច ជិះធ្វើការ?"
        ]
      });
      return;
    }

    // =========================================================================
    // 14. TRADE-IN / ដូរឡានចាស់យកឡានថ្មី
    // =========================================================================
    if (norm.includes("ដូរ") || norm.includes("trade") || norm.includes("វាយប្តូរ") || norm.includes("ឡានចាស់")) {
      const topCar = activeDiscussedCar;
      onOpenTradeInModal?.(topCar);
      addBotMessage({
        text: `បាទបង! Showroom VehicleHub យើងខ្ញុំមានកម្មវិធី **Trade-In វាយប្តូររថយន្តចាស់យកស៊េរីថ្មី** ជាមួយអត្ថប្រយោជន៍ពិសេសបំផុត៖\n\n- **ផ្តល់តម្លៃខ្ពស់បំផុតក្នុងទីផ្សារ:** យុត្តិធម៌ ផ្អែកលើស្ថានភាពជាក់ស្តែង\n- **ត្រួតពិនិត្យរហ័សត្រឹមតែ ២០ នាទី:** បុគ្គលិកបច្ចេកទេសជំនាញវាយតម្លៃជូនដល់កន្លែង\n- **កាត់ទឹកប្រាក់បង់រំលស់បានភ្លាមៗ:** តម្លៃឡានចាស់អាចយកធ្វើជាប្រាក់កក់មុន (Down Payment) បាន!\n\nបងអាចចុចបើកផ្ទាំង «ស្នើសុំ Trade-In វាយប្តូររថយន្ត» ឥឡូវនេះបានបាទ!`,
        suggestions: [
          "🚗 មើលរថយន្តស៊េរីថ្មីក្នុងស្តុក",
          "💰 គណនាការបង់រំលស់",
          "📞 ជជែកជាមួយអ្នកវាយតម្លៃផ្ទាល់"
        ]
      });
      return;
    }

    // =========================================================================
    // 15. PICKUP / TRUCK INTENT (ឧ. "ឡានភីកអាប់", "ឡានទ្រុង", "ឡានដឹក")
    // =========================================================================
    if (norm.includes("ភីកអាប់") || norm.includes("ទ្រុង") || norm.includes("ដឹក") || norm.includes("pickup") || norm.includes("truck") || norm.includes("tacoma") || norm.includes("tundra")) {
      const trucks = products.filter(p => p.body_type === "Truck" || p.model.toLowerCase().includes("tacoma") || p.model.toLowerCase().includes("tundra")).slice(0, 3);
      if (trucks.length > 0) {
        setContextProduct(trucks[0]);
        addBotMessage({
          text: `បាទបង! សម្រាប់ប្រភេទ **Pickup (រថយន្តទ្រុងដឹកទំនិញ)** គឺរឹងមាំ ធន់ និងពេញនិយមខ្លាំងសម្រាប់ការងារ ដឹកទំនិញ និងដើរលេងផ្លូវឆ្ងាយបាទ! 🛻💪\n\n- **កម្លាំងអូសទាញខ្លាំងក្លា:** ម៉ាស៊ីន Turbo i-FORCE កម្លាំងសេះខ្ពស់\n- **ទ្រុងក្រោយទូលាយ:** ផ្ទុកទំនិញ ឧបករណ៍ ឬសម្ភារៈការដ្ឋានបានយ៉ាងច្រើន\n- **ប៉ុងពីរ 4x4 Off-Road:** ជិះផ្លូវភក់ ផ្លូវដី ឬផ្លូវជម្រាលបានដោយសុវត្ថិភាព\n\nនេះជារថយន្ត Pickup ដ៏រឹងមាំក្នុងស្តុក Showroom យើងខ្ញុំ៖`,
          type: "car_results",
          data: trucks,
          suggestions: [
            `🚗 មើល ${trucks[0].brand} ${trucks[0].model} 360°`,
            `💰 គណនាការបង់រំលស់`,
            "📅 កក់បើកបរសាកល្បង"
          ]
        });
        return;
      }
    }

    // =========================================================================
    // 16. SPORTS CAR / ស្ព័រ
    // =========================================================================
    if (norm.includes("ស្ព័រ") || norm.includes("sports") || norm.includes("supra") || norm.includes("corvette")) {
      const sportsCars = products.filter(p => p.body_type === "Sports" || p.model.toLowerCase().includes("supra") || p.model.toLowerCase().includes("corvette")).slice(0, 3);
      if (sportsCars.length > 0) {
        setContextProduct(sportsCars[0]);
        addBotMessage({
          text: `បាទបង! សម្រាប់អ្នកចូលចិត្ត **ល្បឿន សំឡេងម៉ាស៊ីនរោទ៍ និងរាងស្ព័រទាក់ទាញ (Pure Sports Car)** នេះជាជម្រើសកំពូលក្នុង Showroom បាទ! 🏎️💨\n\n- **សន្ទុះល្បឿន 0-100 km/h ក្រោម 4 វិនាទី!**\n- **តួខ្លួន aerodynamic លំនឹងខ្ពស់**\n- **បំពាក់ប្រព័ន្ធហ្វ្រាំង Brembo និងផ្សែងស្ព័រ**\n\nនេះជារថយន្តស្ព័រដ៏កក្រើកដែលកំពុងមានក្នុងស្តុក៖`,
          type: "car_results",
          data: sportsCars,
          suggestions: [
            `🚗 មើល ${sportsCars[0].brand} ${sportsCars[0].model} 360°`,
            `💰 គណនាការបង់រំលស់`,
            "📅 កក់បើកបរសាកល្បង"
          ]
        });
        return;
      }
    }

    // =========================================================================
    // 17. GENERAL RECOMMENDATION / BEST-SELLERS (ឧ. "ណែនាំឡានមួយមក", "មានឡានអីខ្លះ", "ចង់ទិញឡាន")
    // =========================================================================
    if (norm.includes("ណែនាំ") || norm.includes("មានឡានអី") || norm.includes("ចង់ទិញ") || norm.includes("លក់ដាច់") || norm.includes("recommend")) {
      const cross = products.find(p => p.model.toLowerCase().includes("cross"));
      const camry = products.find(p => p.model.toLowerCase() === "camry");
      const runner = products.find(p => p.model.toLowerCase() === "4runner");
      const bestSellers = [cross, camry, runner].filter(Boolean) as Product[];

      addBotMessage({
        text: `បាទជម្រាបជូនបង! Showroom VehicleHub យើងខ្ញុំមានរថយន្តស៊េរីថ្មីគុណភាពខ្ពស់ជាច្រើនជម្រើស។ ខាងក្រោមនេះជា **កំពូលរថយន្ត ៣ ម៉ូឌែលដែលលក់ដាច់ និងទទួលបានការពេញចិត្តខ្ពស់បំផុត** ប្រចាំ Showroom៖\n\n១. **Toyota Corolla Cross Hybrid ($25,335):** SUV លក់ដាច់លេខ ១ កម្ពស់ខ្ពស់ សន្សំសំចៃសាំង\n២. **Toyota Camry ($29,600):** Sedan ប្រណីត ស្ងាត់ ផាសុកភាពខ្ពស់លើផ្លូវឆ្ងាយ\n៣. **Toyota 4Runner ($42,270):** SUV ធំមាំទាំ ជើងក្រោមរឹងមាំ ដើរលេងផ្លូវពិបាក\n\nបងអាចចុច «មើល 360°» ដើម្បីបង្វិលមើលរូបរាងពិត ឬចុច «គណនាកម្ចី» ដើម្បីមើលប្រាក់បង់ប្រចាំខែបានភ្លាមៗបាទ៖`,
        type: "car_results",
        data: bestSellers.length > 0 ? bestSellers : products.slice(0, 3),
        suggestions: [
          "ខ្ញុំចង់បានឡានពណ៌ក្រហមមួយ តើមានទេ",
          "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
          "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
          "💰 គណនាការបង់រំលស់"
        ]
      });
      return;
    }

    // =========================================================================
    // 18. SHOWROOM LOCATION & IDENTITY (ឧ. "តើបងឈ្មោះអ្វី?", "Showroom នៅឯណា?", "ទីតាំង")
    // =========================================================================
    if (norm.includes("ឈ្មោះអ្វី") || norm.includes("នរណា") || norm.includes("អ្នកណា") || norm.includes("who are you")) {
      addBotMessage({
        text: `បាទជម្រាបសួរអតិថិជនជាទីគោរព! 🙏\n\nខ្ញុំបាទឈ្មោះ **វិបុល (Vibol)** ជាទីប្រឹក្សាជាន់ខ្ពស់ផ្នែកលក់ និងផ្តល់យោបល់រថយន្តប្រចាំ Showroom VehicleHub បាទ។\n\nខ្ញុំមានតួនាទីជួយណែនាំរថយន្តដែលត្រូវនឹងតម្រូវការជាក់ស្តែងរបស់បង គណនាការបង់រំលស់ រៀបចំឯកសារកម្ចី និងកក់ការបើកបរសាកល្បងដោយឥតគិតថ្លៃ។ តើបងមានអ្វីចង់សួរនាំបន្ថែមដែរទេបាទ?`,
        suggestions: [
          "🚗 មើលរថយន្តក្នុងស្តុក",
          "💰 គណនាការបង់រំលស់",
          "📍 ទីតាំង Showroom"
        ]
      });
      return;
    }

    if (norm.includes("ទីតាំង") || norm.includes("នៅឯណា") || norm.includes("នៅណា") || norm.includes("showroom") || norm.includes("អាសយដ្ឋាន") || norm.includes("address") || norm.includes("location")) {
      addBotMessage({
        text: `បាទបង! Showroom VehicleHub របស់យើងខ្ញុំមាន ៣ សាខាធំៗទូទាំងប្រទេសកម្ពុជា ដើម្បីផ្តល់ភាពងាយស្រួលដល់បងប្អូន៖\n\n📍 **១. សាខាកណ្តាល (រាជធានីភ្នំពេញ):** មហាវិថីសហព័ន្ធរុស្ស៊ី (ទល់មុខព្រលានយន្តហោះអន្តរជាតិភ្នំពេញ) ☎️ 012 345 678\n📍 **២. សាខាខេត្តសៀមរាប:** ផ្លូវជាតិលេខ ៦ (ជិតផ្សារលើ) ☎️ 015 678 910\n📍 **៣. សាខាខេត្តបាត់ដំបង:** ផ្លូវជាតិលេខ ៥ (ក្បែររង្វង់មូលលោកតាដំបងក្រញូង) ☎️ 016 789 123\n\n⏰ **ម៉ោងបើកបម្រើការងារ:** ច័ន្ទ ដល់ អាទិត្យ (ម៉ោង 8:00 ព្រឹក ដល់ 7:30 យប់)\n\nតើបងចង់ឱ្យខ្ញុំជួយកក់ការបើកបរសាកល្បងនៅសាខាណាមួយទុកជាមុនដែរទេបាទ?`,
        suggestions: [
          "📅 កក់បើកបរសាកល្បងនៅភ្នំពេញ",
          "📅 កក់បើកបរសាកល្បងនៅសៀមរាប",
          "📞 ជជែកផ្ទាល់តាម Telegram"
        ]
      });
      return;
    }

    // =========================================================================
    // 15. CHIT-CHAT, COURTESY & PRAISE (Only positive sentiment)
    // =========================================================================
    const isPositiveCourtesy = (norm.includes("អរគុណ") || norm.includes("thank") || norm.includes("ចាស") || norm.includes("បាទ") || (norm.includes("ល្អ") && !norm.includes("មិន") && !norm.includes("អត់") && !norm.includes("ទាន់")));
    if (isPositiveCourtesy) {
      addBotMessage({
        text: `បាទជាសេចក្តីរីករាយណាស់បង! 🙏 ខ្ញុំបាទ វិបុល រីករាយនឹងជួយបម្រើ និងផ្តល់យោបល់ជូនបងគ្រប់ពេលវេលា។\n\nតើបងចង់ណាត់ជួបខ្ញុំផ្ទាល់នៅ Showroom ឬចង់ឱ្យខ្ញុំជួយគណនាការបង់រំលស់ និងកក់ការបើកបរសាកល្បងជូនបងបន្តទៀតដែរទេបាទ?`,
        suggestions: [
          "📅 កក់បើកបរសាកល្បង",
          "💰 គណនាការបង់រំលស់",
          "📍 ទីតាំង Showroom",
          "📞 ជជែកផ្ទាល់តាម Telegram"
        ]
      });
      return;
    }

    // =========================================================================
    // 16. TRADE-IN INTENT (វាយប្តូររថយន្តចាស់យកស៊េរីថ្មី)
    // =========================================================================
    if (norm.includes("trade") || norm.includes("ប្តូរឡាន") || norm.includes("ដូរឡាន") || norm.includes("ឡានចាស់") || norm.includes("វាយតម្លៃឡាន") || norm.includes("appraisal")) {
      const targetCar = activeDiscussedCar || products[0];
      addBotMessage({
        text: `បាទជម្រាបជូនបង! Showroom VehicleHub យើងខ្ញុំមានសេវាកម្ម **វាយប្តូររថយន្តចាស់យកស៊េរីថ្មី (Multi-Brand Trade-In Appraisal)** យ៉ាងងាយស្រួល និងចំណេញបំផុតបាទ! 🔄✨\n\n- **វាយតម្លៃរហ័សទាន់ចិត្តត្រឹមតែ ២០ នាទី**\n- **ផ្តល់តម្លៃខ្ពស់តាមហាងឆេងទីផ្សារជាក់ស្តែង**\n- **កាត់កងប្រាក់កក់ផ្ទាល់ជាមួយរថយន្តថ្មីដែលបងពេញចិត្ត**\n- **ជួយរៀបចំឯកសារផ្ទេរកម្មសិទ្ធិស្របច្បាប់ ១០០%**\n\nបងអាចចុច «🔄 បើកផ្ទាំងវាយប្តូរឡានចាស់» ខាងក្រោមដើម្បីគណនាតម្លៃប៉ាន់ស្មានភ្លាមៗបាទ៖`,
        suggestions: [
          "🔄 បើកផ្ទាំងវាយប្តូរឡានចាស់ (Trade-In)",
          `🚗 មើល ${targetCar.brand} ${targetCar.model || targetCar.name} 360°`,
          "💰 គណនាការបង់រំលស់",
          "📞 ពិគ្រោះផ្ទាល់ជាមួយវិបុល"
        ]
      });
      return;
    }

    // =========================================================================
    // 14. INTUITIVE CONSULTATIVE FALLBACK (Direct and helpful, not a menu!)
    // =========================================================================
    addBotMessage({
      text: `បាទជម្រាបជូនបង! ខ្ញុំបាទ វិបុល យល់ពីបំណងរបស់បងហើយបាទ។\n\nចំពោះរថយន្តស៊េរីថ្មីក្នុងស្តុក Showroom យើងខ្ញុំមានគ្រប់ជម្រើសទាំងប្រភេទ Sedan, Crossover, SUV 5-7 កៅអី, និង Pickup រឹងមាំ។\n\nដើម្បីឱ្យខ្ញុំណែនាំបានចំតម្រូវការរបស់បងបំផុត តើបងមានចំណូលចិត្តលើម៉ាកណាមួយ (ដូចជា Toyota, Lexus, Ford) ឬមានកម្រិតថវិកាប្រហាក់ប្រហែលប៉ុន្មានដែរទេបង?`,
      suggestions: [
        "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
        "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
        "បង ខ្ញុំទើបចេះបើកបរ គួរទិញឡានអី?",
        "ឡានណាដែលស៊ីសាំងតិច ជិះធ្វើការ?",
        "💰 គណនាការបង់រំលស់"
      ]
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;
    const query = inputVal.trim();
    setInputVal("");
    addUserMessage(query);

    // Fast check for local interactive widget triggers
    const norm = normalizeKhmer(query);
    const isInteractiveIntent =
      norm.includes("360") ||
      norm.includes("studio") ||
      (norm.includes("គណនា") && (norm.includes("រំលស់") || norm.includes("loan"))) ||
      norm.includes("test drive") ||
      norm.includes("បើកបរសាកល្បង") ||
      norm.includes("trade-in") ||
      norm.includes("ប្តូរឡាន");

    if (isInteractiveIntent) {
      processQuery(query);
      return;
    }

    // Call Google Gemini API through Next.js /api/chat route
    setIsTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text || "" })),
          activeVehicle: contextProduct,
          customApiKey: customApiKey || undefined,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.reply) {
        setIsTyping(false);
        setIsGeminiActive(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-gemini-${Date.now()}`,
            sender: "bot",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text",
            suggestions: data.suggestions || [
              "💰 គណនាការបង់រំលស់",
              "📅 កក់បើកបរសាកល្បង",
              "🚗 មើលរថយន្តក្នុងស្តុក"
            ],
          },
        ]);
        return;
      }
    } catch (err) {
      console.warn("Gemini AI API unavailable, continuing with rule engine:", err);
    } finally {
      setIsTyping(false);
    }

    // Fallback to local Khmer reasoning engine
    processQuery(query);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    addUserMessage(suggestionText);
    if (suggestionText.includes("បើកផ្ទាំងវាយប្តូរឡានចាស់") || suggestionText.includes("Trade-In")) {
      onOpenTradeInModal?.(contextProduct || products[0]);
    }
    processQuery(suggestionText);
  };

  // Handle Quick Actions
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "search_car":
        addUserMessage("🔍 ខ្ញុំចង់ស្វែងរករថយន្ត (Search Car)");
        addBotMessage({
          text: "បាទបង! សូមប្រាប់ខ្ញុំពីម៉ាក (Brand), ម៉ូឌែល (Model), ប្រភេទ (SUV/Sedan/Truck) ឬកម្រិតថវិកាដែលបងចង់បាន (ឧទាហរណ៍៖ 'Toyota', 'Ford Raptor', 'តម្លៃក្រោម $40,000', 'ក្រោម ២ម៉ឺន', 'ឡានគ្រួសារ ៥ នាក់'):",
          type: "text",
          suggestions: [
            "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
            "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
            "ឡានក្រោម 30000$",
            "ឡាន Hybrid សន្សំសំចៃសាំង"
          ]
        });
        break;

      case "calc_loan":
        addUserMessage("💰 គណនាការបង់រំលស់ (Loan Calculator)");
        addBotMessage({
          text: "នេះជាឧបករណ៍គណនាការបង់រំលស់រថយន្តរហ័ស (Financing Calculator)។ សូមជ្រើសរើសរថយន្ត និងភាគរយបង់មុនដែលបងចង់បាន៖",
          type: "loan_calculator",
          suggestions: [
            "ប្រាក់ខែ 500$ បង់រំលស់បានអត់?",
            "គ្មានលិខិតបញ្ជាក់ប្រាក់ខែ អាចបង់បានអត់?",
            "📅 កក់បើកបរសាកល្បង"
          ]
        });
        break;

      case "trade_in":
        addUserMessage("🔄 វាយប្តូររថយន្តចាស់ (Trade-In Appraisal)");
        onOpenTradeInModal?.(contextProduct || products[0]);
        addBotMessage({
          text: "បាទបង! Showroom VehicleHub យើងខ្ញុំមានសេវាកម្មវាយប្តូររថយន្តចាស់ (Trade-In) រហ័សត្រឹម ២០ នាទី។ ខ្ញុំបានបើកផ្ទាំងវាយតម្លៃជូនបងរួចរាល់ហើយបាទ!",
          suggestions: [
            "🚗 មើលរថយន្តថ្មីក្នុងស្តុក",
            "💰 គណនាការបង់រំលស់",
            "📞 ពិគ្រោះផ្ទាល់ជាមួយវិបុល"
          ]
        });
        break;

      case "test_drive":
        addUserMessage("📅 ណាត់បើកបរសាកល្បង (Test Drive)");
        addBotMessage({
          text: "រីករាយស្វាគមន៍ការកក់បើកបរសាកល្បងរថយន្ត! សូមបំពេញព័ត៌មានខាងក្រោមដើម្បីឱ្យខ្ញុំ (វិបុល) និងក្រុមការងារត្រៀមរថយន្ត និងបុគ្គលិកទទួលបងដោយកក់ក្តៅបំផុត៖",
          type: "test_drive_form"
        });
        break;

      case "contact_sales":
        addUserMessage("📞 ទំនាក់ទំនងបុគ្គលិកលក់ (Live Agent)");
        addBotMessage({
          text: "បងអាចជជែកផ្ទាល់ជាមួយខ្ញុំ (វិបុល) តាមរយៈ Telegram ផ្ទាល់ ឬទូរស័ព្ទមកកាន់ Showroom បានគ្រប់ពេលវេលាបាទ៖",
          type: "lead_form"
        });
        break;

      default:
        break;
    }
  };

  // Submit Test Drive Form
  const handleTestDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) {
      alert("សូមបញ្ចូលឈ្មោះ និងលេខទូរស័ព្ទរបស់អ្នក!");
      return;
    }

    const selectedCar = products.find((p) => p.id === (bookingForm.carId || calcCarId)) || contextProduct || products[0];
    const selectedBranch = branches.find((b) => b.id === bookingForm.branchId) || branches[0];
    const ticketId = `TD-${Math.floor(1000 + Math.random() * 9000)}`;

    addBotMessage({
      text: "ការកក់បើកបរសាកល្បងបានជោគជ័យ! 🎉 ប័ណ្ណណាត់ជួបត្រូវបានបង្កើតឡើង ហើយខ្ញុំបានផ្ញើការជូនដំណឹងទៅកាន់ Telegram Admin & Sales Concierge រួចរាល់។ ខ្ញុំទន្ទឹងរង់ចាំស្វាគមន៍បងនៅ Showroom បាទ!",
      type: "booking_success",
      data: {
        ticketId,
        customerName: bookingForm.name,
        phone: bookingForm.phone,
        carName: `${selectedCar.brand} ${selectedCar.model || selectedCar.name}`,
        carImage: selectedCar.images?.[0],
        branchName: selectedBranch.name,
        date: bookingForm.date || "ថ្ងៃស្អែក (Tomorrow)",
        time: bookingForm.time
      },
      suggestions: [
        `💰 គណនាការបង់រំលស់ ${selectedCar.brand} ${selectedCar.model || selectedCar.name}`,
        "📍 ទីតាំង និងផែនទី Showroom",
        "📞 ជជែកផ្ទាល់ជាមួយវិបុល"
      ]
    });

    setBookingForm({
      name: "",
      phone: "",
      carId: "",
      branchId: "",
      date: "",
      time: "10:00 AM"
    });
  };

  // Submit Lead Capture
  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.phone && !leadForm.telegram) {
      alert("សូមបញ្ចូលលេខទូរស័ព្ទ ឬ Telegram Username របស់អ្នក!");
      return;
    }

    addBotMessage({
      text: `អរគុណ ${leadForm.name || "បង"}! ព័ត៌មានទំនាក់ទំនងរបស់បងត្រូវបានបញ្ជូនមកកាន់ខ្ញុំ (វិបុល) រួចរាល់ហើយ។ ខ្ញុំនឹងទាក់ទងទៅកាន់បងក្នុងរយៈពេល ១៥ នាទីខាងមុខ ជាមួយការផ្តល់ជូនពិសេសបំផុតបាទ! 📞✨`,
      type: "text"
    });

    setLeadForm({ name: "", phone: "", telegram: "", note: "" });
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING LAUNCHER BUTTON & WELCOME CALLOUT                             */}
      {/* ========================================================================= */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Welcome Proactive Balloon if Chat is closed */}
        {!isOpen && showWelcomeBubble && (
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3.5 max-w-[300px] sm:max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setShowWelcomeBubble(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-xs shadow-xs"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </div>
              <div className="text-xs">
                <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>វិបុល (Vibol) • ទីប្រឹក្សាផ្នែកលក់</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  សួស្តីបង! តើបងត្រូវការឱ្យខ្ញុំជួយណែនាំរថយន្ត ឬគណនាការបង់រំលស់ទេបាទ?
                </div>
                <button
                  onClick={() => {
                    setIsOpen(true);
                    setShowWelcomeBubble(false);
                  }}
                  className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>ជជែកផ្ទាល់ជាមួយវិបុល (Chat Now)</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setShowWelcomeBubble(false);
          }}
          className={`group flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full transition-all duration-200 shadow-lg cursor-pointer ${
            isOpen
              ? "bg-slate-900 dark:bg-slate-800 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white font-bold hover:scale-105 active:scale-95 shadow-blue-500/20"
          }`}
          title="Car Dealership AI Assistant"
        >
          <div className="relative">
            {isOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <>
                <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </>
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight hidden sm:inline">
            {isOpen ? "បិទការជជែក (Close)" : "ជំនួយការ AI (Chat)"}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT DRAWER / POPUP MODAL                                              */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 z-50 w-[96vw] sm:w-[440px] md:w-[490px] h-[610px] sm:h-[670px] max-h-[88vh] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-md">
                <Bot className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-sm font-black tracking-tight">វិបុល (Vibol AI)</h3>
                  <BadgeCheck className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase border ${
                    isGeminiActive
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  }`}>
                    {isGeminiActive ? "✨ Gemini Live" : "⚡ Showroom AI"}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400">ទីប្រឹក្សាជាន់ខ្ពស់ផ្នែកលក់រថយន្ត • Showroom DriveX</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isGeminiActive
                    ? "bg-purple-600/30 text-purple-300 hover:bg-purple-600/50"
                    : "hover:bg-slate-800 text-amber-400"
                }`}
                title="កំណត់ Gemini API Key (Configure Google Gemini)"
              >
                <Key className="w-3.5 h-3.5" />
              </button>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-blue-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Telegram Vibol"
              >
                <Send className="w-3.5 h-3.5" />
              </a>
              <a
                href="tel:+85523888999"
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Call Vibol"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => {
                  setContextProduct(null);
                  setMessages([
                    {
                      id: `reset-${Date.now()}`,
                      sender: "bot",
                      text: "បាទជម្រាបសួរអតិថិជនជាទីគោរព! ខ្ញុំបាទ វិបុល បានកំណត់ការសន្ទនាឡើងវិញរួចរាល់ហើយ។ តើបងចង់ដឹងព័ត៌មានអំពីរថយន្តណាដែរ?",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      type: "quick_actions",
                      suggestions: [
                        "តើមានឡានណាតម្លៃក្រោម២០០០០អត់?",
                        "ខ្ញុំចង់ទិញឡានមួយសម្រាប់គ្រួសារខ្ញុំដែលមានគ្នា៥នាក់",
                        "បង ខ្ញុំទើបចេះបើកបរ គួរទិញឡានអី?",
                        "ឡានណាដែលស៊ីសាំងតិច ជិះធ្វើការ?",
                        "បង់រំលស់ត្រូវការប្រាក់ខែប៉ុន្មាន?"
                      ]
                    }
                  ]);
                }}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Reset Conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gemini API Key Configuration Drawer */}
          {showApiKeyModal && (
            <div className="p-4 bg-slate-900 border-b border-slate-800 text-xs text-white space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold">Google Gemini AI Setup</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                បញ្ចូល Google Gemini API Key ដើម្បីឱ្យ វិបុល ឆ្លើយឆ្លងជាភាសាខ្មែរ វិភាគ និងប្រៀបធៀបរថយន្តយ៉ាងឆ្លាតវៃ៖
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="AIzaSy... (Gemini API Key)"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 font-bold rounded-xl text-white text-xs cursor-pointer transition-colors"
                >
                  រក្សាទុក
                </button>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>ម៉ូដែល៖ Gemini 1.5 Flash</span>
                {isGeminiActive ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Gemini Live សកម្ម</span>
                  </span>
                ) : (
                  <span className="text-amber-400">Rule Engine សកម្ម (Offline Mode)</span>
                )}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/70 dark:bg-slate-900/60 text-xs">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-2 ${isBot ? "text-left" : "text-right"}`}>
                    {/* Text Bubble with Markdown-style bold and newlines */}
                    {msg.text && (
                      <div
                        className={`inline-block p-3 sm:p-3.5 rounded-2xl text-xs sm:text-[12.5px] leading-relaxed shadow-xs whitespace-pre-wrap ${
                          isBot
                            ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 rounded-tl-xs"
                            : "bg-amber-500 text-slate-950 font-bold rounded-tr-xs"
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-[9.5px] text-slate-400 px-1">
                      {msg.timestamp}
                    </div>

                    {/* Quick Action Buttons Module */}
                    {msg.type === "quick_actions" && (
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {INITIAL_QUICK_ACTIONS.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleQuickAction(action.id)}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-slate-200 dark:border-slate-800 hover:border-amber-400 text-left transition-all cursor-pointer shadow-2xs group"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                {action.label}
                              </div>
                              <div className="text-[10px] text-slate-400">{action.desc}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Car Search / Recommendation Results Module */}
                    {msg.type === "car_results" && Array.isArray(msg.data) && (
                      <div className="space-y-2 pt-1">
                        {msg.data.map((car: Product) => (
                          <div
                            key={car.id}
                            className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col gap-2 hover:border-amber-400 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={car.images?.[0] || "/placeholder-car.png"}
                                alt={car.name}
                                className="w-20 h-14 object-contain rounded-lg bg-slate-50 dark:bg-slate-800 p-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                                    {car.brand} {car.model || car.name}
                                  </h4>
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold shrink-0">
                                    មានក្នុងស្តុក
                                  </span>
                                </div>
                                <div className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                  ${car.base_price.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>ឆ្នាំ {car.year}</span>
                                  <span>•</span>
                                  <span>{car.body_type || "SUV"}</span>
                                  {car.mpg_range && (
                                    <>
                                      <span>•</span>
                                      <span>⚡ {car.mpg_range}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons for Car */}
                            <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                              <button
                                onClick={() => {
                                  setContextProduct(car);
                                  onOpenColorStudio?.(car);
                                }}
                                className="py-1.5 px-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer text-center truncate"
                              >
                                មើល 360°
                              </button>
                              <button
                                onClick={() => {
                                  setContextProduct(car);
                                  setCalcCarId(car.id);
                                  addUserMessage(`គណនាបង់រំលស់ ${car.brand} ${car.model || car.name}`);
                                  addBotMessage({
                                    text: `បាទបង! នេះជាការគណនាការបង់រំលស់សម្រាប់ **${car.brand} ${car.model || car.name}** ($${car.base_price.toLocaleString()})៖`,
                                    type: "loan_calculator"
                                  });
                                }}
                                className="py-1.5 px-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer text-center truncate"
                              >
                                គណនាកម្ចី
                              </button>
                              <button
                                onClick={() => {
                                  setContextProduct(car);
                                  setBookingForm((prev) => ({ ...prev, carId: car.id }));
                                  addUserMessage(`កក់បើកបរ ${car.brand} ${car.model || car.name}`);
                                  addBotMessage({
                                    text: `រីករាយណាស់បង! សូមបំពេញព័ត៌មានណាត់បើកបរសាកល្បងសម្រាប់ **${car.brand} ${car.model || car.name}** ខាងក្រោម៖`,
                                    type: "test_drive_form"
                                  });
                                }}
                                className="py-1.5 px-1 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-amber-500 hover:text-slate-950 transition-colors cursor-pointer text-center truncate"
                              >
                                កក់បើកបរ
                              </button>
                              <button
                                onClick={() => {
                                  setContextProduct(car);
                                  onOpenOrderModal?.(car);
                                }}
                                className="py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer text-center truncate"
                              >
                                កក់រថយន្ត
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Financing & Installment Calculator Module */}
                    {msg.type === "loan_calculator" && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-md space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs">
                            <Calculator className="w-4 h-4 text-amber-500" />
                            <span>គណនាការបង់រំលស់ (Loan Calculator)</span>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                            ការប្រាក់ 8.5%/ឆ្នាំ
                          </span>
                        </div>

                        {/* Car Selector */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">ជ្រើសរើសរថយន្ត (Vehicle)</label>
                          <select
                            value={calcCarId || products[0]?.id}
                            onChange={(e) => setCalcCarId(e.target.value)}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-slate-900 dark:text-white"
                          >
                            {products.slice(0, 15).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.brand} {p.model || p.name} (${p.base_price.toLocaleString()})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Calculate figures */}
                        {(() => {
                          const activeCar = products.find((p) => p.id === (calcCarId || products[0]?.id)) || products[0];
                          const price = activeCar?.base_price || 30000;
                          const downPaymentAmount = Math.round(price * (calcDownPaymentPercent / 100));
                          const loanAmount = price - downPaymentAmount;
                          const monthlyInterestRate = 0.085 / 12;
                          const totalMonths = calcTermYears * 12;
                          const monthlyPayment = Math.round(
                            (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalMonths)) /
                            (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
                          );

                          return (
                            <>
                              {/* Down payment % selector */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>ប្រាក់កក់មុន (Down Payment)</span>
                                  <span className="text-slate-900 dark:text-white font-black">{calcDownPaymentPercent}% (${downPaymentAmount.toLocaleString()})</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[10, 20, 30, 50].map((pct) => (
                                    <button
                                      key={pct}
                                      onClick={() => setCalcDownPaymentPercent(pct)}
                                      className={`py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                                        calcDownPaymentPercent === pct
                                          ? "bg-amber-500 text-slate-950 shadow-xs"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                      }`}
                                    >
                                      {pct}%
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Loan Term Years selector */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                  <span>រយៈពេលខ្ចី (Loan Term)</span>
                                  <span className="text-slate-900 dark:text-white font-black">{calcTermYears} ឆ្នាំ ({totalMonths} ខែ)</span>
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                  {[2, 3, 5, 7].map((yr) => (
                                    <button
                                      key={yr}
                                      onClick={() => setCalcTermYears(yr)}
                                      className={`py-1 rounded-lg text-[10.5px] font-black transition-all cursor-pointer ${
                                        calcTermYears === yr
                                          ? "bg-amber-500 text-slate-950 shadow-xs"
                                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                                      }`}
                                    >
                                      {yr} ឆ្នាំ
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Breakdown Results */}
                              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                                <div className="flex items-baseline justify-between">
                                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">ប្រាក់ត្រូវបង់ប្រចាំខែ៖</span>
                                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                                    ${monthlyPayment.toLocaleString()} <span className="text-[10px] text-slate-400">/ខែ</span>
                                  </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500">
                                  <span>ប្រាក់កម្ចីសរុប (Principal):</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">${loanAmount.toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Action: Open full loan modal or Book Test Drive */}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => onOpenLoanModal?.(activeCar)}
                                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs text-center transition-colors shadow-xs cursor-pointer"
                                >
                                  បើកផ្ទាំងគណនាលម្អិត
                                </button>
                                <button
                                  onClick={() => {
                                    setBookingForm((prev) => ({ ...prev, carId: activeCar.id }));
                                    addBotMessage({
                                      text: `រីករាយណាស់បង! សូមបំពេញការណាត់បើកបរសាកល្បងសម្រាប់ **${activeCar.brand} ${activeCar.model || activeCar.name}** ខាងក្រោម៖`,
                                      type: "test_drive_form"
                                    });
                                  }}
                                  className="py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                                >
                                  កក់បើកបរ
                                </button>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Test Drive Booking Form Module */}
                    {msg.type === "test_drive_form" && (
                      <form
                        onSubmit={handleTestDriveSubmit}
                        className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2.5"
                      >
                        <div className="flex items-center gap-1.5 font-black text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <span>កក់ការបើកបរសាកល្បង (Book Test Drive)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">ឈ្មោះរបស់អ្នក *</label>
                            <input
                              type="text"
                              required
                              placeholder="ឧ. សុខ ចិន្តា"
                              value={bookingForm.name}
                              onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">លេខទូរស័ព្ទ / Telegram *</label>
                            <input
                              type="tel"
                              required
                              placeholder="012 345 678"
                              value={bookingForm.phone}
                              onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400">ម៉ូឌែលរថយន្ត</label>
                          <select
                            value={bookingForm.carId || products[0]?.id}
                            onChange={(e) => setBookingForm({ ...bookingForm, carId: e.target.value })}
                            className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                          >
                            {products.slice(0, 15).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.brand} {p.model || p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">សាខា Showroom</label>
                            <select
                              value={bookingForm.branchId || branches[0]?.id}
                              onChange={(e) => setBookingForm({ ...bookingForm, branchId: e.target.value })}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                            >
                              {branches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.city} ({b.name.split(" ")[0]})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-400">ម៉ោងណាត់ជួប</label>
                            <select
                              value={bookingForm.time}
                              onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                              className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                            >
                              <option>09:00 AM</option>
                              <option>10:30 AM</option>
                              <option>02:00 PM</option>
                              <option>04:00 PM</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer mt-1"
                        >
                          បញ្ជាក់ការកក់បើកបរសាកល្បង
                        </button>
                      </form>
                    )}

                    {/* Booking Success Confirmation Ticket */}
                    {msg.type === "booking_success" && msg.data && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-lg space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>កក់ជោគជ័យ (Confirmed)</span>
                          </div>
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold">
                            {msg.data.ticketId}
                          </span>
                        </div>

                        {msg.data.carImage && (
                          <img
                            src={msg.data.carImage}
                            alt={msg.data.carName}
                            className="w-full h-24 object-contain bg-slate-50 dark:bg-slate-800 rounded-xl p-1"
                          />
                        )}

                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">អតិថិជន៖</span>
                            <span className="font-bold">{msg.data.customerName} ({msg.data.phone})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">រថយន្ត៖</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{msg.data.carName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">ទីតាំង៖</span>
                            <span className="font-bold">{msg.data.branchName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">ពេលណាត់៖</span>
                            <span className="font-bold">{msg.data.date} at {msg.data.time}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center gap-1.5 font-bold">
                          <span>🔔 ព័ត៌មានត្រូវបានបញ្ជូនទៅកាន់ Telegram Concierge រួចរាល់!</span>
                        </div>
                      </div>
                    )}

                    {/* Showroom & Dealership Info Module */}
                    {msg.type === "dealership_info" && (
                      <div className="space-y-2 pt-1">
                        {branches.map((b) => (
                          <div
                            key={b.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{b.name}</span>
                              {b.is_headquarters && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 text-[9px] font-bold">
                                  HQ
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{b.address}, {b.city}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <a href={`tel:${b.phone}`} className="hover:underline font-mono">{b.phone}</a>
                              <span className="ml-2">• បើកម៉ោង 8:00 AM - 6:00 PM (ច័ន្ទ-អាទិត្យ)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Live Agent / Lead Capture Module */}
                    {msg.type === "lead_form" && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3">
                        <div className="flex items-center gap-2">
                          <a
                            href="https://t.me/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs transition-colors shadow-xs"
                          >
                            <span>ជជែកតាម Telegram ជាមួយវិបុល</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href="tel:+85523888999"
                            className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>

                        <div className="relative flex items-center justify-center">
                          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                          <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 absolute uppercase">
                            ឬទុកលេខឱ្យខ្ញុំទាក់ទងទៅបងវិញ
                          </span>
                        </div>

                        <form onSubmit={handleLeadSubmit} className="space-y-2">
                          <input
                            type="text"
                            placeholder="ឈ្មោះរបស់បង"
                            value={leadForm.name}
                            onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                          />
                          <input
                            type="tel"
                            required
                            placeholder="លេខទូរស័ព្ទ ឬ @telegram_username *"
                            value={leadForm.phone}
                            onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white"
                          />
                          <button
                            type="submit"
                            className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            ផ្ញើព័ត៌មានមកកាន់ខ្ញុំ (វិបុល)
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Interactive Intelligent Follow-up Suggestion Chips */}
                    {isBot && msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(sug)}
                            className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:border-amber-500/40 text-[10px] font-bold transition-all cursor-pointer text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Simulated typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">វិបុលកំពុងសរសេរ...</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips directly above input */}
          <div className="px-3 py-2 bg-slate-100/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleQuickAction("search_car")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              🔍 ស្វែងរករថយន្ត
            </button>
            <button
              onClick={() => handleQuickAction("calc_loan")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              💰 គណនាកម្ចី
            </button>
            <button
              onClick={() => handleQuickAction("test_drive")}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              📅 កក់បើកបរ
            </button>
            <button
              onClick={() => {
                addUserMessage("តើមានប្រូម៉ូសិន ឬថែមអីខ្លះបង?");
                processQuery("ប្រូម៉ូសិន");
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              🎁 ប្រូម៉ូសិន & កាដូ
            </button>
            <button
              onClick={() => {
                addUserMessage("ម៉ោងធ្វើការ និងទីតាំង Showroom");
                processQuery("ទីតាំង");
              }}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:border-amber-400 shrink-0 cursor-pointer transition-colors"
            >
              📍 ទីតាំង Showroom
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="ជជែកសួរនាំវិបុល... (ឧ. ខ្ញុំទើបចេះបើកបរ គួរទិញឡានអី?)"
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
