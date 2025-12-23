/**
 * CAMADA DE ABSTRACAO DE API
 *
 * Facilita migracao futura do Base44 para outro backend.
 * Hoje usa Base44, amanha pode ser Supabase, Firebase, etc.
 */

import { base44 } from '@/api/base44Client';

export const professionals = {
  list: () => base44.entities.Professional.list(),
  get: (id) => base44.entities.Professional.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.Professional.create(data),
  update: (id, data) => base44.entities.Professional.update(id, data),
  delete: (id) => base44.entities.Professional.delete(id),
  filter: (query) => base44.entities.Professional.filter(query),
};

export const clinicas = {
  list: () => base44.entities.CompanyUnit.list(),
  get: (id) => base44.entities.CompanyUnit.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.CompanyUnit.create(data),
  update: (id, data) => base44.entities.CompanyUnit.update(id, data),
  filter: (query) => base44.entities.CompanyUnit.filter(query),
};

export const jobs = {
  list: () => base44.entities.Job.list(),
  get: (id) => base44.entities.Job.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.Job.create(data),
  update: (id, data) => base44.entities.Job.update(id, data),
  filter: (query) => base44.entities.Job.filter(query),
};

export const matches = {
  list: () => base44.entities.JobMatch.list(),
  get: (id) => base44.entities.JobMatch.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.JobMatch.create(data),
  update: (id, data) => base44.entities.JobMatch.update(id, data),
  filter: (query) => base44.entities.JobMatch.filter(query),
};

export const ratings = {
  list: () => base44.entities.Rating.list(),
  create: (data) => base44.entities.Rating.create(data),
  filter: (query) => base44.entities.Rating.filter(query),
};

export const substituicoes = {
  list: () => base44.entities.SubstituicaoUrgente.list(),
  get: (id) => base44.entities.SubstituicaoUrgente.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.SubstituicaoUrgente.create(data),
  update: (id, data) => base44.entities.SubstituicaoUrgente.update(id, data),
  filter: (query) => base44.entities.SubstituicaoUrgente.filter(query),
};

export const marketplace = {
  list: () => base44.entities.MarketplaceItem.list(),
  get: (id) => base44.entities.MarketplaceItem.filter({ id }).then(res => res[0]),
  create: (data) => base44.entities.MarketplaceItem.create(data),
  update: (id, data) => base44.entities.MarketplaceItem.update(id, data),
  filter: (query) => base44.entities.MarketplaceItem.filter(query),
};

export const auth = {
  me: () => base44.auth.me(),
  logout: () => base44.auth.logout(),
  isAuthenticated: () => base44.auth.isAuthenticated(),
};

export const api = {
  professionals,
  clinicas,
  jobs,
  matches,
  ratings,
  substituicoes,
  marketplace,
  auth,
};

export default api;