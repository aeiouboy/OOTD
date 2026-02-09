#!/bin/bash
# Quick progress checker for Session 1 scraping

python3 << 'EOF'
import json
from datetime import datetime

with open('scraping_progress.json') as f:
    progress = json.load(f)

completed = sorted(progress.get('completed_indices', []))
failed = progress.get('failed_indices', [])
session1_completed = [i for i in completed if i < 250]
total = progress.get('total_products', 1247)

print('\n' + '='*60)
print('🔍 SCRAPING PROGRESS REPORT')
print('='*60)
print(f'\n📈 OVERALL STATUS:')
print(f'   Total products: {total}')
print(f'   Completed: {len(completed)} ({len(completed)/total*100:.2f}%)')
print(f'   Failed: {len(failed)}')
print(f'   Remaining: {total - len(completed)}')

print(f'\n🎯 SESSION 1 (Products 0-249):')
print(f'   Completed: {len(session1_completed)}/250 ({len(session1_completed)/250*100:.1f}%)')
print(f'   Remaining: {250 - len(session1_completed)}')

print(f'\n⏱️  LAST UPDATED:')
print(f'   {progress.get("last_updated", "unknown")}')

if len(completed) >= 10:
    print(f'\n📋 LATEST COMPLETED:')
    print(f'   {completed[-10:]}')

print('='*60 + '\n')
EOF
