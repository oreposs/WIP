// ================================
// MAIN SLIDER (TOP SECTION)
// ================================
const slides = document.querySelectorAll(".slide");
const nextBtn = document.querySelector(".next-btn");
const prevBtn = document.querySelector(".prev-btn");

let index = 0;

function showSlide(i) {
  slides.forEach(slide => slide.classList.remove("active"));
  slides[i].classList.add("active");
}

nextBtn.addEventListener("click", () => {
  index = (index + 1) % slides.length;
  showSlide(index);
});

prevBtn.addEventListener("click", () => {
  index = (index - 1 + slides.length) % slides.length;
  showSlide(index);
});


// ================================
// GALLERY SLIDER (BOTTOM SECTION)
// ================================
const galleryTrack = document.querySelector(".gallery-track");
const galleryNext = document.getElementById("next");
const galleryPrev = document.getElementById("prev");

let slidesG = document.querySelectorAll(".gallery-slide");
let indexG = 1;

// Clone slides
const firstClone = slidesG[0].cloneNode(true);
const lastClone = slidesG[slidesG.length - 1].cloneNode(true);

firstClone.id = "first-clone";
lastClone.id = "last-clone";

galleryTrack.appendChild(firstClone);
galleryTrack.insertBefore(lastClone, slidesG[0]);

slidesG = document.querySelectorAll(".gallery-slide");
const sizeG = 100; // 100vw

galleryTrack.style.transform = `translateX(-${indexG * sizeG}vw)`;

// NEXT
galleryNext.addEventListener("click", () => {
    if (indexG >= slidesG.length - 1) return;
    indexG++;
    galleryTrack.style.transition = "transform 0.6s ease";
    galleryTrack.style.transform = `translateX(-${indexG * sizeG}vw)`;
});

// PREV
galleryPrev.addEventListener("click", () => {
    if (indexG <= 0) return;
    indexG--;
    galleryTrack.style.transition = "transform 0.6s ease";
    galleryTrack.style.transform = `translateX(-${indexG * sizeG}vw)`;
});

// RESET AFTER CLONES
galleryTrack.addEventListener("transitionend", () => {
    if (slidesG[indexG].id === "first-clone") {
        galleryTrack.style.transition = "none";
        indexG = 1;
        galleryTrack.style.transform = `translateX(-${indexG * sizeG}vw)`;
    }
    if (slidesG[indexG].id === "last-clone") {
        galleryTrack.style.transition = "none";
        indexG = slidesG.length - 2;
        galleryTrack.style.transform = `translateX(-${indexG * sizeG}vw)`;
    }
});
