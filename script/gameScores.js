//Retrieves user data from local storage.
var userData = JSON.parse(localStorage.getItem('users'));

function updateTable(tableId, scores)
{
    let table = document.getElementById(tableId);
    let tbody = table.querySelector('tbody');

    tbody.innerHTML = '';

    // Populates the table rows with score data
    for (let i = 0; i < 5; i++)
    {
        let row = tbody.insertRow(tbody.rows.length);
        let rankCell = row.insertCell(0);
        let usernameCell = row.insertCell(1);
        let scoreCell = row.insertCell(2);

        // Check if there are scores to display and displays them, adds a placeholder for empty rows
        if(i < scores.length)
        {
            rankCell.textContent = i + 1;
            usernameCell.textContent = scores[i].username;
            scoreCell.textContent = scores[i].score;
        } else
        {
            rankCell.textContent = i + 1;
            usernameCell.textContent = 'No User';
            scoreCell.textContent = 'No score';
        }
    }
}

// Maps the user data to an array of objects with username and easyHighscore properties
var sortedScoresEasy = userData.map(user => 
{
    return {username: user.username, score: user.easyHighscore};        
}).sort((a,b) => b.score - a.score); //Sorts by score in descending order

// Maps the user data to an array of objects with username and hardHighscore properties
var sortedScoresHard = userData.map(user => 
{
    return {username: user.username, score: user.hardHighscore};        
}).sort((a,b) => b.score - a.score); //Sorts by score in descending order


updateTable('easyTbl', sortedScoresEasy);

updateTable('hardTbl', sortedScoresHard);






