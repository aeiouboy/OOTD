# Social Proof Signals
## Popularity, Influencer & Trend Indicators for Fashion AI

**Status:** Complete
**Version:** 1.0
**Last Updated:** February 2026
**Priority:** MEDIUM-HIGH for Enhanced Recommendations
**Language:** Thai & English

---

## Overview

Social proof influences purchasing decisions significantly in Thai fashion culture. This document defines the signals that indicate item popularity, trend status, and social validation—enabling the AI to leverage these in recommendations.

**Key Insight:** Thai consumers are highly influenced by:
1. Celebrity/influencer endorsement
2. Peer validation (what others are wearing)
3. Trend participation (not being left behind)
4. Review feedback (especially from similar users)

---

## 1. Popularity Metrics

### 1.1 Sales Velocity Indicators

| Signal | Meaning | Display |
|--------|---------|---------|
| **Best Seller** | Top 10% in category sales | "ขายดีมาก!" |
| **Trending** | Sales increasing >50% week-over-week | "กำลังมาแรง!" |
| **Fast Moving** | High turnover rate | "หมดเร็ว!" |
| **Consistent Seller** | Steady sales over time | "ขายดีตลอด" |
| **New & Hot** | New arrival with strong start | "ใหม่และฮิต!" |

### 1.2 Popularity Score Calculation

```
Popularity Score (0-100) =
  (Sales Rank × 0.35) +
  (Sales Velocity × 0.25) +
  (View-to-Purchase Rate × 0.20) +
  (Review Score × 0.10) +
  (Social Mentions × 0.10)
```

### 1.3 Popularity Tiers

| Score | Tier | Label | Usage |
|-------|------|-------|-------|
| 90-100 | Viral | "ปังมาก!" | Highlight prominently |
| 75-89 | Hot | "ฮิตมาก" | Recommend actively |
| 60-74 | Popular | "นิยม" | Include in options |
| 40-59 | Moderate | - | Normal treatment |
| < 40 | Niche | - | Only if matches user |

### 1.4 Scarcity Signals

| Signal | Threshold | Message |
|--------|-----------|---------|
| **Almost Gone** | < 5 units | "เหลือไม่กี่ชิ้นแล้ว!" |
| **Low Stock** | < 20 units | "ของใกล้หมด" |
| **Size Running Out** | < 3 in size | "ไซส์ M เหลือ 2 ตัว!" |
| **Last One** | 1 unit | "ชิ้นสุดท้าย!" |

---

## 2. Influencer & Celebrity Associations

### 2.1 Thai Celebrity Categories

| Category | Example Names | Influence Type | Audience |
|----------|---------------|----------------|----------|
| **Actresses** | ใหม่ ดาวิกา, ญาญ่า อุรัสยา | Aspirational luxury | Women 20-40 |
| **Actors** | มาริโอ้, ณเดชน์ | Boyfriend look | Women 20-35 |
| **Singers/Idols** | BNK48, 4th Impact | Young trendy | Teens, 20s |
| **Models** | ซิน ศิตา | High fashion | Fashion-forward |
| **Influencers** | Various | Accessible trends | Varies |
| **TV Hosts** | Various | Mainstream appeal | Broad |

### 2.2 K-Pop Influence Categories

| Category | Examples | Style Influence | Thai Following |
|----------|----------|-----------------|----------------|
| **Girl Groups** | BLACKPINK, aespa, NewJeans | Trendy feminine | Massive |
| **Boy Groups** | BTS, Stray Kids, SEVENTEEN | Boyfriend/oppa look | Large |
| **Solo Artists** | IU, Jisoo, V | Individual style | Very high |
| **K-Drama Stars** | Various | Drama-inspired looks | High |

### 2.3 Influence Strength Scoring

```
Influence Score =
  (Follower Count × 0.20) +
  (Engagement Rate × 0.30) +
  (Fashion Relevance × 0.25) +
  (Thai Market Reach × 0.25)
```

### 2.4 "As Seen On" Data Structure

```json
{
  "celebrity_associations": [
    {
      "celebrity": "ใหม่ ดาวิกา",
      "type": "actress",
      "context": "event",
      "date": "2025-11-15",
      "verified": true,
      "source": "instagram",
      "engagement": "high"
    }
  ],
  "influencer_features": [
    {
      "influencer": "@fashionista_th",
      "followers": 500000,
      "platform": "instagram",
      "content_type": "outfit_post",
      "engagement_rate": 4.5
    }
  ]
}
```

---

## 3. Hashtag Intelligence

### 3.1 Thai Fashion Hashtags

| Hashtag | Usage | Meaning |
|---------|-------|---------|
| **#OOTD** | Daily outfit | Universal outfit tag |
| **#แฟชั่น** | General fashion | Thai fashion content |
| **#ลุคประจำวัน** | Daily look | Thai OOTD equivalent |
| **#แต่งตัว** | Dressing/styling | Style tips |
| **#เสื้อผ้า** | Clothing | Product-focused |
| **#สไตล์** | Style | Style inspiration |
| **#เทรนด์** | Trends | Trending items |
| **#รีวิว** | Review | Product reviews |
| **#ชุดทำงาน** | Work outfit | Office wear |
| **#ชุดเที่ยว** | Casual outfit | Going out |
| **#ชุดออกเดท** | Date outfit | Romantic looks |

