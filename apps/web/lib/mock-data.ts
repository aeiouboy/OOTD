import type { Outfit, Product, ConversationStarter, ChatMessage } from "./types"
import { generateOutfitsFromQuery } from "./outfit-generator"

/**
 * Product Catalog
 *
 * Products are now loaded from Central Group CSV files via API
 * This array will be populated at runtime by fetching from /api/products
 *
 * For fallback/testing, a few mock products are kept below
 */
export let mockProducts: Product[] = [
  {
    sku: "CG001",
    name: "Classic White Button Shirt",
    brand: "Central",
    price: 1290,
    imageUrl: "/white-button-shirt.png",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Ladprao"],
    onlineUrl: "https://central.co.th/product/cg001",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Light Blue"],
    category: "Women",
  },
  {
    sku: "CG002",
    name: "Tailored Black Trousers",
    brand: "Central",
    price: 1890,
    imageUrl: "/black-tailored-trousers.jpg",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Bangna"],
    onlineUrl: "https://central.co.th/product/cg002",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy"],
    category: "Women",
    occasion: ["work", "formal"],
  },
  {
    sku: "CG003",
    name: "Leather Oxford Shoes",
    brand: "Central",
    price: 2490,
    imageUrl: "/black-leather-oxford-shoes.jpg",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Bangna"],
    onlineUrl: "https://central.co.th/product/cg003",
    sizes: ["39", "40", "41", "42", "43"],
    colors: ["Black", "Brown"],
    category: "Women",
  },
  {
    sku: "CG004",
    name: "Casual Denim Jeans",
    brand: "Central",
    price: 1590,
    imageUrl: "/central-jeans.png",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Ladprao"],
    onlineUrl: "https://central.co.th/product/cg004",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black"],
    category: "Women",
    occasion: ["casual", "weekend"],
  },
  {
    sku: "CG005",
    name: "Floral Summer Dress",
    brand: "Central",
    price: 1590,
    imageUrl: "/floral-summer-dress.png",
    availability: "low_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://central.co.th/product/cg005",
    sizes: ["S", "M", "L"],
    colors: ["Floral Pink", "Floral Blue"],
    category: "Women",
    occasion: ["casual", "weekend"],
  },
  {
    sku: "CG006",
    name: "Blazer Jacket",
    brand: "Central",
    price: 2890,
    imageUrl: "/central-blazer.png",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Bangna", "Central Ladprao"],
    onlineUrl: "https://central.co.th/product/cg006",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Charcoal", "Beige"],
    category: "Women",
    occasion: ["work", "formal"],
  },
  {
    sku: "CG007",
    name: "Cotton T-Shirt",
    brand: "Central",
    price: 490,
    imageUrl: "/central-tshirt.png",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Bangna", "Central Ladprao"],
    onlineUrl: "https://central.co.th/product/cg007",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Gray", "Navy"],
    category: "Women",
    occasion: ["casual", "weekend"],
  },
  {
    sku: "CG008",
    name: "Leather Belt",
    brand: "Central",
    price: 890,
    imageUrl: "/placeholder.svg",
    availability: "in_stock",
    storeLocations: ["Central World", "Central Bangna"],
    onlineUrl: "https://central.co.th/product/cg008",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Brown"],
    category: "Women",
  },
  {
    sku: "SF001",
    name: "SFERA Women Blazer Suit",
    brand: "SFERA",
    price: 995,
    imageUrl: "/professional-business-outfit.jpg",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://www.central.co.th/th/sfera-women-blazer-suit-grcds54525030892",
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    visualDescription: "Women's black tailored blazer suit jacket, professional business attire",
    occasion: ["work", "formal"],
    category: "Women",
    subCategory: "Blazer",
  },
  {
    sku: "SF002",
    name: "SFERA Women Suit Pants",
    brand: "SFERA",
    price: 1881,
    imageUrl: "/black-tailored-trousers.jpg",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://www.central.co.th/th/sfera-women-suit-pants-grcds2510220219",
    sizes: ["S", "M", "L"],
    colors: ["Black"],
    visualDescription: "Women's black tailored suit trousers, formal office wear",
    occasion: ["work", "formal"],
    category: "Women",
    subCategory: "Pants",
  },
  {
    sku: "LO001",
    name: "SFERA White Blouse",
    brand: "SFERA",
    price: 1431,
    imageUrl: "/white-button-shirt.png",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://www.central.co.th/th/sfera-women-blouse-long-sleeves-schiffli-viscose-grcds2509250051",
    sizes: ["S", "M", "L"],
    colors: ["White"],
    visualDescription: "Women's white long-sleeve blouse with textured details, smart casual",
    occasion: ["work", "casual"],
    category: "Women",
    subCategory: "Blouse",
  },
  {
    sku: "SF003",
    name: "SFERA Printed Midi Skirt",
    brand: "SFERA",
    price: 945,
    imageUrl: "/sfera-midi-skirt.png",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://www.central.co.th/th/sfera-women-skirt-printed-midi-dark-brown-grcds54525030503",
    sizes: ["S", "M", "L"],
    colors: ["Dark Brown"],
    visualDescription: "Women's dark brown printed midi skirt, pleated flowy style, business casual",
    occasion: ["work", "casual"],
    category: "Women",
    subCategory: "Skirt",
  },
  {
    sku: "SF004",
    name: "SFERA Navy Button Dress",
    brand: "SFERA",
    price: 3290,
    imageUrl: "/sfera-navy-dress.png",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://central.co.th/sfera",
    sizes: ["S", "M", "L"],
    colors: ["Navy Blue"],
    visualDescription: "Women's navy blue structural sleeveless dress with gold buttons, professional look",
    occasion: ["work", "formal"],
    category: "Women",
    subCategory: "Dress",
  },
  {
    sku: "SH001",
    name: "Formal Heels",
    brand: "SFERA",
    price: 2030,
    imageUrl: "/black-leather-oxford-shoes.jpg",
    availability: "in_stock",
    storeLocations: ["Central World"],
    onlineUrl: "https://central.co.th/shoes",
    sizes: ["36", "37", "38"],
    colors: ["Black"],
    category: "Women",
  },
  {
    sku: "SH002",
    name: "Classic Pumps",
    brand: "LOLITA",
    price: 2090,
    imageUrl: "/black-leather-oxford-shoes.jpg",
    availability: "in_stock",
    storeLocations: ["Central Chidlom"],
    onlineUrl: "https://central.co.th/shoes",
    sizes: ["36", "37", "38"],
    colors: ["Nude"],
    category: "Women",
  },
]

