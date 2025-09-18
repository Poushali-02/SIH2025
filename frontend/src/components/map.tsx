import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

type District = {
  name: string;
  code: string;
};

type LValues = {
  l01: number;
  l02: number;
  l03: number;
  l04: number;
  l05: number;
  l06: number;
  l07: number;
  l08: number;
  l09: number;
  l10: number;
  l11: number;
  l12: number;
  l13: number;
  l14: number;
  l15: number;
  l16: number;
  l17: number;
  l18: number;
  l19: number;
  l20: number;
  l21: number;
  l22: number;
  l23: number;
  l24: number;
};

// LULC (Land Use Land Cover) categories mapping
const lulcCategories = {
  l01: { name: "Built Up (Urban)", color: "#FF0000" },         // Red
  l02: { name: "Built Up (Rural)", color: "#FF5555" },         // Light Red
  l03: { name: "Mining", color: "#A0522D" },                   // Brown
  l04: { name: "Agriculture (Cropland)", color: "#FFFF00" },   // Yellow
  l05: { name: "Agriculture (Plantation)", color: "#7CFC00" }, // Lawn Green
  l06: { name: "Agriculture (Fallow)", color: "#F4A460" },     // Sandy Brown
  l07: { name: "Wetland (Inland)", color: "#00FFFF" },         // Cyan
  l08: { name: "Wetland (Coastal)", color: "#00CED1" },        // Dark Turquoise
  l09: { name: "Forest (Evergreen)", color: "#006400" },       // Dark Green
  l10: { name: "Forest (Deciduous)", color: "#228B22" },       // Forest Green
  l11: { name: "Forest (Shrub)", color: "#90EE90" },           // Light Green
  l12: { name: "Forest (Swamp)", color: "#008080" },           // Teal
  l13: { name: "Grassland", color: "#ADFF2F" },                // Green Yellow
  l14: { name: "Wasteland", color: "#D2B48C" },                // Tan
  l15: { name: "Barren/Unculturable/Gullied", color: "#DEB887" }, // Burlywood
  l16: { name: "Snow and Glaciers", color: "#FFFFFF" },        // White
  l17: { name: "Water Bodies", color: "#0000FF" },             // Blue
  l18: { name: "Others", color: "#808080" },                   // Gray
  l19: { name: "Cloud Cover", color: "#DCDCDC" },              // Gainsboro
  l20: { name: "Prelims Data", color: "#F0F8FF" },             // Alice Blue
  l21: { name: "Reserved", color: "#E6E6FA" },                 // Lavender
  l22: { name: "Reserved", color: "#D8BFD8" },                 // Thistle
  l23: { name: "Reserved", color: "#DDA0DD" },                 // Plum
  l24: { name: "Reserved", color: "#EE82EE" }                  // Violet
};

type ThematicData = { [areaId: string]: LValues };

