let slideIndex = 1;
let slideTimer = null;

document.addEventListener('DOMContentLoaded', function() {
    initDropdowns();
    handleHeaderFade();
    initServiceSlider();
    initGalleryCarousel();
});

function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const serviceItem = this.closest('.service-item');
            const dropdown = serviceItem.querySelector('.dropdown');
            
            dropdown.classList.toggle('open');
            this.classList.toggle('active', dropdown.classList.contains('open'));
        });
    });
}

function handleHeaderFade() {
    window.addEventListener('scroll', function() {
        const servicessSection = document.querySelector('.servicess');
        const header = document.querySelector('header');
        
        if (servicessSection && header) {
            const halfwayPoint = servicessSection.offsetHeight / 2;
            const scrollPosition = window.scrollY;
            
            if (scrollPosition >= halfwayPoint) {
                header.style.opacity = '0';
                header.style.pointerEvents = 'none';
            } else {
                header.style.opacity = '1';
                header.style.pointerEvents = 'auto';
            }
        }
    });
}

function initServiceSlider() {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

    if (!slides.length || !dots.length) {
        return;
    }

    showSlides(slideIndex);
    if (!slideTimer) {
        slideTimer = setInterval(() => {
            slideIndex++;
            showSlides(slideIndex);
        }, 5000);
    }
}

function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
}

function showSlides(n) {
    const slides = document.getElementsByClassName("slide");
    const dots = document.getElementsByClassName("dot");

    if (!slides.length || !dots.length) {
        return;
    }

    if (n > slides.length) { slideIndex = 1; }
    if (n < 1) { slideIndex = slides.length; }

    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    for (let i = 0; i < dots.length; i++) {
        dots[i].classList.remove("active");
    }

    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].classList.add("active");
}

function inquire() {
    const formBox = document.getElementById("form-box");
    if (formBox) {
        formBox.scrollIntoView({ behavior: "smooth" });
    }
}

function initGalleryCarousel() {
    const galleryTrack = document.querySelector('.gallery-track');
    const gallerySlides = galleryTrack ? galleryTrack.querySelectorAll('.gallery-slide') : [];
    const galleryNextBtn = document.getElementById('next');
    const galleryPrevBtn = document.getElementById('prev');

    if (!galleryTrack || gallerySlides.length === 0 || !galleryNextBtn || !galleryPrevBtn) {
        return;
    }

    const firstClone = gallerySlides[0].cloneNode(true);
    const lastClone = gallerySlides[gallerySlides.length - 1].cloneNode(true);
    galleryTrack.appendChild(firstClone);
    galleryTrack.insertBefore(lastClone, gallerySlides[0]);

    const allSlides = galleryTrack.querySelectorAll('.gallery-slide');
    const totalSlides = allSlides.length;
    let galleryCurrentIndex = 1;
    let galleryIsTransitioning = false;

    galleryTrack.style.transition = 'none';
    galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * 100}%)`;

    galleryNextBtn.addEventListener('click', () => {
        if (galleryIsTransitioning) return;
        galleryIsTransitioning = true;
        galleryTrack.style.transition = 'transform 0.6s ease-in-out';
        galleryCurrentIndex++;
        galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * 100}%)`;
        setTimeout(() => {
            if (galleryCurrentIndex === totalSlides - 1) {
                galleryTrack.style.transition = 'none';
                galleryCurrentIndex = 1;
                galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * 100}%)`;
            }
            galleryIsTransitioning = false;
        }, 600);
    });

    galleryPrevBtn.addEventListener('click', () => {
        if (galleryIsTransitioning) return;
        galleryIsTransitioning = true;
        galleryTrack.style.transition = 'transform 0.6s ease-in-out';
        galleryCurrentIndex--;
        galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * 100}%)`;
        setTimeout(() => {
            if (galleryCurrentIndex === 0) {
                galleryTrack.style.transition = 'none';
                galleryCurrentIndex = totalSlides - 2;
                galleryTrack.style.transform = `translateX(-${galleryCurrentIndex * 100}%)`;
            }
            galleryIsTransitioning = false;
        }, 600);
    });
}


