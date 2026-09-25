//Signup form field elements
var email = document.getElementById('email');
var username = document.getElementById('username');
var birthdate = document.getElementById('birthdate');
var gender = document.getElementById('gender');
var password = document.getElementById('password');
var confirmPassword = document.getElementById('confirmPassword');

//Log in form field elements
var identifier = document.getElementById('identifier')
var password2 = document.getElementById('password2');

//Password visibility toggle elemnts 
var textToShow = document.getElementById('textToShow');
var textToShow2 = document.getElementById('textToShow2');

//Password visibility toggle icons
var passIcon = document.getElementById('passIcon');
var passIcon2 = document.getElementById('passIcon2');
var passIcon3 = document.getElementById('passIcon3');

//Retreives existing users from local storage or initializes an empty array
var existingUsers = JSON.parse(localStorage.getItem('users')) || [];

//Modal functions
function openModal(modalID)
{
    let modal = document.getElementById(modalID);
    modal.style.display = 'block';
}

function closeModal(modalID)
{
    let modal = document.getElementById(modalID);
    modal.style.display = 'none';
}

//Success modal redirect function
function loginPageRedirect()
{
    window.location.href = 'LoginPage.html';
}

//Password visisbility function
function showPassword(inputId1, inputId2)
{
    let passwordEntry = document.getElementById(inputId1);
    let passwordEntry2 = document.getElementById(inputId2);

    if (inputId2 !== null)
    {
        if (passwordEntry.type === 'password')
        {
            //Changes password type to text to make password visible (Signup Page)
            passwordEntry.type = 'text';
            passwordEntry2.type = 'text';
           
            textToShow.innerText = 'Hide passsword';
            //Changes icons
            passIcon.classList.remove('bxs-lock');
            passIcon.classList.add('bxs-lock-open');
            passIcon2.classList.remove('bxs-lock');
            passIcon2.classList.add('bxs-lock-open');
        } else
        {
            //Changes password type to password to make password hidden (Signup Page)
            passwordEntry.type = 'password';
            passwordEntry2.type = 'password';

            textToShow.innerText = 'Show passsword';
            //Changes icons
            passIcon.classList.add('bxs-lock');
            passIcon.classList.remove('bxs-lock-open');
            passIcon2.classList.add('bxs-lock');
            passIcon2.classList.remove('bxs-lock-open');
        }
    } else
    {
        if (passwordEntry.type === 'password')
        {
             //Changes password type to text to make password visible (Login Page)
            passwordEntry.type = 'text';

            textToShow2.innerText = 'Hide passsword';
            //Changes icons
            passIcon3.classList.remove('bxs-lock');
            passIcon3.classList.add('bxs-lock-open');
        } else
        {
            //Changes password type to password to make password hidden (Login Page)
            passwordEntry.type = 'password';

            textToShow2.innerText = 'Show passsword';
            //Changes icons
            passIcon3.classList.add('bxs-lock');
            passIcon3.classList.remove('bxs-lock-open');
        }
    }

    
}
 
//Error handling functions
function showError(element, message)
{
    // Changes border to red and displays error message
    let input = element.parentElement;
    let displayError = input.querySelector('.error');
    displayError.innerText = message;
    //Removes success message if present and adds error message
    input.classList.add('error');
    input.classList.remove('success');
}

function showSuccess(element)
{
    // Changes border to green
    let input = element.parentElement;
    let displayError = input.querySelector('.error');

    //Removes error message if present and adds success message
    displayError.innerText = '';
    input.classList.add('success');
    input.classList.remove('error');
}

