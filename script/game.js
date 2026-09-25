//Varibles for core game functionality
var mainGameSec = 120;
var mainGameInterval;
var bugsInterval;
var shoeInterval;
var interval; //Cleared by gamePause() and updateCountDownDisplay(); declared so clearing it never throws
var animationId;

//Arrays to store bugs, blitzed particles and shoes
var bugArray = [];
var blitzedParticleArray = [];
var shoeArray = [];

//Arrays defining number of bugs and shoes to render for each difficulty level
var numOfBugstoRender1 = [3, 10, 3, 10, 3, 10, 30, 3, 10, 3, 10, 3, 10, 30, 3, 10, 3, 10, 3, 10, 30];
var numOfShoestoRender1 = [1, 2, 1, 2, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3];
var numOfBugstoRender2 = [30, 10, 30, 10, 50, 10, 30, 10, 3, 50, 30, 10, 3, 30, 10, 50, 3, 30, 50, 20];
var numOfShoestoRender2 = [3, 6, 3, 6, 3, 6, 3, 6, 3, 6, 3, 6, 3, 6, 3, 6, 3, 6, 3, 6,];

//Variables for game state and user interaction
var score = 0;
var mouseX = 0;
var mouseY = 0;
var mouseDown = false;
var isAnimationPaused = false;
var difficultyLevel = 1;

//Varibales for user data
var loggedInUserData = JSON.parse(localStorage.getItem('loggedInUser'));
var existingUsers = JSON.parse(localStorage.getItem('users')) || [];
var currentUserInfo = existingUsers.find(user => user.username === loggedInUserData.username);

//DOM elemnts
var cursor = document.querySelector('.cursor');
var canvas = document.getElementById('gameCanvas');
var context = canvas.getContext('2d');

//Variables for Fruit Ninja style rendering
var GRAVITY = 0.25; //Downward pull per frame (at 60fps) on bugs, shoes, halves and particles
var HARD_SPEED = 1.35; //Hard mode plays the same arcs this many times faster
var frameScale = 1; //How many 60fps frames have passed since the last frame, so speed is the same on any refresh rate
var lastFrameTime = null;
var prevMouseX = 0; //Cursor position on the previous frame, used to detect fast swipes
var prevMouseY = 0;
var swipeAngle = 0; //Direction of the current swipe, used to cut bugs along it
var bugHalfArray = []; //Two halves of each sliced bug
var textPopupArray = []; //Floating text such as "-10s" when a shoe is hit
var hitFlash = 0; //Strength of the red screen flash after hitting a shoe
var imageCache = {};

//Juice colour of the blitzed particles for each bug type
var juiceColours = { bug: '#9CCC65', fly: '#8D6E63', ant: '#E57373', beetle: '#78909C', spider: '#A1887F' };

