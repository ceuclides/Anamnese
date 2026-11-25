import { useEffect, useState } from 'react';
import { ProvedorAvisos } from './components/Avisos.tsx';
import { FichaCorporal } from './pages/FichaCorporal.tsx';
import { FichaFacial } from './pages/FichaFacial.tsx';

type Rota = 'facial' | 'corporal';

/** Rotas por hash (compatível com GitHub Pages): #/facial e #/corporal. */
function rotaAtual(): Rota {
  return window.location.hash.replace(/^#\/?/, '').startsWith('corporal') ? 'corporal' : 'facial';
}

export default function App() {
  const [rota, setRota] = useState<Rota>(rotaAtual);

  useEffect(() => {
    const aoMudar = () => {
      setRota(rotaAtual());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, []);

  useEffect(() => {
    document.title = `Ficha de Anamnese ${rota === 'facial' ? 'Facial' : 'Corporal'} · Clínica-Escola Senac`;
  }, [rota]);

  return <ProvedorAvisos>{rota === 'corporal' ? <FichaCorporal key="corporal" /> : <FichaFacial key="facial" />}</ProvedorAvisos>;
}
