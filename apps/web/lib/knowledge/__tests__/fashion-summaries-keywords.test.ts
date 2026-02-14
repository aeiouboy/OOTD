import { describe, it, expect } from 'vitest'
import { detectKnowledgeTopics } from '../fashion-summaries'

describe('detectKnowledgeTopics - expanded Thai keywords', () => {
  it('should detect casual/lifestyle Thai keywords', () => {
    expect(detectKnowledgeTopics('ชุดคาสชวล')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ไปคาเฟ่')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดออกเดท')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดสบายๆ ไปเที่ยว')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
  })

  it('should detect work/formal Thai keywords', () => {
    expect(detectKnowledgeTopics('ชุดไปสัมภาษณ์งาน')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดออฟฟิศ')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
  })

  it('should detect event Thai keywords', () => {
    expect(detectKnowledgeTopics('ชุดไปคอนเสิร์ต')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดปาร์ตี้')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดสงกรานต์')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
    expect(detectKnowledgeTopics('ชุดปีใหม่')).toEqual(expect.arrayContaining(['occasion', 'thai_culture']))
  })

  it('should detect expanded weather keywords', () => {
    const topics = detectKnowledgeTopics('วันนี้แดดจัด')
    expect(topics).toEqual(expect.arrayContaining(['fabric', 'weather']))
  })

  it('should detect expanded body type keywords', () => {
    expect(detectKnowledgeTopics('ชุดคนท้อง')).toEqual(expect.arrayContaining(['body_type']))
    expect(detectKnowledgeTopics('plus size fashion')).toEqual(expect.arrayContaining(['body_type']))
  })

  it('should return general for unrelated input', () => {
    expect(detectKnowledgeTopics('สวัสดีครับ')).toEqual(['general'])
    expect(detectKnowledgeTopics('hello')).toEqual(['general'])
  })
})
