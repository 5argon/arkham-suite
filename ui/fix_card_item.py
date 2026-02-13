with open('src/lib/card/card-item.ts', 'r') as f:
    lines = f.readlines()

# Fix lines 385-397
# Keep everything up to line 384 (0-indexed)
new_lines = lines[:385]
# Add proper closing structure
new_lines.append('\t\tdefault: {\n')
new_lines.append('\t\t\treturn [];\n')
new_lines.append('\t\t}\n')
new_lines.append('\t}\n')  # close switch
new_lines.append('}\n')  # close makeGroup
new_lines.append('\n')
new_lines.append('\tconst groupedCards = actualGrouping.flatMap(makeGroup);\n')
new_lines.append('\tconst removedEmpty = groupedCards.filter((group) => group.items.length > 0);\n')
new_lines.append('\treturn removedEmpty;\n')
new_lines.append('}\n')  # close groupCardItems
new_lines.append('\n')
# Skip lines until we find the export function sortRecursivelyGroupedCards
for i in range(395, len(lines)):
    if 'export function sortRecursivelyGroupedCards' in lines[i]:
        new_lines.extend(lines[i:])
        break

with open('src/lib/card/card-item.ts', 'w') as f:
    f.writelines(new_lines)
    
print("Fixed!")
