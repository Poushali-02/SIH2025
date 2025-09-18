import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import axios from "axios";

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
  l01: { name: "Built Up (Urban)", color: "#FF0000", visible: true },         // Red
  l02: { name: "Built Up (Rural)", color: "#FF7777", visible: true },         // Light Red
  l03: { name: "Mining", color: "#A0522D", visible: true },                   // Brown
  l04: { name: "Agriculture (Cropland)", color: "#FFFF00", visible: true },   // Yellow
  l05: { name: "Agriculture (Plantation)", color: "#7CFC00", visible: true }, // Lawn Green
  l06: { name: "Agriculture (Fallow)", color: "#F4A460", visible: true },     // Sandy Brown
  l07: { name: "Wetland (Inland)", color: "#00FFFF", visible: true },         // Cyan
  l08: { name: "Wetland (Coastal)", color: "#00CED1", visible: true },        // Dark Turquoise
  l09: { name: "Forest (Evergreen)", color: "#006400", visible: true },       // Dark Green
  l10: { name: "Forest (Deciduous)", color: "#228B22", visible: true },       // Forest Green
  l11: { name: "Forest (Shrub)", color: "#90EE90", visible: true },           // Light Green
  l12: { name: "Forest (Swamp)", color: "#008080", visible: true },           // Teal
  l13: { name: "Grassland", color: "#ADFF2F", visible: true },                // Green Yellow
  l14: { name: "Wasteland", color: "#D2B48C", visible: true },                // Tan
  l15: { name: "Barren/Unculturable/Gullied", color: "#DEB887", visible: true }, // Burlywood
  l16: { name: "Snow and Glaciers", color: "#FFFFFF", visible: true },        // White
  l17: { name: "Water Bodies", color: "#0000FF", visible: true },             // Blue
  l18: { name: "Others", color: "#808080", visible: true },                   // Gray
  l19: { name: "Cloud Cover", color: "#DCDCDC", visible: true },              // Gainsboro
  l20: { name: "Prelims Data", color: "#F0F8FF", visible: true },             // Alice Blue
  l21: { name: "Reserved", color: "#E6E6FA", visible: true },                 // Lavender
  l22: { name: "Reserved", color: "#D8BFD8", visible: true },                 // Thistle
  l23: { name: "Reserved", color: "#DDA0DD", visible: true },                 // Plum
  l24: { name: "Reserved", color: "#EE82EE", visible: true }                  // Violet
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
const hasNonZeroLValues = (values: LValues | null | undefined) => {
  if (!values) return false;
  return Object.values(values).some((v) => parseFloat(String(v).trim() || '0') > 0);
};

// Helper function to find dominant land use type
const findDominantLandUseType = (values: LValues, visibleLayers?: Record<string, boolean>): string => {
  let maxKey = 'l01'; // Default to built-up urban
  let maxValue = 0;
  
  // Check all lValues to find the maximum
  Object.entries(values).forEach(([key, value]) => {
    // Skip if layer is not visible
    if (visibleLayers && !visibleLayers[key]) return;
    
    // Clean and parse the value
    const numValue = typeof value === 'number' ? value : parseFloat(String(value).trim() || '0');
    
    if (numValue > maxValue) {
      maxValue = numValue;
      maxKey = key;
    }
  });
  
  // If no dominant visible layer was found (all values are 0 or layers are hidden),
  // return l01 (built-up) as default
  return maxKey;
};