/* FAQ */

const faqPageQuestionItems = document.querySelectorAll('.faq-page-question-item');
faqPageQuestionItems.forEach(item => {
    const question = item.querySelector('.faq-page-question-btn');
    question.addEventListener('click', () => {

        faqPageQuestionItems.forEach(i => {
            if (i !== item) {
                i.classList.remove('active');
                i.querySelector('.faq-page-question-answer').style.maxHeight = null;
            }
        });

        item.classList.toggle('active');

        const answer = item.querySelector('.faq-page-question-answer');
        if (item.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
        }
    });
});

/*animation on services*/

/*portfolio*/

const buttons = document.querySelectorAll(".filter-btn");
const items = document.querySelectorAll(".item");

buttons.forEach(btn => {
  btn.addEventListener("click", () => {

    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.getAttribute("data-filter");

    items.forEach(item => {
      const matches = (filter === "all") || item.classList.contains(filter);
      if (matches) {
        item.style.display = ""; 
      } else {

        const v = item.querySelector("video");
        if (v && !v.paused) {
          try { v.pause(); } catch(e){ /* ignore */ }
        }
        item.style.display = "none";
      }
    });
  });
});

buttons.forEach(btn => {
  btn.tabIndex = 0;
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      btn.click();
    }
  });
});

//////Message Us Form//////
// Initialize EmailJS globally
if (typeof emailjs !== 'undefined' && typeof emailjs.init === 'function') {
  emailjs.init('xQBEAZNuef1fTyzAl');
} else {
  console.warn('EmailJS library not loaded yet.');
}

// Expose sendEmail globally so HTML form can call it
function sendEmail() {
  const fullName = document.getElementById('full-name')?.value.trim() || '';
  const email = document.getElementById('email')?.value.trim() || '';
  const phone = document.getElementById('phone')?.value.trim() || '';
  const notes = document.getElementById('notes')?.value.trim() || '';
  const statusEl = document.getElementById('status');

  if (!fullName || !email || !notes) {
    if (statusEl) {
      statusEl.textContent = 'Please fill required fields.';
      statusEl.style.color = 'red';
    }
    return false;
  }

  const templateParams = {
    fullName: fullName,
    email: email,
    phone: phone,
    message_notes: notes
  };

  return emailjs.send('service_jz2klhw', 'template_kio8nx3', templateParams)
    .then(() => {
      if (statusEl) {
        statusEl.textContent = 'Message sent — thank you.';
        statusEl.style.color = 'green';
      }
      document.getElementById('contact-form')?.reset();
      return true;
    })
    .catch((err) => {
      if (statusEl) {
        statusEl.textContent = 'Failed to send — try again later.';
        statusEl.style.color = 'red';
      }
      console.error('EmailJS error', err);
      return false;
    });
}

// Setup form submission handler on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const submitButton = form?.querySelector('button[type="submit"]');

  // Prefill form fields from URL query parameters
  function prefillFromQuery() {
    const params = new URLSearchParams(window.location.search);

    const fullNameParam = params.get('fullName') || params.get('full_name') || params.get('name') || '';
    if (fullNameParam && document.getElementById('full-name')) {
      document.getElementById('full-name').value = fullNameParam;
    }

    const email = params.get('email') || '';
    if (email && document.getElementById('email')) {
      document.getElementById('email').value = email;
    }

    const phone = params.get('phone') || params.get('phoneNumber') || params.get('tel') || '';
    if (phone && document.getElementById('phone')) {
      document.getElementById('phone').value = phone;
    }

    const notes = params.get('message_notes') || params.get('notes') || params.get('message') || '';
    if (notes && document.getElementById('notes')) {
      document.getElementById('notes').value = notes;
    }
  }

  prefillFromQuery();

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      Promise.resolve(sendEmail())
        .finally(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
          }
        });
    });
  }
});