/**
 * Load products from CSV catalog API
 * Call this on app initialization to replace mock products with real catalog
 */
export async function loadProductCatalog(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products', {
      cache: 'force-cache', // Cache the products
    })

    if (!response.ok) {
      console.error('Failed to load product catalog:', response.statusText)
      return mockProducts // Fallback to mock products
    }

    const data = await response.json()
    const products = data.products || []

    // Preserve manual SFERA/LOLITA mocks
    const manualMocks = mockProducts.filter(p => p.brand === 'SFERA' || p.brand === 'LOLITA' || p.brand === 'Central')

    // Update mockProducts array with real catalog merged with manual mocks
    mockProducts = products.length > 0 ? [...products, ...manualMocks] : mockProducts

    console.log(`Loaded ${products.length} products from catalog`)
    return products
  } catch (error) {
    console.error('Error loading product catalog:', error)
    return mockProducts // Fallback to mock products
  }
}

/**
 * Get products (returns current catalog)
 */
export function getProducts(): Product[] {
  return mockProducts
}

export const mockOutfits: Outfit[] = [
  {
    id: "outfit-1",
    title: "Professional Business Look",
    description: "Perfect for important meetings and presentations",
    totalPrice: 5670,
    items: [mockProducts[0], mockProducts[1], mockProducts[2]],
    imageUrl: "/professional-business-outfit.jpg",
  },
  {
    id: "outfit-2",
    title: "Casual Weekend Style",
    description: "Comfortable and stylish for weekend outings",
    totalPrice: 2980,
    items: [mockProducts[3], mockProducts[6]],
    imageUrl: "/casual-weekend-outfit.png",
  },
  {
    id: "outfit-3",
    title: "Summer Date Night",
    description: "Elegant and romantic for special occasions",
    totalPrice: 1590,
    items: [mockProducts[4]],
    imageUrl: "/summer-date-night-dress.jpg",
  },
  {
    id: "outfit-4",
    title: "Smart Casual Office",
    description: "Professional yet comfortable for modern workplaces",
    totalPrice: 4280,
    items: [mockProducts[5], mockProducts[6]],
    imageUrl: "/placeholder.svg?height=400&width=320&text=Smart+Casual+Office",
  },
  {
    id: "outfit-5",
    title: "Evening Elegance",
    description: "Sophisticated look for dinner parties and events",
    totalPrice: 5080,
    items: [mockProducts[5], mockProducts[1], mockProducts[7]],
    imageUrl: "/placeholder.svg?height=400&width=320&text=Evening+Elegance",
  },
  {
    id: "outfit-sfera",
    title: "SFERA Executive Suit",
    description: "ลุคทำงานแบบมืออาชีพ เรียบหรู ดูน่าเชื่อถือ เหมาะกับการประชุมสำคัญ",
    totalPrice: 2876,
    items: [mockProducts.find(p => p.sku === "SF001") || mockProducts[0], mockProducts.find(p => p.sku === "SF002") || mockProducts[2]],
    imageUrl: "/professional-business-outfit.jpg",
  },
  {
    id: "outfit-lolita",
    title: "SFERA Smart Office",
    description: "ลุคสบายๆ แต่ยังคงความสุภาพ ใส่ทำงานและไปเที่ยวต่อได้",
    totalPrice: 2376,
    items: [mockProducts.find(p => p.sku === "LO001") || mockProducts[1], mockProducts.find(p => p.sku === "SF003") || mockProducts[2]],
    imageUrl: "/white-button-shirt.png",
  },
]

