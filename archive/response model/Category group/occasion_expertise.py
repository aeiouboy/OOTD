"""
Occasion-Specific Expertise Module for OOTDay Assistant
Provides detailed styling knowledge and recommendations for different occasions
"""

from dataclasses import dataclass
from typing import List, Dict, Optional
from enum import Enum


class OccasionType(Enum):
    """Types of occasions OOTDay can style for"""
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
class OccasionGuideline:
    """Detailed guidelines for each occasion"""
    occasion_type: OccasionType
    thai_name: str
    style_description: str
    dress_code: str
    key_pieces: List[str]
    avoid_items: List[str]
    color_suggestions: List[str]
    styling_tips: List[str]
    cultural_considerations: str
    weather_notes: str
    accessories_guide: str
    budget_ranges: Dict[str, tuple]  # low, mid, high


class OccasionExpertise:
    """Expert knowledge base for occasion-specific styling"""

    def __init__(self):
        self.guidelines = self._initialize_guidelines()
        self.seasonal_adjustments = self._initialize_seasonal_adjustments()

    def _initialize_guidelines(self) -> Dict[OccasionType, OccasionGuideline]:
        """Initialize comprehensive guidelines for each occasion"""

        guidelines = {
            OccasionType.WORK: OccasionGuideline(
                occasion_type=OccasionType.WORK,
                thai_name="ทำงาน/ออฟฟิศ",
                style_description="Professional, polished, appropriate for Thai workplace culture",
                dress_code="Business casual to business formal depending on company",
                key_pieces=[
                    "เสื้อเชิ้ต", "เบลเซอร์", "กางเกงสแล็ค", "กระโปรงทรงเอ",
                    "เดรสแขนยาว", "รองเท้าหนังหุ้มส้น", "กระเป๋าหนัง"
                ],
                avoid_items=[
                    "เสื้อแขนกุด", "กางเกงขาสั้น", "รองเท้าแตะ",
                    "เสื้อยืด", "ชุดสายเดี่ยว", "กางเกงยีนส์ขาด"
                ],
                color_suggestions=[
                    "สีกรมท่า", "สีขาว", "สีเทา", "สีดำ",
                    "สีเบจ", "สีฟ้าอ่อน", "สีชมพูนู้ด"
                ],
                styling_tips=[
                    "เลือกผ้าที่ไม่ยับง่าย เช่น polyester blend",
                    "ควรมีเบลเซอร์ไว้ 1-2 ตัวสำหรับการประชุมสำคัญ",
                    "รองเท้าส้นสูง 2-3 นิ้วเหมาะสมที่สุด",
                    "กระเป๋าควรใหญ่พอใส่เอกสาร A4",
                    "เก็บชุดสำรองไว้ที่ออฟฟิศเผื่อเหตุฉุกเฉิน"
                ],
                cultural_considerations="หลีกเลี่ยงชุดที่เปิดเผยมากเกินไป ควรปิดไหล่และเข่า",
                weather_notes="เตรียมคาร์ดิแกนหรือเบลเซอร์ไว้ในห้องแอร์",
                accessories_guide="นาฬิกาคลาสสิก, ต่างหูขนาดเล็ก, สร้อยคอเรียบๆ",
                budget_ranges={
                    "low": (1000, 3000),
                    "mid": (3000, 8000),
                    "high": (8000, 20000)
                }
            ),

            OccasionType.CHILL_DAY: OccasionGuideline(
                occasion_type=OccasionType.CHILL_DAY,
                thai_name="วันชิลล์/วันหยุด",
                style_description="Comfortable, casual, effortlessly stylish",
                dress_code="Smart casual to ultra casual",
                key_pieces=[
                    "เสื้อยืด", "กางเกงยีนส์", "กางเกงขาสั้น",
                    "เดรสแขนสั้น", "รองเท้าผ้าใบ", "แจ็คเก็ตเดนิม"
                ],
                avoid_items=[
                    "ชุดเป็นทางการเกินไป", "รองเท้าส้นสูง",
                    "ชุดที่ต้องรีด", "เครื่องประดับหรูหรา"
                ],
                color_suggestions=[
                    "สีพาสเทลทุกโทน", "สีขาว", "สีเดนิม",
                    "สีเอิร์ธโทน", "สีสดใสตามอารมณ์"
                ],
                styling_tips=[
                    "Layer เสื้อเชิ้ตทับเสื้อยืดเพิ่มมิติ",
                    "กางเกงยีนส์ mom jeans กำลังฮิต",
                    "รองเท้าผ้าใบขาวเข้าได้กับทุกชุด",
                    "หมวกแก๊ปหรือ bucket hat เพิ่มความชิล",
                    "กระเป๋า tote bag หรือ crossbody สะดวกสบาย"
                ],
                cultural_considerations="ไม่มีข้อจำกัดมาก แต่งตัวตามสบาย",
                weather_notes="เลือกผ้าบางเบาสำหรับอากาศร้อน",
                accessories_guide="แว่นกันแดด, นาฬิกาแฟชั่น, สร้อยคอเงิน/ทอง",
                budget_ranges={
                    "low": (500, 2000),
                    "mid": (2000, 5000),
                    "high": (5000, 12000)
                }
            ),

            OccasionType.WEDDING: OccasionGuideline(
                occasion_type=OccasionType.WEDDING,
                thai_name="งานแต่งงาน",
                style_description="Elegant, appropriate formality level, Thai cultural considerations",
                dress_code="Formal to semi-formal, avoid white",
                key_pieces=[
                    "ชุดราตรี", "ชุดไทย", "เดรสยาว",
                    "ชุดสูท", "รองเท้าส้นสูง", "คลัทช์"
                ],
                avoid_items=[
                    "สีขาวล้วน", "สีดำล้วน", "ชุดสั้นเกินไป",
                    "ชุดสายเดี่ยวบางๆ", "กางเกงยีนส์", "รองเท้าผ้าใบ"
                ],
                color_suggestions=[
                    "สีชมพู", "สีฟ้า", "สีเขียวมิ้นท์",
                    "สีทอง", "สีม่วง", "สีน้ำเงินกรม"
                ],
                styling_tips=[
                    "งานกลางวันใส่สีสว่าง งานเย็นใส่สีเข้ม",
                    "เตรียมผ้าคลุมไหล่สำหรับพิธีในวัด",
                    "รองเท้าส้นหนาจะเดินสบายกว่า",
                    "เครื่องประดับแบบ statement piece ได้",
                    "ทำผมและแต่งหน้าให้ติดทนทั้งวัน"
                ],
                cultural_considerations="หลีกเลี่ยงสีขาว-ดำ, ปิดไหล่ในพิธีการ",
                weather_notes="เลือกผ้าที่ระบายอากาศดีสำหรับงานกลางแจ้ง",
                accessories_guide="เครื่องประดับชุดใหญ่, คลัทช์สีเมทัลลิค",
                budget_ranges={
                    "low": (2000, 5000),
                    "mid": (5000, 12000),
                    "high": (12000, 30000)
                }
            ),

            OccasionType.SPORT: OccasionGuideline(
                occasion_type=OccasionType.SPORT,
                thai_name="ออกกำลังกาย",
                style_description="Functional, performance-oriented, trendy activewear",
                dress_code="Athletic wear with proper support",
                key_pieces=[
                    "Sports bra", "เลกกิ้ง", "กางเกงขาสั้นวิ่ง",
                    "เสื้อ dri-fit", "รองเท้ากีฬา", "ถุงเท้ากีฬา"
                ],
                avoid_items=[
                    "เสื้อผ้าฝ้าย 100%", "กางเกงยีนส์",
                    "รองเท้าแฟชั่น", "เครื่องประดับ", "กระเป๋าถือ"
                ],
                color_suggestions=[
                    "สีดำ", "สีเทา", "สีน้ำเงิน",
                    "สีชมพูนีออน", "สีเขียวมิ้นท์"
                ],
                styling_tips=[
                    "เลือก sports bra ที่ support ระดับเหมาะกับกิจกรรม",
                    "ผ้าที่มีคุณสมบัติ moisture-wicking",
                    "เลกกิ้งควรมีกระเป๋าข้างใส่โทรศัพท์",
                    "รองเท้าต้องเหมาะกับประเภทกีฬา",
                    "ผูกผมให้เรียบร้อยไม่รบกวนการออกกำลังกาย"
                ],
                cultural_considerations="เลือกชุดที่ปิดมิดชิดพอเหมาะในที่สาธารณะ",
                weather_notes="เตรียมเสื้อแจ็คเก็ตบางๆ สำหรับวิ่งตอนเช้า",
                accessories_guide="Apple Watch, หูฟังไร้สาย, ขวดน้ำ",
                budget_ranges={
                    "low": (800, 2500),
                    "mid": (2500, 6000),
                    "high": (6000, 15000)
                }
            ),

            OccasionType.TRAVEL: OccasionGuideline(
                occasion_type=OccasionType.TRAVEL,
                thai_name="ท่องเที่ยว",
                style_description="Versatile, comfortable, packable, climate-appropriate",
                dress_code="Practical comfort with style",
                key_pieces=[
                    "กางเกงขายาวผ้าบาง", "เสื้อยืดคอตตอน",
                    "เดรสแมกซี่", "รองเท้าเดินสบาย", "แจ็คเก็ตกันลม"
                ],
                avoid_items=[
                    "ชุดที่ต้องรีด", "รองเท้าใหม่ที่ยังไม่เคยใส่",
                    "เครื่องประดับราคาแพง", "กระเป๋าหรูเกินไป"
                ],
                color_suggestions=[
                    "สีที่ซ่อนรอยเปื้อน", "สีกลาง",
                    "ลายที่ไม่เห็นรอยยับ"
                ],
                styling_tips=[
                    "เลือกผ้าที่แห้งเร็วและไม่ยับ",
                    "ใส่ชุดเป็นชั้นๆ ถอดใส่ได้ตามอากาศ",
                    "รองเท้า 2 คู่: เดินเที่ยว + ใส่สบายๆ",
                    "กระเป๋า crossbody ปลอดภัยกว่า",
                    "ผ้าพันคอใช้ประโยชน์ได้หลายอย่าง"
                ],
                cultural_considerations="ศึกษาการแต่งกายที่เหมาะสมของแต่ละประเทศ",
                weather_notes="เช็คสภาพอากาศก่อนเดินทางเสมอ",
                accessories_guide="แว่นกันแดด, หมวก, กระเป๋าเป้, ผ้าพันคอ",
                budget_ranges={
                    "low": (1500, 4000),
                    "mid": (4000, 10000),
                    "high": (10000, 25000)
                }
            ),

            OccasionType.DATE: OccasionGuideline(
                occasion_type=OccasionType.DATE,
                thai_name="เดท",
                style_description="Attractive, confidence-boosting, occasion-appropriate",
                dress_code="Smart casual to dressy depending on venue",
                key_pieces=[
                    "เดรสสั้น", "เสื้อสวย", "กางเกงขายาวทรงสวย",
                    "รองเท้าส้น", "กระเป๋าสะพายเล็ก"
                ],
                avoid_items=[
                    "ชุดที่ดูไม่ใส่ใจ", "รองเท้าที่เดินไม่สะดวก",
                    "ชุดที่เปิดเผยเกินไป", "ชุดที่ไม่มั่นใจ"
                ],
                color_suggestions=[
                    "สีแดง", "สีชมพู", "สีดำ",
                    "สีน้ำเงิน", "ลายดอกไม้"
                ],
                styling_tips=[
                    "เลือกชุดที่ใส่แล้วมั่นใจที่สุด",
                    "อย่าใส่ชุดใหม่ที่ไม่เคยลอง",
                    "แต่งหน้าแบบธรรมชาติแต่สวย",
                    "ใส่น้ำหอมกลิ่นอ่อนๆ",
                    "เตรียมลิปมันมาทาเพิ่มได้"
                ],
                cultural_considerations="แต่งตัวให้เหมาะกับสถานที่นัด",
                weather_notes="เตรียมเสื้อคลุมบางๆ สำหรับร้านแอร์แรง",
                accessories_guide="ต่างหูสวย, สร้อยคอประณีต, นาฬิกา",
                budget_ranges={
                    "low": (1500, 3500),
                    "mid": (3500, 8000),
                    "high": (8000, 20000)
                }
            ),

            OccasionType.DINNER: OccasionGuideline(
                occasion_type=OccasionType.DINNER,
                thai_name="ดินเนอร์",
                style_description="Sophisticated, restaurant-appropriate",
                dress_code="Smart casual to formal depending on restaurant",
                key_pieces=[
                    "เดรสค็อกเทล", "เสื้อผ้าไหม", "กางเกงผ้า",
                    "เบลเซอร์", "รองเท้าหุ้มส้น", "คลัทช์"
                ],
                avoid_items=[
                    "กางเกงยีนส์ขาด", "รองเท้าแตะ",
                    "เสื้อยืด", "ชุดกีฬา", "กระเป๋าเป้"
                ],
                color_suggestions=[
                    "สีดำ", "สีกรมท่า", "สีเบอร์กันดี",
                    "สีเขียวเข้ม", "สีน้ำตาล"
                ],
                styling_tips=[
                    "ดูดีในแสงไฟร้านอาหาร",
                    "เลือกผ้าที่ไม่ยับง่ายขณะนั่ง",
                    "รองเท้าควรใส่สบายเพราะต้องนั่งนาน",
                    "อย่าใส่เครื่องประดับที่ส่งเสียง",
                    "ระวังเรื่องกลิ่นน้ำหอมแรงเกินไป"
                ],
                cultural_considerations="แต่งกายให้เหมาะกับระดับของร้าน",
                weather_notes="ร้านแอร์เย็นควรมีผ้าคลุม",
                accessories_guide="เครื่องประดับเงิน/ทอง, นาฬิกาหรู, คลัทช์",
                budget_ranges={
                    "low": (2000, 5000),
                    "mid": (5000, 12000),
                    "high": (12000, 30000)
                }
            ),

            OccasionType.CAFE: OccasionGuideline(
                occasion_type=OccasionType.CAFE,
                thai_name="คาเฟ่",
                style_description="Trendy, Instagram-worthy, relaxed",
                dress_code="Casual chic",
                key_pieces=[
                    "เดรสลูกไม้", "เสื้อครอป", "กางเกงยีนส์",
                    "กระโปรงพลีท", "รองเท้าผ้าใบ", "กระเป๋า tote"
                ],
                avoid_items=[
                    "ชุดเป็นทางการเกิน", "ชุดกีฬา",
                    "ชุดที่ดูไม่ได้ใส่ใจ"
                ],
                color_suggestions=[
                    "สีพาสเทล", "สีขาวครีม", "สีเบจ",
                    "ลายตาราง", "ลายดอกไม้"
                ],
                styling_tips=[
                    "แต่งตัวให้ถ่ายรูปสวย",
                    "เลือกชุดที่เข้ากับบรรยากาศคาเฟ่",
                    "อย่าลืมแว่นกันแดดถ้านั่งริมหน้าต่าง",
                    "กระเป๋าควรวางบนโต๊ะได้สวย",
                    "ใส่ชุดที่นั่งสบายๆ ได้นาน"
                ],
                cultural_considerations="ความสบายคือหลัก",
                weather_notes="เตรียมเสื้อคลุมสำหรับนั่งในแอร์",
                accessories_guide="แว่นกันแดด, หมวก, ต่างหูแฟชั่น",
                budget_ranges={
                    "low": (1000, 2500),
                    "mid": (2500, 6000),
                    "high": (6000, 15000)
                }
            ),

            OccasionType.PARTY: OccasionGuideline(
                occasion_type=OccasionType.PARTY,
                thai_name="ปาร์ตี้",
                style_description="Fun, statement-making, event-appropriate",
                dress_code="Festive and party-ready",
                key_pieces=[
                    "ชุดเดรสสั้น", "จั๊มสูท", "ชุดเซ็ต",
                    "รองเท้าส้นสูง", "คลัทช์ระยิบระยับ"
                ],
                avoid_items=[
                    "ชุดจืดเกินไป", "รองเท้าที่เต้นไม่ได้",
                    "กระเป๋าใหญ่เทอะทะ"
                ],
                color_suggestions=[
                    "สีเมทัลลิค", "สีดำ", "สีแดง",
                    "sequin", "ผ้ามันวาว"
                ],
                styling_tips=[
                    "ใส่ชุดที่เต้นได้สบาย",
                    "เลือกรองเท้าที่เดินและเต้นได้",
                    "แต่งหน้าติดทนและกันน้ำ",
                    "คลัทช์ใบเล็กใส่ของจำเป็น",
                    "ใส่ชุดที่กล้าแสดงออก"
                ],
                cultural_considerations="ดูธีมปาร์ตี้ก่อนแต่งตัว",
                weather_notes="ระวังแอร์เย็นในสถานที่จัดงาน",
                accessories_guide="เครื่องประดับ statement, คลัทช์ระยิบระยับ",
                budget_ranges={
                    "low": (1500, 4000),
                    "mid": (4000, 10000),
                    "high": (10000, 25000)
                }
            )
        }

        return guidelines

    def _initialize_seasonal_adjustments(self) -> Dict[str, List[str]]:
        """Initialize seasonal/weather adjustments for Thailand"""
        return {
            "hot_season": [  # March-May
                "เลือกผ้าบางเบา ระบายอากาศดี",
                "สีอ่อนสะท้อนแสงแดด",
                "ผ้าฝ้าย ลินิน รายอน",
                "หลีกเลี่ยงสีดำในกลางแจ้ง",
                "เตรียมร่มและแว่นกันแดด"
            ],
            "rainy_season": [  # June-October
                "เลือกผ้าที่แห้งเร็ว",
                "รองเท้ากันน้ำหรือแห้งเร็ว",
                "หลีกเลี่ยงผ้าซูเอต หนังกลับ",
                "มีร่มหรือเสื้อกันฝนสไตล์ดี",
                "เลือกกระเป๋ากันน้ำ"
            ],
            "cool_season": [  # November-February
                "ใส่เสื้อแขนยาวได้สบาย",
                "เตรียมคาร์ดิแกนหรือแจ็คเก็ต",
                "ใส่บูทหรือรองเท้าหุ้มส้นได้",
                "ผ้าหนาขึ้นแต่ไม่หนามาก",
                "โทนสีเข้มหรืออบอุ่น"
            ]
        }

    def get_occasion_guide(self, occasion: OccasionType) -> OccasionGuideline:
        """Get detailed guidelines for specific occasion"""
        return self.guidelines.get(occasion)

    def get_essential_items(self, occasion: OccasionType, budget: str = "mid") -> List[Dict]:
        """Get essential items for an occasion within budget"""
        guide = self.guidelines.get(occasion)
        if not guide:
            return []

        budget_range = guide.budget_ranges.get(budget, (3000, 8000))

        essentials = []
        for item in guide.key_pieces[:5]:  # Top 5 essential pieces
            essentials.append({
                "item": item,
                "budget_range": budget_range,
                "priority": "high" if guide.key_pieces.index(item) < 3 else "medium"
            })

        return essentials

    def get_styling_advice(self, occasion: OccasionType, specific_need: str = None) -> Dict[str, any]:
        """Get comprehensive styling advice for an occasion"""
        guide = self.guidelines.get(occasion)
        if not guide:
            return {}

        advice = {
            "occasion": occasion.value,
            "thai_name": guide.thai_name,
            "overall_style": guide.style_description,
            "dress_code": guide.dress_code,
            "do": {
                "wear": guide.key_pieces[:3],
                "colors": guide.color_suggestions[:3],
                "accessories": guide.accessories_guide
            },
            "dont": {
                "avoid": guide.avoid_items[:3],
                "why": "ไม่เหมาะสมกับโอกาสและบรรยากาศ"
            },
            "pro_tips": guide.styling_tips[:3],
            "cultural_note": guide.cultural_considerations,
            "weather_tip": guide.weather_notes
        }

        # Add specific advice based on need
        if specific_need:
            if "budget" in specific_need.lower():
                advice["budget_tip"] = "เน้นซื้อชิ้นที่ใช้ได้หลายโอกาส Mix&Match ได้"
            elif "first" in specific_need.lower():
                advice["first_timer_tip"] = "เลือกชุดที่ใส่แล้วมั่นใจ อย่าลองอะไรใหม่เกินไป"
            elif "comfort" in specific_need.lower():
                advice["comfort_tip"] = "เน้นผ้าที่ยืดหยุ่น รองเท้าใส่สบาย"

        return advice

    def match_occasion_from_text(self, text: str) -> Optional[OccasionType]:
        """Match occasion type from user's text"""
        text_lower = text.lower()

        occasion_keywords = {
            OccasionType.WEDDING: ["งานแต่ง", "แต่งงาน", "เจ้าสาว", "เจ้าบ่าว", "wedding"],
            OccasionType.WORK: ["ทำงาน", "ออฟฟิศ", "ประชุม", "work", "office", "meeting"],
            OccasionType.CHILL_DAY: ["พักผ่อน", "วันหยุด", "chill", "relax", "สบายๆ"],
            OccasionType.SPORT: ["ออกกำลัง", "วิ่ง", "โยคะ", "ฟิตเนส", "gym", "sport"],
            OccasionType.TRAVEL: ["เที่ยว", "ทริป", "travel", "vacation", "holiday"],
            OccasionType.DATE: ["เดท", "นัด", "date", "romantic"],
            OccasionType.DINNER: ["ดินเนอร์", "อาหารค่ำ", "dinner", "ร้านอาหาร"],
            OccasionType.CAFE: ["คาเฟ่", "กาแฟ", "cafe", "coffee", "ชา"],
            OccasionType.PARTY: ["ปาร์ตี้", "派对", "party", "celebrate", "เลี้ยง"]
        }

        for occasion, keywords in occasion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return occasion

        return None

    def get_occasion_combinations(self, occasions: List[OccasionType]) -> Dict[str, any]:
        """Get advice for combining multiple occasions (e.g., work then dinner)"""
        if len(occasions) < 2:
            return {}

        combination_advice = {
            "occasions": [occ.value for occ in occasions],
            "versatile_pieces": [],
            "transition_tips": [],
            "must_have_items": []
        }

        # Find common suitable items
        common_pieces = set(self.guidelines[occasions[0]].key_pieces)
        for occasion in occasions[1:]:
            common_pieces &= set(self.guidelines[occasion].key_pieces)

        combination_advice["versatile_pieces"] = list(common_pieces)

        # Add transition tips
        if OccasionType.WORK in occasions and OccasionType.DINNER in occasions:
            combination_advice["transition_tips"].append(
                "เปลี่ยนรองเท้าและเพิ่มเครื่องประดับสำหรับดินเนอร์"
            )
            combination_advice["must_have_items"].append("คลัทช์ใบเล็กใส่ในกระเป๋าทำงาน")

        if OccasionType.WORK in occasions and OccasionType.DATE in occasions:
            combination_advice["transition_tips"].append(
                "เติมลิปสติกสีสด และถอดเบลเซอร์ออกให้ดูรีแล็กซ์"
            )

        return combination_advice


