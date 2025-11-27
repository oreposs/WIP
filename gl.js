const slides = document.querySelectorAll('.slide');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

let currentSlide = 0;
let originalBackgrounds = [];
let isTransitioning = false;
let thumbnailQueues = {}; 

if (slides.length > 0) {
  window.addEventListener('DOMContentLoaded', () => {
    slides.forEach((slide, slideIndex) => {
      const computedStyle = window.getComputedStyle(slide);
      originalBackgrounds[slideIndex] = computedStyle.backgroundImage;

      const thumbnailContainer = slide.querySelector('.thumbnails');
      if (thumbnailContainer) {
        const thumbImages = Array.from(thumbnailContainer.querySelectorAll('img'));
        thumbnailQueues[slideIndex] = thumbImages.map(img => ({
          src: img.src,
          bgUrl: img.dataset.bg
        }));
        renderThumbnails(slideIndex);
      }
    });

    if (slides[0]) slides[0].classList.add('active');
  });
}

function renderThumbnails(slideIndex) {
  const slide = slides[slideIndex];
  const thumbnailContainer = slide.querySelector('.thumbnails');
  if (!thumbnailContainer || !thumbnailQueues[slideIndex]) return;

  const queue = thumbnailQueues[slideIndex];
  thumbnailContainer.innerHTML = '';
  const visibleCount = Math.min(3, queue.length);

  for (let i = 0; i < visibleCount; i++) {
    const thumbData = queue[i];
    const img = document.createElement('img');
    img.src = thumbData.src;
    img.dataset.bg = thumbData.bgUrl;
    img.dataset.queueIndex = i;

    img.style.opacity = '0';
    img.style.transform = 'translateX(20px)';
    thumbnailContainer.appendChild(img);

    setTimeout(() => {
      img.style.transition = 'all 0.3s ease';
      img.style.opacity = '1';
      img.style.transform = 'translateX(0)';
    }, i * 50);

    img.addEventListener('click', (e) => handleThumbnailClick(e, slideIndex, i));
  }
}

function handleThumbnailClick(e, slideIndex, queueIndex) {
  if (isTransitioning) return;
  const clickedThumb = e.target;
  const parentSlide = slides[slideIndex];
  const bgUrl = clickedThumb.dataset.bg;
  const queue = thumbnailQueues[slideIndex];
  const thumbnailContainer = parentSlide.querySelector('.thumbnails');

  clickedThumb.style.transition = 'all 0.3s ease';
  clickedThumb.style.opacity = '0';
  clickedThumb.style.transform = 'scale(0.9)';

  const clone = clickedThumb.cloneNode(true);
  const rect = clickedThumb.getBoundingClientRect();
  clone.style.position = "fixed";
  clone.style.left = rect.left + "px";
  clone.style.top = rect.top + "px";
  clone.style.width = rect.width + "px";
  clone.style.height = rect.height + "px";
  clone.style.zIndex = "-10";
  clone.style.borderRadius = "10px";
  clone.style.transition = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)";
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);
  clone.offsetHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.width = "100vw";
      clone.style.height = "100vh";
      clone.style.borderRadius = "0";
    });
  });

  setTimeout(() => {
    const allThumbs = Array.from(thumbnailContainer.querySelectorAll('img'));
    allThumbs.forEach((thumb, index) => {
      if (index > queueIndex) {
        thumb.style.transition = 'transform 0.4s ease';
        thumb.style.transform = 'translateX(-160px)';
      }
    });
    setTimeout(() => {
      const clickedItem = queue.splice(queueIndex, 1)[0];
      queue.push(clickedItem);
      renderThumbnails(slideIndex);
    }, 400);
  }, 150);

  setTimeout(() => {
    parentSlide.style.transition = "background-image 0.3s ease";
    parentSlide.style.backgroundImage = `url('${bgUrl}')`;
    clone.style.opacity = "0";
    setTimeout(() => document.body.removeChild(clone), 300);
  }, 800);
}

function resetAllSlides() {
  slides.forEach((slide) => {
    slide.classList.remove('active');
    slide.style.transition = '';
    slide.style.transform = '';
    slide.style.opacity = '';
  });
}

function showSlide(index, direction = "right") {
  if (isTransitioning) return;
  isTransitioning = true;
  const activeSlide = document.querySelector('.slide.active');
  const newSlide = slides[index];
  if (!newSlide) return;

  newSlide.style.transform = direction === "right" ? "translateX(100%)" : "translateX(-100%)";
  newSlide.classList.add('active');

  requestAnimationFrame(() => {
    if (activeSlide) {
      activeSlide.style.transition = "transform 0.6s ease";
      activeSlide.style.transform = direction === "right" ? "translateX(-100%)" : "translateX(100%)";
    }
    newSlide.style.transition = "transform 0.6s ease";
    newSlide.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    resetAllSlides();
    newSlide.classList.add('active');
    isTransitioning = false;
  }, 650);
}

