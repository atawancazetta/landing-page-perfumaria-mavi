const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
const header = document.querySelector(".header");

function updateMobileMenuPosition() {
  if (window.innerWidth > 720 || !header) return;
  const menuTop = Math.max(0, header.getBoundingClientRect().bottom);
  document.documentElement.style.setProperty("--mobile-menu-top", `${menuTop}px`);
}

function closeMenu() {
  nav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menu");
}

menuButton?.addEventListener("click", () => {
  updateMobileMenuPosition();
  const open = nav.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.querySelectorAll("a").forEach((item) => {
      item.classList.remove("is-active");
      item.removeAttribute("aria-current");
    });
    link.classList.add("is-active");
    link.setAttribute("aria-current", "page");
  });
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 720) closeMenu();
  else updateMobileMenuPosition();
});
window.addEventListener("scroll", () => {
  if (nav?.classList.contains("is-open")) updateMobileMenuPosition();
}, { passive: true });

const filters = document.querySelectorAll(".filter");
const products = document.querySelectorAll(".product-card");
const productCount = document.querySelector(".product-count");
const productViewport = document.querySelector(".product-carousel__viewport");
const productCarousel = document.querySelector(".product-carousel");
const previousButton = document.querySelector(".carousel-arrow--previous");
const nextButton = document.querySelector(".carousel-arrow--next");
const productReduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let productTimer;
let productCarouselVisible = !("IntersectionObserver" in window);

function carouselDistance() {
  const visibleCard = document.querySelector(".product-card:not(.is-hidden)");
  const grid = document.querySelector(".product-grid");
  const gap = grid ? parseFloat(getComputedStyle(grid).gap) || 0 : 0;
  return visibleCard ? visibleCard.getBoundingClientRect().width + gap : 300;
}

function updateCarouselControls() {
  if (!productViewport || !previousButton || !nextButton) return;
  const maxScroll = productViewport.scrollWidth - productViewport.clientWidth;
  previousButton.disabled = productViewport.scrollLeft <= 2;
  nextButton.disabled = maxScroll <= 2 || productViewport.scrollLeft >= maxScroll - 2;
}

function advanceProductCarousel() {
  if (!productViewport) return;
  const maxScroll = productViewport.scrollWidth - productViewport.clientWidth;

  if (maxScroll <= 2) return;
  if (productViewport.scrollLeft >= maxScroll - 2) {
    productViewport.scrollTo({ left: 0, behavior: "smooth" });
  } else {
    productViewport.scrollBy({ left: carouselDistance(), behavior: "smooth" });
  }
}

function startProductAutoplay() {
  window.clearInterval(productTimer);
  if (!productCarousel || !productCarouselVisible || productReduceMotion.matches || document.hidden) return;
  productTimer = window.setInterval(advanceProductCarousel, 3200);
}

function pauseProductAutoplay() {
  window.clearInterval(productTimer);
}

previousButton?.addEventListener("click", () => {
  productViewport.scrollBy({ left: -carouselDistance(), behavior: "smooth" });
  startProductAutoplay();
});

nextButton?.addEventListener("click", () => {
  productViewport.scrollBy({ left: carouselDistance(), behavior: "smooth" });
  startProductAutoplay();
});

productViewport?.addEventListener("scroll", updateCarouselControls, { passive: true });
window.addEventListener("resize", updateCarouselControls);

productCarousel?.addEventListener("mouseenter", pauseProductAutoplay);
productCarousel?.addEventListener("mouseleave", startProductAutoplay);
productCarousel?.addEventListener("focusin", pauseProductAutoplay);
productCarousel?.addEventListener("focusout", (event) => {
  if (!productCarousel.contains(event.relatedTarget)) startProductAutoplay();
});
productCarousel?.addEventListener("touchstart", pauseProductAutoplay, { passive: true });
productCarousel?.addEventListener("touchend", startProductAutoplay, { passive: true });

if ("IntersectionObserver" in window && productCarousel) {
  const productCarouselObserver = new IntersectionObserver(([entry]) => {
    productCarouselVisible = entry.isIntersecting;
    if (productCarouselVisible) startProductAutoplay();
    else pauseProductAutoplay();
  }, { threshold: 0.25 });

  productCarouselObserver.observe(productCarousel);
}

