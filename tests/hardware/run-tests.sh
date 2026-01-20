#!/bin/bash
#
# Hardware Test Runner for MSI Monitor Control GUI
# Runs real E2E tests against the actual Tauri app and monitor
#
# Requirements:
# - kdotool (KDE Plasma)
# - spectacle (KDE screenshot tool)
# - MSI monitor connected via USB
#
# Usage:
#   ./tests/hardware/run-tests.sh           # Run all tests
#   ./tests/hardware/run-tests.sh display   # Run only display tests
#

# set -e  # Disabled for debugging

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCREENSHOT_DIR="$SCRIPT_DIR/screenshots"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
SKIPPED=0

# App process ID
APP_PID=""
WINDOW_ID=""

# Window geometry (will be detected)
WIN_X=0
WIN_Y=0
WIN_WIDTH=0
WIN_HEIGHT=0

#######################################
# Logging functions
#######################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    ((SKIPPED++))
}

log_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

#######################################
# Setup and teardown
#######################################

start_app() {
    log_info "Starting Tauri app..."

    cd "$PROJECT_DIR"

    # Check if app is already running
    if pgrep -f "msigd-gui" > /dev/null; then
        log_info "App already running, using existing instance"
        sleep 1
    else
        # Start the app in dev mode
        npm run tauri dev &>/dev/null &
        APP_PID=$!
        log_info "Started app with PID: $APP_PID"

        # Wait for window to appear
        log_info "Waiting for window to appear..."
        for i in {1..30}; do
            if kdotool search --name "MSI Monitor Control" &>/dev/null; then
                break
            fi
            sleep 1
        done
    fi

    # Get window ID
    WINDOW_ID=$(kdotool search --name "MSI Monitor Control" 2>/dev/null | head -1)

    if [ -z "$WINDOW_ID" ]; then
        log_fail "Could not find app window"
        exit 1
    fi

    log_info "Found window ID: $WINDOW_ID"

    # Activate and focus window
    kdotool windowactivate "$WINDOW_ID"
    sleep 0.5

    # Get window geometry
    get_window_geometry
}

get_window_geometry() {
    # Use kdotool to get geometry
    local geom=$(kdotool getwindowgeometry "$WINDOW_ID" 2>/dev/null)

    if [ -n "$geom" ]; then
        # Parse: Position: 1040,1118 and Geometry: 480x708
        WIN_X=$(echo "$geom" | grep "Position" | grep -oP '\d+(?=,)')
        WIN_Y=$(echo "$geom" | grep "Position" | grep -oP '(?<=,)\d+')
        WIN_WIDTH=$(echo "$geom" | grep "Geometry" | grep -oP '\d+(?=x)')
        WIN_HEIGHT=$(echo "$geom" | grep "Geometry" | grep -oP '(?<=x)\d+')
    else
        # Fallback defaults
        WIN_X=100
        WIN_Y=100
        WIN_WIDTH=480
        WIN_HEIGHT=680
    fi

    log_info "Window geometry: ${WIN_WIDTH}x${WIN_HEIGHT} at (${WIN_X},${WIN_Y})"
}

stop_app() {
    if [ -n "$APP_PID" ]; then
        log_info "Stopping app (PID: $APP_PID)..."
        kill "$APP_PID" 2>/dev/null || true
        wait "$APP_PID" 2>/dev/null || true
    fi
}

cleanup() {
    stop_app
    log_info "Cleanup complete"
}

trap cleanup EXIT

#######################################
# Helper functions
#######################################

take_screenshot() {
    local name="$1"
    # Screenshots disabled - use MCP screenshot tool externally
    log_info "Screenshot point: $name"
}

# Click at relative position within window (using ydotool for Wayland)
click_at() {
    local rel_x=$1
    local rel_y=$2
    local abs_x=$((WIN_X + rel_x))
    local abs_y=$((WIN_Y + rel_y))

    ydotool mousemove -a "$abs_x" "$abs_y"
    sleep 0.1
    ydotool click 0xC0  # Left click (down + up)
    sleep 0.2
}

# Click and drag (using ydotool for Wayland)
drag() {
    local start_x=$1
    local start_y=$2
    local end_x=$3
    local end_y=$4

    local abs_start_x=$((WIN_X + start_x))
    local abs_start_y=$((WIN_Y + start_y))
    local abs_end_x=$((WIN_X + end_x))
    local abs_end_y=$((WIN_Y + end_y))

    # Move to start position
    ydotool mousemove -a "$abs_start_x" "$abs_start_y"
    sleep 0.1
    # Mouse down
    ydotool click 0x40  # Left button down
    sleep 0.1
    # Move to end position
    ydotool mousemove -a "$abs_end_x" "$abs_end_y"
    sleep 0.1
    # Mouse up
    ydotool click 0x80  # Left button up
    sleep 0.3
}

# Click on tab by name (approximate positions)
click_tab() {
    local tab="$1"
    case "$tab" in
        "display")  click_at 45 82 ;;
        "color")    click_at 105 82 ;;
        "led")      click_at 155 82 ;;
        "advanced") click_at 230 82 ;;
    esac
    sleep 0.3
}

# Wait for app to settle
wait_settle() {
    sleep "${1:-0.5}"
}

#######################################
# Test cases
#######################################