const districts: District[] = [
  { name: "Patna", code: "1028" },
  { name: "Dindori", code: "2341" },
  { name: "Hugli", code: "1912" },
  { name: "Haora", code: "1916" },
  { name: "Aurangabad", code: "1034" },
  { name: "Tinsukia", code: "1814" },
  { name: "Bongaigaon", code: "1804" },
  { name: "Darrang", code: "1808" },
  { name: "Dhuburi", code: "1802" },
  { name: "Barpeta", code: "1805" },
  { name: "Birbhum", code: "1908" },
  { name: "Shahdol", code: "2316" },
  { name: "East Midnapore", code: "1915" },
  { name: "Kalaburagi", code: "2904" },
  { name: "Koppal", code: "2907" },
  { name: "Garhchiroli", code: "2712" },
  { name: "Dumka", code: "2011" },
  { name: "Ysr Kadapa", code: "2820" },
  { name: "Siwan", code: "1016" },
  { name: "Bagalakote", code: "2902" },
  { name: "Bengaluru Rural", code: "2921" },
  { name: "Rohtas", code: "1032" },
  { name: "Tiruvannamalai", code: "3306" },
  { name: "Gaya", code: "1035" },
  { name: "Jajpur", code: "2113" },
  { name: "Munger", code: "1024" },
  { name: "Mahesana", code: "2404" },
  { name: "Chatra", code: "2003" },
  { name: "Bokaro", code: "2013" },
  { name: "Salem", code: "3308" },
  { name: "Dahod", code: "2418" },
  { name: "Kishanganj", code: "1008" },
  { name: "Darbhanga", code: "1013" },
  { name: "Wardha", code: "2708" },
  { name: "Kalahandi", code: "2126" },
  { name: "Sepahijala", code: "1608" },
  { name: "Thiruvananthapuram", code: "3214" },
  { name: "Deoghar", code: "2007" },
  { name: "Dhanbad", code: "2012" },
  { name: "Upper Dibang Valley", code: "1216" },
  { name: "Malkangiri", code: "2130" },
  { name: "Sundargarh", code: "2105" },
  { name: "Koraput", code: "2129" },
  { name: "Jalna", code: "2718" },
  { name: "Dantewada", code: "2216" },
  { name: "Kawardha", code: "2208" },
  { name: "Giridih", code: "2006" },
  { name: "Bankura", code: "1913" },
  { name: "Virudhunagar", code: "3326" },
  { name: "Lunglei", code: "1506" },
  { name: "Senapati", code: "1401" },
  { name: "Panna", code: "2310" },
  { name: "Serchhip", code: "1505" },
  { name: "Dhule", code: "2702" },
  { name: "Nagpur", code: "2709" },
  { name: "Chandrapur", code: "2713" },
  { name: "Bhandara", code: "2727" },
  { name: "Jalgaon", code: "2703" },
  { name: "Osmanabad", code: "2729" },
  { name: "Nandurbar", code: "2701" },
  { name: "Damoh", code: "2312" },
  { name: "Datia", code: "2305" },
  { name: "Dhar", code: "2325" },
  { name: "Balaghat", code: "2345" },
  { name: "Chhindwara", code: "2343" },
  { name: "Tikamgarh", code: "2308" },
  { name: "Ashoknagar", code: "2347" },
  { name: "Kanker", code: "2214" },
  { name: "Hoshangabad", code: "2337" },
  { name: "Jhabua", code: "2324" },
  { name: "Guna", code: "2307" },
  { name: "Sidhi", code: "2317" },
  { name: "Umaria", code: "2315" },
  { name: "Jharsuguda", code: "2102" },
  { name: "Kolkata", code: "1917" },
  { name: "Bilaspur", code: "2207" },
  { name: "Chikkaballapura", code: "2930" },
  { name: "Bidar", code: "2905" },
  { name: "Raichur", code: "2906" },
  { name: "Boudh", code: "2122" },
  { name: "Anand", code: "2415" },
  { name: "Chennai", code: "3302" },
  { name: "Nagapattinam", code: "3319" },
  { name: "Godda", code: "2008" },
  { name: "Hazaribag", code: "2004" },
  { name: "Jamtara", code: "2019" },
  { name: "Koderma", code: "2005" },
  { name: "Lohardaga", code: "2015" },
  { name: "Vadodara", code: "2419" },
  { name: "Bhabua", code: "1031" },
  { name: "Lakhisarai", code: "1025" },
  { name: "Palamu", code: "2002" },
  { name: "Ranchi", code: "2014" },
  { name: "Dharwad", code: "2909" },
  { name: "Katni", code: "2338" },
  { name: "Raisen", code: "2334" },
  { name: "Rewa", code: "2314" },
  { name: "Harda", code: "2336" },
  { name: "Narsinghpur", code: "2340" },
  { name: "Tuensang", code: "1302" },
  { name: "Sagar", code: "2311" },
  { name: "Seoni", code: "2344" },
  { name: "Vidisha", code: "2331" },
  { name: "Shivpuri", code: "2306" },
  { name: "Shajapur", code: "2322" },
  { name: "West Nimar", code: "2327" },
  { name: "Bid", code: "2710" },
  { name: "Bhopal", code: "2332" },
  { name: "Burhanpur", code: "2348" },
  { name: "Pashchim Singhbhum", code: "2017" },
  { name: "Hingoli", code: "2716" },
  { name: "Gumla", code: "2016" },
  { name: "Latehar", code: "2020" },
  { name: "Pakur", code: "2010" },
  { name: "Rajgarh", code: "2330" },
  { name: "Ratlam", code: "2320" },
  { name: "Satna", code: "2313" },
  { name: "Gwalior", code: "2304" },
  { name: "East Khasi Hills", code: "1706" },
  { name: "Kolhapur", code: "2734" },
  { name: "Lohit", code: "1211" },
  { name: "Pune", code: "2725" },
  { name: "Satara", code: "2731" },
  { name: "Chandel", code: "1409" },
  { name: "Champhai", code: "1504" },
  { name: "North Sikkim", code: "1101" },
  { name: "Kolasib", code: "1502" },
  { name: "Aizawl", code: "1503" },
  { name: "West Khasi Hills", code: "1704" },
  { name: "Nagaon", code: "1810" },
  { name: "Zunheboto", code: "1304" },
  { name: "Kohima", code: "1307" },
  { name: "Theni", code: "3325" },
  { name: "Tirap", code: "1213" },
  { name: "Goalpara", code: "1803" },
  { name: "Golaghat", code: "1818" },
  { name: "Kokrajhar", code: "1801" },
  { name: "Marigaon", code: "1809" },
  { name: "Nalbari", code: "1807" },
  { name: "Lower Subansiri", code: "1205" },
  { name: "West Sikkim", code: "1102" },
  { name: "Ramanathapuram", code: "3327" },
  { name: "Kancheepuram", code: "3303" },
  { name: "Pok", code: "1" },
  { name: "Tawang", code: "1201" },
  { name: "Upper Subansiri", code: "1206" },
  { name: "Hyderabad", code: "3605" },
  { name: "Jalpaiguri", code: "1902" },
  { name: "Tamenglong", code: "1402" },
  { name: "Churachandpur", code: "1403" },
  { name: "Ukhrul", code: "1408" },
  { name: "East Kameng", code: "1203" },
  { name: "South Sikkim", code: "1103" },
  { name: "Maldah", code: "1906" },
  { name: "Murshidabad", code: "1907" },
  { name: "Mandya", code: "2922" },
  { name: "Rangareddy", code: "3606" },
  { name: "Ujjain", code: "2321" },
  { name: "Dhemaji", code: "1813" },
  { name: "Uttar Dinajpur", code: "1904" },
  { name: "Krishna", code: "2816" },
  { name: "Potti Sriramulu Nellore", code: "2819" },
  { name: "Prakasam", code: "2818" },
  { name: "Banka", code: "1023" },
  { name: "Sheohar", code: "1003" },
  { name: "Bhagalpur", code: "1022" },
  { name: "Madhepura", code: "1011" },
  { name: "Vaishali", code: "1018" },
  { name: "Karur", code: "3314" },
  { name: "Saran", code: "1017" },
  { name: "Sivaganga", code: "3323" },
  { name: "West Siang", code: "1207" },
  { name: "Visakhapatnam", code: "2813" },
  { name: "Patan", code: "2403" },
  { name: "Lower Dibang Valley", code: "1215" },
  { name: "Papum Pare", code: "1204" },
  { name: "Kheda", code: "2416" },
  { name: "North Cachar Hills", code: "1820" },
  { name: "Sonitpur", code: "1811" },
  { name: "Kanniyakumari", code: "3330" },
  { name: "Jorhat", code: "1817" },
  { name: "Karimganj", code: "1822" },
  { name: "Sibsagar", code: "1816" },
  { name: "Kurung Kumey", code: "1214" },
  { name: "Lawngtlai", code: "1507" },
  { name: "Upper Siang", code: "1209" },
  { name: "Sambalpur", code: "2103" },
  { name: "Mayurbhanj", code: "2107" },
  { name: "Jamui", code: "1037" },
  { name: "Vizianagaram", code: "2812" },
  { name: "Purba Champaran", code: "1002" },
  { name: "Raipur", code: "2211" },
  { name: "Thoothukudi", code: "3328" },
  { name: "Raj Nandgaon", code: "2209" },
  { name: "Nawada", code: "1036" },
  { name: "Dibrugarh", code: "1815" },
  { name: "Puruliya", code: "1914" },
  { name: "Barddhaman", code: "1909" },
  { name: "Surendranagar", code: "2408" },
  { name: "Indore", code: "2326" },
  { name: "Gandhinagar", code: "2406" },
  { name: "Jashpur", code: "2203" },
  { name: "Raigarh", code: "2204" },
  { name: "Surguja", code: "2217" },
  { name: "Nalgonda", code: "3608" },
  { name: "Yadgir", code: "2933" },
  { name: "Thanjavur", code: "3321" },
  { name: "Bastar", code: "2215" },
  { name: "Gajapati", code: "2120" },
  { name: "Keonjhar", code: "2106" },
  { name: "South 24 Parganas", code: "1918" },
  { name: "Mandla", code: "2342" },
  { name: "Mandsaur", code: "2319" },
  { name: "Angul", code: "2115" },
  { name: "Baragarh", code: "2101" },   
  { name: "Dhenkanal", code: "2114" },
  { name: "Medak", code: "3604" },
  { name: "Nizamabad", code: "3602" },
  { name: "Nalanda", code: "1027" },
  { name: "Buldana", code: "2704" },
  { name: "Yavatmal", code: "2714" },
  { name: "Akola", code: "2705" },
  { name: "Nanded", code: "2715" },
  { name: "Parbhani", code: "2717" },
  { name: "Srikakulam", code: "2811" },
  { name: "Junagadh", code: "2412" },
  { name: "Tirunelveli Kattabo", code: "3329" },
  { name: "Latur", code: "2728" },
  { name: "Nuapada", code: "2125" },
  { name: "Tiruchchirappalli", code: "3315" },  
  { name: "Muzaffarpur", code: "1014" },
  { name: "Kendrapara", code: "2110" },
  { name: "Sonepur", code: "2123" },
  { name: "Kachchh", code: "2401" },
  { name: "Dharmapuri", code: "3305" },
  { name: "Gopalganj", code: "1015" },
  { name: "Madhubani", code: "1005" },
  { name: "Araria", code: "1007" },
  { name: "Dakshin Dinajpur", code: "1905" },
  { name: "Begusarai", code: "1020" },
  { name: "Khagaria", code: "1021" },
  { name: "Bhavnagar", code: "2414" },
  { name: "Gondiya", code: "2711" },
  { name: "Bishnupur", code: "1404" },
  { name: "Deogarh", code: "2104" },
  { name: "Jagatsinghpur", code: "2111" },
  { name: "Namakkal", code: "3309" },
  { name: "Madurai", code: "3324" },
  { name: "Bhojpur", code: "1029" },
  { name: "Buxar", code: "1030" },
  { name: "Bharuch", code: "2421" },
  { name: "Valsad", code: "2425" },
  { name: "Ahmadabad", code: "2407" },
  { name: "Jamnagar", code: "2410" },
  { name: "Guntur", code: "2817" },
  { name: "Porbandar", code: "2411" },
  { name: "Amreli", code: "2413" },
  { name: "Haveri", code: "2911" },
  { name: "Kasaragod", code: "3201" },
  { name: "Gomati", code: "1606" },
  { name: "Thiruvallur", code: "3301" },
  { name: "Thiruvarur", code: "3320" },
  { name: "Kozhikode", code: "3204" },
  { name: "Kollam", code: "3213" },
  { name: "East Siang", code: "1208" },
  { name: "Chamarajanagar", code: "2927" },
  { name: "Chikkamagaluru", code: "2917" },
  { name: "Ballari", code: "2912" },
  { name: "Davanagere", code: "2914" },
  { name: "Gadag", code: "2908" },
  { name: "Kolar", code: "2919" },
  { name: "Mysuru", code: "2926" },
  { name: "Tumakuru", code: "2918" },
  { name: "Mumbai Suburban", code: "2722" },
  { name: "Morena", code: "2302" },
  { name: "Sahibganj", code: "2009" },
  { name: "Ernakulam", code: "3208" },
  { name: "West Imphal", code: "1406" },
  { name: "East Garo Hills", code: "1702" },
  { name: "Bhind", code: "2303" },
  { name: "Raygad", code: "2724" },
  { name: "The Dangs", code: "2423" },
  { name: "Thane", code: "2721" },
  { name: "Nabarangpur", code: "2128" },
  { name: "Narmada", code: "2420" },
  { name: "Villupuram", code: "3307" },
  { name: "Ariyalur", code: "3317" },
  { name: "Chitradurga", code: "2913" },
  { name: "Vellore", code: "3304" },
  { name: "Erode", code: "3310" },
  { name: "Pudukkottai", code: "3322" },
  { name: "Cuddalore", code: "3318" },
  { name: "Mahbubnagar", code: "3607" },
  { name: "Warangal", code: "3609" },
  { name: "Saraikela Kharsawan", code: "2021" },
  { name: "Simdega", code: "2022" },
  { name: "Jaintia Hills", code: "1707" },
  { name: "Anantapuram", code: "2822" },
  { name: "Dhalai", code: "1603" },
  { name: "Changlang", code: "1212" },
  { name: "Unakoti", code: "1609" },
  { name: "West", code: "1601" },
  { name: "West Godavari", code: "2815" },
  { name: "Bhadrak", code: "2109" },
  { name: "Sheopur", code: "2301" },    
  { name: "Jabalpur", code: "2339" },
  { name: "Koriya", code: "2201" },
  { name: "Jehanabad", code: "1033" },
  { name: "Aurangabad", code: "2719" },
  { name: "Barwani", code: "2328" },
  { name: "Dewas", code: "2323" },
  { name: "East Nimar", code: "2329" },
  { name: "Washim", code: "2706" },
  { name: "Mumbai City", code: "2723" },
  { name: "Ri-Bhoi", code: "1705" },
  { name: "West Kameng", code: "1202" },
  { name: "North 24 Parganas", code: "1911" },
  { name: "Kamrup", code: "1806" },
  { name: "Karbi Anglong", code: "1819" },
  { name: "Anuppur", code: "2346" },
  { name: "Kochbihar", code: "1903" },
  { name: "Sheikhpura", code: "1026" },
  { name: "Katihar", code: "1010" },
  { name: "Vijayapura", code: "2932" },
  { name: "Lakhimpur", code: "1812" },
  { name: "Pashchim Champaran", code: "1001" },
  { name: "Ganjam", code: "2119" },
  { name: "Durg", code: "2210" },
  { name: "Sitamarhi", code: "1004" },
  { name: "Samastipur", code: "1019" },
  { name: "Khordha", code: "2117" },
  { name: "Puri", code: "2118" },
  { name: "Khowai", code: "1607" },
  { name: "Allaphuzha", code: "3211" },
  { name: "Dakshina Kannada", code: "2924" },
  { name: "Udupi", code: "2916" },
  { name: "Kottayam", code: "3210" },
  { name: "Malappuram", code: "3205" },
  { name: "Ratnagiri", code: "2732" },
  { name: "Dhamtari", code: "2213" },
  { name: "Janjgir-Champa", code: "2206" },
  { name: "Korba", code: "2205" },
  { name: "Mahasamund", code: "2212" },
  { name: "Garhwa", code: "2001" },
  { name: "Amravati", code: "2707" },
  { name: "Uttara Kannada", code: "2910" },
  { name: "Kannur", code: "3202" },
  { name: "Sindhudurg", code: "2733" },
  { name: "Baleshwar", code: "2108" },
  { name: "Cuttack", code: "2112" },
  { name: "Supaul", code: "1006" },
  { name: "Nilgiris", code: "3311" },
  { name: "Adilabad", code: "3601" },
  { name: "Karimnagar", code: "3603" },
  { name: "Khammam", code: "3610" },
  { name: "West Midnapore", code: "1919" },
  { name: "East Godavari", code: "2814" },
  { name: "Rajkot", code: "2409" },
  { name: "Banas Kantha", code: "2402" },
  { name: "Sabar Kantha", code: "2405" },
  { name: "Kurnool", code: "2821" },
  { name: "Betul", code: "2335" },
  { name: "Surat", code: "2422" },
  { name: "Belagavi", code: "2901" },
  { name: "Hassan", code: "2923" },
  { name: "Navsari", code: "2424" },
  { name: "Shivamogga", code: "2915" },
  { name: "Krishnagiri", code: "3331" },
  { name: "Perambalur", code: "3316" },
  { name: "Dindigul", code: "3313" },
  { name: "Sangli", code: "2735" },
  { name: "Ramanagara", code: "2931" },
  { name: "Coimbatore", code: "3312" },
  { name: "Nadia", code: "1910" },
  { name: "South", code: "1602" },
  { name: "Chittoor", code: "2823" },
  { name: "Sehore", code: "2333" },
  { name: "Cachar", code: "1821" },
  { name: "Hailakandi", code: "1823" },
  { name: "Solapur", code: "2730" },
  { name: "West Garo Hills", code: "1701" },
  { name: "Mokokchung", code: "1303" },
  { name: "Dimapur", code: "1306" },
  { name: "Purnia", code: "1009" },
  { name: "Saharsa", code: "1012" },
  { name: "Mon", code: "1301" },
  { name: "Kodagu", code: "2925" },
  { name: "Rayagada", code: "2127" },
  { name: "North", code: "1604" },
  { name: "Nayagarh", code: "2116" },
  { name: "Palakkad", code: "3206" },
  { name: "Pattanamtitta", code: "3212" },
  { name: "Wayanad", code: "3203" },
  { name: "Idukki", code: "3209" },
  { name: "Thrissur", code: "3207" },
  { name: "Panch Mahals", code: "2417" },
  { name: "Purba Singhbhum", code: "2018" },
  { name: "Ahmadnagar", code: "2726" },
  { name: "Bengaluru", code: "2920" },
  { name: "Nashik", code: "2720" },
  { name: "Chhatarpur", code: "2309" },
  { name: "Neemuch", code: "2318" },
  { name: "East Sikkim", code: "1104" },
  { name: "Darjiling", code: "1901" },
  { name: "Bolangir", code: "2124" },
  { name: "South Garo Hills", code: "1703" },
  { name: "East Imphal", code: "1407" },
  { name: "Thoubal", code: "1405" },
  { name: "Mamit", code: "1501" },
  { name: "Phek", code: "1308" },
  { name: "Wokha", code: "1305" },
  { name: "Kandhamal", code: "2121" },
  { name: "Saiha", code: "1508" },
  { name: "Pulwama", code: "0105" },
  { name: "Doda", code: "0109" },
  { name: "Poonch", code: "0111" },
  { name: "Shimla", code: "0211" },
  { name: "Saharanpur", code: "0901" },
  { name: "Karnal", code: "0606" },
  { name: "Farrukhabad", code: "0929" },
  { name: "Allahabad", code: "0945" },
  { name: "Ludhiana", code: "0309" },
  { name: "Hanumangarh", code: "0802" },
  { name: "Agra", code: "0915" },
  { name: "Dehra Dun", code: "0505" },
  { name: "Bundi", code: "0823" },
  { name: "Jhunjhunun", code: "0805" },
  { name: "Karauli", code: "0809" },
  { name: "Deoria", code: "0960" },
  { name: "Ballia", code: "0963" },
  { name: "Faizabad", code: "0947" },
  { name: "Kanpur", code: "0934" },
  { name: "Kaushambi", code: "0944" },
  { name: "Azamgarh", code: "0971" },
  { name: "Sitapur", code: "0924" },
  { name: "Etah", code: "0917" },
  { name: "Ghazipur", code: "0965" },
  { name: "Jaunpur", code: "0964" },
  { name: "Mainpuri", code: "0918" },
  { name: "Fatehgarh Sahib", code: "0308" },
  { name: "Unnao", code: "0926" },
  { name: "Panchkula", code: "0601" },
  { name: "Nawan Shehar", code: "0306" },
  { name: "Pilibhit", code: "0921" },
  { name: "Jyotiba Phule Nagar", code: "0906" },
  { name: "Rampur", code: "0905" },
  { name: "Ambedkar Nagar", code: "0948" },
  { name: "Hisar", code: "0612" },
  { name: "Jind", code: "0609" },
  { name: "Jalaun", code: "0935" },
  { name: "Shahjahanpur", code: "0922" },
  { name: "Jhajjar", code: "0615" },
  { name: "Churu", code: "0804" },
  { name: "Kurukshetra", code: "0604" },
  { name: "Maharajganj", code: "0957" },
  { name: "Ambala", code: "0602" },
  { name: "Hamirpur", code: "0206" },
  { name: "Champawat", code: "0510" },
  { name: "Bathinda", code: "0314" },
  { name: "Lalitpur", code: "0937" },
  { name: "Hardoi", code: "0925" },
  { name: "Jalandhar", code: "0304" },
  { name: "Mansa", code: "0315" },
  { name: "Kota", code: "0830" },
  { name: "Siddharth Nagar", code: "0954" },
  { name: "Auraiya", code: "0932" },
  { name: "Rajsamand", code: "0825" },
  { name: "Lakhimpur Kheri", code: "0923" },
  { name: "Mau", code: "0962" },
  { name: "Kushinagar", code: "0959" },
  { name: "Baghpat", code: "0908" },
  { name: "Hathras", code: "0913" },
  { name: "Lucknow", code: "0927" },
  { name: "Dhaulpur", code: "0808" },
  { name: "Jhalawar", code: "0832" },
  { name: "Sant Kabir Nagar", code: "0956" },
  { name: "Chamoli", code: "0502" },
  { name: "Rudra Prayag", code: "0503" },
  { name: "Chittaurgarh", code: "0829" },
  { name: "Rewari", code: "0617" },
  { name: "Meerut", code: "0907" },
  { name: "Aligarh", code: "0912" },
  { name: "Bhilwara", code: "0824" },
  { name: "Kansiramnagar", code: "0972" },
  { name: "Firozabad", code: "0916" },
  { name: "Faridabad", code: "0619" },
  { name: "Solan", code: "0209" },
  { name: "Una", code: "0207" },
  { name: "Moradabad", code: "0904" },
  { name: "Sirohi", code: "0819" },
  { name: "Rohtak", code: "0614" },
  { name: "Nagaur", code: "0814" },
  { name: "Bijnor", code: "0903" },
  { name: "Uttarkashi", code: "0501" },
  { name: "Kupwara", code: "0101" },
  { name: "Srinagar", code: "0103" },
  { name: "Baramulla", code: "0102" },
  { name: "Chamba", code: "0201" },
  { name: "Kinnaur", code: "0212" },
  { name: "Kullu", code: "0204" },
  { name: "Nuh", code: "0622" },
  { name: "Pithoragarh", code: "0507" },
  { name: "Barmer", code: "0817" },
  { name: "Jaisalmer", code: "0816" },
  { name: "Jalor", code: "0818" },
  { name: "Fatehpur", code: "0942" },
  { name: "Tonk", code: "0822" },
  { name: "Bara Banki", code: "0946" },
  { name: "Basti", code: "0955" },
  { name: "Pratapgarh", code: "0943" },
  { name: "Rae Bareli", code: "0928" },
  { name: "Chandauli", code: "0966" },
  { name: "Banda", code: "0940" },
  { name: "Chitrakoot", code: "0941" },
  { name: "Pauri Garhwal", code: "0506" },
  { name: "Gurdaspur", code: "0301" },
  { name: "Amritsar", code: "0302" },
  { name: "Hoshiarpur", code: "0305" },
  { name: "Bilaspur", code: "0208" },
  { name: "Sirmaur", code: "0210" },
  { name: "Mathura", code: "0914" },
  { name: "Mirzapur", code: "0969" },
  { name: "Sonbhadra", code: "0970" },
  { name: "Mahoba", code: "0939" },
  { name: "Moga", code: "0310" },
  { name: "Etawah", code: "0931" },
  { name: "Ghaziabad", code: "0909" },
  { name: "Jhansi", code: "0936" },
  { name: "Kanpur Dehat", code: "0933" },
  { name: "Kapurthala", code: "0303" },
  { name: "Gorakhpur", code: "0958" },
  { name: "Kannauj", code: "0930" },
  { name: "Sirsa", code: "0611" },
  { name: "Palwal", code: "0623" },
  { name: "Panipat", code: "0607" },
  { name: "Faridkot", code: "0313" },
  { name: "Firozpur", code: "0311" },
  { name: "Badaun", code: "0919" },
  { name: "Balrampur", code: "0952" },
  { name: "Bareilly", code: "0920" },
  { name: "Muktsar", code: "0312" },
  { name: "Gonda", code: "0953" },
  { name: "Shravasti", code: "0951" },
  { name: "Rupnagar", code: "0307" },
  { name: "Patiala", code: "0317" },
  { name: "Bulandshahr", code: "0911" },
  { name: "Dausa", code: "0811" },
  { name: "Mahendragarh", code: "0616" },
  { name: "Bhiwani", code: "0613" },
  { name: "Gurugram", code: "0618" },
  { name: "Fatehabad", code: "0610" },
  { name: "Mandi", code: "0205" },
  { name: "Leh", code: "0107" },
  { name: "Alwar", code: "0806" },
  { name: "Jaipur", code: "0812" },
  { name: "Ajmer", code: "0821" },
  { name: "Bharatpur", code: "0807" },
  { name: "Pali", code: "0820" },
  { name: "Sangrur", code: "0316" },
  { name: "Jodhpur", code: "0815" },
  { name: "Sikar", code: "0813" },
  { name: "Sawai Madhopur", code: "0810" },
  { name: "Hamirpur", code: "0938" },
  { name: "Kargil", code: "0108" },
  { name: "Rajouri", code: "0112" },
  { name: "Kangra", code: "0202" },
  { name: "Dungarpur", code: "0827" },
  { name: "Bahraich", code: "0950" },
  { name: "Yamunanagar", code: "0603" },
  { name: "Muzaffarnagar", code: "0902" },
  { name: "Haridwar", code: "0513" },
  { name: "Tehri Garhwal", code: "0504" },
  { name: "Udham Singh Nagar", code: "0512" },
  { name: "Udaipur", code: "0826" },
  { name: "Ganganagar", code: "0801" },
  { name: "Almora", code: "0509" },
  { name: "Charkhi Dadri", code: "0621" },
  { name: "Anantnag", code: "0106" },
  { name: "Jammu", code: "0113" },
  { name: "Udhampur", code: "0110" },
  { name: "Kathua", code: "0114" }, 
  { name: "Baran", code: "0831" },
  { name: "Bikaner", code: "0803" },
  { name: "Naini Tal", code: "0511" },
  { name: "Varanasi", code: "0967" },
  { name: "Kaithal", code: "0605" },
  { name: "Sonipat", code: "0608" },
  { name: "Sant Ravi Das Nagar", code: "0968" },
  { name: "Sultanpur", code: "0949" },
  { name: "Gautam Buddha Nagar", code: "0910" },
  { name: "Banswara", code: "0828" },
  { name: "Badgam", code: "0104" },
  { name: "Bageshwar", code: "0508" },
  { name: "Lahul And Spiti", code: "0203" },
];

