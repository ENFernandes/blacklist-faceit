const repo = "javascript_test";
const username = "Xer0-PT";
const token = "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";
const filePath = "teste.txt";
// Create the API endpoint for reading a file
const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${filePath}`;
let classDiv="";

var fileContent;

// Set the API request options
const options = {
  headers: {
    Authorization: `Token ${token}`,
  },
};

getBananas();

setInterval(() => {
  const namesList = fileContent.split(',');
  var SearchSpans = document.querySelectorAll('span');
  SearchSpans.forEach((e) => {
    namesList.forEach(function (i) {
      if (i == e.innerText) {
        e.style.color = 'red';
      }
    });
  });
}, 500);

setInterval(() => {

  if(classDiv==""){
  classDiv = getDiv();
  }
  console.log(classDiv);
  var divs = document.querySelectorAll('.' + classDiv);
  divs.forEach((e) => {
    var element = document.createElement('div');
    element.classList.add('eMOUnj');
    element.classList.add('esomaior');
    element.addEventListener("click", async function (e) {
      var nameBan = e.target.parentElement.innerText.split('\n');
      fileContent += "," + nameBan[0];
      console.log(nameBan[0]);
      await addBananas(nameBan[0]);
    });
    element.textContent = 'Vai Burro';
    var exists = e.getElementsByClassName("esomaior");
    if (exists.length == 0)
      e.appendChild(element);
  })
}, 1000);



async function getBananas() {
  await fetch(apiUrl, options)
    .then((response) => response.json())
    .then((data) => {
      // The file content is returned as base64-encoded data
      const base64Content = data.content;

      // Decode the base64-encoded data to get the plain text content
      fileContent = atob(base64Content).replace('\n', '');
      console.log(fileContent);
    });
}

async function addBananas(oBanana) {
  const sha = await getShaFromLastCommit();
  await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    path: {
      owner: username,
      repo: repo,
      path: filePath,
    },
    body: JSON.stringify({
      message: "Olha este Burro ->" + oBanana,
      content: btoa(fileContent),
      sha: sha,
    }),
  });
}

async function getShaFromLastCommit() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.sha;
}

function getDiv() {
  let xpath = '//*[@id="main-container-height-wrapper"]/div/div[2]/app-root-clan-main-react/div/div[2]/div[1]/div[2]/div[2]/div[2]/div[1]/div[3]/div[1]/div[1]/div[1]';
  let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
  let node = result.singleNodeValue;
  let resp = node.classList[1];
  return resp;
}