if (nextBtn && prevBtn) {
  nextBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    currentSlide = (currentSlide + 1) % slides.length;
    const targetSlide = slides[currentSlide];
    if (originalBackgrounds[currentSlide]) {
      targetSlide.style.backgroundImage = originalBackgrounds[currentSlide];
    }
    showSlide(currentSlide, "right");
  });

  prevBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    const targetSlide = slides[currentSlide];
    if (originalBackgrounds[currentSlide]) {
      targetSlide.style.backgroundImage = originalBackgrounds[currentSlide];
    }
    showSlide(currentSlide, "left");
  });
}

// Handle hash navigation for couples.html
document.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.slice(1); 
  if (hash && slides.length > 0) {
    const targetSlide = document.querySelector(`#${hash}`);
    if (targetSlide) {
      const slideIndex = Array.from(slides).findIndex(slide => slide.id === hash);
      if (slideIndex !== -1 && slideIndex !== currentSlide) {
        currentSlide = slideIndex;
        resetAllSlides();
        slides[currentSlide].classList.add('active');
        if (originalBackgrounds[currentSlide]) {
          slides[currentSlide].style.backgroundImage = originalBackgrounds[currentSlide];
        }
        renderThumbnails(currentSlide);
      }
    }
  }
});

// Listen for hash changes
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash && slides.length > 0) {
    const slideIndex = Array.from(slides).findIndex(slide => slide.id === hash);
    if (slideIndex !== -1 && slideIndex !== currentSlide) {
      currentSlide = slideIndex;
      resetAllSlides();
      slides[currentSlide].classList.add('active');
      if (originalBackgrounds[currentSlide]) {
        slides[currentSlide].style.backgroundImage = originalBackgrounds[currentSlide];
      }
      renderThumbnails(currentSlide);
    }
  }
});

/*gallery couples*/

const coupleGalleryTrack = document.querySelector('.couple-gallery-track');
const coupleGallerySlides = document.querySelectorAll('.couple-gallery-slide');
const coupleGalleryNextBtn = document.getElementById('couple-next');
const coupleGalleryPrevBtn = document.getElementById('couple-prev');

if (coupleGalleryTrack && coupleGallerySlides.length > 0 && coupleGalleryNextBtn && coupleGalleryPrevBtn) {
  let coupleGalleryCurrentIndex = 1;
  let coupleGalleryIsTransitioning = false;

  const coupleGalleryFirstClone = coupleGallerySlides[0].cloneNode(true);
  const coupleGalleryLastClone = coupleGallerySlides[coupleGallerySlides.length - 1].cloneNode(true);
  coupleGalleryTrack.appendChild(coupleGalleryFirstClone);
  coupleGalleryTrack.insertBefore(coupleGalleryLastClone, coupleGallerySlides[0]);

  const coupleGalleryAllSlides = document.querySelectorAll('.couple-gallery-slide');
  const coupleGalleryTotalSlides = coupleGalleryAllSlides.length;

  coupleGalleryTrack.style.transition = 'none';
  coupleGalleryTrack.style.transform = `translateX(-${coupleGalleryCurrentIndex * 100}vw)`;

  function coupleGoToSlide(index) {
    coupleGalleryTrack.style.transition = 'transform 0.6s ease-in-out';
    coupleGalleryTrack.style.transform = `translateX(-${index * 100}vw)`;
  }

  coupleGalleryNextBtn.addEventListener('click', () => {
    if (coupleGalleryIsTransitioning) return;
    coupleGalleryIsTransitioning = true;
    coupleGalleryCurrentIndex++;
    coupleGoToSlide(coupleGalleryCurrentIndex);
    setTimeout(() => {
      if (coupleGalleryCurrentIndex === coupleGalleryTotalSlides - 1) {
        requestAnimationFrame(() => {
          coupleGalleryTrack.style.transition = 'none';
          coupleGalleryCurrentIndex = 1;
          coupleGalleryTrack.style.transform = `translateX(-${coupleGalleryCurrentIndex * 100}vw)`;
        });
      }
      coupleGalleryIsTransitioning = false;
    }, 600);
  });

  coupleGalleryPrevBtn.addEventListener('click', () => {
    if (coupleGalleryIsTransitioning) return;
    coupleGalleryIsTransitioning = true;
    coupleGalleryCurrentIndex--;
    coupleGoToSlide(coupleGalleryCurrentIndex);
    setTimeout(() => {
     if (coupleGalleryCurrentIndex === 0) {
        requestAnimationFrame(() => {
          coupleGalleryTrack.style.transition = 'none';
          coupleGalleryCurrentIndex = coupleGalleryTotalSlides - 2;
          coupleGalleryTrack.style.transform = `translateX(-${coupleGalleryCurrentIndex * 100}vw)`;
        });
      }
      coupleGalleryIsTransitioning = false;
    }, 600);
  });
}

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
        // Close any open item
        faqItems.forEach(i => {
            if (i !== item) {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            }
        });

        // Toggle current item
        item.classList.toggle('active');

        const answer = item.querySelector('.faq-answer');
        if (item.classList.contains('active')) {
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
        }
    });
});
