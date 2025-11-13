const fetch = require('node-fetch');

module.exports = async function fetchCEP(cep){
  if(!cep) return null;
  cep = cep.replace(/\D/g,'');
  const url = `https://brasilapi.com.br/api/cep/v2/${cep}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    cep: data.cep,
    street: data.street,
    neighborhood: data.neighborhood,
    city: data.city,
    state: data.state,
    location: data.location
  };
};