export const conversationStarters: ConversationStarter[] = [
  {
    id: "starter-1",
    text: "What should I wear to a business meeting?",
    category: "professional",
  },
  {
    id: "starter-2",
    text: "Show me trendy casual outfits",
    category: "casual",
  },
  {
    id: "starter-3",
    text: "I need a dinner date look",
    category: "formal",
  },
  {
    id: "starter-4",
    text: "What's good for a weekend brunch?",
    category: "casual",
  },
  {
    id: "starter-5",
    text: "Help me dress for a job interview",
    category: "professional",
  },
  {
    id: "starter-6",
    text: "I want something comfortable for travel",
    category: "casual",
  },
]

export const quickActions = [
  "☀️ Today's Outfit",
  "💼 Work Look",
  "👕 Casual Weekend",
  "✨ Special Occasion",
]

// Enhanced AI response patterns (Thai Persona)
const responsePatterns = {
  business: [
    "ต้องชุดนี้เลย! ลุคทำงานแบบมืออาชีพ แต่ยังดูชิคและมั่นใจ เหมาะกับวันสำคัญๆ มากๆ เลยค่ะ ✨",
    "ขอแนะนำลุค Smart Casual ที่ใส่ไปทำงานแล้วดูดีสุดๆ แถมยังสบายตัวด้วยน้าา 💼",
    "ลุคนี้กำลังมาแรงในออฟฟิศเลย! ดูเรียบหรูแต่มีสไตล์ ใส่แล้วปังแน่นอน 🔥",
  ],
  casual: [
    "วันสบายๆ ต้องลุคนี้เลย! ใส่ไปเที่ยวคาเฟ่หรือเดินห้างก็เก๋กู๊ดดด ☕️✨",
    "จัดลุคชิลๆ มาให้แล้วจ้าา ใส่สบาย แมทช์ง่าย ถ่ายรูปสวยแน่นอน 📸",
    "นี่เลย! ลุค Casual ที่ดูไม่ธรรมดา ใส่แล้วดูดีมีสไตล์สุดๆ ไปเลยยย",
  ],
  formal: [
    "สำหรับงานสำคัญ ต้องลุคนี้เลยค่ะ! สวยหรูดูแพง ใส่แล้วออร่าจับแน่นอน ✨💃",
    "ขอแนะนำชุดออกงานที่ดูดีมีระดับ รับรองว่าใส่แล้วใครๆ ก็ต้องมอง!",
    "ลุคนี้เรียบหรูแต่ดูมีอะไร ใส่ไปงานไหนก็รอด เอางานอยู่แน่นอนค่ะ 🌟",
  ],
  date: [
    "เดททั้งทีต้องจัดเต็ม! ลุคนี้รับรองว่าหวานซ่อนเปรี้ยว แฟนปลื้มแน่นอน 💕",
    "แนะนำชุดเดทที่ดูน่ารักแต่แอบเซ็กซี่เบาๆ รับรองว่าประทับใจจ้าา 🌹",
    "ลุคออกเดทสไตล์โรแมนติก ใส่แล้วดูดี มีเสน่ห์สุดๆ ไปเลยยย ✨",
  ],
  interview: [
    "ชุดสัมภาษณ์งานที่ดูโปรแต่ไม่เครียดเกินไป ใส่แล้วมั่นใจ ได้งานชัวร์! 💼✨",
    "แนะนำลุคสุภาพที่ยังดูทันสมัย สร้างความประทับใจแรกได้แน่นอนค่ะ",
    "ชุดนี้ดูภูมิฐานและน่าเชื่อถือ เหมาะกับการไปสัมภาษณ์งานสุดๆ เป็นกำลังใจให้นะคะ! ✌️",
  ],
}

