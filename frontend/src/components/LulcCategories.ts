// Land Use Land Cover (LULC) categories with their codes, names and colors
export interface LulcCategory {
  id: string;
  name: string;
  color: string;
  group: string;
}

// Map of LULC category codes to their details
export const lulcCategories: Record<string, LulcCategory> = {
  // Built-up Areas
  l01: { id: 'l01', name: 'Builtup, Urban', color: '#FF0000', group: 'Built-up' },
  l02: { id: 'l02', name: 'Builtup, Rural', color: '#FF5555', group: 'Built-up' },
  l03: { id: 'l03', name: 'Builtup, Mining', color: '#A02020', group: 'Built-up' },
  
  // Agriculture Areas
  l04: { id: 'l04', name: 'Agriculture, Crop land', color: '#FFFF00', group: 'Agriculture' },
  l05: { id: 'l05', name: 'Agriculture, Plantation', color: '#AAFF00', group: 'Agriculture' },
  l06: { id: 'l06', name: 'Agriculture, Fallow', color: '#D2CC55', group: 'Agriculture' },
  l07: { id: 'l07', name: 'Agriculture, Current Shifting Cultivation', color: '#CCAA22', group: 'Agriculture' },
  
  // Forest Areas
  l08: { id: 'l08', name: 'Forest, Evergreen/Semi evergreen', color: '#006400', group: 'Forest' },
  l09: { id: 'l09', name: 'Forest, Deciduous', color: '#228B22', group: 'Forest' },
  l10: { id: 'l10', name: 'Forest, Forest Plantation', color: '#77DD77', group: 'Forest' },
  l11: { id: 'l11', name: 'Forest, Scrub Forest', color: '#AADD66', group: 'Forest' },
  l12: { id: 'l12', name: 'Forest, Swamp/Mangroves', color: '#00A36C', group: 'Forest' },
  
  // Grasslands
  l13: { id: 'l13', name: 'Grass/Grazing', color: '#98FB98', group: 'Other Natural' },
  
  // Barren/Wastelands
  l14: { id: 'l14', name: 'Barren/Wastelands, Salt Affected land', color: '#E0E0E0', group: 'Other Natural' },
  l15: { id: 'l15', name: 'Barren/Wastelands, Gullied/Ravinous Land', color: '#D2B48C', group: 'Other Natural' },
  l16: { id: 'l16', name: 'Barren/Wastelands, Scrub land', color: '#DEB887', group: 'Other Natural' },
  l17: { id: 'l17', name: 'Barren/Wastelands, Sandy area', color: '#F5DEB3', group: 'Other Natural' },
  l18: { id: 'l18', name: 'Barren/Wastelands, Barren rocky', color: '#A9A9A9', group: 'Other Natural' },
  l19: { id: 'l19', name: 'Barren/Wastelands, Rann', color: '#C0C0C0', group: 'Other Natural' },
  
  // Wetlands/Water Bodies
  l20: { id: 'l20', name: 'Wetlands/Water Bodies, Inland Wetland', color: '#87CEEB', group: 'Wetland' },
  l21: { id: 'l21', name: 'Wetlands/Water Bodies, Coastal Wetland', color: '#00BFFF', group: 'Wetland' },
  l22: { id: 'l22', name: 'Wetlands/Water Bodies, River/Stream/canals', color: '#1E90FF', group: 'Wetland' },
  l23: { id: 'l23', name: 'Wetlands/Water Bodies, Reservoir/Lakes/Ponds', color: '#0000FF', group: 'Wetland' },
  
  // Snow and Glacier
  l24: { id: 'l24', name: 'Snow and Glacier', color: '#FFFFFF', group: 'Misc' },
};

// Category groupings for UI organization
export const categoryGroups = {
  'Built-up': ['l01', 'l02', 'l03'],
  'Agriculture': ['l04', 'l05', 'l06', 'l07'],
  'Forest': ['l08', 'l09', 'l10', 'l11', 'l12'],
  'Other Natural': ['l13', 'l14', 'l15', 'l16', 'l17', 'l18', 'l19'],
  'Wetland': ['l20', 'l21', 'l22', 'l23'],
  'Misc': ['l24']
};