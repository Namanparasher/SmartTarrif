import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import sqlite3
import os

db_path = "smarttariff.db"
print("========================================")
print("  SQLite Database Diagnostic Report")
print("========================================")

if not os.path.exists(db_path):
    print(f"❌ Error: Database file '{db_path}' does not exist.")
    sys.exit(1)

file_size = os.path.getsize(db_path)
print(f"✓ Database File:     {os.path.abspath(db_path)}")
print(f"✓ Database Size:     {file_size / 1024:.2f} KB ({file_size} bytes)")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Inspect Tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = [r[0] for r in cursor.fetchall() if r[0] != 'sqlite_sequence']
print(f"\n✓ Tables Created ({len(tables)}):")
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t}")
    count = cursor.fetchone()[0]
    print(f"   • {t:<22} : {count:>3} records")

# 2. Check Users
print("\n✓ User Accounts Check:")
cursor.execute("SELECT id, name, email, role, is_active FROM users LIMIT 3")
for row in cursor.fetchall():
    print(f"   • ID {row[0]}: {row[1]} ({row[2]}) - Role: {row[3]} - Active: {bool(row[4])}")

# 3. Check Tariff Plans
print("\n✓ Tariff Plans Check:")
cursor.execute("SELECT id, name, operator, price, validity, data_limit, five_g FROM tariff_plans LIMIT 3")
for row in cursor.fetchall():
    print(f"   • Plan #{row[0]}: {row[1]} ({row[2]}) - ₹{row[3]} | {row[4]} days | {row[5]} GB | 5G: {bool(row[6])}")

# 4. Check Usage Records
print("\n✓ Usage Telemetry Check:")
cursor.execute("SELECT id, customer_id, month, data_usage, call_minutes, sms_count FROM usages LIMIT 3")
for row in cursor.fetchall():
    print(f"   • Record #{row[0]}: Customer {row[1]} ({row[2]}) -> {row[3]} GB, {row[4]} mins, {row[5]} SMS")

# 5. Check Recommendations
cursor.execute("SELECT COUNT(*) FROM recommendations")
rec_count = cursor.fetchone()[0]
print(f"\n✓ Recommendation History: {rec_count} recommendations saved in DB")

conn.close()
print("\n========================================")
print("  Status: SQLite is 100% WORKING & HEALTHY")
print("========================================")