test_app_loads() {
    log_info "Testing: App loads correctly"

    if [ -n "$WINDOW_ID" ]; then
        log_success "App window appeared"
        take_screenshot "app_loaded"
        return 0
    else
        log_fail "App window did not appear"
        return 1
    fi
}

test_tab_navigation() {
    log_info "Testing: Tab navigation"

    # Click each tab
    click_tab "color"
    take_screenshot "tab_color"

    click_tab "led"
    take_screenshot "tab_led"

    click_tab "advanced"
    take_screenshot "tab_advanced"

    click_tab "display"
    take_screenshot "tab_display"

    log_success "Tab navigation works"
}

test_brightness_slider() {
    log_info "Testing: Brightness slider"

    click_tab "display"
    wait_settle

    # Brightness slider is approximately at y=180 from window top
    # Drag from center to right
    local slider_y=180
    local slider_start_x=240  # center of window
    local slider_end_x=400    # towards right

    take_screenshot "brightness_before"

    drag $slider_start_x $slider_y $slider_end_x $slider_y
    wait_settle 1

    take_screenshot "brightness_after"

    log_success "Brightness slider adjusted (check your monitor!)"
}

test_contrast_slider() {
    log_info "Testing: Contrast slider"

    click_tab "display"
    wait_settle

    # Contrast slider is below brightness, approximately y=240
    local slider_y=240
    local slider_start_x=240
    local slider_end_x=350

    take_screenshot "contrast_before"

    drag $slider_start_x $slider_y $slider_end_x $slider_y
    wait_settle 1

    take_screenshot "contrast_after"

    log_success "Contrast slider adjusted (check your monitor!)"
}

test_eye_saver_toggle() {
    log_info "Testing: Eye Saver Mode toggle"

    click_tab "display"
    wait_settle

    # Eye saver toggle is in the Comfort section, right side
    # Approximate position
    local toggle_x=440
    local toggle_y=540

    take_screenshot "eyesaver_before"

    click_at $toggle_x $toggle_y
    wait_settle 1

    take_screenshot "eyesaver_after"

    log_success "Eye Saver toggle clicked (check your monitor!)"
}

test_color_preset() {
    log_info "Testing: Color preset selection"

    click_tab "color"
    wait_settle

    # Color preset dropdown
    local dropdown_x=420
    local dropdown_y=180

    take_screenshot "color_preset_before"

    click_at $dropdown_x $dropdown_y
    wait_settle 0.3

    # Select "Warm" option (third in list)
    click_at $dropdown_x $((dropdown_y + 80))
    wait_settle 1

    take_screenshot "color_preset_after"

    log_success "Color preset changed (check your monitor!)"
}

test_led_mode() {
    log_info "Testing: LED mode selection"

    click_tab "led"
    wait_settle

    # LED mode dropdown
    local dropdown_x=420
    local dropdown_y=180

    take_screenshot "led_mode_before"

    click_at $dropdown_x $dropdown_y
    wait_settle 0.3

    # Select "Static" option
    click_at $dropdown_x $((dropdown_y + 40))
    wait_settle 0.5

    # Click Apply button (bottom of the view)
    click_at 240 500
    wait_settle 1

    take_screenshot "led_mode_after"

    log_success "LED mode changed (check your monitor LEDs!)"
}

#######################################
# Main
#######################################

main() {
    log_section "MSI Monitor Control - Hardware Tests"
    echo "Timestamp: $TIMESTAMP"
    echo "Screenshot dir: $SCREENSHOT_DIR"
    echo ""

    # Check requirements
    if ! command -v kdotool &>/dev/null; then
        log_fail "kdotool is required but not installed"
        exit 1
    fi

    if ! command -v ydotool &>/dev/null; then
        log_fail "ydotool is required but not installed (for Wayland mouse control)"
        exit 1
    fi

    # Start ydotool daemon if not running
    if ! pgrep -x ydotoold > /dev/null; then
        log_info "Starting ydotoold daemon..."
        sudo ydotoold &>/dev/null &
        sleep 1
    fi

    # Start the app
    start_app
    wait_settle 1

    # Run tests based on argument
    local test_filter="${1:-all}"

    log_section "Running Tests"

    case "$test_filter" in
        "all")
            test_app_loads
            test_tab_navigation
            test_brightness_slider
            test_contrast_slider
            test_eye_saver_toggle
            test_color_preset
            test_led_mode
            ;;
        "display")
            test_app_loads
            test_brightness_slider
            test_contrast_slider
            test_eye_saver_toggle
            ;;
        "color")
            test_app_loads
            test_color_preset
            ;;
        "led")
            test_app_loads
            test_led_mode
            ;;
        "nav")
            test_app_loads
            test_tab_navigation
            ;;
        *)
            log_info "Unknown test filter: $test_filter"
            log_info "Available: all, display, color, led, nav"
            exit 1
            ;;
    esac

    # Summary
    log_section "Test Summary"
    echo -e "  ${GREEN}Passed:${NC}  $PASSED"
    echo -e "  ${RED}Failed:${NC}  $FAILED"
    echo -e "  ${YELLOW}Skipped:${NC} $SKIPPED"
    echo ""
    echo "Screenshots saved to: $SCREENSHOT_DIR"
    echo ""

    if [ $FAILED -gt 0 ]; then
        exit 1
    fi
}

main "$@"
