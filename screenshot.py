from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:8000')
    page.wait_for_selector('.project-card') # wait for dynamic content
    page.wait_for_timeout(2000) # give a little time for images/fonts
    page.screenshot(path='portfolio.png', full_page=True)
    browser.close()