function resizeCanvas() {
    //Sizes the canvas for the screen's pixel density so bugs and shoes stay sharp
    let dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function getImage(src) {
    //Loads each image once and reuses it for every bug/shoe instead of creating a new image per spawn
    if (!imageCache[src]) {
        imageCache[src] = new Image();
        imageCache[src].src = src;
    }
    return imageCache[src];
}

function launchFromBottom(item) {
    //Throws a bug or shoe up from below the screen in an arc that peaks near the middle, like Fruit Ninja
    let speed = (currentUserInfo.difficultyLevel === 2) ? HARD_SPEED : 1;
    //Highest point of the arc (centre of the bug/shoe), in the same CSS pixel coordinates the canvas draws in:
    //anywhere from just below the highscore display (top of the image 10px under it) down to the middle of the screen
    let hScore = document.getElementById('hScore');
    let topLimit = (hScore ? hScore.getBoundingClientRect().bottom : window.innerHeight * 0.2) + 10 + item.size / 2;
    let bottomLimit = Math.max(window.innerHeight / 2, topLimit);
    let peakY = topLimit + Math.random() * (bottomLimit - topLimit);
    let peakX = window.innerWidth * (0.25 + Math.random() * 0.5);

    item.gravity = GRAVITY * speed * speed;
    item.x = window.innerWidth * (0.1 + Math.random() * 0.8);
    item.y = window.innerHeight + item.size / 2;
    item.speedY = -Math.sqrt(2 * item.gravity * (item.y - peakY)); //v = sqrt(2 x gravity x height), height measured from the launch point below the screen
    item.speedX = (peakX - item.x) / (-item.speedY / item.gravity); //Drifts towards peakX by the top of the arc
    item.angle = Math.random() * Math.PI * 2;
    item.spin = (Math.random() - 0.5) * 0.1 * speed;
    item.delay = Math.random() * 900; //Staggers each wave over ~1 second instead of all appearing at once
}

function updateFlight(item) {
    //Moves a bug or shoe along its arc
    if (item.delay > 0) {
        item.delay -= frameScale * 16.67;
        return;
    }
    //Exact motion under constant gravity, so the arc peaks exactly at its target height at any frame rate
    item.x += item.speedX * frameScale;
    item.y += item.speedY * frameScale + 0.5 * item.gravity * frameScale * frameScale;
    item.speedY += item.gravity * frameScale;
    item.angle += item.spin * frameScale;
}

function drawSpinning(item) {
    //Draws a bug or shoe rotated to its current angle
    if (item.delay > 0) {
        return;
    }
    context.save();
    context.translate(item.x, item.y);
    context.rotate(item.angle);
    context.drawImage(item.image, -item.size / 2, -item.size / 2, item.size, item.size);
    context.restore();
}

//Definition of Bug class
class Bug {
    constructor() {
        //Creates an iamge object for the bug based on the user's selecetd bug type
        if (loggedInUserData.selectedBug === 'bug') {
            this.image = getImage('assets/bugs/bugG.png');
            this.size = Math.floor((Math.random() * 20) + 150);
        } else if (loggedInUserData.selectedBug === 'fly') {
            this.image = getImage('assets/bugs/fly/fly1.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else if (loggedInUserData.selectedBug === 'ant') {
            this.image = getImage('assets/bugs/ant/ant1.png');
            this.size = Math.floor((Math.random() * 20) + 100);
        } else if (loggedInUserData.selectedBug === 'beetle') {
            this.image = getImage('assets/bugs/beetle/beetle1.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else if (loggedInUserData.selectedBug === 'spider') {
            this.image = getImage('assets/bugs/spider/spider1.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else {
            this.image = getImage('assets/bugs/bugG.png');
            this.size = Math.floor((Math.random() * 20) + 150);
        }

        //Sets initial position, speed and state of the bug
        launchFromBottom(this);
        this.notBlitzed = true;
    }


    //Updates the bug's position, speed and rotation
    update() {
        if (this.notBlitzed) {
            updateFlight(this);
        }
    }

    //Draws bug on canvas
    draw() {
        if (this.notBlitzed) {
            drawSpinning(this);
        }

    }

    //Cuts the bug in half along the swipe and sprays juice particles
    shatter() {
        bugHalfArray.push(new BugHalf(this, 1), new BugHalf(this, -1));

        let colour = juiceColours[loggedInUserData.selectedBug] || juiceColours.bug;
        for (let i = 0; i < 14; i++) {
            let particle = new Blitzedparticle(this.x, this.y, this.size * (0.03 + Math.random() * 0.06), colour);
            blitzedParticleArray.push(particle);
        }
    }

}

//Definition of Shoe class
class Shoe {
    constructor() {
        //Creates an iamge object for the shoes based on the user's selecetd bug type
        if (loggedInUserData.selectedBug === 'bug') {
            this.image = getImage('assets/shoes/shoe.png');
            this.size = Math.floor((Math.random() * 20) + 150);
        } else if (loggedInUserData.selectedBug === 'fly') {
            this.image = getImage('assets/shoes/shoe2.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else if (loggedInUserData.selectedBug === 'ant') {
            this.image = getImage('assets/shoes/shoe5.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else if (loggedInUserData.selectedBug === 'beetle') {
            this.image = getImage('assets/shoes/shoe4.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else if (loggedInUserData.selectedBug === 'spider') {
            this.image = getImage('assets/shoes/shoe3.png');
            this.size = Math.floor((Math.random() * 20) + 80);
        } else {

            this.image = getImage('assets/shoes/shoe.png');
            this.size = Math.floor((Math.random() * 20) + 150);
        }

        launchFromBottom(this);
        this.notBlitzed = true;
        this.hit = false; //True once the shoe has been hit and is being knocked away
        this.alpha = 1;
    }

    //Updates the shoe's position, speed and rotation
    update() {
        if (this.notBlitzed) {
            updateFlight(this);

            //Fades a knocked away shoe out
            if (this.hit) {
                this.alpha -= 0.03 * frameScale;
            }
        }
    }

    //Draws shoe on canvas
    draw() {
        if (this.notBlitzed) {
            context.save();
            context.globalAlpha = Math.max(this.alpha, 0);
            drawSpinning(this);
            context.restore();
        }

    }

    //Knocks the shoe away in the swipe direction instead of making it vanish
    knockAway() {
        this.hit = true;
        this.speedX = Math.cos(swipeAngle) * 10;
        this.speedY = -6;
        this.spin = (Math.random() < 0.5 ? -1 : 1) * 0.35;
    }

}

//Definition of Bug half class (the two pieces left after a bug is sliced)
class BugHalf {
    constructor(bug, side) {
        this.x = bug.x;
        this.y = bug.y;
        this.size = bug.size;
        this.image = bug.image;
        this.angle = bug.angle; //Bug's rotation at the moment it was cut
        this.cutAngle = swipeAngle;
        this.side = side; //1 or -1: which side of the cut this half is
        this.turn = 0;
        this.spin = bug.spin + side * 0.06;
        this.alpha = 1;

        //Pushes the halves apart, perpendicular to the cut
        this.speedX = bug.speedX * 0.5 - Math.sin(this.cutAngle) * side * 2.5;
        this.speedY = Math.min(bug.speedY, 0) * 0.3 + Math.cos(this.cutAngle) * side * 2.5 - 1;
    }

    update() {
        this.speedY += GRAVITY * frameScale;
        this.x += this.speedX * frameScale;
        this.y += this.speedY * frameScale;
        this.turn += this.spin * frameScale;
        this.alpha -= 0.012 * frameScale;
    }

    draw() {
        let s = this.size;
        context.save();
        context.globalAlpha = Math.max(this.alpha, 0);
        context.translate(this.x, this.y);
        context.rotate(this.turn + this.cutAngle);

        //Keeps only this half's side of the cut line
        context.beginPath();
        context.rect(-s, this.side > 0 ? 0 : -s, s * 2, s);
        context.clip();

        context.rotate(this.angle - this.cutAngle);
        context.drawImage(this.image, -s / 2, -s / 2, s, s);
        context.restore();
    }
}

//Definition of Blitzed particle class
class Blitzedparticle {
    constructor(x, y, size, color) {
        //Sets initial position, size and colour of particle
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color || 'grey';

        //Bursts outwards in a random direction
        let direction = Math.random() * Math.PI * 2;
        let speed = 2 + Math.random() * 5;
        this.speedX = Math.cos(direction) * speed;
        this.speedY = Math.sin(direction) * speed - 2;
    }


    //Updates the particle's size, position and speed
    update() {
        if (this.size > 0.2) {
            //Gradually reduces particle's size
            this.size *= Math.pow(0.94, frameScale);
            this.size -= 0.03 * frameScale;
        }

        this.y += this.speedY * frameScale;
        this.x += this.speedX * frameScale;

        //Pulls the particles down like splashing juice
        this.speedY += GRAVITY * frameScale;
    }

    //Draws the particle on the canvas
    draw() {
        context.fillStyle = this.color;
        context.beginPath();
        context.arc(this.x, this.y, Math.max(this.size, 0), 0, Math.PI * 2);
        context.fill();
    }
}

//Rendering functions

function renderBug() {
    //Filters out bugs that are no longer active and update/draws the remaining bugs
    bugArray = bugArray.filter(bug => {
        bug.draw();
        bug.update();

        //Checks for collision bewteen cursor and bug
        if (isCursorHover(bug)) {
            bug.notBlitzed = false; //Changes blitzed state
            bug.shatter(); //Slices bug in half
            playBlitzSound();  //Plays blitz sound
            score++; //Increments score
            updateScoreDisplay(); //Updates teh score displayed
            return false; //Removes bug from the array
        }

        //Checks if the bug has fallen back out of the viewport
        if (bug.speedY > 0 && bug.y > window.innerHeight + bug.size) {
            //Changes blitzed state and removes bug from array
            bug.notBlitzed = false;
            return false;
        }

        return true; //Keeps the bug in teh array

    });
}

function renderShoe() {
    //Filters out shoes that are no longer active and update/draws the remaining bugs
    shoeArray = shoeArray.filter(shoe => {
        shoe.draw();
        shoe.update();

        //Checks for collision bewteen cursor and shoe (a shoe that was already hit can't be hit again)
        if (!shoe.hit && isCursorHover(shoe)) {
            shoe.knockAway(); //Knocks shoe away
            playMistakeSound(); //Plays mistake sound
            deductTime(10); //Deducts time
            hitFlash = 1; //Flashes the screen red
            textPopupArray.push({ x: shoe.x, y: shoe.y, text: '-10s', life: 1 });
        }

        //Removes the shoe once it has faded or fallen back out of the viewport
        if (shoe.alpha <= 0 || (shoe.speedY > 0 && shoe.y > window.innerHeight + shoe.size)) {
            shoe.notBlitzed = false;
            return false;
        }

        return true; //Keeps the shoe in teh array

    });
}

function renderBlitzedParticles() {
    //Draws and updates the sliced bug halves
    bugHalfArray = bugHalfArray.filter(half => {
        half.draw();
        half.update();
        return half.alpha > 0 && half.y < window.innerHeight + half.size;
    });

    //Iterates through each blitzed particle in the array
    for (let i = 0; i < blitzedParticleArray.length; i++) {
        blitzedParticleArray[i].draw();
        blitzedParticleArray[i].update();

        //Check if the size of the blitzed particle is below a certain threshold
        if (blitzedParticleArray[i].size <= 0.2) {
            blitzedParticleArray.splice(i, 1);
            i--;
        }
    }

    //Floats the "-10s" text upwards and fades it out
    textPopupArray = textPopupArray.filter(popup => {
        context.save();
        context.globalAlpha = Math.max(popup.life, 0);
        context.font = 'bold 36px One, sans-serif';
        context.textAlign = 'center';
        context.fillStyle = '#E74C3C';
        context.strokeStyle = '#fff';
        context.lineWidth = 4;
        context.strokeText(popup.text, popup.x, popup.y);
        context.fillText(popup.text, popup.x, popup.y);
        context.restore();

        popup.y -= 1.2 * frameScale;
        popup.life -= 0.02 * frameScale;
        return popup.life > 0;
    });
}

var renderBugsInterval = () => {
    //Sets up render interval to render bugs based on the difficulty level selected 
    if (currentUserInfo.difficultyLevel === 1) {
        // Sets an interval to add bugs every second
        bugsInterval = setInterval(() => {
            // Randomly selects the number of bugs to render from numOfBugstoRender1 array
            let numOfBugs = Math.floor(Math.random() * numOfBugstoRender1.length);
            let indexValue = numOfBugstoRender1[numOfBugs];

            // Creates instances of the Bug class and add them to the bugArray
            for (let i = 0; i < indexValue; i++) {
                bugArray.push(new Bug())
            }
        }, 1000)
    } else if (currentUserInfo.difficultyLevel === 2) {
        bugsInterval = setInterval(() => {
            // Randomly selects the number of bugs to render from numOfBugstoRender2 array
            let numOfBugs = Math.floor(Math.random() * numOfBugstoRender2.length);
            let indexValue = numOfBugstoRender2[numOfBugs];

            // Create instances of the Bug class and add them to the bugArray
            for (let i = 0; i < indexValue; i++) {
                bugArray.push(new Bug())
            }
        }, 1000)
    }
}

var renderShoesInterval = () => {
    //Sets up render interval to render shoes based on the difficulty level selected 
    if (currentUserInfo.difficultyLevel === 1) {
        // Sets an interval to add shoes every 2 seconds
        shoeInterval = setInterval(() => {
            // Randomly selects the number of shoes to render from numOfShoestoRender1 array
            let numOfshoes = Math.floor(Math.random() * numOfShoestoRender1.length);
            let indexValue = numOfShoestoRender1[numOfshoes];

            // Creates instances of the Shoe class and add them to the shoeArray
            for (let i = 0; i < indexValue; i++) {
                shoeArray.push(new Shoe())
            }
        }, 2000)
    } else if (currentUserInfo.difficultyLevel === 2) {

        shoeInterval = setInterval(() => {
            // Randomly selects the number of shoes to render from numOfShoestoRender2 array
            let numOfshoes = Math.floor(Math.random() * numOfShoestoRender2.length);
            let indexValue = numOfShoestoRender2[numOfshoes];

            // Creates instances of the Shoe class and add them to the shoeArray
            for (let i = 0; i < indexValue; i++) {
                shoeArray.push(new Shoe())
            }
        }, 2000)
    }
}

//Animation function
function animate() {
    //Works out how much time passed since the last frame so movement speed doesn't depend on refresh rate
    let now = performance.now();
    frameScale = (lastFrameTime === null) ? 1 : Math.min((now - lastFrameTime) / 16.67, 3);
    lastFrameTime = now;

    //Direction of the swipe this frame, used to cut bugs along it
    if (mouseX !== prevMouseX || mouseY !== prevMouseY) {
        swipeAngle = Math.atan2(mouseY - prevMouseY, mouseX - prevMouseX);
    }

    //Clears the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    //Sets the background colour
    context.fillStyle = 'rgba(24, 28, 31, 0';
    context.fillRect(0, 0, canvas.width, canvas.height);

    //Renders bugs, shoes and blitzed particles to the canvas
    renderBug();
    renderShoe();
    renderBlitzedParticles();

    //Red flash after hitting a shoe
    if (hitFlash > 0) {
        context.fillStyle = 'rgba(231, 76, 60, ' + (0.25 * hitFlash) + ')';
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        hitFlash = Math.max(hitFlash - 0.05 * frameScale, 0);
    }

    prevMouseX = mouseX;
    prevMouseY = mouseY;

    //Requests for the enxt animation frame
    animationId = requestAnimationFrame(animate);
}

//Pause button functions
function stopAnimation() {
    cancelAnimationFrame(animationId);
    isAnimationPaused = true;
    lastFrameTime = null; //Stops bugs jumping forward when the game resumes
}

function resumeAnimation() {
    if (isAnimationPaused) {
        isAnimationPaused = false;
        animate();
    }
}

function gamePause() {

    let pauseIcon = document.getElementById('pauseBtn').querySelector('i');

    pauseIcon.classList.remove('bx-pause');
    pauseIcon.classList.add('bx-play');
    if (isAnimationPaused) {
        //Resumes animation and sets game intervals (one countdown only, so the timer doesn't run at double speed)
        resumeAnimation();
        mainGameInterval = setInterval(countDown, 1000);
        renderBugsInterval();
        renderShoesInterval();

        //Changes icons based on pause state
        pauseIcon.classList.remove('bx-play');
        pauseIcon.classList.add('bx-pause');
    } else {
        //Stops animation and clears game intervals
        stopAnimation();
        clearInterval(mainGameInterval);
        clearInterval(interval);
        //Stops spawning so bugs and shoes don't pile up while paused
        clearInterval(bugsInterval);
        clearInterval(shoeInterval);

        //Changes icons based on pause state
        pauseIcon.classList.remove('bx-pause');
        pauseIcon.classList.add('bx-play');
    }
}

//Audio play functions

function playBlitzSound() {
    let blitzSound = document.getElementById('blitzSound');
    blitzSound.volume = 0.3;
    blitzSound.currentTime = 0;
    blitzSound.play();
}

function playMistakeSound() {
    let mistakeSound = document.getElementById('mistakeSound');
    mistakeSound.currentTime = 0;
    mistakeSound.play();
}

function muteAudio() {
    //Mutes audio absed on mute status
    let blitzSound = document.getElementById('blitzSound');
    let mistakeSound = document.getElementById('mistakeSound');

    if (loggedInUserData.isMuted === true) {
        blitzSound.muted = true;
        mistakeSound.muted = true;
    }
}

//Cursor collision check function
function isCursorHover(bug) {
    //Checks the whole path the cursor moved along this frame, so fast swipes can't skip over a bug or shoe
    if (!mouseDown || bug.delay > 0) {
        return false;
    }

    let radius = bug.size * 0.42;
    let dx = mouseX - prevMouseX;
    let dy = mouseY - prevMouseY;
    let lengthSquared = dx * dx + dy * dy;

    //Finds the closest point on the swipe to the centre of the bug
    let t = (lengthSquared === 0) ? 0 : ((bug.x - prevMouseX) * dx + (bug.y - prevMouseY) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    let closestX = prevMouseX + t * dx;
    let closestY = prevMouseY + t * dy;

    return (bug.x - closestX) ** 2 + (bug.y - closestY) ** 2 <= radius * radius;
}


//Score functions

function updateScoreDisplay() {
    //Updates the score displayed
    let scoreDisplay = document.getElementById('score');
    scoreDisplay.textContent = 'Score: ' + score;
}

function saveScore() {
    //Saves the score to the corresponding difficulty level score if the user beat their personal high score
    if (currentUserInfo.difficultyLevel === 1 && score > currentUserInfo.easyHighscore) {
        currentUserInfo.easyHighscore = score;
    } else if (currentUserInfo.difficultyLevel === 2 && score > currentUserInfo.hardHighscore) {
        currentUserInfo.hardHighscore = score;
    }

    //Update the user's score in the existingUsers array
    let userIndexUpdate = existingUsers.findIndex(user => user.username === loggedInUserData.username);
    if (userIndexUpdate !== -1) {
        existingUsers[userIndexUpdate] = currentUserInfo;
        localStorage.setItem('users', JSON.stringify(existingUsers));
    }
}

//Count down functions
function blitzCountdown() {
    let countDown = document.getElementById('countdown');
    let countDownModal = document.getElementById('countdownModal');
    let sec = 3;

    //Displays game-start countdown modal
    countDownModal.style.display = 'block';

    let interval = setInterval(function () {
        countDown.textContent = sec;
        sec--;

        if (sec < 0) {
            clearInterval(interval);
            countDown.textContent = 'Blitz!';
            setTimeout(function () {
                //Hides the countdown modal and starts the game
                countDownModal.style.display = 'none';
                startCountDown();
                animate();
                renderBugsInterval();
                renderShoesInterval();
            }, 1000);
        }

    }, 1000);

}

function countDown() {

    let timerDisplay = document.getElementById('timer');
    let min = Math.floor(mainGameSec / 60);
    let remainingSec = mainGameSec % 60;

    //Adds 0 infront of seconds less than 10
    if (remainingSec < 10) {
        remainingSec = '0' + remainingSec;
    }
    timerDisplay.textContent = '0' + min + ':' + remainingSec;
    if (mainGameSec <= 0) {
        // If the countdown reaches zero, stop the intervals, animation, and display the game over modal
        clearInterval(mainGameInterval);
        stopAnimation();
        showGameOver();
    }
    else {
        mainGameSec--;
    }

}

function updateCountDownDisplay() {
    //Updates the count down display if a shoe is blitzed

    let timerDisplay = document.getElementById('timer');
    let min = Math.floor(mainGameSec / 60);
    let remainingSec = mainGameSec % 60;

    if (remainingSec < 10) {
        remainingSec = '0' + remainingSec;
    }

    timerDisplay.textContent = '0' + min + ':' + remainingSec;

    if (mainGameSec <= 0) {
        clearInterval(interval);
    }
}

function deductTime(seconds) {
    //deducts 10 seconds from game countdown if shoe is blitzed

    let timerDisplay = document.getElementById('timer');

    mainGameSec -= seconds;

    if (mainGameSec < 0) {
        mainGameSec = 0;
    }
    updateCountDownDisplay();

    // Flashes the timer display in red for visual feedback to user
    timerDisplay.style.color = 'red';

    setTimeout(() => {
        //Removes red colour after 400 miliseconds 
        timerDisplay.style.color = '';
    }, 400);
}

function startCountDown() {
    //Calls the countDown function every second
    mainGameInterval = setInterval(countDown, 1000);

}

//Game display toggle functions

function toggleCursor() {
    //Toggles cursor appearance absed on the slecetd weapon and mouse actions

    let cursor = document.querySelector('.cursor')
    cursor.style.backgroundImage = 'none';

    window.addEventListener('mousedown', () => {
        mouseDown = true;

        if (loggedInUserData.selectedWeapon === 'antKill' && mouseDown) {
            cursor.style.width = '200px';
            cursor.style.height = '220px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/ant_kill/antKiller12.png')";

        } else if (loggedInUserData.selectedWeapon === 'pesticide' && mouseDown) {
            cursor.style.width = '135px';
            cursor.style.height = '125px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/pesticide/pesticide2.png')";

        } else if (loggedInUserData.selectedWeapon === 'sprayGun' && mouseDown) {
            cursor.style.width = '150px';
            cursor.style.height = '250px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray_gun/sprayGun2.png')";

        } else if (loggedInUserData.selectedWeapon === 'zap' && mouseDown) {
            cursor.style.width = '220px';
            cursor.style.height = '180px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/zap/zap2.png')";

        } else if (loggedInUserData.selectedWeapon === 'spray' && mouseDown) {

            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray/spray2.png')";

        } else {

            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray/spray2.png')";

        }

    });

    window.addEventListener('mouseup', () => {
        mouseDown = false;

        if (loggedInUserData.selectedWeapon === 'antKill' || mouseDown) {
            cursor.style.width = '80px';
            cursor.style.height = '130px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/ant_kill/antKiller1.png')";


        } else if (loggedInUserData.selectedWeapon === 'pesticide' || mouseDown) {
            cursor.style.width = '95px';
            cursor.style.height = '110px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/pesticide/pesticide1.png')";


        } else if (loggedInUserData.selectedWeapon === 'sprayGun' || mouseDown) {
            cursor.style.width = '95px';
            cursor.style.height = '110px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray_gun/sprayGun1.png')";

        } else if (loggedInUserData.selectedWeapon === 'zap' || mouseDown) {
            cursor.style.width = '100px';
            cursor.style.height = '100px';
            cursor.style.backgroundImage = "url('assets/blitz_weapons/zap/zap1.png')";

        } else if (loggedInUserData.selectedWeapon === 'spray' || mouseDown) {

            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray/spray1.png')";

        } else {

            cursor.style.backgroundImage = "url('assets/blitz_weapons/spray/spray1.png')";

        }
    });

}

function toggleBackgroundImage() {
    //Toggles the background image based on the bug type selecetd

    let bgImage = document.getElementById('game');

    if (loggedInUserData.selectedBug === 'bug') {
        bgImage.style.backgroundImage = "url('assets/bg/main_bg.png')";

    } else if (loggedInUserData.selectedBug === 'fly') {
        bgImage.style.backgroundImage = "url('assets/bg/flyBg.png')";

    } else if (loggedInUserData.selectedBug === 'ant') {
        bgImage.style.backgroundImage = "url('assets/bg/antBg.png')";

    } else if (loggedInUserData.selectedBug === 'beetle') {
        bgImage.style.backgroundImage = "url('assets/bg/beetleBg.png')";

    } else if (loggedInUserData.selectedBug === 'spider') {
        bgImage.style.backgroundImage = "url('assets/bg/spiderBg.png')";

    } else {
        bgImage.style.backgroundImage = "url('assets/bg/main_bg.png');"
    }

}

//Feature unlock functions

function checkBugUnlock() {
    //Checks if the user has reached a certain score to unlcok a new bug and blitz weapon
    //Displays a congratulatiosn modal if they have unlcoked them
    //Stores whether they have unlocked them or not in local storage
    //Each unlock is checked independently so higher thresholds aren't skipped once a lower one is already unlocked
    //Unlocks are stored on the user's account (users key) so they persist across logins and Settings can read them
    var conditionMet = false;
    if (currentUserInfo.difficultyLevel === 2 && score >= 300 && !currentUserInfo.spiderConditionMet) {
        currentUserInfo.spiderConditionMet = true;
        conditionMet = true;
    }

    if (currentUserInfo.difficultyLevel === 2 && score >= 100 && !currentUserInfo.beetleConditionMet) {
        currentUserInfo.beetleConditionMet = true;
        conditionMet = true;
    }

    if (currentUserInfo.difficultyLevel === 1 && score >= 500 && !currentUserInfo.flyConditionMet) {
        currentUserInfo.flyConditionMet = true;
        conditionMet = true;
    }

    if (currentUserInfo.difficultyLevel === 1 && score >= 300 && !currentUserInfo.antConditionMet) {
        currentUserInfo.antConditionMet = true;
        conditionMet = true;
    }

    if (conditionMet) {
        showCongratulationsModal();
        console.log("confetti")
    } else {
        gameOverModal.style.display = 'block';
        setTimeout(function () {
            window.location.href = 'LeadederboardPage.html';
        }, 3000);
    }

    //currentUserInfo is the same object held in existingUsers, so saving the array saves the unlocks
    localStorage.setItem('users', JSON.stringify(existingUsers));

}

function showCongratulationsModal() {
    let congratulationsModal = document.getElementById('congratulationsModal');
    congratulationsModal.style.display = 'block';

    //Guard in case the confetti CDN script failed to load, so unlocks still get saved
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            zIndex: 10001 // above .modal (z-index 10000) so confetti renders in front
        });
    }
}

