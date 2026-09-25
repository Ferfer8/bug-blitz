// Retrieves existing users from local storage or initializes an empty array if none exists
var existingUsers = JSON.parse(localStorage.getItem('users')) || [];

// Retrieves logged-in user data from local storage
var loggedInUserData = JSON.parse(localStorage.getItem('loggedInUser'));


//DOMContentLoaded event listeners
document.addEventListener('DOMContentLoaded', function () {
    //Toggles link visibility of Home Page
    let loginLink = document.getElementById('loginLink');
    let signupLink = document.getElementById('signupLink');
    let userIcon = document.getElementById('userIcon');
    let loginLinkFooter = document.getElementById('loginLink_footer');
    let signupLinkFooter = document.getElementById('signupLink_footer');
    updateNavbarAndFooter(loginLink, signupLink, userIcon, loginLinkFooter, signupLinkFooter);
});

document.addEventListener('DOMContentLoaded', function () {
    //Toggles link visibility of Leaderbaord Pages
    let loginLink = document.getElementById('loginLink2');
    let signupLink = document.getElementById('signupLink2');
    let userIcon = document.getElementById('userIcon2');
    let loginLinkFooter = document.getElementById('loginLink_footer2');
    let signupLinkFooter = document.getElementById('signupLink_footer2');
    updateNavbarAndFooter(loginLink, signupLink, userIcon, loginLinkFooter, signupLinkFooter);
});

//Oncklick functions

function gameRedirect(gameLink) {
    //Redirects user to Mode Page if logged in Login Page if not (from Nav bar link)
    gameLink = document.getElementById(gameLink);
    let isUserLoggedIn = currentUser();

    if (isUserLoggedIn) {
        window.location.href = 'ModePage.html';

    } else {
        window.location.href = 'LoginPage.html';
    }
}

function PlayNowRedirection() {
    //Redirects user to Mode Page if logged in Login Page if not (from Play Now button)
    isUserLoggedIn = currentUser()

    if (isUserLoggedIn) {
        window.location.href = 'ModePage.html';
    } else {
        window.location.href = 'LoginPage.html';
    }
}

function logOut() {
    //Clears the data of the user logged in (stored under the loggedInUser key)
    localStorage.removeItem('loggedInUser');
    //Redirects to Login Page
    window.location.href = 'LoginPage.html';
}


function openModal(modalID) {
    //Opens modals
    let modal = document.getElementById(modalID);
    modal.style.display = 'block';
}

function closeModal(modalID) {
    //Closes modals
    let modal = document.getElementById(modalID);
    modal.style.display = 'none';
}

function displayUesrInfo(ID) {
    //Displays user settings modal
    if (currentUser()) {
        openModal(ID);
        openAccountModal();
    }
}

function openAccountModal() {
    //Opens account modal and hides the display of other sub-section modals
    let gameModal = document.getElementById('gameModal');
    let helpModal = document.getElementById('helpModal');
    gameModal.style.display = 'none';
    helpModal.style.display = 'none';

    //Gets user details and displays them in the account modal
    let user = getCurrentUserData();
    if (user) {
        document.getElementById('userDetails').innerHTML =
            " <p>  <i class='bx bxs-envelope'></i> <strong> Email: </strong>" + user.email + "</p>" +
            "<p> <i class='bx bxs-user' ></i> <strong> Username: </strong>" + user.username + "</p>" +
            "<p> <i class='bx bxs-party' ></i> <strong> Birthday: </strong>" + user.birthdate + "</p>" +
            "<p> <i class='bx bxs-award'></i> <strong> Easy Mode Highscore: </strong>" + user.easyHighscore + "</p>" +
            "<p> <i class='bx bxs-award'></i> <strong> Hard Mode Highscore: </strong>" + user.hardHighscore + "</p>"

        openModal('accountModal')
    }

}

function openHelpModal() {
    //Opens help modal and hides the display of other sub-section modals
    let accountModal = document.getElementById('accountModal');
    let gameModal = document.getElementById('gameModal');
    accountModal.style.display = 'none';
    gameModal.style.display = 'none';

    openModal('helpModal');
}

function toggleFaq(questionBtn) {
    //Opens the clicked FAQ answer and closes any other open answer (only one open at a time)
    let isOpen = questionBtn.getAttribute('aria-expanded') === 'true';

    document.querySelectorAll('#helpModal .faq-question').forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        document.getElementById(btn.getAttribute('aria-controls')).classList.remove('open');
    });

    //Clicking an already open question just closes it
    if (!isOpen) {
        questionBtn.setAttribute('aria-expanded', 'true');
        document.getElementById(questionBtn.getAttribute('aria-controls')).classList.add('open');
    }
}

