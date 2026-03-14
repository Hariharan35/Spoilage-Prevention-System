// Predefined users with mobile for alerts
const credentials = {
  user:{username:"user1",password:"user123", mobile:"+916379655667"},
  driver:{username:"driver1",password:"driver123", mobile:"+919344122841"}
};

let currentRole='';

// Show registration form
function showRegister(){
  document.getElementById("login-page").querySelector(".login-box").style.display="none";
  document.getElementById("register-box").style.display="block";
}
// Show login form 
function showLogin(){
  document.getElementById("register-box").style.display="none";
  document.getElementById("login-page").querySelector(".login-box").style.display="block";
}

// Registration (no mobile number input)
function register(){
  const role = document.getElementById("reg-role").value;
  const username = document.getElementById("reg-username").value;
  const password = document.getElementById("reg-password").value;
  const error = document.getElementById("reg-error");

  if(!role || !username || !password){
    error.textContent="Please fill all fields!";
    return;
  }
  if(credentials[role] && credentials[role].username === username){
    error.textContent="Username already exists!";
    return;
  }
  credentials[role]={username,password};
  alert("✅ Registration successful! You can login now.");
  showLogin();
}

// Login
function login(){
  const role=document.getElementById("role").value;
  const username=document.getElementById("username").value;
  const password=document.getElementById("password").value;
  const error=document.getElementById("login-error");
  if(role && username && password){
    if(credentials[role] && username===credentials[role].username && password===credentials[role].password){
      currentRole=role;
      document.getElementById("login-page").style.display="none";
      document.getElementById("dashboard").style.display="block";
      document.getElementById("dashboard-title").textContent = role==="user"?"User Dashboard":"Driver Dashboard";
      document.getElementById("mark-delivered").style.display=role==="driver"?"block":"none";
      initDashboard();
    } else error.textContent="Invalid credentials!";
  } else error.textContent="Please fill all fields!";
}

function logout(){ location.reload(); }
function markDelivered(){ alert("✅ Delivery marked!"); }
// Perishable goods with expiry, humidity, and temperature
let goods = [
  { name: "Milk", expiry: "2026-03-10", humidity: 65, temperature: 4 },
  { name: "Cheese", expiry: "2026-03-15", humidity: 60, temperature: 5 },
  { name: "Fish", expiry: "2026-03-08", humidity: 70, temperature: 2 },
  { name: "Yogurt", expiry: "2026-03-12", humidity: 68, temperature: 4 },
  { name: "Tomato", expiry: "2026-03-09", humidity: 55, temperature: 20 }
];

// Sort by expiry (FEFO principle)
goods.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

// Arrays for charting
const labels = goods.map(item => item.name);
const humidityValues = goods.map(item => item.humidity);
const temperatureValues = goods.map(item => item.temperature);

// Function to dynamically add new items
function addGood(name, expiry, humidity, temperature) {
  goods.push({ name, expiry, humidity, temperature });
  goods.sort((a, b) => new Date(a.expiry) - new Date(b.expiry)); // keep sorted
}

// Example: adding dynamically
addGood("Apple", "2026-03-11", 50, 18);
addGood("Chicken", "2026-03-07", 75, 3);

console.log(goods);
console.log("Labels:", labels);
console.log("Humidity:", humidityValues);
console.log("Temperature:", temperatureValues);

// Dashboard + Humidity
function initDashboard(){
  const list=document.getElementById("goods-list");
  list.innerHTML="";
  goods.forEach(item=>{
    const li=document.createElement("li");
    li.textContent=`${item.name} - Expiry: ${item.expiry}`;
    list.appendChild(li);
  });

  const ctx=document.getElementById("humidityChart").getContext("2d");
  const humidityChart=new Chart(ctx,{
    type:"line",
    data:{labels:labels,datasets:[{label:"Humidity (%)",data:humidityValues,borderColor:"#006d77",backgroundColor:"rgba(0,109,119,0.2)",fill:true,tension:0.3}]},
    options:{responsive:true,scales:{y:{beginAtZero:true,max:100}}}
  });

  function checkHumidity(){
    const humidity=Math.floor(Math.random()*100);
    document.getElementById("humidity-value").textContent=humidity;
    const time=new Date().toLocaleTimeString(); labels.push(time); humidityValues.push(humidity);
    if(labels.length>10){labels.shift();humidityValues.shift();} humidityChart.update();

    const alertEl=document.getElementById("alert");
    if(humidity>70){
      alertEl.textContent="⚠️ High humidity! Risk of spoilage."; alertEl.style.color="red";

      if(credentials[currentRole].mobile){
        const accountSid = "AC63501b006e4ca42b13fe829f468bc72c";
        const authToken = "f4fb09fae7f9304d70f373f93424f4f1";
        const twilioNumber = "+16615456866";
        const mobile = credentials[currentRole].mobile;
        const message = "High humidity detected! Check perishable goods.";

        axios.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`, new URLSearchParams({
          To: mobile,
          From: twilioNumber,
          Url: `http://twimlets.com/message?Message[0]=${encodeURIComponent(message)}`
        }), { auth: { username: accountSid, password: authToken } })
        .then(r=>console.log("Call sent!", r.data))
        .catch(e=>console.error("Call error:", e));

        axios.post(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, new URLSearchParams({
          To: mobile,
          From: twilioNumber,
          Body: message
        }), { auth: { username: accountSid, password: authToken } })
        .then(r=>console.log("SMS sent!", r.data))
        .catch(e=>console.error("SMS error:", e));
      }

    } else{
      alertEl.textContent="✅ Safe humidity level."; alertEl.style.color="green";
    }
  }

  setInterval(checkHumidity,9000);
}