// Mock function to simulate AI response with more variety
export const getMockOutfitResponse = (query: string): ChatMessage => {
  const lowerQuery = query.toLowerCase()

  // Generate outfits from real product catalog
  const generatedOutfits = generateOutfitsFromQuery(mockProducts, query)

  // Fallback to mock outfits if generation fails
  let relevantOutfits: Outfit[] = generatedOutfits.length > 0 ? generatedOutfits : mockOutfits.slice(0, 3)



  // Determine response category for message
  let responseCategory = "casual"

  if (
    lowerQuery.includes("business") ||
    lowerQuery.includes("work") ||
    lowerQuery.includes("meeting") ||
    lowerQuery.includes("professional") ||
    lowerQuery.includes("ทำงาน") ||
    lowerQuery.includes("office") ||
    lowerQuery.includes("ประชุม")
  ) {
    responseCategory = "business"
  } else if (lowerQuery.includes("interview") || lowerQuery.includes("สัมภาษณ์")) {
    responseCategory = "interview"
  } else if (
    lowerQuery.includes("casual") ||
    lowerQuery.includes("weekend") ||
    lowerQuery.includes("brunch") ||
    lowerQuery.includes("travel") ||
    lowerQuery.includes("เที่ยว") ||
    lowerQuery.includes("สบายๆ") ||
    lowerQuery.includes("ชิล")
  ) {
    responseCategory = "casual"
  } else if (
    lowerQuery.includes("date") ||
    lowerQuery.includes("dinner") ||
    lowerQuery.includes("romantic") ||
    lowerQuery.includes("เดท") ||
    lowerQuery.includes("ดินเนอร์")
  ) {
    responseCategory = "date"
  } else if (
    lowerQuery.includes("formal") ||
    lowerQuery.includes("elegant") ||
    lowerQuery.includes("special") ||
    lowerQuery.includes("occasion") ||
    lowerQuery.includes("งานแต่ง") ||
    lowerQuery.includes("งานราตรี") ||
    lowerQuery.includes("ทางการ")
  ) {
    responseCategory = "formal"
  }

  const responses = responsePatterns[responseCategory as keyof typeof responsePatterns] || responsePatterns.casual
  let randomResponse = responses[Math.floor(Math.random() * responses.length)]

  // Generate dynamic specific response if we have outfits
  if (relevantOutfits.length > 0) {
    const mainOutfit = relevantOutfits[0]
    const itemNames = mainOutfit.items.slice(0, 2).map(i => i.subCategory || i.name).join(' และ ')

    // Customize based on category
    if (responseCategory === 'business') {
      randomResponse = `ขอแนะนำลุคทำงานที่ดูดีด้วยการแมทช์ ${itemNames} เข้าด้วยกันค่ะ ให้ลุคที่ดูเป็นมืออาชีพแต่ยังคงมีสไตล์ เหมาะสำหรับวันประชุมสำคัญ 💼✨`
    } else if (responseCategory === 'casual') {
      randomResponse = `วันสบายๆ ลองจับคู่ ${itemNames} ดูไหมคะ? เป็นลุคที่ใส่ไปเที่ยวคาเฟ่หรือเดินห้างก็ดูชิคสุดๆ เลยค่ะ ☕️`
    } else if (responseCategory === 'formal') {
      randomResponse = `สำหรับงานสำคัญ ลุคของ ${itemNames} จะช่วยเสริมความสง่าและดูแพง รับรองว่าโดดเด่นแน่นอนค่ะ 🌟`
    } else if (responseCategory === 'date') {
      randomResponse = `เดทนี้ต้องปัง! ลองแมทช์ ${itemNames} ดูสิคะ ได้ลุคที่ดูโรแมนติกและมีเสน่ห์มากๆ แฟนปลื้มชัวร์ 💕`
    }
  }

  return {
    id: `msg-${Date.now()}`,
    content: randomResponse,
    sender: "assistant",
    timestamp: new Date(),
    outfits: relevantOutfits,
  }
}

