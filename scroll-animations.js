// Intersection Observer for scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // Add animate class when element enters viewport
      entry.target.classList.add('animate');
    }
  });
}, observerOptions);

// Function to set up animations
function setupAnimations() {
  // Animate all images (except logo)
  const images = document.querySelectorAll('img:not(.rotating-logo)');
  images.forEach((img) => {
    if (!img.classList.contains('fade-in')) {
      img.classList.add('fade-in');
    }
    observer.observe(img);
  });

  // Animate headings
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading) => {
    if (!heading.classList.contains('fade-in-up')) {
      heading.classList.add('fade-in-up');
    }
    observer.observe(heading);
  });

  // Animate paragraphs
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (!p.classList.contains('fade-in-up')) {
      p.classList.add('fade-in-up');
    }
    observer.observe(p);
  });

  // Animate specific items with stagger
  const items = document.querySelectorAll('.gallery-item, .service-item, .portfolio-item, .box, .couple-gallery-item, .cta-box');
  items.forEach((item, index) => {
    if (!item.classList.contains('fade-in-up')) {
      item.classList.add('fade-in-up');
      item.classList.add(`delay-${Math.min(index + 1, 5)}`);
    }
    observer.observe(item);
  });

  // Animate hero content
  const heroContent = document.querySelectorAll('.home-content, .couple-hero-content, .portfolio-content, .contact-page-hero-content');
  heroContent.forEach((content) => {
    const heading = content.querySelector('h1, h2');
    const text = content.querySelector('p');
    const button = content.querySelector('a');

    if (heading && !heading.classList.contains('fade-in-down')) {
      heading.classList.add('fade-in-down');
      observer.observe(heading);
    }
    if (text && !text.classList.contains('fade-in-up')) {
      text.classList.add('fade-in-up');
      observer.observe(text);
    }
    if (button && !button.classList.contains('fade-in-up')) {
      button.classList.add('fade-in-up');
      observer.observe(button);
    }
  });

  // Animate buttons (exclude navigation and control buttons)
  const buttons = document.querySelectorAll('button:not(.nav-btn, .arrow, .fc-button-primary, #prev, #next, .bottom-nav button)');
  buttons.forEach((btn) => {
    if (!btn.classList.contains('fade-in')) {
      btn.classList.add('fade-in');
    }
    observer.observe(btn);
  });

  // Animate dividers and special sections
  const dividers = document.querySelectorAll('.divider-section, .black-bar, .work-divider');
  dividers.forEach((divider) => {
    if (!divider.classList.contains('fade-in')) {
      divider.classList.add('fade-in');
    }
    observer.observe(divider);
  });
}

// Initialize animations on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  setupAnimations();
});
