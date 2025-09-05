import re
from playwright.sync_api import sync_playwright, expect, Page

def test_layout(page: Page):
    # 1. Navigate to the login page
    try:
        page.goto("http://localhost:5173/login", timeout=10000)
    except Exception as e:
        print("Failed to navigate to login page. Is the dev server running? `npm run dev`")
        print(f"Error: {e}")
        page.screenshot(path="jules-scratch/verification/error_page.png")
        raise

    # 2. Fill in the login form
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("admin_password")

    # 3. Click the sign-in button and wait for navigation
    page.get_by_role("button", name="Sign in").click()

    # 4. Verify successful navigation to the dashboard
    page.wait_for_url("**/dashboard", timeout=10000)
    expect(page).to_have_url(re.compile(".*/dashboard"))

    # 5. Check for the layout heading
    layout_heading = page.get_by_role("heading", name="Layout")
    expect(layout_heading).to_be_visible()

    # 6. Take a screenshot
    page.screenshot(path="jules-scratch/verification/layout_test.png")

# --- Boilerplate to run the test ---
def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        test_layout(page)
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
