#!/bin/bash
# Symbol Navigator Tool
# Quickly find and navigate to symbol definitions in deobfuscated Claude Code

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEOBFUSCATED_FILE="$SCRIPT_DIR/../../deobfuscated.js"
SYMBOL_CACHE="$SCRIPT_DIR/.symbol-cache.txt"

# Usage
usage() {
    echo "Symbol Navigator - Find symbol definitions in deobfuscated Claude Code"
    echo ""
    echo "Usage: $0 <command> [arguments]"
    echo ""
    echo "Commands:"
    echo "  find <name>           Find symbol definition (function/class/variable)"
    echo "  function <name>       Find function definition"
    echo "  class <name>          Find class definition"
    echo "  export <name>         Find export statement"
    echo "  mcp <keyword>         Find MCP-related code"
    echo "  tool <name>           Find tool implementation"
    echo "  api <endpoint>        Find API endpoint usage"
    echo "  rebuild-cache         Rebuild symbol cache (slow, run once)"
    echo ""
    echo "Examples:"
    echo "  $0 find MB9                 # Find any symbol named MB9"
    echo "  $0 function handleRequest   # Find function definition"
    echo "  $0 class WebSocketClient    # Find class definition"
    echo "  $0 mcp server              # Find MCP server code"
    echo "  $0 tool Bash               # Find Bash tool implementation"
    echo "  $0 api /v1/messages        # Find API endpoint usage"
    exit 1
}

# Check if deobfuscated file exists
if [[ ! -f "$DEOBFUSCATED_FILE" ]]; then
    echo -e "${RED}Error: Deobfuscated file not found: $DEOBFUSCATED_FILE${NC}"
    exit 1
fi

# Find symbol definition
find_symbol() {
    local symbol="$1"
    echo -e "${BLUE}Searching for symbol: ${YELLOW}$symbol${NC}"
    echo ""

    # Search for function definitions
    echo -e "${GREEN}Function definitions:${NC}"
    grep -n "function $symbol\|const $symbol = function\|let $symbol = function\|var $symbol = function\|$symbol(.*) {" "$DEOBFUSCATED_FILE" | head -5 || echo "  (none found)"
    echo ""

    # Search for class definitions
    echo -e "${GREEN}Class definitions:${NC}"
    grep -n "class $symbol" "$DEOBFUSCATED_FILE" | head -5 || echo "  (none found)"
    echo ""

    # Search for variable/const declarations
    echo -e "${GREEN}Variable declarations:${NC}"
    grep -n "const $symbol =\|let $symbol =\|var $symbol =" "$DEOBFUSCATED_FILE" | head -5 || echo "  (none found)"
    echo ""

    # Search for exports
    echo -e "${GREEN}Exports:${NC}"
    grep -n "export.*$symbol\|exports.$symbol" "$DEOBFUSCATED_FILE" | head -5 || echo "  (none found)"
}

# Find function definition
find_function() {
    local func_name="$1"
    echo -e "${BLUE}Searching for function: ${YELLOW}$func_name${NC}"
    echo ""

    grep -n -A 3 "function $func_name\|const $func_name = function\|const $func_name = (" "$DEOBFUSCATED_FILE" | head -20
}

# Find class definition
find_class() {
    local class_name="$1"
    echo -e "${BLUE}Searching for class: ${YELLOW}$class_name${NC}"
    echo ""

    grep -n -A 5 "class $class_name" "$DEOBFUSCATED_FILE" | head -30
}

# Find export statement
find_export() {
    local export_name="$1"
    echo -e "${BLUE}Searching for export: ${YELLOW}$export_name${NC}"
    echo ""

    grep -n "export.*$export_name\|exports.$export_name\|module.exports.*$export_name" "$DEOBFUSCATED_FILE" | head -10
}

# Find MCP-related code
find_mcp() {
    local keyword="$1"
    echo -e "${BLUE}Searching for MCP code containing: ${YELLOW}$keyword${NC}"
    echo ""

    grep -n -i "mcp.*$keyword\|$keyword.*mcp" "$DEOBFUSCATED_FILE" | head -20
}

# Find tool implementation
find_tool() {
    local tool_name="$1"
    echo -e "${BLUE}Searching for tool: ${YELLOW}$tool_name${NC}"
    echo ""

    echo -e "${GREEN}Tool definition:${NC}"
    grep -n "name.*['\"]$tool_name['\"]" "$DEOBFUSCATED_FILE" | head -5
    echo ""

    echo -e "${GREEN}Tool implementation:${NC}"
    grep -n -B 2 -A 10 "case ['\"]$tool_name['\"]:" "$DEOBFUSCATED_FILE" | head -30
}

# Find API endpoint usage
find_api() {
    local endpoint="$1"
    echo -e "${BLUE}Searching for API endpoint: ${YELLOW}$endpoint${NC}"
    echo ""

    grep -n "$endpoint" "$DEOBFUSCATED_FILE" | head -20
}

# Build symbol cache (expensive operation)
rebuild_cache() {
    echo -e "${YELLOW}Rebuilding symbol cache... This may take a minute.${NC}"
    echo ""

    echo -e "${GREEN}Extracting function names...${NC}"
    grep -o "function [A-Za-z0-9_]\+" "$DEOBFUSCATED_FILE" | sort -u > "$SYMBOL_CACHE.functions"

    echo -e "${GREEN}Extracting class names...${NC}"
    grep -o "class [A-Za-z0-9_]\+" "$DEOBFUSCATED_FILE" | sort -u > "$SYMBOL_CACHE.classes"

    echo -e "${GREEN}Extracting const declarations...${NC}"
    grep -o "const [A-Za-z0-9_]\+ =" "$DEOBFUSCATED_FILE" | sort -u > "$SYMBOL_CACHE.consts"

    echo ""
    echo -e "${GREEN}Cache built successfully:${NC}"
    echo "  Functions: $(wc -l < "$SYMBOL_CACHE.functions")"
    echo "  Classes: $(wc -l < "$SYMBOL_CACHE.classes")"
    echo "  Constants: $(wc -l < "$SYMBOL_CACHE.consts")"
}

# Main command dispatcher
if [[ $# -eq 0 ]]; then
    usage
fi

command="$1"
shift

case "$command" in
    find)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Symbol name required${NC}"
            usage
        fi
        find_symbol "$1"
        ;;
    function)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Function name required${NC}"
            usage
        fi
        find_function "$1"
        ;;
    class)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Class name required${NC}"
            usage
        fi
        find_class "$1"
        ;;
    export)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Export name required${NC}"
            usage
        fi
        find_export "$1"
        ;;
    mcp)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Keyword required${NC}"
            usage
        fi
        find_mcp "$1"
        ;;
    tool)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: Tool name required${NC}"
            usage
        fi
        find_tool "$1"
        ;;
    api)
        if [[ $# -eq 0 ]]; then
            echo -e "${RED}Error: API endpoint required${NC}"
            usage
        fi
        find_api "$1"
        ;;
    rebuild-cache)
        rebuild_cache
        ;;
    *)
        echo -e "${RED}Error: Unknown command: $command${NC}"
        usage
        ;;
esac
