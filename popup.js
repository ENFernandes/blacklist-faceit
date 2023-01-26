// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
let classDiv = "";
var idBtnToken = document.getElementById("idBtnToken");
var idBtnLogin = document.getElementById("idBtnLogin");
var fileContent;
var localstorageUser;
var blacklist;

/*
Verify if the request is necessary
*/
statup();
async function statup() {
  localstorageUser = await getFaceitIdlocalStorage();
}

/* 
Refactor the function 
need call get user method verification status
*/
document.onload = async () => {
  localstorageUser = await getFaceitIdlocalStorage();
  if (!localstorageUser) {

    await fetch(apiUrl + '/User', {
      method: "POST",
    })
      .then((response) => response)
      .then(async (response) => {
        if (response.status == 200) {
          var data = await response.json();
          await chrome.storage.local.set({ "faceitId": data.token }).then((result) => {
            console.log("teste: FaceitId-> " + result.token);
          });

          getFaceitIdlocalStorage();
        }
        else {
          console.log(response.status);
        }
      }).catch((resp) => {
        console.log(resp);
      });

  }
};

/**
  *TODO Refactor this function
  * -> chrome.storage.local.get(["token"]) === null ? chrome.storage.local.set(["token"])
*/

async function getFaceitIdlocalStorage() {
  await chrome.storage.local.get(["faceitId"])
    .then((resp) => {
      console.log(resp.token);
      localstorageUser = resp.token;

      blacklist = getPlayersBlackList()
        .then((resp) => console.log('then: ' + resp))
        .catch((resp) => console.log('catch: ' + resp));

    }).catch((resp) => {
      console.log(resp);
    });

  if (localstorageUser != null) {
    console.log(localstorageUser);
    var btnToken = document.getElementById("idBtnToken")
    if (btnToken)
      btnToken.remove();
    var inputLogin = document.getElementById("idInputLogin");
    if (inputLogin) {
      inputLogin.removeAttribute("hidden");
      console.log(inputLogin);
      inputLogin.value = localstorageUser;
    }
  }
}

/**
 * Verifies that methods
*/
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

/**
 * Verifies that nethods
*/

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

//Complete
async function getPlayersBlackList() {
  fetch(apiUrl + "/Player?userFaceitId=" + localstorageUser)
    .then((response) => response)
    .then(async (response) => {

      if (response.status == 200) {
        blacklist = await response.json();
        return blacklist;
      }
      else {
        console.log(response.status);
      }
    }).catch((response) => {
      console.log(response);
    });
}

//Complete
async function addPlayerBlackList(nickForBan) {
  if (!localstorageUser) {
    localstorageUser = getFaceitIdlocalStorage();
  }
  else {
    var data = {
      nickname: nickForBan,
      token: localstorageUser,
    }
    fetch(apiUrl + '/Player', {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => {
      console.log(response);
      if (response.status == 200)
        getPlayersBlackList();
    }).catch((response) => {
      alert(response);
    });
  }
}

//Conplete
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