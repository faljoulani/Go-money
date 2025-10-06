'use client';
import { useEffect } from 'react';

export default function ScriptForLegalDocument({ offset }: { offset: number }) {
  useEffect(() => {
    // Wait for DOM to be fully ready
    const initializeLegalDoc = () => {
      const links = Array.from(document.querySelectorAll('.sf-ldoc__link'));
      const sections = Array.from(document.querySelectorAll('.sf-ldoc__section'));

      // If elements aren't ready yet, try again after a short delay
      if (links.length === 0 || sections.length === 0) {
        setTimeout(initializeLegalDoc, 100);
        return;
      }

      // Shared offset for sticky header
      const HEADER_OFFSET = 50;
      const HEADER_Y_OFFSET = 120;

      // Clean up any existing event listeners
      const cleanup = () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };

      let lastActiveId = null; // track the last active section

      function setActive(id) {
        if (lastActiveId === id) return; // do nothing if the same section is still active
        lastActiveId = id;

        // remove Tailwind utility classes first
        links.forEach((l) => {
          l.classList.remove('active', 'bg-primaryAlt', 'text-secondary', 'ring-1', 'ring-slate-900');
        });

        const to = links.find((l) => l.getAttribute('data-target') === id);
        if (to) {
          // add Tailwind classes only
          to.classList.add('active', 'bg-primaryAlt', 'text-secondary', 'ring-1', 'ring-slate-900');

          // Only for horizontal mobile scroll
          const container = to.closest('ul');
          if (container && window.innerWidth < 768) {
            const containerRect = container.getBoundingClientRect();
            const linkRect = to.getBoundingClientRect();
            const offset =
              linkRect.left - containerRect.left - containerRect.width / 2 + linkRect.width / 2;

            container.scrollBy({
              left: offset,
              behavior: 'smooth',
            });
          }
        }
      }

      // Smooth scroll
      links.forEach((a) => {
        const handleClick = function (e) {
          const id = this.getAttribute('data-target');
          const el = document.getElementById(id);
          if (!el) return;
          e.preventDefault();
          // Offset to ensure the section title is fully visible below any sticky header
          if (window.innerWidth < 768) {
            const y = el.getBoundingClientRect().top + window.scrollY - HEADER_Y_OFFSET;
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
          history.replaceState(null, '', '#' + id);
        };

        a.addEventListener('click', handleClick);
      });

      // Check initial hash
      if (location.hash) {
        const id = location.hash.replace('#', '');
        setTimeout(() => setActive(id), 100); // Small delay to ensure everything is rendered
      }

      let ticking = false;
      function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const topEdge = window.innerWidth < 768 ? HEADER_Y_OFFSET : HEADER_OFFSET;
          let currentId = sections[0]?.id;
          for (const sec of sections) {
            const rect = sec.getBoundingClientRect();
            if (rect.top <= topEdge) currentId = sec.id;
            else break;
          }
          if (currentId) setActive(currentId);
          ticking = false;
        });
      }

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);

      // Initial scroll check
      setTimeout(() => onScroll(), 200);

      // Return cleanup function
      return cleanup;
    };

    // Initialize after a short delay to ensure DOM is ready
    const cleanup = initializeLegalDoc();

    // Cleanup on unmount
    return cleanup;
  }, []); // Empty dependency array means this runs once when component mounts

  return null; // No need to render anything
}

 