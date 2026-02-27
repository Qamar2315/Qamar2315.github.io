from playwright.sync_api import sync_playwright

def verify_markdown_rendering():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        # Go to the local server
        page.goto('http://localhost:8080')

        # Wait for projects to load (they are fetched dynamically)
        try:
            page.wait_for_selector('#projects-grid .project-card', timeout=5000)
        except Exception as e:
            print("Failed to find project cards. Taking screenshot of page.")
            page.screenshot(path='error_page.png')
            raise e

        # Find the specific project card by ID (data-project-id="clean-md-to-multi-format")
        # The ID in the JSON is "clean-md-to-multi-format"
        # We need to click "View Details" to open the modal

        # Using a selector for the specific card
        project_card = page.locator('[data-project-id="clean-md-to-multi-format"]')

        # Click the card to open modal
        project_card.click()

        # Wait for modal content to be populated
        # We'll wait for the description block to be visible, then take a screenshot
        page.wait_for_selector('#modal-main-description', timeout=5000)

        # Take a screenshot of the modal content
        # We want to focus on the description block
        element = page.locator('#modal-content')
        element.screenshot(path='verification_markdown.png')

        print("Screenshot saved to verification_markdown.png")

        browser.close()

if __name__ == "__main__":
    verify_markdown_rendering()