// Helper function to check if LValues has any non-zero values
const hasNonZeroLValues = (values: LValues) => {
  return Object.values(values).some((v) => v !== 0);
};

// Helper function to find dominant land use type
const findDominantLandUseType = (values: LValues): string => {
  let maxKey = 'l01';
  let maxValue = values.l01;
  
  // Check all lValues to find the maximum
  Object.entries(values).forEach(([key, value]) => {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  });
  
  return maxKey;
};

async function fetchDistrictGeoJSON(districtCode: string): Promise<any> {
  return await fetch(`geojson/district_${districtCode}.json`).then((res) =>
    res.json()
  );
}

// Get thematic data from API
async function fetchThematicData(districtCode: string): Promise<ThematicData> {
  try {
    // Try to fetch from the backend proxy first (preferred approach to avoid CORS)
    const response = await fetch(
      `/api/lulc?district=${districtCode}`
    );
    return await response.json();
  } catch (error) {
    // Fallback to direct API call (may face CORS issues)
    console.error("Error using proxy, trying direct API:", error);
    const response = await fetch(
      `https://bhuvan.nrsc.gov.in/api/thematic/l01-l24?district=${districtCode}`
    );
    return await response.json();
  }
}

// Style function that uses the LULC color mapping
const styleFeature = (
  feature: any,
  thematicData: ThematicData | null
): L.PathOptions => {
  if (!thematicData) {
    return { fillColor: "gray", weight: 1, fillOpacity: 0.4, color: "black" };
  }
  
  const areaId = feature.properties.id;
  const lValues = thematicData[areaId];

  if (lValues && hasNonZeroLValues(lValues)) {
    // Find dominant land use type
    const dominantType = findDominantLandUseType(lValues);
    
    // Use the corresponding color from LULC categories
    return {
      fillColor: lulcCategories[dominantType as keyof typeof lulcCategories].color,
      weight: 1,
      fillOpacity: 0.7,
      color: "black",
    };
  }
  
  // Default style for areas with no data
  return { fillColor: "white", weight: 1, fillOpacity: 0.2, color: "gray" };
};

