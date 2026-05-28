const apiKey = '625068c713c3937092cf513f1bc55145'; 

const map = L.map('map', { attributionControl: false }).setView([32.24, 77.19], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let currentInsightLang = 'en';

function handleLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    if (u === "admin" && p === "1234") {
        document.getElementById('loginPage').style.display = "none";
        document.querySelector('.app-container').style.display = "flex";
        const now = new Date();
        document.getElementById('date').innerText = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        setTimeout(() => { map.invalidateSize(); getWeather(); loadModules(); }, 300);
    } else { alert("Login failed."); }
}

function showSection(id, el) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav li').forEach(l => l.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    el.classList.add('active');
    if(id === 'dashboard') setTimeout(() => map.invalidateSize(), 50);
}

async function getWeather() {
    let cityInput = document.getElementById('cityInput').value.trim() || 'Manali';
    let url = cityInput.toLowerCase().includes("manali") ? 
        `https://api.openweathermap.org/data/2.5/weather?lat=32.2432&lon=77.1892&appid=${apiKey}&units=metric` :
        `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}&units=metric`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if(data.cod === 200) {
            const temp = Math.round(data.main.temp);
            document.getElementById('cityName').innerText = cityInput.toLowerCase().includes("manali") ? "Manali, Himachal Pradesh" : `${data.name}, ${data.sys.country}`;
            document.getElementById('temp').innerText = `${temp}°C`;
            document.getElementById('humidity').innerText = data.main.humidity;
            document.getElementById('wind').innerText = data.wind.speed;
            
            // --- UPDATED REFINED CROP LOGIC ---
            let cropSug, riskSug;
            if (temp < 18) {
                cropSug = "🍎 Apples / 🍒 Cherries";
                riskSug = "🏔️ Hill Climate: Perfect for Orchards";
            } else if (temp >= 18 && temp <= 28) {
                cropSug = "🌾 Wheat / 🟡 Mustard";
                riskSug = "✅ Ideal Temperate Conditions: Great for Grains";
            } else if (temp > 28 && temp <= 35) {
                cropSug = "☁️ Cotton / 🥜 Groundnut";
                riskSug = "☀️ Warm Climate: Good for Oilseeds & Fiber";
            } else {
                cropSug = "🌵 Millets / 🐪 Guar";
                riskSug = "🔥 Extreme Heat: Drought Resistant Only";
            }

            document.getElementById('crop').innerText = cropSug;
            document.getElementById('risk').innerText = riskSug;

            map.flyTo([data.coord.lat, data.coord.lon], 11);
            map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });
            L.marker([data.coord.lat, data.coord.lon]).addTo(map).bindPopup(data.name).openPopup();
        }
    } catch (e) { console.error("API Error"); }
}

const cropDatabase = {
    "wheat": { en: {title:"Wheat", desc:"Staple rabi crop. Needs cool weather and bright sun.", temp:"15-25°C", rain:"50-75cm", regions:"Punjab, Haryana, UP"}, hi: {title:"गेहूं", desc:"मुख्य रबी फसल। ठंडी जलवायु और खिली धूप चाहिए।", temp:"15-25°C", rain:"50-75cm", regions:"पंजाब, हरियाणा"}},
    "rice": { en: {title:"Rice", desc:"High heat and water intensive kharif crop.", temp:"22-32°C", rain:"150-300cm", regions:"WB, Punjab, AP"}, hi: {title:"चावल", desc:"अधिक ताप और पानी वाली खरीफ फसल।", temp:"22-32°C", rain:"150-300cm", regions:"पश्चिम बंगाल"}},
    "cotton": { en: {title:"Cotton", desc:"Needs 210 frost-free days and black soil.", temp:"21-30°C", rain:"50-100cm", regions:"Gujarat, MH"}, hi: {title:"कपास", desc:"210 पाला-मुक्त दिन और काली मिट्टी चाहिए।", temp:"21-30°C", rain:"50-100cm", regions:"गुजरात"}},
    "sugarcane": { en: {title:"Sugarcane", desc:"Tropical crop, heavy irrigation required.", temp:"21-27°C", rain:"75-150cm", regions:"UP, MH"}, hi: {title:"गन्ना", desc:"भारी सिंचाई वाली उष्णकटिबंधीय फसल।", temp:"21-27°C", rain:"75-150cm", regions:"उत्तर प्रदेश"}},
    "jute": { en: {title:"Jute", desc:"Golden Fiber. Grows best in flood plains.", temp:"24-35°C", rain:"120-150cm", regions:"WB, Bihar"}, hi: {title:"जूट", desc:"सुनहरा रेशा। बाढ़ के मैदानों में उपयुक्त।", temp:"24-35°C", rain:"120-150cm", regions:"पश्चिम बंगाल"}},
    "mango": { en: {title:"Mango", desc:"King of fruits. Tropical climate, no frost.", temp:"24-30°C", rain:"75-250cm", regions:"UP, AP"}, hi: {title:"आम", desc:"फलों का राजा। पाला-रहित उष्णकटिबंधीय जलवायु।", temp:"24-30°C", rain:"75-250cm", regions:"उत्तर प्रदेश"}},
    "apple": { en: {title:"Apple", desc:"Temperate fruit. Needs chilling period.", temp:"10-24°C", rain:"100-150cm", regions:"HP, J&K"}, hi: {title:"सेब", desc:"शीतोष्ण फल। ठंड की अवधि आवश्यक है।", temp:"10-24°C", rain:"100-150cm", regions:"हिमाचल प्रदेश"}},
    "grapes": { en: {title:"Grapes", desc:"Vines need hot dry summer, cool winter.", temp:"15-35°C", rain:"50-100cm", regions:"MH, Karnataka"}, hi: {title:"अंगूर", desc:"गर्म शुष्क गर्मी और ठंडी सर्दी चाहिए।", temp:"15-35°C", rain:"50-100cm", regions:"महाराष्ट्र"}},
    "gram": { en: {title:"Gram", desc:"Major pulse crop. Sensitive to frost.", temp:"20-25°C", rain:"40-60cm", regions:"MP, Rajasthan"}, hi: {title:"चना", desc:"प्रमुख दलहन फसल। पाले के प्रति संवेदनशील।", temp:"20-25°C", rain:"40-60cm", regions:"मध्य प्रदेश"}},
    "mustard": { en: {title:"Mustard", desc:"Oilseed crop. Thrives in cool weather.", temp:"10-25°C", rain:"30-50cm", regions:"Rajasthan, HR"}, hi: {title:"सरसों", desc:"तिलहन फसल। ठंडे मौसम में उपयुक्त।", temp:"10-25°C", rain:"30-50cm", regions:"राजस्थान"}},
    "groundnut": { en: {title:"Groundnut", desc:"Kharif oilseed. Needs sandy loam.", temp:"20-30°C", rain:"50-75cm", regions:"Gujarat, TN"}, hi: {title:"मूंगफली", desc:"खरीफ तिलहन। रेतीली मिट्टी चाहिए।", temp:"20-30°C", rain:"50-75cm", regions:"गुजरात"}}
};

