export const loadGoogleMapsApi = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            if (window.google?.maps?.Geocoder) {
                resolve();
                return;
            } else {
                existingScript.addEventListener('load', () => resolve());
                existingScript.addEventListener('error', () => reject(new Error('Script existente falhou')));
            }
            return;
        }

        const apiKey = import.meta.env.VITE_MAPS_API_KEY;
        if (!apiKey) {
            reject(new Error('Chave da API não encontrada'));
            return;
        }

        const callbackName = `gmapsCallback_${Date.now()}`;
        (window as any)[callbackName] = () => {
            resolve();
            delete (window as any)[callbackName];
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&v=beta&_fn=1&callback=${callbackName}`;
        script.async = true;
        script.defer = true;
        script.onerror = () => reject(new Error('Falha ao carregar a API'));

        document.head.appendChild(script);
    });
};