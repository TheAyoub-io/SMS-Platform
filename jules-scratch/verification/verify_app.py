import re
from playwright.sync_api import sync_playwright, expect, Page

def test_auth_flow_and_dashboard(page: Page):
    """
    This test verifies the complete authentication flow and the dashboard.
    1. Navigates to the login page.
    2. Fills in credentials and submits the form.
    3. Verifies successful navigation to the dashboard.
    4. Takes screenshots at each key step.
    """
    # 1. Navigate to the login page
    try:
        page.goto("http://localhost:5173/login", timeout=10000)
    except Exception as e:
        print("Failed to navigate to login page. Is the dev server running? `npm run dev`")
        print(f"Error: {e}")
        page.screenshot(path="jules-scratch/verification/error_page.png")
        raise

    # Take a screenshot of the login page
    page.screenshot(path="jules-scratch/verification/01_login_page.png")
    expect(page.get_by_role("heading", name="Sign in to your account")).to_be_visible()

    # 2. Fill in the login form
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("admin_password")

    # Take a screenshot of the filled form
    page.screenshot(path="jules-scratch/verification/02_login_form_filled.png")

    # 3. Click the sign-in button and wait for navigation
    page.get_by_role("button", name="Sign in").click()

    # 4. Verify successful navigation to the dashboard
    page.wait_for_url("**/dashboard", timeout=10000)
    expect(page).to_have_url(re.compile(".*/dashboard"))
    dashboard_heading = page.get_by_role("heading", name="Dashboard")
    expect(dashboard_heading).to_be_visible()

    # Take a screenshot of the dashboard
    page.screenshot(path="jules-scratch/verification/03_dashboard_page.png")


# --- Boilerplate to run the test ---
def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    def handle_console(msg):
        print(f"CONSOLE: {msg.text}")

    page.on("console", handle_console)

    # Wrap in a try/finally to ensure browser is closed
    try:
        test_auth_flow_and_dashboard(page)
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