class StyleCalculator:
    """Calculate style recommendations based on multiple factors"""

    @staticmethod
    def calculate_formality_level(occasion: OccasionType) -> int:
        """Calculate formality level (1-10) for an occasion"""
        formality_scores = {
            OccasionType.WEDDING: 8,
            OccasionType.WORK: 7,
            OccasionType.DINNER: 7,
            OccasionType.DATE: 5,
            OccasionType.PARTY: 6,
            OccasionType.CAFE: 3,
            OccasionType.TRAVEL: 2,
            OccasionType.CHILL_DAY: 1,
            OccasionType.SPORT: 1
        }
        return formality_scores.get(occasion, 5)

    @staticmethod
    def calculate_comfort_priority(occasion: OccasionType) -> int:
        """Calculate comfort priority (1-10) for an occasion"""
        comfort_scores = {
            OccasionType.SPORT: 10,
            OccasionType.TRAVEL: 9,
            OccasionType.CHILL_DAY: 9,
            OccasionType.CAFE: 7,
            OccasionType.WORK: 5,
            OccasionType.DATE: 5,
            OccasionType.DINNER: 4,
            OccasionType.PARTY: 4,
            OccasionType.WEDDING: 3
        }
        return comfort_scores.get(occasion, 5)

    @staticmethod
    def suggest_outfit_complexity(occasion: OccasionType, experience_level: str) -> Dict:
        """Suggest outfit complexity based on occasion and user experience"""
        formality = StyleCalculator.calculate_formality_level(occasion)

        if experience_level == "beginner":
            if formality >= 7:
                return {
                    "pieces": 3,
                    "suggestion": "ใส่ชุดเดรสสำเร็จรูป หรือชุดเซ็ต ง่ายไม่ต้องคิดมาก"
                }
            else:
                return {
                    "pieces": 2,
                    "suggestion": "เลือกแค่เสื้อและกางเกงที่เข้ากัน simple is best"
                }
        else:  # experienced
            return {
                "pieces": 4,
                "suggestion": "mix & match หลายชิ้นเพื่อความน่าสนใจ"
            }


# Example usage
if __name__ == "__main__":
    expertise = OccasionExpertise()

    # Get wedding occasion guide
    wedding_guide = expertise.get_occasion_guide(OccasionType.WEDDING)
    print(f"Wedding Guide: {wedding_guide.thai_name}")
    print(f"Style: {wedding_guide.style_description}")
    print(f"Key pieces: {wedding_guide.key_pieces[:3]}")
    print()

    # Get styling advice for a date
    date_advice = expertise.get_styling_advice(OccasionType.DATE, "first date")
    print(f"Date Advice: {date_advice['thai_name']}")
    print(f"Do: {date_advice['do']}")
    print(f"Pro tips: {date_advice['pro_tips']}")
    print()

    # Match occasion from text
    user_text = "อยากได้ชุดไปงานแต่งเพื่อนค่ะ"
    matched_occasion = expertise.match_occasion_from_text(user_text)
    print(f"Matched occasion: {matched_occasion}")

    # Calculate style metrics
    calculator = StyleCalculator()
    formality = calculator.calculate_formality_level(OccasionType.WEDDING)
    comfort = calculator.calculate_comfort_priority(OccasionType.WEDDING)
    print(f"Wedding - Formality: {formality}/10, Comfort: {comfort}/10")