#!/usr/bin/env bash

# ================================================================
#  CODE MAP GENERATOR — code_map.sh
#  Walks a folder and writes each file's path + full code
#  into a single .txt output file.
# ================================================================

# ── Colors ───────────────────────────────────────────────────────
BOLD='\033[1m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
DIM='\033[2m'
RESET='\033[0m'

# ── Settings (edit these to customize) ──────────────────────────
OUTPUT_FILE="code_map.txt"
MAX_FILE_SIZE=500000   # skip files larger than 500 KB (in bytes)

# Directories to skip entirely
EXCLUDE_DIRS="node_modules|\.git|__pycache__|\.venv|venv|dist|build|\.idea|\.vscode|\.next|coverage"

# File extensions to skip (binary / media / lock files)
EXCLUDE_EXTS="png|jpg|jpeg|gif|svg|ico|webp|bmp|mp4|mp3|wav|ogg|zip|tar|gz|rar|pdf|exe|bin|lock|woff|woff2|ttf|eot|otf|pyc|class|o|so|dll"

# ── Helpers ──────────────────────────────────────────────────────
header()  { echo -e "${CYAN}${BOLD}$1${RESET}"; }
success() { echo -e "${GREEN}✔  $1${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $1${RESET}"; }

# ── Folder picker ────────────────────────────────────────────────
pick_folder() {
    local current_dir
    current_dir="$(pwd)"

    while true; do
        echo ""
        header "📂  FOLDER PICKER"
        echo -e "  ${DIM}Current location:${RESET} ${BOLD}${current_dir}${RESET}"
        echo ""

        local tmplist
        tmplist="$(mktemp)"
        find "$current_dir" -maxdepth 1 -mindepth 1 -type d | sort > "$tmplist"

        local count=0
        while IFS= read -r d; do
            count=$((count + 1))
            printf "  ${CYAN}%2d)${RESET}  %s\n" "$count" "$(basename "$d")"
        done < "$tmplist"

        if [ "$count" -eq 0 ]; then
            echo -e "  ${DIM}(no subdirectories here)${RESET}"
        fi

        echo ""
        echo -e "  ${GREEN}s)${RESET}  ${BOLD}Select THIS folder${RESET}  ←  use current directory"
        echo -e "  ${YELLOW}u)${RESET}  Go UP one level"
        echo -e "  ${RED}q)${RESET}  Quit"
        echo ""
        printf "  Your choice: "
        read -r choice

        case "$choice" in
            s|S)
                SELECTED_FOLDER="$current_dir"
                rm -f "$tmplist"
                return 0
                ;;
            u|U)
                current_dir="$(dirname "$current_dir")"
                ;;
            q|Q)
                echo ""
                warn "Aborted."
                rm -f "$tmplist"
                exit 0
                ;;
            *)
                if echo "$choice" | grep -qE '^[0-9]+$'; then
                    if [ "$choice" -ge 1 ] && [ "$choice" -le "$count" ]; then
                        local selected_name
                        selected_name="$(sed -n "${choice}p" "$tmplist")"
                        current_dir="$selected_name"
                    else
                        warn "Number out of range."
                    fi
                else
                    warn "Invalid input. Enter a number, s, u, or q."
                fi
                ;;
        esac

        rm -f "$tmplist"
    done
}

# ── Ask output filename ──────────────────────────────────────────
ask_output() {
    echo ""
    header "💾  OUTPUT FILE"
    printf "  Save map to (default: ${BOLD}%s${RESET}): " "$OUTPUT_FILE"
    read -r user_out
    if [ -n "$user_out" ]; then
        OUTPUT_FILE="$user_out"
    fi
    case "$OUTPUT_FILE" in
        *.txt) ;;
        *)     OUTPUT_FILE="${OUTPUT_FILE}.txt" ;;
    esac
}

# ── Check if a path contains an excluded directory ──────────────
path_has_excluded_dir() {
    local filepath="$1"
    local rel="${filepath#${SELECTED_FOLDER}/}"
    echo "$rel" | grep -qE "(^|/)(${EXCLUDE_DIRS})(/|$)"
}

# ── Check if file extension is excluded ─────────────────────────
ext_is_excluded() {
    local filepath="$1"
    local ext="${filepath##*.}"
    ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
    echo "$ext" | grep -qE "^(${EXCLUDE_EXTS})$"
}

# ── Main: generate the map ───────────────────────────────────────
generate_map() {
    local root="$1"
    local out="$2"

    printf "================================================================\n" > "$out"
    printf "  CODE MAP\n" >> "$out"
    printf "  Root   : %s\n" "$root" >> "$out"
    printf "  Created: %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" >> "$out"
    printf "================================================================\n\n" >> "$out"

    echo ""
    header "🔍  Scanning: $root"
    echo ""

    find "$root" -type f | sort | while IFS= read -r filepath; do

        if path_has_excluded_dir "$filepath"; then
            continue
        fi

        if ext_is_excluded "$filepath"; then
            continue
        fi

        local size
        size=$(wc -c < "$filepath" 2>/dev/null || echo 0)
        if [ "$size" -gt "$MAX_FILE_SIZE" ]; then
            warn "Skipping large file: ${filepath#$root/}  ($(( size / 1024 )) KB)"
            continue
        fi

        local rel_path="${filepath#$root/}"

        printf "  ${DIM}writing${RESET}  %s\n" "$rel_path"

        printf -- "----------------------------------------------------------------\n" >> "$out"
        printf "FILE: %s\n" "$rel_path" >> "$out"
        printf -- "----------------------------------------------------------------\n" >> "$out"
        cat "$filepath" >> "$out"
        printf "\n\n" >> "$out"

    done

    printf "================================================================\n" >> "$out"
    printf "  END OF CODE MAP\n" >> "$out"
    printf "================================================================\n" >> "$out"

    echo ""
    success "Done!  Output saved → ${BOLD}${out}${RESET}"
    echo -e "  ${DIM}Total size: $(wc -c < "$out") bytes  |  Lines: $(wc -l < "$out")${RESET}"
    echo ""
}

# ================================================================
#  ENTRY POINT
# ================================================================

echo ""
echo -e "${BOLD}${CYAN}"
echo "  ██████╗ ██████╗ ██████╗ ███████╗    ███╗   ███╗ █████╗ ██████╗ "
echo "  ██╔════╝██╔═══██╗██╔══██╗██╔════╝    ████╗ ████║██╔══██╗██╔══██╗"
echo "  ██║     ██║   ██║██║  ██║█████╗      ██╔████╔██║███████║██████╔╝"
echo "  ██║     ██║   ██║██║  ██║██╔══╝      ██║╚██╔╝██║██╔══██║██╔═══╝ "
echo "  ╚██████╗╚██████╔╝██████╔╝███████╗    ██║ ╚═╝ ██║██║  ██║██║     "
echo "   ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝     "
echo -e "${RESET}"
echo -e "  ${DIM}Dumps every file's path + full content into one .txt file${RESET}"

pick_folder
ask_output
generate_map "$SELECTED_FOLDER" "$OUTPUT_FILE"