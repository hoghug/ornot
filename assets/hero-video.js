/* Hero media loader.

   Same lazy/breakpoint-templated loading as video-banner-media, but this one
   also swaps the live video when the viewport crosses the mobile/desktop
   breakpoint (video-banner-media deliberately does not, to avoid a second
   download on resize — hero needs a live swap instead). */
(function () {
  'use strict';

  var MOBILE = '(max-width: 749px)';
  var REDUCED = '(prefers-reduced-motion: reduce)';

  if (customElements.get('hero-video')) return;

  customElements.define(
    'hero-video',
    class extends HTMLElement {
      connectedCallback() {
        if (this.hydrated) return;

        if (window.matchMedia && window.matchMedia(REDUCED).matches) {
          this.cleanup();
          return;
        }

        this.mql = window.matchMedia(MOBILE);
        this.onChange = this.onChange.bind(this);

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              this.observer.unobserve(entry.target);
              this.hydrated = true;
              this.render(this.mql.matches ? 'mobile' : 'desktop');
              this.mql.addEventListener('change', this.onChange);
            });
          },
          { rootMargin: '400px' }
        );

        this.observer.observe(this);
      }

      onChange(event) {
        this.render(event.matches ? 'mobile' : 'desktop');
      }

      render(wanted) {
        if (this.current === wanted) return;

        var template =
          this.querySelector('template[data-video="' + wanted + '"]') ||
          this.querySelector('template[data-video]');
        if (!template) return;

        this.current = wanted;

        var fragment = template.content.cloneNode(true);
        var next = fragment.querySelector('video');
        var previous = this.video;

        this.appendChild(fragment);
        this.video = next;

        var reveal = () => this.classList.add('is-ready');
        if (next.readyState >= 2) reveal();
        else next.addEventListener('loadeddata', reveal, { once: true });

        var attempt = next.play();
        if (attempt && attempt.catch) {
          attempt.catch(() => {
            reveal();
            var start = () => next.play().catch(() => {});
            document.addEventListener('click', start, { once: true, passive: true });
            document.addEventListener('touchstart', start, { once: true, passive: true });
          });
        }

        if (previous) previous.remove();

        if (this.playObserver) this.playObserver.disconnect();
        this.playObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) this.video.play().catch(() => {});
            else this.video.pause();
          });
        });
        this.playObserver.observe(this.video);
      }

      cleanup() {
        this.querySelectorAll('template[data-video]').forEach((node) => node.remove());
      }

      disconnectedCallback() {
        if (this.observer) this.observer.disconnect();
        if (this.playObserver) this.playObserver.disconnect();
        if (this.mql) this.mql.removeEventListener('change', this.onChange);
      }
    }
  );
})();
