#!/bin/bash
# Cross-Reference Tool
# Find usages and references of symbols in deobfuscated Claude Code

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEOBFUSCATED_FILE="$SCRIPT_DIR/../../deobfuscated.js"
XREF_CACHE="$SCRIPT_DIR/.xref-cache"

# Usage
usage() {
    echo "Cross-Reference Tool - Find symbol usages in deobfuscated Claude Code"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  usage <symbol>        Find all usages of a symbol"
    echo "  callers <function>    Find all callers of a function"
    echo "  imports <module>      Find where a module is imported"
    echo "  property <name>       Find property accesses"
    echo "  string <text>         Find string occurrences"
    echo "  pattern <regex>       Find regex pattern matches"
    echo "  context <symbol> <n>  Find symbol with N lines of context"
    echo "  stats <symbol>        Show usage statistics"
    echo ""
    echo "Examples:"
    echo "  $0 usage WebSocketClient       # Find all usages"
    echo "  $0 callers executeTools        # Find who calls this function"
    echo "  $0 imports fs/promises          # Find fs/promises imports"
    echo "  $0 property headers.authorization  # Find auth header usage"
    echo "  $0 string 'api.anthropic.com'  # Find API URL occurrences"
    echo "  $0 pattern 'process\\.env\\.[A-Z_]+'  # Find env var usage"
    echo "  $0 context MCP 5               # Find MCP with 5 lines context"
    echo "  $0 stats setTimeout            # Show setTimeout usage stats"
    exit 1
}

# Check if deobfuscated file exists
if [[ ! -f "$DEOBFUSCATED_FILE" ]]; then
    echo -e "${RED}Error: Deobfuscated file not found: $DEOBFUSCATED_FILE${NC}"
    exit 1
fi

# Find all usages of a symbol
find_usage() {
    local symbol="$1"
    local count=$(grep -c "$symbol" "$DEOBFUSCATED_FILE" || true)

    echo -e "${BLUE}Finding usages of: ${YELLOW}$symbol${NC}"
    echo -e "${CYAN}Total occurrences: $count${NC}"
    echo ""

    if [[ $count -gt 100 ]]; then
        echo -e "${YELLOW}Warning: $count occurrences found. Showing first 50.${NC}"
        echo -e "${YELLOW}Use 'pattern' or 'context' commands for more specific searches.${NC}"
        echo ""
        grep -n "$symbol" "$DEOBFUSCATED_FILE" | head -50
    elif [[ $count -gt 0 ]]; then
        grep -n "$symbol" "$DEOBFUSCATED_FILE"
    else
        echo -e "${RED}No occurrences found.${NC}"
    fi
}

# Find callers of a function
find_callers() {
    local function="$1"
    echo -e "${BLUE}Finding callers of function: ${YELLOW}$function${NC}"
    echo ""

    # Match function calls: function(), function(args), obj.function()
    echo -e "${GREEN}Direct calls:${NC}"
    grep -n "$function(" "$DEOBFUSCATED_FILE" | head -30
    echo ""

    echo -e "${GREEN}Method calls:${NC}"
    grep -n "\.$function(" "$DEOBFUSCATED_FILE" | head -20
    echo ""

    echo -e "${GREEN}Passed as callback:${NC}"
    grep -n "=> $function\|, $function\|($function)" "$DEOBFUSCATED_FILE" | head -20
}

# Find where a module is imported
find_imports() {
    local module="$1"
    echo -e "${BLUE}Finding imports of: ${YELLOW}$module${NC}"
    echo ""

    echo -e "${GREEN}ES6 imports:${NC}"
    grep -n "import.*from ['\"].*$module.*['\"]" "$DEOBFUSCATED_FILE" || echo "  (none found)"
    echo ""

    echo -e "${GREEN}CommonJS requires:${NC}"
    grep -n "require(['\"].*$module.*['\"])" "$DEOBFUSCATED_FILE" || echo "  (none found)"
    echo ""

    echo -e "${GREEN}Dynamic imports:${NC}"
    grep -n "import(['\"].*$module.*['\"])" "$DEOBFUSCATED_FILE" || echo "  (none found)"
}

# Find property accesses
find_property() {
    local property="$1"
    echo -e "${BLUE}Finding property access: ${YELLOW}$property${NC}"
    echo ""

    # Match: obj.property, obj["property"], obj?.property
    local count=$(grep -E "\.$property[^a-zA-Z0-9_]|\[\"$property\"\]|\['$property'\]|\?.$property" "$DEOBFUSCATED_FILE" | wc -l)

    echo -e "${CYAN}Total matches: $count${NC}"
    echo ""

    if [[ $count -gt 50 ]]; then
        echo -e "${YELLOW}Showing first 50 matches:${NC}"
        grep -n -E "\.$property[^a-zA-Z0-9_]|\[\"$property\"\]|\['$property'\]|\?.$property" "$DEOBFUSCATED_FILE" | head -50
    else
        grep -n -E "\.$property[^a-zA-Z0-9_]|\[\"$property\"\]|\['$property'\]|\?.$property" "$DEOBFUSCATED_FILE"
    fi
}

# Find string occurrences
find_string() {
    local text="$1"
    echo -e "${BLUE}Finding string: ${YELLOW}$text${NC}"
    echo ""

    local count=$(grep -F "$text" "$DEOBFUSCATED_FILE" | wc -l)
    echo -e "${CYAN}Total occurrences: $count${NC}"
    echo ""

    if [[ $count -gt 30 ]]; then
        echo -e "${YELLOW}Showing first 30 occurrences:${NC}"
        grep -n -F "$text" "$DEOBFUSCATED_FILE" | head -30
    else
        grep -n -F "$text" "$DEOBFUSCATED_FILE"
    fi
}

