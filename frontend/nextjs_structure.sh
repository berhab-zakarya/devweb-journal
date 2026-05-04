#!/bin/bash

# ─────────────────────────────────────────────
#  Next.js Project Structure Writer
#  Scans a folder and saves its tree to a .txt
# ─────────────────────────────────────────────

# ── Colors ──────────────────────────────────
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║   Next.js Structure Writer  🗂️          ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# ── Step 1: Ask user to enter the project path ──
echo -e "${YELLOW}📁 Enter the path to your Next.js project folder:${NC}"
echo -e "   (Press ENTER to use current directory: ${PWD})"
read -r PROJECT_PATH

# Default to current directory if empty
if [ -z "$PROJECT_PATH" ]; then
  PROJECT_PATH="$PWD"
fi

# Remove trailing slash if present
PROJECT_PATH="${PROJECT_PATH%/}"

# Check if the folder exists
if [ ! -d "$PROJECT_PATH" ]; then
  echo -e "${RED}❌ Error: Folder not found → $PROJECT_PATH${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Project folder: $PROJECT_PATH${NC}"

# ── Step 2: Ask user where to save the output .txt ──
echo ""
echo -e "${YELLOW}💾 Enter the output file name (e.g. structure.txt):${NC}"
echo -e "   (Press ENTER to save as 'nextjs_structure.txt' in current folder)"
read -r OUTPUT_FILE

if [ -z "$OUTPUT_FILE" ]; then
  OUTPUT_FILE="nextjs_structure.txt"
fi

# If user didn't include .txt extension, add it
if [[ "$OUTPUT_FILE" != *.txt ]]; then
  OUTPUT_FILE="${OUTPUT_FILE}.txt"
fi

# ── Step 3: Generate the structure ──────────
echo ""
echo -e "${CYAN}🔍 Scanning project structure...${NC}"

# Folders/files to ignore (node_modules, .git, .next, etc.)
IGNORE_PATTERN="node_modules|\.next|\.git|\.turbo|dist|build|coverage|\.cache|\.DS_Store|__pycache__|\.idea|\.vscode|\public"

# Write header to file
{
  echo "════════════════════════════════════════════"
  echo "  Next.js Project Structure"
  echo "  Folder : $PROJECT_PATH"
  echo "  Date   : $(date '+%Y-%m-%d %H:%M:%S')"
  echo "════════════════════════════════════════════"
  echo ""

  # Check if 'tree' command is available
  if command -v tree &>/dev/null; then
    tree "$PROJECT_PATH" \
      --noreport \
      -I "$IGNORE_PATTERN" \
      -a \
      --dirsfirst
  else
    # Fallback: use find if tree is not installed
    echo "[ tree command not found — using find fallback ]"
    echo ""
    find "$PROJECT_PATH" \
      -not -path "*/node_modules/*" \
      -not -path "*/.next/*" \
      -not -path "*/.git/*" \
      -not -path "*/dist/*" \
      -not -path "*/build/*" \
      -not -path "*/.turbo/*" \
      -not -name ".DS_Store" \
      | sort \
      | sed "s|$PROJECT_PATH||" \
      | sed '/^$/d' \
      | awk -F'/' '{
          depth = NF - 2
          indent = ""
          for (i = 0; i < depth; i++) indent = indent "│   "
          if (depth > 0) indent = indent "├── "
          print indent $NF
        }'
  fi

  echo ""
  echo "════════════════════════════════════════════"
  echo "  End of structure"
  echo "════════════════════════════════════════════"

} > "$OUTPUT_FILE"

# ── Step 4: Done ─────────────────────────────
echo ""
echo -e "${GREEN}✅ Structure saved to: ${YELLOW}$OUTPUT_FILE${NC}"
echo ""
echo -e "${CYAN}📄 Preview (first 30 lines):${NC}"
echo "────────────────────────────────────────────"
head -n 30 "$OUTPUT_FILE"
echo "────────────────────────────────────────────"
echo -e "${CYAN}... (open the file for the full structure)${NC}"
echo ""