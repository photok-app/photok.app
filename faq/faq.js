const sidebarLinks = document.querySelectorAll('.faq-sidebar a');
const items = document.querySelectorAll('.faq-item');

const setActive = (id) => {
  sidebarLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  },
  { rootMargin: '-80px 0px -70% 0px' }
);

items.forEach((item) => observer.observe(item));
