import { useEffect, useState } from 'preact/hooks';

function useOnline(): boolean {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  return online;
}

/** Shows offline mode and how many answers still have to be sent (offline-access spec). */
export function OfflineBanner({ pending }: { pending: number }) {
  const online = useOnline();
  if (online && pending === 0) return null;
  const answers = `${pending} ${pending === 1 ? 'antwoord wordt' : 'antwoorden worden'} later bewaard`;
  return (
    <div class="banner top" role="status">
      {online ? `Bezig met opslaan · ${answers}` : pending > 0 ? `Offline · ${answers}` : 'Offline · je kunt gewoon verder oefenen'}
    </div>
  );
}
