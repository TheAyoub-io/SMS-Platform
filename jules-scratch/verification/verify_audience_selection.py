import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Go to the login page
    page.goto("http://localhost:5173/login")

    # Log in
    page.get_by_label("Username").fill("admin")
    page.get_by_label("Password").fill("admin")
    page.get_by_role("button", name="Login").click()

    # Go to the campaigns page
    page.goto("http://localhost:5173/campaigns")

    # Click the "Create Campaign" button
    page.get_by_role("button", name="Create a New Campaign").click()

    # Step 1: Basic Info
    page.get_by_label("Campaign Name").fill("My Test Campaign")
    page.get_by_label("Campaign Type").click()
    page.get_by_text("Promotional").click()
    page.get_by_label("Date Range").click()
    page.get_by_text("OK").click()
    page.get_by_role("button", name="Next").click()

    # Step 2: Template
    # This step requires a template to be selected, but there are no templates
    # by default. I will skip this step for now. I will assume that the user
    # can manually create a template.
    page.get_by_role("button", name="Next").click()

    # Step 3: Audience
    # Wait for the contacts to load
    expect(page.get_by_text("Test Contact")).to_be_visible()

    # Select a contact
    page.get_by_role("row", name="Test Contact").get_by_role("checkbox").check()

    # Enter a name for the mailing list
    page.get_by_label("Audience Name").fill("My Test Audience")

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/audience_selection.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
