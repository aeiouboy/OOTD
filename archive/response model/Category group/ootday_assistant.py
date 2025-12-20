"""
OOTDay AI Fashion Assistant
A friendly Thai fashion specialist AI assistant integrated with Central Group's product ecosystem
"""

import json
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from enum import Enum
import random


class Occasion(Enum):
    """Occasions that OOTDay can provide styling advice for"""
    WORK = "work"
    CHILL_DAY = "chill"
    WEDDING = "wedding"
    SPORT = "sport"
    TRAVEL = "travel"
    DATE = "date"
    DINNER = "dinner"
    CAFE = "cafe"
    PARTY = "party"


@dataclass
class Product:
    """Central Group product structure"""
    name: str
    brand: str
    price: int
    url: str
    category: str
    description: str = ""


@dataclass
class Outfit:
    """Complete outfit recommendation"""
    name: str
    description: str
    products: List[Product]
    styling_tip: str


class OOTDayAssistant:
    """Main OOTDay Fashion Assistant Class"""

    def __init__(self):
        self.personality = {
            "name": "OOTDay",
            "tone": "warm, friendly, conversational",
            "expertise": "global fashion trends, Thai fashion sensibilities, styling principles",
            "language": "Thai with natural code-switching to English for fashion terms"
        }

        # Sample product database (in real implementation, this would connect to Central's API)
        self.product_database = self._initialize_product_database()

        # Occasion-specific styling guidelines
        self.occasion_guidelines = {
            Occasion.WORK: {
                "style": "professional, polished, Thai workplace appropriate",
                "keywords": ["blazer", "shirt", "dress pants", "midi dress", "loafers", "pumps"]
            },
            Occasion.CHILL_DAY: {
                "style": "comfortable, casual, effortlessly stylish",
                "keywords": ["t-shirt", "jeans", "sneakers", "shorts", "casual dress"]
            },
            Occasion.WEDDING: {
                "style": "elegant, appropriate formality, Thai cultural considerations",
                "keywords": ["formal dress", "suit", "heels", "clutch", "midi dress", "evening wear"]
            },
            Occasion.SPORT: {
                "style": "functional, performance-oriented, trendy activewear",
                "keywords": ["sports bra", "leggings", "running shoes", "athletic shirt", "shorts"]
            },
            Occasion.TRAVEL: {
                "style": "versatile, comfortable, packable, climate-appropriate",
                "keywords": ["comfortable pants", "light jacket", "walking shoes", "crossbody bag"]
            },
            Occasion.DATE: {
                "style": "attractive, confidence-boosting, occasion-appropriate",
                "keywords": ["dress", "stylish top", "heels", "accessories", "perfume"]
            },
            Occasion.DINNER: {
                "style": "sophisticated, restaurant-appropriate",
                "keywords": ["elegant top", "dress pants", "dress shoes", "blazer", "clutch"]
            },
            Occasion.CAFE: {
                "style": "trendy, Instagram-worthy, relaxed",
                "keywords": ["casual dress", "denim", "comfortable shoes", "tote bag", "sunglasses"]
            },
            Occasion.PARTY: {
                "style": "fun, statement-making, event-appropriate",
                "keywords": ["party dress", "statement jewelry", "heels", "clutch", "bold accessories"]
            }
        }

    def get_welcome_message(self) -> str:
        """Returns the standard welcome message"""
        return "ฮายย ✋🏻 กำลังหาอะไรอยู่"

    def _initialize_product_database(self) -> List[Product]:
        """Initialize sample product database"""
        # In real implementation, this would connect to Central's product API
        return [
            # Women's Formal Dresses
            Product("Midi Dress คอวี", "JASPAL", 3990, "https://www.central.co.th/xxxxx", "dress",
                    "เดรสสีชมพูนู้ดที่ให้ความรู้สึกอบอุ่นและหรูหรา"),
            Product("Wrap Dress แขนยาว", "WAREHOUSE", 4290, "https://www.central.co.th/xxxxx", "dress",
                    "เดรสสีกรมท่าเรียบหรู"),
            Product("A-Line Midi Dress", "MANGO", 2990, "https://www.central.co.th/xxxxx", "dress",
                    "เดรสทรง A-Line สีพาสเทล"),

            # Shoes
            Product("Block Heel Sandals", "PEDRO", 2490, "https://www.central.co.th/xxxxx", "shoes",
                    "รองเท้าส้นตันสีนู้ด"),
            Product("Pointed Toe Pumps", "STEVE MADDEN", 3290, "https://www.central.co.th/xxxxx", "shoes",
                    "รองเท้าส้นสูงหัวแหลมสีดำ"),
            Product("White Sneakers", "ADIDAS", 3200, "https://www.central.co.th/xxxxx", "shoes",
                    "รองเท้าผ้าใบสีขาวคลาสสิก"),

            # Bags
            Product("Clutch Bag", "CHARLES & KEITH", 1590, "https://www.central.co.th/xxxxx", "bag",
                    "กระเป๋าคลัทช์สีทอง"),
            Product("Mini Handbag", "MANGO", 1290, "https://www.central.co.th/xxxxx", "bag",
                    "กระเป๋าถือมินิสีเงิน"),
            Product("Crossbody Bag", "COACH", 8900, "https://www.central.co.th/xxxxx", "bag",
                    "กระเป๋าสะพายข้างหนังแท้"),

            # Men's Formal Wear
            Product("Slim Fit Suit", "ARROW", 12900, "https://www.central.co.th/xxxxx", "suit",
                    "สูททรงสลิมฟิตสีกรมท่า"),
            Product("Oxford Shirt", "BROOKS BROTHERS", 3490, "https://www.central.co.th/xxxxx", "shirt",
                    "เชิ้ตอ๊อกฟอร์ดสีขาว"),
            Product("Dress Pants", "ZARA", 2290, "https://www.central.co.th/xxxxx", "pants",
                    "กางเกงสแล็คสีดำ"),

            # Casual Wear
            Product("Cotton T-Shirt", "UNIQLO", 590, "https://www.central.co.th/xxxxx", "shirt",
                    "เสื้อยืดคอตตอน 100%"),
            Product("Denim Jeans", "LEVI'S", 2990, "https://www.central.co.th/xxxxx", "pants",
                    "กางเกงยีนส์ทรงสลิม"),
            Product("Linen Shirt", "H&M", 1290, "https://www.central.co.th/xxxxx", "shirt",
                    "เสื้อเชิ้ตลินินแขนสั้น"),

            # Sport Wear
            Product("Dri-FIT Running Top", "NIKE", 1490, "https://www.central.co.th/xxxxx", "sportswear",
                    "เสื้อวิ่งระบายอากาศ"),
            Product("Yoga Leggings", "LULULEMON", 3900, "https://www.central.co.th/xxxxx", "sportswear",
                    "เลกกิ้งโยคะผ้ายืดหยุ่นสูง"),
            Product("Running Shoes", "ASICS", 4590, "https://www.central.co.th/xxxxx", "shoes",
                    "รองเท้าวิ่งรองรับแรงกระแทก"),
        ]

    def understand_request(self, message: str) -> Dict[str, any]:
        """Parse and understand customer request"""
        context = {
            "occasion": None,
            "gender": None,
            "budget": None,
            "preferences": [],
            "style": None
        }

        # Detect occasion
        message_lower = message.lower()
        occasion_keywords = {
            Occasion.WEDDING: ["งานแต่ง", "แต่งงาน", "wedding"],
            Occasion.WORK: ["ทำงาน", "ออฟฟิศ", "work", "office"],
            Occasion.CHILL_DAY: ["chill", "สบายๆ", "วันหยุด", "relax"],
            Occasion.SPORT: ["ออกกำลัง", "วิ่ง", "ฟิตเนส", "sport", "gym"],
            Occasion.TRAVEL: ["เที่ยว", "travel", "ทริป"],
            Occasion.DATE: ["เดท", "date", "นัด"],
            Occasion.DINNER: ["ดินเนอร์", "dinner", "อาหารค่ำ"],
            Occasion.CAFE: ["คาเฟ่", "cafe", "กาแฟ"],
            Occasion.PARTY: ["ปาร์ตี้", "party", "เลี้ยง"]
        }

        for occasion, keywords in occasion_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                context["occasion"] = occasion
                break

        # Detect style preferences
        if "เรียบหรู" in message or "คลาสสิก" in message or "classic" in message_lower:
            context["style"] = "classic"
        elif "แคชชวล" in message or "casual" in message_lower:
            context["style"] = "casual"
        elif "ทันสมัย" in message or "modern" in message_lower:
            context["style"] = "modern"

        return context

    def generate_outfit_recommendations(self, context: Dict, num_outfits: int = 2) -> List[Outfit]:
        """Generate outfit recommendations based on context"""
        outfits = []
        occasion = context.get("occasion", Occasion.CHILL_DAY)

        # Filter products based on occasion
        relevant_products = self._filter_products_by_occasion(occasion)

        # Create outfit combinations
        for i in range(num_outfits):
            outfit_products = self._create_outfit_combination(relevant_products, occasion)

            outfit_name = self._generate_outfit_name(occasion, i + 1)
            outfit_description = self._generate_outfit_description(occasion, outfit_products)
            styling_tip = self._generate_styling_tip(occasion, outfit_products)

            outfits.append(Outfit(
                name=outfit_name,
                description=outfit_description,
                products=outfit_products,
                styling_tip=styling_tip
            ))

        return outfits

    def _filter_products_by_occasion(self, occasion: Occasion) -> List[Product]:
        """Filter products relevant to the occasion"""
        guidelines = self.occasion_guidelines.get(occasion, {})
        keywords = guidelines.get("keywords", [])

        relevant_products = []
        for product in self.product_database:
            for keyword in keywords:
                if keyword in product.name.lower() or keyword in product.category.lower():
                    relevant_products.append(product)
                    break

        return relevant_products if relevant_products else self.product_database

    def _create_outfit_combination(self, products: List[Product], occasion: Occasion) -> List[Product]:
        """Create a complete outfit combination"""
        outfit_products = []

        # Select main piece (dress or top+bottom)
        dresses = [p for p in products if "dress" in p.category.lower()]
        if dresses and occasion in [Occasion.WEDDING, Occasion.DINNER, Occasion.DATE]:
            outfit_products.append(random.choice(dresses))
        else:
            # Select top and bottom
            tops = [p for p in products if "shirt" in p.category.lower() or "top" in p.name.lower()]
            bottoms = [p for p in products if "pants" in p.category.lower() or "jeans" in p.name.lower()]

            if tops:
                outfit_products.append(random.choice(tops))
            if bottoms:
                outfit_products.append(random.choice(bottoms))

        # Add shoes
        shoes = [p for p in products if "shoes" in p.category.lower() or "sneakers" in p.name.lower()]
        if shoes:
            outfit_products.append(random.choice(shoes))

        # Add bag
        bags = [p for p in products if "bag" in p.category.lower()]
        if bags and occasion in [Occasion.WEDDING, Occasion.DINNER, Occasion.DATE, Occasion.PARTY]:
            outfit_products.append(random.choice(bags))

        return outfit_products[:4]  # Limit to 4 items per outfit

    def _generate_outfit_name(self, occasion: Occasion, index: int) -> str:
        """Generate creative outfit name"""
        names = {
            Occasion.WEDDING: ["Elegant Blush", "Modern Classic Navy", "Romantic Rose Gold"],
            Occasion.WORK: ["Power Professional", "Smart Casual Friday", "Executive Chic"],
            Occasion.CHILL_DAY: ["Weekend Comfort", "Casual Cool", "Relaxed Vibes"],
            Occasion.SPORT: ["Active Energy", "Performance Plus", "Athletic Style"],
            Occasion.TRAVEL: ["Wanderlust Ready", "Jet Set Comfort", "Adventure Mode"],
            Occasion.DATE: ["Romantic Evening", "First Impression", "Date Night Glam"],
            Occasion.DINNER: ["Sophisticated Night", "Elegant Evening", "Dinner Chic"],
            Occasion.CAFE: ["Coffee Date Style", "Instagram Ready", "Brunch Vibes"],
            Occasion.PARTY: ["Party Perfect", "Dance Floor Ready", "Night Out Glam"]
        }

        occasion_names = names.get(occasion, ["Stylish Look"])
        return occasion_names[min(index - 1, len(occasion_names) - 1)]

    def _generate_outfit_description(self, occasion: Occasion, products: List[Product]) -> str:
        """Generate outfit description"""
        guidelines = self.occasion_guidelines.get(occasion, {})
        style = guidelines.get("style", "stylish and appropriate")

        return f"ลุคนี้ให้ความรู้สึก{style} เหมาะกับ{occasion.value}เป็นอย่างมาก"

    def _generate_styling_tip(self, occasion: Occasion, products: List[Product]) -> str:
        """Generate styling tips"""
        tips = {
            Occasion.WEDDING: "เลือกเครื่องประดับโทนทองหรือพิ้งโกลด์เพิ่มความหรูหรา ผมรวบหลวมๆ จะทำให้ดูสวยงาม",
            Occasion.WORK: "เพิ่มความมั่นใจด้วยนาฬิกาคลาสสิกและกระเป๋าหนังคุณภาพดี",
            Occasion.CHILL_DAY: "ใส่แว่นกันแดดและหมวกแก๊ปเพิ่มความชิล สบายๆ แต่ดูดี",
            Occasion.SPORT: "อย่าลืมผ้าเช็ดตัวและขวดน้ำที่มีสไตล์ ทำให้ลุคสปอร์ตสมบูรณ์",
            Occasion.TRAVEL: "เลือกกระเป๋า crossbody ใบเล็กใส่ของสำคัญ สะดวกเวลาเดินเที่ยว",
            Occasion.DATE: "พ่นน้ำหอมกลิ่นอ่อนๆ และทาลิปสีที่เข้ากับโทนชุด",
            Occasion.DINNER: "สีกรมท่าหรือดำเป็นสีที่เซฟและดูดีเสมอ ใส่ต่างหูยาวเพิ่มมิติ",
            Occasion.CAFE: "ถ่ายรูปสวยด้วยแสงธรรมชาติ อย่าลืมแว่นกันแดดเก๋ๆ",
            Occasion.PARTY: "ใส่รองเท้าที่เต้นได้สบาย และเตรียมกระเป๋าใบเล็กใส่ของจำเป็น"
        }

        return tips.get(occasion, "เพิ่มความมั่นใจด้วยการเลือกชิ้นที่ใส่แล้วสบายตัว")

    def format_response(self, outfits: List[Outfit], context: Dict) -> str:
        """Format the complete response in Thai style"""
        response_parts = []

        # Opening acknowledgment
        occasion = context.get("occasion", Occasion.CHILL_DAY)
        opening = self._generate_opening(occasion)
        response_parts.append(opening)

        # Outfit recommendations
        for i, outfit in enumerate(outfits, 1):
            response_parts.append(f"\n**ลุค {i}: {outfit.name}**")
            response_parts.append(outfit.description)
            response_parts.append("\n🛍️ **แนะนำสินค้า:**")

            for product in outfit.products:
                product_line = f"- **{product.category.title()}:** [{product.name} - {product.brand}]({product.url}) - ฿{product.price:,}"
                response_parts.append(product_line)

            response_parts.append(f"\n💡 **Styling Tip:** {outfit.styling_tip}")

            if i < len(outfits):
                response_parts.append("\n---")

        # Closing
        response_parts.append("\n---\nอยากดูทางเลือกอื่นไหมคะ? หรือมีข้อกำหนดเพิ่มเติมมั้ย? 😊")

        return "\n".join(response_parts)

    def _generate_opening(self, occasion: Occasion) -> str:
        """Generate contextual opening message"""
        openings = {
            Occasion.WEDDING: "อ้าว งานแต่งงานเพื่อนน่ารักเลย! 💕 ขอแนะนำลุคที่จะทำให้ดูดีแต่ไม่ชิงโฟกัสเจ้าสาวนะคะ ✨",
            Occasion.WORK: "เข้าใจเลยค่ะ! อยากดูโปรเฟสชั่นแลในที่ทำงาน มาดูลุคที่จะทำให้มั่นใจทั้งวันกันค่ะ 💼",
            Occasion.CHILL_DAY: "วันชิลล์ๆ ต้องแต่งตัวสบายแต่ดูดีนะคะ! มาดูลุคที่ใส่แล้วรีแล็กซ์กัน 🌟",
            Occasion.SPORT: "ออกกำลังกายก็ต้องดูดี! มาดูชุดที่ทั้งใส่สบายและมีสไตล์กันค่ะ 💪",
            Occasion.TRAVEL: "จะไปเที่ยวสินะคะ! ขอแนะนำลุคที่ใส่สบาย ถ่ายรูปสวย และเหมาะกับการเดินทาง ✈️",
            Occasion.DATE: "เดทต้องดูดีที่สุด! มาดูลุคที่จะทำให้คุณมั่นใจและน่าประทับใจกันค่ะ 💕",
            Occasion.DINNER: "ดินเนอร์ต้องดูหรูหราและมีคลาส มาดูลุคที่เหมาะกับบรรยากาศร้านดีๆ กันค่ะ 🍷",
            Occasion.CAFE: "ไปนั่งคาเฟ่ต้องดู Instagram-worthy! มาดูลุคที่ถ่ายรูปสวยทุกมุมกันค่ะ ☕",
            Occasion.PARTY: "ปาร์ตี้ต้องโดดเด่น! มาดูลุคที่จะทำให้คุณเป็นจุดสนใจในงานกันค่ะ 🎉"
        }

        return openings.get(occasion, "มาดูลุคที่เหมาะกับคุณกันค่ะ! ✨")

    def process_message(self, message: str) -> str:
        """Main method to process customer message and generate response"""
        # Parse request
        context = self.understand_request(message)

        # Generate outfit recommendations
        outfits = self.generate_outfit_recommendations(context)

        # Format and return response
        return self.format_response(outfits, context)


# Example usage
if __name__ == "__main__":
    assistant = OOTDayAssistant()

    # Display welcome message
    print(assistant.get_welcome_message())
    print()

    # Example customer request
    customer_message = "หาชุดไปงานแต่งเพื่อนค่ะ ช่วยแนะนำหน่อย"
    print(f"Customer: {customer_message}")
    print()

    # Generate response
    response = assistant.process_message(customer_message)
    print(f"OOTDay: {response}")