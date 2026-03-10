from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('http://localhost:8000')
    page.wait_for_selector('.project-card') # wait for dynamic content
    page.wait_for_timeout(1000) # give a little time for images/fonts

    # scroll down a bit to trigger animations
    page.evaluate("window.scrollBy(0, window.innerHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path='portfolio_scroll1.png', full_page=False)

    page.evaluate("window.scrollBy(0, window.innerHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path='portfolio_scroll2.png', full_page=False)

    page.evaluate("window.scrollBy(0, window.innerHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path='portfolio_scroll3.png', full_page=False)

    browser.close()
