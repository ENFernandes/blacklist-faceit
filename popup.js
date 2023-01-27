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
    await getFaceitIdlocalStorage();
    debugger
    if (!localstorageUser) {
      debugger
      await postNicknameUser();
    }
    debugger
    await getPlayersBlackList();
};

async function postNicknameUser() {
  var data = {
    nickname: document.getElementsByClassName("nickname").value
  }
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
      else {
        await postNicknameUser()
      }

    }).catch((resp) => {
      console.log("catch ao local storage-> " + resp);
    });
}

// setInterval(() => {
//   var SearchSpans = document.querySelectorAll('span');
//   if (blacklist) {
//     SearchSpans.forEach((e) => {
//       blacklist.forEach(function (i) {
//         if (i.nickname == e.innerText) {
//           e.style.color = 'red';
//         }
//       });
//     });
//   }
// }, 500);

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
      nameBan = e.innerText;

      blacklist.forEach((e) => {
        if (e == nameBan) {
          var element = document.createElement('div');
          element.classList.add('btnUndo');
          element.addEventListener("click", async function (e) {
            debugger
            console.log(nameBan);
            debugger
            await undoPlayerBlackList(nameBan);
          });
          element.textContent = 'Undo';
          var exists = e.getElementsByClassName("btnUndo");
          if (exists.length == 0)
            e.appendChild(element);
        }

        else {
          var element = document.createElement('div');
          element.classList.add('btnBlackList');
          element.addEventListener("click", async function (e) {
            debugger
            console.log(nameBan);
            debugger
            await addPlayerBlackList(nameBan);
          });
          element.textContent = 'BlackList';
          var exists = e.getElementsByClassName("btnBlackList");
          if (exists.length == 0)
            e.appendChild(element);
        }

      });
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
  if (!localstorageUser) {
    getFaceitIdlocalStorage();
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