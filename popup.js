// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
const userEndpoint = apiUrl + '/user';
const playerEndpoint = apiUrl + '/player';
const playersNamesXpath = '//*[@id="main-container-height-wrapper"]/div/div[2]/app-root-clan-main-react/div/div[2]/div[1]/div[2]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[1]';

let classDiv = "";

var fileContent;
var localstorageUser;
var blacklist;
var nameBan;

/*
Verify if the request is necessary
*/
startup();

async function startup() {
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
  var userNickname;
  
  while (userNickname == undefined) {
    setTimeout(() => {
      userNickname = document.getElementsByClassName("nickname")[0].innerText;
    }, 500);
  }

  var data = await genericUpsertRequest(userEndpoint, "POST", userNickname);
  await setLocalStorage(data);
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
    }).catch(error => {
      console.log("catch ao local storage-> " + error);
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
  let url = playerEndpoint + "?userFaceitId=" + localstorageUser;
  blacklist = await genericGetRequest(url);
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

    await genericUpsertRequest(playerEndpoint, "POST", data);
    getPlayersBlackList();
  }
}

//Conplete
function getDivPlayers() {
  let result = document.evaluate(playersNamesXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
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

    await genericUpsertRequest(playerEndpoint, "PUT", data);
    getPlayersBlackList();
  }
}



/** Generic Http Requests */

async function genericUpsertRequest(url, method, data) {
  await fetch(url, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => response) // realmente preciso?
    .then(async (response) => {
      if (response.status == 200) {
        return await response.json();
      }
      else {
        console.log(response.status);
      }
    }).catch(error => {
      console.log(error);
    });
}

async function genericGetRequest(url) {
  await fetch(url)
    .then((response) => response)
    .then(async (response) => {
      if (response.status == 200) {
        return await response.json();
      }
      else {
        console.log(response.status);
      }
    }).catch(error => {
      console.log(error);
    });
}