const MapViewReset = ({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Custom Legend Control Component
interface LegendControlProps {
  thematicData: ThematicData | null;
}

// Custom Legend Component using CSS and DOM directly
const LegendControl = ({ thematicData }: LegendControlProps) => {
  const map = useMap();
  
  useEffect(() => {
    // Create a legend div
    const legendDiv = L.DomUtil.create('div', 'info legend');
    legendDiv.style.backgroundColor = 'white';
    legendDiv.style.padding = '10px';
    legendDiv.style.borderRadius = '5px';
    legendDiv.style.border = '1px solid #ccc';
    legendDiv.style.maxHeight = '300px';
    legendDiv.style.overflowY = 'auto';
    legendDiv.style.position = 'absolute';
    legendDiv.style.bottom = '10px';
    legendDiv.style.right = '10px';
    legendDiv.style.zIndex = '1000';
    
    let labels = ['<strong>LULC Categories</strong><br>'];
    
    // If we have thematic data, find which categories are present
    if (thematicData) {
      const presentLandUseTypes = new Set<string>();
      
      Object.values(thematicData).forEach((lValues) => {
        if (hasNonZeroLValues(lValues)) {
          const dominantType = findDominantLandUseType(lValues);
          presentLandUseTypes.add(dominantType);
        }
      });
      
      // Add legend items only for the land use types present in the current data
      if (presentLandUseTypes.size > 0) {
        Array.from(presentLandUseTypes).forEach(key => {
          const category = lulcCategories[key as keyof typeof lulcCategories];
          labels.push(
            `<div style="display: flex; align-items: center; margin-bottom: 5px;">
              <i style="background: ${category.color}; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></i>
              <span>${category.name}</span>
            </div>`
          );
        });
      }
    }
    
    // If no data or no present types, show the main categories
    if (labels.length === 1) {
      Object.entries(lulcCategories).slice(0, 18).forEach(([, category]) => {
        labels.push(
          `<div style="display: flex; align-items: center; margin-bottom: 5px;">
            <i style="background: ${category.color}; width: 15px; height: 15px; display: inline-block; margin-right: 5px;"></i>
            <span>${category.name}</span>
          </div>`
        );
      });
    }
    
    legendDiv.innerHTML = labels.join('');
    
    // Create a custom control and add it to the map
    const CustomControl = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: function() {
        return legendDiv;
      }
    });
    
    const customControl = new CustomControl();
    customControl.addTo(map);
    
    // Clean up
    return () => {
      map.removeControl(customControl);
    };
  }, [map, thematicData]);
  
  return null;
};

