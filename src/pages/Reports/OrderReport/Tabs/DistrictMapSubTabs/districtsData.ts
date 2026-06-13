import districtDataRaw from "./bangladesh_districts.json";

export type DistrictStat = {
  name: string;
  coordinates: [number, number];
  count: number;
  revenue: number;
};

// This file contains the 64 districts data with statistics.
// In a real application, this data would come from an API.
export const getDistrictsStats = (): DistrictStat[] => {
  return districtDataRaw.districts.map((d) => {
    let count = 0;
    let revenue = 0;

    // Mocking realistic data for all 64 districts
    // Major Cities
    if (d.name === "Dhaka") {
      count = 452;
      revenue = 1250000;
    } else if (d.name === "Chattogram") {
      count = 285;
      revenue = 850000;
    } else if (d.name === "Gazipur") {
      count = 0;
      revenue = 580000;
    } else if (d.name === "Narayanganj") {
      count = 0;
      revenue = 490000;
    } else if (d.name === "Sylhet") {
      count = 142;
      revenue = 420000;
    } else if (d.name === "Cumilla") {
      count = 128;
      revenue = 380000;
    } else if (d.name === "Bogura") {
      count = 115;
      revenue = 340000;
    } else if (d.name === "Rajshahi") {
      count = 108;
      revenue = 320000;
    } else if (d.name === "Khulna") {
      count = 98;
      revenue = 290000;
    } else if (d.name === "Mymensingh") {
      count = 85;
      revenue = 250000;
    } else if (d.name === "Barishal") {
      count = 76;
      revenue = 220000;
    } else if (d.name === "Rangpur") {
      count = 72;
      revenue = 210000;
    } else if (d.name === "Noakhali") {
      count = 68;
      revenue = 195000;
    } else if (d.name === "Feni") {
      count = 62;
      revenue = 180000;
    } else if (d.name === "Cox's Bazar") {
      count = 58;
      revenue = 170000;
    } else if (d.name === "Tangail") {
      count = 54;
      revenue = 160000;
    } else if (d.name === "Jashore") {
      count = 51;
      revenue = 150000;
    } else if (d.name === "Pabna") {
      count = 48;
      revenue = 140000;
    } else if (d.name === "Kushtia") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Dinajpur") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Faridpur") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Jamalpur") {
      count = 36;
      revenue = 105000;
    } else if (d.name === "Brahmanbaria") {
      count = 34;
      revenue = 100000;
    } else if (d.name === "Chandpur") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Lakshmipur") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Narsingdi") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Munshiganj") {
      count = 26;
      revenue = 75000;
    } else if (d.name === "Satkhira") {
      count = 24;
      revenue = 70000;
    } else if (d.name === "Naogaon") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Sirajganj") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Netrokona") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Sherpur") {
      count = 18;
      revenue = 50000;
    } else if (d.name === "Kishoreganj") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Sunamganj") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Habiganj") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Maulvibazar") {
      count = 14;
      revenue = 40000;
    } else if (d.name === "Kurigram") {
      count = 13;
      revenue = 38000;
    } else if (d.name === "Gaibandha") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Nilphamari") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Lalmonirhat") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Thakurgaon") {
      count = 9;
      revenue = 28000;
    } else if (d.name === "Panchagarh") {
      count = 8;
      revenue = 25000;
    } else if (d.name === "Bhola") {
      count = 7;
      revenue = 22000;
    } else if (d.name === "Patuakhali") {
      count = 6;
      revenue = 18000;
    } else if (d.name === "Barguna") {
      count = 5;
      revenue = 15000;
    } else if (d.name === "Pirojpur") {
      count = 4;
      revenue = 12000;
    } else if (d.name === "Jhalokati") {
      count = 3;
      revenue = 10000;
    } else if (d.name === "Chuadanga") {
      count = 2;
      revenue = 8000;
    } else if (d.name === "Meherpur") {
      count = 1;
      revenue = 5000;
    } else if (d.name === "Narail") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Bagerhat") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Magura") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Jhenaidah") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Natore") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Joypurhat") {
      count = 2;
      revenue = 7000;
    } else if (d.name === "Chapai Nawabganj") {
      count = 4;
      revenue = 11000;
    } else if (d.name === "Rajbari") {
      count = 1;
      revenue = 3000;
    } else if (d.name === "Gopalganj") {
      count = 2;
      revenue = 5000;
    } else if (d.name === "Madaripur") {
      count = 1;
      revenue = 4000;
    } else if (d.name === "Shariatpur") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Manikganj") {
      count = 1;
      revenue = 3000;
    } else if (d.name === "Rangamati") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Khagrachari") {
      count = 0;
      revenue = 0;
    } else if (d.name === "Bandarban") {
      count = 0;
      revenue = 0;
    }

    return {
      name: d.name,
      coordinates: [parseFloat(d.long), parseFloat(d.lat)],
      count,
      revenue,
    };
  });
};
