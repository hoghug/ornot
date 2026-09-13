/* Video banner media loader.

   Two <template> elements are emitted, one per breakpoint. Content inside a
   <template> is inert: the browser parses it but fetches nothing. We clone
   exactly one of them into the live DOM, so a phone never downloads the
   desktop file and a desktop never downloads the mobile file.

   Hydration waits for the section to approach the viewport, so no video bytes
   are requested for a banner the visitor never scrolls to.

   The breakpoint is resolved once, at hydration. We deliberately do not swap on
   resize or rotation: swapping would download a second file for no visual gain. */
(function () {
  'use strict';

  var MOBILE = '(max-width: 749px)';
  var REDUCED = '(prefers-reduced-motion: reduce)';

  if (customElements.get('video-banner-media')) return;

  customElements.define(
    'video-banner-media',
    class extends HTMLElement {
      connectedCallback() {
        if (this.hydrated) return;

        // Respect a reduced-motion preference by leaving the poster in place.
        if (window.matchMedia && window.matchMedia(REDUCED).matches) {
          this.cleanup();
          return;
        }

        var wanted = window.matchMedia(MOBILE).matches ? 'mobile' : 'desktop';
        this.template =
          this.querySelector('template[data-video="' + wanted + '"]') ||
          this.querySelector('template[data-video]');

        if (!this.template) return;

        this.observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              this.observer.unobserve(entry.target);
              this.render();
            });
          },
          { rootMargin: '400px' }
        );

        this.observer.observe(this);
      }

      render() {
        if (this.hydrated) return;
        this.hydrated = true;

        var fragment = this.template.content.cloneNode(true);
        this.cleanup();
        this.appendChild(fragment);

        this.video = this.querySelector('video');
        if (!this.video) return;

        var reveal = () => this.classList.add('is-ready');
        if (this.video.readyState >= 2) reveal();
        else this.video.addEventListener('loadeddata', reveal, { once: true });

        var attempt = this.video.play();
        if (attempt && attempt.catch) {
          // Autoplay can be refused on low power mode. Show the video anyway
          // and start it on the visitor's first interaction.
          attempt.catch(() => {
            reveal();
            var start = () => this.video.play().catch(() => {});
            document.addEventListener('click', start, { once: true, passive: true });
            document.addEventListener('touchstart', start, { once: true, passive: true });
          });
        }

        this.watchVisibility();
      }

      // Pause when scrolled away so the banner is not decoding off-screen.
      watchVisibility() {
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
      }
    }
  );
})();