const LeafletBhuvanMap: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [thematicData, setThematicData] = useState<ThematicData | null>(null);

  const defaultCenter: LatLngExpression = [20.5937, 78.9629]; 
  const zoomLevel = 6;

  const onDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const district = districts.find((d) => d.code === code) || null;
    setSelectedDistrict(district);
  };

  useEffect(() => {
    if (!selectedDistrict) {
      setGeoJsonData(null);
      setThematicData(null);
      return;
    }

    async function fetchData() {
      if (!selectedDistrict) {
        setGeoJsonData(null);
        setThematicData(null);
        return;
      }
      try {
        const [geoJson, themeData] = await Promise.all([
          fetchDistrictGeoJSON(selectedDistrict.code),
          fetchThematicData(selectedDistrict.code),
        ]);
        setGeoJsonData(geoJson);
        setThematicData(themeData);
      } catch (error) {
        console.error("Failed to fetch data", error);
        setGeoJsonData(null);
        setThematicData(null);
      }
    }
    fetchData();
  }, [selectedDistrict]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <div style={{ padding: 10 }}>
        <label htmlFor="district-select">Select District: </label>
        <select id="district-select" onChange={onDistrictChange}>
          <option value="">-- Select District --</option>
          {districts.map((d) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        style={{ height: "90vh", width: "100%" }}
      >
        <MapViewReset
          center={
            selectedDistrict && geoJsonData && geoJsonData.features?.[0]?.geometry?.coordinates
              ? [
                  geoJsonData.features[0].geometry.coordinates[0][0][1], // latitude
                  geoJsonData.features[0].geometry.coordinates[0][0][0], // longitude
                ]
              : defaultCenter
          }
          zoom={selectedDistrict ? 9 : zoomLevel}
        />
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && (
          <GeoJSON
            data={geoJsonData}
            style={(feature) => styleFeature(feature, thematicData)}
          />
        )}
        {/* Add the legend if we have thematic data */}
        {thematicData && <LegendControl thematicData={thematicData} />}
      </MapContainer>
    </div>
  );
};

export default LeafletBhuvanMap;