// Process LULC response from Bhuvan API
const processLulcResponse = (data: any): ThematicData => {
  const thematicData: ThematicData = {};
  
  // Handle different possible response formats from the Bhuvan API
  
  // Helper function to clean and parse LULC values
  const cleanLulcValue = (value: any): number => {
    if (value === undefined || value === null) return 0;
    
    // If it's already a number, return it
    if (typeof value === 'number') return value;
    
    // If it's a string, trim spaces and convert to number
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return 0;
      const parsed = parseFloat(trimmed);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    // For any other type, try to convert to number
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Format 1: Direct object with LULC code properties
  if (data && typeof data === 'object' && !Array.isArray(data) && !data.features) {
    console.log("Processing direct LULC data format");
    
    // Use district code as area ID if available, otherwise use a default
    const areaId = data.district_code || data.state_code || "area1";
    
    // Check if we have any LULC data in the expected format (L01, L02, etc.)
    const lValues: LValues = {
      l01: cleanLulcValue(data.L01 || data.l01),
      l02: cleanLulcValue(data.L02 || data.l02),
      l03: cleanLulcValue(data.L03 || data.l03),
      l04: cleanLulcValue(data.L04 || data.l04),
      l05: cleanLulcValue(data.L05 || data.l05),
      l06: cleanLulcValue(data.L06 || data.l06),
      l07: cleanLulcValue(data.L07 || data.l07),
      l08: cleanLulcValue(data.L08 || data.l08),
      l09: cleanLulcValue(data.L09 || data.l09),
      l10: cleanLulcValue(data.L10 || data.l10),
      l11: cleanLulcValue(data.L11 || data.l11),
      l12: cleanLulcValue(data.L12 || data.l12),
      l13: cleanLulcValue(data.L13 || data.l13),
      l14: cleanLulcValue(data.L14 || data.l14),
      l15: cleanLulcValue(data.L15 || data.l15),
      l16: cleanLulcValue(data.L16 || data.l16),
      l17: cleanLulcValue(data.L17 || data.l17),
      l18: cleanLulcValue(data.L18 || data.l18),
      l19: cleanLulcValue(data.L19 || data.l19),
      l20: cleanLulcValue(data.L20 || data.l20),
      l21: cleanLulcValue(data.L21 || data.l21),
      l22: cleanLulcValue(data.L22 || data.l22),
      l23: cleanLulcValue(data.L23 || data.l23),
      l24: cleanLulcValue(data.L24 || data.l24),
    };
    
    thematicData[areaId] = lValues;
    return thematicData;
  }
  
  // Format 2: GeoJSON format with features array
  if (data && data.features && Array.isArray(data.features)) {
    console.log("Processing GeoJSON LULC data format");
    
    // Process each feature (typically just one for the district)
    data.features.forEach((feature: any) => {
      if (feature.properties) {
        // Use feature ID if available, or create one
        const areaId = feature.properties.id || feature.id || `area${Object.keys(thematicData).length + 1}`;
        
        // Convert Bhuvan's format to our LValues format
        const lValues: LValues = {
          l01: parseFloat(feature.properties.L01 || feature.properties.l01 || 0),
          l02: parseFloat(feature.properties.L02 || feature.properties.l02 || 0),
          l03: parseFloat(feature.properties.L03 || feature.properties.l03 || 0),
          l04: parseFloat(feature.properties.L04 || feature.properties.l04 || 0),
          l05: parseFloat(feature.properties.L05 || feature.properties.l05 || 0),
          l06: parseFloat(feature.properties.L06 || feature.properties.l06 || 0),
          l07: parseFloat(feature.properties.L07 || feature.properties.l07 || 0),
          l08: parseFloat(feature.properties.L08 || feature.properties.l08 || 0),
          l09: parseFloat(feature.properties.L09 || feature.properties.l09 || 0),
          l10: parseFloat(feature.properties.L10 || feature.properties.l10 || 0),
          l11: parseFloat(feature.properties.L11 || feature.properties.l11 || 0),
          l12: parseFloat(feature.properties.L12 || feature.properties.l12 || 0),
          l13: parseFloat(feature.properties.L13 || feature.properties.l13 || 0),
          l14: parseFloat(feature.properties.L14 || feature.properties.l14 || 0),
          l15: parseFloat(feature.properties.L15 || feature.properties.l15 || 0),
          l16: parseFloat(feature.properties.L16 || feature.properties.l16 || 0),
          l17: parseFloat(feature.properties.L17 || feature.properties.l17 || 0),
          l18: parseFloat(feature.properties.L18 || feature.properties.l18 || 0),
          l19: parseFloat(feature.properties.L19 || feature.properties.l19 || 0),
          l20: parseFloat(feature.properties.L20 || feature.properties.l20 || 0),
          l21: parseFloat(feature.properties.L21 || feature.properties.l21 || 0),
          l22: parseFloat(feature.properties.L22 || feature.properties.l22 || 0),
          l23: parseFloat(feature.properties.L23 || feature.properties.l23 || 0),
          l24: parseFloat(feature.properties.L24 || feature.properties.l24 || 0),
        };
        
        thematicData[areaId] = lValues;
      }
    });
  }
  
  // Format 3: Array of objects with LULC data
  if (Array.isArray(data)) {
    console.log("Processing array LULC data format");
    
    data.forEach((item, index) => {
      if (typeof item === 'object' && item !== null) {
        const areaId = item.district_code || item.state_code || `area${index + 1}`;
        
        const lValues: LValues = {
          l01: cleanLulcValue(item.L01 || item.l01),
          l02: cleanLulcValue(item.L02 || item.l02),
          l03: cleanLulcValue(item.L03 || item.l03),
          l04: cleanLulcValue(item.L04 || item.l04),
          l05: cleanLulcValue(item.L05 || item.l05),
          l06: cleanLulcValue(item.L06 || item.l06),
          l07: cleanLulcValue(item.L07 || item.l07),
          l08: cleanLulcValue(item.L08 || item.l08),
          l09: cleanLulcValue(item.L09 || item.l09),
          l10: cleanLulcValue(item.L10 || item.l10),
          l11: cleanLulcValue(item.L11 || item.l11),
          l12: cleanLulcValue(item.L12 || item.l12),
          l13: cleanLulcValue(item.L13 || item.l13),
          l14: cleanLulcValue(item.L14 || item.l14),
          l15: cleanLulcValue(item.L15 || item.l15),
          l16: cleanLulcValue(item.L16 || item.l16),
          l17: cleanLulcValue(item.L17 || item.l17),
          l18: cleanLulcValue(item.L18 || item.l18),
          l19: cleanLulcValue(item.L19 || item.l19),
          l20: cleanLulcValue(item.L20 || item.l20),
          l21: cleanLulcValue(item.L21 || item.l21),
          l22: cleanLulcValue(item.L22 || item.l22),
          l23: cleanLulcValue(item.L23 || item.l23),
          l24: cleanLulcValue(item.L24 || item.l24),
        };
        
        thematicData[areaId] = lValues;
      }
    });
  }
  
  // Format 4: String response that needs to be parsed
  if (typeof data === 'string') {
    console.log("Processing string LULC data format");
    try {
      // Try to parse as JSON
      const parsedData = JSON.parse(data);
      // Call ourselves recursively with the parsed data
      return processLulcResponse(parsedData);
    } catch (error) {
      console.error("Failed to parse string response as JSON:", error);
    }
  }
  
  // If we couldn't find valid LULC data in any format, log an error
  if (Object.keys(thematicData).length === 0) {
    console.error("Could not extract LULC data from response:", data);
  } else {
    console.log(`Successfully extracted LULC data for ${Object.keys(thematicData).length} areas`);
  }
  
  return thematicData;
};

async function fetchDistrictGeoJSON(districtCode: string, districtName: string): Promise<any> {
  try {
    // Try to get district polygon from OpenStreetMap
    const district = await getDistrictPolygon(districtName);
    if (district) {
      return district;
    }
    
    // Fallback to local files if OpenStreetMap fails
    console.log("Falling back to local GeoJSON files");
    try {
      const response = await fetch(`geojson/district_${districtCode}.json`);
      return await response.json();
    } catch (error) {
      console.error("Error loading local GeoJSON:", error);
      throw new Error("Failed to load district polygon data");
    }
  } catch (error) {
    console.error("Error in fetchDistrictGeoJSON:", error);
    throw error;
  }
}

async function getDistrictPolygon(districtName: string): Promise<any> {
  try {
    console.log(`Fetching OpenStreetMap polygon for district: ${districtName}`);
    
    // Use our backend proxy to avoid CORS issues
    const response = await axios.get(`/api/osm/search?q=${encodeURIComponent(districtName + ", India")}`);
    
    if (response.data && response.data.features && response.data.features.length > 0) {
      // Find polygon matching administrative level for district
      let districtFeature = response.data.features.find((feat: any) =>
         feat.properties.type === "administrative" || feat.properties.class === "boundary"
      );
      
      if (!districtFeature) {
        districtFeature = response.data.features[0]; // fallback to first feature
      }
      
      console.log("Found district polygon from OpenStreetMap");
      
      // Check if districtFeature is already a FeatureCollection
      if (districtFeature.type === "FeatureCollection") {
        return districtFeature;
      }
      
      // If it's a single feature, wrap it in a FeatureCollection
      return {
        type: "FeatureCollection",
        features: [districtFeature]
      };
    } else {
      console.warn("No polygon data found on OSM for:", districtName);
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch district polygon:", error);
    return null;
  }
}

async function fetchThematicData(districtCode: string): Promise<ThematicData> {
  try {
    console.log(`Fetching LULC data via proxy for district code: ${districtCode}`);
    
    // Use API token from environment variables
    const token = import.meta.env.VITE_LULC_API || '';
    
    // Use axios for better error handling and response processing
    const response = await axios.get(`/api/lulc`, {
      params: {
        distcode: districtCode,
        year: '1112',
        token: token
      }
    });
    
    console.log("Data received from API:", response.data);
    
    // Process the response to convert it to our expected format
    return processLulcResponse(response.data);
  } catch (error) {
    console.error("Error fetching LULC data:", error);
    
    // Return an empty data structure - we don't need to try direct API as it will fail due to CORS
    return {};
  }
}

// Style function that uses the LULC color mapping
const styleFeature = (
  feature: any,
  thematicData: ThematicData | null,
  visibleLayers?: Record<string, boolean>
): L.PathOptions => {
  if (!thematicData) {
    // Enhanced default styling with thicker border, higher contrast for better visibility
    return { 
      fillColor: "#e0e0e0", 
      weight: 3.5, 
      fillOpacity: 0.4, 
      color: "#000000", 
      opacity: 0.9,
      dashArray: "5, 5" 
    };
  }
  
  // Try to get area ID from different property fields
  const areaId = feature.properties?.id || 
                feature.properties?.osm_id || 
                feature.properties?.code ||
                feature.properties?.districtCode || 
                feature.properties?.district_code;
  
  const lValues = areaId ? thematicData[areaId] : null;

  if (lValues && hasNonZeroLValues(lValues)) {
    // Find dominant land use type, respecting visible layers
    const dominantType = findDominantLandUseType(lValues, visibleLayers);
    
    // Use the corresponding color from LULC categories with enhanced styling
    return {
      fillColor: lulcCategories[dominantType as keyof typeof lulcCategories].color,
      weight: 3, // Thicker border
      fillOpacity: 0.7, // More opaque fill
      color: "#222222", // Darker border for better contrast
      opacity: 0.9, // More opaque border
      dashArray: "",
    };
  }
  
  // Enhanced default style for areas with no data - more visible
  return { 
    fillColor: "#f0f0f0", 
    weight: 3, 
    fillOpacity: 0.3, 
    color: "#333333", // Darker border
    opacity: 0.8, // More opaque border
    dashArray: "3, 5"
  };
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

// Custom component to fit the map bounds to the GeoJSON data
const FitBoundsToData = ({ geoJsonData }: { geoJsonData: any }) => {
  const map = useMap();
  
  useEffect(() => {
    if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
      try {
        // Create a GeoJSON layer to get the bounds
        const geoJsonLayer = L.geoJSON(geoJsonData);
        const bounds = geoJsonLayer.getBounds();
        
        if (bounds.isValid()) {
          console.log("Fitting map to bounds:", bounds);
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (error) {
        console.error("Error fitting bounds to data:", error);
      }
    }
  }, [geoJsonData, map]);
  
  return null;
};

// Component to handle LULC layer visibility
interface LulcLayerControlProps {
  thematicData: ThematicData | null;
  onLayerToggle: (layerId: string, visible: boolean) => void;
}

const LulcLayerControl: React.FC<LulcLayerControlProps> = ({ thematicData, onLayerToggle }) => {
  const map = useMap();
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
    // Initialize all layers as visible by default
    const initialState: Record<string, boolean> = {};
    Object.keys(lulcCategories).forEach(key => {
      initialState[key] = true;
    });
    return initialState;
  });
  
  useEffect(() => {
    if (!thematicData) return;
    
    // Create a control panel for LULC layers
    const controlDiv = L.DomUtil.create('div', 'info layer-control');
    controlDiv.style.backgroundColor = 'white';
    controlDiv.style.padding = '12px';
    controlDiv.style.borderRadius = '6px';
    controlDiv.style.border = '2px solid #888';
    controlDiv.style.maxHeight = '400px';
    controlDiv.style.width = '270px';
    controlDiv.style.overflowY = 'auto';
    controlDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    
    // Prevent map events from propagating through the control
    L.DomEvent.disableClickPropagation(controlDiv);
    L.DomEvent.disableScrollPropagation(controlDiv);
    
    // Identify which LULC categories are present in the data
    const presentCategories = new Set<string>();
    let hasAnyLulcData = false;
    
    Object.values(thematicData).forEach(lValues => {
      if (!lValues) return;
      Object.entries(lValues).forEach(([key, value]) => {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value).trim() || '0');
        if (key.startsWith('l') && numValue > 0) {
          presentCategories.add(key);
          hasAnyLulcData = true;
        }
      });
    });
    
    controlDiv.innerHTML = `
      <div style="font-weight:bold;font-size:14px;margin-bottom:10px;border-bottom:1px solid #ccc;padding-bottom:8px;">
        LULC Layer Control
        <span style="float:right;cursor:pointer;color:#999;" id="toggle-all-lulc">Show/Hide All</span>
      </div>
    `;
    
    // Group categories for better organization
    const categoryGroups = {
      'Built-up': ['l01', 'l02', 'l03'],
      'Agriculture': ['l04', 'l05', 'l06'],
      'Wetland': ['l07', 'l08'],
      'Forest': ['l09', 'l10', 'l11', 'l12'],
      'Other Natural': ['l13', 'l14', 'l15', 'l16', 'l17'],
      'Misc': ['l18', 'l19', 'l20', 'l21', 'l22', 'l23', 'l24']
    };
    
    // Create layer toggles grouped by category
    Object.entries(categoryGroups).forEach(([groupName, layerIds]) => {
      // Check if any layer in this group is present in the data
      const isGroupPresent = layerIds.some(id => presentCategories.has(id));
      const isImportantGroup = groupName === 'Built-up' || groupName === 'Agriculture' || groupName === 'Other Natural';
      
      if (isGroupPresent || isImportantGroup || !hasAnyLulcData) {
        // Create group header
        const groupHeader = document.createElement('div');
        groupHeader.style.fontWeight = 'bold';
        groupHeader.style.marginTop = '8px';
        groupHeader.style.marginBottom = '5px';
        groupHeader.textContent = groupName;
        controlDiv.appendChild(groupHeader);
        
        // Create layer toggles for this group
        layerIds.forEach(layerId => {
          const layerInfo = lulcCategories[layerId as keyof typeof lulcCategories];
          
          if (presentCategories.has(layerId) || 
              layerId === 'l01' || layerId === 'l04' || layerId === 'l17' || 
              !hasAnyLulcData) {
            
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.marginBottom = '6px';
            row.style.marginLeft = '10px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `lulc-layer-${layerId}`;
            checkbox.checked = visibleLayers[layerId];
            checkbox.style.marginRight = '5px';
            
            const label = document.createElement('label');
            label.htmlFor = `lulc-layer-${layerId}`;
            label.innerHTML = `<span style="display:inline-block;width:18px;height:18px;background-color:${layerInfo.color};margin-right:8px;border:1px solid #888;"></span> ${layerInfo.name}`;
            
            checkbox.addEventListener('change', (e) => {
              const isVisible = (e.target as HTMLInputElement).checked;
              
              // Update state and notify parent
              setVisibleLayers(prev => ({...prev, [layerId]: isVisible}));
              onLayerToggle(layerId, isVisible);
              
              // Trigger a map update to reflect the changes
              setTimeout(() => {
                map.invalidateSize();
              }, 50);
            });
            
            row.appendChild(checkbox);
            row.appendChild(label);
            controlDiv.appendChild(row);
          }
        });
      }
    });
    
    // Add the control to the map
    const customControl = L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function() {
        return controlDiv;
      }
    });
    
    const control = new customControl();
    control.addTo(map);
    
    // Set up toggle all button
    const toggleAllBtn = controlDiv.querySelector('#toggle-all-lulc');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        // Determine current state - if any are visible, we'll hide all, otherwise show all
        const anyVisible = Object.values(visibleLayers).some(v => v);
        const newState = !anyVisible;
        
        // Create new state with all layers set to new visibility
        const newLayerState: Record<string, boolean> = {};
        Object.keys(lulcCategories).forEach(key => {
          newLayerState[key] = newState;
        });
        
        // Update state and notify parent for each layer
        setVisibleLayers(newLayerState);
        Object.keys(newLayerState).forEach(layerId => {
          onLayerToggle(layerId, newState);
        });
        
        // Update checkboxes to reflect new state
        const checkboxes = controlDiv.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox) => {
          (checkbox as HTMLInputElement).checked = newState;
        });
        
        // Trigger a map update
        setTimeout(() => {
          map.invalidateSize();
        }, 50);
      });
    }
    
    return () => {
      map.removeControl(control);
    };
  }, [map, thematicData, visibleLayers, onLayerToggle]);
  
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
    // Create a legend div with improved styling
    const legendDiv = L.DomUtil.create('div', 'info legend');
    legendDiv.style.backgroundColor = 'white';
    legendDiv.style.padding = '12px';
    legendDiv.style.borderRadius = '6px';
    legendDiv.style.border = '2px solid #888';
    legendDiv.style.maxHeight = '300px';
    legendDiv.style.overflowY = 'auto';
    legendDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
    
    // Prevent map events from propagating through the control
    L.DomEvent.disableClickPropagation(legendDiv);
    L.DomEvent.disableScrollPropagation(legendDiv);
    
    let labels = ['<strong style="font-size:14px;">LULC Categories</strong><hr style="margin:8px 0;border:none;border-top:1px solid #ccc;">'];
    
    // Group categories for better organization
    const categoryGroups = {
      'Built-up': ['l01', 'l02', 'l03'],
      'Agriculture': ['l04', 'l05', 'l06'],
      'Wetland': ['l07', 'l08'],
      'Forest': ['l09', 'l10', 'l11', 'l12'],
      'Other Natural': ['l13', 'l14', 'l15', 'l16', 'l17'],
      'Misc': ['l18', 'l19', 'l20', 'l21', 'l22', 'l23', 'l24']
    };
    
    // If we have thematic data, find which categories are present
    const presentLandUseTypes = new Set<string>();
    
    if (thematicData) {
      Object.values(thematicData).forEach((lValues) => {
        if (hasNonZeroLValues(lValues)) {
          // Get all land use types with non-zero values in this area
          Object.entries(lValues).forEach(([key, value]) => {
            const numValue = typeof value === 'number' ? value : parseFloat(String(value).trim() || '0');
            if (numValue > 0) {
              presentLandUseTypes.add(key);
            }
          });
        }
      });
    }
    
    const showAllCategories = presentLandUseTypes.size === 0;
    
    // Add legend items grouped by category
    Object.entries(categoryGroups).forEach(([groupName, layerIds]) => {
      // Check if any layer in this group is present in the data
      const presentLayersInGroup = layerIds.filter(id => 
        presentLandUseTypes.has(id) || showAllCategories
      );
      
      if (presentLayersInGroup.length > 0) {
        // Add a group header
        labels.push(`<div style="font-weight:bold;margin-top:8px;margin-bottom:5px;">${groupName}</div>`);
        
        // Add the layers in this group
        presentLayersInGroup.forEach(layerId => {
          const category = lulcCategories[layerId as keyof typeof lulcCategories];
          labels.push(
            `<div style="display: flex; align-items: center; margin-bottom: 6px; margin-left: 10px;">
              <i style="background: ${category.color}; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid #888;"></i>
              <span style="font-size: 12px;">${category.name}</span>
            </div>`
          );
        });
      }
    });
    
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
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
    // Initialize all layers as visible by default
    const initialState: Record<string, boolean> = {};
    Object.keys(lulcCategories).forEach(key => {
      initialState[key] = true;
    });
    return initialState;
  });

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
          fetchDistrictGeoJSON(selectedDistrict.code, selectedDistrict.name),
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
  
  // Debug effect to log GeoJSON data
  useEffect(() => {
    if (geoJsonData) {
      console.log("GeoJSON data loaded:", geoJsonData);
    }
  }, [geoJsonData]);
  
  // Handle layer visibility toggle
  const handleLayerToggle = useCallback((layerId: string, visible: boolean) => {
    console.log(`Layer ${layerId} toggled to ${visible ? 'visible' : 'hidden'}`);
    setVisibleLayers(prev => ({...prev, [layerId]: visible}));
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ 
        padding: "15px", 
        background: "#f5f5f5", 
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center"
      }}>
        <label 
          htmlFor="district-select" 
          style={{ 
            marginRight: "10px",
            fontWeight: "bold"
          }}
        >
          Select District:
        </label>
        <select 
          id="district-select" 
          onChange={onDistrictChange}
          style={{
            padding: "8px 12px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            minWidth: "250px",
            backgroundColor: "white"
          }}
          value={selectedDistrict?.code || ""}
        >
          <option value="">-- Select District --</option>
          {districts.map((d: District) => (
            <option key={d.code} value={d.code}>
              {d.name}
            </option>
          ))}
        </select>
        
        {selectedDistrict && (
          <div style={{ 
            marginLeft: "20px", 
            fontSize: "14px",
            display: "flex",
            alignItems: "center"
          }}>
            <span style={{ 
              fontWeight: "bold", 
              backgroundColor: "#4CAF50",
              color: "white",
              padding: "6px 12px",
              borderRadius: "4px"
            }}>
              District: {selectedDistrict.name} ({selectedDistrict.code})
            </span>
          </div>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        style={{ 
          height: "calc(100vh - 60px)", 
          width: "100%",
          border: "1px solid #ccc" 
        }}
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
            key={`geojson-${selectedDistrict?.code || 'none'}`} // Force re-render when district changes
            data={geoJsonData}
            style={(feature) => styleFeature(feature, thematicData, visibleLayers)}
            onEachFeature={(feature, layer) => {
              try {
                // Add popup with feature information if available
                const props = feature.properties;
                const name = props?.name || props?.district_name || props?.title || selectedDistrict?.name || "Unknown";
                
                // Create a more informative popup
                const popupContent = document.createElement('div');
                popupContent.style.fontSize = '14px';
                
                // Add district name
                const header = document.createElement('h4');
                header.style.margin = '0 0 8px 0';
                header.textContent = name;
                popupContent.appendChild(header);
                
                // Add dominant land use if available
                if (thematicData) {
                  const areaId = props?.id || props?.osm_id || props?.code || 
                                props?.districtCode || props?.district_code;
                                
                  if (areaId && thematicData[areaId]) {
                    const lValues = thematicData[areaId];
                    if (hasNonZeroLValues(lValues)) {
                      const dominantType = findDominantLandUseType(lValues, visibleLayers);
                      const landUseType = lulcCategories[dominantType as keyof typeof lulcCategories];
                      
                      // Display dominant land use with color
                      const landUseInfo = document.createElement('div');
                      landUseInfo.style.marginTop = '5px';
                      landUseInfo.innerHTML = `
                        <div>Dominant land use: 
                          <span style="display:inline-block;width:12px;height:12px;background-color:${landUseType.color};margin-right:5px;border:1px solid #888;"></span>
                          <b>${landUseType.name}</b>
                        </div>
                      `;
                      popupContent.appendChild(landUseInfo);
                    }
                  }
                }
                
                // Bind popup with the rich content
                layer.bindPopup(popupContent);
                
                // Also add a tooltip for quick hover info
                layer.bindTooltip(name, {
                  permanent: false,
                  direction: 'center',
                  className: 'district-tooltip'
                });
                
                // Add events for hover highlight
                layer.on({
                  mouseover: (e) => {
                    const l = e.target;
                    l.setStyle({
                      weight: 4,
                      opacity: 1,
                      dashArray: '',
                    });
                    l.bringToFront();
                  },
                  mouseout: (e) => {
                    const l = e.target;
                    l.setStyle(styleFeature(feature, thematicData, visibleLayers));
                  }
                });
              } catch (error) {
                console.error("Error setting up feature interactions:", error);
              }
            }}
          />
        )}
        {/* Add the legend if we have thematic data */}
        {thematicData && (
          <>
            <LegendControl thematicData={thematicData} />
            <LulcLayerControl thematicData={thematicData} onLayerToggle={handleLayerToggle} />
          </>
        )}
        {geoJsonData && <FitBoundsToData geoJsonData={geoJsonData} />}
      </MapContainer>
    </div>
  );
};

export default LeafletBhuvanMap;