function openGameModal() {
    //Opens  game modal and hides the display of other sub-section modals
    let accountModal = document.getElementById('accountModal');
    let helpModal = document.getElementById('helpModal');
    accountModal.style.display = 'none';
    helpModal.style.display = 'none';
    updateBugImages();

    openModal('gameModal');
}

function addMuteAudio() {
    let loggedInUserData = JSON.parse(localStorage.getItem('loggedInUser'));
    let audioIcon = document.getElementById('audioIcon');

    //Toggles  audio icon based on mute status
    audioIcon.classList.remove('bxs-volume-full');
    audioIcon.classList.add('bxs-volume-mute');

    if (loggedInUserData) {
        if (loggedInUserData.isMuted) {
            audioIcon.classList.remove('bxs-volume-mute');
            audioIcon.classList.add('bxs-volume-full');
            //Changes mute status under loggedInUser key in local storage
            loggedInUserData.isMuted = false;
        } else {
            audioIcon.classList.remove('bxs-volume-full');
            audioIcon.classList.add('bxs-volume-mute');
            //Changes mute status under loggedInUser key in local storage
            loggedInUserData.isMuted = true;
        }
        //Updates the mute status in local storage
        localStorage.setItem('loggedInUser', JSON.stringify(loggedInUserData))
    }
}

//onmouseover and onmouseout functions

function showUserMenu() {
    //Shows user menu when hovering over user icon
    let userMenu = document.getElementById('userMenu');
    userMenu.style.display = 'block';
}

function hideUserMenu() {
    //Hides user menu when no longer hovering over user icon
    let userMenu = document.getElementById('userMenu');
    userMenu.style.display = 'none';
}


//Other functions 

function getCurrentUserData() {
    // Finds the user information of the currently logged-in user from the existing users
    let currentUserInfo = existingUsers.find(user => user.username === loggedInUserData.username);
    return currentUserInfo;
}


function currentUser() {
    //Checks if user is logged in
    isLoggedin = true;
    if (loggedInUserData === null) {
        isLoggedin = false;
    }

    return isLoggedin;
}

function updateNavbarAndFooter(loginLink, signupLink, userIcon, loginLinkFooter, signupLinkFooter) {
    //Toggles link visibilkity based on user log in status

    //Each page only has one set of these elements, so skip the set that isn't on this page
    if (!loginLink || !signupLink || !userIcon || !loginLinkFooter || !signupLinkFooter) {
        return;
    }

    let isLoggedIn = currentUser();


    if (isLoggedIn) {
        loginLink.style.display = 'none';
        signupLink.style.display = 'none';
        userIcon.style.display = 'inline-block';

        loginLinkFooter.style.display = 'none';
        signupLinkFooter.style.display = 'none';

    } else {
        loginLink.style.display = 'inline-block';
        signupLink.style.display = 'inline-block';
        userIcon.style.display = 'none';

        loginLinkFooter.style.display = 'inline-block';
        signupLinkFooter.style.display = 'inline-block';

    }
}