productReduceMotion.addEventListener?.("change", startProductAutoplay);

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    const selected = button.dataset.filter;
    let visible = 0;

  products.forEach((product) => {
    const categories = product.dataset.category.split(" ");
    const show = selected === "todos" || categories.includes(selected);
    product.classList.toggle("is-hidden", !show);
    product.setAttribute("aria-hidden", String(!show));
    if (show) visible += 1;
  });

  if (productCount) {
    productCount.textContent = `${visible} ${visible === 1 ? "fragrância" : "fragrâncias"}`;
  }

  productViewport?.scrollTo({ left: 0, behavior: "smooth" });
  window.setTimeout(updateCarouselControls, 320);
  startProductAutoplay();
}

filters.forEach((button) => {
  button.addEventListener("click", () => applyProductFilter(button.dataset.filter));
});

document.querySelectorAll("[data-product-filter]").forEach((link) => {
  link.addEventListener("click", () => applyProductFilter(link.dataset.productFilter));
});

updateCarouselControls();
startProductAutoplay();

// Hero carousel
const heroCarousel = document.querySelector(".hero-carousel");
const heroSlides = [...document.querySelectorAll(".hero-slide")];
const heroDots = [...document.querySelectorAll(".hero-carousel__dots button")];
const heroPrevious = document.querySelector(".hero-carousel__arrow--previous");
const heroNext = document.querySelector(".hero-carousel__arrow--next");
const heroCounter = document.querySelector(".hero-carousel__counter b");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let heroIndex = 0;
let heroTimer;
let touchStartX = 0;

function showHeroSlide(index, restart = true) {
  if (!heroSlides.length) return;
  heroIndex = (index + heroSlides.length) % heroSlides.length;

  heroSlides.forEach((slide, slideIndex) => {
    const active = slideIndex === heroIndex;
    slide.classList.toggle("is-active", active);
    slide.setAttribute("aria-hidden", String(!active));
  });

  heroDots.forEach((dot, dotIndex) => {
    const active = dotIndex === heroIndex;
    dot.classList.toggle("is-active", active);
    dot.setAttribute("aria-selected", String(active));
    dot.setAttribute("tabindex", active ? "0" : "-1");
  });

  if (heroCounter) heroCounter.textContent = String(heroIndex + 1).padStart(2, "0");
  if (restart) startHeroAutoplay();
}

function startHeroAutoplay() {
  window.clearInterval(heroTimer);
  if (!heroCarousel || reduceMotion.matches || document.hidden) return;
  heroTimer = window.setInterval(() => showHeroSlide(heroIndex + 1, false), 4500);
}

function pauseHeroAutoplay() {
  window.clearInterval(heroTimer);
  heroCarousel?.classList.add("is-paused");
}

function resumeHeroAutoplay() {
  heroCarousel?.classList.remove("is-paused");
  startHeroAutoplay();
}

heroPrevious?.addEventListener("click", () => showHeroSlide(heroIndex - 1));
heroNext?.addEventListener("click", () => showHeroSlide(heroIndex + 1));
heroDots.forEach((dot) => {
  dot.addEventListener("click", () => showHeroSlide(Number(dot.dataset.slideTo)));
});

heroCarousel?.addEventListener("focusin", pauseHeroAutoplay);
heroCarousel?.addEventListener("focusout", (event) => {
  if (!heroCarousel.contains(event.relatedTarget)) resumeHeroAutoplay();
});
heroCarousel?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") showHeroSlide(heroIndex - 1);
  if (event.key === "ArrowRight") showHeroSlide(heroIndex + 1);
});
heroCarousel?.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
  pauseHeroAutoplay();
}, { passive: true });
heroCarousel?.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 45) showHeroSlide(heroIndex + (distance < 0 ? 1 : -1));
  resumeHeroAutoplay();
}, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseHeroAutoplay();
    pauseProductAutoplay();
  } else {
    resumeHeroAutoplay();
    startProductAutoplay();
  }
});
reduceMotion.addEventListener?.("change", startHeroAutoplay);
showHeroSlide(0);

const observer = "IntersectionObserver" in window
  ? new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 })
  : null;

document.querySelectorAll(".reveal").forEach((element) => {
  if (observer) observer.observe(element);
  else element.classList.add("is-visible");
});

const whatsappFloat = document.querySelector(".whatsapp-float");

whatsappFloat?.setAttribute("aria-expanded", "false");
whatsappFloat?.addEventListener("click", (event) => {
  if (whatsappFloat.classList.contains("is-expanded")) return;
  event.preventDefault();
  whatsappFloat.classList.add("is-expanded");
  whatsappFloat.setAttribute("aria-expanded", "true");
});

document.addEventListener("click", (event) => {
  if (!whatsappFloat?.classList.contains("is-expanded") || whatsappFloat.contains(event.target)) return;
  whatsappFloat.classList.remove("is-expanded");
  whatsappFloat.setAttribute("aria-expanded", "false");
});