function toggleInsightLang(lang) {
    currentInsightLang = lang;
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
    document.getElementById('lang-hi').classList.toggle('active', lang === 'hi');
    const isHi = lang === 'hi';
    document.getElementById('hub-intro').innerText = isHi ? "फसल की आवश्यकताओं की खोज करें।" : "Discover crop requirements.";
    document.getElementById('lbl-temp').innerText = isHi ? "🌡️ तापमान" : "🌡️ Ideal Temp";
    document.getElementById('lbl-rain').innerText = isHi ? "🌧️ वर्षा" : "🌧️ Rainfall";
    document.getElementById('lbl-regions').innerText = isHi ? "📍 क्षेत्र" : "📍 Best Regions";
    document.getElementById('clearBtn').innerText = isHi ? "साफ़ करें" : "Clear Search";
    searchCropInsight();
}

function searchCropInsight() {
    let query = document.getElementById('insightSearch').value.toLowerCase().trim();
    const hiMap = {"गेहूं":"wheat","चावल":"rice","कपास":"cotton","गन्ना":"sugarcane","जूट":"jute","आम":"mango","सेब":"apple","अंगूर":"grapes","चना":"gram","सरसों":"mustard","मूंगफली":"groundnut"};
    if(hiMap[query]) query = hiMap[query];
    const res = cropDatabase[query];
    if (res) {
        const d = res[currentInsightLang];
        document.getElementById('insightResult').style.display = "block";
        document.getElementById('resTitle').innerText = `🌱 ${d.title}`;
        document.getElementById('resDesc').innerText = d.desc;
        document.getElementById('resTemp').innerText = d.temp;
        document.getElementById('resRain').innerText = d.rain;
        document.getElementById('resRegions').innerText = d.regions;
    }
}

function clearInsight() {
    document.getElementById('insightSearch').value = "";
    document.getElementById('insightResult').style.display = "none";
}

function loadModules() {
    const crops = [
        {n: "🍎 Apples", d: "Flowering in Manali hills."},
        {n: "🌾 Paddy", d: "High humidity crop for plains."},
        {n: "☁️ Cotton", d: "Kharif crop, sowing in North India."},
        {n: "🌸 Saffron", d: "Exclusive to temperate Kashmir soils."},
        {n: "🌵 Millets", d: "Drought-resistant for Rajasthan heat."},
        {n: "🥜 Groundnut", d: "Ideal for Gujarat/Andhra plains."},
        {n: "☕ Tea", d: "Mountain slopes in Assam/Nilgiris."},
        {n: "🎋 Sugarcane", d: "Requires high sunshine and water."}
    ];
    document.getElementById('cropGrid').innerHTML = crops.map(c => `
        <div class="info-box"><h3>${c.n}</h3><p style="font-size:0.85rem;">${c.d}</p></div>
    `).join('');

    const alerts = [
        "🚨 Apr 21: Heatwave warning for Central India.",
        "⚠️ Apr 21: Snow/Rain in Upper Manali reaches.",
        "📢 Apr 20: Hailstorm warning for Himachal hills.",
        "🚨 Apr 19: Cyclone watch in Bay of Bengal.",
        "⚠️ Apr 18: Dust storm alert for Bikaner.",
        "📢 Apr 15: Early monsoon moisture in Kerala.",
        "🚨 Apr 12: Forest fire risk in Uttarakhand.",
        "⚠️ Apr 10: Flash flood warning for NE states.",
        "📢 Apr 05: Unseasonal rain impact on wheat.",
        "🚨 Apr 01: Severe drought in Rayalaseema."
    ];
    document.getElementById('disasterList').innerHTML = alerts.map(a => `
        <div class="news-item">${a}</div>
    `).join('');
}

