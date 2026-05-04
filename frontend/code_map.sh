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

# ── Folder picker with multi-select ─────────────────────────────
pick_folder() {
    local current_dir
    current_dir="$(pwd)"

    # Array to hold selected folders
    SELECTED_FOLDERS=()

    while true; do
        echo ""
        header "📂  FOLDER PICKER  (multi-select supported)"
        echo -e "  ${DIM}Current location:${RESET} ${BOLD}${current_dir}${RESET}"
        echo ""

        local tmplist
        tmplist="$(mktemp)"
        find "$current_dir" -maxdepth 1 -mindepth 1 -type d | sort > "$tmplist"

        local count=0
        while IFS= read -r d; do
            count=$((count + 1))
            local tag=""
            # Mark already-selected dirs
            local dname
            dname="$(basename "$d")"
            for sel in "${SELECTED_FOLDERS[@]}"; do
                if [ "$sel" = "$d" ]; then
                    tag=" ${GREEN}✔${RESET}"
                    break
                fi
            done
            printf "  ${CYAN}%2d)${RESET}  %s%b\n" "$count" "$dname" "$tag"
        done < "$tmplist"

        if [ "$count" -eq 0 ]; then
            echo -e "  ${DIM}(no subdirectories here)${RESET}"
        fi

        echo ""
        echo -e "  ${DIM}Tip: enter multiple numbers separated by spaces, e.g. ${BOLD}2 3 4 5${RESET}"
        echo ""

        # Show current selection if any
        if [ "${#SELECTED_FOLDERS[@]}" -gt 0 ]; then
            echo -e "  ${GREEN}Selected so far:${RESET}"
            for sel in "${SELECTED_FOLDERS[@]}"; do
                echo -e "    ${GREEN}✔${RESET}  ${sel#$current_dir/}"
            done
            echo ""
            echo -e "  ${GREEN}d)${RESET}  ${BOLD}Done — use selected folders${RESET}"
        fi

        echo -e "  ${GREEN}s)${RESET}  ${BOLD}Select THIS folder${RESET}  ←  use current directory"
        echo -e "  ${YELLOW}u)${RESET}  Go UP one level"
        echo -e "  ${RED}c)${RESET}  Clear selection"
        echo -e "  ${RED}q)${RESET}  Quit"
        echo ""
        printf "  Your choice: "
        read -r choice

        case "$choice" in
            s|S)
                # Add current dir if not already present
                local already=0
                for sel in "${SELECTED_FOLDERS[@]}"; do
                    [ "$sel" = "$current_dir" ] && already=1 && break
                done
                if [ "$already" -eq 0 ]; then
                    SELECTED_FOLDERS+=("$current_dir")
                    success "Added: $current_dir"
                else
                    warn "Already selected: $current_dir"
                fi
                rm -f "$tmplist"
                # Ask if they want to keep browsing or finish
                echo ""
                printf "  ${DIM}Continue selecting more folders? [y/N]:${RESET} "
                read -r cont
                case "$cont" in
                    y|Y) ;;
                    *) return 0 ;;
                esac
                ;;
            d|D)
                if [ "${#SELECTED_FOLDERS[@]}" -gt 0 ]; then
                    rm -f "$tmplist"
                    return 0
                else
                    warn "No folders selected yet."
                fi
                ;;
            u|U)
                current_dir="$(dirname "$current_dir")"
                ;;
            c|C)
                SELECTED_FOLDERS=()
                success "Selection cleared."
                ;;
            q|Q)
                echo ""
                warn "Aborted."
                rm -f "$tmplist"
                exit 0
                ;;
            *)
                # Support space-separated numbers like "2 3 4 5"
                local valid=1
                local nums=()
                for token in $choice; do
                    if echo "$token" | grep -qE '^[0-9]+$'; then
                        if [ "$token" -ge 1 ] && [ "$token" -le "$count" ]; then
                            nums+=("$token")
                        else
                            warn "Number out of range: $token"
                            valid=0
                            break
                        fi
                    else
                        warn "Invalid input: '$token'. Enter numbers, s, u, d, c, or q."
                        valid=0
                        break
                    fi
                done

                if [ "$valid" -eq 1 ] && [ "${#nums[@]}" -gt 0 ]; then
                    if [ "${#nums[@]}" -eq 1 ]; then
                        # Single number → navigate into that folder
                        local selected_name
                        selected_name="$(sed -n "${nums[0]}p" "$tmplist")"
                        current_dir="$selected_name"
                    else
                        # Multiple numbers → add all to selection
                        for n in "${nums[@]}"; do
                            local dir_path
                            dir_path="$(sed -n "${n}p" "$tmplist")"
                            local already=0
                            for sel in "${SELECTED_FOLDERS[@]}"; do
                                [ "$sel" = "$dir_path" ] && already=1 && break
                            done
                            if [ "$already" -eq 0 ]; then
                                SELECTED_FOLDERS+=("$dir_path")
                                success "Added: $(basename "$dir_path")"
                            else
                                warn "Already selected: $(basename "$dir_path")"
                            fi
                        done
                        echo ""
                        echo -e "  ${DIM}Enter ${GREEN}d${RESET}${DIM} when done selecting, or keep browsing.${RESET}"
                    fi
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
    local root="$2"
    local rel="${filepath#${root}/}"
    echo "$rel" | grep -qE "(^|/)(${EXCLUDE_DIRS})(/|$)"
}

# ── Check if file extension is excluded ─────────────────────────
ext_is_excluded() {
    local filepath="$1"
    local ext="${filepath##*.}"
    ext="$(echo "$ext" | tr '[:upper:]' '[:lower:]')"
    echo "$ext" | grep -qE "^(${EXCLUDE_EXTS})$"
}

# ── Generate map for a single root folder ───────────────────────
generate_map_for_root() {
    local root="$1"
    local out="$2"

    echo ""
    header "🔍  Scanning: $root"
    echo ""

    find "$root" -type f | sort | while IFS= read -r filepath; do

        if path_has_excluded_dir "$filepath" "$root"; then
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
}

# ── Main: generate the map across all selected folders ──────────
generate_map() {
    local folders=("$@")
    local out="$OUTPUT_FILE"

    printf "================================================================\n" > "$out"
    printf "  CODE MAP\n" >> "$out"
    printf "  Roots  :\n" >> "$out"
    for f in "${folders[@]}"; do
        printf "    - %s\n" "$f" >> "$out"
    done
    printf "  Created: %s\n" "$(date '+%Y-%m-%d %H:%M:%S')" >> "$out"
    printf "================================================================\n\n" >> "$out"

    for root in "${folders[@]}"; do
        printf "################################################################\n" >> "$out"
        printf "  FOLDER: %s\n" "$root" >> "$out"
        printf "################################################################\n\n" >> "$out"

        generate_map_for_root "$root" "$out"

        printf "\n" >> "$out"
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
generate_map "${SELECTED_FOLDERS[@]}"