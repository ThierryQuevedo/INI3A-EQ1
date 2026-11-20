// geocodificacao pelo nominatim (openstreetmap); so no servidor
const NOMINATIM = 'https://nominatim.openstreetmap.org';
const CABECALHOS = {
  // a politica do nominatim exige um user-agent que identifique o app
  'User-Agent': 'MarcaAi/1.0 (agendamento de servicos)',
  'Accept-Language': 'pt-BR',
};
const TEMPO_LIMITE_MS = 8000;

async function consultar(caminho, parametros) {
  const url = new URL(caminho, NOMINATIM);
  for (const [chave, valor] of Object.entries({ format: 'jsonv2', ...parametros })) {
    url.searchParams.set(chave, String(valor));
  }
  const resposta = await fetch(url, {
    headers: CABECALHOS,
    signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    cache: 'no-store',
  });
  if (!resposta.ok) throw new Error(`Nominatim respondeu ${resposta.status}`);
  return resposta.json();
}

// "BR-SP" -> "SP"
function siglaEstado(endereco) {
  const iso = endereco['ISO3166-2-lvl4'];
  if (iso?.startsWith('BR-')) return iso.slice(3);
  return endereco.state || '';
}

// monta "Rua X, 123 - Bairro, Cidade - UF" com o que vier
function formatarEndereco(endereco = {}) {
  const rua = [endereco.road, endereco.house_number].filter(Boolean).join(', ');
  const bairro = endereco.suburb || endereco.neighbourhood || endereco.quarter || '';
  const cidade = endereco.city || endereco.town || endereco.village || endereco.municipality || '';
  const uf = siglaEstado(endereco);

  const local = [rua, bairro].filter(Boolean).join(' - ');
  const regiao = [cidade, uf].filter(Boolean).join(' - ');
  return [local, regiao].filter(Boolean).join(', ');
}

// texto -> { latitude, longitude } ou null quando nao encontra
export async function geocodificarEndereco(texto) {
  const resultados = await consultar('/search', { q: texto, countrycodes: 'br', limit: 1 });
  const primeiro = resultados?.[0];
  if (!primeiro) return null;
  const latitude = Number(primeiro.lat);
  const longitude = Number(primeiro.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

// coordenadas -> texto do endereco ou null
export async function enderecoDasCoordenadas(latitude, longitude) {
  const resultado = await consultar('/reverse', { lat: latitude, lon: longitude, zoom: 18, addressdetails: 1 });
  if (!resultado || resultado.error) return null;
  return formatarEndereco(resultado.address) || resultado.display_name || null;
}
