'use client';
export default function ScriptForLegalDocument({ offset }: { offset: number }) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){
 

  const links = Array.from(document.querySelectorAll('.sf-ldoc__link'));
  const sections = Array.from(document.querySelectorAll('.sf-ldoc__section'));

  // Smooth scroll
  links.forEach(a=>{
    a.addEventListener('click', function(e){
      const id = this.getAttribute('data-target');
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null,'','#'+id);
    });
  });

  let lastActiveId = null; // track the last active section

function setActive(id){
  if(lastActiveId === id) return; // do nothing if the same section is still active
  lastActiveId = id;

  // remove Tailwind utility classes first
  links.forEach(l=>{
    l.classList.remove('active','bg-[#010663]','text-white','ring-1','ring-slate-900');
  });

  const to = links.find(l=>l.getAttribute('data-target')===id);
  if(to){
    // add Tailwind classes only
    to.classList.add('active','bg-[#010663]','text-white','ring-1','ring-slate-900');

    // Only for horizontal mobile scroll
    const container = to.closest('ul');
    if(container && window.innerWidth < 768){
      const containerRect = container.getBoundingClientRect();
      const linkRect = to.getBoundingClientRect();
      const offset = linkRect.left - containerRect.left - containerRect.width/2 + linkRect.width/2;

      container.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  }
}


  if(location.hash){
    const id = location.hash.replace('#','');
    setActive(id);
  }
  let ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(()=>{
      const topEdge = 1;
      let currentId = sections[0]?.id;
      for(const sec of sections){
        const rect = sec.getBoundingClientRect();
        if(rect.top <= topEdge) currentId = sec.id; else break;
      }
      if(currentId) setActive(currentId);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();`,
      }}
    />
  );
}