# Find regex pattern matches
find_pattern() {
    local pattern="$1"
    echo -e "${BLUE}Finding pattern: ${YELLOW}$pattern${NC}"
    echo ""

    local count=$(grep -E "$pattern" "$DEOBFUSCATED_FILE" | wc -l || true)
    echo -e "${CYAN}Total matches: $count${NC}"
    echo ""

    if [[ $count -gt 50 ]]; then
        echo -e "${YELLOW}Showing first 50 matches:${NC}"
        grep -n -E "$pattern" "$DEOBFUSCATED_FILE" | head -50
    elif [[ $count -gt 0 ]]; then
        grep -n -E "$pattern" "$DEOBFUSCATED_FILE"
    else
        echo -e "${RED}No matches found.${NC}"
    fi
}

# Find with context lines
find_context() {
    local symbol="$1"
    local context="${2:-5}"

    echo -e "${BLUE}Finding: ${YELLOW}$symbol${NC} ${BLUE}with ${YELLOW}$context${NC} ${BLUE}lines of context${NC}"
    echo ""

    local count=$(grep -c "$symbol" "$DEOBFUSCATED_FILE" || true)
    echo -e "${CYAN}Total occurrences: $count${NC}"
    echo ""

    if [[ $count -gt 20 ]]; then
        echo -e "${YELLOW}Showing first 20 occurrences with context:${NC}"
        grep -n -C "$context" "$symbol" "$DEOBFUSCATED_FILE" | head -100
    elif [[ $count -gt 0 ]]; then
        grep -n -C "$context" "$symbol" "$DEOBFUSCATED_FILE"
    else
        echo -e "${RED}No occurrences found.${NC}"
    fi
}

# Show usage statistics
show_stats() {
    local symbol="$1"
    echo -e "${BLUE}Usage statistics for: ${YELLOW}$symbol${NC}"
    echo ""

    local total=$(grep -c "$symbol" "$DEOBFUSCATED_FILE" || true)
    local definitions=$(grep -c "function $symbol\|class $symbol\|const $symbol =\|let $symbol =" "$DEOBFUSCATED_FILE" || true)
    local assignments=$(grep -c "$symbol =" "$DEOBFUSCATED_FILE" || true)
    local calls=$(grep -c "$symbol(" "$DEOBFUSCATED_FILE" || true)
    local property_access=$(grep -c "\.$symbol" "$DEOBFUSCATED_FILE" || true)

    echo -e "${GREEN}Total occurrences:${NC} $total"
    echo -e "${GREEN}Definitions:${NC} $definitions"
    echo -e "${GREEN}Assignments:${NC} $assignments"
    echo -e "${GREEN}Function calls:${NC} $calls"
    echo -e "${GREEN}Property accesses:${NC} $property_access"
    echo ""

    if [[ $total -gt 0 ]]; then
        echo -e "${MAGENTA}First occurrence:${NC}"
        grep -n -m 1 "$symbol" "$DEOBFUSCATED_FILE"
        echo ""

        echo -e "${MAGENTA}Last occurrence:${NC}"
        grep -n "$symbol" "$DEOBFUSCATED_FILE" | tail -1
        echo ""

        # Distribution by line ranges
        echo -e "${MAGENTA}Distribution:${NC}"
        local total_lines=$(wc -l < "$DEOBFUSCATED_FILE")
        local quarter=$((total_lines / 4))

        local first_quarter=$(grep -n "$symbol" "$DEOBFUSCATED_FILE" | awk -F: -v limit=$quarter '$1 <= limit' | wc -l)
        local second_quarter=$(grep -n "$symbol" "$DEOBFUSCATED_FILE" | awk -F: -v low=$quarter -v high=$((quarter*2)) '$1 > low && $1 <= high' | wc -l)
        local third_quarter=$(grep -n "$symbol" "$DEOBFUSCATED_FILE" | awk -F: -v low=$((quarter*2)) -v high=$((quarter*3)) '$1 > low && $1 <= high' | wc -l)
        local fourth_quarter=$(grep -n "$symbol" "$DEOBFUSCATED_FILE" | awk -F: -v low=$((quarter*3)) '$1 > low' | wc -l)

        echo "  Lines 1-$quarter: $first_quarter occurrences"
        echo "  Lines $((quarter+1))-$((quarter*2)): $second_quarter occurrences"
        echo "  Lines $((quarter*2+1))-$((quarter*3)): $third_quarter occurrences"
        echo "  Lines $((quarter*3+1))-$total_lines: $fourth_quarter occurrences"
    fi
}

# Main command dispatcher
if [[ $# -eq 0 ]]; then
    usage
fi

command="$1"
shift

case "$command" in
    usage)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Symbol name required${NC}"
            usage
        fi
        find_usage "$1"
        ;;
    callers)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Function name required${NC}"
            usage
        fi
        find_callers "$1"
        ;;
    imports)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Module name required${NC}"
            usage
        fi
        find_imports "$1"
        ;;
    property)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Property name required${NC}"
            usage
        fi
        find_property "$1"
        ;;
    string)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: String text required${NC}"
            usage
        fi
        find_string "$1"
        ;;
    pattern)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Regex pattern required${NC}"
            usage
        fi
        find_pattern "$1"
        ;;
    context)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Symbol name required${NC}"
            usage
        fi
        find_context "$@"
        ;;
    stats)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Symbol name required${NC}"
            usage
        fi
        show_stats "$1"
        ;;
    *)
        echo -e "${RED}Error: Unknown command: $command${NC}"
        usage
        ;;
esac
