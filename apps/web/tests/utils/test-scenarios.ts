/**
 * Test Scenario Management System
 * Loads and manages test scenarios for LLM model testing
 */

import { TestScenario } from './types/test-types';

// Predefined test scenarios for 9 occasions
const OCCASIONS = [
  { id: 'work', name: 'Work', nameThai: 'ไปทำงาน' },
  { id: 'chill', name: 'Chill Day', nameThai: 'วันชิลๆ' },
  { id: 'wedding', name: 'Wedding', nameThai: 'งานแต่ง' },
  { id: 'sport', name: 'Sport', nameThai: 'เล่นกีฬา' },
  { id: 'travel', name: 'Travel', nameThai: 'เดินทาง' },
  { id: 'date', name: 'Date', nameThai: 'เดท' },
  { id: 'dinner', name: 'Dinner', nameThai: 'ดินเนอร์' },
  { id: 'cafe', name: 'Café', nameThai: 'ไปคาเฟ่' },
  { id: 'party', name: 'Party', nameThai: 'งานปาร์ตี้' }
];

// Sample queries for each occasion
const SAMPLE_QUERIES: Record<string, string[]> = {
  work: [
    'หาชุดไปออฟฟิศหน่อยค่ะ แบบสมาร์ทแคชชวลที่ดูดีแต่สบายๆ',
    'ต้องไปประชุมใหญ่ค่ะ อยากได้ลุคที่ดูมั่นใจและโปรเฟสชั่นนัล งบประมาณประมาณ 8,000 บาท',
    'ออฟฟิศเราเป็นแนวครีเอทีฟค่ะ อยากได้ชุดที่ดูมีสไตล์แต่ยังโปรเฟสชั่นนัล'
  ],
  chill: [
    'วันนี้อยากชิลๆ ค่ะ หาชุดเที่ยวสบายๆ แต่ดูดีหน่อย',
    'สุดสัปดาห์จะไปช้อปปิ้งกับเพื่อนค่ะ อยากได้ลุคสบายแต่เท่',
    'จะไปเดินเล่นสวนสาธารณะค่ะ อยากได้ชุดที่สบายและเคลื่อนไหวง่าย'
  ],
  wedding: [
    'จะไปงานแต่งเพื่อนค่ะ งานเป็นแบบ semi-formal อยากได้ชุดที่ดูดีแต่ไม่เกินเจ้าบ่าวเจ้าสาว',
    'ไปงานแต่งกลางวันที่โรงแรมหรูค่ะ อยากได้ชุดที่เป็นทางการแต่ไม่แมทช์มากเกินไป',
    'งานแต่งตอนเย็นที่ริมทะเล อยากได้ชุดที่โรแมนติกและเหมาะกับบรรยากาศชายทะเล'
  ],
  sport: [
    'จะไปออกกำลังกายที่ฟิตเนสค่ะ อยากได้ชุดที่ใส่สบายและดูดี',
    'วันนี้จะไปวิ่งเช้าที่สวนค่ะ อยากได้ชุดกีฬาที่ระบายอากาศดี',
    'จะไปเล่นโยคะค่ะ หาชุดที่ยืดหยุ่นและเคลื่อนไหวสะดวก'
  ],
  travel: [
    'สัปดาห์หน้าจะไปเที่ยวญี่ปุ่นตอนหน้าหนาวค่ะ อยากได้ชุดที่อุ่นแต่ดูดี',
    'จะไปเที่ยวเชียงใหม่ค่ะ อยากได้ชุดสบายๆ ที่เหมาะกับอากาศเย็น',
    'จะไปทะเลภูเก็ตค่ะ หาชุดที่เหมาะกับอากาศร้อนและไปเที่ยวทะเลได้'
  ],
  date: [
    'จะไปเดทมื้อค่ำที่ร้านอาหารดีๆ ค่ะ อยากได้ลุคที่ดูดีและดึงดูดสายตา',
    'เดทแรกจะไปดูหนังกับกินข้าวค่ะ อยากได้ชุดที่ดูน่ารักแต่ไม่เคร่ง',
    'วันนี้เดทกลางวันที่สวนค่ะ หาชุดที่สบายแต่ดูมีเสน่ห์'
  ],
  dinner: [
    'คืนนี้จะไปดินเนอร์ที่ร้านอาหารฝรั่งเศสค่ะ อยากได้ชุดที่หรูหราเหมาะกับบรรยากาศ',
    'จะไปงานเลี้ยงดินเนอร์ที่บริษัทค่ะ ดูมืออาชีพแต่สวยงาม',
    'ดินเนอร์กับครอบครัวที่ร้านอาหารดีๆ ค่ะ อยากได้ชุดที่ดูดีแต่สบายๆ'
  ],
  cafe: [
    'จะไปนั่งคาเฟ่ทำงานค่ะ หาชุดที่ดูดีแต่สบาย',
    'ช่วงบ่ายจะไปคาเฟ่กับเพื่อนค่ะ อยากได้ลุคที่ชิคและเหมาะกับ Instagram',
    'จะไปคาเฟ่หนังสือค่ะ หาชุดที่สบายและเหมาะกับบรรยากาศสงบๆ'
  ],
  party: [
    'คืนนี้จะไปงานปาร์ตี้วันเกิดเพื่อนค่ะ อยากได้ชุดที่ดูสนุกสนานและโดดเด่น',
    'จะไปงานเลี้ยงปีใหม่ที่โรงแรมค่ะ อยากได้ชุดที่ดูหรูหราและเฉิดฉาย',
    'งานคอนเสิร์ตค่ะ อยากได้ชุดที่เท่และสบาย'
  ]
};