function closeModal(modalID) {
    let modal = document.getElementById(modalID);
    modal.style.display = 'none';
    window.location.href = 'LeadederboardPage.html';
}

//Game over function
function showGameOver() {
    saveScore();
    checkBugUnlock();

}



//Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    muteAudio();
    blitzCountdown();
    toggleBackgroundImage();
    toggleCursor();
    updateScoreDisplay();
    updateCountDownDisplay();

    if (currentUserInfo) {
        //Displays the user's personal high score
        let highScoreDisplay = document.getElementById('hScore');
        highScoreDisplay.textContent = 'Highscore: ' + (currentUserInfo.difficultyLevel === 1 ? currentUserInfo.easyHighscore : currentUserInfo.hardHighscore);
    }
});


document.addEventListener('visibilitychange', () => {
    //Pauses the game when the player switches tab or minimises the window (they resume with the pause button)
    let gameRunning = animationId !== undefined && !isAnimationPaused && mainGameSec > 0;
    if (document.hidden && gameRunning) {
        gamePause();
    }
});

window.addEventListener('mousemove', (e) => {
    //tracks cursor position for cursor collision
    mouseX = e.pageX;
    mouseY = e.pageY;

})

window.addEventListener('mousedown', () => {
    //Sets state of mouse pressed down
    mouseDown = true;
});

window.addEventListener('mouseup', () => {
    //Sets state of mouse not pressed down
    mouseDown = false;
});


window.addEventListener('mousemove', e => {
    //Checks the mouse movement to update the cursor image to the coordinates of the mouse cursor movements
    cursor.style.top = e.pageY + 'px';
    cursor.style.left = e.pageX + 'px';
});


window.addEventListener('mousedown', () => {
    //Adds active class to cursor if mouse is pressed down
    cursor.classList.add('active');
});

window.addEventListener('mouseup', () => {
    //Removes active from class cursor if mouse is not pressed down
    cursor.classList.remove('active');
});


window.addEventListener('mousemove', e => {
    //Hides the game cursor image and displays the normal page cursor anywhere above the "Score" text,
    //so the back and pause buttons are easy to click
    let uiZoneBottom = document.getElementById('score').getBoundingClientRect().top;

    document.body.classList.toggle('ui-zone', e.clientY < uiZoneBottom);
});









