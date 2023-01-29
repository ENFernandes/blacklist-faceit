// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
const userEndpoint = apiUrl + '/user';
const playerEndpoint = apiUrl + '/player';
const playersNamesXpath = '//*[@id="main-container-height-wrapper"]/div/div[2]/app-root-clan-main-react/div/div[2]/div[1]/div[2]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[1]';
let classDiv = "";
var start;
var fileContent;
var localstorageUser;
var userId;
var blacklist;
var nameBan;

//Complete
start = setInterval(() => {
  let url = window.document.URL;
  if (url === "https://www.faceit.com/pt/clan/61395179-2483-49c9-a9b2-dd251a5ca0e0/SAW%20Gaming%20League%20-%20Comunidade%20Portuguesa%20de%20CS:GO") {
    startup()
    clearInterval(start);
  }
}, 10000);

//Complete
async function startup() {
  await getFaceitIdlocalStorage()
    .then(async () => {
      if (!localstorageUser) {
        debugger;
        var data = await postNicknameUser();
        setLocalStorage(await data);
      }
    })

    .then(async (data) => {
      console.log(data);
      debugger;
      await getPlayersBlackList();
    })

    .catch(() => {
      console.log("Algo deu errado");
    });
};

//Complete
async function postNicknameUser() {

  var userNickname = document.getElementsByClassName("nickname")[0].innerText;
  localstorageUser = await genericUpsertRequest(userEndpoint, "POST", userNickname);
  userId = localstorageUser;
  return await userId.faceitId;

}

//Complete
function setLocalStorage(data) {
  chrome.storage.local.set({ "faceitId": data.faceitId })
}

//Complete
function getFaceitIdlocalStorage() {
  chrome.storage.local.get(["faceitId"])
    .then((resp) => {
      console.log("faceitID -> " + resp.faceitId);
      if (resp.faceitId) {
        userId = resp.faceitId;
      }
    }).catch(error => {
      console.log("Erro getFaceitIdlocalStorage -> " + error);
    });
}

//Complete
async function getPlayersBlackList() {

  console.log("getPlayersBlackList-> " + userId.faceitId)
  let url = playerEndpoint + "?userFaceitId=" + userId.faceitId;
  debugger;
  blacklist = genericGetRequest(url);

}

//Complete
async function addPlayerBlackList(nickForBan) {
  nickForBan = nickForBan.split("\n");

  var data = {
    playerNickname: nickForBan[0],
    userFaceitId: userId.faceitId,
  }
  console.log("O " + data.userFaceitId + " vai banir o " + data.playerNickname)
  await genericUpsertRequest(playerEndpoint, "POST", data).then(getPlayersBlackList());
}

//Conplete
function getDivPlayers() {
  let result = document.evaluate(playersNamesXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  let node = result.singleNodeValue;
  if (node != null) {
    let resp = node.classList[0];
    return resp;
  }
  return "";
}

//Complete
async function undoPlayerBlackList(undoPlayer) {

  var data = {
    playerNickname: undoPlayer,
    userFaceitId: userId.faceitId,
  }
  await genericUpsertRequest(playerEndpoint, "PUT", data).then(getPlayersBlackList());

}

//Complete
async function genericUpsertRequest(url, method, data) {
  var fetchResp;
  await fetch(url, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  })

    .then(async (response) => {
      console.log(response);
      if (response.status == 200) {
        fetchResp = await response.json();
        debugger;
        console.log(fetchResp);
      }
      else {
        console.log(response.status);
      }
    })

    .catch(error => {
      console.log("Erro-> " + error);
    });

  return fetchResp;
}

//Complete
async function genericGetRequest(url) {
  await fetch(url)

    .then(async (response) => {
      console.log("Get Resposta-> " + response);
      if (response.status == 200) {
        var data = await response.json();
        blacklist = data;
        console.log("A BlackList->" + blacklist);
        return blacklist;
      }
      else {
        console.log(response.status);
      }
    })

    .catch(error => {
      console.log(error);
    });
}

//Complete
setInterval(() => {
  var SearchSpans = document.querySelectorAll('span');
  if (blacklist) {
    SearchSpans.forEach((e) => {
      if (blacklist.length == 0) {
        e.style.color = 'white';
      }
      else {
        for (const i of blacklist) {
          if (i.nickname == e.innerText) {
            e.style.color = 'red';
            break;
          }
          else {
            e.style.color = 'white';
          }
        }
      }
    });
  }
}, 500);

//Complete
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

      if (!blacklist) {
        console.log("Ainda nao tens Blacklist ativa")
      }

      else if (blacklist.length == 0) {

        var exists = exitElement.getElementsByClassName("btnUndo");

        if (exists.length > 0) {
          exists[0].remove();
        }

        var element = document.createElement('div');
        element.classList.add('btnBlackList');
        element.setAttribute("name", nameBan[0]);
        element.addEventListener("click", async function (e) {

          var ban = e.currentTarget.attributes.name
          console.log(ban.nodeValue);
          await addPlayerBlackList(ban.nodeValue);

        });

        element.textContent = 'BlackList';
        var exists = exitElement.getElementsByClassName("btnBlackList");
        if (exists.length == 0)
          exitElement.appendChild(element);
      }
      else {
        for (const playerBan of blacklist) {

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
      }
    })
  }
}, 500);