// Reference outputs are not available in client-side context
// For full reference outputs, use server-side API or load from static files

/**
 * Get all predefined test scenarios for the 9 occasions
 */
export function getTestScenarios(): TestScenario[] {
  const scenarios: TestScenario[] = [];

  for (const occasion of OCCASIONS) {
    const queries = SAMPLE_QUERIES[occasion.id] || [];

    queries.forEach((query, index) => {
      scenarios.push({
        id: `${occasion.id}-${index + 1}`,
        occasion: occasion.name,
        query: query,
        expectedCategory: 'CLOTHS',
        expectedTemplate: 'TEMPLATE A',
        referenceOutput: '' // Reference outputs not available client-side
      });
    });
  }

  return scenarios;
}

/**
 * Get test scenarios for a specific occasion
 */
export function getScenariosByOccasion(occasionId: string): TestScenario[] {
  const allScenarios = getTestScenarios();
  return allScenarios.filter(s => s.id.startsWith(occasionId));
}

/**
 * Get a single test scenario by ID
 */
export function getScenarioById(scenarioId: string): TestScenario | null {
  const allScenarios = getTestScenarios();
  return allScenarios.find(s => s.id === scenarioId) || null;
}

/**
 * Create a custom test scenario from user input
 */
export function createCustomScenario(
  query: string,
  occasion?: string,
  expectedCategory: 'CLOTHS' | 'OTHER' = 'CLOTHS'
): TestScenario {
  return {
    id: `custom-${Date.now()}`,
    occasion: occasion || 'Custom',
    query: query,
    expectedCategory: expectedCategory,
    expectedTemplate: expectedCategory === 'CLOTHS' ? 'TEMPLATE A' : 'TEMPLATE B',
    referenceOutput: '' // No reference output for custom scenarios
  };
}

/**
 * Get list of all occasions
 */
export function getOccasionsList() {
  return OCCASIONS.map(o => ({
    id: o.id,
    name: o.name,
    nameThai: o.nameThai
  }));
}

/**
 * Validate a query to determine if it's CLOTHS or OTHER category
 */
export function detectQueryCategory(query: string): 'CLOTHS' | 'OTHER' {
  const clothsKeywords = [
    'ชุด', 'เสื้อ', 'กางเกง', 'outfit', 'dress', 'shirt', 'pants',
    'ไปงาน', 'ไปเที่ยว', 'ไปออฟฟิศ', 'ไปเดท', 'work', 'travel', 'date',
    'แต่งตัว', 'สวมใส่', 'ลุค', 'look', 'style'
  ];

  const otherKeywords = [
    'รองเท้า', 'กระเป๋า', 'เครื่องสำอาง', 'ดูแล', 'เก็บ', 'ทำความสะอาด',
    'shoes', 'bag', 'cosmetic', 'care', 'clean', 'maintain',
    'วิธี', 'tips', 'trick', 'how to'
  ];

  const queryLower = query.toLowerCase();

  const hasOtherKeyword = otherKeywords.some(keyword =>
    queryLower.includes(keyword.toLowerCase())
  );

  if (hasOtherKeyword) {
    return 'OTHER';
  }

  const hasClothsKeyword = clothsKeywords.some(keyword =>
    queryLower.includes(keyword.toLowerCase())
  );

  if (hasClothsKeyword) {
    return 'CLOTHS';
  }

  // Default to CLOTHS if unclear
  return 'CLOTHS';
}
