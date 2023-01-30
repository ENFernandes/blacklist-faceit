// Create the API endpoint for reading a file
const apiUrl = `https://blacklist-faceit-service-uat.onrender.com/api`;
const userEndpoint = apiUrl + '/user';
const playerEndpoint = apiUrl + '/player';
const playersNamesXpath = '//*[@id="main-container-height-wrapper"]/div/div[2]/app-root-clan-main-react/div/div[2]/div[1]/div[2]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[1]';
const urlRegex = /(https:\/\/)?(www.)?faceit.com\/([a-zA-Z]{2}(-)?([a-zA-Z]{2})?)\/clan\/(.*)/g;
var classDiv = "";
var start;
var fileContent;
var userDetails;
var blacklist;
var nameBan;

//TODO -> think a best solution
start = setInterval(() => {
  let url = window.document.URL;
  let lengthUrlRegex;
  if(url.match(urlRegex)!=null){
  lengthUrlRegex = url.match(urlRegex).length;
  }
  if (lengthUrlRegex == 1) {
    startup()
    clearInterval(start);
  }
}, 10000);

//Complete
async function startup() {
      getPlayersBlackList();
};

//Complete
async function postNicknameUser() {

  var userNickname = document.getElementsByClassName("nickname")[0].innerText;
  await genericUpsertRequest(userEndpoint, "POST", userNickname)
    .then(data => userDetails = data)
    .catch(() => console.log("Algo deu errado com o postNicknameUser ->" + userDetails));
}

//Complete
async function getPlayersBlackList() {
  
  await postNicknameUser();
  console.log("getPlayersBlackList-> " + await userDetails)
  let url = playerEndpoint + "?userFaceitId=" + await userDetails;
  return await genericGetRequest(url);

}

//Complete
async function addPlayerBlackList(nickForBan) {
  nickForBan = nickForBan.split("\n");

  var data = {
    playerNickname: nickForBan[0],
    userFaceitId: userDetails,
  }
  console.log("O " + data.userFaceitId + " vai banir o " + data.playerNickname)
  await genericUpsertRequest(playerEndpoint, "POST", data).then(getPlayersBlackList());
}

//Complete
async function undoPlayerBlackList(undoPlayer) {

  var data = {
    playerNickname: undoPlayer,
    userFaceitId: userDetails,
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
      fetchResp = await response.json();
      debugger;
      console.log(fetchResp.faceitId);
    })

    .catch(error => {
      console.log("Erro-> " + error);
    });

  return fetchResp.faceitId;
}

//Complete
async function genericGetRequest(url) {
  await fetch(url)

    .then(async (response) => {
      console.log("Get Resposta-> " + response);
      debugger
      if (response.status == 200) {
        blacklist = await response.json();
        debugger
        console.log("A BlackList->" + await blacklist);
        return await blacklist;
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
function getDivPlayers() {
  let resp;
  let result = document.evaluate(playersNamesXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  let node = result.singleNodeValue;
  if (node != null) {
    resp = node.classList[0];
    return resp;
  }
  return resp;
}

function changeNicknameColor(nickPlayer) {
  if (blacklist) {
    if (Object.keys(blacklist).length === 0) {
      nickPlayer.style.color = 'white';
    }
    else {
      for (const i of blacklist) {
        if (i.nickname == nickPlayer.innerText) {
          nickPlayer.style.color = 'red';
          break;
        }
        else {
          nickPlayer.style.color = 'white';
        }
      }
    }
  }
}

function undoPlayer() {
  var undoElement = document.createElement('div');
  undoElement.classList.add('btnUndo');
  undoElement.setAttribute("name", nameBan[0]);
  undoElement.addEventListener("click", async function (e) {

    var disBan = e.currentTarget.attributes.name;
    console.log(disBan.nodeValue);
    debugger;
    await undoPlayerBlackList(disBan.nodeValue);
  });
  return undoElement;
}

function addBlacklist() {
  var element = document.createElement('div');
  element.classList.add('btnBlackList');
  element.setAttribute("name", nameBan[0]);
  element.addEventListener("click", async function (e) {
    var ban = e.currentTarget.attributes.name;
    await addPlayerBlackList(ban.nodeValue);
  });

  return element;
}

function addBtnBlackList(element, exitElement) {
  element.textContent = 'BlackList';
  var exists = exitElement.getElementsByClassName("btnBlackList");
  if (exists.length == 0)
    exitElement.appendChild(element);
}

function addBtnUndo(undoElement, exitElement) {
  undoElement.textContent = 'Undo';
  var exists = exitElement.getElementsByClassName("btnUndo");
  if (exists.length == 0) {
    exitElement.appendChild(undoElement);
  }
}

function removeBtnBlacklist(exitElement) {
  var exists = exitElement.getElementsByClassName("btnBlackList");
  if (exists.length > 0) {
    exists[0].remove();
  }
}

function removeBtnUndo(exitElement) {
  var exists = exitElement.getElementsByClassName("btnUndo");

  if (exists.length > 0) {
    exists[0].remove();
  }
}

//Complete
setInterval(() => {
  var SearchSpans = document.querySelectorAll('span');
  SearchSpans.forEach((nickPlayer) => {
    changeNicknameColor(nickPlayer);
  });
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

      if (blacklist) {
        if (Object.keys(blacklist).length === 0) {
  
          removeBtnUndo(exitElement);
  
          var element = addBlacklist();
  
          addBtnBlackList(element, exitElement);
  
        }
        else {
          for (const playerBan of blacklist) {
  
            if (playerBan.nickname === nameBan[0]) {
  
              removeBtnBlacklist(exitElement);
  
              var undoElement = undoPlayer();
  
              addBtnUndo(undoElement, exitElement);
              break;
            }
  
            else {
              removeBtnUndo(exitElement);
  
              var element = addBlacklist();
  
              addBtnBlackList(element, exitElement);
            }
  
          }
        }
      }
    })
  }
}, 500);