// Mock saved outfits for user profile
export const mockSavedOutfits: Outfit[] = [mockOutfits[0], mockOutfits[2]]

// Mock user preferences
export const mockUserPreferences = {
  favoriteColors: ["Black", "White", "Navy", "Beige"],
  preferredBrands: ["Central", "Zara", "H&M"],
  sizePreferences: {
    tops: "M",
    bottoms: "M",
    shoes: "40",
  },
  stylePreferences: ["Professional", "Casual", "Minimalist"],
  budgetRange: {
    min: 500,
    max: 3000,
  },
}

// Mock store data
export const mockStores = [
  {
    id: "central-world",
    name: "Central World",
    address: "999/9 Rama I Rd, Pathum Wan, Bangkok 10330",
    phone: "+66 2 635 1111",
    hours: {
      weekdays: "10:00 AM - 10:00 PM",
      weekends: "10:00 AM - 11:00 PM",
    },
    coordinates: { lat: 13.7467, lng: 100.5398 },
    services: ["Personal Shopping", "Alterations", "Gift Wrapping"],
  },
  {
    id: "central-ladprao",
    name: "Central Ladprao",
    address: "1693 Phahonyothin Rd, Chatuchak, Bangkok 10900",
    phone: "+66 2 937 9999",
    hours: {
      weekdays: "10:00 AM - 10:00 PM",
      weekends: "10:00 AM - 10:00 PM",
    },
    coordinates: { lat: 13.8162, lng: 100.5614 },
    services: ["Personal Shopping", "Gift Wrapping"],
  },
  {
    id: "central-bangna",
    name: "Central Bangna",
    address: "587 Debaratna Rd, Bang Na, Bangkok 10260",
    phone: "+66 2 352 4444",
    hours: {
      weekdays: "10:00 AM - 10:00 PM",
      weekends: "10:00 AM - 11:00 PM",
    },
    coordinates: { lat: 13.6674, lng: 100.6077 },
    services: ["Personal Shopping", "Alterations", "Gift Wrapping", "Style Consultation"],
  },
]

// Mock analytics data for demonstration
export const mockAnalytics = {
  totalConversations: 127,
  outfitsRecommended: 342,
  favoriteCategory: "Professional",
  averageSessionTime: "8m 32s",
  topBrands: ["Central", "Zara", "H&M"],
  monthlyStats: {
    conversations: 23,
    outfitsSaved: 8,
    purchasesMade: 3,
  },
}
