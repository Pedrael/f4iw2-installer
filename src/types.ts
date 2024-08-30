export type CDNAddress = {
  name: string
  short_name: string
  URI: string
}

export enum CDNNames {
  Nexus = 'Nexus CDN',
  Amsterdam = 'Amsterdam',
  Prague = 'Prague',
  Chicago = 'Chicago',
  LA = 'Los Angeles',
  Miami = 'Miami',
}

export type Mod = {
  mod_id: string
  id: string
}

export type ModsList = {
  domain_name: string
  mods_list: Mod[]
}
