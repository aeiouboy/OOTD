I want

1.ต้องการไฟล์ JSON ที่มีทุก sku ในเว็บ central โดยแบ่งตามหมวดหมู่ 
2.ชื่อแบรนด์, ชื่อสินค้า, ราคาสินค้าที่ลดแล้ว (unit price), ราคาสินค้าที่ยังไม่ได้ลด (original price), link หน้าสินค้า 
3.ใช้ crawlai ในการ scraping โดยสร้างเป็น sub-agent ชื่อ scraper เพื่อ scraping product โดยสามารถรันแบบหลาย workers ได้ (เริ่มต้นที่ 3 workers) และเก็บ sub-agent ไว้ที่ /Users/naruechon/Documents/Project/OOTDay/agents
4.เก็บระยะเวลาทั้งหมดที่ใช้ในการ scraping, รายละเอียดแบบสรุปของสิ่งที่ทำ ไว้ใน folder: /Users/naruechon/Documents/Project/OOTDay/log
5.scraping category ทุก category ทุก paginate และบันทึกเป็นไฟล์ 'all_categories.json' ที่ /Users/naruechon/Documents/Project/OOTDay/products หาก category ไหนที่สามารถ scraping sku ได้ครบตามจำนวนแล้ว ให้เช็คความถูกต้องของข้อมูลแล้ว save category นั้นแยกไว้ใน /Users/naruechon/Documents/Project/OOTDay/products 
6.หาก category ไหนที่ scraping ได้ไม่ครบทุก sku ต้องรอให้ได้ sku จนครบก่อนถึงค่อย save result ลง /Users/naruechon/Documents/Project/OOTDay/products (สามารถเพิ่มระยะเวลา timeout เพื่อรอข้อมูลที่ได้กลับมาจากการ scraping จนกว่าจะ scape ครบทุกรายการ) 
7.ไฟล์โค้ดที่ใช้ในการ run scraping ให้เขียนหรือแก้ไขไฟล์ที่ /Users/naruechon/Documents/Project/OOTDay/BEcode และ ระบุ version ของไฟล์นั้น เช่น 'central_scrape_1.py'
\
หมวดหมู่ทั้งหมดที่ต้องการ scrap ได้แก่ 
1.ผู้หญิง https://www.central.co.th/th/women/clothing
2.ผู้ชาย https://www.central.co.th/th/men/clothing
\
ตัวอย่าง product_url:
"https://www.central.co.th/th/expressionsevening-women-midi-dress-with-mock-neck-and-fishtail-skirt-grcds53725070552"
\
Output
สร้างไฟล์ '{category-name}.json' ใน folder /Users/naruechon/Documents/Project/OOTDay/products โดยหากมีการสร้างไฟล์ output หลายเวอร์ชั่นให้ระบุเลข version กำกับ เช่น {category-name}_1.json