//Input Validation for Signup
function inputValidation() 
{
    //Extracts values from inputs
    let emailInput = email.value.trim(); //trim removes white space in string
    let usernameInput = username.value.trim();
    let birthdateInput = birthdate.value.trim();
    let passwordInput = password.value.trim();
    let confirmPasswordInput = confirmPassword.value.trim();

    //Regular expressions for validation
    let emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let usernamePattern = /^[a-zA-Z0-9_]+$/;
    let upperCase = /[A-Z]/;
    let symbol = /[!@#$%^&*()<>?":{}|<>"]/;

    //Current date for birthdate validation
    let today = new Date();
    let dateSelected = new Date(birthdateInput);

    //Checks if email or username is alredy in use
    let existingUserEmail = existingUsers.find(user => user.email === emailInput);
    let existingUserUsername = existingUsers.find(user => user.username === usernameInput);

    
    let isValid = true; //Flag for overall validation
    let validPassword = true; //Flag for password validation

    //Email validation
    if (existingUserEmail) 
    {
        showError(email, 'Email has already been used!')
        isValid = false;
    } else if (!emailPattern.test(emailInput)) 
    {
        showError(email, 'Please eneter a valid email address!');
        isValid = false;
    } else 
    {
        showSuccess(email);
    }

    //Username validation
    if (existingUserUsername) 
    {
        showError(username, 'Username already taken!')
        isValid = false;
    } else if (!usernamePattern.test(usernameInput)) 
    {
        showError(username, 'Please eneter a valid username!');
        isValid = false;
    } else if (usernameInput.length < 3) 
    {
        showError(username, 'Username must have atleast 3 characters!');
        isValid = false;
    } else 
    {
        showSuccess(username);
    }

     //DOB validation
    if (dateSelected > today) 
    {
        showError(birthdate, 'Please eneter valid date of birth!');
        isValid = false;
    } else 
    {
        showSuccess(birthdate);
    }

     //Password validation
    if (passwordInput.length < 8) 
    {
        showError(password, 'Password not srong! Must contain at least 8 characters!');
        validPassword = false;
        isValid = false;
    } else if (!upperCase.test(passwordInput)) 
    {
        showError(password, 'Password not srong! Must contain an uppercase letter!');
        validPassword = false;
        isValid = false;
    } else if (!symbol.test(passwordInput)) 
    {
        showError(password, 'Password not srong! Must contain a symbol!');
        validPassword = false;
        isValid = false;
    } else 
    {
        showSuccess(password);
    }

    if (confirmPasswordInput !== passwordInput) 
    {
        showError(confirmPassword, 'Password does not match!');
        isValid = false;
    } else if (!validPassword) 
    {
        showError(confirmPassword, '!');
        isValid = false;
    } else
    {
        showSuccess(confirmPassword);
    }

    return isValid;


};

//Input Validation for Login
function checkLogin(identifierInput, passwordInput)
{
    //Retrieve user data from local storage 
    let users = JSON.parse(localStorage.getItem('users')) || [];

    //Find user based on email
    let user = users.find(function(userObject)
    {
        return userObject.email === identifierInput || userObject.username === identifierInput;
    });

    //Checks if user exists
    if (user)
    {
        //Checks if entered password matches user's password
        if (user.password === passwordInput)
        {   
            //Save data of logged in user to local storage
            var loggedInUserData = {username: user.username};
            localStorage.setItem('loggedInUser', JSON.stringify(loggedInUserData));

            showSuccess(password2);
            showSuccess(identifier);

            //Redirect to Mode Page after a short delay
            setTimeout(function() { window.location.href='ModePage.html'}, 400);
           
        } else 
        {
            showSuccess(identifier);
            showError(password2, 'Incorrect password!');
        }
    } else
    {
        showError(identifier, 'Email or Username not found!');
    }
}

//Storing user data for SignUp
function userData()
{
    //Create new user object with input values
    let newUser = 
    {
        email: email.value.trim(), 
        username: username.value.trim(), 
        birthdate: birthdate.value.trim(), 
        gender: gender.value, 
        password: password.value.trim(), 
        difficultyLevel: 0, 
        easyHighscore: 0, 
        hardHighscore: 0
    };

    //Adds new user to existing users array
    existingUsers.push(newUser);

    //Stores and updates users array back to local storage
    localStorage.setItem('users', JSON.stringify(existingUsers));
    

    openModal('modal-signSuccess');

}


//Event listeners
document.addEventListener('DOMContentLoaded', function()
{
    //Event listener for signup form
    let signupForm = document.getElementById('sForm');

    signupForm.addEventListener('submit', function(e)
    {
        //prevents the default form submission behaviour 
        e.preventDefault();
        
        //Checks if input validation passes and storse user data
        if (inputValidation())
        {
            userData()
        }
    });
});

document.addEventListener('DOMContentLoaded', function()
{
    //Event listener for login form
    let loginForm = document.getElementById('lForm');
 
    loginForm.addEventListener('submit', function(e)
    {   
          //prevents the default form submission behaviour
        e.preventDefault();

        //Gets trimmed values of the uesrname/email and password inputs
        let identifierInput = document.getElementById('identifier').value.trim();
        let passwordInput = document.getElementById('password2').value.trim();

        //Performs login validation 
        checkLogin(identifierInput, passwordInput);
    
    });
});