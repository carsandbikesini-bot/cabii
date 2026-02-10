const API = "/api";

// STEP 1: Check login
fetch(`${API}/auth/me`, {
  credentials: "include"
})
.then(res => res.json())
.then(data => {
  if(!data.loggedIn){
    window.location.href = "login.html";
  }else{
    loadProfile(data.userId);
  }
});

// STEP 2: Load user profile
function loadProfile(userId){
  fetch(`${API}/users/${userId}`, {
    credentials: "include"
  })
  .then(res => res.json())
  .then(user => {
    document.getElementById("name").innerText = user.name;
    document.getElementById("email").innerText = user.email;

    // Verified
    document.getElementById("verified").innerHTML =
      user.verified
      ? "<span class='verified'>✔ Verified Member</span>"
      : "Not Verified";

    // Membership plan
    const planEl = document.getElementById("plan");
    const plan = user.membershipPlan || "Free";

    planEl.innerText = plan;

    planEl.className = "badge " + plan.toLowerCase();
  })
  .catch(err => {
    console.error(err);
    alert("Profile load failed");
  });
}

// STEP 3: Logout
function logout(){
  fetch(`${API}/auth/logout`, {
    credentials:"include"
  })
  .then(()=>{
    window.location.href = "login.html";
  });
}