'use client';
import { Suspense } from "react";
export default function ScriptForLegalDocument({ offset }: { offset: number }) {
  return (
    <Suspense>
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

  function setActive(id){
    // remove Tailwind utility classes first
    links.forEach(l=>{
      l.classList.remove('active','bg-[#010663]','text-white','ring-1','ring-slate-900');
    });
    const to = links.find(l=>l.getAttribute('data-target')===id);
    if(to){
      // add Tailwind classes only
      to.classList.add('active','bg-[#010663]','text-white','ring-1','ring-slate-900');
    }
  }

  if(location.hash){
    const id = location.hash.replace('#','');
    setActive(id);
  }
s
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
    </Suspense>
  );
}