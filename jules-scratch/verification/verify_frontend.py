from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the login page
        page.goto("http://localhost:5173/login")

        # Wait for the login form to be visible using a robust locator
        login_heading = page.get_by_role("heading", name="Login")
        expect(login_heading).to_be_visible()

        # Take a screenshot of the login page
        page.screenshot(path="jules-scratch/verification/login-page.png")

        # Fill in the login form
        page.get_by_label("Username").fill("admin_test")
        page.get_by_label("Password").fill("adminpassword")

        # Click the login button
        page.get_by_role("button", name="Login").click()

        # Wait for navigation to the dashboard and for the dashboard heading to be visible
        dashboard_heading = page.get_by_role("heading", name="Dashboard")
        expect(dashboard_heading).to_be_visible()

        # Take a screenshot of the dashboard
        page.screenshot(path="jules-scratch/verification/dashboard-page.png")

        browser.close()

if __name__ == "__main__":
    run()