### 3.2 Trending Hashtag Patterns

| Season/Event | Trending Hashtags |
|--------------|-------------------|
| Summer | #ซัมเมอร์, #ลุคหน้าร้อน, #เสื้อผ้าหน้าร้อน |
| Songkran | #สงกรานต์, #ชุดสงกรานต์, #ลุคสงกรานต์ |
| Valentine's | #วาเลนไทน์, #ชุดเดท, #ลุครักๆ |
| CNY | #ตรุษจีน, #ชุดแดง, #ลุคตรุษจีน |
| Year End | #ปีใหม่, #ชุดปาร์ตี้, #กลิตเตอร์ |

### 3.3 Platform-Specific Trends

| Platform | Style | Popular Content | Audience |
|----------|-------|-----------------|----------|
| **Instagram** | Curated, polished | OOTD, flat lays | 20-35 |
| **TikTok** | Raw, authentic | Hauls, try-ons, transitions | 15-25 |
| **Facebook** | Mainstream | Reviews, discussions | 25-45 |
| **Twitter/X** | Quick shares | Trend commentary | 20-35 |
| **Pinterest** | Inspiration | Mood boards, saved looks | 20-40 |

### 3.4 Hashtag Tracking Structure

```json
{
  "hashtag_signals": {
    "product_hashtags": ["#jaspal", "#jaspalthailand"],
    "style_hashtags": ["#minimalist", "#cleangirlاesthetic"],
    "trend_hashtags": ["#2026trends", "#summervibes"],
    "hashtag_velocity": {
      "#cleangirlاesthetic": {
        "growth_rate": 45,
        "trend_status": "rising"
      }
    }
  }
}
```

---

## 4. Review Sentiment Categories

### 4.1 Review Dimensions

| Dimension | Positive Signals | Negative Signals |
|-----------|------------------|------------------|
| **Fit** | "พอดี", "ใส่แล้วสวย" | "คับ", "หลวม", "ไม่ตรงไซส์" |
| **Quality** | "คุ้มค่า", "เนื้อผ้าดี" | "บาง", "ขาดง่าย", "ซีดเร็ว" |
| **Color** | "สีสวย", "ตรงปก" | "สีไม่ตรง", "ซีด" |
| **Value** | "คุ้มราคา", "ถูกและดี" | "แพงเกิน", "ไม่คุ้ม" |
| **Style** | "เก๋", "ปัง", "สวย" | "เชย", "ธรรมดา" |

### 4.2 Review Sentiment Score

```
Sentiment Score (-100 to +100) =
  (Positive Keywords × +10) +
  (Negative Keywords × -10) +
  (Star Rating Weighted)

Interpretation:
+70 to +100: Excellent reviews
+40 to +69: Good reviews
+10 to +39: Mixed reviews
-10 to +9: Neutral
-40 to -9: Concerning
< -40: Poor reviews
```

### 4.3 User Similarity Weighting

```
Reviews from similar users weighted higher:
- Same body type: 1.5x weight
- Same age group: 1.3x weight
- Same style preference: 1.4x weight
- Same occasion use: 1.2x weight
```

### 4.4 Review Summary Structure

```json
{
  "review_summary": {
    "total_reviews": 156,
    "average_rating": 4.3,
    "sentiment_score": 72,
    "fit_feedback": {
      "true_to_size": 75,
      "runs_small": 15,
      "runs_large": 10
    },
    "quality_feedback": {
      "positive": 82,
      "neutral": 12,
      "negative": 6
    },
    "top_positive": ["ใส่แล้วสวย", "คุ้มราคา", "เนื้อผ้าดี"],
    "top_concerns": ["ขนาดเล็กกว่าปกติ"],
    "recommend_rate": 87
  }
}
```

---

## 5. Trend Status Classification

### 5.1 Trend Lifecycle Stages

| Stage | Description | Recommendation Strategy |
|-------|-------------|------------------------|
| **Emerging** | Early adopters only | For trend-setters |
| **Rising** | Growing rapidly | Recommend to fashion-forward |
| **Peak** | Maximum popularity | Safe to recommend widely |
| **Mainstream** | Everyone wearing | Very safe choice |
| **Declining** | Fading out | Discount/clear |
| **Classic** | Timeless | Always safe |

### 5.2 Trend Score Calculation

```
Trend Score (0-100) =
  (Social Media Mentions × 0.25) +
  (Search Volume × 0.20) +
  (Sales Trajectory × 0.25) +
  (Influencer Adoption × 0.15) +
  (Runway/Magazine Presence × 0.15)
```

### 5.3 Trend Confidence Levels

