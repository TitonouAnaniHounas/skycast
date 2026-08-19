export function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal')
  if (elements.length === 0) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15 }
  )

  elements.forEach((el) => observer.observe(el))
}