// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
let classDiv = "";
var fileContent;
var localstorageUser;
var blacklist;
var nameBan;

/*
Verify if the request is necessary
*/
statup();

async function statup() {
  debugger
  await getFaceitIdlocalStorage()
    .then(async () => {
      if (!localstorageUser) {
        debugger
        await postNicknameUser();
      }
    }).then(async () => {
      await getPlayersBlackList();
    }).catch(() => {
      console.log("Algo deu errado");
    });
};

async function postNicknameUser() {
  var data = document.getElementsByClassName("nickname")[0].innerText;

  await fetch(apiUrl + '/User', {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => response) // realmente preciso?
    .then(async (response) => {
      if (response.status == 200) {
        var data = await response.json();
        await setLocalStorage(data)
      }
      else {
        console.log(response.status);
      }
    }).catch((resp) => {
      console.log(resp);
    });
}

async function setLocalStorage(data) {
  await chrome.storage.local.set({ "faceitId": data.faceitId })
    .then((result) => {
      console.log("teste: FaceitId-> " + result.faceitId);
      debugger
      localstorageUser = result.faceitId;
    });
}

async function getFaceitIdlocalStorage() {

  await chrome.storage.local.get(["faceitId"])
    .then(async (resp) => {
      console.log("faceitID -> " + resp.faceitId);
      if (resp.faceitId) {
        localstorageUser = resp.faceitId;
      }
    }).catch((resp) => {
      console.log("catch ao local storage-> " + resp);
    });
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

/**
 * Verifies that nethods
*/

setInterval(() => {
  if (classDiv == "") {
    classDiv = getDivPlayers();
  }
  else {
    console.log(classDiv);
    var divs = document.querySelectorAll('.' + classDiv);

    divs.forEach(async (exitElement) => {
      nameBan = exitElement.innerText;
      nameBan = nameBan.split("\n");
      for (const playerBan of blacklist)  {
        if (playerBan.nickname === nameBan[0]) {
          var exists = exitElement.getElementsByClassName("btnBlackList");
          if (exists.length > 0) {
            exists[0].remove();
          }

          var undoElement = document.createElement('div');
          undoElement.classList.add('btnUndo');
          undoElement.setAttribute("name", nameBan[0]);
          undoElement.addEventListener("click", async function (e) {
            
            var disBan = e.currentTarget.attributes.name
            console.log(disBan.nodeValue);
            debugger
            await undoPlayerBlackList(disBan.nodeValue);
          });
          undoElement.textContent = 'Undo';
          var exists = exitElement.getElementsByClassName("btnUndo");
          if (exists.length == 0) {
            exitElement.appendChild(undoElement);
          }
          break;
        }

        else {
          var exists = exitElement.getElementsByClassName("btnUndo");
          if (exists.length > 0) {
            exists[0].remove();
          }

          var element = document.createElement('div');
          element.classList.add('btnBlackList');
          element.setAttribute("name", nameBan[0]);
          element.addEventListener("click", async function (e) {
            debugger
            var ban = e.currentTarget.attributes.name
            console.log(ban.nodeValue);
            debugger
            await addPlayerBlackList(ban.nodeValue);
          });

          element.textContent = 'BlackList';
          var exists = exitElement.getElementsByClassName("btnBlackList");
          if (exists.length == 0)
            exitElement.appendChild(element);
        }

      }
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
  nickForBan = nickForBan.split("\n");
  if (!localstorageUser) {
    getFaceitIdlocalStorage();
  }
  else {
    var data = {
      playerNickname: nickForBan[0],
      userFaceitId: localstorageUser,
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

async function undoPlayerBlackList(undoPlayer) {
  if (!localstorageUser) {
    getFaceitIdlocalStorage();
  }
  else {
    var data = {
      playerNickname: undoPlayer,
      userFaceitId: localstorageUser,
    }
    fetch(apiUrl + '/Player', {
      method: "PUT",
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