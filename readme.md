# Portfolio of Qamar Ul Islam - Software Engineer

This repository contains the source code for my personal portfolio website, showcasing my skills, projects, experience, and contact information.  It's designed to be a modern and responsive online presence, built using Tailwind CSS and JavaScript.

## Features

*   **Clean and Responsive Design:**  Utilizes Tailwind CSS for a visually appealing and responsive layout that adapts to different screen sizes.
*   **Smooth Scrolling:**  JavaScript implemented smooth scrolling to different sections of the page.
*   **Mobile-Friendly Navigation:**  A mobile menu button is included for easy navigation on smaller devices.
*   **Back to Top Button:** A button appears when scrolling down the page to allow users to quickly return to the top.
*   **Project Showcase:**  Highlights personal projects with descriptions and links to their GitHub repositories.
*   **Skills Section:** Displays technical skills with relevant icons.
*   **Experience Section:**  Details my professional experience and freelance work.
*   **Contact Information:** Provides a direct email address for inquiries.
*   **Hover Effects:** Includes subtle hover effects on project cards for enhanced user interaction.

## Technologies Used

*   **HTML:**  The foundation of the website structure.
*   **CSS:** Styling done with Tailwind CSS.
*   **JavaScript:**  Handles smooth scrolling, mobile menu toggle, and back-to-top functionality.
*   **Font Awesome:**  Used for icons.

## File Structure

*   `index.html`: The main HTML file containing the website content.
*   `app.js`:  JavaScript file containing the smooth scrolling, mobile menu, and back-to-top button logic.
*   `icon.png`:  The website favicon.
*   `dev.png`: The developer image in the introduction section.

## JavaScript Functionality (app.js)

The `app.js` file implements the following functionalities:

*   **Smooth Scrolling:**
    *   Selects all navigation links that point to anchor tags (`#`).
    *   Attaches a click event listener to each link.
    *   Prevents the default jump behavior of the anchor tag.
    *   Retrieves the target element's ID from the link's `href` attribute.
    *   Smoothly scrolls the page to the target element using `window.scrollTo()` with `behavior: 'smooth'`.
    *   Includes an offset to account for the navbar height.
    *   Optional: Closes the mobile menu if it's open after clicking a link.

*   **Mobile Menu Toggle:**
    *   Selects the mobile menu button and the mobile menu element.
    *   Attaches a click event listener to the mobile menu button.
    *   Toggles the `hidden` class on the mobile menu element to show/hide it.

*   **Back to Top Button:**
    *   Selects the back-to-top button element.
    *   Attaches a scroll event listener to the window.
    *   Checks the vertical scroll position (`window.scrollY`).
    *   If the scroll position is greater than a threshold (200px in this case), removes the `hidden` class from the back-to-top button to make it visible.
    *   Otherwise, adds the `hidden` class to hide the button.
    *   Attaches a click event listener to the back-to-top button.
    *   Smoothly scrolls the page back to the top using `window.scrollTo()` with `behavior: 'smooth'`.

## Customization

*   **Content:** Modify the text, images, and project descriptions in `index.html` to reflect your own information.
*   **Styling:** Adjust the Tailwind CSS classes in `index.html` to customize the website's appearance.
*   **JavaScript:**  Modify the `app.js` file to adjust scrolling behavior, add new features, or integrate with other services.  For example, change the offset for the smooth scrolling to account for different navbar heights.
