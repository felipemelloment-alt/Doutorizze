import { useState, useEffect } from "react";

export function useIBGECidades(uf) {
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCidades([]);
      return;
    }

    setLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`)
      .then(res => res.json())
      .then(data => {
        setCidades(data.map(c => c.nome).sort());
        setLoading(false);
      })
      .catch(() => {
        setCidades([]);
        setLoading(false);
      });
  }, [uf]);

  return { cidades, loading };
}