Moralis.initialize("");// Application ID
Moralis.serverURL = ""; // Server URL
var web3;

checkWeb3();

function displayMessage(messageType, message){
    messages = {
        "00":`<div class="alert alert-success"> ${message} </div>`,
        "01":`<div class="alert alert-danger"> ${message} </div>`
    }
    document.getElementById("resultSpace").innerHTML = messages[messageType];
}

async function checkWeb3(){
    const ethereum = window.ethereum;
    if(!ethereum || !ethereum.on){
        displayMessage("01","This app requires metamask install metamask")
    }
    else{
        setWeb3Environment();
    }
}

async function setWeb3Environment(){
    web3 = new Web3(window.ethereum);
    processAccounts();
}

async function processAccounts(){
    
    processes = {
        0:activateLogin,
        1:connectAccount,
        2:signAccount,
        3:loadAccount
    }
    accounts = await web3.eth.getAccounts();
    currentUser = Moralis.User.current();
    processes[logStatus(accounts,currentUser)]();
}

function logStatus(accounts, currentUser){
    let status = 0;
    if (accounts.length == 0){
        status = (currentUser == undefined) ? 0: 1;
    }
    else {
        status = (currentUser == undefined) ? 2: 3;
    }
    return status;
}

function activateLogin(){
    let loginControls = ["username", "email", "login"];
    for (let i=0; i < loginControls.length; i++){
        document.getElementById(loginControls[i]).removeAttribute("disabled");
    }
    document.getElementById("logout").setAttribute("disabled",null);
}

function connectAccount(){
    const connecting = Moralis.enable().then(function(){
    loadAccount();
    })
}

function signAccount(){
    const signing = Moralis.authenticate().then(function(){
    loadAccount();
    })
}

async function loadAccount(){
    currentUserId = Moralis.User.current().id;
    const myUsers = Moralis.Object.extend("User");
    const query = new Moralis.Query(myUsers);
    query.equalTo("objectId",currentUserId);
    const results = await query.find();
    let name = results[0].attributes.name;
    let email = results[0].attributes.email;
    document.getElementById("username").value = name;
    document.getElementById("email").value = email;
}

function logout(){
    Moralis.User.logOut();
    document.getElementById("logout").setAttribute("disabled",null);
    displayMessage("01","You are logged out, to login again, refresh page")
}

async function login(){
    Moralis.authenticate().then(function(user){
        user.set("name", document.getElementById("username").value);
        user.set("email", document.getElementById("email").value);
        user.save()
    })
    deactivateLogin();
    loadAccount();
}

function deactivateLogin(){
    let loginControls = ["username", "email", "login"];
    for (let i=0; i < loginControls.length; i++){
        document.getElementById(loginControls[i]).setAttribute("disabled",null);
    }
    document.getElementById("logout").removeAttribute("disabled");
}