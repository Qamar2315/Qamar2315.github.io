# Portfolio of Qamar Ul Islam - Software Engineer

This repository contains the source code for my personal portfolio website, showcasing my skills, projects, experience, and contact information.  It's designed to be a modern and responsive online presence, built using Tailwind CSS and JavaScript.

## Features

*   **Clean and Responsive Design:**  Utilizes Tailwind CSS for a visually appealing and responsive layout that adapts to different screen sizes.
*   **Download Resume Button:** A prominent button in the introduction allows visitors to download my resume directly.
*   **Smooth Scrolling:**  JavaScript implemented smooth scrolling to different sections of the page.
*   **Mobile-Friendly Navigation:**  A mobile menu button is included for easy navigation on smaller devices.
*   **Back to Top Button:** A button appears when scrolling down the page to allow users to quickly return to the top.
*   **Project Showcase:**  Highlights personal and freelance projects with descriptions and links.
*   **Skills Section:** Displays technical skills with relevant icons.
*   **Experience & Education Sections:**  Details my professional experience, freelance work, and educational background.
*   **Contact Information:** Provides multiple ways to get in touch.
*   **Hover Effects:** Includes subtle hover effects on project cards for enhanced user interaction.

## Technologies Used

*   **HTML:**  The foundation of the website structure.
*   **CSS:** Styling done with Tailwind CSS.
*   **JavaScript:**  Handles smooth scrolling, mobile menu toggle, and back-to-top functionality.
*   **Font Awesome:**  Used for icons.

## File Structure

*   `index.html`: The main HTML file containing the website content.
*   `app.js`:  JavaScript file containing the smooth scrolling, mobile menu, and back-to-top button logic.
*   `resume.pdf`: The resume file to be downloaded.
*   `icon.png`:  The website favicon.
*   `dev.png`: The developer image in the introduction section.

## JavaScript Functionality (app.js)

The `app.js` file implements the following functionalities:

*   **Smooth Scrolling:**
    *   Selects all navigation links that point to anchor tags (`#`).
    *   Attaches a click event listener to each link.
    *   Prevents the default jump behavior and smoothly scrolls the page to the target element.

*   **Mobile Menu Toggle:**
    *   Toggles the `hidden` class on the mobile menu element to show/hide it.

*   **Back to Top Button:**
    *   Shows a back-to-top button after the user scrolls down the page.

## Customization

*   **Content:** Modify the text, images, and project descriptions in `index.html` to reflect your own information.
*   **Styling:** Adjust the Tailwind CSS classes in `index.html` to customize the website's appearance.
*   **JavaScript:**  Modify the `app.js` file to adjust scrolling behavior or add new features.
