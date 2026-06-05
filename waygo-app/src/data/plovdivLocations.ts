export interface PlovdivLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: 'historic' | 'nature' | 'food' | 'nightlife' | 'culture' | 'shopping';
  isSight: boolean;
  description: string;
  points: number;
  image_url: string;
  address: string;
  xp_reward: number;
}

const UNSPLASH_BASE = 'https://images.unsplash.com/photo';

export const PLOVDIV_LOCATIONS: PlovdivLocation[] = [
  {
    id: 'pl-01', name: 'Dzhumaya Mosque',
    lat: 42.14417, lng: 24.74917,
    category: 'historic', isSight: true,
    description: 'The oldest Ottoman mosque in the Balkans, built in 1363–1364 during the reign of Sultan Murad I. Its impressive prayer hall is covered by nine domes and features exquisite 14th-century stonework.',
    points: 50, xp_reward: 50,
    image_url: `${UNSPLASH_BASE}-1577082349863-5d9c3a322f5c?w=800&h=600&fit=crop`,
    address: 'Ul. "Zhelezarska" 2, 4000 Plovdiv'
  },
  {
    id: 'pl-02', name: 'Ancient Theatre of Philippopolis',
    lat: 42.14194, lng: 24.74917,
    category: 'historic', isSight: true,
    description: 'A 2nd-century Roman theatre carved into the southern slope of the Old Town, seating up to 7,000 spectators. Restored in the 1980s, it now hosts summer opera and music festivals.',
    points: 70, xp_reward: 70,
    image_url: `${UNSPLASH_BASE}-1580509042598-1c01f5cfc5a7?w=800&h=600&fit=crop`,
    address: 'Ul. "Tsar Ivan Shishman" 2, 4000 Plovdiv'
  },
  {
    id: 'pl-03', name: 'Kapana Creative District',
    lat: 42.14528, lng: 24.74750,
    category: 'culture', isSight: true,
    description: 'The "trap" district — a maze of cobblestone streets filled with artisan workshops, galleries, craft breweries, and street art. Plovdiv\'s bohemian heart and a must-visit for creatives.',
    points: 45, xp_reward: 45,
    image_url: `${UNSPLASH_BASE}-1517451336627-3d3f4f8c5b1a?w=800&h=600&fit=crop`,
    address: 'Kapana District, Ul. "Georgi S. Rakovski", 4000 Plovdiv'
  },
  {
    id: 'pl-04', name: 'Old Town (Staria Grad)',
    lat: 42.14361, lng: 24.75139,
    category: 'culture', isSight: true,
    description: 'The historic Old Town perched on the Three Hills, featuring preserved Bulgarian Revival houses with distinctive bay windows, colourful facades, and cobblestone lanes. A living open-air museum.',
    points: 60, xp_reward: 60,
    image_url: `${UNSPLASH_BASE}-1589371860080-e8d4c9b1f4b2?w=800&h=600&fit=crop`,
    address: 'Old Town, 4000 Plovdiv'
  },
  {
    id: 'pl-05', name: 'Plovdiv Regional Historical Museum',
    lat: 42.14583, lng: 24.75028,
    category: 'culture', isSight: true,
    description: 'Housed in a magnificent 19th-century building, the museum displays over 600,000 artifacts tracing Plovdiv\'s history from prehistoric times to the Bulgarian National Revival.',
    points: 55, xp_reward: 55,
    image_url: `${UNSPLASH_BASE}-1581873378391-5c5b5f2b7e3d?w=800&h=600&fit=crop`,
    address: 'Ul. "Stoyan Chalakov" 1, 4000 Plovdiv'
  },
  {
    id: 'pl-06', name: 'Tsar Simeon Garden',
    lat: 42.14694, lng: 24.74833,
    category: 'nature', isSight: true,
    description: 'The city\'s central park, designed in the 19th century, featuring ornate fountains, a summer theatre, a children\'s playground, and the iconic Singing Fountains in the evening.',
    points: 30, xp_reward: 30,
    image_url: `${UNSPLASH_BASE}-1585329759158-9c7b0e5f2a4d?w=800&h=600&fit=crop`,
    address: 'Tsar Simeon Garden, bul. "Tsar Boris III Obedinitel", 4000 Plovdiv'
  },
  {
    id: 'pl-07', name: 'Rowing Canal (Grebna Baza)',
    lat: 42.13083, lng: 24.72528,
    category: 'nature', isSight: true,
    description: 'A 2.2 km man-made rowing canal surrounded by green parks, jogging and cycling paths. A popular spot for walking, rollerblading, and enjoying sunset views over the water.',
    points: 35, xp_reward: 35,
    image_url: `${UNSPLASH_BASE}-1576481314960-9d6e8e2b0c4f?w=800&h=600&fit=crop`,
    address: 'Rowing Canal, bul. "Bulgaria", 4000 Plovdiv'
  },
  {
    id: 'pl-08', name: 'Plovdiv Zoo',
    lat: 42.13417, lng: 24.72694,
    category: 'nature', isSight: true,
    description: 'The oldest zoo in Bulgaria, founded in 1959, home to over 200 animals including lions, bears, monkeys, and exotic birds. Set within the lush greenery of the Rowing Canal park.',
    points: 40, xp_reward: 40,
    image_url: `${UNSPLASH_BASE}-1580473645028-6b9f1e9d3a8c?w=800&h=600&fit=crop`,
    address: 'Bul. "Bulgaria" 88, 4000 Plovdiv'
  },
  {
    id: 'pl-09', name: 'Lamartin House',
    lat: 42.14639, lng: 24.75194,
    category: 'historic', isSight: true,
    description: 'The house where French poet Alphonse de Lamartine stayed during his 1833 travels in the Ottoman Empire. Now a museum dedicated to his life and the 19th-century literary connections between France and Bulgaria.',
    points: 35, xp_reward: 35,
    image_url: `${UNSPLASH_BASE}-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
    address: 'Ul. "Knyaz Tseretelev" 19, 4000 Plovdiv'
  },
  {
    id: 'pl-10', name: 'Ethnographic Museum Plovdiv',
    lat: 42.14472, lng: 24.75278,
    category: 'culture', isSight: true,
    description: 'Housed in the stunning Kuyumdzhioglu House (1847), this museum showcases Bulgarian traditional costumes, crafts, and household items. The building itself is a masterpiece of National Revival architecture.',
    points: 50, xp_reward: 50,
    image_url: `${UNSPLASH_BASE}-1576481314960-9d6e8e2b0c4f?w=800&h=600&fit=crop`,
    address: 'Ul. "Dr. Stoyan Chomakov" 2, 4000 Plovdiv'
  },
  {
    id: 'pl-11', name: 'Church of Saints Konstantin and Elena',
    lat: 42.14528, lng: 24.75306,
    category: 'historic', isSight: true,
    description: 'An Eastern Orthodox church built in 1832 atop an earlier medieval Christian site. Features a magnificent iconostasis carved in wood and beautiful frescoes by masters of the Samokov school.',
    points: 30, xp_reward: 30,
    image_url: `${UNSPLASH_BASE}-1577082349863-5d9c3a322f5c?w=800&h=600&fit=crop`,
    address: 'Pl. "St. Konstantin i Elena", 4000 Plovdiv'
  },
  {
    id: 'pl-12', name: 'Nebet Tepe Hill',
    lat: 42.14750, lng: 24.75361,
    category: 'historic', isSight: true,
    description: 'One of the Three Hills and the acropolis of ancient Philippopolis, with Thracian fortification walls dating to the 5th century BC. Offers panoramic views of the entire city.',
    points: 45, xp_reward: 45,
    image_url: `${UNSPLASH_BASE}-1580509042598-1c01f5cfc5a7?w=800&h=600&fit=crop`,
    address: 'Nebet Tepe, 4000 Plovdiv'
  },
  {
    id: 'pl-13', name: 'Sahat Tepe Hill',
    lat: 42.14639, lng: 24.75528,
    category: 'nature', isSight: true,
    description: 'Named after the 19th-century clock tower at its summit, this hill offers a relaxing escape with wooded paths, benches, and one of the best sunset viewpoints over Plovdiv\'s rooftops.',
    points: 30, xp_reward: 30,
    image_url: `${UNSPLASH_BASE}-1585329759158-9c7b0e5f2a4d?w=800&h=600&fit=crop`,
    address: 'Sahat Tepe, 4000 Plovdiv'
  },
  {
    id: 'pl-14', name: 'Danov House',
    lat: 42.14500, lng: 24.75167,
    category: 'culture', isSight: true,
    description: 'The birthplace of Hristo G. Danov, the founder of modern Bulgarian publishing. This beautifully restored Revival-period house now functions as a museum of printing and book publishing.',
    points: 30, xp_reward: 30,
    image_url: `${UNSPLASH_BASE}-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
    address: 'Ul. "Mitropolit Paisiy" 2, 4000 Plovdiv'
  },
  {
    id: 'pl-15', name: 'Philippopolis Art Gallery',
    lat: 42.14444, lng: 24.75083,
    category: 'culture', isSight: true,
    description: 'A contemporary art space located in a restored 19th-century building near the Ancient Theatre. Features rotating exhibitions of Bulgarian and international modern artists.',
    points: 40, xp_reward: 40,
    image_url: `${UNSPLASH_BASE}-1581873378391-5c5b5f2b7e3d?w=800&h=600&fit=crop`,
    address: 'Ul. "Saborna" 22, 4000 Plovdiv'
  },
  {
    id: 'pl-16', name: 'Roman Stadium of Philippopolis',
    lat: 42.14583, lng: 24.74833,
    category: 'historic', isSight: true,
    description: 'A 2nd-century Roman stadium with a capacity of 30,000 spectators, discovered beneath the main pedestrian street. The partially excavated site shows the curved northern end with seating rows intact.',
    points: 55, xp_reward: 55,
    image_url: `${UNSPLASH_BASE}-1580509042598-1c01f5cfc5a7?w=800&h=600&fit=crop`,
    address: 'Ul. "Knyaginya Maria Luiza", 4000 Plovdiv'
  },
  {
    id: 'pl-17', name: 'Central Post Office Square',
    lat: 42.14472, lng: 24.74750,
    category: 'culture', isSight: true,
    description: 'The vibrant central square of Plovdiv, dominated by the neo-Renaissance post office building (1924). A lively meeting point with fountains, cafés, and frequent street performances.',
    points: 20, xp_reward: 20,
    image_url: `${UNSPLASH_BASE}-1517451336627-3d3f4f8c5b1a?w=800&h=600&fit=crop`,
    address: 'Pl. "Centralen", 4000 Plovdiv'
  },
  {
    id: 'pl-18', name: 'Maritsa Riverside Walk',
    lat: 42.14056, lng: 24.74639,
    category: 'nature', isSight: true,
    description: 'A scenic promenade along the banks of the Maritsa River, stretching several kilometres through the city. Lined with willow trees, benches, and cycle paths — popular for morning jogs and evening strolls.',
    points: 25, xp_reward: 25,
    image_url: `${UNSPLASH_BASE}-1576481314960-9d6e8e2b0c4f?w=800&h=600&fit=crop`,
    address: 'Maritsa River Bank, 4000 Plovdiv'
  },
  {
    id: 'pl-19', name: 'Mall Plovdiv',
    lat: 42.12833, lng: 24.73472,
    category: 'shopping', isSight: false,
    description: 'The largest shopping mall in southern Bulgaria, with over 180 stores, a multiplex cinema, bowling alley, and a diverse food court featuring international cuisine.',
    points: 0, xp_reward: 0,
    image_url: `${UNSPLASH_BASE}-1555529770-2b2e8c4f1a3d?w=800&h=600&fit=crop`,
    address: 'Bul. "Bulgaria" 23, 4003 Plovdiv'
  },
  {
    id: 'pl-20', name: 'Paradise Center Plovdiv',
    lat: 42.13000, lng: 24.72917,
    category: 'shopping', isSight: false,
    description: 'A modern shopping destination featuring fashion brands, a hypermarket, a cinema complex, and family entertainment areas. Known for its bright interior and weekend events.',
    points: 0, xp_reward: 0,
    image_url: `${UNSPLASH_BASE}-1555529770-2b2e8c4f1a3d?w=800&h=600&fit=crop`,
    address: 'Bul. "Bulgaria" 76, 4000 Plovdiv'
  },
  {
    id: 'pl-21', name: 'Plovdiv Fair (International Plovdiv Fair)',
    lat: 42.13361, lng: 24.73083,
    category: 'culture', isSight: true,
    description: 'One of the largest exhibition centres in Southeast Europe, hosting international trade fairs, concerts, and cultural events since 1892. The fairgrounds span over 35,000 square metres.',
    points: 35, xp_reward: 35,
    image_url: `${UNSPLASH_BASE}-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
    address: 'Bul. "Tsar Boris III Obedinitel" 37, 4000 Plovdiv'
  },
  {
    id: 'pl-22', name: 'Bunardzhika Hill (Singing Fountains)',
    lat: 42.15083, lng: 24.74528,
    category: 'nature', isSight: true,
    description: 'The greenest of the Three Hills, home to the Alyosha Monument and the spectacular Singing Fountains — a choreographed water, light, and music show held on summer evenings.',
    points: 40, xp_reward: 40,
    image_url: `${UNSPLASH_BASE}-1585329759158-9c7b0e5f2a4d?w=800&h=600&fit=crop`,
    address: 'Bunardzhika Hill, 4000 Plovdiv'
  },
  {
    id: 'pl-23', name: 'Hristo Danov Monument',
    lat: 42.14583, lng: 24.74917,
    category: 'historic', isSight: true,
    description: 'A bronze statue of Hristo G. Danov, Bulgaria\'s pioneering publisher and book printer, standing prominently in the central pedestrian zone near the Roman Stadium.',
    points: 15, xp_reward: 15,
    image_url: `${UNSPLASH_BASE}-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
    address: 'Ul. "Knyaginya Maria Luiza", 4000 Plovdiv'
  },
  {
    id: 'pl-24', name: 'Plovdiv Central Railway Station',
    lat: 42.13694, lng: 24.74889,
    category: 'historic', isSight: true,
    description: 'Built in 1872 during the Ottoman era, the station is one of the oldest railway buildings in Bulgaria. Its neo-classical facade and iron platform canopy are fine examples of 19th-century transport architecture.',
    points: 20, xp_reward: 20,
    image_url: `${UNSPLASH_BASE}-1517451336627-3d3f4f8c5b1a?w=800&h=600&fit=crop`,
    address: 'Pl. "Gara" 1, 4000 Plovdiv'
  },
  {
    id: 'pl-25', name: 'Hebros Hotel & Roman Wall',
    lat: 42.14528, lng: 24.75194,
    category: 'historic', isSight: true,
    description: 'A section of the ancient Roman fortification wall of Philippopolis, integrated into the modern Hebros Hotel building. The preserved masonry reveals the engineering skill of Roman builders.',
    points: 25, xp_reward: 25,
    image_url: `${UNSPLASH_BASE}-1580509042598-1c01f5cfc5a7?w=800&h=600&fit=crop`,
    address: 'Ul. "Knyaz Tseretelev" 1, 4000 Plovdiv'
  },
  {
    id: 'pl-26', name: 'Balabanov House',
    lat: 42.14444, lng: 24.75222,
    category: 'culture', isSight: true,
    description: 'A meticulously restored Bulgarian National Revival house (c. 1850) with a spacious courtyard and ornate wooden ceilings. Now used as a venue for concerts, exhibitions, and wedding ceremonies.',
    points: 35, xp_reward: 35,
    image_url: `${UNSPLASH_BASE}-1564013799919-ab600027ffc6?w=800&h=600&fit=crop`,
    address: 'Ul. "Tsar Kaloyan" 3, 4000 Plovdiv'
  },
  {
    id: 'pl-27', name: 'Church of the Virgin Mary',
    lat: 42.14611, lng: 24.75361,
    category: 'historic', isSight: true,
    description: 'A Bulgarian Orthodox church built in 1844, featuring a carved wooden iconostasis and impressive murals. The church played a role in the struggle for an independent Bulgarian exarchate.',
    points: 25, xp_reward: 25,
    image_url: `${UNSPLASH_BASE}-1577082349863-5d9c3a322f5c?w=800&h=600&fit=crop`,
    address: 'Ul. "Mitropolit Paisiy" 9, 4000 Plovdiv'
  },
  {
    id: 'pl-28', name: 'Kamenitsa Brewery',
    lat: 42.15278, lng: 24.73944,
    category: 'food', isSight: false,
    description: 'Plovdiv\'s historic brewery founded in 1881, producing the iconic Kamenitsa beer brand. The brewery offers guided tours and a tasting room where visitors can sample freshly brewed lagers.',
    points: 0, xp_reward: 0,
    image_url: `${UNSPLASH_BASE}-1558642486-2d3c1b5e9a7f?w=800&h=600&fit=crop`,
    address: 'Bul. "Kamenitsa" 1, 4000 Plovdiv'
  },
  {
    id: 'pl-29', name: 'Plovdiv Art Gallery',
    lat: 42.14583, lng: 24.75111,
    category: 'culture', isSight: true,
    description: 'The city\'s main art museum, housing over 5,000 works of Bulgarian fine art from the National Revival to contemporary pieces. Regular temporary exhibitions feature international artists.',
    points: 45, xp_reward: 45,
    image_url: `${UNSPLASH_BASE}-1581873378391-5c5b5f2b7e3d?w=800&h=600&fit=crop`,
    address: 'Ul. "Saborna" 14A, 4000 Plovdiv'
  },
  {
    id: 'pl-30', name: 'Alyosha Monument (Liberators\' Monument)',
    lat: 42.15472, lng: 24.75500,
    category: 'historic', isSight: true,
    description: 'An iconic 11-metre Soviet soldier statue atop Bunardzhika Hill, erected in 1954. A controversial yet powerful landmark offering a commanding view of Plovdiv\'s entire skyline.',
    points: 40, xp_reward: 40,
    image_url: `${UNSPLASH_BASE}-1580509042598-1c01f5cfc5a7?w=800&h=600&fit=crop`,
    address: 'Bunardzhika Hill, 4000 Plovdiv'
  },
];