| Confidence | Score Range | Message |
|------------|-------------|---------|
| Very High | 85-100 | "เทรนด์ตัวท็อปเลยค่ะ!" |
| High | 70-84 | "กำลังฮิตมากค่ะ" |
| Medium | 55-69 | "น่าสนใจ กำลังมา" |
| Low | 40-54 | "เริ่มเห็นบ้าง" |
| Uncertain | < 40 | Don't mention trend |

---

## 6. Social Proof in Thai Context

### 6.1 Thai Social Proof Preferences

| Signal | Thai Preference | Reason |
|--------|----------------|--------|
| **Celebrity Use** | Very high | Thai star culture strong |
| **Friend Recommendations** | Very high | Trust personal network |
| **Influencer Reviews** | High | Authentic opinions valued |
| **Sales Numbers** | Medium-high | "If many buy, must be good" |
| **Expert Opinion** | Medium | Less impactful than peers |
| **Brand Heritage** | Medium | Growing importance |

### 6.2 Social Proof Messaging (Thai)

**Celebrity Association:**
```
"ใหม่ ดาวิกา ใส่แบรนด์นี้บ่อยมากเลยค่ะ ✨"
"ลุคนี้คล้ายๆ กับที่ญาญ่าใส่ในละครค่ะ"
```

**Popularity:**
```
"ตัวนี้ขายดีมาก คนซื้อเยอะเลยค่ะ 🔥"
"ฮิตมากช่วงนี้ หลายคนถามถึง"
```

**Review-Based:**
```
"รีวิวดีมากค่ะ คนใส่บอกว่าพอดีตัว 👍"
"คนซื้อ 87% บอกว่าแนะนำให้เพื่อน"
```

**Scarcity:**
```
"เหลือไม่กี่ชิ้นแล้วค่ะ หมดเร็วมาก!"
"ไซส์นี้ขายดี รีบหน่อยนะคะ"
```

---

## 7. Implementation for AI

### 7.1 Social Proof Product Attributes

```json
{
  "social_proof": {
    "popularity_score": 82,
    "popularity_tier": "hot",
    "trend_status": "peak",
    "trend_confidence": 78,
    "celebrity_associations": ["ใหม่ ดาวิกา"],
    "influencer_features": 12,
    "review_sentiment": 72,
    "review_count": 156,
    "recommend_rate": 87,
    "scarcity_signal": null,
    "hashtag_momentum": ["#cleangirlاesthetic"]
  }
}
```

### 7.2 Social Proof Display Priority

```
Priority Order for Displaying Social Proof:
1. Celebrity association (if relevant to user)
2. High popularity + good reviews
3. Trend status (if user is trend-conscious)
4. Scarcity (if stock is low)
5. Review highlights (for quality-focused users)
```

### 7.3 User Segment Social Proof Preferences

| User Segment | Primary Signal | Secondary Signal |
|--------------|----------------|------------------|
| Trend-Seeker | Trend status | Influencer adoption |
| Quality-First | Review sentiment | Recommend rate |
| Budget-Conscious | Value reviews | Sales (popular = proven) |
| Fashion-Forward | Celebrity/influencer | Emerging trends |
| Conservative | Popularity | Good reviews |

### 7.4 Social Proof Response Integration

```python
def add_social_proof(product, user_profile):
    """
    Add appropriate social proof to recommendation

    Select based on:
    1. User segment preferences
    2. Available social proof for product
    3. Relevance to occasion
    """

    proof_priority = get_user_proof_preference(user_profile)

    for signal in proof_priority:
        if product.has_strong_signal(signal):
            return format_social_proof(product, signal)

    return None  # No relevant social proof
```

---

## 8. Hashtag-Based Trend Detection

### 8.1 Monitoring Framework

```json
{
  "trend_monitoring": {
    "platforms": ["instagram", "tiktok", "twitter"],
    "update_frequency": "daily",
    "metrics_tracked": [
      "hashtag_volume",
      "hashtag_growth_rate",
      "engagement_rate",
      "influencer_adoption"
    ],
    "alert_thresholds": {
      "emerging_trend": "growth > 30% week-over-week",
      "viral_moment": "volume > 10x baseline",
      "declining_trend": "growth < -20% week-over-week"
    }
  }
}
```

### 8.2 Trend-to-Product Mapping

```
Trending Hashtag → Associated Products

#cleangirlاesthetic →
  - Minimal jewelry
  - Neutral tones
  - Sleek hair accessories
  - Natural makeup products

#oldmoney →
  - Quality basics
  - Neutral colors
  - Classic cuts
  - Understated luxury

#dopaminedressing →
  - Bright colors
  - Bold patterns
  - Statement pieces
  - Fun accessories
```

---

## 9. Cross-References

### Related Knowledge Base Files
- `/advanced/09_social_media_trends.md` - Platform trends
- `/advanced/12_thai_micro_seasons.md` - Seasonal trending
- `/implementation/14_outfit_generator_algorithm.md` - Algorithm integration
- `/foundation/05_brands_shopping.md` - Brand intelligence

---

**Source:** OOTDay Knowledge Base Expansion
**Created:** February 2026
**Version:** 1.0
**Status:** Complete - Ready for Implementation
