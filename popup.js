// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
let classDiv = "";
var idBtnToken = document.getElementById("idBtnToken");
var idBtnLogin = document.getElementById("idBtnLogin");
var fileContent;
var localstorageToken;
var blacklist;

statup();

async function getTokenlocalStorage() {

  await chrome.storage.local.get(["token"])
  .then((resp) => {
    console.log(resp.token);
    localstorageToken = resp.token;
    blacklist = getPlayersBlackList().then((resp)=>console.log('then: '+resp)).catch((resp)=>console.log('catch: '+resp));
  }).catch((resp)=>{
    console.log(resp);
  });

  if (localstorageToken != null) {
    
    console.log(localstorageToken);
    var btnToken = document.getElementById("idBtnToken") 
    if(btnToken)
      btnToken.remove();
    var inputLogin = document.getElementById("idInputLogin");
    if(inputLogin){
      inputLogin.removeAttribute("hidden");
    console.log(inputLogin);
    inputLogin.value = localstorageToken;
    }
  }
}

async function getPlayersBlackList() {
  

  fetch(apiUrl + "/blackListedplayer?token=" + localstorageToken)
    .then((response) => response)
    .then(async (response) => {
      
      if (response.status == 200) {
        blacklist = await response.json();
        return blacklist;
      }
      else {
        console.log(response.status);
      }
    }).catch((resp)=>{
      console.log(resp);
    });
}

async function addPlayerBlackList(nikiForBan) {
  if (!localstorageToken) {
    localstorageToken = getTokenlocalStorage();
  }
  else {
    var data = {
      nickname: nikiForBan,
      token: localstorageToken,
    }
    fetch(apiUrl + '/blackListedplayer', {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
        console.log(response);
        if(response.status==200)
          getPlayersBlackList();
      }).catch((resp)=>{
        alert(resp);
      });
  }
}

setInterval(() => {
  var SearchSpans = document.querySelectorAll('span');
  
  if (blacklist) {
    SearchSpans.forEach((e) => {
      blacklist.forEach(function (i) {
        if (i.nickname == e.innerText) {
          e.style.color = 'red';
        }
      });
    });
  }
}, 500);

setInterval(() => {
  if (classDiv == "") {
    classDiv = getDivPlayers();
  }
  if (classDiv != "") {
    console.log(classDiv);
    var divs = document.querySelectorAll('.' + classDiv);

    divs.forEach((e) => {
      var element = document.createElement('div');
      element.classList.add('eMOUnj');
      element.classList.add('btnBlackList');
      element.addEventListener("click", async function (e) {
        var nameBan = e.target.parentElement.innerText.split('\n');
        fileContent += "," + nameBan[0];
        console.log(nameBan[0]);
        await addPlayerBlackList(nameBan[0]);
      });
      element.textContent = 'BlackList';
      var exists = e.getElementsByClassName("btnBlackList");
      if (exists.length == 0)
        e.appendChild(element);
    })
  }
}, 500);

function getDivPlayers() {
  let resp = "";
  let xpath = '//*[@id="main-container-height-wrapper"]/div/div[2]/app-root-clan-main-react/div/div[2]/div[1]/div[2]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[1]';
  let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  let node = result.singleNodeValue;
  if (node != null) {
    let resp = node.classList[0];
    return resp;
  }
  return resp;
}

if (idBtnToken) {
  idBtnToken.addEventListener('click', async () => {
    document.getElementById("idBtnToken").hidden = true;
    var divLoader = document.getElementsByClassName("loader");
    divLoader[0].hidden = false;
    await fetch(apiUrl + '/user', {
      method: "POST",
    })
      .then((response) => response)
      .then(async (response) => {
        if (response.status == 200) {
          var data = await response.json();
          alert("Guarda o teu Token: " + data.token)
          // localStorage.setItem("Token", data.token);

          await chrome.storage.local.set({ "token": data.token }).then((result) => {
            console.log("teste: " + result.token);
          });

          getTokenlocalStorage();
        }
        else {
          alert(response.status);
          document.getElementById("idBtnToken").hidden = false;
        }
        divLoader[0].hidden = true;

      }).catch((resp)=>{
        alert(resp);
      });
  });
}

async function statup() {
  localstorageToken = await getTokenlocalStorage();
}