import re

raw_file = r'c:\Users\stefa\Desktop\EasyGig1.0Microservice\EasyGigMicroserviceVersion1.0\scratch\italia_raw.sql'
output_file = r'c:\Users\stefa\Desktop\EasyGig1.0Microservice\EasyGigMicroserviceVersion1.0\init-db\import_italy.sql'

with open(raw_file, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

output = []
output.append("-- Italian Cities Import Script\n")
output.append("INSERT INTO nation (id, name) VALUES (1, 'Italia') ON CONFLICT (id) DO NOTHING;\n")

# Process Regions
regions_match = re.search(r"INSERT INTO `regioni` VALUES (.*?);", content, re.DOTALL)
if regions_match:
    values_str = regions_match.group(1)
    values = re.findall(r"\((\d+),'(.*?)',.*?,.*?\)", values_str)
    for rid, name in values:
        name = name.replace("'", "''")
        output.append(f"INSERT INTO region (id, name, nation_id) VALUES ({rid}, '{name}', 1) ON CONFLICT (id) DO NOTHING;\n")

# Process Cities (Comuni)
# Format: (id, id_regione, id_provincia, 'nome', ...)
cities_matches = re.finditer(r"INSERT INTO `comuni` VALUES (.*?);", content, re.DOTALL)
count = 0
for match in cities_matches:
    values_str = match.group(1)
    # Match: (id, id_regione, id_provincia, 'name', ...)
    # Note: Using a more flexible regex for name to handle escaped quotes inside
    items = re.findall(r"\((\d+),(\d+),\d+,'(.*?)',.*?\)", values_str)
    for cid, rid, name in items:
        name = name.replace("'", "''")
        output.append(f"INSERT INTO city (id, name, region_id) VALUES ({cid}, '{name}', {rid}) ON CONFLICT (id) DO NOTHING;\n")
        count += 1

# Reset sequences for Postgres
output.append("\n-- Reset sequences\n")
output.append("SELECT setval(pg_get_serial_sequence('nation', 'id'), (SELECT max(id) FROM nation));\n")
output.append("SELECT setval(pg_get_serial_sequence('region', 'id'), (SELECT max(id) FROM region));\n")
output.append("SELECT setval(pg_get_serial_sequence('city', 'id'), (SELECT max(id) FROM city));\n")

with open(output_file, 'w', encoding='utf-8') as f:
    f.writelines(output)

print(f"Generated {output_file} with {count} cities.")