function updateBugImages() {
    // Finds the user information of the currently logged-in user from the existing users
    let currentUserInfo = existingUsers.find(user => user.username === loggedInUserData.username);

    //Updates the unlocked bugs and weapons based on the unlocks saved by checkBugUnlock() in game.js
    let bugPic = document.getElementById('bugPic');
    let spiderPic = document.getElementById('spiderPic');
    let beetlePic = document.getElementById('beetlePic');
    let flyPic = document.getElementById('flyPic');
    let antPic = document.getElementById('antPic');

    let defaultSparyPic = document.getElementById('defaultSparyPic');
    let antKillPic = document.getElementById('antKillPic');
    let zapPic = document.getElementById('zapPic');
    let sprayGunPic = document.getElementById('sprayGunPic');
    let pesticidePic = document.getElementById('pesticidePic');

    //Removes previous select border from previously selected bug/weapon
    bugPic.classList.remove('selected-item');
    spiderPic.classList.remove('selected-item');
    beetlePic.classList.remove('selected-item');
    flyPic.classList.remove('selected-item');
    antPic.classList.remove('selected-item');

    defaultSparyPic.classList.remove('selected-item');
    antKillPic.classList.remove('selected-item');
    zapPic.classList.remove('selected-item');
    sprayGunPic.classList.remove('selected-item');
    pesticidePic.classList.remove('selected-item');


    if (loggedInUserData && currentUserInfo.spiderConditionMet) {
        spiderPic.src = "assets/bugs/spider/spider.jpg";
        pesticidePic.src = "assets/blitz_weapons/pesticide/pesticide.png";

        //Changes cursor from not-allowed to pointer 
        spiderPic.classList.add('pointer-cursor');
        pesticidePic.classList.add('pointer-cursor');

        //Event listener checks which bug/weapon was selected
        spiderPic.addEventListener('click', function () {
            selectBug('spider', spiderPic);
        });

        pesticidePic.addEventListener('click', function () {
            selectWeapon('pesticide', pesticidePic);
        });
    }

    if (loggedInUserData && currentUserInfo.beetleConditionMet) {
        beetlePic.src = "assets/bugs/beetle/beetle.jpg";
        sprayGunPic.src = "assets/blitz_weapons/spray_gun/sprayGun.png";
        sprayGunPic.classList.add('pointer-cursor');
        beetlePic.classList.add('pointer-cursor');
        beetlePic.addEventListener('click', function () {
            selectBug('beetle', beetlePic);
        });

        sprayGunPic.addEventListener('click', function () {
            selectWeapon('sprayGun', sprayGunPic);
        });
    }

    if (loggedInUserData && currentUserInfo.flyConditionMet) {
        flyPic.src = "assets/bugs/fly/fly.jpg";
        zapPic.src = "assets/blitz_weapons/zap/zap.png";
        flyPic.classList.add('pointer-cursor');
        zapPic.classList.add('pointer-cursor');
        flyPic.addEventListener('click', function () {
            selectBug('fly', flyPic);
        });

        zapPic.addEventListener('click', function () {
            selectWeapon('zap', zapPic);
        });
    }

    if (loggedInUserData && currentUserInfo.antConditionMet) {
        antPic.src = "assets/bugs/ant/ant.jpg";
        antKillPic.src = "assets/blitz_weapons/ant_kill/antKill.png";
        antPic.classList.add('pointer-cursor');
        antKillPic.classList.add('pointer-cursor');
        antPic.addEventListener('click', function () {
            selectBug('ant', antPic);
        });

        antKillPic.addEventListener('click', function () {
            selectWeapon('antKill', antKillPic);
        });
    }

    if (loggedInUserData && currentUserInfo.easyHighscore >= 0) {
        bugPic.addEventListener('click', function () {
            selectBug('bug', bugPic);
        });

        defaultSparyPic.addEventListener('click', function () {
            selectWeapon('spray', defaultSparyPic);
        });
    }
}

function selectBug(bugType, imgElement) {
    //Handles selection of bug type

    //Removes select border from all ements with the selected-item class
    document.querySelectorAll('.selected-item').forEach(function (element) {
        element.classList.remove('selected-item');
    });

    //Adds the select border to the selected bug
    imgElement.classList.add('selected-item');

    //Updates the selecetd bug type in logged in user data
    loggedInUserData.selectedBug = bugType;

    //Saves the updated user data to local storage
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUserData));
}

function selectWeapon(weaponType, imgElement) {

    //Handles selection of weapon type

    //Removes select border from all ements with the selected-item class
    document.querySelectorAll('.selected-item').forEach(function (element) {
        element.classList.remove('selected-item');
    });

    //Adds the select border to the selected weapon
    imgElement.classList.add('selected-item');

    //Updates the selecetd weapon type in logged in user data
    loggedInUserData.selectedWeapon = weaponType;

    //Saves the updated user data to local storage
    localStorage.setItem('loggedInUser', JSON.stringify(loggedInUserData));
}


//Event Listeners

//Mode buttons only exist on the Mode Page, so the listeners are only added there
if (document.getElementById('hardBtn')) {
    document.getElementById('hardBtn').addEventListener('click', function () {
        // Finds the user information of the currently logged-in user from the existing users
        let currentUserInfo = existingUsers.find(user => user.username === loggedInUserData.username);

        //Sets difficulty level to 2 if hard button is clicked
        currentUserInfo.difficultyLevel = 2;

        //Saves the updated user data to local storage
        localStorage.setItem('users', JSON.stringify(existingUsers));
    });
}

if (document.getElementById('easyBtn')) {
    document.getElementById('easyBtn').addEventListener('click', function () {
        // Finds the user information of the currently logged-in user from the existing users
        let currentUserInfo = existingUsers.find(user => user.username === loggedInUserData.username);

        //Sets difficulty level to 1 if easy button is clicked
        currentUserInfo.difficultyLevel = 1;

        //Saves the updated user data to local storage
        localStorage.setItem('users', JSON.stringify(existingUsers));
    });
}












